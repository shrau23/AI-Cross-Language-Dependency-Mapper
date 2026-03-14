import { Network, GitBranch, FileCode, Zap } from 'lucide-react';
import { GraphMetrics as GraphMetricsType } from '../types';

interface GraphMetricsProps {
  metrics: GraphMetricsType;
}

const GraphMetrics = ({ metrics }: GraphMetricsProps) => {
  const cards = [
    {
      title: 'Total Nodes',
      value: metrics.totalNodes,
      icon: Network,
      color: 'text-blue-400 bg-blue-500/10'
    },
    {
      title: 'Total Edges',
      value: metrics.totalEdges,
      icon: GitBranch,
      color: 'text-green-400 bg-green-500/10'
    },
    {
      title: 'Most Connected',
      value: metrics.mostDependentFile,
      icon: FileCode,
      color: 'text-orange-400 bg-orange-500/10',
      isText: true
    },
    {
      title: 'Primary Contract',
      value: metrics.mostUsedAPI,
      icon: Zap,
      color: 'text-cyan-400 bg-cyan-500/10',
      isText: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-xs font-medium">{card.title}</span>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className={`${card.isText ? 'text-lg' : 'text-2xl'} font-bold text-white truncate`}>
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GraphMetrics;
