import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { nodeContent } from '../../data/graphData';
import { LaTeXBlock } from '../../components/LaTeX';
import { CodeBlock } from '../../components/CodeBlock';
import { formatDateDDMMYYYY } from '../../lib/utils';

interface DocumentViewProps {
    nodeId: string;
    onBack: () => void;
    backLabel?: string;
}

function formatReadingTime(minutes?: number) {
    if (!minutes) return null;
    return `${minutes} min read`;
}

const DocumentView: React.FC<DocumentViewProps> = ({ nodeId, onBack, backLabel = 'Back' }) => {
    const content = nodeContent[nodeId] || nodeContent['default'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-background z-[60] overflow-y-auto"
        >
            <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">

                {/* Sticky Top Section (mobile) */}
                <div className="sticky top-0 bg-background/90 backdrop-blur-sm z-10 md:relative md:bg-transparent md:backdrop-blur-none -mx-6 px-6 py-4 md:py-0 md:mx-0 md:mb-0 mb-4">
                    {/* Navigation */}
                    <button
                        onClick={onBack}
                        className="mb-0 md:mb-12 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {backLabel}
                    </button>
                </div>

                {/* Header */}
                <header className="mb-16 border-b border-border pb-12 md:pb-12 pb-8">
                    <div className="flex flex-wrap gap-2 mb-6">
                        {content.tags?.map((tag: string) => (
                            <span key={tag} className="text-xs uppercase tracking-widest px-2 py-1 border border-border text-muted-foreground">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-semibold text-foreground mb-6 tracking-tight leading-tight">
                        {content.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono w-full">
                        <span>
                            Last Updated: {content.date ? formatDateDDMMYYYY(content.date) : 'Unknown'}
                        </span>
                        {formatReadingTime(content.readingTime) && (
                            <span className="ml-auto text-right whitespace-nowrap">{formatReadingTime(content.readingTime)}</span>
                        )}
                    </div>
                </header>

                {/* Content Body */}
                {content.htmlContent ? (
                    // ── Markdown-sourced content ──────────────────────
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-12">
                        <article
                            className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-muted-foreground prose-p:leading-relaxed prose-code:text-sm"
                            dangerouslySetInnerHTML={{ __html: content.htmlContent }}
                        />

                        {/* Sidebar */}
                        <aside className="hidden lg:block space-y-8">
                            <div className="sticky top-24">
                                {content.equations?.length > 0 && (
                                    <>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Key Equations</h3>
                                        <div className="space-y-3 mb-8">
                                            {content.equations.map((eq: string, i: number) => (
                                                <LaTeXBlock key={i} equation={eq} />
                                            ))}
                                        </div>
                                    </>
                                )}

                                <div className="h-px bg-border my-8" />

                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Metadata</h3>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <span className="block text-muted-foreground mb-1">Status</span>
                                        <span className="text-foreground">Active Research</span>
                                    </div>
                                    {content.tags?.length > 0 && (
                                        <div>
                                            <span className="block text-muted-foreground mb-1">Tags</span>
                                            <div className="flex flex-wrap gap-1">
                                                {content.tags.map((t: string) => (
                                                    <span key={t} className="text-xs px-1.5 py-0.5 border border-border text-muted-foreground">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </aside>
                    </div>
                ) : (
                    // ── Legacy hardcoded content layout ───────────────
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-12">

                        {/* Main Text */}
                        <article className="space-y-12 text-muted-foreground leading-relaxed font-light text-lg">
                            <section>
                                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">01. Abstract</h2>
                                <p>{content.abstract}</p>
                                <p className="mt-4">
                                    This document outlines the theoretical underpinnings and practical implementation strategies for {content.title}.
                                    The focus is placed on system resilience and information theoretic bounds.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">02. Mathematical Model</h2>
                                <p className="mb-6">
                                    The core dynamics of the system are governed by the following relations.
                                    We assume a closed system with boundary conditions defined by the operational parameters.
                                </p>
                                <div className="space-y-6">
                                    {content.equations?.map((eq: string, i: number) => (
                                        <LaTeXBlock key={i} equation={eq} />
                                    ))}
                                </div>
                                <p>
                                    Where the operators represent the standard transformations in the respective Hilbert space.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">03. Implementation</h2>
                                <p className="mb-4">
                                    The proposed architecture utilizes a distributed consensus mechanism to ensure data integrity.
                                    Below is a pseudocode representation of the core loop.
                                </p>
                                <CodeBlock
                                    language="python"
                                    code={`function process_signal(input_vector):
    # Initialize state
    state = initialize_basis()
    
    for sample in input_vector:
        noise = estimate_noise(sample)
        filtered = sample - noise
        state = update_kalman(state, filtered)
    
    return state.optimal_estimate`}
                                />
                            </section>

                            <section>
                                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">04. Results & Extensions</h2>
                                <p>
                                    Preliminary simulations indicate a 15% improvement in signal-to-noise ratio compared to classical methods.
                                    Future work will extend this framework to higher-dimensional manifolds and explore the implications for quantum-classical hybrid systems.
                                </p>
                            </section>
                        </article>

                        {/* Sidebar / Table of Contents / Metadata */}
                        <aside className="hidden lg:block space-y-8">
                            <div className="sticky top-24">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Metadata</h3>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <span className="block text-muted-foreground mb-1">Status</span>
                                        <span className="text-foreground">Active Research</span>
                                    </div>
                                    <div>
                                        <span className="block text-muted-foreground mb-1">PI</span>
                                        <span className="text-foreground">S. Rezk</span>
                                    </div>
                                    <div>
                                        <span className="block text-muted-foreground mb-1">License</span>
                                        <span className="text-foreground">MIT / Apache 2.0</span>
                                    </div>
                                </div>

                                <div className="h-px bg-border my-8" />

                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">References</h3>
                                <ul className="space-y-2 text-xs text-muted-foreground">
                                    <li>[1] Shannon, C. E. (1948). A Mathematical Theory of Communication.</li>
                                    <li>[2] Feynman, R. P. (1982). Simulating Physics with Computers.</li>
                                </ul>
                            </div>
                        </aside>

                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default DocumentView;
