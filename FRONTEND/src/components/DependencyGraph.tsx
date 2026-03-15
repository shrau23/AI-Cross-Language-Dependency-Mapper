import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { GraphEdge, GraphNode } from '../types';

type LegacyGraphNode = GraphNode & {
  name?: string;
};

interface DependencyGraphProps {
  nodes: LegacyGraphNode[];
  edges: GraphEdge[];
  selectedNodeId?: string | null;
  highlightedNodeIds?: string[];
  selectedFile?: string | null;
  highlightedNodes?: string[];
  onNodeClick: (nodeId: string) => void;
}

const DependencyGraph = ({
  nodes,
  edges,
  selectedNodeId,
  highlightedNodeIds,
  selectedFile,
  highlightedNodes,
  onNodeClick
}: DependencyGraphProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const layoutRef = useRef<cytoscape.Layout | null>(null);
  const activeSelectedNodeId = selectedNodeId ?? selectedFile ?? null;
  const activeHighlightedNodeIds = highlightedNodeIds ?? highlightedNodes ?? [];

  useEffect(() => {
    if (!containerRef.current) return;
    if (cyRef.current && !cyRef.current.destroyed()) {
      cyRef.current.destroy();
      cyRef.current = null;
    }

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
            label: node.label || node.name || node.id,
            language: node.language || 'unknown'
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
          selector: 'node[label]',
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
        name: 'grid'
      }
    });

    const layout = cy.layout({
      name: 'cose',
      animate: false,
      padding: 50
    });
    layout.run();
    layoutRef.current = layout;

    cy.on('tap', 'node', (event) => {
      onNodeClick(event.target.id());
    });

    cyRef.current = cy;

    return () => {
      layoutRef.current?.stop();
      layoutRef.current = null;
      cy.elements().stop();
      cy.stop();
      cy.destroy();
      if (cyRef.current === cy) {
        cyRef.current = null;
      }
    };
  }, [nodes, edges, onNodeClick]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || cy.destroyed()) return;

    cy.nodes().removeClass('highlighted');
    cy.edges().removeClass('highlighted');

    if (activeSelectedNodeId) {
      const node = cy.$(`#${CSS.escape(activeSelectedNodeId)}`);
      node.select();
    }

    if (activeHighlightedNodeIds.length > 0) {
      const highlightedSet = new Set(activeHighlightedNodeIds);
      activeHighlightedNodeIds.forEach((nodeId) => {
        const node = cy.$(`#${CSS.escape(nodeId)}`);
        if (!node || node.length === 0) return;
        node.addClass('highlighted');
      });

      cy.edges().forEach((edge) => {
        if (highlightedSet.has(edge.source().id()) && highlightedSet.has(edge.target().id())) {
          edge.addClass('highlighted');
        }
      });
    }
  }, [activeSelectedNodeId, activeHighlightedNodeIds]);

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
