import React from 'react';
import { ArborNode } from '../types';
import { FileText, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface BoardViewProps {
  nodes: ArborNode[];
  selectedNode: ArborNode | null;
}

export const BoardView: React.FC<BoardViewProps> = ({ nodes, selectedNode }) => {
  if (!selectedNode) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-400">
        Select a node to view its board
      </div>
    );
  }

  const getDescendants = (parentId: string): ArborNode[] => {
    const children = nodes.filter(n => n.parentId === parentId);
    let descendants = [...children];
    children.forEach(child => {
      descendants = [...descendants, ...getDescendants(child.id)];
    });
    return descendants;
  };

  const boardNodes = [selectedNode, ...getDescendants(selectedNode.id)];

  return (
    <div className="p-8 h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
      <div className="mb-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif text-zinc-900 dark:text-zinc-100 tracking-tight">{selectedNode.title}</h1>
        {selectedNode.content && (
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">{selectedNode.content}</p>
        )}
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 max-w-7xl mx-auto">
        {boardNodes.filter(n => n.id !== selectedNode.id).map((node, i) => (
          <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
            key={node.id} 
            className="break-inside-avoid bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden hover:shadow-md transition-shadow"
          >
            {node.imageUrl && (
              <img src={node.imageUrl} alt={node.title} className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
            )}
            {node.color && !node.imageUrl && (
              <div className="w-full h-32" style={{ backgroundColor: node.color }} />
            )}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                {node.type === 'image' && <ImageIcon className="w-4 h-4 text-zinc-400" />}
                {node.type === 'text' && <FileText className="w-4 h-4 text-zinc-400" />}
                {node.type === 'link' && <LinkIcon className="w-4 h-4 text-zinc-400" />}
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{node.title}</h3>
              </div>
              {node.content && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{node.content}</p>
              )}
              {node.url && (
                <a href={node.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block truncate max-w-full">
                  {node.url}
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
