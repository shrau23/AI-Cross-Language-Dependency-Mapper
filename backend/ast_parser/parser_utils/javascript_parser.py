import tree_sitter_javascript as tsjavascript
from tree_sitter import Language, Parser
import os

JS_LANGUAGE = Language(tsjavascript.language())
parser = Parser(JS_LANGUAGE)

def extract_string_value(node, code_bytes):
    text = code_bytes[node.start_byte:node.end_byte].decode('utf8')
    return text.strip('`\'"')

def parse_javascript(code_str: str, filepath: str) -> list[dict]:
    code_bytes = code_str.encode('utf8')
    tree = parser.parse(code_bytes)
    symbols = []

    def walk(node):
        if node.type in ['function_declaration', 'method_definition']:
            name_node = node.child_by_field_name('name')
            if name_node:
                sym_name = code_bytes[name_node.start_byte:name_node.end_byte].decode('utf8')
                kind = 'react_component' if sym_name and sym_name[0].isupper() else 'function'
                symbols.append({"name": sym_name, "kind": kind, "line": node.start_point.row + 1})
        
        elif node.type in ['lexical_declaration', 'variable_declaration']:
            for child in node.children:
                if child.type == 'variable_declarator':
                    name_node = child.child_by_field_name('name')
                    value_node = child.child_by_field_name('value')
                    
                    if name_node and value_node and value_node.type == 'arrow_function':
                        sym_name = code_bytes[name_node.start_byte:name_node.end_byte].decode('utf8')
                        kind = 'react_component' if sym_name and sym_name[0].isupper() else 'function'
                        symbols.append({"name": sym_name, "kind": kind, "line": node.start_point.row + 1})

        elif node.type == 'call_expression':
            func_node = node.child_by_field_name('function')
            if func_node and code_bytes[func_node.start_byte:func_node.end_byte].decode('utf8') == 'fetch':
                args_node = node.child_by_field_name('arguments')
                if args_node and args_node.child_count > 1:
                    first_arg = args_node.children[1]
                    if first_arg.type == 'string':
                        url = extract_string_value(first_arg, code_bytes)
                        if url.startswith('/api/') or 'api' in url:
                            symbols.append({"name": url, "kind": "api_call", "line": node.start_point.row + 1})

        for child in node.children:
            walk(child)

    walk(tree.root_node)
    
    unique_symbols = []
    seen = set()
    for s in symbols:
        identifier = f"{s['name']}::{s['line']}"
        if identifier not in seen:
            seen.add(identifier)
            unique_symbols.append(s)
            
    return unique_symbols
