import { FileText, Code, GitBranch, AlertTriangle } from 'lucide-react';
import { DashboardMetrics } from '../types';

interface DashboardCardsProps {
  metrics: DashboardMetrics;
}

const DashboardCards = ({ metrics }: DashboardCardsProps) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'High':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const cards = [
    {
      title: 'Total Files Scanned',
      value: metrics.totalFiles,
      icon: FileText,
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      title: 'Languages Detected',
      value: metrics.languagesDetected,
      icon: Code,
      color: 'text-purple-500 bg-purple-500/10'
    },
    {
      title: 'Total Dependencies',
      value: metrics.totalDependencies,
      icon: GitBranch,
      color: 'text-cyan-500 bg-cyan-500/10'
    },
    {
      title: 'Risk Indicator',
      value: metrics.riskLevel,
      icon: AlertTriangle,
      color: getRiskColor(metrics.riskLevel)
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-medium">{card.title}</span>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{card.value}</div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardCards;
