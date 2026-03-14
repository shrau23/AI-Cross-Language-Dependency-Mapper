from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from repo_scanner import clone_repo, scan_files

app = FastAPI(title="AI Cross-Language Dependency Mapper - Person 1 Backend", version="1.0.0")

class RepoUploadRequest(BaseModel):
    url: str

class RepoUploadResponse(BaseModel):
    files: List[str]
    error: Optional[str] = None

@app.post("/upload-repo", response_model=RepoUploadResponse)
async def upload_repo(request: RepoUploadRequest):
    try:
        repo_path = clone_repo(request.url)
        files = scan_files(repo_path)
        return RepoUploadResponse(files=files)
    except Exception as e:
        return RepoUploadResponse(error=str(e))

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

