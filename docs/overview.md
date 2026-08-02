# CivicFlow AI - Overview 🏛️🤖

> **An Autonomous Municipal AI Operating System designed for Google AI Agent Builder Series 2026 National Finale.**

---

## 🌟 Executive Summary

**CivicFlow AI** redefines civic complaint management by transitioning municipal administration from manual workflows and static decision-tree chatbots to an **autonomous multi-agent digital workforce**. Built on Google ADK and Google Gemini 2.5 Flash Vision, CivicFlow AI enables citizens to report urban grievances via text, voice, or image uploads. The system autonomously triages the issue, calculates visual severity scores, maps spatial coordinates to municipal wards, performs grounded Retrieval-Augmented Generation (RAG) against official bylaws, dispatches work orders to relevant municipal departments, and broadcasts live WebSocket updates.

Default regional deployment: **Vellore Corporation, Tamil Nadu** (covering Wards 1 to 5: Katpadi, Sathuvachari, Gandhinagar, Bagayam/CMC, and Fort Round).

---

## 🎯 Key Objectives

1. **Zero-Delay Automated Triage:** Eliminate 3-to-7 day manual routing bottlenecks through sub-second AI classification.
2. **Grounded Policy Compliance:** Enforce exact SLA timelines and municipal regulations using ChromaDB RAG to prevent hallucinated advice.
3. **Multimodal Defect Verification:** Leverage Gemini 2.5 Flash Vision to inspect citizen-submitted photos, rate severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), and score accuracy confidence.
4. **Transparent Governance:** Provide citizens and officers with a live **Autonomous Reasoning Drawer** exposing real-time agent thoughts, tool calls, and execution timestamps.
5. **Proactive Duplicate Prevention:** Scan ward active tickets to merge duplicate complaints and increment ticket priority instead of cluttering municipal queues.

---

## 📊 Core Features At A Glance

| Module | Features & Capabilities |
| :--- | :--- |
| **Citizen AI Portal** | 18 Supported Civic Categories, Multimodal Drag-and-Drop Photo Upload, Voice Input, Real-time Reasoning Accordion. |
| **Interactive Ward Heatmap** | Leaflet.js / OpenStreetMap density visualization, color-coded severity pins across Vellore Corporation Wards. |
| **Admin & Officer Dashboard** | Departmental queue management, status transition lifecycle (`Submitted` ➔ `In Progress` ➔ `Resolved`), worker assignment. |
| **RAG Policy Engine** | Instant semantic search across Vellore Municipal Bylaws, SLA guidelines, emergency contacts, and welfare schemes. |
| **Multi-Channel Dispatch** | Real-time SMTP email notifications and WebSocket live event stream. |

---

## 🔗 Quick Links

- [System Architecture](file:///d:/CivicFlow%20AI/docs/architecture.md)
- [Multi-Agent Swarm Specification](file:///d:/CivicFlow%20AI/docs/agents.md)
- [End-to-End Complaint Workflow](file:///d:/CivicFlow%20AI/docs/workflow.md)
- [API & WebSocket Documentation](file:///d:/CivicFlow%20AI/docs/api.md)
- [Production Deployment Guide](file:///d:/CivicFlow%20AI/docs/deployment.md)
