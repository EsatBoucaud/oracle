import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { ArborNode } from '../types';

interface ConstellationViewProps {
  nodes: ArborNode[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  data: ArborNode;
  radius: number;
  color: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  type: 'hierarchy' | 'context';
  weight: number;
  sharedTags?: string[];
}

const DEFAULT_COLOR = '#059fc5';

const hexToRgba = (hex: string | undefined, alpha: number) => {
  if (!hex) return `rgba(5, 159, 197, ${alpha})`;

  const normalized = hex.replace('#', '');
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;

  if (value.length !== 6) return `rgba(5, 159, 197, ${alpha})`;

  const numeric = Number.parseInt(value, 16);
  const r = (numeric >> 16) & 255;
  const g = (numeric >> 8) & 255;
  const b = numeric & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const ConstellationView: React.FC<ConstellationViewProps> = ({ nodes, activeId, onSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const onSelectRef = useRef(onSelect);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const activeNode = activeId ? nodeMap.get(activeId) ?? null : null;

  const getLineageColor = (node: ArborNode | null | undefined) => {
    let current = node ?? null;

    while (current) {
      if (current.color) return current.color;
      current = current.parentId ? nodeMap.get(current.parentId) ?? null : null;
    }

    return DEFAULT_COLOR;
  };

  const activeColor = getLineageColor(activeNode);

  const contextualLinks = useMemo(() => {
    if (!activeNode?.tags?.length) return [];

    return nodes
      .filter((node) => node.id !== activeNode.id && node.tags?.length)
      .map((node) => {
        const sharedTags = node.tags?.filter((tag) => activeNode.tags?.includes(tag)) ?? [];
        return { node, sharedTags };
      })
      .filter((entry) => entry.sharedTags.length > 0)
      .sort((a, b) => b.sharedTags.length - a.sharedTags.length)
      .slice(0, 10);
  }, [activeNode, nodes]);

  const contextualNodeIds = useMemo(
    () => new Set(contextualLinks.map((entry) => entry.node.id)),
    [contextualLinks],
  );

  const hoveredNode = hoveredNodeId ? nodeMap.get(hoveredNodeId) ?? null : null;

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const graphNodes: GraphNode[] = nodes.map((node) => ({
      id: node.id,
      data: node,
      color: getLineageColor(node),
      radius: node.type === 'concept' ? (node.parentId === null ? 24 : 15) : 8,
      x: width / 2 + (Math.random() - 0.5) * 120,
      y: height / 2 + (Math.random() - 0.5) * 120,
    }));

    const graphLinks: GraphLink[] = nodes
      .filter((node) => node.parentId)
      .map((node) => ({
        id: `h-${node.parentId}-${node.id}`,
        source: node.parentId as string,
        target: node.id,
        type: 'hierarchy',
        weight: 1,
      }));

    contextualLinks.forEach(({ node, sharedTags }) => {
      graphLinks.push({
        id: `c-${activeNode?.id}-${node.id}`,
        source: activeNode?.id ?? node.id,
        target: node.id,
        type: 'context',
        weight: sharedTags.length,
        sharedTags,
      });
    });

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const defs = svg.append('defs');

    const glow = defs
      .append('filter')
      .attr('id', 'constellation-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    glow.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'blur');
    const glowMerge = glow.append('feMerge');
    glowMerge.append('feMergeNode').attr('in', 'blur');
    glowMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const activeGlow = defs
      .append('filter')
      .attr('id', 'constellation-active-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    activeGlow.append('feGaussianBlur').attr('stdDeviation', '10').attr('result', 'blur');
    const activeMerge = activeGlow.append('feMerge');
    activeMerge.append('feMergeNode').attr('in', 'blur');
    activeMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const canvas = svg.append('g');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.35, 2.25])
      .on('zoom', (event) => {
        canvas.attr('transform', event.transform);
      });

    svg.call(zoom);
    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(width / 2, height / 2).scale(0.92).translate(-width / 2, -height / 2),
    );

    const simulation = d3
      .forceSimulation<GraphNode>(graphNodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(graphLinks)
          .id((node) => node.id)
          .distance((link) => (link.type === 'hierarchy' ? 130 : 210))
          .strength((link) => (link.type === 'hierarchy' ? 0.75 : 0.08)),
      )
      .force('charge', d3.forceManyBody().strength(-260))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((node) => (node as GraphNode).radius + 18).iterations(2));

    const link = canvas
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(graphLinks)
      .join('line')
      .attr('stroke', (entry) =>
        entry.type === 'hierarchy' ? 'rgba(255,255,255,0.14)' : hexToRgba(activeColor, 0.32),
      )
      .attr('stroke-width', (entry) => (entry.type === 'hierarchy' ? 1.5 : Math.min(1 + entry.weight * 0.4, 2.5)))
      .attr('stroke-dasharray', (entry) => (entry.type === 'context' ? '6 10' : 'none'));

    const nodeGroup = canvas
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(graphNodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event, node) => {
            if (!event.active) simulation.alphaTarget(0.2).restart();
            node.fx = node.x;
            node.fy = node.y;
          })
          .on('drag', (event, node) => {
            node.fx = event.x;
            node.fy = event.y;
          })
          .on('end', (event, node) => {
            if (!event.active) simulation.alphaTarget(0);
            node.fx = null;
            node.fy = null;
          }),
      )
      .on('click', (_, node) => onSelectRef.current(node.id))
      .on('mouseenter', (_, node) => {
        setHoveredNodeId(node.id);
      })
      .on('mouseleave', () => {
        setHoveredNodeId(null);
      });

    nodeGroup
      .filter((node) => node.data.type === 'concept' && (node.id === activeId || node.data.parentId === null))
      .append('circle')
      .attr('r', (node) => node.radius + 9)
      .attr('fill', 'none')
      .attr('stroke', (node) => hexToRgba(node.color, node.id === activeId ? 0.45 : 0.22))
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3 7');

    nodeGroup
      .append('circle')
      .attr('r', (node) => (node.id === activeId ? node.radius + 4 : node.radius + 2))
      .attr('fill', (node) => hexToRgba(node.color, node.id === activeId ? 0.16 : 0.08))
      .attr('opacity', (node) => (node.id === activeId || contextualNodeIds.has(node.id) ? 1 : 0.45));

    nodeGroup
      .append('circle')
      .attr('class', 'core')
      .attr('r', (node) => node.radius)
      .attr('fill', (node) => (node.data.type === 'concept' ? node.color : 'rgba(7, 14, 18, 0.96)'))
      .attr('stroke', (node) => {
        if (node.id === activeId) return '#ffffff';
        if (contextualNodeIds.has(node.id)) return hexToRgba(activeColor, 0.72);
        return node.data.type === 'concept' ? hexToRgba(node.color, 0.4) : 'rgba(255,255,255,0.18)';
      })
      .attr('stroke-width', (node) => (node.id === activeId ? 2.5 : contextualNodeIds.has(node.id) ? 1.75 : 1))
      .attr('filter', (node) => (node.id === activeId ? 'url(#constellation-active-glow)' : null));

    nodeGroup
      .append('text')
      .text((node) => node.data.title)
      .attr('x', (node) => node.radius + 14)
      .attr('y', 4)
      .attr('fill', (node) => (node.id === activeId ? '#fff' : 'rgba(255,255,255,0.7)'))
      .attr('font-family', 'Georgia, serif')
      .attr('font-size', (node) => (node.data.type === 'concept' ? '15px' : '11px'))
      .attr('font-weight', (node) => (node.data.type === 'concept' ? '500' : '400'))
      .attr('class', 'pointer-events-none select-none')
      .attr('opacity', (node) =>
        node.data.type === 'concept' || node.id === activeId || contextualNodeIds.has(node.id) ? 1 : 0.3,
      );

    nodeGroup
      .append('text')
      .text((node) => {
        switch (node.data.type) {
          case 'concept':
            return 'C';
          case 'image':
            return 'I';
          case 'text':
            return 'T';
          case 'link':
            return 'L';
          case 'video':
            return 'V';
          case 'task':
            return 'K';
          default:
            return 'N';
        }
      })
      .attr('text-anchor', 'middle')
      .attr('y', (node) => (node.data.type === 'concept' ? 5 : 3))
      .attr('fill', 'rgba(255,255,255,0.9)')
      .attr('font-size', (node) => (node.data.type === 'concept' ? '15px' : '10px'))
      .attr('class', 'pointer-events-none select-none');

    simulation.on('tick', () => {
      link
        .attr('x1', (entry) => (entry.source as GraphNode).x ?? 0)
        .attr('y1', (entry) => (entry.source as GraphNode).y ?? 0)
        .attr('x2', (entry) => (entry.target as GraphNode).x ?? 0)
        .attr('y2', (entry) => (entry.target as GraphNode).y ?? 0);

      nodeGroup.attr('transform', (node) => `translate(${node.x},${node.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [activeColor, activeId, contextualLinks, contextualNodeIds, nodes]);

  return (
    <div className="relative h-full w-full bg-black/40 backdrop-blur-md" ref={containerRef}>
      <svg ref={svgRef} className="h-full w-full" />

      <div className="pointer-events-none absolute bottom-8 left-8">
        <div className="rounded-2xl border border-white/10 bg-black/60 p-5 shadow-2xl backdrop-blur-md">
          <h3 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-white/40">Constellation</h3>
          <div className="space-y-3 text-xs text-white/70">
            <div className="flex items-center gap-3">
              <div className="h-0.5 w-6 bg-white/30" />
              <span>Hierarchy</span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="h-0.5 w-6 border-t border-dashed"
                style={{ borderColor: hexToRgba(activeColor, 0.75) }}
              />
              <span>Active branch context</span>
            </div>
            <div className="pt-1 text-[11px] uppercase tracking-[0.2em] text-white/35">
              {contextualLinks.length} related signal{contextualLinks.length === 1 ? '' : 's'}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            className="pointer-events-none absolute right-8 top-8 max-w-sm rounded-3xl border border-white/10 bg-black/70 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.24em] text-white/40">
              {hoveredNode.type}
            </div>
            <div className="text-lg font-medium text-white">{hoveredNode.title}</div>
            {(hoveredNode.content || hoveredNode.url) && (
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/60">
                {hoveredNode.content || hoveredNode.url}
              </p>
            )}
            {hoveredNode.tags && hoveredNode.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {hoveredNode.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-white/45"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
