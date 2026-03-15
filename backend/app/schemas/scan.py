from pydantic import BaseModel, HttpUrl

from app.schemas.graph import GraphResponse


class ScanRequest(BaseModel):
    url: HttpUrl
    max_files: int = 200


class ScanResponse(BaseModel):
    repo_url: str
    repo_name: str
    file_count: int
    graph: GraphResponse
