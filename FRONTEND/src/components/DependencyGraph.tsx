import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { GraphEdge, GraphNode } from '../types';

interface DependencyGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  highlightedNodeIds: string[];
  onNodeClick: (nodeId: string) => void;
}

const DependencyGraph = ({
  nodes,
  edges,
  selectedNodeId,
  highlightedNodeIds,
  onNodeClick
}: DependencyGraphProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const getLanguageColor = (language: string) => {
      switch (language) {
        case 'python':
          return '#60a5fa';
        case 'javascript':
        case 'typescript':
          return '#fbbf24';
        case 'sql':
          return '#fb923c';
        case 'env':
          return '#34d399';
        default:
          return '#9ca3af';
      }
    };

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...nodes.map((node) => ({
          data: {
            id: node.id,
            label: node.label,
            language: node.language
          }
        })),
        ...edges.map((edge) => ({
          data: {
            id: edge.id,
            source: edge.source,
            target: edge.target
          }
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
            width: 56,
            height: 56,
            'border-width': 2,
            'border-color': '#1f2937',
            'text-wrap': 'wrap',
            'text-max-width': '90px'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': '#22d3ee',
            'border-width': 4
          }
        },
        {
          selector: 'node.highlighted',
          style: {
            'border-color': '#10b981',
            'border-width': 4,
            'overlay-color': '#38bdf8',
            'overlay-opacity': 0.18,
            'overlay-padding': 8
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
            width: 4
          }
        }
      ],
      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 600,
        padding: 50
      }
    });

    cy.on('tap', 'node', (event) => {
      onNodeClick(event.target.id());
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

    if (selectedNodeId) {
      const node = cyRef.current.$(`#${CSS.escape(selectedNodeId)}`);
      node.select();
    }

    if (highlightedNodeIds.length > 0) {
      const highlightedSet = new Set(highlightedNodeIds);
      highlightedNodeIds.forEach((nodeId, index) => {
        const node = cyRef.current!.$(`#${CSS.escape(nodeId)}`);
        node.addClass('highlighted');
        node.animate(
          {
            style: {
              width: 70,
              height: 70
            }
          },
          {
            duration: 180 + index * 60
          }
        );
        node.animate(
          {
            style: {
              width: 56,
              height: 56
            }
          },
          {
            duration: 200
          }
        );
      });

      cyRef.current.edges().forEach((edge) => {
        if (highlightedSet.has(edge.source().id()) && highlightedSet.has(edge.target().id())) {
          edge.addClass('highlighted');
        }
      });
    }
  }, [selectedNodeId, highlightedNodeIds]);

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden h-full">
      <div className="bg-gray-900/50 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-white font-semibold">Dependency Graph</h3>
        <div className="flex items-center space-x-4 text-xs text-gray-400">
          <span>Python</span>
          <span>TS/JS</span>
          <span>SQL</span>
          <span>ENV</span>
        </div>
      </div>
      <div ref={containerRef} className="w-full h-[calc(100%-50px)]" />
    </div>
  );
};

export default DependencyGraph;
