# AI Cross-Language Dependency Mapper

## Overview
AI Cross-Language Dependency Mapper is a hackathon project for visualizing how changes ripple across a polyglot codebase.

It combines:
- AST/parser work for Python, JavaScript, and SQL
- a FastAPI backend for graph delivery and impact analysis
- a React + Cytoscape frontend for interactive graph exploration
- an AI explanation layer for demo-friendly refactor suggestions

The core demo story is simple:
- frontend symbols call backend APIs
- backend services touch auth, cache, and database layers
- one change can create a visible blast radius across the stack

---

## Current Status

### Working now
- FastAPI backend with `GET /health`, `GET /graph`, `POST /graph/load`, and `POST /impact`
- WebSocket endpoint at `/ws`
- normalized graph schema with Pydantic validation
- demo graph dataset in `backend/data/demo_graph.json`
- React frontend connected to backend APIs
- Cytoscape dependency graph with node selection and blast-radius highlighting
- backend-driven impact analysis flow
- AI explanation panel with cached demo-safe responses

### Still in progress
- parser output to normalized graph pipeline
- real Groq/Claude integration
- bigger demo graph target of ~30 nodes and ~60 edges
- presentation mode and richer dashboard widgets
- Docker setup

---

## Architecture
```text
Repo / Demo Input
  ->
Parser + Resolver
  ->
Normalized Graph JSON
  ->
FastAPI Backend
  -> /graph
  -> /impact
  -> /ai/explain
  -> /ws
  ->
React Frontend
  ->
Graph View + Impact Simulation + AI Explanation
```

---

## Project Structure
```text
backend/
  app/
    main.py
    routers/
    schemas/
    services/
  ast_parser/
  dependency_graph/
  dependency_agent/
  repo_scanner/
  data/
    demo_graph.json

FRONTEND/
  src/
    api/
    components/
    data/
    types.ts
```

Useful docs:
- [integration_guide.md](/c:/Users/riyas/OneDrive/Documents/sies_things/hackathons/AI-Cross-Language-Dependency-Mapper/integration_guide.md)
- [TODO.md](/c:/Users/riyas/OneDrive/Documents/sies_things/hackathons/AI-Cross-Language-Dependency-Mapper/TODO.md)

---

## API Endpoints

### `GET /`
Basic backend sanity check.

### `GET /health`
Returns backend readiness plus graph module status.

### `GET /graph`
Returns the normalized graph payload used by the frontend.

### `POST /graph/load`
Loads a graph from file or direct payload.

### `POST /impact`
Runs BFS/DFS-style blast-radius analysis from a selected node.

### `POST /ai/explain`
Returns a cached AI-style explanation and safe-refactor suggestion for a node.

### `WS /ws`
Push channel for graph and impact events.

---

## Local Run

### Backend
```bash
cd backend
pip install -r requirements.txt
python app/main.py
```

Backend default:
- `http://127.0.0.1:8000`

### Frontend
```bash
cd FRONTEND
npm install
npm run dev
```

Frontend default:
- `http://localhost:5173`

---

## Environment Variables

### Backend
```env
BACKEND_HOST=127.0.0.1
BACKEND_PORT=8000
GRAPH_DATA_PATH=backend/data/demo_graph.json
AI_PROVIDER=groq
AI_API_KEY=your_key_here
DEMO_MODE=true
WS_PATH=/ws
```

### Frontend
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_WS_URL=ws://127.0.0.1:8000/ws
VITE_DEMO_MODE=true
```

---

## Demo Flow
1. Load the graph from the backend.
2. Search for a key symbol such as `get_user`.
3. Click the node in the graph.
4. Run impact analysis to highlight the blast radius.
5. Open the AI explanation in the details panel.
6. Explain the cross-layer ripple across frontend, backend, DB, cache, and env.

---

## Verification Notes
- Backend compile verification passed with `python -m compileall backend/app`
- Graph service load verification passed
- Impact service verification passed
- Frontend TypeScript verification is currently blocked in this environment by a Windows `EPERM` Node path-resolution issue, so that still needs one clean run on the local machine

---

## Next Priorities
- connect real parser output to the shared graph contract
- expand the demo graph
- integrate real AI provider calls
- add dashboard polish and presentation mode
- stabilize the final demo path
