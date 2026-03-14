from pathlib import Path
import sys

if __package__ in {None, ""}:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from typing import List

from app.routers.ai import router as ai_router
from app.routers.graph import router as graph_router
from app.routers.health import router as health_router
from app.routers.impact import router as impact_router
from app.services.graph_service import graph_service
from app.services.websocket_service import ws_manager

app = FastAPI(title="AI Cross-Language Dependency Mapper")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(graph_router)
app.include_router(impact_router)
app.include_router(ai_router)

# Model for repository input
class RepoInput(BaseModel):
    repo_url: str

# In-memory storage for repository links
repo_links: List[str] = []

@app.post("/add_repo/")
def add_repo(repo: RepoInput):
    if repo.repo_url in repo_links:
        raise HTTPException(status_code=400, detail="Repository already added.")
    repo_links.append(repo.repo_url)
    return {"message": "Repository added successfully.", "repo_url": repo.repo_url}

@app.get("/repos/")
def get_repos():
    return {"repos": repo_links}

@app.on_event("startup")
async def startup_event() -> None:
    graph_service.get_graph()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await ws_manager.connect(websocket)
    graph = graph_service.get_graph()
    await websocket.send_json(
        {
            "event": "graph_updated",
            "payload": {
                "repo_id": graph.repo_id,
                "node_count": graph.summary.node_count,
                "edge_count": graph.summary.edge_count,
                "changed_nodes": [],
            },
        }
    )
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
