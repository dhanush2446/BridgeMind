# BridgeMind: Universal Cross-Domain Analogy Engine

> **BridgeMind** is an advanced AI system for automated cross-domain analogical reasoning, leveraging **Contrastive Structural Embeddings (CSE)**, **Graph Isomorphism Networks (GIN)**, **FAISS Sub-millisecond Vector Search**, and **Inverse Domain Distance Weighting (IDDW)**.

---

## 🌟 Executive Abstract

**BridgeMind** bridges disparate scientific, engineering, biological, and socio-economic fields by uncovering invariant structural patterns shared across domains. Instead of matching superficial keywords, BridgeMind extracts an **8-Slot Structural Schema** (*Entity, Constraint, Goal, Flow, Bottleneck, Feedback, Dependency, Risk*) from natural language problem statements, encodes them into dense 384-dimensional vector spaces, builds directed dependency multi-graphs, and scores cross-domain structural isomorphism.

For full architectural documentation, mathematical formulations, and detailed pipeline specifications, please see [DOCUMENTATION.md](file:///c:/Users/dhanush%20varma/OneDrive/Desktop/projs/BridgeMind/DOCUMENTATION.md).

---

## 🚀 Quick Start

### 1. Python ML Core Server
```bash
cd python_backend
pip install -r requirements.txt
python main.py
```
*Backend runs on `http://localhost:8000`*

### 2. Next.js Frontend Application
```bash
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Framer Motion, Three.js / WebGL
- **Database**: SQLite3 (`better-sqlite3`), WAL Mode, FTS5 Full-Text Search
- **ML Backend**: Python 3.11, FastAPI, Uvicorn, PyTorch, SentenceTransformers (`all-MiniLM-L6-v2`), NetworkX, FAISS
