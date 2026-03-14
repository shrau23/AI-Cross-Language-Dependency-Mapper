import json
import networkx as nx
from typing import List


class GraphBuilder:
    """
    Builds a dependency graph for a polyglot code analysis system representing
    code elements like React components, FastAPI endpoints, and Database tables.
    """

    def __init__(self):
        """Initialize an empty directed graph."""
        # We use a directed graph (DiGraph) where edges represent the flow of impact.
        # e.g., A -> B means a change in A affects B.
        self.graph = nx.DiGraph()

    def add_node(self, node_id: str, name: str, node_type: str, language: str) -> None:
        """
        Add a code element node to the graph.

        Args:
            node_id (str): Unique identifier for the node.
            name (str): Name of the code element.
            node_type (str): Type of the node (e.g., 'React component', 'FastAPI endpoint', 'Database table').
            language (str): Language of the code element (e.g., 'TypeScript', 'Python', 'SQL').
        """
        self.graph.add_node(
            node_id,
            name=name,
            type=node_type,
            language=language
        )

    def add_edge(self, source_id: str, target_id: str, edge_type: str) -> None:
        """
        Add a dependency edge between two nodes.

        Args:
            source_id (str): Node ID of the source (the dependency that impacts others).
            target_id (str): Node ID of the target (the dependent that is impacted).
            edge_type (str): Type of the edge (e.g., 'API_CALL', 'DB_REF', 'SCHEMA_SHARE', 'ENV_VAR').

        Raises:
            ValueError: If either the source or target node does not exist in the graph.
        """
        if not self.graph.has_node(source_id):
            raise ValueError(f"Source node '{source_id}' does not exist in the graph.")
        if not self.graph.has_node(target_id):
            raise ValueError(f"Target node '{target_id}' does not exist in the graph.")

        self.graph.add_edge(source_id, target_id, type=edge_type)

    def get_graph(self) -> str:
        """
        Return the entire graph data in JSON format.
        
        Returns:
            str: JSON string representation of the nodes and edges.
        """
        data = nx.node_link_data(self.graph)
        return json.dumps(data, indent=2)

    def simulate_impact(self, node_id: str) -> List[str]:
        """
        Return all nodes affected by a change in the given node using graph traversal.
        
        Since edges represent "A depends on B" (A -> B), a change in B affects A.
        Therefore, we must find all ancestors of the node_id to see who is impacted.

        Args:
            node_id (str): The ID of the node that changed.
            
        Returns:
            List[str]: A list of node IDs that are impacted by the change.
            
        Raises:
            ValueError: If the specified node does not exist in the graph.
        """
        if not self.graph.has_node(node_id):
            raise ValueError(f"Node '{node_id}' does not exist in the graph.")

        # Traverse the graph to find all ancestor nodes (nodes that can reach node_id)
        affected_nodes = nx.ancestors(self.graph, node_id)
        return sorted(list(affected_nodes))
