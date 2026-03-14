import { useEffect, useState } from 'react';
import { Zap, AlertTriangle } from 'lucide-react';
import { GraphNode } from '../types';

interface SimulationPanelProps {
  nodes: GraphNode[];
  selectedNodeId: string | null;
  onSimulate: (nodeId: string) => void;
}

const SimulationPanel = ({ nodes, selectedNodeId, onSimulate }: SimulationPanelProps) => {
  const [nodeId, setNodeId] = useState(selectedNodeId || '');

  useEffect(() => {
    if (selectedNodeId) {
      setNodeId(selectedNodeId);
    }
  }, [selectedNodeId]);

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Zap className="w-5 h-5 text-yellow-500" />
        <h3 className="text-white font-semibold">Impact Simulation</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Start Node</label>
          <select
            value={nodeId}
            onChange={(e) => setNodeId(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select a node</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.label} ({node.language})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => nodeId && onSimulate(nodeId)}
          disabled={!nodeId}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Zap className="w-4 h-4" />
          <span>Run Blast Radius</span>
        </button>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-200">
            This calls the backend impact API and highlights the downstream dependency chain.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimulationPanel;
