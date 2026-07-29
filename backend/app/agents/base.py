from typing import Any

class BaseAgent:
    """
    Base Agent specification for Google ADK Agent structure in CivicFlow AI.
    """
    def __init__(self, name: str, role: str, description: str):
        self.name = name
        self.role = role
        self.description = description

    def execute(self, inputs: dict[str, Any]) -> dict[str, Any]:
        raise NotImplementedError("Subclasses must implement execute method.")
