from app.agents.base import BaseAgent
from app.tools.agent_tools import create_complaint_record_tool
from app.utils.logger import logger

class ComplaintAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Complaint Agent",
            role="Database Lifecycle & Tracking Specialist",
            description="Creates official complaint records in SQLite, tracks progress, and generates complaint tracking IDs."
        )

    def execute(self, inputs: dict) -> dict:
        logger.info(f"[{self.name}] Persisting complaint record to database...")
        record = create_complaint_record_tool(
            title=inputs.get("title", "Civic Issue Report"),
            description=inputs.get("description", "Reported via CivicFlow AI"),
            category=inputs.get("category", "General"),
            severity=inputs.get("severity", "medium"),
            dept_code=inputs.get("dept_code", "SAN"),
            address=inputs.get("address", "Municipal Center"),
            latitude=inputs.get("latitude", 28.6139),
            longitude=inputs.get("longitude", 77.2090),
            ward=inputs.get("ward", "Ward 1 - North"),
            sla_hours=inputs.get("sla_hours", 24),
            image_url=inputs.get("image_url"),
            detected_labels=inputs.get("detected_labels")
        )
        
        return {
            "agent": self.name,
            "success": True if "complaint_id" in record else False,
            "complaint": record
        }
