import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Hash, BookOpen } from 'lucide-react';
import { MyNode, nodeContent } from '../../data/graphData';

interface NodePanelProps {
  isOpen: boolean;
  nodeId: string | null;
  onClose: () => void;
  onOpenDocView: () => void;
}

const LatexEquation: React.FC<{ eq: string }> = ({ eq }) => (
  <div className="my-4 p-4 bg-secondary border border-border rounded font-mono text-sm text-muted-foreground overflow-x-auto flex justify-center">
    {/* In a real app, use KaTeX here. For this demo, we assume the string is roughly readable or use a placeholder style */}
    <span className="italic tracking-wide">{eq}</span>
  </div>
);

const NodePanel: React.FC<NodePanelProps> = ({ isOpen, nodeId, onClose, onOpenDocView }) => {
  const content = nodeId ? (nodeContent[nodeId] || nodeContent['default']) : null;

  return (
    <AnimatePresence>
      {isOpen && content && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 w-full md:w-[480px] h-full bg-background border-l border-border z-50 shadow-2xl overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-background/90 backdrop-blur-sm p-6 border-b border-border flex justify-between items-start z-10">
            <div>
              <h2 className="text-xl font-medium text-foreground tracking-tight">{content.title}</h2>
              <div className="flex gap-2 mt-2 flex-wrap">
                {content.tags?.map((tag: string) => (
                  <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-0.5 border border-border rounded-full text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-8">

            {/* Abstract */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Abstract</h3>
              <p className="text-sm leading-relaxed text-muted-foreground text-justify">
                {content.abstract}
              </p>
            </section>

            {/* Equations */}
            {content.equations && content.equations.length > 0 && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Mathematical Model</h3>
                <div className="space-y-2">
                  {content.equations.map((eq: string, i: number) => (
                    <LatexEquation key={i} eq={eq} />
                  ))}
                </div>
              </section>
            )}

            {/* Related */}
            <section className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Related Projects</h3>
                <ul className="space-y-2">
                  {content.projects?.map((p: string) => (
                    <li key={p} className="text-sm text-primary hover:text-primary/80 cursor-pointer flex items-center gap-2">
                      <Hash size={12} /> {p.replace('proj-', '')}
                    </li>
                  ))}
                  {(!content.projects || content.projects.length === 0) && <li className="text-sm text-muted-foreground italic">None</li>}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Concepts</h3>
                <ul className="space-y-2">
                  {content.concepts?.map((c: string) => (
                    <li key={c} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-2">
                      <BookOpen size={12} /> {c}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Actions */}
            <div className="pt-8 border-t border-border mt-8">
              <button
                onClick={onOpenDocView}
                className="w-full flex items-center justify-center gap-2 py-3 border border-border hover:border-muted-foreground hover:bg-accent text-sm font-medium transition-all text-foreground"
              >
                <ExternalLink size={16} /> Open Document View
              </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NodePanel;
