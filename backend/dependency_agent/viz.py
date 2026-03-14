import networkx as nx
import matplotlib.pyplot as plt
import json

import sys
import json

import subprocess

# Run parser.py and load output directly
output = subprocess.check_output(['python', 'parser.py'], cwd='dependency_agent').decode('utf-8')
data = json.loads(output)
print("Loaded graph:", data)

G = nx.DiGraph()
G.add_nodes_from(data['nodes'])
G.add_edges_from(data['edges'])

pos = nx.spring_layout(G)
nx.draw(G, pos, with_labels=True, node_color='lightblue', edge_color='gray')
plt.show()

