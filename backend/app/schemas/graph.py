from typing import Any, Literal

from pydantic import BaseModel, Field


class GraphSummary(BaseModel):
    node_count: int
    edge_count: int
    languages: list[str]
    high_risk_nodes: int


class GraphNode(BaseModel):
    id: str
    label: str
    type: Literal["file", "module", "class", "function", "api", "table", "column", "env", "queue", "cache"]
    language: Literal["python", "javascript", "typescript", "sql", "env", "json"]
    file: str
    line: int | None = None
    group: Literal["frontend", "backend", "db", "infra"]
    risk_score: float = Field(ge=0, le=1)
    pagerank: float = Field(default=0, ge=0)
    metadata: dict[str, Any] = Field(default_factory=dict)


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    type: Literal["imports", "calls", "api_call", "reads", "writes", "env_usage", "defines", "references", "emits", "consumes"]
    confidence: float = Field(ge=0, le=1)
    weight: float = Field(default=1, gt=0)
    evidence: list[str] = Field(default_factory=list)


class GraphResponse(BaseModel):
    repo_id: str
    generated_at: str
    summary: GraphSummary
    nodes: list[GraphNode]
    edges: list[GraphEdge]
    warnings: list[str] = Field(default_factory=list)


class GraphLoadRequest(BaseModel):
    source: str | None = None
    payload: GraphResponse | None = None
