# AI Cross-Language Dependency Mapper

## Backend Modules (Team Integration Ready)

```
ai-dependency-mapper/
├── backend/
│   ├── repo_scanner/     # Git clone + file scan (Person 1 DONE)
│   ├── code_parser/      # Tree-sitter AST (Person 2)
│   ├── dependency_graph/ # NetworkX graph (Person 3)
│   ├── impact_simulator/ # Traversal + Groq AI (Person 4)
│   ├── app/
│   │   └── main.py       # Unified FastAPI
│   └── requirements.txt
├── frontend/             # React UI
└── README.md
```

## Quick Start
```bash
cd ai-dependency-mapper/backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Module Status
- ✅ repo_scanner - GitHub repo → file list
- ⏳ code_parser - Files → symbols
- ⏳ dependency_graph - Symbols → graph edges
- ⏳ impact_simulator - Graph → impact analysis

## Team Workflow
1. Person 2: Add `code_parser/router.py` + mount in main.py
2. Person 3: Add `dependency_graph/` + mount
3. Person 4: Add `impact_simulator/` + mount

Push to git - auto-merge ready!

