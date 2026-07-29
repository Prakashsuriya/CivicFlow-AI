# CivicFlow AI 🏛️🤖

> **An Autonomous Municipal AI Operating System that helps citizens report civic issues, coordinates government departments, automates complaint resolution, and provides intelligent civic assistance.**

[![Google AI Agent Builder Series 2026](https://img.shields.io/badge/Hackathon-Google%20AI%20Agent%20Builder%202026-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![Built with Google ADK](https://img.shields.io/badge/AI%20Framework-Google%20ADK-34A853?style=for-the-badge&logo=googlecloud&logoColor=white)](https://github.com/google/adk)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React + Vite](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://vitejs.dev/)

---

## 🌟 Project Overview

**CivicFlow AI** shifts municipal governance from static, confusing chatbots to an **autonomous AI employee**. Citizens can report issues using text, voice, or photo uploads. The platform autonomously understands the problem using multi-modal AI, geocodes the location, queries official municipal bylaws using RAG vector search, routes to responsible departments, dispatches field workers, and notifies citizens in real time.

Default regional deployment: **Vellore Corporation, Tamil Nadu** (Sathuvachari, Katpadi, Gandhinagar, Bagayam / CMC, Fort Round).

---

## 🤖 Multi-Agent Architecture (Google ADK)

The platform is powered by **8 specialized AI agents** orchestrated by the Google Agent Development Kit (ADK) Planner Agent:

```mermaid
graph TD
    subgraph Client Layer
        CitizenUI["Citizen Portal (React + Leaflet)"]
        AdminUI["Department Officer Dashboard (React + Recharts)"]
    end

    subgraph API Gateway
        FastAPI["FastAPI Gateway (/api/v1)"]
        WS["WebSocket Live Event Feed"]
    end

    subgraph Multi-Agent Orchestrator (Google ADK)
        Planner["🎯 Planner Agent (ADK Lead)"]
        Vision["👁️ Vision Agent (Gemini 2.5 Vision)"]
        Location["📍 Location Agent (Geocoder & Ward Map)"]
        Knowledge["📚 Knowledge Agent (ChromaDB RAG)"]
        Routing["🔀 Routing Agent (Department Matrix)"]
        Complaint["📝 Complaint Agent (SQLite Lifecycle)"]
        Notification["🔔 Notification Agent (Alert Dispatcher)"]
        Analytics["📊 Analytics Agent (KPIs & Heatmap)"]
    end

    subgraph Storage Layer
        SQLite[("SQLite Database")]
        ChromaDB[("ChromaDB Vector Store")]
    end

    CitizenUI -->|Submit Report / Photo| FastAPI
    AdminUI -->|Manage Complaints / Status| FastAPI
    FastAPI --> Planner

    Planner --> Vision
    Planner --> Location
    Planner --> Knowledge
    Planner --> Routing
    Planner --> Complaint
    Planner --> Notification
    Planner --> Analytics

    Knowledge <--> ChromaDB
    Complaint <--> SQLite
    FastAPI --> WS
```

### Agent Roles & Tool Bindings

1. **🎯 Planner Agent (Chief Orchestrator):** Manages multi-agent workflow execution, logs sub-second step-by-step reasoning traces, and synthesizes citizen responses.
2. **👁️ Vision Agent (Google Gemini 2.5 Vision):** Inspects uploaded photos to detect visual issue signatures, rates severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), and calculates accuracy confidence scores (e.g. `96%`).
3. **📍 Location Agent:** Maps area details and spatial coordinates to official municipal wards in Vellore, Tamil Nadu.
4. **📚 Knowledge Agent (ChromaDB Vector RAG):** Queries grounded municipal policy documents, resolution SLAs, disaster hotlines, and public welfare schemes with zero hallucination.
5. **🔀 Routing Agent:** Automatically determines department jurisdiction (Sanitation, Roads, Water, Electrical, Parks, Traffic, Environment) and resolution SLA targets.
6. **📝 Complaint Agent:** Generates unique tracking IDs (`#CF-2026-XXXX`), assigns ward field officers, and maintains full audit history logs.
7. **🔔 Notification Agent:** Dispatches confirmation emails and pushes live updates to officer dashboards.
8. **📊 Analytics Agent:** Computes city-wide resolution efficiency rates, category distributions, and ward density heatmaps.

---

## ✨ Key Features & Capabilities

- **18 Supported Civic Categories:** Dropdown menu covering Garbage, Road damage, Streetlights, Water supply, Drainage, Illegal parking, Noise pollution, Air pollution, Flooding, Tree fallen, Dead animals, Traffic signal, Broken park equipment, Public toilets, Government schemes, Emergency info, Health assistance, and Lost property.
- **Real Photo File Upload & Inspection:** Drag-and-drop photo attachment evaluated live by Google Gemini 2.5 Multimodal Vision AI.
- **Autonomous Reasoning Drawer:** Visual accordion displaying real-time agent thought processes, tool calls, and execution timestamps.
- **Interactive Ward Heatmap & Maps:** Leaflet.js / OpenStreetMap visualization showing complaint density and color-coded severity markers across Vellore.
- **Admin & Department Queue:** Municipal officer dashboard to track complaints, assign field workers, and transition resolution lifecycle (`Submitted` ➔ `In Progress` ➔ `Resolved`).
- **Fully Responsive Design:** Optimized across Desktop, Tablet (768px), and Mobile (360px) devices.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, Vanilla CSS Design System, Leaflet.js, Recharts, Lucide Icons |
| **Backend** | FastAPI, Uvicorn, Python 3.10+ |
| **AI Framework** | Google ADK, Google Gemini 2.5 Flash Vision API (`google-genai`) |
| **RAG Vector DB** | ChromaDB Persistent Storage |
| **Database** | SQLite + SQLAlchemy ORM |
| **Maps & Geo** | Leaflet + OpenStreetMap (Vellore, Tamil Nadu) |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Prakashsuriya/CivicFlow-AI.git
cd CivicFlow-AI
```

### 2. Backend Setup (FastAPI + ChromaDB)

```bash
cd backend

# Install Python Dependencies
python -m pip install -r requirements.txt

# (Optional) Add your Google AI Studio API Key in backend/.env
# GEMINI_API_KEY=your_gemini_api_key_here

# Initialize Database & Seed Sample Complaints
python -m app.database.init_db

# Ingest Municipal RAG Documents into ChromaDB
python -m app.rag.ingest

# Start Backend Server
python -m uvicorn app.main:app --reload --port 8000
```
> Backend API Swagger documentation will be live at: **http://localhost:8000/docs**

### 3. Frontend Setup (React + Vite)

Open a new terminal window:

```bash
cd frontend

# Install Node Dependencies
npm install

# Start React Vite Dev Server
npm run dev
```
> Web application will be live at: **http://localhost:5173** (or **http://localhost:5174**)

---

## 📂 Project Directory Structure

```
CivicFlow-AI/
├── backend/
│   ├── app/
│   │   ├── agents/               # Google ADK Agent Implementations
│   │   │   ├── base.py
│   │   │   ├── planner_agent.py  # Chief Orchestrator
│   │   │   ├── vision_agent.py   # Gemini 2.5 Vision AI
│   │   │   ├── location_agent.py # Geocoding & Ward Identifier
│   │   │   ├── knowledge_agent.py# RAG Vector Search
│   │   │   ├── routing_agent.py  # Department Classifier
│   │   │   ├── complaint_agent.py# Database Lifecycle
│   │   │   ├── notification_agent.py
│   │   │   └── analytics_agent.py
│   │   ├── api/v1/               # REST API Endpoints & WebSockets
│   │   ├── database/             # SQLAlchemy Models & Seed Script
│   │   ├── rag/                  # ChromaDB Ingestion Engine & Source Docs
│   │   ├── tools/                # ADK Tool Functions & Gemini Bindings
│   │   ├── config.py             # Settings & Environment
│   │   └── main.py               # FastAPI App Entrypoint
│   ├── .env.example
│   ├── requirements.txt
│   └── test_agent.py             # Multi-Agent Verification Test Script
│
└── frontend/
    ├── src/
    │   ├── components/           # Navbar, InteractiveMap, ReasoningDrawer
    │   ├── pages/                # CitizenPortal, AdminDashboard, Analytics, Knowledge, Track
    │   ├── services/             # Axios API Client & WebSockets
    │   ├── App.jsx
    │   ├── index.css             # HSL Dark System & Responsive Styles
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 📜 License

Distributed under the MIT License. Built for the **Google AI Agent Builder Series 2026**.
