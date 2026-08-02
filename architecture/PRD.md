# Product Requirements Document (PRD): CivicFlow AI 🏛️🤖

**Project Name:** CivicFlow AI  
**Tagline:** Autonomous Municipal AI Operating System  
**Event:** Google AI Agent Builder Series 2026 National Finale  
**Project Domain:** Real Estate, Smart Living & Municipal Governance  
**Target Deployment:** Vellore Corporation, Tamil Nadu, India (Wards 1–5)  
**Version:** 1.0.0 (Production-Ready Architecture)  
**Status:** Approved for Production  

---

## 1. Executive Summary

**CivicFlow AI** is a production-grade, autonomous municipal AI operating system engineered for the **Google AI Agent Builder Series 2026 National Finale**. Positioned at the intersection of **Real Estate, Smart Living & Municipal Governance**, CivicFlow AI transforms public grievance redressal from slow, paper-heavy manual triaging and rigid decision-tree chatbots into an autonomous, digital multi-agent workforce.

Powered by **Google ADK** (Agent Development Kit) / **LangGraph**, **Google Gemini 2.5 Flash Vision**, the **Model Context Protocol (MCP)**, and a **ChromaDB Retrieval-Augmented Generation (RAG)** engine, CivicFlow AI enables citizens to report urban grievances via text, voice, or photo attachments. The platform autonomously inspects visual hazards, geocodes locations to official municipal ward boundaries in Vellore Corporation, queries grounded municipal bylaws for exact Resolution SLA targets, checks for duplicate complaints, dispatches work orders to departmental field crews, alerts citizens via email/WebSockets, and updates executive analytics in real time.

Default regional deployment: **Vellore Corporation, Tamil Nadu** (covering Wards 1 to 5: Katpadi, Sathuvachari, Gandhinagar, Bagayam/CMC, and Fort Round).

---

## 2. Problem Statement

Citizens and city officials in modern urban environments encounter severe structural friction when managing public infrastructure and municipal services:

1. **Fragmented Municipal Jurisdictions:** Citizens rarely know which municipal department is legally responsible for specific hazards (e.g., a clogged storm drain vs. an overflowing sewer pipe vs. broken streetlights).
2. **Manual Triage Delays:** Traditional complaint dispatching relies on manual triaging by municipal administrative clerks, causing delays of 3 to 7 days before assigning field workers.
3. **Frustrating Legacy Chatbots:** Existing civic bots rely on static decision trees that break when handling unstructured voice prompts, ambiguous text, or uploaded photo evidence.
4. **Information Asymmetry & Hallucinations:** Support desks provide conflicting advice regarding municipal bylaws, government welfare schemes, and resolution timelines.
5. **Duplicate Complaint Backlogs:** Multiple citizens independently reporting the same pothole or garbage dump create duplicate database entries that clog departmental queues and distort workload metrics.
6. **Data Silos & Lack of Transparency:** Municipal operational data remains trapped in legacy databases, leaving citizens without real-time tracking and city leaders without actionable performance analytics.

---

## 3. Goals & Objectives

### 3.1 Primary Goals
- **End-to-End Autonomy:** Transition municipal grievance management from manual paper ticket routing to an AI-driven, autonomous multi-agent workflow.
- **Zero-Delay Automated Triage:** Reduce ticket classification, geocoding, and department dispatch time from days to sub-second automated triage.
- **Multimodal Visual Inspection:** Eliminate false or exaggerated reports by analyzing uploaded photo assets using Google Gemini 2.5 Flash Vision to score hazard severity and confidence.
- **Grounded Policy Compliance:** Enforce exact SLA timelines and municipal regulations using ChromaDB RAG to guarantee zero LLM hallucination.
- **Complete Transparent Governance:** Expose real-time agent execution traces, selected tools, and sub-second timestamps through a live **Autonomous Reasoning Drawer**.

### 3.2 Key Performance Targets
- **Triage Latency:** `< 2.5 seconds` cold start, `< 1.2 seconds` warm pipeline execution.
- **Department Routing Accuracy:** `> 95%` correct automated department assignment.
- **Resolution Turnaround:** `30% reduction` in average ticket resolution time.
- **System Availability:** `99.9% uptime` for API Gateway and WebSocket event feeds.

---

## 4. Market Opportunity & Domain Context

Urban centers globally are investing heavily in **Smart City Infrastructure & Smart Living ecosystems**. As urban density increases, municipal corporations require scalable software operating systems to manage physical assets, public health, sanitation, and citizen satisfaction.

CivicFlow AI bridges the gap between smart living real estate developments and municipal authorities. By standardizing issue reporting, geocoding, and department dispatching into an open-source, MCP-compliant platform, CivicFlow AI provides a replicable blueprint for smart cities across India and globally.

---

## 5. Target Users & Stakeholders

```
+-----------------------------------------------------------------------------------+
|                            CIVICFLOW AI STAKEHOLDERS                              |
+-------------------+-------------------+-------------------+-----------------------+
|  1. Citizens      | 2. Department     | 3. Field Workers  | 4. Executive          |
|                   |    Officers       |                   |    Administrators     |
| - Report issues   | - Monitor queues  | - Receive work    | - View city heatmaps  |
| - Track tickets   | - Assign crews    |   orders          | - Monitor SLA rates   |
| - Query bylaws    | - Update status   | - Upload proof    | - Urban planning      |
+-------------------+-------------------+-------------------+-----------------------+
```

1. **Citizens (Residents & Property Owners):** Submit multimodal civic complaints, track resolution status live, and search government schemes via RAG.
2. **Department Officers (Sanitation, Roads, Water, Electrical, etc.):** Manage departmental queues, review AI severity ratings, assign field crews, and override automated decisions when necessary.
3. **Field Workers (Ground Maintenance Crews):** Receive ward-specific work orders with precise coordinates, navigate to sites, and update completion status.
4. **Municipal Administrators & City Leaders:** High-level executive oversight of city operations, department SLA compliance rates, ward density heatmaps, and resource allocation.

---

## 6. User Journeys & Core Workflows

### 6.1 Citizen Journey: Multimodal Reporting & Tracking
1. **Access Portal:** Citizen opens CivicFlow AI Citizen Portal on mobile or desktop.
2. **Input Details:** Selects category (or leaves auto-detect), uploads photo of a damaged road, enters text description or uses voice dictation.
3. **Instant Triage:** System triggers Planner Agent. Gemini Vision inspects the photo (`HIGH` severity, `96%` confidence), Location Agent maps to `Ward 1 - Katpadi (Vellore)`, ChromaDB retrieves 24-hour SLA rules, and Routing Agent assigns `Roads & Infrastructure Dept`.
4. **Ticket & Trace:** Receives unique tracking ID (`#CF-2026-4821`) and opens the Reasoning Drawer to review the AI agent step trace.
5. **Real-Time Alert:** Receives email confirmation and tracks ticket status live on the interactive Leaflet ward map.

### 6.2 Department Officer Journey: Queue Management & Resolution
1. **Access Admin Dashboard:** Department Officer logs in to the Admin Queue.
2. **Filter Queue:** Views incoming tickets sorted by severity (`CRITICAL`, `HIGH`) and assigned ward.
3. **Review AI Inspection:** Inspects Gemini Vision visual labels and location coordinates.
4. **Status Lifecycle Transition:** Changes ticket status from `Submitted` ➔ `In Progress` ➔ `Resolved`.
5. **Automated Notification:** Updating status automatically triggers WebSocket broadcast to connected dashboards and sends citizen resolution email alerts.

---

## 7. Functional Requirements

| ID | Category | Requirement Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-01** | Multimodal Input | Support text prompts, voice dictation, and photo attachments (JPEG, PNG, WebP, Base64). | **P0** |
| **FR-02** | Visual Inspection | Inspect uploaded image assets via Google Gemini 2.5 Flash Vision to extract defect type, visual severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), and confidence score. | **P0** |
| **FR-03** | Spatial Geocoding | Reverse-geocode raw text addresses and GPS coordinates to 5 official Vellore Wards (Katpadi, Sathuvachari, Gandhinagar, Bagayam/CMC, Fort Round). | **P0** |
| **FR-04** | Grounded Policy RAG | Perform vector similarity search in ChromaDB across municipal bylaws and schemes to extract exact SLA resolution deadlines. | **P0** |
| **FR-05** | Department Routing | Route tickets across 7 departments (Sanitation, Roads, Water, Electrical, Parks, Traffic, Environment) with SLA priority acceleration. | **P0** |
| **FR-06** | Duplicate Detection | Detect active, non-resolved complaints in the same ward and category; merge duplicate reports and increment priority. | **P1** |
| **FR-07** | Live Reasoning Trace | Display step-by-step agent execution logs, selected tools, thoughts, and sub-second timestamps in an interactive side drawer. | **P0** |
| **FR-08** | Multi-Channel Alert | Send confirmation emails via SMTP and broadcast live real-time updates via WebSockets (`/ws/feed`). | **P0** |
| **FR-09** | Ward Heatmap & Maps | Render interactive Leaflet.js map with color-coded complaint pins and ward density polygon overlays. | **P0** |
| **FR-10** | Executive Analytics | Compute real-time municipal KPIs, resolution percentage rates, ward distribution charts, and average resolution hours. | **P1** |
| **FR-11** | Category Support | Support 18 civic issue categories (Garbage, Potholes, Streetlights, Drainage, Water leaks, Flooding, Fallen trees, Traffic signals, etc.). | **P0** |
| **FR-12** | Authentication & RBAC | Secure JWT-based authentication supporting Role-Based Access Control (`citizen`, `officer`, `worker`, `admin`). | **P1** |

---

## 8. Non-Functional Requirements

### 8.1 Performance & Latency
- **Sub-Second Agent Orchestration:** End-to-end multi-agent pipeline execution target `< 2.5s` for cold starts, `< 1.2s` for warm execution.
- **RAG Search Latency:** Vector similarity queries in ChromaDB completed in `< 50ms`.
- **WebSocket Throughput:** Real-time event broadcast latency `< 100ms` across connected clients.

### 8.2 Reliability & Fault-Tolerance
- **Vision Agent Heuristic Fallback:** If Gemini API is unreachable or rate-limited, Vision Agent seamlessly falls back to keyword heuristic classification without throwing runtime exceptions.
- **SMTP Email Graceful Degradation:** If SMTP credentials are missing, email alerts are safely recorded in SQLite DB (`RECORDED_IN_DB_SIMULATED`) without blocking ticket generation.

### 8.3 Security & Data Protection
- **Environment Isolation:** Secrets (`GEMINI_API_KEY`, `JWT_SECRET`) stored strictly in `.env` files.
- **Strict Payload Sanitation:** Pydantic schema validation on all REST payloads to prevent SQL injection and script execution.

### 8.4 Scalability & Microservices Readiness
- Modular agent design using the **Model Context Protocol (MCP)** allowing tool abstractions to scale independently across microservices.

---

## 9. Multi-Agent Architecture & Agent Swarm Specification

CivicFlow AI utilizes an **8-agent multi-agent swarm** orchestrated by the **Planner Agent** using **Google ADK** / **LangGraph**:

```
+-----------------------------------------------------------------------+
|                   🎯 1. PLANNER AGENT (ADK Lead)                      |
+----+--------+--------+--------+--------+--------+--------+------------+
     |        |        |        |        |        |        |
     v        v        v        v        v        v        v
  👁️ 2.     📍 3.    📚 4.    🔀 5.    🔍 5.5   📝 6.    🔔 7.        📊 8.
  Vision   Location Knowledge Routing Duplicate Complaint Notification Analytics
  Agent    Agent    Agent     Agent   Detector  Agent     Agent        Agent
```

### Agent Detailed Specifications

| Agent | Name & Role | Primary Responsibility | Input Parameters | Output Schema |
| :--- | :--- | :--- | :--- | :--- |
| **Agent 1** | **🎯 Planner Agent** *(Lead Orchestrator)* | Master workflow planner. Coordinates sub-agents, logs execution traces, and synthesizes citizen markdown responses. | `prompt`, `category`, `image_url`, `address`, `latitude`, `longitude`, `email` | `complaint_id`, `summary`, `reasoning_trace`, `is_duplicate` |
| **Agent 2** | **👁️ Vision Agent** *(Multimodal Detector)* | Evaluates images using Google Gemini 2.5 Flash Vision to identify defect category, severity, and confidence score. | `image_url`, `prompt`, `category` | `analysis`: `{issue_type, severity, confidence, detected_labels}` |
| **Agent 3** | **📍 Location Agent** *(Reverse Geocoder)* | Maps text addresses and spatial GPS coordinates to 5 official Vellore Corporation Wards. | `address`, `latitude`, `longitude` | `location`: `{address, ward, latitude, longitude, landmark}` |
| **Agent 4** | **📚 Knowledge Agent** *(RAG Engine)* | Performs vector similarity search in ChromaDB to retrieve grounded municipal policy bylaws and SLA rules. | `query` | `retrieved_docs`, `summary`: `{grounded_citations}` |
| **Agent 5** | **🔀 Routing Agent** *(SLA Dispatcher)* | Maps issue category and severity against departmental matrix; calculates SLA resolution deadlines. | `category`, `severity` | `routing`: `{dept_code, dept_name, sla_hours, priority}` |
| **Agent 5.5**| **🔍 Duplicate Detector** *(Semantic Check)* | Queries active non-resolved tickets in target ward; merges duplicate complaints and increments ticket priority. | `ward`, `category` | `is_duplicate`, `existing_id`, `merged_ticket_id` |
| **Agent 6** | **📝 Complaint Agent** *(Database Manager)* | Manages SQLite DB transactions via SQLAlchemy, generates tracking IDs (`#CF-2026-XXXX`), and assigns ward field workers. | `title`, `description`, `category`, `ward`, `sla_hours`, `image_url` | `complaint`: `{complaint_id, status, assigned_worker, created_at}` |
| **Agent 7** | **🔔 Notification Agent** *(Alert Dispatcher)*| Formulates HTML emails, dispatches via SMTP, and broadcasts `NEW_COMPLAINT` WebSocket events. | `complaint_id`, `recipient_email`, `dept_name`, `sla_hours` | `notification`: `{recipient, status, delivery_note}` |
| **Agent 8** | **📊 Analytics Agent** *(KPI Specialist)* | Recomputes city-wide resolution efficiency rates, ward density heatmaps, and category statistics. | `db_session` | `metrics`: `{total, resolved, resolution_rate_pct, ward_distribution}` |

---

## 10. System Architecture Overview & MCP Integration

```
+-----------------------------------------------------------------------------------+
|                                  FRONTEND LAYER                                   |
|   React 18 (Vite) | HSL Dark Design System | Leaflet.js Maps | Recharts Analytics  |
+-----------------------------------------+-----------------------------------------+
                                          | REST API / WebSockets (/ws/feed)
                                          v
+-----------------------------------------------------------------------------------+
|                                API GATEWAY LAYER                                  |
|   FastAPI Gateway  |  CORS Middleware  |  Pydantic Models  |  WebSocket Manager   |
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
|                       MODEL CONTEXT PROTOCOL (MCP) TOOL SERVER                    |
|   Standardized interface for tool bindings: Geocoding, RAG Search, DB CRUD, SMTP  |
+-----------------------------------------------------------------------------------+
                       |                  |                  |
                       v                  v                  v
+-----------------------------------------------------------------------------------+
|                                PERSISTENCE LAYER                                  |
|   SQLite Relational DB (civicflow.db)     |  ChromaDB Policy Vector DB (chroma_db) |
+-----------------------------------------------------------------------------------+
```

---

## 11. Technology Stack

| Layer | Technology Specification |
| :--- | :--- |
| **Frontend Framework** | React 18, Vite, Vanilla CSS HSL Design System, Lucide React Icons |
| **Map & Analytics** | Leaflet.js, React-Leaflet, OpenStreetMap, Recharts |
| **Backend Framework** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2 |
| **AI Framework** | Google ADK (Agent Development Kit) / LangGraph, LangChain |
| **Multimodal LLM** | Google Gemini 2.5 Flash Vision (`google-genai` SDK), Google AI Studio |
| **Tool Protocol** | Model Context Protocol (MCP) Python SDK |
| **Vector DB & RAG** | ChromaDB Persistent Vector Store, SentenceTransformers (`all-MiniLM-L6-v2`) |
| **Database & ORM** | SQLite (`civicflow.db`), SQLAlchemy ORM |
| **Real-Time Alerts** | WebSockets (`ws.py`), Python `smtplib` (SMTP) |
| **Hosting & CI/CD** | Vercel (Frontend), Render / Railway / Docker Compose (Backend) |

---

## 12. Data Model & Schema Specifications

### 12.1 Relational Schema (SQLite / SQLAlchemy)

#### 1. `users` Table
- `id` (String, Primary Key, UUID)
- `name` (String, Required)
- `email` (String, Unique, Index, Required)
- `phone` (String, Optional)
- `role` (String, Default: `"citizen"`) — Options: `citizen`, `officer`, `worker`, `admin`
- `created_at` (DateTime, Default: `utcnow`)

#### 2. `departments` Table
- `id` (String, Primary Key, UUID)
- `name` (String, Unique, Required) — e.g. `"Roads & Infrastructure Dept"`
- `code` (String, Unique, Required) — Codes: `SAN`, `ROAD`, `WAT`, `ELEC`, `PRK`, `TRF`, `ENV`, `ADM`
- `head_email` (String, Required)
- `sla_hours_default` (Integer, Default: `24`)

#### 3. `workers` Table
- `id` (String, Primary Key, UUID)
- `department_id` (String, Foreign Key -> `departments.id`)
- `name` (String, Required)
- `phone` (String, Required)
- `status` (String, Default: `"available"`) — Options: `available`, `busy`, `offline`
- `ward_assigned` (String, Optional)

#### 4. `complaints` Table
- `id` (String, Primary Key, Custom ID e.g. `#CF-2026-4821`)
- `user_id` (String, Foreign Key -> `users.id`, Optional)
- `title` (String, Required)
- `description` (Text, Required)
- `category` (String, Required)
- `severity` (String, Default: `"medium"`) — Options: `low`, `medium`, `high`, `critical`
- `status` (String, Default: `"submitted"`) — Options: `submitted`, `in_progress`, `resolved`, `rejected`
- `department_id` (String, Foreign Key -> `departments.id`, Optional)
- `assigned_worker_id` (String, Foreign Key -> `workers.id`, Optional)
- `address` (Text, Optional)
- `latitude` (Float, Optional)
- `longitude` (Float, Optional)
- `ward` (String, Optional) — e.g. `"Ward 1 - Katpadi (Vellore)"`
- `estimated_sla_hours` (Integer, Default: `24`)
- `created_at` (DateTime, Default: `utcnow`)
- `updated_at` (DateTime, OnUpdate: `utcnow`)
- `resolved_at` (DateTime, Optional)

#### 5. `complaint_images` Table
- `id` (String, Primary Key, UUID)
- `complaint_id` (String, Foreign Key -> `complaints.id`)
- `image_url` (Text, Required)
- `detected_labels` (String, Optional)
- `confidence_score` (Float, Optional)
- `uploaded_at` (DateTime, Default: `utcnow`)

#### 6. `complaint_status_logs` Table
- `id` (String, Primary Key, UUID)
- `complaint_id` (String, Foreign Key -> `complaints.id`)
- `status_from` (String, Optional)
- `status_to` (String, Required)
- `updated_by_agent` (String, Default: `"PlannerAgent"`)
- `reasoning_notes` (Text, Optional)
- `timestamp` (DateTime, Default: `utcnow`)

#### 7. `notifications` Table
- `id` (String, Primary Key, UUID)
- `complaint_id` (String, Foreign Key -> `complaints.id`)
- `recipient_email` (String, Required)
- `title` (String, Required)
- `message` (Text, Required)
- `status` (String, Default: `"pending"`) — Options: `pending`, `SENT_VIA_SMTP`, `RECORDED_IN_DB_SIMULATED`
- `sent_at` (DateTime, Default: `utcnow`)

---

### 12.2 Vector Schema (ChromaDB)
- **Collection Name:** `municipal_policies`
- **Embedding Model:** `SentenceTransformers (all-MiniLM-L6-v2)`
- **Metadata Fields:** `source` (file path), `category` (policy domain), `ward` (jurisdiction).
- **Documents:** Chunked text excerpts of official Vellore Municipal bylaws, resolution SLA matrices, disaster hotlines, and citizen welfare schemes.

---

## 13. API & WebSocket Specifications

### 13.1 Authentication API (`/api/v1/auth`)
- `POST /api/v1/auth/register`: Register citizen or officer account.
- `POST /api/v1/auth/login`: Authenticate credentials and return JWT bearer token.

### 13.2 Complaints API (`/api/v1/complaints`)
- `POST /api/v1/complaints/submit`: Submit civic report to the 8-agent multi-agent pipeline.
- `GET /api/v1/complaints/`: Fetch filtered list of complaints (by `status`, `ward`, `category`).
- `GET /api/v1/complaints/{id}`: Retrieve complaint details, image metadata, and status log history.
- `PUT /api/v1/complaints/{id}/status`: Update ticket resolution status (`Submitted` ➔ `In Progress` ➔ `Resolved`).

### 13.3 Analytics API (`/api/v1/analytics`)
- `GET /api/v1/analytics/dashboard`: Get real-time city-wide resolution KPIs, total counts, and ward statistics.
- `GET /api/v1/analytics/heatmap`: Get ward complaint density coordinates for Leaflet heat maps.

### 13.4 Knowledge RAG API (`/api/v1/rag`)
- `POST /api/v1/rag/search`: Query ChromaDB vector database for grounded municipal policy bylaws.

### 13.5 WebSockets Feed (`/ws/feed`)
- `WS /ws/feed`: Real-time WebSocket connection emitting live `NEW_COMPLAINT` and `STATUS_UPDATE` payloads.

---

## 14. Security, Authentication & Governance (RBAC)

1. **Authentication:** Stateless JSON Web Token (JWT) verification via HTTP Bearer headers (`PyJWT`).
2. **Role-Based Access Control (RBAC):**
   - `citizen`: Submit complaints, track own tickets, query RAG knowledge base.
   - `worker`: View assigned ward complaints, update task execution notes.
   - `officer`: Full departmental queue access, status transition override authority, worker assignment.
   - `admin`: System-wide access, analytics export, department configuration.
3. **Data Protection:** Sensitive API keys (`GEMINI_API_KEY`, `JWT_SECRET`) isolated in `.env` files.
4. **Input Sanitation:** Pydantic payload models prevent injection attacks and malformed Base64 data.

---

## 15. Deployment, Infrastructure & CI/CD Pipeline

```
+-----------------------------------------------------------------------------------+
|                                 CI/CD PIPELINE                                    |
|   GitHub Repository ──► GitHub Actions CI ──► Build & Lint ──► Auto-Deploy        |
+-----------------------------------------+-----------------------------------------+
                                          |
                     +--------------------+--------------------+
                     |                                         |
                     v                                         v
+-----------------------------------------+ +---------------------------------------+
|           FRONTEND HOSTING              | |           BACKEND HOSTING             |
|   Vercel / Netlify                      | |   Render / Railway / Docker Container |
|   Build: `npm run build`                | |   Start: `uvicorn app.main:app`       |
+-----------------------------------------+ +---------------------------------------+
```

- **Frontend Deployment:** Vercel (Single-Page Application deployment targeting `dist/`).
- **Backend Deployment:** Render / Railway / Docker Compose running FastAPI + Uvicorn server.
- **Persistent Storage:** SQLite DB (`civicflow.db`) and ChromaDB directory (`chroma_db/`) mounted on persistent cloud volumes.

---

## 16. Success Metrics & Performance KPIs

| Metric | Target Goal | Measurement Method |
| :--- | :--- | :--- |
| **Department Routing Accuracy** | `> 95%` | Automated evaluation against ground-truth dataset |
| **Pipeline Triage Speed** | `< 2.5s` Cold / `< 1.2s` Warm | Server-side execution timestamps |
| **SLA Resolution Turnaround** | `30% Reduction` | Historical SQLite resolution timestamp delta |
| **RAG Hallucination Rate** | `0%` Grounded | Vector citation check against ChromaDB documents |
| **API Gateway Availability** | `99.9% Uptime` | Production uptime monitoring |

---

## 17. Project Timeline & Implementation Milestones

```
+-----------------------------------------------------------------------------------+
| Phase 1 (Weeks 1-4): Foundation & Core Agent Gateway                              |
| - FastAPI API Gateway setup & SQLite ORM database schema definition               |
| - Google ADK Planner Agent & Base Agent class implementation                      |
+-----------------------------------------------------------------------------------+
| Phase 2 (Weeks 5-8): Multimodal AI, RAG & MCP Integration                         |
| - Google Gemini 2.5 Flash Vision Agent integration (`google-genai`)               |
| - ChromaDB vector document ingestion (`app/rag/ingest.py`) & retriever            |
| - MCP Tool Server bindings (`app/tools/agent_tools.py`)                           |
+-----------------------------------------------------------------------------------+
| Phase 3 (Weeks 9-12): Frontend, Analytics & City Pilot                            |
| - Citizen Portal & Admin Officer Dashboard with Leaflet map overlays              |
| - Live Reasoning Drawer component & WebSockets live event broadcast              |
| - Vellore Corporation Wards 1-5 pilot verification & integration test suite       |
+-----------------------------------------------------------------------------------+
```

---

## 18. Risk Management & Open Questions

| Risk / Open Question | Severity | Mitigation Strategy |
| :--- | :---: | :--- |
| **Gemini API Rate Limiting** | Medium | Built-in heuristic rule engine fallback inside `analyze_image_tool`. |
| **SMTP Delivery Failure** | Low | Non-daemon background thread dispatch with `RECORDED_IN_DB_SIMULATED` fallback. |
| **LLM Hallucination in Policy Answers** | High | Strict RAG grounding in ChromaDB; response generation restricted to retrieved document context. |
| **Offline Field Worker Connectivity** | Medium | Progressive Web App (PWA) local caching support planned for Phase 4. |

---

## 19. Future Scope & Roadmap

1. **PostGIS Geospatial Engine:** Migration from SQLite text-matching to PostgreSQL + PostGIS for native spatial polygon boundary intersections.
2. **Field Worker Mobile Application:** React Native mobile app enabling field crews to capture post-repair completion photos.
3. **Multilingual Regional Voice AI:** Support for Tamil, Hindi, and Telugu real-time voice prompt processing.
4. **IoT Smart City Sensor Hooks:** Direct integration of smart garbage bin ultrasonic fill sensors into the Planner Agent queue.
