from app.agents.base import BaseAgent
from app.tools.agent_tools import resolve_location_tool
from app.utils.logger import logger

class LocationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Location Agent",
            role="Geocoder & Ward Boundary Identifier",
            description="Converts raw location strings or lat/lng coordinates into official municipal ward boundaries."
        )

    def execute(self, inputs: dict) -> dict:
        address = inputs.get("address", "")
        lat = inputs.get("latitude")
        lng = inputs.get("longitude")
        
        logger.info(f"[{self.name}] Resolving location: address='{address}', coords=({lat}, {lng})")
        location_data = resolve_location_tool(address, lat, lng)
        
        return {
            "agent": self.name,
            "success": True,
            "location": location_data
        }
