# CivicFlow AI - Interactive Demo Script & Evaluator Guide 🎬

> **Step-by-Step Evaluator Walkthrough Guide for Dr. Agent (Google AI Agent Builder Series 2026 National Finale).**

---

## 🔗 Official Project Links

- 🌐 **Live Web Application:** [civic-flow-ai-six.vercel.app](https://civic-flow-ai-six.vercel.app/)
- 📹 **Demo Video (Google Drive):** [Watch Demo Video](https://drive.google.com/file/d/1VtOX-DWCmuTTR1iZ7ERY6RI3FBQtrqCR/view)
- 🐙 **GitHub Repository:** [Prakashsuriya/CivicFlow-AI](https://github.com/Prakashsuriya/CivicFlow-AI)

---

## 🎯 Evaluator Objectives

This demo walkthrough guides evaluators through testing all 5 core modules of CivicFlow AI:
1. Multimodal complaint submission & Gemini 2.5 Vision analysis.
2. Autonomous Agent Reasoning Drawer inspection.
3. Grounded municipal RAG vector search.
4. Admin officer queue & status transition workflow.
5. Interactive Leaflet ward heatmap and analytics.

---

## 🚀 Scenario 1: Submitting a Multimodal Complaint

### Step 1: Open Citizen Portal
- Open web browser to **[Live Application](https://civic-flow-ai-six.vercel.app/)** (or local instance `http://localhost:5173`).
- Observe the clean HSL dark mode interface and hero header.

### Step 2: Input Test Complaint
- **Category Selection:** Select `Road damage`.
- **Text Prompt:** Enter `"Deep hazardous pothole filled with stagnant rainwater near Katpadi junction."`
- **Location Address:** Enter `"Katpadi Junction, Vellore"`.
- **Photo Upload:** Upload a sample photo or use default attachment.
- **Click:** `Submit Complaint with AI Agent`.

### Step 3: Observe Autonomous Reasoning Trace
- Click open the **Agent Reasoning Drawer** on the right side of the screen.
- Observe sub-second execution logs for all 8 agents:
  1. `Planner Agent` initializing pipeline.
  2. `Vision Agent` detecting pothole hazard (Confidence: `96%`, Severity: `HIGH`).
  3. `Location Agent` resolving ward (`Ward 1 - Katpadi (Vellore)`).
  4. `Knowledge Agent` retrieving 24-hour SLA blueprint from ChromaDB.
  5. `Routing Agent` assigning ticket to `Roads & Infrastructure Dept`.
  6. `Complaint Agent` generating ID `#CF-2026-XXXX`.
  7. `Notification Agent` dispatching email alert.
  8. `Analytics Agent` updating city heatmap.

---

## 🚀 Scenario 2: RAG Policy Query Test

### Step 1: Open Municipal Knowledge Base
- Navigate to `https://civic-flow-ai-six.vercel.app/knowledge` (or click **Knowledge Base** in navbar).
- Enter query: `"What is the resolution SLA for water pipeline leaks?"`
- Click `Search Bylaws`.
- Observe grounded citation excerpts returned directly from ChromaDB vector store.

---

## 🚀 Scenario 3: Admin Officer Resolution Workflow

### Step 1: Open Officer Dashboard
- Navigate to `https://civic-flow-ai-six.vercel.app/admin` (or click **Admin Queue** in navbar).
- Observe newly created ticket `#CF-2026-XXXX` at the top of the queue.

### Step 2: Update Ticket Status
- Select status dropdown: Change `Submitted` to `In Progress`.
- Enter notes: `"Road repair team dispatched with cold-mix asphalt patch."`
- Click `Update Status`.
- Observe instant WebSocket broadcast notification badge.
