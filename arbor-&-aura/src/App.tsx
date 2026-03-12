import React, { useState, useEffect, useMemo } from 'react';
import { AtmosphericTree } from './components/AtmosphericTree';
import { ConceptBoard } from './components/ConceptBoard';
import { ConstellationView } from './components/ConstellationView';
import { CommandPalette } from './components/CommandPalette';
import { initialNodes } from './data';
import { ArborNode, NodeType } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, Settings, User, Network, Columns, Command } from 'lucide-react';

type ViewMode = 'split' | 'constellation';

interface ArborAuraAppProps {
  embedded?: boolean;
}

export default function App({ embedded = false }: ArborAuraAppProps) {
  const [nodes, setNodes] = useState<ArborNode[]>(initialNodes);
  const [activeId, setActiveId] = useState<string | null>('root-1');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['root-1', 'c-1', 'c-2', 'root-2', 'c-3']));
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  const handleAddNode = (parentId: string | null, type: NodeType = 'concept', data: Partial<ArborNode> = {}) => {
    const newNode: ArborNode = {
      id: crypto.randomUUID(),
      parentId,
      title: data.title || (type === 'concept' ? 'New Concept' : `New ${type.charAt(0).toUpperCase() + type.slice(1)}`),
      type,
      updatedAt: new Date().toISOString().split('T')[0],
      ...data
    };
    setNodes((prev) => [...prev, newNode]);
    setActiveId(newNode.id);
    if (parentId) {
      setExpandedIds((current) => {
        const nextExpanded = new Set(current);
        nextExpanded.add(parentId);
        return nextExpanded;
      });
    }
    setViewMode('split'); // Switch back to split view to edit
  };

  const handleUpdateNode = (updatedNode: ArborNode) => {
    setNodes((current) =>
      current.map((node) =>
        node.id === updatedNode.id
          ? { ...updatedNode, updatedAt: new Date().toISOString().split('T')[0] }
          : node,
      ),
    );
  };

  const handleDeleteNode = (id: string) => {
    const idsToRemove = new Set<string>([id]);
    let changed = true;

    while (changed) {
      changed = false;
      for (const node of nodes) {
        if (node.parentId && idsToRemove.has(node.parentId) && !idsToRemove.has(node.id)) {
          idsToRemove.add(node.id);
          changed = true;
        }
      }
    }

    const deletedNode = nodes.find((node) => node.id === id);
    const fallbackActiveId =
      deletedNode?.parentId ??
      nodes.find((node) => node.parentId === null && !idsToRemove.has(node.id))?.id ??
      null;

    setNodes((current) => current.filter((node) => !idsToRemove.has(node.id)));
    setExpandedIds((current) => {
      const nextExpanded = new Set<string>();
      current.forEach((expandedId) => {
        if (!idsToRemove.has(expandedId)) {
          nextExpanded.add(expandedId);
        }
      });
      return nextExpanded;
    });
    setHoveredId((current) => (current && idsToRemove.has(current) ? null : current));
    setActiveId((current) => (current && idsToRemove.has(current) ? fallbackActiveId : current));
  };

  // Find an image to show in the cursor preview
  const hoveredNode = nodes.find(n => n.id === hoveredId);
  const getFirstImage = (nodeId: string): string | null => {
    const node = nodes.find(n => n.id === nodeId);
    if (node?.type === 'image' && (node.imageUrl || node.content)) {
      return node.imageUrl || node.content || null;
    }
    const children = nodes.filter(n => n.parentId === nodeId);
    for (const child of children) {
      const img = getFirstImage(child.id);
      if (img) return img;
    }
    return null;
  };
  const previewImage = hoveredId ? getFirstImage(hoveredId) : null;

  // Determine ambient color based on active node lineage
  const ambientColor = useMemo(() => {
    let current = nodes.find(n => n.id === activeId);
    while (current) {
      if (current.color) return current.color;
      current = nodes.find(n => n.id === current?.parentId);
    }
    return '#6366f1'; // Default indigo
  }, [activeId, nodes]);

  return (
    <div
      className={`relative flex w-full flex-col overflow-hidden bg-[#050505] font-sans text-white selection:bg-white/20 ${
        embedded ? 'h-full min-h-0' : 'h-screen'
      }`}
    >
      
      {/* Dynamic Atmospheric Background Gradient */}
      <div className="absolute inset-0 pointer-events-none z-0 transition-colors duration-1000 ease-in-out" style={{ backgroundColor: `${ambientColor}05` }}>
        <motion.div 
          animate={{ backgroundColor: `${ambientColor}20` }}
          transition={{ duration: 1.5 }}
          className="absolute top-1/4 left-1/4 w-[800px] h-[800px] rounded-full blur-[120px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ backgroundColor: `${ambientColor}10` }}
          transition={{ duration: 1.5, delay: 0.2 }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-[100px] mix-blend-screen" 
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-white/10 bg-black/40 backdrop-blur-md z-20 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-8">
          <div>
            <div className="font-serif text-xl tracking-tight italic">Oracle signal portal</div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">Built by Infogito</div>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
            <button 
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${viewMode === 'split' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80'}`}
            >
              <Columns className="w-3.5 h-3.5" />
              Explorer
            </button>
            <button 
              onClick={() => setViewMode('constellation')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${viewMode === 'constellation' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80'}`}
            >
              <Network className="w-3.5 h-3.5" />
              Constellation
            </button>
          </div>

          <button 
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 rounded-full pl-4 pr-2 py-1.5 text-sm w-72 hover:bg-white/10 transition-all text-white/50 hover:text-white/80"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Search Oracle programs...</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono">
              <Command className="w-3 h-3" /> K
            </div>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-white/50 hover:text-white transition-colors"><Bell className="w-4 h-4" /></button>
          <button className="text-white/50 hover:text-white transition-colors"><Settings className="w-4 h-4" /></button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center border border-white/20">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          {viewMode === 'split' ? (
            <motion.div 
              key="split-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex w-full h-full"
            >
              {/* Left: The Knowledge Tree */}
              <div className="w-full md:w-1/3 h-full overflow-y-auto custom-scrollbar px-6 md:px-10 relative border-r border-white/10 bg-black/20 backdrop-blur-xl shrink-0">
                <AtmosphericTree 
                  nodes={nodes}
                  activeId={activeId}
                  expandedIds={expandedIds}
                  searchQuery={searchQuery}
                  onSelect={setActiveId}
                  onToggleExpand={handleToggleExpand}
                  onAddNode={handleAddNode}
                  onHover={setHoveredId}
                />
              </div>

              {/* Right: Concept Landing Page */}
              <div className="hidden md:block flex-1 h-full relative z-0 bg-transparent">
                <ConceptBoard 
                  nodes={nodes} 
                  activeId={activeId} 
                  onSelect={setActiveId}
                  onUpdateNode={handleUpdateNode}
                  onEditNode={() => {}} // Placeholder, NodeEditor was removed in previous step to simplify, but we can re-add if needed
                  onAddNode={(parentId, type) => {
                    const newNode: ArborNode = {
                      id: crypto.randomUUID(),
                      parentId,
                      title: `New ${type}`,
                      type,
                      updatedAt: new Date().toISOString().split('T')[0],
                    };
                    setNodes((current) => [...current, newNode]);
                  }}
                  onDeleteNode={handleDeleteNode}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="constellation-view"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full"
            >
              <ConstellationView 
                nodes={nodes} 
                activeId={activeId} 
                onSelect={(id) => {
                  setActiveId(id);
                  // Optionally switch back to split view when a node is selected from constellation
                  // setViewMode('split');
                }} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Cursor Preview */}
      <AnimatePresence>
        {previewImage && hoveredId !== activeId && viewMode === 'split' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              filter: 'blur(0px)',
              x: mousePos.x + 20, 
              y: mousePos.y + 20 
            }}
            exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="pointer-events-none fixed top-0 left-0 z-50 w-48 h-64 rounded-sm overflow-hidden shadow-2xl border border-white/10"
          >
            <img src={previewImage} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
          </motion.div>
        )}
      </AnimatePresence>

      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        nodes={nodes}
        onSelect={(id) => {
          setActiveId(id);
          setViewMode('split');
          // Auto-expand path
          let current = nodes.find(n => n.id === id);
          const nextExpanded = new Set(expandedIds);
          while (current) {
            nextExpanded.add(current.id);
            current = nodes.find(n => n.id === current?.parentId);
          }
          setExpandedIds(nextExpanded);
        }}
      />

    </div>
  );
}
