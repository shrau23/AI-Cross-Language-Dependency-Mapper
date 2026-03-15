from fastapi import APIRouter, HTTPException

from app.schemas.scan import ScanRequest, ScanResponse
from app.services.graph_service import graph_service
from app.services.repo_scan_service import repo_scan_service
from app.services.websocket_service import ws_manager

router = APIRouter(tags=["scan"])


@router.post("/scan", response_model=ScanResponse)
async def scan_repository(request: ScanRequest) -> ScanResponse:
    try:
        result = repo_scan_service.build_graph_from_repo(request)
        graph_service._graph = graph_service.validate_graph_payload(result.graph)
        await ws_manager.broadcast(
            "scan_completed",
            {
                "repo_id": result.graph.repo_id,
                "node_count": result.graph.summary.node_count,
                "edge_count": result.graph.summary.edge_count,
                "changed_nodes": [node.id for node in result.graph.nodes[:5]],
            },
        )
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
