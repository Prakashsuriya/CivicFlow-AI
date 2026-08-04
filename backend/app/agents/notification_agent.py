import os
import smtplib
import threading
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
            description="Generates notifications, emails citizens tracking numbers, and pushes updates to officer dashboards with dynamic authority branding."
        )

    def get_authority_branding_header(self, responsible_authority: str, domain_type: str = "") -> dict:
        auth_lower = (responsible_authority or "").lower()
        dom_lower = (domain_type or "").lower()

        if "tangedco" in auth_lower or ("utility" in dom_lower and "water" not in auth_lower):
            return {
                "header": "TANGEDCO Electricity Board",
                "sub": "State Electricity Distribution Division & Emergency Cell",
                "color": "#f59e0b",
                "icon": "⚡"
            }
        elif "twad" in auth_lower or "water board" in auth_lower or ("utility" in dom_lower and "water" in auth_lower):
            return {
                "header": "TWAD Board",
                "sub": "Tamil Nadu Water Supply & Drainage Board",
                "color": "#06b6d4",
                "icon": "💧"
            }
        elif "greenwood" in auth_lower or "apartment" in auth_lower or "residential" in dom_lower:
            return {
                "header": "Greenwood Heights Residential Association",
                "sub": "Society Maintenance Committee & Facility Management",
                "color": "#8b5cf6",
                "icon": "🏢"
            }
        elif "emergency" in auth_lower or "disaster" in auth_lower or "emergency_services" in dom_lower:
            return {
                "header": "Emergency Response Authority",
                "sub": "Disaster Control Room & Life-Safety Command",
                "color": "#ef4444",
                "icon": "🚨"
            }
        else:
            return {
                "header": "Vellore Municipal Corporation",
                "sub": "Public Infrastructure & Municipal Command Center",
                "color": "#10b981",
                "icon": "🏛️"
            }

    def _async_smtp_send(self, recipient: str, subject: str, body: str, branding: dict, smtp_server: str, smtp_port: int, smtp_user: str, smtp_pass: str):
        try:
            msg = MIMEMultipart()
            msg['From'] = smtp_user
            msg['To'] = recipient
            msg['Subject'] = f"[{branding['header']}] {subject}"

            html_body = f"""
            <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 12px;">
              <div style="background-color: #0f172a; padding: 16px 24px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid {branding['color']};">
                <h2 style="color: #ffffff; margin: 0; font-size: 1.3rem;">{branding['icon']} {branding['header']}</h2>
                <p style="color: {branding['color']}; margin: 4px 0 0 0; font-size: 0.85rem; font-weight: 600;">{branding['sub']}</p>
              </div>
              <p style="font-size: 1rem; line-height: 1.5; color: #334155;">{body}</p>
              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 0.85rem; color: #64748b;">
                <p style="margin: 0;">This is an automated real-time dispatch from the Autonomous Infrastructure OS.</p>
                <p style="margin: 4px 0 0 0;">CivicFlow AI — {branding['header']}</p>
              </div>
            </div>
            """
            msg.attach(MIMEText(html_body, 'html'))

            server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
            server.quit()
            logger.info(f"[{self.name}] Real email successfully sent via SMTP to {recipient}")
        except Exception as e:
            logger.error(f"[{self.name}] Failed to send email via SMTP: {e}")

    def send_real_email(self, recipient: str, subject: str, body: str, branding: dict) -> bool:
        smtp_user = (os.getenv("SMTP_USER") or getattr(settings, "SMTP_USER", "") or "").strip()
        smtp_pass = (os.getenv("SMTP_PASSWORD") or getattr(settings, "SMTP_PASSWORD", "") or "").strip()
        smtp_server = (os.getenv("SMTP_SERVER") or getattr(settings, "SMTP_SERVER", "smtp.gmail.com") or "smtp.gmail.com").strip()
        
        try:
            smtp_port = int(os.getenv("SMTP_PORT") or getattr(settings, "SMTP_PORT", 587) or 587)
        except Exception:
            smtp_port = 587

        if not smtp_user or not smtp_pass:
            logger.info(f"[{self.name}] SMTP_USER or SMTP_PASSWORD not set in environment. Email recorded in DB.")
            return False

        try:
            msg = MIMEMultipart()
            msg['From'] = smtp_user
            msg['To'] = recipient
            msg['Subject'] = f"[{branding['header']}] {subject}"

            html_body = f"""
            <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 12px;">
              <div style="background-color: #0f172a; padding: 16px 24px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid {branding['color']};">
                <h2 style="color: #ffffff; margin: 0; font-size: 1.3rem;">{branding['icon']} {branding['header']}</h2>
                <p style="color: {branding['color']}; margin: 4px 0 0 0; font-size: 0.85rem; font-weight: 600;">{branding['sub']}</p>
              </div>
              <p style="font-size: 1rem; line-height: 1.5; color: #334155;">{body}</p>
              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 0.85rem; color: #64748b;">
                <p style="margin: 0;">This is an automated real-time dispatch from the Autonomous Infrastructure OS.</p>
                <p style="margin: 4px 0 0 0;">CivicFlow AI — {branding['header']}</p>
              </div>
            </div>
            """
            msg.attach(MIMEText(html_body, 'html'))

            server = smtplib.SMTP(smtp_server, smtp_port, timeout=4)
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
            server.quit()
            logger.info(f"[{self.name}] Real email successfully sent via SMTP to {recipient}")
            return True
        except Exception as e:
            logger.warning(f"[{self.name}] Sync SMTP send fast attempt failed ({e}). Spawning non-daemon background dispatch...")
            t = threading.Thread(
                target=self._async_smtp_send,
                args=(recipient, subject, body, branding, smtp_server, smtp_port, smtp_user, smtp_pass),
                daemon=False
            )
            t.start()
            return True

    def execute(self, inputs: dict) -> dict:
        complaint_id = inputs.get("complaint_id", "N/A")
        recipient_email = inputs.get("recipient_email", "prakashranjanr8@gmail.com")
        dept_name = inputs.get("dept_name", "Maintenance Department")
        sla_hours = inputs.get("sla_hours", 24)
        responsible_authority = inputs.get("responsible_authority", "Vellore Municipal Corporation")
        domain_type = inputs.get("domain_type", "public_infrastructure")

        branding = self.get_authority_branding_header(responsible_authority, domain_type)

        logger.info(f"[{self.name}] Dispatching notification for Incident #{complaint_id} to {recipient_email} under '{branding['header']}'...")
        
        title = f"Incident Dispatch Confirmation #{complaint_id}"
        message = (
            f"Your infrastructure report #{complaint_id} has been registered under {branding['header']} "
            f"and assigned to {dept_name}. Target resolution SLA: {sla_hours} hours."
        )
        
        email_queued = self.send_real_email(recipient_email, title, message, branding)
        delivery_status = "SENT_VIA_SMTP" if email_queued else "RECORDED_IN_DB_SIMULATED"

        db = SessionLocal()
        try:
            notification = Notification(
                complaint_id=complaint_id if complaint_id != "N/A" else "CF-2026-9999",
                recipient_email=recipient_email,
                title=f"[{branding['header']}] {title}",
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
            "branding": branding,
            "notification": {
                "recipient": recipient_email,
                "authority_header": branding['header'],
                "title": title,
                "status": delivery_status,
                "note": "Real email dispatched via SMTP" if email_queued else f"Notification logged under {branding['header']}."
            }
        }
