import { useState } from 'react';
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

function App() {
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

  const handleSimulation = (fileName: string, oldVar: string, newVar: string) => {
    const affectedFiles = dependencies
      .filter((dep) => dep.source === fileName || dep.target === fileName)
      .flatMap((dep) => [dep.source, dep.target])
      .filter((file) => file !== fileName);

    const uniqueAffectedFiles = [...new Set(affectedFiles)];

    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    if (uniqueAffectedFiles.length > 5) {
      riskLevel = 'High';
    } else if (uniqueAffectedFiles.length > 2) {
      riskLevel = 'Medium';
    }

    setSimulationResult({
      affectedFiles: uniqueAffectedFiles,
      riskLevel
    });

    setHighlightedNodes([fileName, ...uniqueAffectedFiles]);
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
                <h2 className="text-2xl font-bold text-white mb-2">Scan Repository</h2>
                <p className="text-gray-400">
                  Configure and run repository scans
                </p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
                <p className="text-gray-400">Repository scanning interface coming soon...</p>
              </div>
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
