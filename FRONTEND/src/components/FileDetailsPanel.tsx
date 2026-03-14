import { X, FileCode, Code2, GitBranch, Zap, Sparkles } from 'lucide-react';
import { AIExplainResponse, GraphNode } from '../types';

interface FileDetailsPanelProps {
  file: GraphNode | null;
  aiExplanation: AIExplainResponse | null;
  onExplain: (nodeId: string) => void;
  onClose: () => void;
}

const FileDetailsPanel = ({ file, aiExplanation, onExplain, onClose }: FileDetailsPanelProps) => {
  if (!file) return null;

  const apis = Array.isArray(file.metadata.apis) ? (file.metadata.apis as string[]) : [];

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-gray-900 border-l border-gray-700 shadow-2xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
        <h3 className="text-white font-semibold">Node Details</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <FileCode className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-400">Symbol</span>
          </div>
          <p className="text-white font-medium">{file.label}</p>
          <p className="text-xs text-gray-500 mt-1">{file.id}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Code2 className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-400">Language</span>
            </div>
            <span className="inline-block px-3 py-1 bg-purple-500/10 text-purple-300 rounded-full text-sm">
              {file.language}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <GitBranch className="w-5 h-5 text-cyan-500" />
              <span className="text-sm text-gray-400">Risk Score</span>
            </div>
            <p className="text-2xl font-bold text-white">{Math.round(file.risk_score * 100)}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-400">Contracts</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {apis.length > 0 ? (
              apis.map((api, index) => (
                <span key={index} className="px-3 py-1 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-sm">
                  {api}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">No explicit contracts recorded</span>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 mb-2">File Path</p>
          <p className="text-sm text-gray-400 font-mono bg-gray-800 p-2 rounded">{file.file}</p>
        </div>

        <button
          onClick={() => onExplain(file.id)}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate AI Refactor Note</span>
        </button>

        {aiExplanation && aiExplanation.node_id === file.id && (
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 space-y-3">
            <p className="text-sm text-cyan-100">{aiExplanation.summary}</p>
            <p className="text-sm text-gray-300">{aiExplanation.recommendation}</p>
            <pre className="text-xs text-gray-200 bg-gray-950 rounded p-3 overflow-auto whitespace-pre-wrap">
              {aiExplanation.code_snippet}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDetailsPanel;
