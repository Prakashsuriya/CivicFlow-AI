# CivicFlow AI - Production Deployment Guide 🚀

> **Comprehensive Deployment Guide for Frontend, Backend, Database, and AI Services.**

---

## 1. System Requirements & Environment Matrix

| Component | Minimum Specification | Recommended Specification |
| :--- | :--- | :--- |
| **Operating System** | Ubuntu 22.04 LTS / Debian 12 / Windows 11 | Ubuntu 24.04 LTS |
| **Python** | Python 3.10+ | Python 3.11 |
| **Node.js** | Node.js 18.x LTS | Node.js 20.x LTS |
| **RAM** | 4 GB RAM | 8 GB RAM |
| **Disk Space** | 2 GB free disk space | 10 GB SSD |

---

## 2. Environment Variables Specification

Create `.env` file in project root or backend folder:

```env
# Google AI Studio / Gemini API Key (Required for Multimodal Vision AI)
GEMINI_API_KEY=AIzaSy...Your_Gemini_API_Key_Here

# Database Connection URL (SQLite default, or PostgreSQL)
DATABASE_URL=sqlite:///./civicflow.db

# ChromaDB Vector Store Directory
CHROMA_PATH=./chroma_db

# Security & JWT Authentication
JWT_SECRET=supersecretjwtkey_civicflow_2026

# SMTP Settings for Live Email Notifications (Optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

---

## 3. Local Development Setup

### 3.1 Backend Setup (FastAPI + ChromaDB)

```bash
# 1. Navigate to backend
cd backend

# 2. Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate   # Windows PowerShell

# 3. Install dependencies
pip install -r requirements.txt

# 4. Initialize Database & Seed Wards/Workers
python -m app.database.init_db

# 5. Ingest Municipal RAG Documents into ChromaDB
python -m app.rag.ingest

# 6. Start Uvicorn Server
python -m uvicorn app.main:app --reload --port 8000
```
> API available at `http://localhost:8000` | Swagger docs at `http://localhost:8000/docs`

### 3.2 Frontend Setup (React + Vite)

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start Vite dev server
npm run dev
```
> Web Application live at `http://localhost:5173`

---

## 4. Production Containerization (Docker Compose)

Create `docker-compose.yml` in root directory:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - DATABASE_URL=sqlite:////app/data/civicflow.db
      - CHROMA_PATH=/app/data/chroma_db
    volumes:
      - civicflow-data:/app/data
    restart: always

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always

volumes:
  civicflow-data:
```

---

## 5. Cloud Platform Deployment

### 5.1 Frontend (Vercel / Netlify)
1. Import repository into Vercel.
2. Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variable: `VITE_API_BASE_URL=https://your-backend-domain.com/api/v1`

### 5.2 Backend (Railway / Render / Render.com)
1. Deploy as Python / FastAPI Web Service.
2. Root Directory: `backend`
3. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables (`GEMINI_API_KEY`, `DATABASE_URL`, `CHROMA_PATH`).
