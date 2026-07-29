from app.agents.base import BaseAgent
from app.tools.agent_tools import analyze_image_tool
from app.utils.logger import logger

class VisionAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Vision Agent",
            role="Multi-modal Visual Issue Detector",
            description="Analyzes uploaded images with Gemini Vision to identify potholes, garbage, water leaks, damaged streetlights, and flooding."
        )

    def execute(self, inputs: dict) -> dict:
        image_input = inputs.get("image_url") or inputs.get("image_path") or ""
        text_prompt = inputs.get("prompt") or ""
        category_hint = inputs.get("category", "")
        
        logger.info(f"[{self.name}] Analyzing input image with prompt: '{text_prompt}', hint: '{category_hint}'")
        analysis = analyze_image_tool(image_input, text_prompt, category_hint)
        
        return {
            "agent": self.name,
            "success": True,
            "analysis": analysis
        }
