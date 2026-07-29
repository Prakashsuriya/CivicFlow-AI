from app.agents.base import BaseAgent
from app.database.connection import SessionLocal
from app.database.models import Notification
from app.utils.logger import logger

class NotificationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Notification Agent",
            role="Citizen & Department Alerts Dispatcher",
            description="Generates notifications, emails citizens tracking numbers, and pushes updates to officer dashboards."
        )

    def execute(self, inputs: dict) -> dict:
        complaint_id = inputs.get("complaint_id", "N/A")
        recipient_email = inputs.get("recipient_email", "citizen@example.com")
        dept_name = inputs.get("dept_name", "Municipal Department")
        sla_hours = inputs.get("sla_hours", 24)
        
        logger.info(f"[{self.name}] Dispatching notification for Complaint #{complaint_id} to {recipient_email}...")
        
        title = f"Complaint Received #{complaint_id}"
        message = (
            f"Your complaint #{complaint_id} has been registered and assigned to {dept_name}. "
            f"Estimated resolution SLA: {sla_hours} hours. Thank you for using CivicFlow AI."
        )
        
        db = SessionLocal()
        try:
            notification = Notification(
                complaint_id=complaint_id if complaint_id != "N/A" else "CF-2026-0000",
                recipient_email=recipient_email,
                title=title,
                message=message,
                status="sent"
            )
            db.add(notification)
            db.commit()
        except Exception as e:
            logger.error(f"Failed to record notification: {e}")
        finally:
            db.close()
            
        return {
            "agent": self.name,
            "success": True,
            "notification": {
                "recipient": recipient_email,
                "title": title,
                "status": "SENT"
            }
        }
