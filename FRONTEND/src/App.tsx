import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardCards from './components/DashboardCards';
import FileExplorer from './components/FileExplorer';
import DependencyGraph from './components/DependencyGraph';
import FileDetailsPanel from './components/FileDetailsPanel';
import SimulationPanel from './components/SimulationPanel';
import ImpactAnalysisPanel from './components/ImpactAnalysisPanel';
import GraphMetrics from './components/GraphMetrics';
import {
  fileNodes,
  dependencies,
  fileTree,
  dashboardMetrics,
  graphMetrics
} from './data/sampleData';
import { FileNode, SimulationResult } from './types';
import { useN8n } from './hooks/useN8n';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const { predictBreakage, scanRepo } = useN8n();

  const handleScanRepo = async () => {
    setIsScanning(true);
    try {
      const result = await scanRepo(repoUrl);
      // TODO: Update graph with real nodes/edges from result
      setHighlightedNodes(['user_service.py', 'checkout.py']); // Mock highlight
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const handleFileSelect = (path: string) => {
    const fileName = path.split('/').pop() || '';
    const node = fileNodes.find((n) => n.id === fileName);
    setSelectedFile(fileName);
    setSelectedNode(node || null);

    if (node) {
      const connected = dependencies
        .filter((dep) => dep.source === fileName || dep.target === fileName)
        .flatMap((dep) => [dep.source, dep.target]);
      setHighlightedNodes([...new Set([fileName, ...connected])]);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    const node = fileNodes.find((n) => n.id === nodeId);
    setSelectedFile(nodeId);
    setSelectedNode(node || null);

    if (node) {
      const connected = dependencies
        .filter((dep) => dep.source === nodeId || dep.target === nodeId)
        .flatMap((dep) => [dep.source, dep.target]);
      setHighlightedNodes([...new Set([nodeId, ...connected])]);
    }
  };

  const handleSimulation = async (fileName: string, oldVar: string, newVar: string) => {
    const change = oldVar;
    
    const result = await predictBreakage(change);
    const impacted_modules = result.impacted_modules;
    
    const riskLevel = impacted_modules.length > 2 ? 'High' : impacted_modules.length > 1 ? 'Medium' : 'Low';

    setSimulationResult({
      affectedFiles: impacted_modules,
      riskLevel: riskLevel as 'Low' | 'Medium' | 'High'
    });
    
    setHighlightedNodes([fileName, ...impacted_modules]);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 overflow-auto">
          {activeView === 'dashboard' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Project Dashboard</h2>
                <p className="text-gray-400">
                  Overview of your cross-language dependency analysis
                </p>
              </div>

              <DashboardCards metrics={dashboardMetrics} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <FileExplorer
                    tree={fileTree}
                    selectedFile={selectedFile}
                    onFileSelect={handleFileSelect}
                  />
                </div>

                <div className="lg:col-span-2 h-[600px]">
                  <DependencyGraph
                    nodes={fileNodes}
                    edges={dependencies}
                    selectedFile={selectedFile}
                    highlightedNodes={highlightedNodes}
                    onNodeClick={handleNodeClick}
                  />
                </div>
              </div>

              <GraphMetrics metrics={graphMetrics} />
            </div>
          )}

          {activeView === 'graph' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Dependency Graph</h2>
                <p className="text-gray-400">
                  Interactive visualization of file dependencies
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <FileExplorer
                    tree={fileTree}
                    selectedFile={selectedFile}
                    onFileSelect={handleFileSelect}
                  />
                </div>

                <div className="lg:col-span-3 h-[700px]">
                  <DependencyGraph
                    nodes={fileNodes}
                    edges={dependencies}
                    selectedFile={selectedFile}
                    highlightedNodes={highlightedNodes}
                    onNodeClick={handleNodeClick}
                  />
                </div>
              </div>

              <GraphMetrics metrics={graphMetrics} />
            </div>
          )}

          {activeView === 'simulation' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Impact Simulation</h2>
                <p className="text-gray-400">
                  Simulate code changes and analyze their impact
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SimulationPanel onSimulate={handleSimulation} />
                <ImpactAnalysisPanel result={simulationResult} />
              </div>

              <div className="h-[500px]">
                <DependencyGraph
                  nodes={fileNodes}
                  edges={dependencies}
                  selectedFile={selectedFile}
                  highlightedNodes={highlightedNodes}
                  onNodeClick={handleNodeClick}
                />
              </div>
            </div>
          )}

          {activeView === 'scan' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Scan GitHub Repo</h2>
                <p className="text-gray-400">Paste repo URL to analyze dependencies</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <input
                  type="text"
                  placeholder="https://github.com/user/repo"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 mb-4 text-white focus:outline-none focus:border-blue-500"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
                <button 
                  onClick={handleScanRepo}
                  disabled={isScanning}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {isScanning ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      🚀 Scan Repository
                    </>
                  )}
                </button>
              </div>
              {isScanning && (
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-300">Analyzing dependencies... This will trigger the full pipeline!</p>
                </div>
              )}
            </div>
          )}

          {activeView === 'reports' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Reports</h2>
                <p className="text-gray-400">
                  Generate and view dependency reports
                </p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
                <p className="text-gray-400">Reports interface coming soon...</p>
              </div>
            </div>
          )}

          {activeView === 'settings' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
                <p className="text-gray-400">
                  Configure application preferences
                </p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
                <p className="text-gray-400">Settings interface coming soon...</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {selectedNode && (
        <FileDetailsPanel file={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  );
}

export default App;
