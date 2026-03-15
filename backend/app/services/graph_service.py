import json
from collections import Counter
from pathlib import Path

from app.schemas.graph import GraphEdge, GraphLoadRequest, GraphNode, GraphResponse, GraphSummary


class GraphService:
    def __init__(self) -> None:
        self._root_dir = Path(__file__).resolve().parents[2]
        self._default_path = self._root_dir / "data" / "demo_graph.json"
        self._graph: GraphResponse | None = None

    @property
    def default_path(self) -> Path:
        return self._default_path

    def _build_summary(self, nodes: list[GraphNode], edges: list[GraphEdge]) -> GraphSummary:
        languages = sorted({node.language for node in nodes})
        high_risk_nodes = sum(1 for node in nodes if node.risk_score >= 0.7)
        return GraphSummary(
            node_count=len(nodes),
            edge_count=len(edges),
            languages=languages,
            high_risk_nodes=high_risk_nodes,
        )

    def validate_graph_payload(self, payload: GraphResponse) -> GraphResponse:
        node_ids = {node.id for node in payload.nodes}
        if len(node_ids) != len(payload.nodes):
            raise ValueError("Duplicate node ids detected in graph payload.")

        missing_nodes = [
            edge.id
            for edge in payload.edges
            if edge.source not in node_ids or edge.target not in node_ids
        ]
        if missing_nodes:
            raise ValueError(f"Edges reference missing nodes: {', '.join(missing_nodes)}")

        payload.summary = self._build_summary(payload.nodes, payload.edges)
        return payload

    def load_graph_from_file(self, source: str | None = None) -> GraphResponse:
        path = Path(source) if source else self._default_path
        if not path.is_absolute():
            backend_relative = (self._root_dir / path).resolve()
            repo_relative = (self._root_dir.parent / path).resolve()
            path = backend_relative if backend_relative.exists() else repo_relative
        if not path.exists():
            raise FileNotFoundError(f"Graph file not found at {path}")

        data = json.loads(path.read_text(encoding="utf-8"))
        payload = GraphResponse.model_validate(data)
        self._graph = self.validate_graph_payload(payload)
        return self._graph

    def load_graph(self, request: GraphLoadRequest) -> GraphResponse:
        if request.payload is not None:
            self._graph = self.validate_graph_payload(request.payload)
            return self._graph
        return self.load_graph_from_file(request.source)

    def get_graph(self) -> GraphResponse:
        if self._graph is None:
            return self.load_graph_from_file()
        return self._graph

    def get_graph_summary(self) -> dict[str, object]:
        graph = self.get_graph()
        groups = Counter(node.group for node in graph.nodes)
        return {
            "repo_id": graph.repo_id,
            "generated_at": graph.generated_at,
            "node_count": graph.summary.node_count,
            "edge_count": graph.summary.edge_count,
            "languages": graph.summary.languages,
            "high_risk_nodes": graph.summary.high_risk_nodes,
            "groups": dict(groups),
            "source": str(self.default_path),
        }


graph_service = GraphService()
