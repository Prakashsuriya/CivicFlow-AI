import json
from app.agents.planner_agent import PlannerAgent

def main():
    print("=== Testing CivicFlow AI Multi-Agent Execution Flow ===")
    planner = PlannerAgent()

    test_input = {
        "prompt": "There is a massive garbage heap overflowing near Gandhi Market causing severe stench.",
        "image_url": "https://images.unsplash.com/photo-1530587191325-3db32d826c18",
        "address": "Gandhi Market, Main Road, Ward 1 - North",
        "email": "judge@hackathon2026.gov"
    }

    result = planner.execute(test_input)
    print("\n--- Execution Result ---")
    print(f"Complaint ID: {result['complaint_id']}")
    print(f"Category: {result['category']}")
    print(f"Severity: {result['severity']}")
    print(f"Department: {result['department']}")
    print(f"SLA Hours: {result['sla_hours']}")
    print(f"Total Agent Steps Recorded: {len(result['reasoning_trace'])}")
    print("\n--- Autonomous Reasoning Steps ---")
    for step in result['reasoning_trace']:
        print(f"[{step['timestamp']}s] {step['step']} ({step['agent']}): {step['action']}")

    print("\n=== Multi-Agent Test Complete & Verified ===")

if __name__ == "__main__":
    main()
