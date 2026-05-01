import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Network, FileText, Filter, Search, ArrowUpDown } from 'lucide-react';
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
    const [previousViewMode, setPreviousViewMode] = useState<ViewMode>('graph');
    const [sortBy, setSortBy] = useState<'title' | 'group' | 'date'>('title');
    const [searchQuery, setSearchQuery] = useState<string>('');
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
        setPreviousViewMode(viewMode === 'document' && !activeNodeId ? 'document' : viewMode);
        setViewMode('document');
        setIsPanelOpen(false);
    };

    const switchToGraphView = () => {
        setViewMode('graph');
    };

    // If in document view and no node selected, show a simple index
    const renderIndex = () => {
        // Apply the same filter logic as the graph
        let filteredNodes = graphData.nodes.filter(n => n.group !== 'root');
        if (filter) {
            if (filter === 'Theory') {
                filteredNodes = filteredNodes.filter(n => ['focus', 'concept'].includes(n.group));
            } else if (filter === 'Applied Engineering') {
                filteredNodes = filteredNodes.filter(n => ['focus', 'project'].includes(n.group));
            } else if (filter === 'Mathematics') {
                filteredNodes = filteredNodes.filter(n => ['focus', 'concept'].includes(n.group) && (n.tags?.includes('Math') || n.group === 'focus'));
            } else if (filter === 'Philosophy') {
                filteredNodes = filteredNodes.filter(n => ['focus', 'concept'].includes(n.group) && (n.tags?.includes('Philosophy') || n.group === 'focus'));
            }
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filteredNodes = filteredNodes.filter(n => {
                const titleMatch = (n.title || '').toLowerCase().includes(query);
                const descriptionMatch = (n.description || '').toLowerCase().includes(query);
                const tagsMatch = (n.tags || []).some(tag => tag.toLowerCase().includes(query));
                const idMatch = n.id.toLowerCase().includes(query);
                return titleMatch || descriptionMatch || tagsMatch || idMatch;
            });
        }

        // Apply sorting
        const sortedNodes = [...filteredNodes].sort((a, b) => {
            if (sortBy === 'title') {
                return (a.title || '').localeCompare(b.title || '');
            } else if (sortBy === 'group') {
                return a.group.localeCompare(b.group);
            } else if (sortBy === 'date') {
                // Sort by date descending (newest first)
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                return dateB - dateA;
            }
            return 0;
        });

        return (
            <div className="min-h-screen bg-background text-foreground p-8 md:p-20 pt-24 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                type="text"
                                placeholder="Search by title, description, tags..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-light text-foreground">Index</h1>
                            {searchQuery && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    {sortedNodes.length} result{sortedNodes.length !== 1 ? 's' : ''} found
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <ArrowUpDown size={14} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground mr-2">Sort by:</span>
                            {(['title', 'group', 'date'] as const).map(option => (
                                <button
                                    key={option}
                                    onClick={() => setSortBy(option)}
                                    className={`text-xs px-2 py-1 rounded transition-colors cursor-pointer ${sortBy === option
                                        ? 'bg-primary/10 text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {sortedNodes.length === 0 && searchQuery && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                        </div>
                    )}

                    <div className="grid gap-8">
                        {sortedNodes.map(node => (
                            <div
                                key={node.id}
                                onClick={() => { setPreviousViewMode('document'); setActiveNodeId(node.id); setViewMode('document'); }}
                                className="group cursor-pointer border-b border-border pb-8 hover:border-muted-foreground transition-colors"
                            >
                                <div className="flex justify-between items-baseline mb-2">
                                    <h2 className="text-xl font-medium text-foreground group-hover:text-primary transition-colors">{node.title}</h2>
                                    <span className="text-xs font-mono text-muted-foreground">{node.group.toUpperCase()}</span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{node.description || "Research node awaiting classification."}</p>
                                {node.tags && node.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {node.tags.map(tag => (
                                            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

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

            {/* Foreground UI Layer (Controls) - always visible */}
            <div className="absolute inset-0 pointer-events-none z-50">
                {/* Top Left: Filters */}
                <div className="absolute top-8 left-8 pointer-events-auto">
                    <div className="flex flex-col items-start gap-2 mt-8">
                        {['All', 'Theory', 'Applied Engineering', 'Mathematics', 'Philosophy'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f === 'All' ? null : f)}
                                className={`text-xs uppercase tracking-widest transition-colors cursor-pointer ${(filter === f || (filter === null && f === 'All'))
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
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${viewMode === 'graph'
                            ? 'bg-primary/10 border-primary/20 text-foreground'
                            : 'bg-transparent border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Network size={14} /> Graph
                    </button>
                    <button
                        onClick={() => { setViewMode('document'); setActiveNodeId(null); }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${viewMode === 'document' && !activeNodeId
                            ? 'bg-primary/10 border-primary/20 text-foreground'
                            : 'bg-transparent border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <FileText size={14} /> Index
                    </button>
                </div>

                {/* Legend Bottom Left - only in graph mode */}
                {viewMode === 'graph' && (
                    <div className="absolute bottom-8 left-8 pointer-events-auto">
                        <div className="flex flex-col gap-2 text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-foreground"></span> Root
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-muted-foreground"></span> Focus
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-muted"></span> Concept
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span> Essay
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-px bg-foreground/30"></div>
                                    <span>Explicit</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-px bg-blue-400/30"></div>
                                    <span>Shared Tags</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

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
                    <div className="absolute inset-0 bg-background z-40 overflow-y-auto">
                        {activeNodeId ? (
                            <DocumentView
                                nodeId={activeNodeId}
                                backLabel={previousViewMode === 'graph' ? 'Back to Graph' : 'Back to Index'}
                                onBack={() => {
                                    // Go back to previous view mode
                                    if (previousViewMode === 'graph') {
                                        setViewMode('graph');
                                        // setActiveNodeId(null);
                                    } else {
                                        setActiveNodeId(null);
                                    }
                                }}
                            />
                        ) : (
                            renderIndex()
                        )}
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
