import React, { useMemo } from 'react';
import { ArborNode } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { seededRandom } from '../utils';

interface CollageAuraProps {
  nodes: ArborNode[];
  activeId: string | null;
}

export const CollageAura: React.FC<CollageAuraProps> = ({ nodes, activeId }) => {
  const activeNode = nodes.find(n => n.id === activeId);

  const auraItems = useMemo(() => {
    if (!activeId) return [];

    const getDescendants = (parentId: string): ArborNode[] => {
      const children = nodes.filter(n => n.parentId === parentId);
      let descendants = [...children];
      children.forEach(child => {
        descendants = [...descendants, ...getDescendants(child.id)];
      });
      return descendants;
    };

    const items = [activeNode!, ...getDescendants(activeId)].filter(
      n => n.type === 'image' || n.type === 'text' || (n.type === 'concept' && n.content)
    );

    // Generate deterministic random positions based on ID
    return items.map((item, index) => {
      const rng = seededRandom(item.id);
      
      // Distribute organically but keep roughly centered
      const angle = rng() * Math.PI * 2;
      const radius = rng() * 35 + (index === 0 ? 0 : 15); // Center the first item more
      
      const top = 50 + Math.sin(angle) * radius;
      const left = 50 + Math.cos(angle) * radius;
      
      const rotate = (rng() - 0.5) * 30; // -15 to +15 degrees
      const scale = rng() * 0.4 + 0.8; // 0.8 to 1.2
      const zIndex = Math.floor(rng() * 50);

      return {
        ...item,
        layout: { top: `${top}%`, left: `${left}%`, rotate, scale, zIndex }
      };
    });
  }, [activeId, nodes, activeNode]);

  if (!activeId) {
    return (
      <div className="w-full h-full flex items-center justify-center opacity-20">
        <span className="font-mono text-xs tracking-[0.3em] uppercase">Select a node to reveal its aura</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
      <AnimatePresence mode="popLayout">
        {auraItems.map((item) => (
          <motion.div
            key={item.id}
            layoutId={`aura-${item.id}`}
            initial={{ opacity: 0, scale: 0.5, filter: 'blur(20px)' }}
            animate={{ 
              opacity: 1, 
              scale: item.layout.scale, 
              filter: 'blur(0px)',
              top: item.layout.top,
              left: item.layout.left,
              rotate: item.layout.rotate,
              x: '-50%',
              y: '-50%'
            }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
            transition={{ type: 'spring', damping: 20, stiffness: 100, mass: 1 }}
            className="absolute shadow-2xl"
            style={{ zIndex: item.layout.zIndex }}
          >
            {item.type === 'image' && item.imageUrl && (
              <div className="relative group">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="max-w-[300px] max-h-[400px] object-cover rounded-sm mix-blend-screen opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 ring-1 ring-white/20 rounded-sm pointer-events-none" />
              </div>
            )}

            {(item.type === 'text' || (item.type === 'concept' && item.content)) && (
              <div className="w-64 p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-sm">
                <h3 className="font-mono text-[10px] tracking-widest uppercase opacity-50 mb-3">{item.title}</h3>
                <p className="font-serif text-xl leading-snug text-white/90">{item.content}</p>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
