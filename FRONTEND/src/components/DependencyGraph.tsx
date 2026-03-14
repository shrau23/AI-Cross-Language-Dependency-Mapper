import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { FileNode, Dependency } from '../types';

interface DependencyGraphProps {
  nodes: FileNode[];
  edges: Dependency[];
  selectedFile: string | null;
  highlightedNodes: string[];
  onNodeClick: (nodeId: string) => void;
}

const DependencyGraph = ({
  nodes,
  edges,
  selectedFile,
  highlightedNodes,
  onNodeClick
}: DependencyGraphProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const getLanguageColor = (language: string) => {
      switch (language) {
        case 'Python':
          return '#3b82f6';
        case 'JavaScript':
          return '#fbbf24';
        case 'SQL':
          return '#f97316';
        default:
          return '#6b7280';
      }
    };

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...nodes.map((node) => ({
          data: { id: node.id, label: node.name, language: node.language }
        })),
        ...edges.map((edge) => ({
          data: { source: edge.source, target: edge.target }
        }))
      ],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': (ele) => getLanguageColor(ele.data('language')),
            label: 'data(label)',
            color: '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '10px',
            width: 60,
            height: 60,
            'border-width': 2,
            'border-color': '#1f2937',
            'text-wrap': 'wrap',
            'text-max-width': '80px'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': '#06b6d4',
            'border-width': 3
          }
        },
        {
          selector: 'node.highlighted',
          style: {
            'border-color': '#10b981',
            'border-width': 3,
            'background-color': '#10b981'
          }
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': '#4b5563',
            'target-arrow-color': '#4b5563',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        },
        {
          selector: 'edge.highlighted',
          style: {
            'line-color': '#10b981',
            'target-arrow-color': '#10b981',
            width: 3
          }
        }
      ],
      layout: {
        name: 'circle',
        padding: 50
      }
    });

    cy.on('tap', 'node', (event) => {
      const nodeId = event.target.id();
      onNodeClick(nodeId);
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [nodes, edges, onNodeClick]);

  useEffect(() => {
    if (!cyRef.current) return;

    cyRef.current.nodes().removeClass('highlighted');
    cyRef.current.edges().removeClass('highlighted');

    if (selectedFile) {
      cyRef.current.$(`#${selectedFile}`).select();
    }

    if (highlightedNodes.length > 0) {
      highlightedNodes.forEach((nodeId) => {
        cyRef.current!.$(`#${nodeId}`).addClass('highlighted');
        cyRef.current!.edges().forEach((edge) => {
          if (
            highlightedNodes.includes(edge.source().id()) &&
            highlightedNodes.includes(edge.target().id())
          ) {
            edge.addClass('highlighted');
          }
        });
      });
    }
  }, [selectedFile, highlightedNodes]);

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden h-full">
      <div className="bg-gray-900/50 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-white font-semibold">Dependency Graph</h3>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-400">Python</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-400">JavaScript</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-gray-400">SQL</span>
          </div>
        </div>
      </div>
      <div ref={containerRef} className="w-full h-[calc(100%-50px)]" />
    </div>
  );
};

export default DependencyGraph;
