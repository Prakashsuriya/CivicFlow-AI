import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.agents.base import BaseAgent
from app.database.connection import SessionLocal
from app.database.models import Notification
from app.config import settings
from app.utils.logger import logger

class NotificationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Notification Agent",
            role="Citizen & Department Alerts Dispatcher",
            description="Generates notifications, emails citizens tracking numbers, and pushes updates to officer dashboards."
        )

    def send_real_email(self, recipient: str, subject: str, body: str) -> bool:
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.info("SMTP_USER or SMTP_PASSWORD not configured. Email recorded in DB (simulation).")
            return False

        try:
            msg = MIMEMultipart()
            msg['From'] = settings.SMTP_USER
            msg['To'] = recipient
            msg['Subject'] = subject

            html_body = f"""
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #10b981;">🏛️ CivicFlow AI - Complaint Registration Confirmation</h2>
              <p>{body}</p>
              <hr style="border: none; border-top: 1px solid #eee;" />
              <p style="font-size: 0.8rem; color: #888;">This is an automated notification from Vellore Corporation Municipal Operating System.</p>
            </div>
            """
            msg.attach(MIMEText(html_body, 'html'))

            server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            logger.info(f"[{self.name}] Real email successfully sent via SMTP to {recipient}")
            return True
        except Exception as e:
            logger.error(f"[{self.name}] Failed to send email via SMTP: {e}")
            return False

    def execute(self, inputs: dict) -> dict:
        complaint_id = inputs.get("complaint_id", "N/A")
        recipient_email = inputs.get("recipient_email", "prakashranjanr8@gmail.com")
        dept_name = inputs.get("dept_name", "Municipal Department")
        sla_hours = inputs.get("sla_hours", 24)
        
        logger.info(f"[{self.name}] Dispatching notification for Complaint #{complaint_id} to {recipient_email}...")
        
        title = f"Complaint Received #{complaint_id}"
        message = (
            f"Your complaint #{complaint_id} has been registered and assigned to {dept_name}. "
            f"Estimated resolution SLA: {sla_hours} hours. Thank you for using CivicFlow AI."
        )
        
        # Try sending real email via SMTP
        email_sent = self.send_real_email(recipient_email, title, message)
        delivery_status = "SENT_VIA_SMTP" if email_sent else "RECORDED_IN_DB_SIMULATED"

        db = SessionLocal()
        try:
            notification = Notification(
                complaint_id=complaint_id if complaint_id != "N/A" else "CF-2026-0000",
                recipient_email=recipient_email,
                title=title,
                message=message,
                status=delivery_status
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
                "status": delivery_status,
                "note": "Real email dispatched via SMTP" if email_sent else "Recorded in SQLite DB (Configure SMTP_USER & SMTP_PASSWORD in backend/.env for live Gmail sending)"
            }
        }
