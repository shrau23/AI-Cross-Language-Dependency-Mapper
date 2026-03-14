import os
import tree_sitter_python as tspython
from tree_sitter import Language, Parser

PY_LANGUAGE = Language(tspython.language())
parser = Parser(PY_LANGUAGE)

def parse_python(code_str: str, filepath: str) -> list[dict]:
    code_bytes = code_str.encode('utf8')
    tree = parser.parse(code_bytes)
    symbols = []
    
    filename = os.path.basename(filepath)

    def is_fastapi_route(node):
        text = code_bytes[node.start_byte:node.end_byte].decode('utf8')
        return '@app.get' in text or '@app.post' in text or '@app.put' in text or '@app.delete' in text

    def walk(node):
        if node.type == 'class_definition':
            name_node = node.child_by_field_name('name')
            if name_node:
                sym_name = code_bytes[name_node.start_byte:name_node.end_byte].decode('utf8')
                symbols.append({
                    "id": f"{filepath}::{sym_name}",
                    "name": sym_name,
                    "kind": "class",
                    "language": "python",
                    "file": filepath,
                    "line": node.start_point.row + 1
                })
            
        elif node.type == 'function_definition':
            name_node = node.child_by_field_name('name')
            if name_node:
                sym_name = code_bytes[name_node.start_byte:name_node.end_byte].decode('utf8')
                symbols.append({
                    "id": f"{filepath}::{sym_name}",
                    "name": sym_name,
                    "kind": "function",
                    "language": "python",
                    "file": filepath,
                    "line": node.start_point.row + 1
                })

        elif node.type == 'decorated_definition':
            is_route = False
            func_name = None
            func_line = node.start_point.row + 1
            
            for child in node.children:
                if child.type == 'decorator':
                    if is_fastapi_route(child):
                        is_route = True
                elif child.type == 'function_definition':
                    name_n = child.child_by_field_name('name')
                    if name_n:
                        func_name = code_bytes[name_n.start_byte:name_n.end_byte].decode('utf8')
                        func_line = child.start_point.row + 1
            
            if is_route and func_name:
                symbols.append({
                    "id": f"{filepath}::{func_name}",
                    "name": func_name,
                    "kind": "route",
                    "language": "python",
                    "file": filepath,
                    "line": func_line
                })
                return # skip function definition child to avoid double counts

        for child in node.children:
            walk(child)

    walk(tree.root_node)
    return symbols
