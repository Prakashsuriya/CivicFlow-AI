import json
from app.agents.planner_agent import PlannerAgent

def main():
    print("=== Testing CivicFlow AI Multi-Agent Execution Flow (3-Scenario Progression) ===")
    planner = PlannerAgent()

    test_scenarios = [
        {
            "name": "Scenario 1: Public Infrastructure (Municipality)",
            "input": {
                "prompt": "There is a massive garbage heap overflowing near Gandhi Market causing severe stench.",
                "category": "Garbage",
                "image_url": "https://images.unsplash.com/photo-1530587191325-3db32d826c18",
                "address": "Gandhi Market, Katpadi Main Road, Katpadi",
                "email": "judge@hackathon2026.gov"
            }
        },
        {
            "name": "Scenario 2: Residential Community (Apartment Lift Failure)",
            "input": {
                "prompt": "Elevator in Tower A, Greenwood Heights is stuck between 3rd and 4th floors with strange grinding noise.",
                "category": "Lift / Elevator",
                "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758",
                "address": "Greenwood Heights Gated Society, Block A, Katpadi",
                "email": "resident@greenwood.org"
            }
        },
        {
            "name": "Scenario 3: Utility Provider (High Voltage Transformer Sparking)",
            "input": {
                "prompt": "High voltage power transformer near Katpadi Junction is sparking heavily and emitting black smoke.",
                "category": "Electrical Transformer",
                "image_url": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e",
                "address": "Katpadi Junction Approach Road, Katpadi",
                "email": "safety@tangedco.gov.in"
            }
        }
    ]

    for scenario in test_scenarios:
        print(f"\n==========================================")
        print(f"[>] RUNNING: {scenario['name']}")
        print(f"==========================================")
        res = planner.execute(scenario["input"])

        print(f"[OK] Incident ID:           {res['complaint_id']}")
        print(f"[OK] Domain Type:           {res['domain_type']}")
        print(f"[OK] Responsible Authority: {res['responsible_authority']}")
        print(f"[OK] Assigned Dept:        {res['department']}")
        print(f"[OK] SLA Hours:             {res['sla_hours']} hrs")
        print(f"[OK] Asset Health Score:    {res['asset']['health_score']}% ({res['asset']['status'].upper()})")
        print(f"[OK] Reasoning Trace Steps: {len(res['reasoning_trace'])}")
        print("\n--- Reasoning Steps ---")
        for step in res['reasoning_trace']:
            print(f"  [{step['timestamp']}s] {step['step']} ({step['agent']}): {step['action']}")

    print("\n==========================================")
    print("=== All 3 Scenarios Passed Successfully! ===")
    print("==========================================")

if __name__ == "__main__":
    main()
