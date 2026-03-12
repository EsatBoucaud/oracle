import React from 'react';
import { ArborNode, NodeType } from '../types';
import { X, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface NodeEditorProps {
  node: ArborNode;
  onChange: (node: ArborNode) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const NodeEditor: React.FC<NodeEditorProps> = ({ node, onChange, onClose, onDelete }) => {
  const handleChange = (field: keyof ArborNode, value: any) => {
    onChange({ ...node, [field]: value });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 w-96 bg-zinc-900/90 backdrop-blur-3xl border-l border-white/10 shadow-2xl z-50 flex flex-col"
      >
        <div className="h-20 flex items-center justify-between px-8 border-b border-white/10 bg-black/20">
          <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-white/50">Edit Node</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
        <div>
          <label className="block font-mono text-[10px] tracking-widest uppercase text-white/40 mb-3">Title</label>
          <input 
            type="text" 
            value={node.title} 
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full bg-transparent border-b border-white/20 pb-2 text-2xl font-serif text-white focus:outline-none focus:border-white transition-colors placeholder:text-white/20"
            placeholder="Enter title..."
          />
        </div>

        <div>
          <label className="block font-mono text-[10px] tracking-widest uppercase text-white/40 mb-3">Type</label>
          <div className="relative">
            <select 
              value={node.type} 
              onChange={(e) => handleChange('type', e.target.value as NodeType)}
              className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
            >
              <option value="concept" className="bg-zinc-900">Concept</option>
              <option value="text" className="bg-zinc-900">Text Note</option>
              <option value="image" className="bg-zinc-900">Image</option>
              <option value="link" className="bg-zinc-900">Link</option>
              <option value="video" className="bg-zinc-900">Video</option>
              <option value="task" className="bg-zinc-900">Task</option>
              <option value="audio" className="bg-zinc-900">Audio</option>
              <option value="document" className="bg-zinc-900">Document</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-mono text-[10px] tracking-widest uppercase text-white/40 mb-3">Description / Content</label>
          <textarea 
            value={node.content || ''} 
            onChange={(e) => handleChange('content', e.target.value)}
            rows={5}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors resize-none placeholder:text-white/20"
            placeholder="Add some details..."
          />
        </div>

        <div>
          <label className="block font-mono text-[10px] tracking-widest uppercase text-white/40 mb-3">Tags (comma separated)</label>
          <input 
            type="text" 
            value={node.tags?.join(', ') || ''} 
            onChange={(e) => {
              const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t !== '');
              handleChange('tags', tags);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
            placeholder="e.g. design, research, ideas"
          />
        </div>

        {(node.type === 'image' || node.type === 'video' || node.type === 'link' || node.type === 'audio' || node.type === 'document') && (
          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-white/40 mb-3">
              {node.type === 'image' ? 'Image URL' : node.type === 'video' ? 'Video Embed URL' : node.type === 'audio' ? 'Audio URL' : node.type === 'document' ? 'Document URL' : 'Link URL'}
            </label>
            <input 
              type="text" 
              value={node.url || node.imageUrl || ''} 
              onChange={(e) => handleChange(node.type === 'image' ? 'imageUrl' : 'url', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
              placeholder="https://..."
            />
          </div>
        )}

        {node.type === 'concept' && (
          <div>
            <label className="block font-mono text-[10px] tracking-widest uppercase text-white/40 mb-3">Ambient Color (Hex)</label>
            <div className="flex gap-3 items-center">
              <div 
                className="w-10 h-10 rounded-full border border-white/20 shadow-inner"
                style={{ backgroundColor: node.color || '#ffffff' }}
              />
              <input 
                type="text" 
                value={node.color || ''} 
                onChange={(e) => handleChange('color', e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/20"
                placeholder="#000000"
              />
            </div>
          </div>
        )}
      </div>
      
        <div className="p-8 border-t border-white/10 bg-black/20">
          <button 
            onClick={() => onDelete(node.id)}
            className="w-full py-3 px-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium hover:bg-red-500/20 hover:text-red-300 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete Node
          </button>
        </div>
      </motion.div>
    </>
  );
};
