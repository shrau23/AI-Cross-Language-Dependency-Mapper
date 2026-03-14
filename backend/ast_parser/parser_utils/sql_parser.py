import re

def parse_sql(code: str, filepath: str) -> list[dict]:
    symbols = []
    symbols.extend(_extract_tables(code, filepath))
    symbols.extend(_extract_columns(code, filepath))
    return symbols


# ── 1. Table Names ────────────────────────────────────────

def _extract_tables(code: str, filepath: str) -> list[dict]:
    symbols = []
    pattern = re.compile(
        r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?',
        re.IGNORECASE
    )
    for match in pattern.finditer(code):
        name = match.group(1)
        line = code[:match.start()].count("\n") + 1
        symbols.append({
            "name": name,
            "kind": "table",
            "line": line,
            # Keeping extra metadata for standard output format
            "id": f"{filepath}::{name}",
            "language": "sql",
            "file": filepath,
            "exported": True
        })
    return symbols


# ── 2. Column Names ───────────────────────────────────────

def _extract_columns(code: str, filepath: str) -> list[dict]:
    symbols = []

    # CREATE TABLE block nikalo pehle
    table_block_pattern = re.compile(
        r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?\s*\((.*?)\);',
        re.IGNORECASE | re.DOTALL
    )

    for table_match in table_block_pattern.finditer(code):
        table_name = table_match.group(1)
        block = table_match.group(2)
        table_line = code[:table_match.start()].count("\n") + 1

        # har line ek column definition hai
        for i, col_line in enumerate(block.split("\n")):
            col_line = col_line.strip().rstrip(",")

            # skip constraints
            if not col_line:
                continue
            if re.match(r'(PRIMARY|FOREIGN|UNIQUE|INDEX|KEY|CONSTRAINT)', col_line, re.IGNORECASE):
                continue

            # pehla word = column name
            col_match = re.match(r'`?(\w+)`?\s+\w+', col_line)
            if col_match:
                col_name = col_match.group(1)
                symbols.append({
                    "name": col_name,
                    "kind": "column",
                    "table": table_name,    # Person 3 uses this to link column → table
                    "line": table_line + i + 1,
                    # Extra metadata:
                    "id": f"{filepath}::{table_name}.{col_name}",
                    "language": "sql",
                    "file": filepath,
                    "exported": True
                })

    return symbols
