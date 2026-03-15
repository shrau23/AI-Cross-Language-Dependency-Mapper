import os

from fastapi import APIRouter

from app.services.graph_service import graph_service

router = APIRouter(tags=["health"])


@router.get("/")
async def root() -> dict[str, object]:
    return {
        "message": "AI Dependency Mapper Backend",
        "modules": ["graph", "impact", "ai", "websocket"],
    }


@router.get("/health")
async def health() -> dict[str, object]:
    ai_key_present = bool(os.getenv("AI_API_KEY"))
    try:
        graph_summary = graph_service.get_graph_summary()
        graph_ready = True
    except Exception:
        graph_summary = {}
        graph_ready = False

    return {
        "status": "healthy",
        "modules": {
            "graph": graph_ready,
            "impact": graph_ready,
            "ai": True,
            "websocket": True,
            "ai_key_present": ai_key_present,
        },
        "graph": graph_summary,
    }
