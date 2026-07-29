from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database.connection import get_db
from app.database.models import Complaint, ComplaintStatusLog, ComplaintImage, Department, Worker
from app.agents.planner_agent import PlannerAgent
from app.utils.logger import logger

router = APIRouter(prefix="/complaints", tags=["Complaints"])

planner = PlannerAgent()

class ComplaintSubmitRequest(BaseModel):
    prompt: str
    category: Optional[str] = None
    image_url: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    email: Optional[str] = "citizen@vellore.gov"

class StatusUpdateRequest(BaseModel):
    status: str # submitted, in_progress, resolved, rejected
    reasoning_notes: Optional[str] = None
    updated_by: Optional[str] = "Municipal Officer"

@router.post("/submit")
async def submit_complaint(req: ComplaintSubmitRequest):
    """
    Submits a civic issue to the Autonomous Multi-Agent AI system.
    Planner Agent orchestrates Vision, Location, RAG, Routing, and DB persistence.
    """
    logger.info(f"Received complaint submission request for category '{req.category}': '{req.prompt}'")
    try:
        result = planner.execute(req.model_dump())
        return result
    except Exception as e:
        logger.error(f"Error executing Planner Agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def get_complaints(
    status: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)
    if status:
        query = query.filter(Complaint.status == status)
    if ward:
        query = query.filter(Complaint.ward == ward)
    if category:
        query = query.filter(Complaint.category == category)
        
    complaints = query.order_by(Complaint.created_at.desc()).all()
    
    results = []
    for c in complaints:
        results.append({
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "category": c.category,
            "severity": c.severity,
            "status": c.status,
            "department_name": c.department.name if c.department else "Unassigned",
            "assigned_worker_name": c.assigned_worker.name if c.assigned_worker else "Unassigned",
            "address": c.address,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "ward": c.ward,
            "estimated_sla_hours": c.estimated_sla_hours,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "resolved_at": c.resolved_at.isoformat() if c.resolved_at else None
        })
        
    return {"complaints": results}

@router.get("/{complaint_id}")
def get_complaint_detail(complaint_id: str, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    images = db.query(ComplaintImage).filter(ComplaintImage.complaint_id == complaint_id).all()
    logs = db.query(ComplaintStatusLog).filter(ComplaintStatusLog.complaint_id == complaint_id).order_by(ComplaintStatusLog.timestamp.asc()).all()
    
    return {
        "id": complaint.id,
        "title": complaint.title,
        "description": complaint.description,
        "category": complaint.category,
        "severity": complaint.severity,
        "status": complaint.status,
        "department": complaint.department.name if complaint.department else None,
        "assigned_worker": complaint.assigned_worker.name if complaint.assigned_worker else None,
        "address": complaint.address,
        "latitude": complaint.latitude,
        "longitude": complaint.longitude,
        "ward": complaint.ward,
        "estimated_sla_hours": complaint.estimated_sla_hours,
        "created_at": complaint.created_at.isoformat(),
        "resolved_at": complaint.resolved_at.isoformat() if complaint.resolved_at else None,
        "images": [{"id": img.id, "url": img.image_url, "labels": img.detected_labels} for img in images],
        "status_history": [{
            "status_from": log.status_from,
            "status_to": log.status_to,
            "updated_by": log.updated_by_agent,
            "reasoning_notes": log.reasoning_notes,
            "timestamp": log.timestamp.isoformat()
        } for log in logs]
    }

@router.put("/{complaint_id}/status")
def update_complaint_status(complaint_id: str, req: StatusUpdateRequest, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    old_status = complaint.status
    complaint.status = req.status
    
    if req.status == "resolved":
        from datetime import datetime
        complaint.resolved_at = datetime.utcnow()
        
    log = ComplaintStatusLog(
        complaint_id=complaint.id,
        status_from=old_status,
        status_to=req.status,
        updated_by_agent=req.updated_by,
        reasoning_notes=req.reasoning_notes or f"Status updated from {old_status} to {req.status} by {req.updated_by}."
    )
    db.add(log)
    db.commit()
    db.refresh(complaint)
    
    return {"message": "Status updated successfully", "complaint_id": complaint_id, "new_status": complaint.status}
