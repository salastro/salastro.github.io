import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Hash, BookOpen, Link2 } from 'lucide-react';
import { MyNode, nodeContent, graphData } from '../../data/graphData';
import { LaTeX } from '../../components/LaTeX';

interface NodePanelProps {
  isOpen: boolean;
  nodeId: string | null;
  onClose: () => void;
  onOpenDocView: () => void;
}

const LatexEquation: React.FC<{ eq: string }> = ({ eq }) => (
  <div className="my-4 p-4 bg-secondary border border-border rounded overflow-x-auto text-center">
    <div className="inline-block">
      <LaTeX displayMode={true}>{eq}</LaTeX>
    </div>
  </div>
);

function formatReadingTime(minutes?: number) {
  if (!minutes) return null;
  return `${minutes} min read`;
}

const NodePanel: React.FC<NodePanelProps> = ({ isOpen, nodeId, onClose, onOpenDocView }) => {
  const content = nodeId ? (nodeContent[nodeId] || nodeContent['default']) : null;

  // Find tag-based related nodes
  const getTagRelatedNodes = () => {
    if (!nodeId) return [];
    const relatedNodeIds = graphData.links
      .filter((link: any) => link.type === 'tag' && (link.source === nodeId || link.target === nodeId))
      .map((link: any) => link.source === nodeId ? link.target : link.source);

    const uniqueIds = [...new Set(relatedNodeIds)] as string[];
    return graphData.nodes.filter((node: MyNode) => uniqueIds.includes(node.id));
  };

  const tagRelatedNodes = getTagRelatedNodes();

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
              {formatReadingTime(content.readingTime) && (
                <p className="mt-1 text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  {formatReadingTime(content.readingTime)}
                </p>
              )}
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

            {/* Related by Tags */}
            {tagRelatedNodes.length > 0 && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <Link2 size={12} /> Related by Tags
                </h3>
                <div className="space-y-2">
                  {tagRelatedNodes.map((node: MyNode) => (
                    <div key={node.id} className="text-sm p-2 rounded border border-border/50 bg-secondary/30 hover:bg-secondary/60 transition-colors cursor-pointer">
                      <div className="font-medium text-foreground">{node.title}</div>
                      {node.tags && node.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {node.tags.map((tag: string) => (
                            <span key={tag} className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 border border-border rounded-full text-muted-foreground bg-background/50">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
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
