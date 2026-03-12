import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ArborNode } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ConstellationViewProps {
  nodes: ArborNode[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  data: ArborNode;
  radius: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  type: 'hierarchy' | 'tag';
  weight: number;
  index?: number;
  sharedTags?: string[];
}

export const ConstellationView: React.FC<ConstellationViewProps> = ({ nodes, activeId, onSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<GraphLink | null>(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Prepare data
    const graphNodes: GraphNode[] = nodes.map(n => ({
      id: n.id,
      data: n,
      radius: n.type === 'concept' ? (n.parentId === null ? 28 : 18) : 8,
      x: width / 2 + (Math.random() - 0.5) * 100,
      y: height / 2 + (Math.random() - 0.5) * 100,
    }));

    const graphLinks: GraphLink[] = [];

    // 1. Hierarchy links
    nodes.forEach(n => {
      if (n.parentId) {
        graphLinks.push({
          id: `h-${n.parentId}-${n.id}`,
          source: n.parentId,
          target: n.id,
          type: 'hierarchy',
          weight: 1
        });
      }
    });

    // 2. Meta connections (shared tags)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        if (n1.tags && n2.tags) {
          const shared = n1.tags.filter(t => n2.tags!.includes(t));
          if (shared.length > 0) {
            graphLinks.push({
              id: `t-${n1.id}-${n2.id}`,
              source: n1.id,
              target: n2.id,
              type: 'tag',
              weight: shared.length,
              sharedTags: shared
            });
          }
        }
      }
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous

    // Add definitions for glow effects
    const defs = svg.append('defs');
    
    // Core glow
    const filter = defs.append('filter').attr('id', 'glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Intense glow for active
    const activeFilter = defs.append('filter').attr('id', 'active-glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    activeFilter.append('feGaussianBlur').attr('stdDeviation', '12').attr('result', 'coloredBlur');
    const activeFeMerge = activeFilter.append('feMerge');
    activeFeMerge.append('feMergeNode').attr('in', 'coloredBlur');
    activeFeMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    // Initial transform to center
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8).translate(-width / 2, -height / 2));

    // Simulation
    const simulation = d3.forceSimulation<GraphNode>(graphNodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(graphLinks).id(d => d.id)
        .distance(d => d.type === 'hierarchy' ? 120 : 300)
        .strength(d => d.type === 'hierarchy' ? 0.8 : 0.1 * d.weight)
      )
      .force('charge', d3.forceManyBody().strength(-600))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(d => (d as GraphNode).radius + 30).iterations(3));

    // Draw links (background lines)
    const linkGroup = g.append('g').attr('class', 'links');
    
    const link = linkGroup
      .selectAll('line')
      .data(graphLinks)
      .join('line')
      .attr('stroke', d => d.type === 'hierarchy' ? 'rgba(255,255,255,0.15)' : 'rgba(99, 102, 241, 0.2)')
      .attr('stroke-width', d => d.type === 'hierarchy' ? 2 : d.weight)
      .attr('stroke-dasharray', d => d.type === 'tag' ? '4,8' : 'none')
      .on('mouseenter', (event, d) => {
        if (d.type === 'tag') {
          setHoveredLink(d);
          d3.select(event.currentTarget).attr('stroke', 'rgba(99, 102, 241, 0.8)').attr('stroke-width', d.weight + 2);
        }
      })
      .on('mouseleave', (event, d) => {
        if (d.type === 'tag') {
          setHoveredLink(null);
          d3.select(event.currentTarget).attr('stroke', 'rgba(99, 102, 241, 0.2)').attr('stroke-width', d.weight);
        }
      });

    // Draw animated particles along tag links
    const particleLinks = graphLinks.filter(l => l.type === 'tag');
    const particles = linkGroup
      .selectAll('circle.particle')
      .data(particleLinks)
      .join('circle')
      .attr('class', 'particle pointer-events-none')
      .attr('r', d => Math.max(2, d.weight))
      .attr('fill', '#818cf8')
      .attr('filter', 'url(#glow)')
      .attr('opacity', 0.6);

    // Draw nodes
    const nodeGroup = g.append('g').attr('class', 'nodes')
      .selectAll('g')
      .data(graphNodes)
      .join('g')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      )
      .on('click', (event, d) => {
        onSelect(d.id);
      })
      .on('mouseenter', (event, d) => {
        setHoveredNode(d.id);
        if (d.id !== activeId) {
          d3.select(event.currentTarget).select('circle.core').attr('filter', 'url(#glow)');
        }
      })
      .on('mouseleave', (event, d) => {
        setHoveredNode(null);
        if (d.id !== activeId) {
          d3.select(event.currentTarget).select('circle.core').attr('filter', null);
        }
      });

    // Orbital rings for concepts
    nodeGroup.filter(d => d.data.type === 'concept')
      .append('circle')
      .attr('class', 'orbit pointer-events-none')
      .attr('r', d => d.radius + 12)
      .attr('fill', 'none')
      .attr('stroke', d => d.data.color || '#fff')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,6')
      .attr('opacity', d => d.id === activeId ? 0.8 : 0.2);

    // Core Circles
    nodeGroup.append('circle')
      .attr('class', 'core cursor-pointer transition-all duration-300')
      .attr('r', d => d.radius)
      .attr('fill', d => {
        if (d.data.type === 'concept') return d.data.color || '#333';
        return '#111';
      })
      .attr('stroke', d => d.id === activeId ? '#fff' : 'rgba(255,255,255,0.3)')
      .attr('stroke-width', d => d.id === activeId ? 3 : 1)
      .attr('filter', d => d.id === activeId ? 'url(#active-glow)' : null);

    // Labels
    nodeGroup.append('text')
      .text(d => d.data.title)
      .attr('x', d => d.radius + 16)
      .attr('y', 4)
      .attr('fill', d => d.id === activeId ? '#fff' : 'rgba(255,255,255,0.6)')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-size', d => d.data.type === 'concept' ? '16px' : '11px')
      .attr('font-weight', d => d.data.type === 'concept' ? '500' : '400')
      .attr('class', 'pointer-events-none select-none drop-shadow-md transition-all duration-300')
      .attr('opacity', d => (d.data.type === 'concept' || d.id === activeId) ? 1 : 0.4);

    // Type icons (simplified as text for SVG)
    nodeGroup.append('text')
      .text(d => {
        switch(d.data.type) {
          case 'concept': return 'C';
          case 'image': return 'I';
          case 'text': return 'T';
          case 'link': return 'L';
          case 'video': return 'V';
          case 'task': return 'K';
          default: return 'N';
        }
      })
      .attr('text-anchor', 'middle')
      .attr('y', d => d.data.type === 'concept' ? 6 : 3)
      .attr('fill', 'rgba(255,255,255,0.9)')
      .attr('font-size', d => d.data.type === 'concept' ? '16px' : '10px')
      .attr('class', 'pointer-events-none select-none');

    let time = 0;

    simulation.on('tick', () => {
      time += 0.01;

      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);

      // Animate particles along tag links
      particles
        .attr('cx', d => {
          const s = d.source as GraphNode;
          const t = d.target as GraphNode;
          // Interpolate position based on time
          const t_mod = (time + (d.index || 0) * 0.1) % 1;
          return s.x! + (t.x! - s.x!) * t_mod;
        })
        .attr('cy', d => {
          const s = d.source as GraphNode;
          const t = d.target as GraphNode;
          const t_mod = (time + (d.index || 0) * 0.1) % 1;
          return s.y! + (t.y! - s.y!) * t_mod;
        });

      // Rotate orbits
      nodeGroup.selectAll('circle.orbit')
        .attr('transform', d => `rotate(${time * 20}, 0, 0)`);

      nodeGroup
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, activeId]);

  return (
    <div className="w-full h-full relative bg-black/40 backdrop-blur-md" ref={containerRef}>
      <svg ref={svgRef} className="w-full h-full" />
      
      {/* Legend / Info overlay */}
      <div className="absolute bottom-8 left-8 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-2xl">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-4">Constellation Legend</h3>
          <div className="flex flex-col gap-3 text-xs text-white/70">
            <div className="flex items-center gap-3">
              <div className="w-6 h-0.5 bg-white/30"></div>
              <span className="font-medium">Structural Hierarchy</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-6 h-0.5">
                <div className="absolute inset-0 bg-indigo-500/30 border-t border-dashed border-indigo-500"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
              </div>
              <span className="font-medium">Meta Connection (Shared Tags)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hovered Link Info */}
      <AnimatePresence>
        {hoveredLink && hoveredLink.sharedTags && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 bg-indigo-900/80 backdrop-blur-xl border border-indigo-500/30 px-6 py-3 rounded-full pointer-events-none shadow-[0_0_30px_rgba(99,102,241,0.4)]"
          >
            <div className="flex items-center gap-3 text-sm">
              <span className="text-white/60 font-mono text-xs uppercase tracking-widest">Shared tags:</span>
              <div className="flex gap-1.5">
                {hoveredLink.sharedTags.map(tag => (
                  <span key={tag} className="bg-indigo-500/40 text-indigo-100 px-2.5 py-0.5 rounded-full text-xs font-medium border border-indigo-400/30">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
