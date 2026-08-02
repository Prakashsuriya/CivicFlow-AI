# CivicFlow AI - Architecture Deep Dive 🏗️

> **Technical Architecture Specification for Google AI Agent Builder Series 2026 National Finale.**

---

## 1. System Overview

CivicFlow AI utilizes a decoupled, modern web-and-agent micro-architecture comprising a **React + Vite single-page frontend**, a **FastAPI API Gateway**, an **8-Agent Swarm orchestrated by Google ADK / Gemini**, a **ChromaDB Vector RAG Engine**, and an **SQLite Relational Persistence Layer**.

![Architecture Diagram](../architecture/architecture-diagram.png)

---

## 2. Layer-by-Layer Architectural Breakdown

```
+-----------------------------------------------------------------------------------+
|                                  FRONTEND LAYER                                   |
|   React (Vite)  |  Vanilla CSS System  |  Leaflet Maps  |  Recharts Analytics     |
+-----------------------------------------+-----------------------------------------+
                                          | REST API / WebSockets
                                          v
+-----------------------------------------------------------------------------------+
|                                API GATEWAY LAYER                                  |
|   FastAPI Gateway  |  CORS Middleware  |  Pydantic Schemas  |  WebSocket Manager |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                       MULTI-AGENT ORCHESTRATION LAYER (Google ADK)               |
|                                                                                   |
|                              🎯 Planner Agent (Lead)                              |
|   +------------------+------------------+------------------+------------------+   |
|   | 👁️ Vision Agent | 📍 Location Agent| 📚 Knowledge RAG| 🔀 Routing Agent |   |
|   +------------------+------------------+------------------+------------------+   |
|   | 📝 Complaint Agt | 🔔 Notification  | 📊 Analytics Agent| 🔍 Dup Detector |   |
|   +------------------+------------------+------------------+------------------+   |
+----------------------+------------------+------------------+----------------------+
                       |                  |                  |
                       v                  v                  v
+-----------------------------------------------------------------------------------+
|                           INTEGRATION & LLM SERVICES                              |
|   Google Gemini 2.5 Vision  |  ChromaDB Vector Engine  |  SMTP Mailer             |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                                PERSISTENCE LAYER                                  |
|   SQLite Main DB (Complaints, Status Logs)  |  ChromaDB Policy Vector DB          |
+-----------------------------------------------------------------------------------+
```

---

## 3. Detailed Component Specifications

### 3.1 Frontend Layer (React 18 + Vite)
- **Framework:** React 18 with Vite for ultra-fast bundling and HMR.
- **Design System:** Custom CSS design system with HSL dark mode variables (`#0f172a`, `#10b981`, `#06b6d4`, `#f59e0b`).
- **Map Visualizations:** `Leaflet.js` & `react-leaflet` displaying official ward polygons and interactive complaint markers in Vellore, TN.
- **Analytics Charts:** `Recharts` library rendering real-time resolution speed, ward distribution, and category breakdowns.
- **Reasoning Drawer:** Dynamic accordion presenting real-time agent execution traces, thoughts, and sub-second tool parameters.

### 3.2 API Gateway & Real-Time Communication (FastAPI + WebSockets)
- **REST Router:** Asynchronous FastAPI endpoints (`/api/v1/complaints`, `/api/v1/analytics`, `/api/v1/rag`).
- **Validation:** Pydantic models ensuring strict payload verification.
- **WebSocket Manager (`ws.py`):** In-memory event hub broadcasting live events (`NEW_COMPLAINT`, `STATUS_UPDATE`) to connected officer dashboards.

### 3.3 Multi-Agent Orchestrator (Google ADK Architecture)
- **Planner Agent (`planner_agent.py`):** Acts as the central reasoning hub. It receives incoming raw requests, initializes the 8-step pipeline, delegates sub-tasks to specialized sub-agents, records step-by-step reasoning logs, and synthesizes the final response.
- **Vision Agent (`vision_agent.py`):** Uses Google Gemini 2.5 Flash Vision (`google-genai` SDK) to evaluate visual hazards, extract issue labels, and assign severity ratings (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Location Agent (`location_agent.py`):** Reverse-geocodes text inputs and lat/lng coordinates into 5 official municipal wards in Vellore, Tamil Nadu.
- **Knowledge Agent (`knowledge_agent.py`):** Queries ChromaDB using SentenceTransformers embeddings for grounded municipal policy and SLA lookup.
- **Routing Agent (`routing_agent.py`):** Evaluates category and severity against department SLA matrices to route tickets to responsible teams.
- **Complaint Agent (`complaint_agent.py`):** Manages relational DB transactions, generates tracking IDs (`#CF-2026-XXXX`), assigns field workers, and appends status logs.
- **Notification Agent (`notification_agent.py`):** Sends emails via SMTP and triggers WebSocket event broadcasts.
- **Analytics Agent (`analytics_agent.py`):** Recomputes municipal performance indexes and ward heatmaps.

### 3.4 Model Context Protocol (MCP) Integration
- Standardized tool integration model allowing agents to interface with external tools (ChromaDB vector search, OpenStreetMap geocoding, SQLite ORM, and SMTP services) through clear tool abstractions (`app/tools/agent_tools.py`).

### 3.5 Storage & Persistence Layer
- **SQLite Database (`civicflow.db`):** Relational tables (`users`, `departments`, `workers`, `complaints`, `complaint_images`, `complaint_status_logs`, `notifications`).
- **ChromaDB (`chroma_db/`):** Local vector DB storing vectorized municipal bylaws, SLAs, and public welfare schemes.

---

## 4. Resilience & Fallback Strategies

1. **Gemini API Fallback:** If the external Gemini API is rate-limited or unconfigured, the Vision Agent seamlessly switches to a heuristic rule engine so system operation remains unaffected.
2. **SMTP Email Fallback:** If email server settings are not supplied in `.env`, notifications are logged into the SQLite database with `RECORDED_IN_DB_SIMULATED` status.

---

## 5. Security Architecture

- Environment isolation via `.env` for secrets (`GEMINI_API_KEY`, `DATABASE_URL`, `JWT_SECRET`).
- Input sanitization on all REST payloads.
- CORS policy restricting unauthenticated cross-origin access in production setups.
