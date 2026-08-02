# CivicFlow AI - System Workflow & Lifecycle 🔄

> **Detailed Complaint Lifecycle & Multi-Agent Execution Flow for Google AI Agent Builder Series 2026 National Finale.**

---

## 1. Complete Complaint Lifecycle Overview

The lifecycle of a civic complaint in CivicFlow AI moves seamlessly through **8 autonomous processing steps** followed by a 3-stage municipal officer resolution workflow:

```
[Citizen Input: Text / Photo / Voice]
                  │
                  ▼
         1. Workflow Planning (Planner Agent)
                  │
                  ▼
         2. Visual Inspection (Vision Agent / Gemini 2.5)
                  │
                  ▼
         3. Location Geocoding & Ward Identifier (Location Agent)
                  │
                  ▼
         4. RAG Bylaw & SLA Search (Knowledge Agent)
                  │
                  ▼
         5. Department Routing & Priority Matrix (Routing Agent)
                  │
                  ▼
         5.5. Semantic Duplicate Detection Check
                  │
                  ▼
         6. Database Registration & Audit Log (Complaint Agent) ──► Generates #CF-2026-XXXX
                  │
                  ▼
         7. Notification & WebSocket Dispatch (Notification Agent)
                  │
                  ▼
         8. Municipal Analytics & Heatmap Sync (Analytics Agent)
                  │
                  ▼
     +-----------------------------------------+
     |       MUNICIPAL OFFICER RESOLUTION      |
     |                                         |
     |   [Submitted] ➔ [In Progress] ➔ [Resolved] |
     +-----------------------------------------+
```

---

## 2. Step-by-Step Multi-Agent Pipeline Trace

### Step 1: Workflow Planning (Planner Agent)
- **Action:** Receives raw REST payload from `/api/v1/complaints/submit`.
- **Reasoning:** Parses prompt, category hints, image data, and user coordinates to construct the 8-step pipeline execution plan.

### Step 2: Visual Inspection (Vision Agent)
- **Action:** Sends visual payload (Base64 or URL) to Google Gemini 2.5 Flash Vision.
- **Output:** Returns detected category (`Pothole / Road Damage`), severity rating (`HIGH`), confidence (`96%`), and visual labels.

### Step 3: Location Geocoding & Ward Identifier (Location Agent)
- **Action:** Analyzes raw address strings and GPS coordinates.
- **Output:** Maps location to official ward (e.g., `Ward 2 - Sathuvachari (Vellore)`) with formatted street address and landmark.

### Step 4: Grounded Bylaw & Policy Search (Knowledge Agent)
- **Action:** Queries ChromaDB vector database using semantic similarity search.
- **Output:** Retrieves grounded municipal bylaws, maximum SLA resolution windows, and emergency escalation contacts.

### Step 5: Department Routing & Priority Matrix (Routing Agent)
- **Action:** Cross-references category and severity against departmental jurisdiction rules.
- **Output:** Assigns responsible department (`Roads & Infrastructure Dept`, Code: `ROAD`), SLA target (`24 Hours`), and priority (`High`).

### Step 5.5: Semantic Duplicate Detection Check
- **Action:** Queries active non-resolved complaints in the target ward for matching categories.
- **Branch A (Duplicate Found):** Merges report under active ticket `#CF-2026-XXXX`, increments ticket priority, and logs audit trail.
- **Branch B (Unique Complaint):** Proceeds to new ticket creation.

### Step 6: Database Registration & Audit Log (Complaint Agent)
- **Action:** Performs SQLite database transaction via SQLAlchemy ORM.
- **Output:** Generates unique ID `#CF-2026-XXXX`, assigns available ward field worker (`Worker: Officer Suresh`), stores image metadata, and appends status log entry.

### Step 7: Notification & WebSocket Broadcast (Notification Agent)
- **Action:** Formulates confirmation email and dispatches via SMTP.
- **Broadcast:** Pushes `NEW_COMPLAINT` WebSocket event payload to connected frontend clients.

### Step 8: Municipal Analytics & Heatmap Sync (Analytics Agent)
- **Action:** Re-aggregates city-wide KPIs, ward complaint density statistics, and department performance indicators.

---

## 3. Department Officer Status Transition Lifecycle

Once a complaint is registered, department officers manage ticket resolution through the Admin Dashboard:

```
+------------------+         Assign Field Worker         +------------------+
|    SUBMITTED     |  -------------------------------->  |   IN PROGRESS    |
| (Initial Ticket) |                                     | (Work Underway)  |
+------------------+                                     +--------+---------+
                                                                  |
                                                                  | Site Inspection & Repair Complete
                                                                  v
                                                         +------------------+
                                                         |     RESOLVED     |
                                                         | (Citizen Alerted)|
                                                         +------------------+
```

1. **Submitted (`submitted`):** Default state upon registration by Planner Agent.
2. **In Progress (`in_progress`):** Officer assigns a field crew or updates status notes. WebSocket broadcasts `STATUS_UPDATE`.
3. **Resolved (`resolved`):** Work completed. Timestamp recorded in `resolved_at`, citizen notified via email, and complaint marked resolved on map.
