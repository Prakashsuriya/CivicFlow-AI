from datetime import datetime, timedelta
from sqlalchemy import text
from app.database.connection import engine, Base, SessionLocal
from app.database.models import User, Department, Worker, Complaint, ComplaintImage, ComplaintStatusLog, Notification

def check_sqlite_columns():
    """Safety check for SQLite schema columns."""
    with engine.connect() as conn:
        try:
            conn.execute(text("SELECT domain_type FROM complaints LIMIT 1"))
        except Exception:
            try:
                conn.execute(text("ALTER TABLE complaints ADD COLUMN domain_type VARCHAR DEFAULT 'public_infrastructure'"))
            except Exception: pass
            try:
                conn.execute(text("ALTER TABLE complaints ADD COLUMN responsible_authority VARCHAR DEFAULT 'Vellore Municipal Corporation'"))
            except Exception: pass
            try:
                conn.execute(text("ALTER TABLE complaints ADD COLUMN ownership_reasoning TEXT"))
            except Exception: pass
            try:
                conn.execute(text("ALTER TABLE complaints ADD COLUMN asset_id VARCHAR"))
            except Exception: pass

def seed_flagship_demo_incident(db):
    """Ensures flagship demo incident CF-2026-9999 exists in database with full audit logs and authority branding."""
    try:
        flagship = db.query(Complaint).filter(Complaint.id == "CF-2026-9999").first()
        if not flagship:
            print("Seeding Flagship Demo Incident #CF-2026-9999...")
            dept = db.query(Department).filter(Department.code == "ELEC").first()
            worker = db.query(Worker).filter(Worker.name.like("%Karthik%")).first()
            user = db.query(User).first()

            c9999 = Complaint(
                id="CF-2026-9999",
                user_id=user.id if user else None,
                title="Electrical Transformer Sparking outside Katpadi Junction",
                description="High voltage power distribution transformer sparking heavily and emitting smoke outside Katpadi Junction approach road.",
                category="Electrical Transformer",
                severity="critical",
                status="in_progress",
                domain_type="utility_provider",
                responsible_authority="TANGEDCO Electricity Board",
                ownership_reasoning="Public utility infrastructure detected outside gated community boundary on state utility easement. Routed autonomously to TANGEDCO Electricity Board.",
                department_id=dept.id if dept else None,
                assigned_worker_id=worker.id if worker else None,
                address="Katpadi Junction Approach Road, Katpadi, Vellore, Tamil Nadu",
                latitude=12.9698,
                longitude=79.1378,
                ward="Ward 1 - Katpadi (Vellore)",
                estimated_sla_hours=6,
                created_at=datetime.utcnow() - timedelta(hours=2)
            )
            db.add(c9999)
            db.commit()

            # Audit logs for CF-2026-9999
            logs = [
                ComplaintStatusLog(
                    complaint_id="CF-2026-9999",
                    status_from=None,
                    status_to="submitted",
                    updated_by_agent="Civic Context Intelligence Agent",
                    reasoning_notes="Autonomous AI Ownership Engine matched incident to TANGEDCO Electricity Board based on visual cues, spatial boundary geocoding, and high voltage grid signatures.",
                    timestamp=datetime.utcnow() - timedelta(hours=2)
                ),
                ComplaintStatusLog(
                    complaint_id="CF-2026-9999",
                    status_from="submitted",
                    status_to="in_progress",
                    updated_by_agent="TANGEDCO Emergency Cell",
                    reasoning_notes="Dispatched Senior Electrical Field Engineer T. Karthik to inspect Katpadi Grid #4 Transformer. SLA Target: 6 Hours.",
                    timestamp=datetime.utcnow() - timedelta(hours=1)
                )
            ]
            for l in logs:
                db.add(l)
            db.commit()
            print("Flagship Incident #CF-2026-9999 successfully seeded.")
    except Exception as e:
        print(f"Notice during flagship incident check: {e}")

def init_db():
    Base.metadata.create_all(bind=engine)
    check_sqlite_columns()
    db = SessionLocal()

    # If DB has departments, just ensure assets & flagship incident exist
    if db.query(Department).first():
        print("Database already initialized. Ensuring Digital Twin Assets and Flagship Incident CF-2026-9999 exist...")
        from app.tools.asset_tools import seed_assets_if_empty
        seed_assets_if_empty()
        seed_flagship_demo_incident(db)
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

    # 4. Seed Initial Complaints
    sample_complaints = [
        {
            "id": "CF-2026-2001",
            "user_id": user_objects[0].id,
            "title": "Garbage Overflow near Sathuvachari Bus Stand",
            "description": "Solid waste accumulated near Sathuvachari Phase 2 bus stop. High stench causing distress to commuters.",
            "category": "Garbage",
            "severity": "high",
            "status": "in_progress",
            "domain_type": "public_infrastructure",
            "responsible_authority": "Vellore Municipal Corporation",
            "ownership_reasoning": "Public road and right-of-way infrastructure identified in Ward 2.",
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
            "title": "Elevator Stuck in Block A Elevator Shaft",
            "description": "Elevator in Tower A, Greenwood Heights stuck between 3rd and 4th floors with grinding noise.",
            "category": "Lift / Elevator",
            "severity": "critical",
            "status": "submitted",
            "domain_type": "residential_community",
            "responsible_authority": "Greenwood Heights Residential Association",
            "ownership_reasoning": "Private residential tower common area infrastructure. Mapped to Greenwood Heights Block A Lift Tower A.",
            "department_id": dept_objects["SAN"].id,
            "assigned_worker_id": worker_objects[0].id,
            "address": "Greenwood Heights Gated Society, Block A, Katpadi, Vellore",
            "latitude": 12.9698,
            "longitude": 79.1378,
            "ward": "Ward 1 - Katpadi (Vellore)",
            "estimated_sla_hours": 12,
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
            "domain_type": "utility_provider",
            "responsible_authority": "TWAD Board",
            "ownership_reasoning": "State bulk water main transmission conduit located on public road easement.",
            "department_id": dept_objects["WAT"].id,
            "assigned_worker_id": worker_objects[3].id,
            "address": "Bagayam Road, Near CMC College Campus, Vellore, Tamil Nadu",
            "latitude": 12.8790,
            "longitude": 79.1305,
            "ward": "Ward 4 - Bagayam / CMC (Vellore)",
            "estimated_sla_hours": 18,
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
            reasoning_notes=f"Auto-routed issue to {complaint.category} department under {complaint.responsible_authority}."
        )
        db.add(log)
        db.commit()

    from app.tools.asset_tools import seed_assets_if_empty
    seed_assets_if_empty()
    seed_flagship_demo_incident(db)

    print("Vellore Database seeding completed successfully.")
    db.close()

if __name__ == "__main__":
    init_db()
