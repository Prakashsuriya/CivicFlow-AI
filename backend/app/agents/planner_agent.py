import time
from typing import Any
from app.agents.base import BaseAgent
from app.agents.vision_agent import VisionAgent
from app.agents.location_agent import LocationAgent
from app.agents.knowledge_agent import KnowledgeAgent
from app.agents.routing_agent import RoutingAgent
from app.agents.complaint_agent import ComplaintAgent
from app.agents.notification_agent import NotificationAgent
from app.agents.analytics_agent import AnalyticsAgent
from app.utils.logger import logger

class PlannerAgent(BaseAgent):
    """
    Chief Orchestrator Agent (Google ADK Architecture).
    Decides workflows, selects tools, delegates tasks, logs reasoning trace, and synthesizes answers.
    """
    def __init__(self):
        super().__init__(
            name="Planner Agent",
            role="Chief Autonomous Orchestrator",
            description="Coordinates multi-agent workflows, plans issue resolution, delegates to sub-agents, and logs autonomous reasoning."
        )
        self.vision_agent = VisionAgent()
        self.location_agent = LocationAgent()
        self.knowledge_agent = KnowledgeAgent()
        self.routing_agent = RoutingAgent()
        self.complaint_agent = ComplaintAgent()
        self.notification_agent = NotificationAgent()
        self.analytics_agent = AnalyticsAgent()

    def execute(self, inputs: dict[str, Any]) -> dict[str, Any]:
        prompt = inputs.get("prompt", "")
        category_input = inputs.get("category", "")
        image_url = inputs.get("image_url", "")
        address = inputs.get("address", "")
        lat = inputs.get("latitude")
        lng = inputs.get("longitude")
        user_email = inputs.get("email", "citizen@vellore.gov")

        logger.info(f"[{self.name}] Beginning autonomous planning execution flow for category hint '{category_input}'...")

        reasoning_trace = []
        start_time = time.time()

        def log_step(step_name: str, agent: str, thought: str, action: str, result: Any):
            reasoning_trace.append({
                "step": step_name,
                "agent": agent,
                "thought": thought,
                "action": action,
                "result": result,
                "timestamp": round(time.time() - start_time, 2)
            })

        # Step 1: Planning
        log_step(
            "1. Plan Workflow",
            self.name,
            f"Received request: '{prompt}' (Category Selected: '{category_input or 'Auto-Detect'}'). Formulating multi-agent pipeline.",
            "Decompose into Vision -> Location -> RAG Knowledge -> Department Routing -> Database Creation -> Notification -> Analytics",
            "Pipeline initialized"
        )

        # Step 2: Vision Analysis (Google Gemini Multimodal)
        vision_res = self.vision_agent.execute({"image_url": image_url, "prompt": prompt, "category": category_input})
        analysis = vision_res["analysis"]
        category = analysis["issue_type"] or category_input or "General Civic Issue"
        severity = analysis["severity"]
        confidence = analysis.get("confidence", 0.94)
        detected_labels = analysis["detected_labels"]
        vision_desc = analysis.get("description", "")

        log_step(
            "2. Visual & Multimodal Inspection (Gemini Vision)",
            self.vision_agent.name,
            f"Inspecting visual features, severity score, and accuracy metrics.",
            f"Detected issue '{category}' with severity '{severity.upper()}' (Confidence: {int(confidence*100)}%). Labels: {detected_labels}",
            analysis
        )

        # Step 3: Location Resolution & Ward Mapping (Vellore, Tamil Nadu)
        location_res = self.location_agent.execute({"address": address, "latitude": lat, "longitude": lng})
        loc_data = location_res["location"]
        resolved_address = loc_data["address"]
        resolved_lat = loc_data["latitude"]
        resolved_lng = loc_data["longitude"]
        resolved_ward = loc_data["ward"]

        log_step(
            "3. Location Geocoding & Ward Identifier",
            self.location_agent.name,
            f"Resolving spatial coordinates and municipal ward boundary in Vellore, Tamil Nadu.",
            f"Mapped to {resolved_ward} at ({resolved_lat:.4f}, {resolved_lng:.4f})",
            loc_data
        )

        # Step 4: Knowledge Agent (RAG) Query
        rag_query = f"{category} resolution SLA municipal rules Vellore"
        knowledge_res = self.knowledge_agent.execute({"query": rag_query})

        log_step(
            "4. RAG Knowledge Base Search",
            self.knowledge_agent.name,
            f"Querying ChromaDB for official municipal bylaws & SLA policies regarding '{category}'.",
            f"Retrieved {len(knowledge_res['retrieved_docs'])} grounded documents.",
            knowledge_res["summary"]
        )

        # Step 5: Department Routing
        routing_res = self.routing_agent.execute({"category": category, "severity": severity})
        routing = routing_res["routing"]
        dept_code = routing["dept_code"]
        dept_name = routing["dept_name"]
        sla_hours = routing["sla_hours"]

        log_step(
            "5. Department Routing & Priority Matrix",
            self.routing_agent.name,
            f"Determining department jurisdiction and SLA target.",
            f"Assigned to {dept_name} (Code: {dept_code}) with SLA of {sla_hours} hours.",
            routing
        )

        # Step 5.5: Duplicate Detection Check
        from app.tools.agent_tools import check_duplicate_complaint_tool
        dup_check = check_duplicate_complaint_tool(ward=resolved_ward, category=category)
        is_duplicate = dup_check.get("is_duplicate", False)
        merged_ticket_id = dup_check.get("existing_id")

        if is_duplicate:
            log_step(
                "5.5 Semantic Duplicate Detection",
                "Duplicate Detection Agent",
                f"Scanning active tickets in {resolved_ward} for category '{category}'.",
                f"⚠️ Active duplicate ticket found: #{merged_ticket_id}. Merging report & incrementing priority.",
                dup_check
            )
        else:
            log_step(
                "5.5 Semantic Duplicate Detection",
                "Duplicate Detection Agent",
                f"Scanning active tickets in {resolved_ward} for category '{category}'.",
                "No active duplicate tickets found in this ward. Proceeding to new ticket registration.",
                dup_check
            )

        # Step 6: Database Complaint Record Creation
        title = f"{category} Report - {resolved_ward}"
        complaint_res = self.complaint_agent.execute({
            "title": title,
            "description": prompt or f"Reported {category} issue in {resolved_ward}.",
            "category": category,
            "severity": severity,
            "dept_code": dept_code,
            "address": resolved_address,
            "latitude": resolved_lat,
            "longitude": resolved_lng,
            "ward": resolved_ward,
            "sla_hours": sla_hours,
            "image_url": image_url,
            "detected_labels": detected_labels
        })
        complaint_data = complaint_res["complaint"]
        complaint_id = complaint_data.get("complaint_id", "CF-2026-9999")

        log_step(
            "6. Database Lifecycle & Audit Log",
            self.complaint_agent.name,
            f"Creating official tracking ID and audit trail in SQLite DB.",
            f"Generated Complaint ID: {complaint_id}" if not is_duplicate else f"Registered report under ticket: {complaint_id} (Merged with #{merged_ticket_id})",
            complaint_data
        )

        # Step 7: Notification Dispatch
        notification_res = self.notification_agent.execute({
            "complaint_id": complaint_id,
            "recipient_email": user_email,
            "dept_name": dept_name,
            "sla_hours": sla_hours
        })

        log_step(
            "7. Stakeholder Notification Dispatch",
            self.notification_agent.name,
            f"Formulating alert emails and real-time dashboard notifications.",
            f"Dispatched email to {user_email} and broadcasted WebSocket update.",
            notification_res["notification"]
        )

        # Step 8: Analytics Refresh
        analytics_res = self.analytics_agent.execute({})

        log_step(
            "8. Municipal Heatmap & Analytics Sync",
            self.analytics_agent.name,
            f"Recomputing city-wide resolution metrics and ward density.",
            f"Updated resolution metrics: {analytics_res['metrics']['total']} total complaints.",
            analytics_res["metrics"]
        )

        # Final Synthesis Answer
        final_summary = (
            f"### 🚀 Issue Successfully Processed & Registered in Vellore, TN\n\n"
            f"- **Complaint Tracking ID:** `{complaint_id}`\n"
            f"- **Detected Issue:** {category} *(Severity: {severity.upper()} | Confidence: {int(confidence*100)}%)*\n"
            f"- **Assigned Department:** {dept_name}\n"
            f"- **Ward & Location:** {resolved_ward} ({resolved_address})\n"
            f"- **Estimated SLA Resolution Time:** **{sla_hours} Hours**\n"
            f"- **Assigned Field Officer:** {complaint_data.get('assigned_worker', 'Vellore Duty Officer')}\n\n"
            f"**Gemini Inspection Note:** {vision_desc}"
        )

        return {
            "success": True,
            "complaint_id": complaint_id,
            "summary": final_summary,
            "category": category,
            "severity": severity,
            "confidence": confidence,
            "ward": resolved_ward,
            "department": dept_name,
            "sla_hours": sla_hours,
            "is_duplicate": is_duplicate,
            "merged_ticket_id": merged_ticket_id,
            "reasoning_trace": reasoning_trace
        }
