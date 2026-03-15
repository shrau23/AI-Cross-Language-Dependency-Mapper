import { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardCards from './components/DashboardCards';
import FileExplorer from './components/FileExplorer';
import DependencyGraph from './components/DependencyGraph';
import FileDetailsPanel from './components/FileDetailsPanel';
import SimulationPanel from './components/SimulationPanel';
import ImpactAnalysisPanel from './components/ImpactAnalysisPanel';
import GraphMetrics from './components/GraphMetrics';
import { explainNode } from './api/ai';
import { fetchGraph } from './api/graph';
import { runImpactAnalysis } from './api/impact';
import { scanRepository } from './api/scan';
import {
  AIExplainResponse,
  DashboardMetrics,
  FileTreeNode,
  GraphMetrics as GraphMetricsType,
  GraphNode,
  GraphResponse,
  ImpactResponse,
  ScanResponse
} from './types';

function buildFileTree(nodes: GraphNode[]): FileTreeNode[] {
  const root: FileTreeNode = {
    name: 'project',
    type: 'folder',
    path: 'project',
    children: []
  };

  const pathMap = new Map<string, FileTreeNode>([['project', root]]);

  nodes.forEach((node) => {
    const parts = node.file.split('/');
    let currentPath = 'project';

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const nextPath = `${currentPath}/${part}`;

      if (!pathMap.has(nextPath)) {
        const nextNode: FileTreeNode = {
          name: part,
          type: isFile ? 'file' : 'folder',
          path: nextPath,
          language: isFile ? node.language : undefined,
          children: isFile ? undefined : []
        };
        pathMap.set(nextPath, nextNode);
        pathMap.get(currentPath)?.children?.push(nextNode);
      }

      currentPath = nextPath;
    });
  });

  return [root];
}

function deriveDashboardMetrics(graph: GraphResponse): DashboardMetrics {
  const riskLevel = graph.summary.high_risk_nodes >= 4
    ? 'High'
    : graph.summary.high_risk_nodes >= 2
      ? 'Medium'
      : 'Low';

  return {
    totalFiles: graph.summary.node_count,
    languagesDetected: graph.summary.languages.length,
    totalDependencies: graph.summary.edge_count,
    riskLevel
  };
}

function deriveGraphMetrics(graph: GraphResponse): GraphMetricsType {
  const counts = new Map<string, number>();
  graph.nodes.forEach((node) => counts.set(node.id, 0));
  graph.edges.forEach((edge) => {
    counts.set(edge.source, (counts.get(edge.source) || 0) + 1);
    counts.set(edge.target, (counts.get(edge.target) || 0) + 1);
  });

  const mostConnected = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'n/a';
  const apiNode = graph.nodes.find((node) => node.type === 'api');

  return {
    totalNodes: graph.summary.node_count,
    totalEdges: graph.summary.edge_count,
    mostDependentFile: mostConnected,
    mostUsedAPI: apiNode?.label || 'n/a'
  };
}

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [graph, setGraph] = useState<GraphResponse | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);
  const [impactResult, setImpactResult] = useState<ImpactResponse | null>(null);
  const [aiExplanation, setAiExplanation] = useState<AIExplainResponse | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadGraphData() {
      try {
        setLoading(true);
        const data = await fetchGraph();
        if (!mounted) return;
        setGraph(data);
        setConnected(true);
        setError(null);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load graph');
        setConnected(false);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadGraphData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000/ws';
    const socket = new WebSocket(wsUrl);
    let isUnmounting = false;

    socket.onopen = () => {
      if (!isUnmounting) {
        setConnected(true);
      }
    };
    socket.onerror = () => {
      if (!isUnmounting) {
        setConnected(false);
      }
    };
    socket.onclose = () => {
      if (!isUnmounting) {
        setConnected(false);
      }
    };
    socket.onmessage = () => {
      if (!isUnmounting) {
        setConnected(true);
      }
    };

    return () => {
      isUnmounting = true;
      socket.onopen = null;
      socket.onerror = null;
      socket.onclose = null;
      socket.onmessage = null;
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  const nodes = graph?.nodes || [];
  const edges = graph?.edges || [];

  const filteredNodes = useMemo(() => {
    if (!query.trim()) return nodes;
    const lower = query.toLowerCase();
    return nodes.filter((node) =>
      node.label.toLowerCase().includes(lower) ||
      node.id.toLowerCase().includes(lower) ||
      node.file.toLowerCase().includes(lower)
    );
  }, [nodes, query]);

  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map((node) => node.id));
    return edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
  }, [edges, filteredNodes]);

  const dashboardMetrics = useMemo(
    () =>
      graph
        ? deriveDashboardMetrics(graph)
        : { totalFiles: 0, languagesDetected: 0, totalDependencies: 0, riskLevel: 'Low' as const },
    [graph]
  );

  const graphMetrics = useMemo(
    () =>
      graph
        ? deriveGraphMetrics(graph)
        : { totalNodes: 0, totalEdges: 0, mostDependentFile: 'n/a', mostUsedAPI: 'n/a' },
    [graph]
  );

  const fileTree = useMemo(() => buildFileTree(filteredNodes), [filteredNodes]);
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) || null;

  useEffect(() => {
    if (!query.trim()) return;
    const lower = query.toLowerCase();
    const match = nodes.find((node) =>
      node.label.toLowerCase().includes(lower) ||
      node.id.toLowerCase().includes(lower) ||
      node.file.toLowerCase().includes(lower)
    );

    if (match) {
      setSelectedNodeId(match.id);
      setHighlightedNodeIds([match.id]);
    }
  }, [nodes, query]);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setHighlightedNodeIds([nodeId]);
    setAiExplanation(null);
  };

  const handleFileSelect = (path: string) => {
    const normalized = path.replace(/^project\//, '');
    const match = nodes.find((node) => node.file === normalized);
    if (match) {
      handleNodeClick(match.id);
    }
  };

  const handleSimulation = async (nodeId: string) => {
    try {
      const result = await runImpactAnalysis(nodeId);
      setImpactResult(result);
      setSelectedNodeId(nodeId);
      setHighlightedNodeIds([nodeId, ...result.affected_nodes.map((node) => node.id)]);
      setActiveView('simulation');
      setError(null);
    } catch (simulationError) {
      setError(simulationError instanceof Error ? simulationError.message : 'Impact analysis failed');
    }
  };

  const handleExplain = async (nodeId: string) => {
    try {
      const result = await explainNode(nodeId, 'Give a concise safe-refactor explanation for the selected node.');
      setAiExplanation(result);
      setError(null);
    } catch (explainError) {
      setError(explainError instanceof Error ? explainError.message : 'AI explanation failed');
    }
  };

  const handleScanRepo = async () => {
    if (!repoUrl.trim()) {
      setError('Enter a GitHub repository URL first.');
      return;
    }

    try {
      setIsScanning(true);
      const result = await scanRepository(repoUrl.trim());
      setGraph(result.graph);
      setScanResult(result);
      setSelectedNodeId(result.graph.nodes[0]?.id || null);
      setHighlightedNodeIds(result.graph.nodes[0] ? [result.graph.nodes[0].id] : []);
      setImpactResult(null);
      setAiExplanation(null);
      setError(null);
      setActiveView('graph');
      setConnected(true);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : 'Repository scan failed');
      setConnected(false);
    } finally {
      setIsScanning(false);
    }
  };

  const selectedFilePath = selectedNode ? `project/${selectedNode.file}` : null;

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <div className="flex-1 flex flex-col">
        <Header
          query={query}
          onQueryChange={setQuery}
          repoId={graph?.repo_id || 'demo-fastapi-react-postgres-redis'}
          connected={connected}
        />

        <main className="flex-1 overflow-auto">
          {loading && (
            <div className="p-6">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center text-gray-400">
                Loading graph from backend...
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="p-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-red-200">
                {error}
              </div>
            </div>
          )}

          {!loading && graph && activeView === 'dashboard' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Project Dashboard</h2>
                <p className="text-gray-400">Live overview of the dependency graph, risk hotspots, and blast radius.</p>
              </div>

              <DashboardCards metrics={dashboardMetrics} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <FileExplorer tree={fileTree} selectedFile={selectedFilePath} onFileSelect={handleFileSelect} />
                </div>

                <div className="lg:col-span-2 h-[600px]">
                  <DependencyGraph
                    nodes={filteredNodes}
                    edges={filteredEdges}
                    selectedNodeId={selectedNodeId}
                    highlightedNodeIds={highlightedNodeIds}
                    onNodeClick={handleNodeClick}
                  />
                </div>
              </div>

              <GraphMetrics metrics={graphMetrics} />
            </div>
          )}

          {!loading && graph && activeView === 'graph' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Dependency Graph</h2>
                <p className="text-gray-400">Click a node to inspect it, then simulate its blast radius.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <FileExplorer tree={fileTree} selectedFile={selectedFilePath} onFileSelect={handleFileSelect} />
                </div>
                <div className="lg:col-span-3 h-[700px]">
                  <DependencyGraph
                    nodes={filteredNodes}
                    edges={filteredEdges}
                    selectedNodeId={selectedNodeId}
                    highlightedNodeIds={highlightedNodeIds}
                    onNodeClick={handleNodeClick}
                  />
                </div>
              </div>

              <GraphMetrics metrics={graphMetrics} />
            </div>
          )}

          {!loading && graph && activeView === 'simulation' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Impact Simulation</h2>
                <p className="text-gray-400">Run backend BFS/DFS analysis and visualize the downstream impact path.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SimulationPanel nodes={nodes} selectedNodeId={selectedNodeId} onSimulate={handleSimulation} />
                <ImpactAnalysisPanel result={impactResult} />
              </div>

              <div className="h-[500px]">
                <DependencyGraph
                  nodes={nodes}
                  edges={edges}
                  selectedNodeId={selectedNodeId}
                  highlightedNodeIds={highlightedNodeIds}
                  onNodeClick={handleNodeClick}
                />
              </div>
            </div>
          )}

          {!loading && graph && activeView === 'scan' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Scan Repository</h2>
                <p className="text-gray-400">Paste a public GitHub repo URL to build a fresh dependency graph from it.</p>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-4">
                <input
                  type="text"
                  placeholder="https://github.com/owner/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleScanRepo}
                  disabled={isScanning}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  {isScanning ? 'Scanning repository...' : 'Scan GitHub Repository'}
                </button>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 space-y-2">
                <p className="text-white font-medium">Current snapshot</p>
                <p className="text-gray-400">Repo ID: {graph.repo_id}</p>
                <p className="text-gray-400">Generated: {graph.generated_at}</p>
                <p className="text-gray-400">Warnings: {graph.warnings.length}</p>
                {scanResult && (
                  <>
                    <p className="text-emerald-300">Last scan repo: {scanResult.repo_name}</p>
                    <p className="text-gray-400">Files scanned: {scanResult.file_count}</p>
                    <p className="text-gray-400">Source URL: {scanResult.repo_url}</p>
                  </>
                )}
              </div>
            </div>
          )}

          {!loading && graph && activeView === 'reports' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Reports</h2>
                <p className="text-gray-400">Judge-friendly summary of why the cross-language graph matters.</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8">
                <p className="text-white mb-2">Narrative</p>
                <p className="text-gray-400">
                  A change in the user API ripples through frontend pages, auth middleware, Redis caching,
                  SQL tables, and analytics workers. This is the core story the live blast-radius demo now shows.
                </p>
              </div>
            </div>
          )}

          {!loading && graph && activeView === 'settings' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
                <p className="text-gray-400">This frontend reads backend URLs from environment variables.</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8">
                <p className="text-gray-400">Configure `VITE_API_BASE_URL` and `VITE_WS_URL` to point at another backend.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {selectedNode && (
        <FileDetailsPanel
          file={selectedNode}
          aiExplanation={aiExplanation}
          onExplain={handleExplain}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}

export default App;
