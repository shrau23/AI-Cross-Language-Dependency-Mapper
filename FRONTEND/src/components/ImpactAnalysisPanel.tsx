import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { SimulationResult } from '../types';

interface ImpactAnalysisPanelProps {
  result: SimulationResult | null;
}

const ImpactAnalysisPanel = ({ result }: ImpactAnalysisPanelProps) => {
  if (!result) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">Run a simulation to see impact analysis</p>
      </div>
    );
  }

  const getRiskIcon = () => {
    switch (result.riskLevel) {
      case 'Low':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'High':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getRiskColor = () => {
    switch (result.riskLevel) {
      case 'Low':
        return 'bg-green-500/10 border-green-500/20 text-green-500';
      case 'Medium':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500';
      case 'High':
        return 'bg-red-500/10 border-red-500/20 text-red-500';
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <h3 className="text-white font-semibold mb-6 flex items-center space-x-2">
        <AlertCircle className="w-5 h-5 text-blue-500" />
        <span>Impact Analysis</span>
      </h3>

      <div className={`${getRiskColor()} border rounded-lg p-4 mb-6 flex items-center space-x-3`}>
        {getRiskIcon()}
        <div>
          <p className="font-semibold">Risk Level: {result.riskLevel}</p>
          <p className="text-sm opacity-80">{result.affectedFiles.length} files will be affected</p>
        </div>
      </div>

      <div>
        <h4 className="text-gray-400 text-sm mb-3">Affected Files</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {result.affectedFiles.map((file, index) => (
            <div
              key={index}
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 flex items-center justify-between hover:border-gray-600 transition-colors"
            >
              <span className="text-gray-300 text-sm font-mono">{file}</span>
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImpactAnalysisPanel;
