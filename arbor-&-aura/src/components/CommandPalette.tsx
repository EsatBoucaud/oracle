import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArborNode } from '../types';
import { Search, FolderGit2, Image as ImageIcon, FileText, Link as LinkIcon, Video, CheckSquare, Command, ArrowRight } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: ArborNode[];
  onSelect: (id: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, nodes, onSelect }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredNodes = query === '' 
    ? [] 
    : nodes.filter(n => 
        n.title.toLowerCase().includes(query.toLowerCase()) || 
        n.tags?.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
        n.content?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
        // The open logic is handled in App.tsx
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredNodes.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filteredNodes.length > 0) {
        e.preventDefault();
        const node = filteredNodes[selectedIndex];
        onSelect(node.type === 'concept' ? node.id : (node.parentId || node.id));
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filteredNodes, selectedIndex, onSelect]);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'concept': return <FolderGit2 className="w-4 h-4" />;
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'text': return <FileText className="w-4 h-4" />;
      case 'link': return <LinkIcon className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'task': return <CheckSquare className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101] overflow-hidden rounded-2xl bg-zinc-900/90 backdrop-blur-3xl border border-white/10 shadow-2xl"
          >
            <div className="flex items-center px-6 py-5 border-b border-white/10 bg-black/20">
              <Search className="w-6 h-6 text-indigo-400 mr-4" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Oracle workspace... (Programs, tags, content)"
                className="flex-1 bg-transparent text-xl text-white placeholder:text-white/30 focus:outline-none font-sans"
              />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-white/40 text-xs font-mono">
                <Command className="w-3 h-3" /> ESC
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-3">
              {query === '' ? (
                <div className="p-12 text-center text-white/30 font-mono text-sm uppercase tracking-widest flex flex-col items-center gap-4">
                  <Command className="w-8 h-8 opacity-20" />
                  Start typing to search
                </div>
              ) : filteredNodes.length === 0 ? (
                <div className="p-12 text-center text-white/30 font-mono text-sm uppercase tracking-widest flex flex-col items-center gap-4">
                  <Search className="w-8 h-8 opacity-20" />
                  No results found
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {filteredNodes.map((node, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={node.id}
                        onClick={() => {
                          onSelect(node.type === 'concept' ? node.id : (node.parentId || node.id));
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full text-left flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isSelected ? 'bg-indigo-500/20 text-white border border-indigo-500/30' : 'text-white/70 hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-500/30 text-indigo-300' : 'bg-white/5 text-white/40'}`}>
                          {getNodeIcon(node.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium truncate ${isSelected ? 'text-indigo-100' : ''}`}>{node.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono uppercase tracking-widest opacity-50">{node.type}</span>
                            {node.tags && node.tags.length > 0 && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                <div className="flex gap-1 overflow-hidden">
                                  {node.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-sm ${isSelected ? 'bg-indigo-500/30 text-indigo-200' : 'bg-white/10 text-white/50'}`}>
                                      {tag}
                                    </span>
                                  ))}
                                  {node.tags.length > 3 && <span className="text-[10px] text-white/30">+{node.tags.length - 3}</span>}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <motion.div layoutId="command-arrow" className="text-indigo-400">
                            <ArrowRight className="w-5 h-5" />
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
