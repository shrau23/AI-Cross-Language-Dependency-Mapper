from fastapi import APIRouter, HTTPException

from app.schemas.graph import GraphLoadRequest, GraphResponse
from app.services.graph_service import graph_service
from app.services.websocket_service import ws_manager

router = APIRouter(prefix="/graph", tags=["graph"])


@router.get("", response_model=GraphResponse)
async def get_graph() -> GraphResponse:
    try:
        return graph_service.get_graph()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/load", response_model=GraphResponse)
async def load_graph(request: GraphLoadRequest) -> GraphResponse:
    try:
        graph = graph_service.load_graph(request)
        await ws_manager.broadcast(
            "graph_updated",
            {
                "repo_id": graph.repo_id,
                "node_count": graph.summary.node_count,
                "edge_count": graph.summary.edge_count,
                "changed_nodes": [node.id for node in graph.nodes[:5]],
            },
        )
        return graph
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
