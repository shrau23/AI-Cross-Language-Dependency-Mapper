from pydantic import BaseModel
from typing import List, Optional

class Symbol(BaseModel):
    id: str         # filename::symbolname
    name: str       # symbolname
    kind: str       # function, class, route, component, fetch_call, table, column
    language: str   # python, javascript, sql
    file: str       # filename
    line: int       # line number (1-indexed)

class ParseRequest(BaseModel):
    files: List[str]
