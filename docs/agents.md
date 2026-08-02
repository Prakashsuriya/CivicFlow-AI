# CivicFlow AI - Multi-Agent Swarm Specification 🤖🐝

> **Exhaustive Technical Breakdown of the 8 Autonomous AI Agents (Google ADK Architecture).**

---

## Agent Swarm Architecture Overview

CivicFlow AI utilizes a hierarchical multi-agent swarm coordinated by the **Planner Agent**. Each sub-agent is a specialized domain expert with strict input schemas, execution boundaries, and explicit tool bindings.

```
                     +---------------------------+
                     |   🎯 1. PLANNER AGENT     |
                     |  (Lead Orchestrator ADK)  |
                     +-------------+-------------+
                                   |
         +-------------------------+-------------------------+
         |                         |                         |
         v                         v                         v
+------------------+     +------------------+     +------------------+
|  👁️ 2. VISION    |     | 📍 3. LOCATION   |     | 📚 4. KNOWLEDGE  |
|      AGENT       |     |      AGENT       |     |      AGENT       |
+------------------+     +------------------+     +------------------+
         |                         |                         |
         +-------------------------+-------------------------+
                                   |
         +-------------------------+-------------------------+
         |                         |                         |
         v                         v                         v
+------------------+     +------------------+     +------------------+
|  🔀 5. ROUTING   |     |  📝 6. COMPLAINT |     |  🔔 7. NOTIF.    |
|      AGENT       |     |      AGENT       |     |      AGENT       |
+------------------+     +------------------+     +------------------+
                                   |
                                   v
                         +------------------+
                         |  📊 8. ANALYTICS |
                         |      AGENT       |
                         +------------------+
```

---

## 1. 🎯 Planner Agent (Lead Orchestrator)

- **Purpose:** Acts as the chief cognitive orchestrator. Decomposes unstructured citizen requests, delegates tasks to specialized sub-agents, records step-by-step reasoning traces, and synthesizes citizen responses.
- **Inputs:** `prompt` (string), `category` (optional string), `image_url` (optional string), `address` (optional string), `latitude` (optional float), `longitude` (optional float), `email` (string).
- **Outputs:** `complaint_id` (string), `summary` (markdown string), `reasoning_trace` (array of step dictionaries with sub-second timestamps), `is_duplicate` (boolean), `merged_ticket_id` (optional string).
- **Responsibilities:**
  - Initialize the 8-step pipeline execution state.
  - Coordinate execution ordering across all sub-agents.
  - Evaluate duplicate detection signals before database commit.
  - Format user-facing response markdown summary.
- **Interaction with Other Agents:** Invokes agents 2 through 8 sequentially, passing outputs from upstream agents as context inputs to downstream agents.

---

## 2. 👁️ Vision Agent (Multimodal Visual Defect Inspection)

- **Purpose:** Inspects uploaded citizen photo assets to detect visual hazards, extract issue labels, and calculate confidence scores.
- **Underlying Engine:** Google Gemini 2.5 Flash Vision (`google-genai` SDK) with heuristic rule fallback.
- **Inputs:** `image_url` or `image_path` (string), `prompt` (string), `category` (optional string hint).
- **Outputs:** `analysis` object containing `issue_type` (string), `detected_labels` (array of strings), `severity` (`low`, `medium`, `high`, `critical`), `confidence` (float e.g. `0.96`), `description` (detailed evaluation text).
- **Responsibilities:**
  - Decode base64 image data or fetch external image URL.
  - Prompt Gemini 2.5 Vision with structured JSON schema constraints.
  - Execute fallback heuristic if API key is absent or unreachable.
- **Interaction with Other Agents:** Receives raw image input from Planner Agent; passes detected `issue_type`, `severity`, and visual `description` to Location, Knowledge, and Routing agents.

---

## 3. 📍 Location Agent (Geocoder & Ward Identifier)

- **Purpose:** Converts raw address text or GPS coordinates into official municipal ward boundaries in Vellore Corporation, Tamil Nadu.
- **Inputs:** `address` (string), `latitude` (optional float), `longitude` (optional float).
- **Outputs:** `location` object containing `address` (formatted string), `latitude` (float), `longitude` (float), `ward` (string e.g. `Ward 2 - Sathuvachari (Vellore)`), `nearest_landmark` (string).
- **Responsibilities:**
  - Execute locality name matching (Katpadi, Sathuvachari, Gandhinagar, Bagayam/CMC, Fort Round).
  - Fallback to spatial latitude/longitude coordinate bounds.
  - Format location string with regional corporation tags.
- **Interaction with Other Agents:** Invoked by Planner Agent after Vision Agent; passes resolved `ward` and coordinates to Complaint and Duplicate Detection modules.

---

## 4. 📚 Knowledge Agent (Municipal Bylaw & RAG Engine)

- **Purpose:** Queries vector database (ChromaDB) to ground agent decisions in official municipal policy bylaws, resolution SLA terms, and public welfare schemes.
- **Underlying Engine:** ChromaDB Persistent Vector DB + SentenceTransformers.
- **Inputs:** `query` (string e.g., `"Water leakage resolution SLA rules Vellore"`).
- **Outputs:** `retrieved_docs` (array of matching document chunks), `summary` (formatted citation string).
- **Responsibilities:**
  - Compute query embedding vector.
  - Perform top-K nearest-neighbor cosine similarity search in ChromaDB.
  - Extract grounded SLA targets and policy citations.
- **Interaction with Other Agents:** Triggered by Planner Agent using category metadata from Vision Agent; passes policy findings to Routing Agent.

---

## 5. 🔀 Routing Agent (Department Classifier & Priority Matrix)

- **Purpose:** Determines responsible municipal department and calculates SLA resolution timeline based on issue severity.
- **Inputs:** `category` (string), `severity` (string).
- **Outputs:** `routing` object containing `dept_code` (`SAN`, `ROAD`, `WAT`, `ELEC`, `PRK`, `TRF`, `ENV`, `ADM`), `dept_name` (string), `sla_hours` (integer e.g. `24`), `priority` (string).
- **Responsibilities:**
  - Evaluate issue against 18-category departmental routing matrix.
  - Apply critical severity acceleration (reduces standard SLA by 50%).
- **Interaction with Other Agents:** Receives classification from Vision & Knowledge agents; passes `dept_code` and `sla_hours` to Complaint Agent.

---

## 6. 📝 Complaint Agent (Database Lifecycle & Tracking Manager)

- **Purpose:** Manages relational database transactions, generates ticket IDs, assigns ward field workers, and maintains audit trail logs.
- **Underlying Engine:** SQLite Database via SQLAlchemy ORM.
- **Inputs:** `title`, `description`, `category`, `severity`, `dept_code`, `address`, `latitude`, `longitude`, `ward`, `sla_hours`, `image_url`, `detected_labels`.
- **Outputs:** `complaint` object containing `complaint_id` (`#CF-2026-XXXX`), `status` (`submitted`), `department`, `assigned_worker`, `created_at`.
- **Responsibilities:**
  - Execute duplicate detection check prior to ticket creation.
  - Auto-assign available ward field worker.
  - Persist ticket and initial status log entry.
- **Interaction with Other Agents:** Receives consolidated data from all upstream agents; returns `complaint_id` to Notification Agent.

---

## 7. 🔔 Notification Agent (Multi-Channel Dispatcher)

- **Purpose:** Dispatches confirmation emails to citizens via SMTP and triggers WebSocket broadcasts to officer dashboards.
- **Underlying Engine:** Python `smtplib` + non-daemon background thread fallback + WebSocket Manager.
- **Inputs:** `complaint_id`, `recipient_email`, `dept_name`, `sla_hours`.
- **Outputs:** `notification` status object (`SENT_VIA_SMTP` or `RECORDED_IN_DB_SIMULATED`).
- **Responsibilities:**
  - Render HTML email template with ticket tracking details.
  - Execute asynchronous SMTP dispatch with timeout handling.
  - Broadcast `NEW_COMPLAINT` event via WebSockets.
- **Interaction with Other Agents:** Invoked by Planner Agent immediately following Complaint Agent DB commit.

---

## 8. 📊 Analytics Agent (KPIs & Heatmap Computing Specialist)

- **Purpose:** Aggregates real-time city-wide resolution metrics, ward density heatmaps, and category distribution statistics.
- **Inputs:** None (queries live database state).
- **Outputs:** `metrics` object containing `total`, `resolved`, `in_progress`, `submitted`, `resolution_rate_pct`, `ward_distribution`, `category_distribution`.
- **Responsibilities:**
  - Compute live aggregate database counts.
  - Re-calculate city-wide resolution efficiency percentage.
- **Interaction with Other Agents:** Final agent in Planner pipeline; updates dashboard analytics payload.
