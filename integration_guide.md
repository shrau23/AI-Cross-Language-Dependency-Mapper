# Integration Guide

## Goal
This document is the single source of truth for integrating all 5 team members' work into one demo-ready project for the AI Cross-Language Dependency Mapper.

The objective is simple:
- P1 produces a clean dependency graph.
- P2 exposes that graph and impact analysis through FastAPI.
- P3 renders the graph and animations in React.
- P4 adds AI insights and dashboard metrics on top of the same graph.
- P5 owns the demo dataset, integration glue, end-to-end testing, and final demo flow.

If everyone follows the contracts in this guide, integration becomes assembly, not chaos.

---

## High-Level Architecture
```text
Repository / Demo Repo
    ->
P1 Parser + Resolver
    ->
Normalized Graph JSON
    ->
P2 FastAPI Service
    -> REST API
    -> WebSocket events
    ->
P3 React Frontend
    ->
P4 AI Suggestions + Dashboard Widgets
    ->
P5 Demo orchestration, export, rehearsal, stability
```

Core rule: every team member integrates through the same normalized graph model.

---

## Team Ownership

### P1 - Parser / Graph Engine
Owns:
- repo scanning input
- tree-sitter parsing
- symbol extraction
- cross-language edge generation
- graph confidence scoring
- normalized graph JSON output

Delivers:
- `nodes`
- `edges`
- parser metadata
- confidence scores
- optional warnings for unresolved symbols

### P2 - Backend / API
Owns:
- FastAPI app in `backend/app/`
- graph ingestion
- impact analysis
- BFS/DFS traversal
- risk scoring
- WebSocket graph updates
- health and error responses

Delivers:
- REST endpoints
- WebSocket payloads
- impact API response
- stable API contract for P3 and P4

### P3 - Frontend / Graph UX
Owns:
- React app in `FRONTEND/src/`
- Cytoscape graph rendering
- node and edge styling
- blast radius animation
- search panel
- presentation mode

Consumes:
- graph API
- impact API
- live update WebSocket
- dashboard data from P4/P2

### P4 - AI / Dashboard
Owns:
- AI explanation cards
- cached demo prompts/responses
- coupling score dial
- risk heatmap overlay
- language distribution chart

Consumes:
- graph API
- impact API
- selected node/file context

### P5 - Glue / Demo
Owns:
- demo repo JSON
- environment setup
- integration branch
- end-to-end checks
- export flow
- demo script

Consumes and verifies:
- all contracts from P1-P4

---

## Recommended Repo Map
Use this structure consistently so nobody invents their own paths mid-hackathon.

```text
backend/
  app/
    main.py
    routers/
      graph.py
      impact.py
      ai.py
      health.py
    services/
      graph_service.py
      impact_service.py
      websocket_service.py
    schemas/
      graph.py
      impact.py
      ai.py
  ast_parser/
  dependency_graph/
  dependency_agent/
  repo_scanner/
  data/
    demo_graph.json
    cache/

FRONTEND/
  src/
    api/
      client.ts
      graph.ts
      impact.ts
      ai.ts
    components/
    hooks/
    pages/
    types/
    utils/
```

If you do not have these folders yet, create them gradually as integration progresses. Do not scatter contracts across random files.

---

## Exactly What Goes Where
This section is the practical answer to "kya kahan daalna hai".

## Backend folder placement

### `backend/app/main.py`
Yahan sirf app bootstrapping daalo:
- FastAPI app creation
- CORS setup
- router registration
- startup hooks if needed

Is file mein mat daalo:
- parser logic
- graph traversal logic
- AI prompt logic
- big response models

### `backend/app/routers/health.py`
Yahan sirf health and readiness routes daalo:
- `GET /health`
- optional `GET /`
- module readiness checks

Return should include:
- backend running or not
- graph data loaded or not
- AI configured or not

### `backend/app/routers/graph.py`
Yahan graph-related endpoints daalo:
- `GET /graph`
- `POST /graph/load`
- optional `POST /graph/refresh`

Ye router sirf request/response handle karega.
Actual loading and validation service layer mein hoga.

### `backend/app/routers/impact.py`
Yahan impact analysis endpoints daalo:
- `POST /impact`

Ye router input lega:
- `node_id`
- `algorithm`
- `max_depth`

Ye router output dega:
- affected nodes
- paths
- blast radius summary

### `backend/app/routers/ai.py`
Yahan AI-related endpoints daalo:
- `POST /ai/explain`
- optional `POST /ai/suggest`

Yahan sirf:
- request accept karo
- service call karo
- response return karo

Prompt construction aur caching service layer mein rakho.

### `backend/app/services/graph_service.py`
Yahan core graph loading logic daalo:
- `load_graph_from_file()`
- `load_graph_from_parser_output()`
- `validate_graph_payload()`
- `get_graph_summary()`

Is file ka kaam:
- JSON read karna
- schema validate karna
- normalized graph object return karna

### `backend/app/services/impact_service.py`
Yahan traversal and risk logic daalo:
- BFS/DFS traversal
- affected nodes nikalna
- propagation paths banana
- blast radius score calculate karna
- PageRank-style risk score compute karna

Is file ka kaam:
- graph input lena
- impact response banana

### `backend/app/services/websocket_service.py`
Yahan live update logic daalo:
- WebSocket connection manager
- broadcast function
- event payload creation

### `backend/app/schemas/graph.py`
Yahan Pydantic models daalo for:
- `GraphNode`
- `GraphEdge`
- `GraphSummary`
- `GraphResponse`
- `GraphLoadRequest`

### `backend/app/schemas/impact.py`
Yahan Pydantic models daalo for:
- `ImpactRequest`
- `AffectedNode`
- `ImpactSummary`
- `ImpactResponse`

### `backend/app/schemas/ai.py`
Yahan Pydantic models daalo for:
- `AIExplainRequest`
- `AIExplainResponse`

### `backend/ast_parser/`
Yahan P1 ka raw parsing work jayega:
- tree-sitter parsers
- file language detection
- symbol extraction
- parser tests

Output:
- normalized symbols
- intermediate parse result

### `backend/dependency_graph/`
Yahan graph construction logic jayega:
- symbol-to-node conversion
- edge building
- graph normalization
- graph export helpers

### `backend/dependency_agent/`
Yahan AI/dependency intelligence helpers jayenge:
- coupling metrics
- explanation helpers
- optional summarization helpers

### `backend/repo_scanner/`
Yahan repo crawling logic jayega:
- file discovery
- extension filtering
- ignore rules
- scan entry points

### `backend/data/demo_graph.json`
Ye final integration ka golden demo file hoga.
Ismein P5 ka handcrafted story graph rahega.

### `backend/data/cache/`
Yahan AI cached responses rakho:
- demo prompt cache
- precomputed AI output

---

## Frontend folder placement

### `FRONTEND/src/App.tsx`
Yahan top-level orchestration rakho:
- app layout
- page switching
- selected node state
- graph data state
- impact result state

Mat daalo:
- fetch logic inline in every child
- giant graph transformation code
- AI prompt strings

### `FRONTEND/src/api/client.ts`
Yahan common API client daalo:
- base URL
- fetch wrapper
- error handling

### `FRONTEND/src/api/graph.ts`
Yahan graph API methods daalo:
- `fetchGraph()`
- `loadGraph()`

### `FRONTEND/src/api/impact.ts`
Yahan impact API methods daalo:
- `runImpactAnalysis()`

### `FRONTEND/src/api/ai.ts`
Yahan AI API methods daalo:
- `getAIExplanation()`

### `FRONTEND/src/types/`
Yahan frontend TypeScript types daalo:
- graph node type
- graph edge type
- impact response type
- AI response type

### `FRONTEND/src/hooks/`
Yahan reusable hooks daalo:
- `useGraphData`
- `useImpactAnalysis`
- `useWebSocket`
- `useAISuggestions`

### `FRONTEND/src/components/DependencyGraph.tsx`
Yahan graph rendering rakho:
- Cytoscape setup
- node styling
- edge styling
- click events
- blast radius animation

Is component ko API directly call nahi karna chahiye.
Sirf props lena chahiye.

### `FRONTEND/src/components/ImpactAnalysisPanel.tsx`
Yahan impact result dikhao:
- affected nodes list
- blast radius score
- path summary

### `FRONTEND/src/components/DashboardCards.tsx`
Yahan top metrics dikhao:
- total nodes
- total edges
- language count
- high-risk count

### `FRONTEND/src/components/Header.tsx`
Yahan search and project selector rakho:
- file/symbol search input
- selected repo/project
- demo mode indicator if needed

### `FRONTEND/src/components/FileDetailsPanel.tsx`
Yahan selected node ka detail rakho:
- file path
- language
- dependencies
- risk score
- AI suggestion trigger

### `FRONTEND/src/data/`
Yahan sirf temporary mock/sample data rakho.
Jaise hi backend ready ho, production flow API se aana chahiye.

---

## Person-Wise File Ownership

### P1 should mainly touch
- `backend/ast_parser/`
- `backend/dependency_graph/`
- `backend/data/demo_graph.json`

### P2 should mainly touch
- `backend/app/main.py`
- `backend/app/routers/`
- `backend/app/services/`
- `backend/app/schemas/`

### P3 should mainly touch
- `FRONTEND/src/App.tsx`
- `FRONTEND/src/components/`
- `FRONTEND/src/api/`
- `FRONTEND/src/hooks/`
- `FRONTEND/src/types/`

### P4 should mainly touch
- `backend/app/routers/ai.py`
- `backend/app/schemas/ai.py`
- `backend/dependency_agent/`
- frontend AI cards and dashboard widgets

### P5 should mainly touch
- `integration_guide.md`
- `TODO.md`
- `backend/data/demo_graph.json`
- integration wiring across backend and frontend

---

## What Not To Mix
- Parser code ko router file mein mat daalo
- BFS/DFS logic ko frontend component mein mat daalo
- AI prompt text ko `App.tsx` mein mat daalo
- demo mock data ko permanent source mat banao
- schema field names ko har file mein alag-alag mat likho

One file = one responsibility.

---

## Shared Integration Contract

## 1. Graph JSON Schema
This is the most important contract in the project.

```json
{
  "repo_id": "demo-fastapi-react-postgres-redis",
  "generated_at": "2026-03-14T23:30:00Z",
  "summary": {
    "node_count": 30,
    "edge_count": 60,
    "languages": ["python", "javascript", "sql", "env"],
    "high_risk_nodes": 4
  },
  "nodes": [
    {
      "id": "backend.api.users.get_user",
      "label": "get_user",
      "type": "function",
      "language": "python",
      "file": "backend/app/routes/users.py",
      "line": 18,
      "group": "backend",
      "risk_score": 0.82,
      "pagerank": 0.14,
      "metadata": {
        "route": "/api/users/{id}",
        "method": "GET"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-001",
      "source": "frontend.pages.user.fetchUser",
      "target": "backend.api.users.get_user",
      "type": "api_call",
      "confidence": 0.96,
      "weight": 1.0,
      "evidence": ["GET /api/users/:id matched to GET /api/users/{id}"]
    }
  ],
  "warnings": [
    "2 unresolved SQL column references"
  ]
}
```

### Required node fields
- `id`: globally unique
- `label`: short display label
- `type`: `file | module | class | function | api | table | column | env | queue | cache`
- `language`: `python | javascript | typescript | sql | env | json`
- `file`
- `group`: `frontend | backend | db | infra`

### Required edge fields
- `id`
- `source`
- `target`
- `type`: `imports | calls | api_call | reads | writes | env_usage | defines | references | emits | consumes`
- `confidence`: float from `0` to `1`

### Contract rules
- P1 is the owner of this schema.
- P2 must not mutate field names.
- P3 and P4 must treat missing optional fields safely.
- P5 validates every demo JSON against this shape before the final demo.

---

## 2. Impact Analysis Response
P2 owns this response shape. P3 and P4 depend on it.

```json
{
  "start_node": "backend.api.users.get_user",
  "algorithm": "bfs",
  "max_depth": 4,
  "affected_nodes": [
    {
      "id": "frontend.pages.user.fetchUser",
      "depth": 1,
      "risk_score": 0.61,
      "path_count": 2
    }
  ],
  "paths": [
    [
      "backend.api.users.get_user",
      "frontend.pages.user.fetchUser",
      "frontend.components.UserCard.render"
    ]
  ],
  "summary": {
    "affected_count": 8,
    "high_risk_count": 3,
    "blast_radius_score": 74
  }
}
```

### Rules
- `start_node` must be a valid graph node id.
- `affected_nodes` must be sorted by severity or depth.
- `blast_radius_score` should be a simple demo-friendly 0-100 score.
- P3 uses this for the ripple animation and highlights.
- P4 uses this for risk widgets and explanation prompts.

---

## 3. WebSocket Event Shape
For live updates and animation triggers.

```json
{
  "event": "graph_updated",
  "timestamp": "2026-03-14T23:40:00Z",
  "repo_id": "demo-fastapi-react-postgres-redis",
  "payload": {
    "node_count": 30,
    "edge_count": 60,
    "changed_nodes": ["backend.api.users.get_user"]
  }
}
```

Supported event names:
- `graph_updated`
- `impact_ready`
- `scan_started`
- `scan_completed`
- `scan_failed`

---

## API Contracts

## Backend Base URL
Local:
- `http://127.0.0.1:8000`

Frontend dev server:
- typically `http://localhost:5173`

WebSocket:
- `ws://127.0.0.1:8000/ws`

## Required Endpoints

### `GET /`
Purpose:
- quick sanity check that backend is alive

### `GET /health`
Returns:
- service health
- parser/graph module readiness

Suggested response:
```json
{
  "status": "healthy",
  "modules": {
    "repo_scanner": true,
    "parser": true,
    "graph": true,
    "impact": true,
    "ai": true
  }
}
```

### `GET /graph`
Returns full normalized graph JSON.

Used by:
- P3 initial graph render
- P4 dashboard calculations
- P5 smoke testing

### `POST /graph/load`
Loads demo graph JSON or parser-produced graph.

Request:
```json
{
  "source": "backend/data/demo_graph.json"
}
```

Alternative:
- accept direct JSON upload if faster for demo mode

### `POST /impact`
Request:
```json
{
  "node_id": "backend.api.users.get_user",
  "algorithm": "bfs",
  "max_depth": 4
}
```

Returns:
- impact analysis response

### `POST /ai/explain`
Request:
```json
{
  "node_id": "backend.api.users.get_user",
  "context": "Refactor this API without breaking frontend consumers"
}
```

Returns:
- explanation
- suggested refactor
- optional code snippet
- cached/demo flag

---

## Frontend Integration Rules

## Data flow
P3 should not hardcode long-term sample data inside components once P2 is ready.

Use this flow:
1. App boots.
2. Frontend calls `GET /graph`.
3. Graph renders nodes and edges.
4. User clicks a node.
5. Frontend calls `POST /impact`.
6. Frontend animates blast radius from returned paths.
7. Frontend optionally calls `POST /ai/explain`.
8. Dashboard widgets update from graph + impact data.

## Frontend state ownership
- Graph data: top-level app state or shared store
- Selected node: top-level UI state
- Impact response: separate state from graph
- AI panel state: separate loading and cache state
- WebSocket events: append-only update stream or event handler service

## Frontend component contract
Each visual component should accept plain typed props, not reach into random files:
- `DependencyGraph` gets `nodes`, `edges`, `selectedNodeId`, `highlightedNodeIds`
- `ImpactAnalysisPanel` gets full impact response
- `DashboardCards` gets computed metrics
- `FileDetailsPanel` gets selected node

This keeps P3 fast and keeps P4 from tightly coupling to graph internals.

---

## Parser to Backend Handoff
P1 hands to P2:
- parser output JSON file
- node/edge field dictionary
- edge type list
- confidence scoring logic
- known limitations list

P2 must verify:
- unique node ids
- edge source and target both exist
- no empty `type` or `language`
- confidence is always numeric

If parser is not fully ready by hour 6:
- P5 should supply `backend/data/demo_graph.json`
- P2 continues API work against demo data
- P1 later swaps parser output into the same schema

This fallback is mandatory for hackathon survival.

---

## Backend to Frontend Handoff
P2 hands to P3:
- running FastAPI URL
- endpoint list
- sample `GET /graph` response
- sample `POST /impact` response
- WebSocket event samples
- CORS enabled for frontend dev URL

P3 verifies:
- graph loads with no manual JSON imports
- clicking a node can trigger impact API
- error state renders if backend is down
- loading state exists for graph fetch and impact fetch

---

## AI to Frontend Handoff
P4 hands to P3:
- AI response schema
- demo cached responses for at least 5 node contexts
- timeout and fallback behavior

P3 verifies:
- AI cards render without blocking graph interactions
- cached responses can be shown instantly in demo mode
- if AI fails, UI still works and shows a fallback message

---

## Demo Data Rules
P5 owns the handcrafted demo graph.

The demo graph must:
- include frontend, backend, database, cache, and env relationships
- tell a story judges can follow in under 60 seconds
- contain at least 1 API chain from frontend to backend
- contain at least 1 SQL dependency chain
- contain at least 1 Redis/cache edge
- contain at least 1 env var dependency
- include a few high-risk nodes so impact analysis looks meaningful

Recommended storyline:
1. Frontend user page calls backend `/api/users/{id}`.
2. Backend service reads PostgreSQL `users` table.
3. Cache layer reads/writes Redis key.
4. Auth middleware depends on `JWT_SECRET`.
5. Changing one backend symbol triggers blast radius across frontend, backend, DB, and infra.

This is what makes the demo memorable.

---

## Hour-by-Hour Integration Plan

## 0-3 Hours
- P1 sets parser output shape and sample JSON.
- P2 keeps FastAPI root and health endpoints working.
- P3 keeps frontend shell and graph component running.
- P4 chooses AI provider and locks request/response shape.
- P5 drafts demo graph JSON and shared environment variables.

Checkpoint:
- one agreed JSON schema
- one agreed node id format
- one agreed backend URL and frontend URL

## 3-6 Hours
- P1 starts producing real nodes and edges.
- P2 implements `/graph` and `/impact`.
- P3 connects graph UI to API instead of only local sample data.
- P4 builds suggestion cards against mock backend response.
- P5 validates demo data and starts end-to-end smoke tests.

Checkpoint:
- frontend renders graph from backend response
- impact endpoint works for at least one node

## 6-9 Hours
- P1 adds resolver confidence scores.
- P2 adds WebSocket updates and risk scoring.
- P3 builds blast radius animation from impact response.
- P4 hooks dashboard widgets to real API data.
- P5 integrates all modules in one branch.

Checkpoint:
- click node -> fetch impact -> animate graph -> show AI card

## 9-12 Hours
- stabilize
- trim broken features
- improve error handling
- pre-cache AI responses
- rehearse demo
- freeze schema changes unless absolutely necessary

Final checkpoint:
- full story runs in one click with no manual editing

---

## Branch and Merge Strategy
Keep this simple.

Recommended branches:
- `main`
- `p1-parser`
- `p2-backend`
- `p3-frontend`
- `p4-ai-dashboard`
- `p5-integration`

Rules:
- P5 merges everyone into `p5-integration` first.
- Only merge into `main` when the end-to-end demo works.
- No one changes the shared schema without announcing it.
- If schema changes are unavoidable, update backend and frontend adapters immediately.

Hackathon truth:
- a boring stable contract beats a clever changing contract

---

## Environment Variables
Put these in a root `.env` or separate backend/frontend env files if needed.

```env
BACKEND_HOST=127.0.0.1
BACKEND_PORT=8000
FRONTEND_PORT=5173
GRAPH_DATA_PATH=backend/data/demo_graph.json
AI_PROVIDER=groq
AI_API_KEY=your_key_here
DEMO_MODE=true
WS_PATH=/ws
```

Frontend should read:
- `VITE_API_BASE_URL`
- `VITE_WS_URL`
- `VITE_DEMO_MODE`

Backend should read:
- graph data path
- AI provider config
- demo mode flag

---

## Local Run Instructions

## Backend
From project root:
```bash
cd backend
pip install -r requirements.txt
python app/main.py
```

Expected:
- backend starts on port `8000`
- `GET /health` returns healthy JSON

## Frontend
From project root:
```bash
cd FRONTEND
npm install
npm run dev
```

Expected:
- Vite starts on port `5173`
- frontend can reach backend through configured base URL

---

## Integration Checklist

## P1 Checklist
- Graph JSON validates
- Node ids are unique
- Edge endpoints exist
- Confidence scores present
- Demo repo data can be generated or loaded

## P2 Checklist
- `GET /health` works
- `GET /graph` works
- `POST /impact` works
- CORS works from frontend
- WebSocket does not crash when frontend connects

## P3 Checklist
- Graph renders from API
- Clicking node triggers impact analysis
- Highlighting and animation work
- Empty/loading/error states exist
- Search finds nodes by label or file

## P4 Checklist
- AI card opens from selected node
- Cached responses available for demo
- Dashboard metrics match graph data
- Coupling dial and language chart update correctly

## P5 Checklist
- One command to run backend
- One command to run frontend
- Demo graph loads consistently
- No crash in 5 repeated demo runs
- PDF/export flow works or is safely disabled

---

## Non-Negotiable Demo Fallbacks
If something breaks late, do this instead of dying on stage.

- If live parser is unstable, use fixed `demo_graph.json`.
- If AI API is flaky, serve cached responses.
- If WebSocket is unstable, poll `/graph` every few seconds or disable live updates.
- If full scan is slow, preload graph on backend startup.
- If export breaks, hide the button and do not mention it in the demo.

Winning hackathon teams cut unstable features early.

---

## Presentation Flow
Use this sequence in the final demo:

1. Open dashboard and show language mix, coupling score, and risk hotspots.
2. Search for a key symbol like `get_user`.
3. Click node and trigger blast radius animation.
4. Show affected services across frontend, backend, DB, and env.
5. Open AI explanation card with a cached refactor suggestion.
6. Explain that the graph was built from AST parsing plus cross-boundary matching.
7. Close with the business value: safer refactors, faster onboarding, fewer hidden dependency bugs.

---

## Final Hour Rules
- Freeze schema changes.
- Prefer fake-but-stable over real-but-flaky.
- Rehearse with the exact machine and ports you will demo on.
- Keep one person responsible for running the demo.
- Keep one person ready to restart backend/frontend if needed.
- Keep one backup screenshot or short screen recording.

---

## Immediate Next Actions For Your Team
- P1: finalize the normalized graph schema first.
- P2: implement `GET /graph`, `POST /impact`, and `/health`.
- P3: replace hardcoded sample data with API-backed loading.
- P4: build against a mocked AI response, then swap provider later.
- P5: create `backend/data/demo_graph.json` and validate the end-to-end story.

If you want, I can also turn this into a sharper judge-facing version with:
- exact folder/file creation tasks per person
- JSON schemas as Pydantic/TypeScript types
- a one-page "integration command center" checklist for your team lead
