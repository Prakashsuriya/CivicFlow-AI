import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.connection import Base

def generate_uuid():
    return str(uuid.uuid4())

def generate_complaint_id():
    import random
    return f"CF-{datetime.utcnow().year}-{random.randint(1000, 9999)}"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(String, default="citizen") # citizen, admin, officer
    created_at = Column(DateTime, default=datetime.utcnow)

    complaints = relationship("Complaint", back_populates="user")

class Department(Base):
    __tablename__ = "departments"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, nullable=False)
    code = Column(String, unique=True, nullable=False) # SAN, ROAD, WAT, ELEC, PRK, TRF
    head_email = Column(String, nullable=False)
    sla_hours_default = Column(Integer, default=24)

    workers = relationship("Worker", back_populates="department")
    complaints = relationship("Complaint", back_populates="department")

class Worker(Base):
    __tablename__ = "workers"

    id = Column(String, primary_key=True, default=generate_uuid)
    department_id = Column(String, ForeignKey("departments.id"), nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    status = Column(String, default="available") # available, busy, offline
    ward_assigned = Column(String, nullable=True)

    department = relationship("Department", back_populates="workers")
    complaints = relationship("Complaint", back_populates="assigned_worker")

class Asset(Base):
    __tablename__ = "assets"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False) # e.g. Lift Tower A, Katpadi Main Transformer
    asset_type = Column(String, nullable=False) # Lift, Transformer, Streetlight, Pipeline, Road, Drain, Gate
    domain_type = Column(String, nullable=False, default="public_infrastructure") # public_infrastructure, residential_community, utility_provider, emergency_services
    location_name = Column(String, nullable=False) # e.g. Greenwood Heights Block A, Sathuvachari Main Road
    ward_or_society = Column(String, nullable=True)
    health_score = Column(Integer, default=100) # 0-100%
    status = Column(String, default="healthy") # healthy, warning, critical, under_maintenance
    total_incidents = Column(Integer, default=0)
    health_trend = Column(String, default="100% -> 95% -> 90%")
    ai_recommendation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    complaints = relationship("Complaint", back_populates="asset")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String, primary_key=True, default=generate_complaint_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False) # Garbage, Road, Water, Streetlight, etc.
    severity = Column(String, default="medium") # low, medium, high, critical
    status = Column(String, default="submitted") # submitted, in_progress, resolved, rejected
    
    # Ownership Intelligence extensions
    domain_type = Column(String, default="public_infrastructure") # public_infrastructure, residential_community, utility_provider, emergency_services
    responsible_authority = Column(String, default="Municipal Corporation") # e.g. Katpadi Municipal Ward 1, Greenwood Heights RWA, TANGEDCO Electricity Board
    ownership_reasoning = Column(Text, nullable=True)
    asset_id = Column(String, ForeignKey("assets.id"), nullable=True)
    escalation_level = Column(Integer, default=0)
    is_escalated = Column(Integer, default=0)
    
    department_id = Column(String, ForeignKey("departments.id"), nullable=True)
    assigned_worker_id = Column(String, ForeignKey("workers.id"), nullable=True)
    
    address = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    ward = Column(String, nullable=True)
    
    estimated_sla_hours = Column(Integer, default=24)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="complaints")
    department = relationship("Department", back_populates="complaints")
    assigned_worker = relationship("Worker", back_populates="complaints")
    asset = relationship("Asset", back_populates="complaints")
    images = relationship("ComplaintImage", back_populates="complaint", cascade="all, delete-orphan")
    status_logs = relationship("ComplaintStatusLog", back_populates="complaint", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="complaint", cascade="all, delete-orphan")

class ComplaintImage(Base):
    __tablename__ = "complaint_images"

    id = Column(String, primary_key=True, default=generate_uuid)
    complaint_id = Column(String, ForeignKey("complaints.id"), nullable=False)
    image_url = Column(Text, nullable=False)
    detected_labels = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="images")

class ComplaintStatusLog(Base):
    __tablename__ = "complaint_status_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    complaint_id = Column(String, ForeignKey("complaints.id"), nullable=False)
    status_from = Column(String, nullable=True)
    status_to = Column(String, nullable=False)
    updated_by_agent = Column(String, default="PlannerAgent")
    reasoning_notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="status_logs")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    complaint_id = Column(String, ForeignKey("complaints.id"), nullable=False)
    recipient_email = Column(String, nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String, default="pending") # pending, sent, failed
    sent_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="notifications")
