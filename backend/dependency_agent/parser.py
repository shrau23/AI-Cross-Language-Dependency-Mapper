import os
import ast
import networkx as nx

import argparse

parser_arg = argparse.ArgumentParser(description="Extract dependency graph from Python repo")
parser_arg.add_argument("--repo", default="sample_repo", help="Path to repository directory")
args = parser_arg.parse_args()
repo_path = args.repo

edges = []

def get_imports(filepath):
    with open(filepath, "r") as f:
        tree = ast.parse(f.read())

    imports = []

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.append(alias.name)

        elif isinstance(node, ast.ImportFrom):
            imports.append(node.module)

    return imports


files = [f for f in os.listdir(repo_path) if f.endswith('.py')]
modules = [f.replace('.py', '') for f in files]

for file in files:
    module = file.replace('.py', '')
    filepath = os.path.join(repo_path, file)
    imports = get_imports(filepath)
    for imp in imports:
        imp_module = imp.split('.')[0]
        if imp_module in modules and imp_module != module:  # internal non-self
            edges.append((module, imp_module))


G = nx.DiGraph()
G.add_nodes_from(modules)  # Add all modules

for edge in edges:
    G.add_edge(edge[0], edge[1])


import json
print(json.dumps({
    "nodes": list(G.nodes),
    "edges": [list(edge) for edge in G.edges]
}))
