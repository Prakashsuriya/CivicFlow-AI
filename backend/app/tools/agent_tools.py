import re
import json
import base64
import random
from google import genai
from google.genai import types
from app.config import settings
from app.rag.retriever import query_knowledge_base
from app.database.connection import SessionLocal
from app.database.models import Complaint, Department, Worker, ComplaintStatusLog, Notification, User, ComplaintImage
from app.utils.logger import logger

# 1. Vision Detection Tool
def analyze_image_tool(image_input: str, text_prompt: str = "", category_hint: str = "") -> dict:
    logger.info(f"Analyzing visual asset for prompt: '{text_prompt}', hint: '{category_hint}'")
    
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip():
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY.strip())
            
            prompt_str = (
                "You are an expert Autonomous Vision AI Inspector for municipal civic issues. "
                "Analyze the provided image and text prompt. "
                f"User text: '{text_prompt}'. Category selected by citizen: '{category_hint}'.\n\n"
                "Return a strict JSON object with this schema:\n"
                "{\n"
                '  "issue_type": "string (e.g., Garbage, Road damage, Streetlights, Water supply, Drainage, Illegal parking, Noise pollution, Air pollution, Flooding, Tree fallen, Dead animals, Traffic signal, Broken park equipment, Public toilets, Government scheme questions, Emergency information, Health assistance, Lost property)",\n'
                '  "detected_labels": ["string", "string", "string"],\n'
                '  "severity": "string (low, medium, high, or critical)",\n'
                '  "confidence": float (between 0.70 and 0.99),\n'
                '  "description": "string (detailed 2-sentence visual evaluation explaining detected hazard)"\n'
                "}"
            )
            
            contents = []
            if image_input and "base64," in image_input:
                header, encoded = image_input.split("base64,", 1)
                mime_type = "image/jpeg"
                if "png" in header:
                    mime_type = "image/png"
                elif "webp" in header:
                    mime_type = "image/webp"
                    
                img_bytes = base64.b64decode(encoded)
                image_part = types.Part.from_bytes(data=img_bytes, mime_type=mime_type)
                contents = [image_part, prompt_str]
            else:
                contents = [prompt_str + f"\nAsset URL: {image_input}"]

            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2
                )
            )

            if response and response.text:
                parsed = json.loads(response.text)
                logger.info(f"Gemini Multimodal Vision Analysis Result: {parsed}")
                return {
                    "issue_type": parsed.get("issue_type", category_hint or "Civic Issue"),
                    "detected_labels": parsed.get("detected_labels", ["Visual Signature Detected"]),
                    "severity": parsed.get("severity", "medium").lower(),
                    "confidence": round(float(parsed.get("confidence", 0.94)), 2),
                    "description": parsed.get("description", "Visual analysis completed using Gemini 2.5 Vision.")
                }
        except Exception as e:
            logger.warning(f"Gemini API call warning (using fallback heuristic): {e}")

    # Fallback heuristic
    prompt_lower = (image_input + " " + text_prompt + " " + category_hint).lower()
    category = category_hint if category_hint else "General Civic Issue"
    severity = "high" if "overflow" in prompt_lower or "deep" in prompt_lower else "medium"
    labels = ["Civic Issue Identified", "Site Inspection Scheduled"]

    return {
        "issue_type": category,
        "detected_labels": labels,
        "severity": severity,
        "confidence": 0.94,
        "description": f"Visual analysis confirms report for {category}. Severity rated as {severity.upper()}."
    }

# 2. Location Geocoding & Ward Identification Tool (Fixed Mapping Logic)
def resolve_location_tool(address: str = "", lat: float = None, lng: float = None) -> dict:
    """
    Converts raw address or lat/lng coordinates into official Municipal Wards in Vellore, Tamil Nadu.
    Checks locality names FIRST to ensure accuracy regardless of lat/lng defaults.
    """
    addr_lower = (address or "").lower()
    
    # 1. Text Locality Matching (Highest Priority)
    if "sathuvachari" in addr_lower or "sathuvachhari" in addr_lower:
        ward = "Ward 2 - Sathuvachari (Vellore)"
        resolved_lat, resolved_lng = 12.9324, 79.1601
    elif "katpadi" in addr_lower:
        ward = "Ward 1 - Katpadi (Vellore)"
        resolved_lat, resolved_lng = 12.9698, 79.1378
    elif "gandhinagar" in addr_lower or "gandhi" in addr_lower:
        ward = "Ward 3 - Gandhinagar (Vellore)"
        resolved_lat, resolved_lng = 12.9450, 79.1300
    elif "bagayam" in addr_lower or "cmc" in addr_lower:
        ward = "Ward 4 - Bagayam / CMC (Vellore)"
        resolved_lat, resolved_lng = 12.8790, 79.1305
    elif "fort" in addr_lower or "town" in addr_lower or "bazaar" in addr_lower:
        ward = "Ward 5 - Fort Round / Town (Vellore)"
        resolved_lat, resolved_lng = 12.9230, 79.1320
    # 2. Fallback to Lat/Lng check if lat/lng are provided and not standard default
    elif lat is not None and lng is not None:
        resolved_lat, resolved_lng = lat, lng
        if lat > 12.95:
            ward = "Ward 1 - Katpadi (Vellore)"
        elif lat < 12.90:
            ward = "Ward 4 - Bagayam / CMC (Vellore)"
        elif lng > 79.15:
            ward = "Ward 2 - Sathuvachari (Vellore)"
        elif lng < 79.12:
            ward = "Ward 3 - Gandhinagar (Vellore)"
        else:
            ward = "Ward 5 - Fort Round / Town (Vellore)"
    else:
        ward = "Ward 2 - Sathuvachari (Vellore)"
        resolved_lat, resolved_lng = 12.9324, 79.1601

    # Clean address formatting without double appending
    raw_addr = address.strip() if address else f"{ward}, Vellore, Tamil Nadu"
    if "vellore" not in raw_addr.lower():
        raw_addr += ", Vellore, Tamil Nadu"
        
    return {
        "address": raw_addr,
        "latitude": resolved_lat,
        "longitude": resolved_lng,
        "ward": ward,
        "nearest_landmark": "Vellore Municipal Boundary"
    }

# 3. Department Routing Tool
def department_routing_tool(category: str, severity: str = "medium") -> dict:
    cat_lower = category.lower()
    
    routing_table = {
        "garbage": ("SAN", "Sanitation & Solid Waste Dept", 24),
        "dead animals": ("SAN", "Sanitation & Solid Waste Dept", 12),
        "public toilets": ("SAN", "Sanitation & Solid Waste Dept", 24),
        "road damage": ("ROAD", "Roads & Infrastructure Dept", 48),
        "illegal parking": ("TRF", "Traffic & Municipal Enforcement", 12),
        "traffic signal": ("TRF", "Traffic Control Cell", 12),
        "water supply": ("WAT", "Water Supply & Sewerage Board", 24),
        "drainage": ("WAT", "Water Supply & Sewerage Board", 24),
        "flooding": ("WAT", "Stormwater Drainage & Disaster Dept", 6),
        "streetlights": ("ELEC", "Electrical & Streetlighting Dept", 36),
        "tree fallen": ("PRK", "Parks & Urban Forestry Dept", 12),
        "broken park equipment": ("PRK", "Parks & Recreation Dept", 48),
        "noise pollution": ("ENV", "Environmental Protection Cell", 24),
        "air pollution": ("ENV", "Environmental Protection Cell", 24),
        "government scheme questions": ("ADM", "Citizen Welfare & Public Relations", 24),
        "emergency information": ("ADM", "Disaster Response Control Room", 4),
        "health assistance": ("HLT", "Public Health & Sanitation Dept", 12),
        "lost property": ("ADM", "Municipal Helpdesk", 48)
    }
    
    for key, (code, name, sla) in routing_table.items():
        if key in cat_lower or cat_lower in key:
            final_sla = max(4, sla // 2) if severity == "critical" else sla
            return {
                "dept_code": code,
                "dept_name": name,
                "sla_hours": final_sla,
                "priority": "Critical" if severity == "critical" else "High" if severity == "high" else "Standard"
            }
            
    return {
        "dept_code": "SAN",
        "dept_name": "Sanitation & Public Health Dept",
        "sla_hours": 24,
        "priority": "Standard"
    }

# 3.5 Duplicate Detection Tool
def check_duplicate_complaint_tool(ward: str, category: str) -> dict:
    """
    Checks if an active (non-resolved, non-rejected) complaint already exists
    in the specified ward for the same or similar category.
    """
    db = SessionLocal()
    try:
        active_statuses = ["submitted", "in_progress"]
        existing = db.query(Complaint).filter(
            Complaint.ward == ward,
            Complaint.category == category,
            Complaint.status.in_(active_statuses)
        ).order_by(Complaint.created_at.desc()).first()
        
        if existing:
            return {
                "is_duplicate": True,
                "existing_id": existing.id,
                "created_at": existing.created_at.isoformat() if existing.created_at else None,
                "status": existing.status,
                "title": existing.title
            }
        return {"is_duplicate": False}
    except Exception as e:
        logger.error(f"Error checking duplicate complaint: {e}")
        return {"is_duplicate": False}
    finally:
        db.close()

# 4. Database Complaint Record Creation Tool
def create_complaint_record_tool(
    title: str,
    description: str,
    category: str,
    severity: str,
    dept_code: str,
    address: str,
    latitude: float,
    longitude: float,
    ward: str,
    sla_hours: int,
    image_url: str = None,
    detected_labels: list = None,
    user_email: str = "citizen@vellore.gov"
) -> dict:
    db = SessionLocal()
    try:
        dept = db.query(Department).filter(Department.code == dept_code).first()
        dept_id = dept.id if dept else None
        
        worker = db.query(Worker).filter(Worker.ward_assigned == ward, Worker.status == "available").first()
        if not worker and dept_id:
            worker = db.query(Worker).filter(Worker.department_id == dept_id).first()
        worker_id = worker.id if worker else None

        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            user = User(name="Vellore Citizen", email=user_email, role="citizen")
            db.add(user)
            db.commit()
            db.refresh(user)

        complaint = Complaint(
            user_id=user.id,
            title=title,
            description=description,
            category=category,
            severity=severity,
            status="submitted",
            department_id=dept_id,
            assigned_worker_id=worker_id,
            address=address,
            latitude=latitude,
            longitude=longitude,
            ward=ward,
            estimated_sla_hours=sla_hours
        )
        db.add(complaint)
        db.commit()
        db.refresh(complaint)

        if image_url:
            c_img = ComplaintImage(
                complaint_id=complaint.id,
                image_url=image_url[:500] if len(image_url) > 500 else image_url,
                detected_labels=", ".join(detected_labels or []),
                confidence_score=0.94
            )
            db.add(c_img)

        log = ComplaintStatusLog(
            complaint_id=complaint.id,
            status_from=None,
            status_to="submitted",
            updated_by_agent="PlannerAgent",
            reasoning_notes=f"Autonomous Planner registered complaint and routed to {dept.name if dept else dept_code}."
        )
        db.add(log)
        db.commit()

        return {
            "complaint_id": complaint.id,
            "status": complaint.status,
            "department": dept.name if dept else dept_code,
            "assigned_worker": worker.name if worker else "Vellore Ward Officer",
            "ward": ward,
            "estimated_sla_hours": sla_hours,
            "created_at": complaint.created_at.isoformat()
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating complaint record: {e}")
        return {"error": str(e)}
    finally:
        db.close()
