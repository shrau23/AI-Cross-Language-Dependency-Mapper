export interface GraphSummary {
  node_count: number;
  edge_count: number;
  languages: string[];
  high_risk_nodes: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  language: string;
  file: string;
  line?: number | null;
  group: string;
  risk_score: number;
  pagerank: number;
  metadata: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  confidence: number;
  weight: number;
  evidence: string[];
}

export interface GraphResponse {
  repo_id: string;
  generated_at: string;
  summary: GraphSummary;
  nodes: GraphNode[];
  edges: GraphEdge[];
  warnings: string[];
}

export interface FileTreeNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  language?: string;
  children?: FileTreeNode[];
}

export interface DashboardMetrics {
  totalFiles: number;
  languagesDetected: number;
  totalDependencies: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface GraphMetrics {
  totalNodes: number;
  totalEdges: number;
  mostDependentFile: string;
  mostUsedAPI: string;
}

export interface AffectedNode {
  id: string;
  depth: number;
  risk_score: number;
  path_count: number;
}

export interface ImpactSummary {
  affected_count: number;
  high_risk_count: number;
  blast_radius_score: number;
}

export interface ImpactResponse {
  start_node: string;
  algorithm: string;
  max_depth: number;
  affected_nodes: AffectedNode[];
  paths: string[][];
  summary: ImpactSummary;
}

export interface AIExplainResponse {
  node_id: string;
  summary: string;
  recommendation: string;
  code_snippet: string;
  cached: boolean;
}
