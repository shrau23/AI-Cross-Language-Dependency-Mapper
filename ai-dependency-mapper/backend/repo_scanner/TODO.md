# Person 1 - Repo Scanner - COMPLETE ✅

**Done:**
- repo_scanner.py: git clone, recursive file scan (.py .js .ts .java .sql etc.)
- server.py: POST /upload-repo → {"files": [...]}
- requirements.txt ready

**Run:**
1. cd backend
2. pip install -r requirements.txt
3. uvicorn server:app --reload

**Test:**
curl -X POST "http://127.0.0.1:8000/upload-repo" -H "Content-Type: application/json" -d "{\"url\": \"https://github.com/tiangolo/fastapi\"}"

Person 1 ready for handoff to Person 2!
