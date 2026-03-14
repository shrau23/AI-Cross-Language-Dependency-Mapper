export interface FileNode {
  id: string;
  name: string;
  language: string;
  path: string;
  apis: string[];
  dependencyCount: number;
}

export interface Dependency {
  source: string;
  target: string;
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

export interface SimulationResult {
  affectedFiles: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
}
