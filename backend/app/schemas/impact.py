from pydantic import BaseModel, Field


class ImpactRequest(BaseModel):
    node_id: str
    algorithm: str = Field(default="bfs", pattern="^(bfs|dfs)$")
    max_depth: int = Field(default=4, ge=1, le=8)


class AffectedNode(BaseModel):
    id: str
    depth: int
    risk_score: float = Field(ge=0, le=1)
    path_count: int = Field(ge=1)


class ImpactSummary(BaseModel):
    affected_count: int
    high_risk_count: int
    blast_radius_score: int = Field(ge=0, le=100)


class ImpactResponse(BaseModel):
    start_node: str
    algorithm: str
    max_depth: int
    affected_nodes: list[AffectedNode]
    paths: list[list[str]]
    summary: ImpactSummary
