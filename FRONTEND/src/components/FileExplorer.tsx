import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, File } from 'lucide-react';
import { FileTreeNode } from '../types';

interface FileExplorerProps {
  tree: FileTreeNode[];
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
}

interface TreeNodeProps {
  node: FileTreeNode;
  level: number;
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
}

const TreeNode = ({ node, level, selectedFile, onFileSelect }: TreeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isFolder = node.type === 'folder';
  const isSelected = selectedFile === node.path;

  const getLanguageColor = (language?: string) => {
    switch (language) {
      case 'Python':
      case 'python':
        return 'text-blue-400';
      case 'JavaScript':
      case 'javascript':
      case 'typescript':
        return 'text-yellow-400';
      case 'SQL':
      case 'sql':
        return 'text-orange-400';
      case 'env':
        return 'text-emerald-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div>
      <div
        className={`flex items-center space-x-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-700/50 transition-colors ${
          isSelected ? 'bg-blue-600/20 border-l-2 border-blue-500' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (isFolder) {
            setIsExpanded(!isExpanded);
          } else {
            onFileSelect(node.path);
          }
        }}
      >
        {isFolder ? (
          isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )
        ) : (
          <div className="w-4" />
        )}
        {isFolder ? (
          <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" />
        ) : (
          <File className={`w-4 h-4 flex-shrink-0 ${getLanguageColor(node.language)}`} />
        )}
        <span className="text-sm text-gray-300 truncate">{node.name}</span>
      </div>
      {isFolder && isExpanded && node.children && (
        <div>
          {node.children.map((child, index) => (
            <TreeNode
              key={index}
              node={child}
              level={level + 1}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer = ({ tree, selectedFile, onFileSelect }: FileExplorerProps) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 h-full overflow-auto">
      <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
        <Folder className="w-5 h-5 text-blue-500" />
        <span>File Explorer</span>
      </h3>
      <div className="space-y-0.5">
        {tree.map((node, index) => (
          <TreeNode
            key={index}
            node={node}
            level={0}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
