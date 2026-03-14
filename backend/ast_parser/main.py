from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from ast_engine import parse_file_path
import os

app = FastAPI(title="PolyTraceAI AST Parser")

class ParseRequest(BaseModel):
    files: List[str]

@app.post("/parse")
async def parse_files(request: ParseRequest):
    """
    Accepts a list of file paths, runs the appropriate parser on each,
    and returns a combined symbol table.
    """
    all_symbols = []
    errors = []

    for filepath in request.files:
        if not os.path.exists(filepath):
            errors.append(f"File not found: {filepath}")
            continue
            
        try:
            # parse_file_path already handles routing to JS/Python/SQL
            symbols = parse_file_path(filepath)
            all_symbols.extend(symbols)
        except Exception as e:
            errors.append(f"Error parsing {filepath}: {str(e)}")

    response = {
        "symbols": all_symbols,
        "count": len(all_symbols)
    }
    
    if errors:
        response["errors"] = errors
        
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
