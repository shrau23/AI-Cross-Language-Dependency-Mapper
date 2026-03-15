from fastapi import APIRouter, HTTPException

from app.schemas.impact import ImpactRequest, ImpactResponse
from app.services.impact_service import impact_service
from app.services.websocket_service import ws_manager

router = APIRouter(tags=["impact"])


@router.post("/impact", response_model=ImpactResponse)
async def run_impact_analysis(request: ImpactRequest) -> ImpactResponse:
    try:
        response = impact_service.analyze(
            node_id=request.node_id,
            algorithm=request.algorithm,
            max_depth=request.max_depth,
        )
        await ws_manager.broadcast(
            "impact_ready",
            {
                "start_node": response.start_node,
                "affected_count": response.summary.affected_count,
                "blast_radius_score": response.summary.blast_radius_score,
            },
        )
        return response
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
