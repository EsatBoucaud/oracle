import React, { useState } from 'react';
import { ArborNode, NodeType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, CheckCircle2, Circle, Play, Link as LinkIcon, FileText, FolderGit2, Edit2, Plus, Image as ImageIcon, Video, CheckSquare, Maximize2, Headphones, File as FileIcon, Upload, Calendar, Clock, LayoutGrid, Columns, Square, Table } from 'lucide-react';
import { ImmersiveViewer } from './ImmersiveViewer';
import { NodeEditor } from './NodeEditor';
import { AIHome } from './AIHome';
import { DashboardScreen } from '../../../src/components/DashboardScreen';
import { MainContent } from '../../../src/components/MainContent';
import type { CalendarEvent } from '../../../src/data/mockData';
import type { ViewMode } from '../../../src/types/app';

interface ConceptBoardProps {
  nodes: ArborNode[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onUpdateNode: (node: ArborNode) => void;
  onEditNode: (id: string) => void;
  onAddNode: (parentId: string, type: NodeType, data?: Partial<ArborNode>) => void;
  onDeleteNode: (id: string) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onGridClick: (date: Date, time: string) => void;
  calendarView: ViewMode;
  onCalendarViewChange: (view: ViewMode) => void;
  calendarSearchQuery: string;
  onCalendarSearchChange: (query: string) => void;
}

export const ConceptBoard: React.FC<ConceptBoardProps> = ({
  nodes,
  activeId,
  onSelect,
  onUpdateNode,
  onEditNode,
  onAddNode,
  onDeleteNode,
  currentDate,
  onDateChange,
  events,
  onEventClick,
  onGridClick,
  calendarView,
  onCalendarViewChange,
  calendarSearchQuery,
  onCalendarSearchChange,
}) => {
  const [filter, setFilter] = useState<NodeType | 'all'>('all');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [focusedResource, setFocusedResource] = useState<ArborNode | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [galleryLayout, setGalleryLayout] = useState<'grid' | 'masonry' | 'hero'>('masonry');

  const activeNode = nodes.find(n => n.id === activeId);
  const getImageSrc = (node: ArborNode) => node.imageUrl || node.content || '';

  if (!activeNode) {
    return (
      <div className="w-full h-full flex items-center justify-center opacity-20">
        <span className="font-mono text-xs tracking-[0.3em] uppercase">Select a concept to explore</span>
      </div>
    );
  }

  const processFiles = (files: globalThis.File[]) => {
    if (!activeId) return;
    
    for (const file of files) {
      const type = file.type;
      let nodeType: NodeType = 'document';
      
      if (type.startsWith('image/')) nodeType = 'image';
      else if (type.startsWith('video/')) nodeType = 'video';
      else if (type.startsWith('audio/')) nodeType = 'audio';
      else if (type.startsWith('text/')) nodeType = 'text';

      const reader = new FileReader();
      
      if (nodeType === 'text') {
        reader.onload = (event) => {
          onAddNode(activeId, nodeType, { 
            title: file.name.replace(/\.[^/.]+$/, ""), 
            content: event.target?.result as string 
          });
        };
        reader.readAsText(file);
      } else {
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          const data: Partial<ArborNode> = { title: file.name.replace(/\.[^/.]+$/, "") };
          
          if (nodeType === 'image') data.imageUrl = dataUrl;
          else if (nodeType === 'video' || nodeType === 'audio' || nodeType === 'document') data.url = dataUrl;
          
          onAddNode(activeId, nodeType, data);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const getPath = (id: string): ArborNode[] => {
    const path: ArborNode[] = [];
    let current = nodes.find(n => n.id === id);
    while (current) {
      path.unshift(current);
      current = nodes.find(n => n.id === current?.parentId);
    }
    return path;
  };
  const breadcrumbs = getPath(activeId);

  const childConcepts = nodes.filter(n => n.parentId === activeId && n.type === 'concept');

  const getDescendantResources = (parentId: string): ArborNode[] => {
    const children = nodes.filter(n => n.parentId === parentId);
    let resources = children.filter(n => n.type !== 'concept');
    const concepts = children.filter(n => n.type === 'concept');
    concepts.forEach(c => {
      resources = [...resources, ...getDescendantResources(c.id)];
    });
    return resources;
  };
  
  const allResources = activeNode.type === 'concept' 
    ? getDescendantResources(activeId) 
    : [activeNode];

  const filteredResources = filter === 'all' 
    ? allResources 
    : allResources.filter(r => r.type === filter);

  const toggleTask = (node: ArborNode) => {
    onUpdateNode({ ...node, completed: !node.completed });
  };

  const isKanban = activeNode.tags?.includes('kanban');
  const isCalendar = activeNode.tags?.includes('calendar');
  const isGallery = activeNode.tags?.includes('gallery');
  const isTable = activeNode.tags?.includes('table');
  const isDashboard = activeNode.tags?.includes('dashboard');
  const isAIHome = activeNode.tags?.includes('ai-home');
  const isWorkspace = isCalendar || isDashboard;
  const branchProfile = React.useMemo(() => {
    const tags = activeNode.tags ?? [];

    if (tags.includes('student-experience')) {
      return {
        kicker: 'Student Experience',
        headline: 'Independent reading, access, and knowledge capture',
        summary:
          'This branch is where ReadWorks student-facing materials get translated into operating guidance for library rollout, offline use, and knowledge-building support.',
        accent: 'from-sky-500/18 via-teal-500/10 to-transparent',
        points: [
          'Student Library expands beyond assignments into self-directed reading with daily recommendations.',
          'Offline mode and digital supports create a cleaner equity and device-access story.',
          'Big Book of Knowledge flows connect reading routines to visible knowledge accumulation.',
        ],
      };
    }

    if (tags.includes('professional-learning')) {
      return {
        kicker: 'Professional Learning',
        headline: 'District enablement and implementation support',
        summary:
          'Use this branch for public-facing PD packages, regional support examples, and admin-facing inquiry pathways that anchor implementation conversations.',
        accent: 'from-emerald-500/18 via-emerald-400/10 to-transparent',
        points: [
          'Professional learning packages give districts a concrete services frame.',
          'Philadelphia support pages add a real localized example instead of generic PD copy.',
          'Admin inquiry and routing notes help translate public materials into quick response workflows.',
        ],
      };
    }

    if (tags.includes('platform')) {
      return {
        kicker: 'Platform and Access',
        headline: 'Setup trust, syncing, and classroom readiness',
        summary:
          'This branch centralizes the real operational surface for Google Classroom, shared devices, filters, onboarding guides, and platform trust signals.',
        accent: 'from-cyan-500/16 via-sky-500/10 to-transparent',
        points: [
          'Google Classroom sync, add-on readiness, and shared-device notes now live together.',
          'Support-center filters and quick-start guides ground teacher setup workflows.',
          'Security and approval artifacts make partner onboarding more credible.',
        ],
      };
    }

    if (tags.includes('campaigns') || tags.includes('adoption')) {
      return {
        kicker: 'Adoption and Campaigns',
        headline: 'Onboarding motion, outreach, and public narratives',
        summary:
          'This area collects the external-facing assets that make ReadWorks adoption feel real: campaigns, supporter material, Google ecosystem stories, and seasonal pushes.',
        accent: 'from-lime-500/14 via-emerald-500/10 to-transparent',
        points: [
          'Monthly updates and Google partnership material sharpen the adoption storyline.',
          'Earth Day and student campaigns add real audience-facing moments to the portal.',
          'Supporter and corporate materials give outreach work a stronger factual base.',
        ],
      };
    }

    if (tags.includes('research') || tags.includes('evidence')) {
      return {
        kicker: 'Research and Evidence',
        headline: 'Evidence claims before they enter live operations',
        summary:
          'This branch is the quality gate for efficacy language, differentiation claims, and ESSA framing before those points appear in dashboard or partner messaging.',
        accent: 'from-indigo-500/18 via-blue-500/10 to-transparent',
        points: [
          'Article-A-Day evidence should be checked against the research page, not memory.',
          'Differentiation briefs help connect pedagogy claims to real program mechanics.',
          'This is the right branch for disciplined message QA before external use.',
        ],
      };
    }

    if (tags.includes('families') || tags.includes('afterschool') || tags.includes('summer')) {
      return {
        kicker: 'Family and Community',
        headline: 'Year-round learning pathways beyond the classroom',
        summary:
          'These nodes translate ReadWorks into summer, afterschool, family, and remote-learning contexts so the portal reflects a fuller support ecosystem.',
        accent: 'from-amber-500/18 via-orange-500/10 to-transparent',
        points: [
          'Summer and afterschool pages make the product story more durable across the year.',
          'Hybrid and remote routine guidance broadens the implementation surface.',
          'Family-facing Book of Knowledge support gives community outreach a practical anchor.',
        ],
      };
    }

    if (tags.includes('licensing') || tags.includes('financials')) {
      return {
        kicker: 'Sustainability',
        headline: 'Efficiency, licensing, and financial trust',
        summary:
          'This branch is the operating source for transparency, licensing, and sustainability messaging that partner and donor-facing work depends on.',
        accent: 'from-blue-500/16 via-slate-500/10 to-transparent',
        points: [
          'Annual reports, financials, and audits ground cost-efficiency claims.',
          'Licensing pages keep content-usage language precise.',
          'This is the safest place to source partner sustainability talking points.',
        ],
      };
    }

    return null;
  }, [activeNode.tags]);

  const spotlightResources = React.useMemo(
    () =>
      allResources
        .filter((node) => ['link', 'document', 'text', 'task'].includes(node.type))
        .slice(0, 4),
    [allResources],
  );

  const branchStats = React.useMemo(
    () => [
      {
        label: 'Artifacts',
        value: String(allResources.length).padStart(2, '0'),
      },
      {
        label: 'References',
        value: String(allResources.filter((node) => node.type === 'link' || node.type === 'document').length).padStart(2, '0'),
      },
      {
        label: 'Open tasks',
        value: String(allResources.filter((node) => node.type === 'task' && !node.completed).length).padStart(2, '0'),
      },
    ],
    [allResources],
  );

  const filters: { label: string; value: NodeType | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Images', value: 'image' },
    { label: 'Notes', value: 'text' },
    { label: 'Tasks', value: 'task' },
    { label: 'Events', value: 'event' },
    { label: 'Links', value: 'link' },
    { label: 'Videos', value: 'video' },
    { label: 'Audio', value: 'audio' },
    { label: 'Documents', value: 'document' },
  ];

  const addOptions: { label: string; type: NodeType; icon: any }[] = [
    { label: 'Concept', type: 'concept', icon: FolderGit2 },
    { label: 'Image', type: 'image', icon: ImageIcon },
    { label: 'Note', type: 'text', icon: FileText },
    { label: 'Task', type: 'task', icon: CheckSquare },
    { label: 'Event', type: 'event', icon: Calendar },
    { label: 'Link', type: 'link', icon: LinkIcon },
    { label: 'Video', type: 'video', icon: Video },
    { label: 'Audio', type: 'audio', icon: Headphones },
    { label: 'Document', type: 'document', icon: FileIcon },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!activeId) return;

    processFiles(Array.from(e.dataTransfer.files));
  };

  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (!activeId) return;

      // Handle pasted files (e.g., images copied to clipboard)
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        const files = Array.from(e.clipboardData.files);
        for (const file of files) {
          const type = file.type;
          let nodeType: NodeType = 'document';
          
          if (type.startsWith('image/')) nodeType = 'image';
          else if (type.startsWith('video/')) nodeType = 'video';
          else if (type.startsWith('audio/')) nodeType = 'audio';
          else if (type.startsWith('text/')) nodeType = 'text';

          const reader = new FileReader();
          if (nodeType === 'text') {
            reader.onload = (event) => {
              onAddNode(activeId, nodeType, { 
                title: file.name ? file.name.replace(/\.[^/.]+$/, "") : 'Pasted Text', 
                content: event.target?.result as string 
              });
            };
            reader.readAsText(file);
          } else {
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              const data: Partial<ArborNode> = { title: file.name ? file.name.replace(/\.[^/.]+$/, "") : `Pasted ${nodeType}` };
              
              if (nodeType === 'image') data.imageUrl = dataUrl;
              else if (nodeType === 'video' || nodeType === 'audio' || nodeType === 'document') data.url = dataUrl;
              
              onAddNode(activeId, nodeType, data);
            };
            reader.readAsDataURL(file);
          }
        }
        return;
      }

      // Handle pasted text/URLs
      const text = e.clipboardData?.getData('text');
      if (text) {
        const isUrl = /^https?:\/\//i.test(text.trim());
        if (isUrl) {
          const url = text.trim();
          let nodeType: NodeType = 'link';
          
          if (/\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url)) nodeType = 'image';
          else if (/\.(mp4|webm|ogg)$/i.test(url) || /youtube\.com|youtu\.be/i.test(url)) nodeType = 'video';
          else if (/\.(mp3|wav|m4a)$/i.test(url)) nodeType = 'audio';
          else if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i.test(url)) nodeType = 'document';

          const data: Partial<ArborNode> = { 
            title: `Pasted ${nodeType}`, 
            url: nodeType !== 'image' ? url : undefined,
            imageUrl: nodeType === 'image' ? url : undefined
          };
          
          onAddNode(activeId, nodeType, data);
        } else {
          // Just regular text
          onAddNode(activeId, 'text', {
            title: 'Pasted Note',
            content: text
          });
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeId, onAddNode]);

  return (
    <>
      <div 
        className={`w-full h-full overflow-y-auto custom-scrollbar relative ${
          isWorkspace ? 'px-0 py-2 pb-10' : 'px-8 py-12 pb-32 md:px-16'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center border-4 border-dashed border-white/20 rounded-xl m-4 pointer-events-none transition-all">
            <div className="text-center">
              <Plus className="w-16 h-16 text-white/50 mx-auto mb-4 animate-bounce" />
              <h2 className="text-3xl font-serif text-white mb-2">Drop files to add</h2>
              <p className="text-white/50 font-mono text-sm uppercase tracking-widest">Auto-detects images, videos, audio, and documents</p>
            </div>
          </div>
        )}
        <div className={`${isWorkspace ? 'max-w-none' : isAIHome ? 'max-w-6xl' : 'max-w-5xl'} mx-auto`}>
          {isAIHome ? (
            <AIHome
              nodes={nodes}
              onSelectRoot={onSelect}
              onCreateRoot={(data) => onAddNode(null, 'concept', data)}
            />
          ) : (
            <>
          {/* Breadcrumbs */}
          {!isWorkspace && (
            <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm font-mono uppercase tracking-widest opacity-50">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.id}>
                  {idx > 0 && <span>/</span>}
                  <button 
                    onClick={() => onSelect(crumb.id)}
                    className="hover:text-white transition-colors"
                  >
                    {crumb.title}
                  </button>
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Hero Section */}
          {!isWorkspace && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={`hero-${activeId}`}
              className="relative mb-12 group"
            >
              <div className="flex items-start justify-between gap-8">
                <div>
                  <h1 className="mb-6 font-serif text-5xl leading-none tracking-tight md:text-7xl">
                    {activeNode.title}
                  </h1>
                  {activeNode.content && (
                    <p className="max-w-3xl text-xl font-light leading-relaxed text-white/70 font-sans md:text-2xl">
                      {activeNode.content}
                    </p>
                  )}
                  {activeNode.tags && activeNode.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {activeNode.tags.map(tag => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono uppercase tracking-widest text-white/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setEditingNodeId(activeNode.id)}
                  className="opacity-0 group-hover:opacity-100 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/70 hover:text-white shrink-0"
                  title="Edit Concept"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {branchProfile && !isWorkspace && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-10 grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]"
            >
              <div className={`overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br ${branchProfile.accent} bg-black/30 p-6`}>
                <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-white/40">
                  {branchProfile.kicker}
                </div>
                <h2 className="mt-3 max-w-3xl font-serif text-3xl tracking-tight text-white md:text-4xl">
                  {branchProfile.headline}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70 md:text-base">
                  {branchProfile.summary}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {branchStats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
                      <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-white/35">{stat.label}</div>
                      <div className="mt-3 font-serif text-3xl text-white">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  {branchProfile.points.map((point) => (
                    <div key={point} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-white/68">
                      {point}
                    </div>
                  ))}
                </div>

                {childConcepts.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {childConcepts.slice(0, 4).map((concept) => (
                      <button
                        key={concept.id}
                        onClick={() => onSelect(concept.id)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {concept.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-[0.28em] text-white/40">Key Artifacts</div>
                    <h3 className="mt-2 font-serif text-2xl text-white">Reference deck</h3>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.24em] text-white/40">
                    ReadWorks
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {spotlightResources.length > 0 ? (
                    spotlightResources.map((resource) => (
                      <button
                        key={resource.id}
                        onClick={() => setFocusedResource(resource)}
                        className="w-full rounded-[24px] border border-white/10 bg-black/25 p-4 text-left transition-colors hover:bg-white/[0.06]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/35">
                              {resource.type}
                            </div>
                            <div className="mt-2 text-base font-medium text-white/92">{resource.title}</div>
                            <div className="mt-2 line-clamp-2 text-sm leading-6 text-white/58">
                              {resource.content || resource.url || 'Open this artifact'}
                            </div>
                          </div>
                          <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-white/35" />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-5 text-sm text-white/45">
                      No linked artifacts yet for this branch.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Filter Bar */}
          {allResources.length > 0 && !isCalendar && !isDashboard && (
            <div className="flex items-center gap-2 mb-12 overflow-x-auto pb-2 custom-scrollbar">
              {filters.map(f => {
                const count = f.value === 'all' ? allResources.length : allResources.filter(r => r.type === f.value).length;
                if (count === 0 && f.value !== 'all') return null;
                
                return (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`px-4 py-2 rounded-full text-sm font-mono tracking-wider uppercase transition-all whitespace-nowrap ${
                      filter === f.value 
                        ? 'bg-white text-black' 
                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                    }`}
                  >
                    {f.label} <span className="opacity-50 ml-1">({count})</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Kanban View */}
          {isKanban && childConcepts.length > 0 && filter === 'all' && (
            <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar min-h-[500px]">
              {childConcepts.map((column, i) => {
                const columnTasks = nodes.filter(n => n.parentId === column.id && n.type === 'task');
                return (
                  <motion.div
                    key={column.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex-shrink-0 w-80 flex flex-col gap-4 bg-white/5 rounded-3xl p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between px-2 mb-2">
                      <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-white/60 font-semibold flex items-center gap-2">
                        {column.title} <span className="bg-white/10 px-2 py-0.5 rounded-full text-[10px]">{columnTasks.length}</span>
                      </h3>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingNodeId(column.id); }}
                        className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                      {columnTasks.map(task => (
                        <div 
                          key={task.id}
                          onClick={(e) => { e.stopPropagation(); toggleTask(task); }}
                          className="p-4 rounded-2xl border border-white/10 bg-black/40 hover:bg-white/10 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 shrink-0">
                              {task.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Circle className="w-4 h-4 text-white/30 group-hover:text-white/50 transition-colors" />
                              )}
                            </div>
                            <div>
                              <h4 className={`font-medium text-sm transition-colors ${task.completed ? 'text-white/40 line-through' : 'text-white/90'}`}>
                                {task.title}
                              </h4>
                              {task.content && (
                                <p className={`text-xs mt-2 line-clamp-3 transition-colors ${task.completed ? 'text-white/30' : 'text-white/60'}`}>
                                  {task.content}
                                </p>
                              )}
                              {task.tags && task.tags.length > 0 && (
                                <div className="flex gap-1 flex-wrap mt-3">
                                  {task.tags.map(t => (
                                    <span key={t} className="text-[9px] font-mono uppercase tracking-widest text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => onAddNode(column.id, 'task')}
                        className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/40 hover:text-white/80 hover:bg-white/5 hover:border-white/40 transition-all flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest mt-2"
                      >
                        <Plus className="w-3 h-3" /> Add Task
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Calendar View */}
            {isCalendar && filter === 'all' && (
              <div className="mb-10">
                <div className="flex h-[1040px] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-black/20 shadow-[0_24px_80px_rgba(0,0,0,0.28)] xl:h-[1100px] 2xl:h-[1160px]">
                  <MainContent
                    currentDate={currentDate}
                    onDateChange={onDateChange}
                    events={events}
                    onEventClick={onEventClick}
                    onGridClick={onGridClick}
                    view={calendarView}
                    onViewChange={onCalendarViewChange}
                    searchQuery={calendarSearchQuery}
                    onSearchChange={onCalendarSearchChange}
                  />
                </div>
              </div>
            )}

          {/* Gallery View */}
          {isGallery && filter === 'all' && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-white/40 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Image Gallery
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
                    <button
                      onClick={() => setGalleryLayout('grid')}
                      className={`p-1.5 rounded-full transition-colors ${galleryLayout === 'grid' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/80'}`}
                      title="Square Grid"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setGalleryLayout('masonry')}
                      className={`p-1.5 rounded-full transition-colors ${galleryLayout === 'masonry' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/80'}`}
                      title="Masonry Layout"
                    >
                      <Columns className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setGalleryLayout('hero')}
                      className={`p-1.5 rounded-full transition-colors ${galleryLayout === 'hero' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/80'}`}
                      title="Hero Grid"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => onAddNode(activeId, 'image')}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-mono tracking-wider uppercase flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Image
                  </button>
                </div>
              </div>
              
              {galleryLayout === 'grid' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {nodes.filter(n => n.parentId === activeId && n.type === 'image').map((image, i) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setFocusedResource(image)}
                      className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer"
                    >
                      <img src={getImageSrc(image)} alt={image.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <p className="text-sm font-medium text-white truncate">{image.title}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {galleryLayout === 'masonry' && (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                  {nodes.filter(n => n.parentId === activeId && n.type === 'image').map((image, i) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setFocusedResource(image)}
                      className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer break-inside-avoid"
                    >
                      <img src={getImageSrc(image)} alt={image.title} className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <p className="text-sm font-medium text-white truncate">{image.title}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {galleryLayout === 'hero' && (
                <div className="grid grid-cols-4 gap-4">
                  {nodes.filter(n => n.parentId === activeId && n.type === 'image').map((image, i) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setFocusedResource(image)}
                      className={`group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer ${
                        i % 5 === 0 ? 'col-span-4 md:col-span-2 row-span-2 aspect-square md:aspect-auto' : 'col-span-2 md:col-span-1 aspect-square'
                      }`}
                    >
                      <img src={getImageSrc(image)} alt={image.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <p className="text-sm font-medium text-white truncate">{image.title}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Table View */}
          {isTable && filter === 'all' && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-white/40 flex items-center gap-2">
                  <Table className="w-4 h-4" /> Data Table
                </h3>
                <button
                  onClick={() => onAddNode(activeId, 'text')}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-mono tracking-wider uppercase flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Row
                </button>
              </div>
              <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/40">
                      <th className="p-4 font-mono text-xs tracking-widest uppercase text-white/40 font-normal w-24">Type</th>
                      <th className="p-4 font-mono text-xs tracking-widest uppercase text-white/40 font-normal w-1/4">Title</th>
                      <th className="p-4 font-mono text-xs tracking-widest uppercase text-white/40 font-normal w-1/3">Content</th>
                      <th className="p-4 font-mono text-xs tracking-widest uppercase text-white/40 font-normal">Tags</th>
                      <th className="p-4 font-mono text-xs tracking-widest uppercase text-white/40 font-normal text-right w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allResources.map((node) => (
                      <tr key={node.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setFocusedResource(node)}>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded bg-white/10 text-white/60 text-[10px] font-mono uppercase tracking-wider">
                            {node.type}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-white/90">{node.title}</td>
                        <td className="p-4 text-sm text-white/50 max-w-xs truncate">{node.content || node.url || '-'}</td>
                        <td className="p-4">
                          <div className="flex gap-1 flex-wrap">
                            {node.tags?.map(t => (
                              <span key={t} className="text-[9px] font-mono uppercase tracking-widest text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingNodeId(node.id); }}
                            className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-white/10 transition-all text-white/40 hover:text-white inline-flex"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Dashboard View */}
            {isDashboard && filter === 'all' && (
              <div className="mb-10">
                <div className="flex h-[1040px] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-black/20 shadow-[0_24px_80px_rgba(0,0,0,0.28)] xl:h-[1090px] 2xl:h-[1140px]">
                  <DashboardScreen
                    currentDate={currentDate}
                    events={events}
                  />
                </div>
              </div>
            )}

          {/* Correlated Concepts (Bento Row) */}
          {!isKanban && !isCalendar && !isGallery && !isTable && !isDashboard && childConcepts.length > 0 && filter === 'all' && (
            <div className="mb-16">
              <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-white/40 mb-6 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4" /> Correlated Concepts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {childConcepts.map((concept, i) => (
                  <motion.div
                    key={concept.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative group"
                  >
                    <button
                      onClick={() => onSelect(concept.id)}
                      className="w-full text-left p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all h-full flex flex-col"
                    >
                      <h4 className="text-xl font-serif mb-2 group-hover:translate-x-1 transition-transform">{concept.title}</h4>
                      {concept.content && (
                        <p className="text-sm text-white/50 line-clamp-2 mb-4 flex-1">{concept.content}</p>
                      )}
                      {concept.tags && concept.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-auto">
                          {concept.tags.slice(0, 2).map(t => (
                            <span key={t} className="text-[10px] font-mono uppercase tracking-widest text-white/30 bg-white/5 px-2 py-0.5 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingNodeId(concept.id); }}
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 rounded-full bg-black/50 hover:bg-black/80 transition-all text-white/70 hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Knowledge Base (Masonry Grid) */}
          {filteredResources.length > 0 && (
            <div>
              <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-white/40 mb-6">
                Knowledge & Assets
              </h3>
              <div className="columns-1 md:columns-2 gap-6 space-y-6">
                <AnimatePresence mode="popLayout">
                  {filteredResources.map((node, i) => {
                    // Skip rendering tasks in the masonry grid if we are in Kanban view and they belong to a column
                    if (isKanban && filter === 'all' && node.type === 'task' && childConcepts.some(c => c.id === node.parentId)) {
                      return null;
                    }
                    // Skip rendering events in the masonry grid if we are in Calendar view
                    if (isCalendar && filter === 'all' && node.type === 'event') {
                      return null;
                    }
                    // Skip rendering images in the masonry grid if we are in Gallery view
                    if (isGallery && filter === 'all' && node.type === 'image') {
                      return null;
                    }
                    // Skip rendering items in the masonry grid if we are in Table view
                    if (isTable && filter === 'all') {
                      return null;
                    }
                    // Skip rendering items in the masonry grid if we are in Dashboard view
                    if (isDashboard && filter === 'all') {
                      return null;
                    }
                    return (
                      <motion.div
                        layoutId={`resource-${node.id}`}
                      key={node.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="break-inside-avoid relative group cursor-pointer"
                      onClick={() => {
                        if (node.type !== 'task') setFocusedResource(node);
                      }}
                    >
                      {/* Action Buttons Overlay */}
                      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 flex gap-2 transition-all">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingNodeId(node.id); }}
                          className="p-2 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/90 text-white/70 hover:text-white border border-white/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {node.type !== 'task' && (
                          <button 
                            className="p-2 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/90 text-white/70 hover:text-white border border-white/10"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Image Card */}
                      {node.type === 'image' && (
                        <div className="rounded-2xl overflow-hidden border border-white/10 relative bg-white/5">
                          <img src={getImageSrc(node)} alt={node.title} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 pointer-events-none">
                            <div>
                              <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block mb-1">Image</span>
                              <h4 className="font-medium text-white text-lg">{node.title}</h4>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Text Card */}
                      {node.type === 'text' && (
                        <div className="p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 transition-colors">
                          <FileText className="w-5 h-5 text-white/30 mb-4" />
                          <h4 className="font-mono text-xs uppercase tracking-widest text-white/50 mb-4">{node.title}</h4>
                          <p className="font-serif text-xl leading-relaxed text-white/90 line-clamp-4">{node.content}</p>
                        </div>
                      )}

                      {/* Link Card */}
                      {node.type === 'link' && (
                        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors block">
                          <div className="flex justify-between items-start mb-6">
                            <div className="p-3 rounded-xl bg-white/10 text-white/70 group-hover:text-white group-hover:bg-white/20 transition-colors">
                              <LinkIcon className="w-5 h-5" />
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-white/30 group-hover:text-white/70 transition-colors" />
                          </div>
                          <h4 className="font-medium text-white/90 text-xl mb-2">{node.title}</h4>
                          {node.content && <p className="text-sm text-white/60 mb-4 line-clamp-2">{node.content}</p>}
                          <p className="text-xs font-mono text-white/40 truncate">{node.url}</p>
                        </div>
                      )}

                      {/* Video Card */}
                      {node.type === 'video' && (
                        <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 flex flex-col">
                          <div className="aspect-video bg-black/50 relative w-full pointer-events-none">
                            {node.url ? (
                              <iframe src={node.url} className="w-full h-full absolute inset-0" allowFullScreen tabIndex={-1} />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Play className="w-12 h-12 text-white/20 group-hover:text-white/50 transition-colors" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-transparent z-10" /> {/* Overlay to capture clicks */}
                          </div>
                          <div className="p-5">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block mb-1">Video</span>
                            <h4 className="font-medium text-white/90">{node.title}</h4>
                          </div>
                        </div>
                      )}

                      {/* Audio Card */}
                      {node.type === 'audio' && (
                        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors block">
                          <div className="flex justify-between items-start mb-6">
                            <div className="p-3 rounded-xl bg-white/10 text-white/70 group-hover:text-white group-hover:bg-white/20 transition-colors">
                              <Headphones className="w-5 h-5" />
                            </div>
                          </div>
                          <h4 className="font-medium text-white/90 text-xl mb-2">{node.title}</h4>
                          {node.content && <p className="text-sm text-white/60 mb-4 line-clamp-2">{node.content}</p>}
                          {node.url && (
                            <audio controls className="w-full mt-4" src={node.url}>
                              Your browser does not support the audio element.
                            </audio>
                          )}
                        </div>
                      )}

                      {/* Document Card */}
                      {node.type === 'document' && (
                        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors block">
                          <div className="flex justify-between items-start mb-6">
                            <div className="p-3 rounded-xl bg-white/10 text-white/70 group-hover:text-white group-hover:bg-white/20 transition-colors">
                              <FileIcon className="w-5 h-5" />
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-white/30 group-hover:text-white/70 transition-colors" />
                          </div>
                          <h4 className="font-medium text-white/90 text-xl mb-2">{node.title}</h4>
                          {node.content && <p className="text-sm text-white/60 mb-4 line-clamp-2">{node.content}</p>}
                          <p className="text-xs font-mono text-white/40 truncate">{node.url}</p>
                        </div>
                      )}

                      {/* Task Card */}
                      {node.type === 'task' && (
                        <div 
                          onClick={(e) => { e.stopPropagation(); toggleTask(node); }}
                          className="p-5 rounded-2xl border border-white/10 bg-white/5 flex gap-4 items-start hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <div className="mt-0.5">
                            {node.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-white/30 group-hover:text-white/50 transition-colors" />
                            )}
                          </div>
                          <div>
                            <h4 className={`font-medium text-lg transition-colors ${node.completed ? 'text-white/40 line-through' : 'text-white/90'}`}>
                              {node.title}
                            </h4>
                            {node.content && (
                              <p className={`text-sm mt-1 transition-colors ${node.completed ? 'text-white/30' : 'text-white/60'}`}>
                                {node.content}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                </AnimatePresence>
              </div>
            </div>
          )}
            </>
          )}
        </div>

        {/* Floating Quick Add Menu */}
        {!isAIHome && (
        <div className="fixed bottom-12 right-12 z-40 flex flex-col items-end gap-4">
          <AnimatePresence>
            {showAddMenu && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="flex flex-col gap-2 bg-black/80 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl"
              >
                {addOptions.map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => {
                      if (isCalendar && opt.type === 'event') {
                        onGridClick(currentDate, '09:00');
                      } else {
                        onAddNode(activeId, opt.type);
                      }
                      setShowAddMenu(false);
                    }}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/10 transition-colors text-left"
                  >
                    <opt.icon className="w-4 h-4 text-white/50" />
                    <span className="font-mono text-xs uppercase tracking-widest text-white/90">{opt.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
              showAddMenu ? 'bg-white text-black rotate-45' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
            }`}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
        )}
      </div>

      <ImmersiveViewer 
        resource={focusedResource} 
        onClose={() => setFocusedResource(null)} 
      />

      <AnimatePresence>
        {editingNodeId && (
          <NodeEditor 
            node={nodes.find(n => n.id === editingNodeId)!}
            onChange={onUpdateNode}
            onClose={() => setEditingNodeId(null)}
            onDelete={(id) => {
              onDeleteNode(id);
              setEditingNodeId(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};
