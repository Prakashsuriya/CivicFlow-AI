# CivicFlow AI - REST API & WebSocket Documentation 🔌

> **Complete OpenAPI Specification for CivicFlow AI Backend (FastAPI).**

**Base URL:** `http://localhost:8000/api/v1`  
**Swagger UI:** `http://localhost:8000/docs`  
**ReDoc:** `http://localhost:8000/redoc`  

---

## 1. Complaint Management Endpoints (`/complaints`)

### 1.1 Submit Civic Complaint (Multi-Agent Pipeline)

- **Endpoint:** `POST /api/v1/complaints/submit`
- **Description:** Triggers the 8-agent autonomous pipeline (Vision, Location, RAG, Routing, DB, Notification, Analytics).

#### Request Body Schema (`application/json`)
```json
{
  "prompt": "Large pothole overflowing with rainwater near Katpadi junction",
  "category": "Road damage",
  "image_url": "data:image/jpeg;base64,...",
  "address": "Katpadi Junction, Vellore",
  "latitude": 12.9698,
  "longitude": 79.1378,
  "email": "citizen@example.com"
}
```

#### Response Schema (`200 OK`)
```json
{
  "success": true,
  "complaint_id": "CF-2026-4821",
  "summary": "### 🚀 Issue Successfully Processed & Registered in Vellore, TN\n- **Complaint Tracking ID:** `CF-2026-4821`...",
  "category": "Road damage",
  "severity": "high",
  "confidence": 0.96,
  "ward": "Ward 1 - Katpadi (Vellore)",
  "department": "Roads & Infrastructure Dept",
  "sla_hours": 24,
  "is_duplicate": false,
  "merged_ticket_id": null,
  "reasoning_trace": [
    {
      "step": "1. Plan Workflow",
      "agent": "Planner Agent",
      "thought": "Received request...",
      "action": "Decompose pipeline...",
      "result": "Pipeline initialized",
      "timestamp": 0.01
    }
  ]
}
```

---

### 1.2 Get Filtered Complaints List

- **Endpoint:** `GET /api/v1/complaints/`
- **Query Parameters:**
  - `status` *(optional, string)*: Filter by `submitted`, `in_progress`, `resolved`, `rejected`.
  - `ward` *(optional, string)*: Filter by ward name.
  - `category` *(optional, string)*: Filter by civic category.

#### Response Schema (`200 OK`)
```json
{
  "complaints": [
    {
      "id": "CF-2026-4821",
      "title": "Road damage Report - Ward 1 - Katpadi (Vellore)",
      "description": "Large pothole overflowing with rainwater",
      "category": "Road damage",
      "severity": "high",
      "status": "submitted",
      "department_name": "Roads & Infrastructure Dept",
      "assigned_worker_name": "Officer Ramesh",
      "address": "Katpadi Junction, Vellore",
      "latitude": 12.9698,
      "longitude": 79.1378,
      "ward": "Ward 1 - Katpadi (Vellore)",
      "estimated_sla_hours": 24,
      "created_at": "2026-08-02T18:00:00.000Z",
      "resolved_at": null
    }
  ]
}
```

---

### 1.3 Get Complaint Detail & Audit Trail

- **Endpoint:** `GET /api/v1/complaints/{complaint_id}`
- **Path Parameter:** `complaint_id` *(string)* e.g. `CF-2026-4821`

#### Response Schema (`200 OK`)
```json
{
  "id": "CF-2026-4821",
  "title": "Road damage Report",
  "description": "Large pothole overflowing with rainwater",
  "category": "Road damage",
  "severity": "high",
  "status": "submitted",
  "department": "Roads & Infrastructure Dept",
  "assigned_worker": "Officer Ramesh",
  "address": "Katpadi Junction, Vellore",
  "latitude": 12.9698,
  "longitude": 79.1378,
  "ward": "Ward 1 - Katpadi (Vellore)",
  "estimated_sla_hours": 24,
  "created_at": "2026-08-02T18:00:00",
  "resolved_at": null,
  "images": [
    {
      "id": "img-uuid",
      "url": "data:image/jpeg;base64,...",
      "labels": "Pothole, Water accumulation"
    }
  ],
  "status_history": [
    {
      "status_from": null,
      "status_to": "submitted",
      "updated_by": "PlannerAgent",
      "reasoning_notes": "Autonomous Planner registered complaint.",
      "timestamp": "2026-08-02T18:00:00"
    }
  ]
}
```

---

### 1.4 Update Complaint Status

- **Endpoint:** `PUT /api/v1/complaints/{complaint_id}/status`

#### Request Body Schema (`application/json`)
```json
{
  "status": "resolved",
  "reasoning_notes": "Road patching completed by Ward 1 maintenance team.",
  "updated_by": "Officer Suresh"
}
```

#### Response Schema (`200 OK`)
```json
{
  "message": "Status updated successfully",
  "complaint_id": "CF-2026-4821",
  "new_status": "resolved"
}
```

---

## 2. Analytics Endpoints (`/analytics`)

### 2.1 Get Executive Dashboard KPI Metrics
- **Endpoint:** `GET /api/v1/analytics/dashboard`
- **Response:** Returns total complaints count, status breakdown, resolution percentage rate, average SLA resolution hours, and ward distribution.

### 2.2 Get Ward Complaint Density Heatmap
- **Endpoint:** `GET /api/v1/analytics/heatmap`
- **Response:** Returns ward coordinate lists with complaint counts and severity scores formatted for Leaflet heat layers.

---

## 3. RAG Knowledge Endpoints (`/rag`)

### 3.1 Search Municipal Bylaws & Guidelines
- **Endpoint:** `POST /api/v1/rag/search`
- **Request:** `{"query": "Water supply complaint SLA rules"}`
- **Response:** Returns top matching grounded policy passages from ChromaDB vector store.

---

## 4. WebSockets Endpoint (`/ws/feed`)

- **URL:** `ws://localhost:8000/ws/feed`
- **Protocol:** WebSockets
- **Event Types:**
  - `NEW_COMPLAINT`: Emitted when a new complaint is processed.
  - `STATUS_UPDATE`: Emitted when complaint status is changed.
  - `PONG`: Heartbeat response to client text messages.
