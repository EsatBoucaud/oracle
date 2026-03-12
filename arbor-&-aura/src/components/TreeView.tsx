import React, { useState } from 'react';
import { ArborNode } from '../types';
import { ChevronRight, ChevronDown, Folder, FileText, Image as ImageIcon, Link as LinkIcon, Plus } from 'lucide-react';

interface TreeViewProps {
  nodes: ArborNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddNode: (parentId: string) => void;
}

export const TreeView: React.FC<TreeViewProps> = ({ nodes, selectedId, onSelect, onAddNode }) => {
  const rootNodes = nodes.filter(n => n.parentId === null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(rootNodes.map(n => n.id)));

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(expanded);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpanded(next);
  };

  const renderNode = (node: ArborNode, depth: number) => {
    const children = nodes.filter(n => n.parentId === node.id);
    const hasChildren = children.length > 0;
    const isExpanded = expanded.has(node.id);
    const isSelected = selectedId === node.id;

    const Icon = node.type === 'concept' ? Folder :
                 node.type === 'image' ? ImageIcon :
                 node.type === 'link' ? LinkIcon : FileText;

    return (
      <div key={node.id} className="select-none">
        <div 
          className={`flex items-center py-1.5 px-2 rounded-md cursor-pointer group transition-colors ${isSelected ? 'bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/30 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => onSelect(node.id)}
        >
          <div className="w-4 h-4 mr-1 flex items-center justify-center" onClick={(e) => hasChildren && toggleExpand(node.id, e)}>
            {hasChildren ? (
              isExpanded ? <ChevronDown className="w-3.5 h-3.5 opacity-70" /> : <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            ) : null}
          </div>
          <Icon className="w-4 h-4 mr-2 opacity-70" />
          <span className="text-sm font-medium truncate flex-1">{node.title}</span>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onAddNode(node.id); }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-opacity"
            title="Add Child Node"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        {isExpanded && hasChildren && (
          <div className="">
            {children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="py-2">
      {rootNodes.map(node => renderNode(node, 0))}
    </div>
  );
};
