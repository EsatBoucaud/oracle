import React from 'react';
import { ArborNode } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, FolderGit2, Image as ImageIcon, FileText, Link as LinkIcon, Video, CheckSquare, Headphones, File } from 'lucide-react';

interface AtmosphericTreeProps {
  nodes: ArborNode[];
  activeId: string | null;
  expandedIds: Set<string>;
  searchQuery: string;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onAddNode: (parentId: string | null, type?: string) => void;
  onHover: (id: string | null) => void;
}

export const AtmosphericTree: React.FC<AtmosphericTreeProps> = ({
  nodes,
  activeId,
  expandedIds,
  searchQuery,
  onSelect,
  onToggleExpand,
  onAddNode,
  onHover
}) => {
  const rootNodes = nodes.filter(n => n.parentId === null);

  const getPathToRoot = (id: string): Set<string> => {
    const path = new Set<string>();
    let current = nodes.find(n => n.id === id);
    while (current) {
      path.add(current.id);
      current = nodes.find(n => n.id === current?.parentId);
    }
    return path;
  };

  const activePath = activeId ? getPathToRoot(activeId) : new Set<string>();

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'concept': return <FolderGit2 className="w-3.5 h-3.5" />;
      case 'image': return <ImageIcon className="w-3.5 h-3.5" />;
      case 'text': return <FileText className="w-3.5 h-3.5" />;
      case 'link': return <LinkIcon className="w-3.5 h-3.5" />;
      case 'video': return <Video className="w-3.5 h-3.5" />;
      case 'task': return <CheckSquare className="w-3.5 h-3.5" />;
      case 'audio': return <Headphones className="w-3.5 h-3.5" />;
      case 'document': return <File className="w-3.5 h-3.5" />;
      default: return <FileText className="w-3.5 h-3.5" />;
    }
  };

  const renderNode = (node: ArborNode, depth: number, index: number) => {
    const children = nodes.filter(n => n.parentId === node.id);
    const hasChildren = children.length > 0;
    
    // If searching, auto-expand and filter
    const isMatch = searchQuery && (
      node.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      node.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    // Hide node if searching and it doesn't match (and no children match)
    const hasMatchingDescendant = (nId: string): boolean => {
      const kids = nodes.filter(n => n.parentId === nId);
      return kids.some(k => 
        k.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        k.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        hasMatchingDescendant(k.id)
      );
    };

    if (searchQuery && !isMatch && !hasMatchingDescendant(node.id)) {
      return null;
    }

    const isExpanded = searchQuery ? true : expandedIds.has(node.id);
    const isActive = activeId === node.id;
    const isInActivePath = activePath.has(node.id);

    // Styling based on depth and type
    const isRoot = depth === 0;
    const fontSizeClass = isRoot ? 'text-4xl md:text-5xl' : depth === 1 ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl';
    const opacityClass = isActive ? 'opacity-100' : isInActivePath ? 'opacity-80' : 'opacity-40 hover:opacity-70';
    
    return (
      <div key={node.id} className="relative group/node">
        <div 
          className={`group flex items-center gap-4 py-3 transition-all duration-500 ease-out ${opacityClass}`}
          style={{ paddingLeft: `${depth * 2}rem` }}
          onMouseEnter={() => onHover(node.id)}
          onMouseLeave={() => onHover(null)}
        >
          {/* Depth Indicator Line */}
          {depth > 0 && (
            <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10" style={{ left: `${(depth - 1) * 2 + 0.75}rem` }}>
              {isInActivePath && (
                <motion.div 
                  layoutId={`line-${depth}`}
                  className="absolute top-0 w-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                  initial={{ height: 0 }}
                  animate={{ height: '100%' }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              )}
            </div>
          )}

          {/* Node Content */}
          <div className="flex items-center gap-4 relative z-10 w-full">
            <div className={`shrink-0 flex items-center justify-center ${isRoot ? 'w-6 h-6' : 'w-5 h-5'} rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white/80'} transition-all duration-300`}>
              {getNodeIcon(node.type)}
            </div>
            
            <h2 
              onClick={() => {
                onSelect(node.id);
                if (hasChildren && !isExpanded) onToggleExpand(node.id);
              }}
              className={`font-serif cursor-pointer tracking-tight leading-none transition-all duration-300 ${fontSizeClass} ${isActive ? 'italic translate-x-2 text-white' : 'group-hover:italic group-hover:translate-x-1'}`}
            >
              {node.title}
            </h2>

            {isMatch && searchQuery && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono uppercase tracking-widest">Match</span>
            )}

            <div className="flex-1" />

            {/* Actions */}
            <div className="opacity-0 group-hover/node:opacity-100 transition-opacity flex items-center gap-2">
              {hasChildren && !searchQuery && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleExpand(node.id); }}
                  className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 font-mono text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                >
                  {isExpanded ? 'Collapse' : 'Expand'}
                </button>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); onAddNode(node.id); }}
                className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                title="Add Child"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Children */}
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
              exit={{ opacity: 0, height: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-1 pb-2">
                {children.map((child, i) => renderNode(child, depth + 1, i))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="py-8 pb-48">
      <div className="flex items-center justify-between mb-12">
        <h1 className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-50">Index</h1>
        <button 
          onClick={() => onAddNode(null)}
          className="font-mono text-[10px] tracking-widest uppercase opacity-50 hover:opacity-100 flex items-center gap-1.5 transition-opacity"
        >
          <Plus className="w-3 h-3" /> Root
        </button>
      </div>
      {rootNodes.map((node, i) => renderNode(node, 0, i))}
      {rootNodes.length === 0 && (
        <div className="text-center py-12 opacity-30 font-mono text-xs uppercase tracking-widest">
          No concepts found.
        </div>
      )}
    </div>
  );
};
