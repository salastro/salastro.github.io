import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Network, FileText, Filter, Search } from 'lucide-react';
import { useTheme } from 'next-themes';

import GraphView from './components/GraphView';
import NodePanel from './components/NodePanel';
import DocumentView from './components/DocumentView';
import { ThemeToggle } from '../components/ThemeToggle';
import { MyNode, graphData } from '../data/graphData';

type ViewMode = 'graph' | 'document';

export default function App() {
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('graph');
    const [filter, setFilter] = useState<string | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const { resolvedTheme } = useTheme();

    // Theme-aware colors for dot grid
    const isDark = resolvedTheme === 'dark';
    const dotGridColors = {
        baseColor: isDark ? '#333333' : '#d1d5db',
        activeColor: isDark ? '#64d2ff' : '#3b82f6',
    };

    const handleNodeClick = (node: MyNode) => {
        setActiveNodeId(node.id);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        // Don't clear activeNodeId immediately to allow smooth transition back? 
        // Or do clear it. Let's keep it for state but close panel.
        setActiveNodeId(null);
    };

    const switchToDocView = () => {
        setViewMode('document');
        setIsPanelOpen(false);
    };

    const switchToGraphView = () => {
        setViewMode('graph');
    };

    // If in document view and no node selected, show a simple index
    const renderIndex = () => (
        <div className="min-h-screen bg-background text-foreground p-8 md:p-20 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-light text-foreground mb-12">Index</h1>
                <div className="grid gap-8">
                    {graphData.nodes.filter(n => n.group !== 'root').map(node => (
                        <div
                            key={node.id}
                            onClick={() => { setActiveNodeId(node.id); setViewMode('document'); }}
                            className="group cursor-pointer border-b border-border pb-8 hover:border-muted-foreground transition-colors"
                        >
                            <div className="flex justify-between items-baseline mb-2">
                                <h2 className="text-xl font-medium text-foreground group-hover:text-primary transition-colors">{node.title}</h2>
                                <span className="text-xs font-mono text-muted-foreground">{node.group.toUpperCase()}</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{node.description || "Research node awaiting classification."}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative w-full h-screen overflow-hidden bg-background font-sans text-foreground">

            {/* Graph with integrated DotGrid background */}
            <div className={`absolute inset-0 transition-opacity duration-500 ${viewMode === 'graph' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <GraphView
                    onNodeClick={handleNodeClick}
                    activeNodeId={activeNodeId}
                    filter={filter}
                    dotGrid={{
                        dotSize: 2,
                        gap: 7,
                        baseColor: dotGridColors.baseColor,
                        activeColor: dotGridColors.activeColor,
                        proximity: 60,
                        speedTrigger: 100,
                        shockRadius: 200,
                        maxSpeed: 5000,
                        resistance: 750,
                        returnDuration: 1.5
                    }}
                />
            </div>

            {/* Foreground UI Layer (Controls) - visible in Graph Mode */}
            <AnimatePresence>
                {viewMode === 'graph' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none"
                    >
                        {/* Top Left: Filters */}
                        <div className="absolute top-8 left-8 pointer-events-auto">

                            <div className="flex flex-col items-start gap-2 mt-8">
                                {['All', 'Theory', 'Applied Engineering', 'Mathematics', 'Philosophy'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f === 'All' ? null : f)}
                                        className={`text-xs uppercase tracking-widest transition-colors ${(filter === f || (filter === null && f === 'All'))
                                            ? 'text-primary font-semibold'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Top Right: View Toggle and Theme Toggle */}
                        <div className="absolute top-8 right-8 pointer-events-auto flex items-center gap-4">
                            <ThemeToggle />
                            <button
                                onClick={() => setViewMode('graph')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${viewMode === 'graph'
                                    ? 'bg-primary/10 border-primary/20 text-foreground'
                                    : 'bg-transparent border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Network size={14} /> Graph
                            </button>
                            <button
                                onClick={() => setViewMode('document')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${viewMode === 'document'
                                    ? 'bg-primary/10 border-primary/20 text-foreground'
                                    : 'bg-transparent border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <FileText size={14} /> Index
                            </button>
                        </div>

                        {/* Legend Bottom Left */}
                        <div className="absolute bottom-8 left-8 pointer-events-auto">
                            <div className="flex gap-4 text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-foreground"></span> Root
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-muted-foreground"></span> Focus
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-muted"></span> Concept
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Side Panel */}
            <NodePanel
                isOpen={isPanelOpen && viewMode === 'graph'}
                nodeId={activeNodeId}
                onClose={handleClosePanel}
                onOpenDocView={switchToDocView}
            />

            {/* Document View */}
            <AnimatePresence>
                {viewMode === 'document' && (
                    <div className="absolute inset-0 bg-background z-40 overflow-hidden">
                        {activeNodeId ? (
                            <DocumentView nodeId={activeNodeId} onBack={() => {
                                // If we came from graph, maybe go back to graph?
                                // Or go back to index?
                                // The prompt implies Toggle Graph/Doc. 
                                // Let's assume Back in Doc View goes to Graph if we have an active node, 
                                // or maybe back to index. Let's go back to Graph for continuity.
                                switchToGraphView();
                            }} />
                        ) : (
                            renderIndex()
                        )}

                        {/* Floating Toggle even in Doc view? Maybe. 
                     Let's add a close button or toggle in the corner if needed, 
                     but DocumentView has a Back button.
                     We also need to allow switching back to graph if in Index mode.
                 */}
                        {!activeNodeId && (
                            <div className="absolute top-8 right-8 flex items-center gap-4">
                                <ThemeToggle />
                                <button
                                    onClick={switchToGraphView}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-foreground text-xs font-medium hover:bg-primary/20 transition-all"
                                >
                                    <Network size={14} /> Back to Graph
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
