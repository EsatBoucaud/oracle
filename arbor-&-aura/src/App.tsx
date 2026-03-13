import React, { useState, useEffect, useMemo } from 'react';
import { AtmosphericTree } from './components/AtmosphericTree';
import { ConceptBoard } from './components/ConceptBoard';
import { ConstellationView } from './components/ConstellationView';
import { CommandPalette } from './components/CommandPalette';
import { initialNodes } from './data';
import { ArborNode, NodeType } from './types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Bell,
  Settings,
  User,
  Network,
  Columns,
  Command,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from 'lucide-react';
import type { CalendarEvent } from '../../src/data/mockData';
import type { ViewMode as CalendarViewMode } from '../../src/types/app';

type ViewMode = 'split' | 'constellation';

interface ArborAuraAppProps {
  embedded?: boolean;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onGridClick: (date: Date, time: string) => void;
  calendarView: CalendarViewMode;
  onCalendarViewChange: (view: CalendarViewMode) => void;
  calendarSearchQuery: string;
  onCalendarSearchChange: (query: string) => void;
  onOpenSettings?: () => void;
}

export default function App({
  embedded = false,
  currentDate,
  onDateChange,
  events,
  onEventClick,
  onGridClick,
  calendarView,
  onCalendarViewChange,
  calendarSearchQuery,
  onCalendarSearchChange,
  onOpenSettings,
}: ArborAuraAppProps) {
  const [nodes, setNodes] = useState<ArborNode[]>(initialNodes);
  const [activeId, setActiveId] = useState<string | null>('root-home');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['root-home', 'root-7', 'root-4', 'root-1', 'c-1', 'c-2', 'root-2', 'c-3']));
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [treePaneWidth, setTreePaneWidth] = useState(360);
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(false);
  const [isTreeResizing, setIsTreeResizing] = useState(false);
  const [mobilePane, setMobilePane] = useState<'tree' | 'workspace'>('workspace');

  useEffect(() => {
    if (viewMode !== 'split') return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [viewMode]);

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

  useEffect(() => {
    if (!isTreeResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const nextWidth = Math.min(520, Math.max(280, e.clientX));
      setTreePaneWidth(nextWidth);
    };

    const handleMouseUp = () => {
      setIsTreeResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isTreeResizing]);

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
    setExpandedIds((current) => {
      const nextExpanded = new Set(current);
      nextExpanded.add(parentId ?? newNode.id);
      return nextExpanded;
    });
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
  const activeNode = nodes.find((node) => node.id === activeId) ?? null;
  const activeRoot = useMemo(() => {
    let current = activeNode;

    while (current?.parentId) {
      current = nodes.find((node) => node.id === current?.parentId) ?? null;
    }

    return current ?? activeNode;
  }, [activeNode, nodes]);

  const focusNode = (id: string | null) => {
    if (!id) return;

    setActiveId(id);
    setViewMode('split');
    setMobilePane('workspace');
    setExpandedIds((current) => {
      const nextExpanded = new Set(current);
      let currentNode = nodes.find((node) => node.id === id);

      while (currentNode) {
        nextExpanded.add(currentNode.id);
        currentNode = nodes.find((node) => node.id === currentNode?.parentId);
      }

      return nextExpanded;
    });
  };

  const handleSelectNode = (id: string) => {
    setActiveId(id);
    setMobilePane('workspace');
    setExpandedIds((current) => {
      const nextExpanded = new Set(current);
      let currentNode = nodes.find((node) => node.id === id);

      while (currentNode) {
        nextExpanded.add(currentNode.id);
        currentNode = nodes.find((node) => node.id === currentNode?.parentId);
      }

      return nextExpanded;
    });
  };

  const handleOpenPromptHome = () => {
    focusNode('root-home');
  };

  // Determine ambient color based on active node lineage
  const ambientColor = useMemo(() => {
    let current = nodes.find(n => n.id === activeId);
    while (current) {
      if (current.color) return current.color;
      current = nodes.find(n => n.id === current?.parentId);
    }
    return '#059fc5';
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
            <div className="font-serif text-xl tracking-tight italic">ReadWorks signal portal</div>
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
            onClick={handleOpenPromptHome}
            className={`hidden md:inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              activeRoot?.id === 'root-home'
                ? 'border-white/20 bg-white/16 text-white'
                : 'border-white/10 bg-white/5 text-white/68 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Prompt home
          </button>

          <button 
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 rounded-full pl-4 pr-2 py-1.5 text-sm w-72 hover:bg-white/10 transition-all text-white/50 hover:text-white/80"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Search ReadWorks programs...</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono">
              <Command className="w-3 h-3" /> K
            </div>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-white/50 hover:text-white transition-colors"><Bell className="w-4 h-4" /></button>
          <button onClick={onOpenSettings} className="text-white/50 hover:text-white transition-colors"><Settings className="w-4 h-4" /></button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-teal-500 flex items-center justify-center border border-white/20">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </header>

      {viewMode === 'split' && (
        <div className="relative z-20 border-b border-white/10 bg-black/30 px-4 py-3 backdrop-blur-md md:px-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-1 md:hidden">
                <button
                  onClick={() => setMobilePane('tree')}
                  className={`rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                    mobilePane === 'tree' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Tree
                </button>
                <button
                  onClick={() => setMobilePane('workspace')}
                  className={`rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                    mobilePane === 'workspace' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Workspace
                </button>
              </div>

              <button
                onClick={() => setIsTreeCollapsed((current) => !current)}
                className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/10"
              >
                {isTreeCollapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
                {isTreeCollapsed ? 'Show tree' : 'Hide tree'}
              </button>

              <div className="relative min-w-0 w-full flex-1 sm:min-w-[240px] xl:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter the knowledge tree"
                  className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/20 focus:bg-white/10"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {activeRoot && (
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-mono uppercase tracking-[0.22em] text-white/55">
                  Branch: {activeRoot.title}
                </div>
              )}
              {activeNode && activeRoot?.id !== activeNode.id && (
                <div className="rounded-full border border-white/10 bg-black/30 px-3 py-2 text-[11px] font-mono uppercase tracking-[0.22em] text-white/40">
                  Node: {activeNode.title}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
              <div
                className={`h-full overflow-y-auto custom-scrollbar relative bg-black/20 backdrop-blur-xl shrink-0 transition-all duration-300 ${
                  isTreeCollapsed
                    ? 'w-full md:w-0 md:border-r-0 md:px-0'
                    : mobilePane === 'workspace'
                      ? 'hidden border-r border-white/10 px-6 md:block md:w-[var(--tree-pane-width)] md:px-5 xl:px-6'
                      : 'w-full border-r border-white/10 px-6 md:w-[var(--tree-pane-width)] md:px-5 xl:px-6'
                }`}
                style={isTreeCollapsed ? undefined : ({ '--tree-pane-width': `${treePaneWidth}px` } as React.CSSProperties)}
              >
                <AtmosphericTree 
                  nodes={nodes}
                  activeId={activeId}
                  expandedIds={expandedIds}
                  searchQuery={searchQuery}
                  onSelect={handleSelectNode}
                  onToggleExpand={handleToggleExpand}
                  onAddNode={handleAddNode}
                  onHover={setHoveredId}
                />
              </div>

              {!isTreeCollapsed && (
                <div
                  onMouseDown={() => setIsTreeResizing(true)}
                  className="hidden w-3 shrink-0 cursor-col-resize items-stretch justify-center md:flex"
                >
                  <div className="w-px bg-white/10 transition-colors hover:bg-white/40" />
                </div>
              )}

              {/* Right: Concept Landing Page */}
              <div className={`${mobilePane === 'workspace' ? 'block' : 'hidden'} md:block flex-1 h-full relative z-0 bg-transparent min-w-0`}>
                {isTreeCollapsed && (
                  <button
                    onClick={() => setIsTreeCollapsed(false)}
                    className="absolute left-4 top-4 z-30 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-2 text-xs font-medium text-white/85 backdrop-blur transition-colors hover:bg-black/70"
                  >
                    <PanelLeftOpen className="h-3.5 w-3.5" />
                    Open tree
                  </button>
                )}
                <ConceptBoard 
                  nodes={nodes} 
                  activeId={activeId} 
                  onSelect={handleSelectNode}
                  onUpdateNode={handleUpdateNode}
                  onEditNode={() => {}} // Placeholder, NodeEditor was removed in previous step to simplify, but we can re-add if needed
                  onAddNode={handleAddNode}
                  onDeleteNode={handleDeleteNode}
                  currentDate={currentDate}
                  onDateChange={onDateChange}
                  events={events}
                  onEventClick={onEventClick}
                  onGridClick={onGridClick}
                  calendarView={calendarView}
                  onCalendarViewChange={onCalendarViewChange}
                  calendarSearchQuery={calendarSearchQuery}
                  onCalendarSearchChange={onCalendarSearchChange}
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
          focusNode(id);
        }}
      />

    </div>
  );
}
