import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArborNode } from '../types';
import { X, ExternalLink, Play, Headphones, File } from 'lucide-react';

interface ImmersiveViewerProps {
  resource: ArborNode | null;
  onClose: () => void;
}

export const ImmersiveViewer: React.FC<ImmersiveViewerProps> = ({ resource, onClose }) => {
  const imageSrc = resource?.imageUrl || resource?.content || '';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (resource) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resource, onClose]);

  if (!resource) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(40px)' }}
        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-8 md:p-16"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all z-50"
        >
          <X className="w-6 h-6" />
        </button>

        <motion.div 
          layoutId={`resource-${resource.id}`}
          className="w-full max-w-6xl max-h-full flex flex-col relative"
        >
          {resource.type === 'image' && (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <img 
                src={imageSrc} 
                alt={resource.title} 
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="mt-8 text-center">
                <h2 className="text-3xl font-serif text-white mb-2">{resource.title}</h2>
                {resource.tags && (
                  <div className="flex justify-center gap-2">
                    {resource.tags.map(t => (
                      <span key={t} className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-mono uppercase tracking-widest">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {resource.type === 'text' && (
            <div className="w-full max-w-3xl mx-auto bg-zinc-900/50 p-12 md:p-24 rounded-3xl border border-white/10 shadow-2xl overflow-y-auto custom-scrollbar max-h-[85vh]">
              <div className="font-mono text-sm tracking-[0.2em] uppercase text-indigo-400 mb-8">ReadWorks Brief</div>
              <h2 className="text-5xl md:text-6xl font-serif text-white mb-12 leading-tight">{resource.title}</h2>
              <div className="prose prose-invert prose-lg max-w-none font-serif text-white/80 leading-relaxed">
                {resource.content?.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-6">{paragraph}</p>
                ))}
              </div>
            </div>
          )}

          {resource.type === 'video' && (
            <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
              <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
                {resource.url ? (
                  <iframe src={resource.url} className="w-full h-full absolute inset-0" allowFullScreen />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-24 h-24 text-white/20" />
                  </div>
                )}
              </div>
              <div className="mt-8 text-center">
                <h2 className="text-3xl font-serif text-white mb-2">{resource.title}</h2>
              </div>
            </div>
          )}

          {resource.type === 'link' && (
            <div className="w-full max-w-2xl mx-auto bg-zinc-900/80 p-12 rounded-3xl border border-white/10 shadow-2xl text-center">
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
                <ExternalLink className="w-10 h-10 text-white/50" />
              </div>
              <h2 className="text-4xl font-serif text-white mb-6">{resource.title}</h2>
              <p className="text-xl text-white/60 mb-12 font-light">{resource.content}</p>
              <a 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors"
              >
                Visit External Link <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {resource.type === 'audio' && (
            <div className="w-full max-w-2xl mx-auto bg-zinc-900/80 p-12 rounded-3xl border border-white/10 shadow-2xl text-center">
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
                <Headphones className="w-10 h-10 text-white/50" />
              </div>
              <h2 className="text-4xl font-serif text-white mb-6">{resource.title}</h2>
              <p className="text-xl text-white/60 mb-12 font-light">{resource.content}</p>
              {resource.url && (
                <audio controls className="w-full" src={resource.url}>
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
          )}

          {resource.type === 'document' && (
            <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
              <div className="w-full aspect-[1/1.4] max-h-[80vh] bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
                {resource.url ? (
                  <iframe src={resource.url} className="w-full h-full absolute inset-0 bg-white" title={resource.title} />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                    <File className="w-24 h-24 mb-4" />
                    <p className="font-mono text-sm uppercase tracking-widest">No Document URL</p>
                  </div>
                )}
              </div>
              <div className="mt-8 text-center">
                <h2 className="text-3xl font-serif text-white mb-2">{resource.title}</h2>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
