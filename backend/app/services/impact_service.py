from collections import deque

import networkx as nx

from app.schemas.impact import AffectedNode, ImpactResponse, ImpactSummary
from app.services.graph_service import graph_service


class ImpactService:
    def _build_graph(self) -> tuple[nx.DiGraph, dict[str, object]]:
        graph_payload = graph_service.get_graph()
        directed = nx.DiGraph()
        node_index = {}

        for node in graph_payload.nodes:
            directed.add_node(node.id)
            node_index[node.id] = node

        for edge in graph_payload.edges:
            directed.add_edge(edge.source, edge.target, weight=edge.weight, confidence=edge.confidence, type=edge.type)

        return directed, node_index

    def _walk(self, graph: nx.DiGraph, start_node: str, algorithm: str, max_depth: int) -> dict[str, int]:
        visited: dict[str, int] = {}
        if algorithm == "dfs":
            stack: list[tuple[str, int]] = [(start_node, 0)]
            while stack:
                node_id, depth = stack.pop()
                if depth >= max_depth:
                    continue
                for neighbor in graph.successors(node_id):
                    next_depth = depth + 1
                    if neighbor not in visited or next_depth < visited[neighbor]:
                        visited[neighbor] = next_depth
                        stack.append((neighbor, next_depth))
        else:
            queue: deque[tuple[str, int]] = deque([(start_node, 0)])
            while queue:
                node_id, depth = queue.popleft()
                if depth >= max_depth:
                    continue
                for neighbor in graph.successors(node_id):
                    next_depth = depth + 1
                    if neighbor not in visited:
                        visited[neighbor] = next_depth
                        queue.append((neighbor, next_depth))
        return visited

    def analyze(self, node_id: str, algorithm: str = "bfs", max_depth: int = 4) -> ImpactResponse:
        graph, node_index = self._build_graph()
        if node_id not in node_index:
            raise ValueError(f"Node '{node_id}' not found in graph.")

        distances = self._walk(graph, node_id, algorithm, max_depth)
        affected_nodes: list[AffectedNode] = []
        paths: list[list[str]] = []

        for affected_id, depth in sorted(distances.items(), key=lambda item: (item[1], item[0])):
            try:
                shortest = nx.shortest_path(graph, node_id, affected_id)
            except nx.NetworkXNoPath:
                continue

            simple_path_count = 0
            for _ in nx.all_simple_paths(graph, node_id, affected_id, cutoff=max_depth):
                simple_path_count += 1
                if simple_path_count >= 3:
                    break

            paths.append(shortest)
            affected_nodes.append(
                AffectedNode(
                    id=affected_id,
                    depth=depth,
                    risk_score=node_index[affected_id].risk_score,
                    path_count=max(1, simple_path_count),
                )
            )

        high_risk_count = sum(1 for node in affected_nodes if node.risk_score >= 0.7)
        blast_radius = min(100, int(len(affected_nodes) * 8 + high_risk_count * 12))

        return ImpactResponse(
            start_node=node_id,
            algorithm=algorithm,
            max_depth=max_depth,
            affected_nodes=affected_nodes,
            paths=paths[:8],
            summary=ImpactSummary(
                affected_count=len(affected_nodes),
                high_risk_count=high_risk_count,
                blast_radius_score=blast_radius,
            ),
        )


impact_service = ImpactService()
