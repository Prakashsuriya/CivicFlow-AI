from app.agents.base import BaseAgent
from app.tools.agent_tools import department_routing_tool
from app.utils.logger import logger

class RoutingAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Routing Agent",
            role="Department Classifier & SLA Dispatcher",
            description="Determines responsible municipal department and assigns SLA resolution timeline."
        )

    def execute(self, inputs: dict) -> dict:
        category = inputs.get("category", "General")
        severity = inputs.get("severity", "medium")
        
        logger.info(f"[{self.name}] Routing issue category: '{category}', severity: '{severity}'")
        routing = department_routing_tool(category, severity)
        
        return {
            "agent": self.name,
            "success": True,
            "routing": routing
        }
