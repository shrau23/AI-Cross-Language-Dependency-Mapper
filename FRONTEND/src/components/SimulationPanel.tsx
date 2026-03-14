import { useState } from 'react';
import { Zap, AlertTriangle } from 'lucide-react';

interface SimulationPanelProps {
  onSimulate: (fileName: string, oldVar: string, newVar: string) => void;
}

const SimulationPanel = ({ onSimulate }: SimulationPanelProps) => {
  const [fileName, setFileName] = useState('user_service.py');
  const [oldVariable, setOldVariable] = useState('getUserData');
  const [newVariable, setNewVariable] = useState('fetchUserProfile');

  const handleSimulate = () => {
    onSimulate(fileName, oldVariable, newVariable);
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Zap className="w-5 h-5 text-yellow-500" />
        <h3 className="text-white font-semibold">Change Simulation</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">File Name</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Current Variable/Function Name</label>
          <input
            type="text"
            value={oldVariable}
            onChange={(e) => setOldVariable(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">New Variable/Function Name</label>
          <input
            type="text"
            value={newVariable}
            onChange={(e) => setNewVariable(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleSimulate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Zap className="w-4 h-4" />
          <span>Simulate Change</span>
        </button>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-200">
            This will analyze the impact of renaming across all dependencies in your codebase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimulationPanel;
