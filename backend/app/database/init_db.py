from datetime import datetime, timedelta
from app.database.connection import engine, Base, SessionLocal
from app.database.models import User, Department, Worker, Complaint, ComplaintImage, ComplaintStatusLog, Notification

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Re-seed if no complaints exist or refresh
    if db.query(Department).first():
        print("Database already initialized.")
        db.close()
        return

    print("Initializing Database for Vellore Corporation, Tamil Nadu...")

    # 1. Create Departments
    depts_data = [
        {"name": "Sanitation & Solid Waste Dept", "code": "SAN", "head_email": "head.sanitation@vellore.gov.in", "sla_hours_default": 24},
        {"name": "Roads & Infrastructure Dept", "code": "ROAD", "head_email": "head.roads@vellore.gov.in", "sla_hours_default": 48},
        {"name": "Water Supply & Sewerage Board", "code": "WAT", "head_email": "head.water@vellore.gov.in", "sla_hours_default": 24},
        {"name": "Electrical & Streetlighting Dept", "code": "ELEC", "head_email": "head.electrical@vellore.gov.in", "sla_hours_default": 36},
        {"name": "Parks & Urban Forestry Dept", "code": "PRK", "head_email": "head.parks@vellore.gov.in", "sla_hours_default": 48},
        {"name": "Traffic Control & Municipal Police", "code": "TRF", "head_email": "head.traffic@vellore.gov.in", "sla_hours_default": 12},
    ]

    dept_objects = {}
    for d in depts_data:
        dept = Department(**d)
        db.add(dept)
        db.commit()
        db.refresh(dept)
        dept_objects[d["code"]] = dept

    # 2. Create Workers in Vellore Wards
    workers_data = [
        {"name": "K. Selvam", "phone": "+91 9842101010", "dept_code": "SAN", "ward": "Ward 1 - Katpadi (Vellore)"},
        {"name": "M. Rajan", "phone": "+91 9842101011", "dept_code": "SAN", "ward": "Ward 2 - Sathuvachari (Vellore)"},
        {"name": "R. Murugan", "phone": "+91 9842101012", "dept_code": "ROAD", "ward": "Ward 3 - Gandhinagar (Vellore)"},
        {"name": "S. Prakash", "phone": "+91 9842101013", "dept_code": "ROAD", "ward": "Ward 4 - Bagayam / CMC (Vellore)"},
        {"name": "P. Vijay", "phone": "+91 9842101014", "dept_code": "WAT", "ward": "Ward 5 - Fort Round / Town (Vellore)"},
        {"name": "T. Karthik", "phone": "+91 9842101015", "dept_code": "ELEC", "ward": "Ward 1 - Katpadi (Vellore)"},
    ]

    worker_objects = []
    for w in workers_data:
        dept = dept_objects[w["dept_code"]]
        worker = Worker(
            department_id=dept.id,
            name=w["name"],
            phone=w["phone"],
            status="available",
            ward_assigned=w["ward"]
        )
        db.add(worker)
        db.commit()
        db.refresh(worker)
        worker_objects.append(worker)

    # 3. Create Citizens
    users_data = [
        {"name": "Kavitha Ramesh", "email": "kavitha@example.com", "phone": "+91 9443322110", "role": "citizen"},
        {"name": "Vellore Admin Officer", "email": "admin@vellore.gov.in", "phone": "+91 9440000000", "role": "admin"},
    ]

    user_objects = []
    for u in users_data:
        user = User(**u)
        db.add(user)
        db.commit()
        db.refresh(user)
        user_objects.append(user)

    # 4. Seed Initial Complaints in Vellore, Tamil Nadu
    sample_complaints = [
        {
            "id": "CF-2026-2001",
            "user_id": user_objects[0].id,
            "title": "Garbage Overflow near Sathuvachari Bus Stand",
            "description": "Solid waste accumulated near Sathuvachari Phase 2 bus stop. High stench causing distress to commuters.",
            "category": "Garbage",
            "severity": "high",
            "status": "in_progress",
            "department_id": dept_objects["SAN"].id,
            "assigned_worker_id": worker_objects[1].id,
            "address": "Sathuvachari Phase 2, Near Bus Depot, Vellore, Tamil Nadu",
            "latitude": 12.9324,
            "longitude": 79.1601,
            "ward": "Ward 2 - Sathuvachari (Vellore)",
            "estimated_sla_hours": 24,
            "created_at": datetime.utcnow() - timedelta(hours=6)
        },
        {
            "id": "CF-2026-2002",
            "user_id": user_objects[0].id,
            "title": "Deep Pothole on Katpadi Main Road",
            "description": "Crater pothole near Katpadi Railway Station approach road. Dangerous for two-wheelers at night.",
            "category": "Road damage",
            "severity": "critical",
            "status": "submitted",
            "department_id": dept_objects["ROAD"].id,
            "assigned_worker_id": worker_objects[0].id,
            "address": "Katpadi Main Road, Near Station Flyover, Vellore, Tamil Nadu",
            "latitude": 12.9698,
            "longitude": 79.1378,
            "ward": "Ward 1 - Katpadi (Vellore)",
            "estimated_sla_hours": 24,
            "created_at": datetime.utcnow() - timedelta(hours=2)
        },
        {
            "id": "CF-2026-2003",
            "user_id": user_objects[0].id,
            "title": "Water Pipeline Leak near CMC Hospital",
            "description": "Underground potable water supply line burst gushing water onto Bagayam road.",
            "category": "Water supply",
            "severity": "high",
            "status": "resolved",
            "department_id": dept_objects["WAT"].id,
            "assigned_worker_id": worker_objects[3].id,
            "address": "Bagayam Road, Near CMC College Campus, Vellore, Tamil Nadu",
            "latitude": 12.8790,
            "longitude": 79.1305,
            "ward": "Ward 4 - Bagayam / CMC (Vellore)",
            "estimated_sla_hours": 24,
            "resolved_at": datetime.utcnow() - timedelta(hours=1),
            "created_at": datetime.utcnow() - timedelta(hours=18)
        }
    ]

    for c in sample_complaints:
        complaint = Complaint(**c)
        db.add(complaint)
        db.commit()
        db.refresh(complaint)

        log = ComplaintStatusLog(
            complaint_id=complaint.id,
            status_from=None,
            status_to=complaint.status,
            updated_by_agent="PlannerAgent",
            reasoning_notes=f"Auto-routed issue to {complaint.category} department with severity {complaint.severity}."
        )
        db.add(log)
        db.commit()

    print("Vellore Database seeding completed successfully.")
    db.close()

if __name__ == "__main__":
    init_db()
