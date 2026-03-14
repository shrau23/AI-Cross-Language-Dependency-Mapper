import json

# Ground truth for sample_repo
GROUND_TRUTH = {
  'nodes': ['payment', 'order_service', 'checkout'],
  'edges': [['payment', 'order_service']]
}

# Paste parser output
parser_data = {
    "nodes": ["checkout", "order_service", "payment"],
    "edges": [["payment", "order_service"]]
}

def evaluate(graph_pred, graph_gt):
    pred_nodes = set(graph_pred['nodes'])
    gt_nodes = set(graph_gt['nodes'])
    node_precision = len(pred_nodes & gt_nodes) / len(pred_nodes) if pred_nodes else 0
    node_recall = len(pred_nodes & gt_nodes) / len(gt_nodes) if gt_nodes else 0
    node_f1 = 2 * node_precision * node_recall / (node_precision + node_recall) if (node_precision + node_recall) else 0

    pred_edges = set(tuple(e) for e in graph_pred['edges'])
    gt_edges = set(tuple(e) for e in graph_gt['edges'])
    edge_precision = len(pred_edges & gt_edges) / len(pred_edges) if pred_edges else 0
    edge_recall = len(pred_edges & gt_edges) / len(gt_edges) if gt_edges else 0
    edge_f1 = 2 * edge_precision * edge_recall / (edge_precision + edge_recall) if (edge_precision + edge_recall) else 0

    print(f'Node P/R/F1: {node_precision:.2f}/{node_recall:.2f}/{node_f1:.2f}')
    print(f'Edge P/R/F1: {edge_precision:.2f}/{edge_recall:.2f}/{edge_f1:.2f}')
    print('Overall F1:', (node_f1 + edge_f1)/2)

evaluate(parser_data, GROUND_TRUTH)

