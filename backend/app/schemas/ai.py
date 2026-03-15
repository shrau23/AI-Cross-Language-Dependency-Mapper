from pydantic import BaseModel, Field


class AIExplainRequest(BaseModel):
    node_id: str
    context: str = Field(default="Explain the blast radius and suggest a safe refactor.")


class AIExplainResponse(BaseModel):
    node_id: str
    summary: str
    recommendation: str
    code_snippet: str
    cached: bool = True
