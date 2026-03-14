import { X, FileCode, Code2, GitBranch, Zap } from 'lucide-react';
import { FileNode } from '../types';

interface FileDetailsPanelProps {
  file: FileNode | null;
  onClose: () => void;
}

const FileDetailsPanel = ({ file, onClose }: FileDetailsPanelProps) => {
  if (!file) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-gray-900 border-l border-gray-700 shadow-2xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
        <h3 className="text-white font-semibold">File Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <FileCode className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-400">File Name</span>
          </div>
          <p className="text-white font-medium">{file.name}</p>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Code2 className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-400">Language</span>
          </div>
          <span className="inline-block px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-sm">
            {file.language}
          </span>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-2">
            <GitBranch className="w-5 h-5 text-cyan-500" />
            <span className="text-sm text-gray-400">Dependency Count</span>
          </div>
          <p className="text-2xl font-bold text-white">{file.dependencyCount}</p>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-400">APIs Used</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {file.apis.map((api, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-sm"
              >
                {api}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 mb-2">File Path</p>
          <p className="text-sm text-gray-400 font-mono bg-gray-800 p-2 rounded">
            {file.path}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileDetailsPanel;
