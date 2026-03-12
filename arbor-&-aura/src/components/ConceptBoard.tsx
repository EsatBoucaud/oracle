import React, { useState } from 'react';
import { ArborNode, NodeType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, CheckCircle2, Circle, Play, Link as LinkIcon, FileText, FolderGit2, Edit2, Plus, Image as ImageIcon, Video, CheckSquare, Maximize2, Headphones, File as FileIcon, Upload, Calendar, Clock, LayoutGrid, Columns, Square, Table, BarChart2, Activity, Database, CheckCircle, Zap, TrendingUp, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart } from 'recharts';
import { ImmersiveViewer } from './ImmersiveViewer';
import { NodeEditor } from './NodeEditor';

interface ConceptBoardProps {
  nodes: ArborNode[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onUpdateNode: (node: ArborNode) => void;
  onEditNode: (id: string) => void;
  onAddNode: (parentId: string, type: NodeType, data?: Partial<ArborNode>) => void;
  onDeleteNode: (id: string) => void;
}

export const ConceptBoard: React.FC<ConceptBoardProps> = ({ nodes, activeId, onSelect, onUpdateNode, onEditNode, onAddNode, onDeleteNode }) => {
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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
  
  const kpiData = React.useMemo(() => {
    if (!isDashboard) return null;
    const tasks = allResources.filter(n => n.type === 'task');
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
    
    // Simulate storage based on content length and media presence
    const storageBytes = allResources.reduce((acc, node) => {
      let size = 1024; // base 1KB per node
      if (node.content) size += node.content.length;
      if (node.imageUrl || node.url) size += 500 * 1024; // simulate 500KB per media
      return acc + size;
    }, 0);
    const storageMB = (storageBytes / (1024 * 1024)).toFixed(1);

    return {
      totalNodes: allResources.length,
      activeTasks: tasks.length - completedTasks,
      completionRate,
      storageUsed: storageMB
    };
  }, [allResources, isDashboard]);

  const radarData = React.useMemo(() => {
    if (!isDashboard) return [];
    
    const categories = {
      'Design': ['architecture', 'design', 'ui', 'typography', 'colors', 'texture', 'glass', 'brutalism', 'minimalism', 'abstract', 'moodboard'],
      'Research': ['research', 'science', 'data', 'interview', 'survey', 'usability', 'competitors'],
      'Development': ['engineering', 'frontend', '3d', 'structure'],
      'Planning': ['todo', 'kanban', 'project-management', 'status:todo', 'status:in-progress', 'status:done', 'calendar', 'events', 'planning', 'action-item'],
      'Marketing': ['marketing', 'copywriting', 'pr', 'communications', 'social', 'networking'],
      'Media': ['video', 'image', 'audio', 'document', 'reference', 'inspiration']
    };

    const counts: Record<string, number> = {
      'Design': 0, 'Research': 0, 'Development': 0, 'Planning': 0, 'Marketing': 0, 'Media': 0, 'Other': 0
    };
    
    allResources.forEach(node => {
      if (!node.tags || node.tags.length === 0) {
        counts['Other']++;
      } else {
        node.tags.forEach(tag => {
          const lowerTag = tag.toLowerCase();
          let matched = false;
          for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.includes(lowerTag)) {
              counts[category]++;
              matched = true;
              break;
            }
          }
          if (!matched) counts['Other']++;
        });
      }
    });

    return [
      { subject: 'Design', A: counts['Design'], fullMark: 100 },
      { subject: 'Research', A: counts['Research'], fullMark: 100 },
      { subject: 'Development', A: counts['Development'], fullMark: 100 },
      { subject: 'Planning', A: counts['Planning'], fullMark: 100 },
      { subject: 'Marketing', A: counts['Marketing'], fullMark: 100 },
      { subject: 'Media', A: counts['Media'], fullMark: 100 },
    ];
  }, [allResources, isDashboard]);

  const activityData = React.useMemo(() => {
    if (!isDashboard) return [];
    const data = [];
    
    const conceptsByDate: Record<string, number> = {};
    const resourcesByDate: Record<string, number> = {};
    
    allResources.forEach(node => {
      if (node.updatedAt) {
        const isoDate = node.updatedAt.split('T')[0];
        if (node.type === 'concept') {
          conceptsByDate[isoDate] = (conceptsByDate[isoDate] || 0) + 1;
        } else {
          resourcesByDate[isoDate] = (resourcesByDate[isoDate] || 0) + 1;
        }
      }
    });

    for (let i = 14; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      data.push({
        date: dateStr,
        concepts: conceptsByDate[isoDate] || 0,
        resources: resourcesByDate[isoDate] || 0,
      });
    }
    return data;
  }, [allResources, isDashboard]);

  const nodeTypeData = React.useMemo(() => {
    if (!isDashboard) return [];
    const counts: Record<string, number> = {};
    allResources.forEach(node => {
      counts[node.type] = (counts[node.type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allResources, isDashboard]);

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
        className="w-full h-full overflow-y-auto custom-scrollbar px-8 md:px-16 py-12 pb-32 relative"
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
        <div className="max-w-5xl mx-auto">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm font-mono tracking-widest uppercase opacity-50 mb-8 flex-wrap">
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

          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={`hero-${activeId}`}
            className="mb-12 relative group"
          >
            <div className="flex items-start justify-between gap-8">
              <div>
                <h1 className="text-5xl md:text-7xl font-serif tracking-tight mb-6 leading-none">
                  {activeNode.title}
                </h1>
                {activeNode.content && (
                  <p className="text-xl md:text-2xl text-white/70 max-w-3xl leading-relaxed font-sans font-light">
                    {activeNode.content}
                  </p>
                )}
                {activeNode.tags && activeNode.tags.length > 0 && (
                  <div className="flex gap-2 mt-6">
                    {activeNode.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-mono uppercase tracking-widest">
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

          {/* Filter Bar */}
          {allResources.length > 0 && (
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
            <div className="mb-16">
              <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
                {/* Calendar Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-serif text-2xl text-white flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-white/50" />
                    {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => onAddNode(activeId, 'event')}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-mono tracking-wider uppercase flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Event
                  </button>
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 border-b border-white/10 bg-black/40">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-3 text-center text-xs font-mono tracking-widest uppercase text-white/40 border-r border-white/10 last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 bg-black/20">
                  {/* Generate calendar days */}
                  {(() => {
                    const today = new Date();
                    const year = today.getFullYear();
                    const month = today.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    
                    const days = [];
                    // Empty cells before 1st
                    for (let i = 0; i < firstDay; i++) {
                      days.push(<div key={`empty-${i}`} className="min-h-[120px] p-2 border-r border-b border-white/5 bg-black/40" />);
                    }
                    
                    // Actual days
                    for (let d = 1; d <= daysInMonth; d++) {
                      const currentDate = new Date(year, month, d);
                      // Adjust for local timezone to avoid off-by-one errors with ISO string
                      const dateString = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                      const isToday = d === today.getDate();
                      
                      // Find events for this day
                      const dayEvents = nodes.filter(n => 
                        n.parentId === activeId && 
                        n.type === 'event' && 
                        n.startDate === dateString
                      );
                      
                      days.push(
                        <div key={d} className={`min-h-[120px] p-2 border-r border-b border-white/5 transition-colors hover:bg-white/5 ${isToday ? 'bg-white/5' : ''}`}>
                          <div className={`text-xs font-mono mb-2 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-white text-black' : 'text-white/40'}`}>
                            {d}
                          </div>
                          <div className="flex flex-col gap-1">
                            {dayEvents.map(event => (
                              <div 
                                key={event.id}
                                onClick={(e) => { e.stopPropagation(); setFocusedResource(event); }}
                                className="text-xs p-1.5 rounded bg-white/10 border border-white/10 text-white/80 truncate cursor-pointer hover:bg-white/20 transition-colors"
                              >
                                {event.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    
                    // Empty cells after end of month to complete grid
                    const totalCells = days.length;
                    const remainingCells = (7 - (totalCells % 7)) % 7;
                    for (let i = 0; i < remainingCells; i++) {
                      days.push(<div key={`empty-end-${i}`} className="min-h-[120px] p-2 border-r border-b border-white/5 bg-black/40" />);
                    }
                    
                    return days;
                  })()}
                </div>
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
          {isDashboard && filter === 'all' && kpiData && (
            <div className="mb-16 space-y-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-white/40 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Workspace Analytics
                </h3>
              </div>
              
              {/* KPI Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-white/50 text-sm font-medium">Total Resources</p>
                    <Database className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-4xl font-serif text-white">{kpiData.totalNodes}</p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-white/50 text-sm font-medium">Active Tasks</p>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-4xl font-serif text-white">{kpiData.activeTasks}</p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-white/50 text-sm font-medium">Completion Rate</p>
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-4xl font-serif text-white">{kpiData.completionRate}%</p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-white/50 text-sm font-medium">Storage Used</p>
                    <Zap className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-4xl font-serif text-white">{kpiData.storageUsed} <span className="text-lg text-white/50">MB</span></p>
                </div>
              </div>

              {/* Main Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Activity Over Time (Composed Chart) */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:col-span-2">
                  <h4 className="text-sm font-medium text-white/70 mb-6 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Activity Timeline
                  </h4>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorEdited" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={12} tickMargin={10} />
                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} />
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Area type="monotone" dataKey="resources" name="Resource Updates" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorEdited)" />
                        <Bar dataKey="concepts" name="New Concepts" barSize={20} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Knowledge Distribution (Radar Chart) */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h4 className="text-sm font-medium text-white/70 mb-6 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Knowledge Distribution
                  </h4>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                        <Radar name="Topics" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Resource Types (Donut Chart) */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h4 className="text-sm font-medium text-white/70 mb-6 flex items-center gap-2">
                    <PieChart className="w-4 h-4" /> Resource Types
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={nodeTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {nodeTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:col-span-2">
                  <h4 className="text-sm font-medium text-white/70 mb-6 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Recent Activity
                  </h4>
                  <div className="space-y-4">
                    {[...allResources].sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()).slice(0, 5).map((node, i) => (
                      <div key={node.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setFocusedResource(node)}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white`}>
                            {node.type === 'concept' && <FolderGit2 className="w-4 h-4" />}
                            {node.type === 'image' && <ImageIcon className="w-4 h-4" />}
                            {node.type === 'text' && <FileText className="w-4 h-4" />}
                            {node.type === 'task' && <CheckSquare className="w-4 h-4" />}
                            {node.type === 'link' && <LinkIcon className="w-4 h-4" />}
                            {node.type === 'video' && <Video className="w-4 h-4" />}
                            {node.type === 'audio' && <Headphones className="w-4 h-4" />}
                            {node.type === 'document' && <FileIcon className="w-4 h-4" />}
                            {node.type === 'event' && <Calendar className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white/90">{node.title}</p>
                            <p className="text-xs text-white/40 mt-1">
                              {node.type.charAt(0).toUpperCase() + node.type.slice(1)} • Added recently
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {node.tags?.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-1 rounded bg-white/5 text-[10px] font-mono uppercase tracking-widest text-white/50 border border-white/10">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    {allResources.length === 0 && (
                      <div className="text-center py-8 text-white/40 text-sm">
                        No recent activity found.
                      </div>
                    )}
                  </div>
                </div>

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
        </div>

        {/* Floating Quick Add Menu */}
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
                      onAddNode(activeId, opt.type);
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
