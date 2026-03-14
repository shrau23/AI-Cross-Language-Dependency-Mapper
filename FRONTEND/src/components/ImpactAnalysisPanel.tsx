import { AlertCircle, CheckCircle, AlertTriangle, Route } from 'lucide-react';
import { ImpactResponse } from '../types';

interface ImpactAnalysisPanelProps {
  result: ImpactResponse | null;
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

  const riskLevel = result.summary.blast_radius_score >= 70
    ? 'High'
    : result.summary.blast_radius_score >= 35
      ? 'Medium'
      : 'Low';

  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'Low':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'High':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'Low':
        return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'Medium':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      case 'High':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <h3 className="text-white font-semibold mb-6 flex items-center space-x-2">
        <AlertCircle className="w-5 h-5 text-blue-500" />
        <span>Impact Analysis</span>
      </h3>

      <div className={`${getRiskColor()} border rounded-lg p-4 mb-6 flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          {getRiskIcon()}
          <div>
            <p className="font-semibold">Risk Level: {riskLevel}</p>
            <p className="text-sm opacity-80">{result.summary.affected_count} nodes affected</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide opacity-70">Blast Radius</p>
          <p className="text-2xl font-bold">{result.summary.blast_radius_score}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">High-Risk Nodes</p>
          <p className="text-2xl font-bold text-white">{result.summary.high_risk_count}</p>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Traversal</p>
          <p className="text-2xl font-bold text-white uppercase">{result.algorithm}</p>
        </div>
      </div>

      <div>
        <h4 className="text-gray-400 text-sm mb-3">Affected Nodes</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {result.affected_nodes.map((node) => (
            <div key={node.id} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 flex items-center justify-between">
              <div>
                <span className="text-gray-300 text-sm font-mono">{node.id}</span>
                <p className="text-xs text-gray-500 mt-1">Depth {node.depth} • Paths {node.path_count}</p>
              </div>
              <span className="text-sm text-cyan-300">{Math.round(node.risk_score * 100)}</span>
            </div>
          ))}
        </div>
        
        {/* EXPORT BUTTON - Person D Final Touch */}
        <button 
          onClick={() => {
            const report = {
              change: 'detected_function',
              impacted_modules: result.affectedFiles,
              riskLevel: result.riskLevel,
              timestamp: new Date().toISOString()
            };
            navigator.clipboard.writeText(JSON.stringify(report, null, 2));
            alert('✅ Breakage Report Copied! Paste to clipboard.');
          }}
          className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          💾 Copy Breakage Report JSON
        </button>
      </div>

      {result.paths.length > 0 && (
        <div className="mt-6">
          <h4 className="text-gray-400 text-sm mb-3 flex items-center space-x-2">
            <Route className="w-4 h-4" />
            <span>Key Propagation Path</span>
          </h4>
          <div className="bg-gray-950 border border-gray-700 rounded-lg p-4 text-sm text-gray-300">
            {result.paths[0].join(' -> ')}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpactAnalysisPanel;
