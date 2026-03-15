from fastapi import APIRouter

from app.schemas.ai import AIExplainRequest, AIExplainResponse
from app.services.graph_service import graph_service

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/explain", response_model=AIExplainResponse)
async def explain_node(request: AIExplainRequest) -> AIExplainResponse:
    graph = graph_service.get_graph()
    node = next((item for item in graph.nodes if item.id == request.node_id), None)

    if node is None:
        return AIExplainResponse(
            node_id=request.node_id,
            summary="This symbol is not present in the current graph snapshot.",
            recommendation="Reload the graph and retry the explanation request.",
            code_snippet="// Node not found in graph",
            cached=True,
        )

    dependents = [edge.target for edge in graph.edges if edge.source == node.id]
    summary = (
        f"{node.label} is a {node.language} {node.type} in {node.group}. "
        f"It currently fans out to {len(dependents)} downstream dependencies."
    )
    recommendation = (
        "Stabilize the public contract first, add tests around its callers, "
        "then refactor internal logic behind the same interface."
    )
    snippet = (
        f"// Safe refactor plan for {node.label}\n"
        "1. Keep the public signature stable\n"
        "2. Add an adapter layer if consumers differ\n"
        "3. Roll out internal changes behind tests"
    )

    return AIExplainResponse(
        node_id=node.id,
        summary=summary,
        recommendation=recommendation,
        code_snippet=snippet,
        cached=True,
    )
