from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="AI Cross-Language Dependency Mapper")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Module routers will mount here
# from repo_scanner.router import router as repo_router
# app.include_router(repo_router, prefix="/repo", tags=["repo"])

@app.get("/")
async def root():
    return {"message": "AI Dependency Mapper Backend - Modules ready for team", "modules": ["repo_scanner", "code_parser", "dependency_graph", "impact_simulator"]}

@app.get("/health")
async def health():
    return {"status": "healthy", "modules": ["repo_scanner ready"]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

