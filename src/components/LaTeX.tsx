import React, { useEffect, useRef } from 'react';
import 'katex/dist/katex.min.css';

interface LaTeXProps {
    children: string;
    displayMode?: boolean;
    className?: string;
}

export const LaTeX: React.FC<LaTeXProps> = ({
    children,
    displayMode = true,
    className = ''
}) => {
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const { default: katex } = await import('katex');
            if (cancelled || !containerRef.current) return;
            try {
                katex.render(children, containerRef.current, {
                    displayMode,
                    throwOnError: false,
                    errorColor: '#f87171',
                    trust: true,
                });
            } catch (error) {
                console.error('KaTeX rendering error:', error);
                if (containerRef.current) {
                    containerRef.current.textContent = children;
                }
            }
        })();
        return () => { cancelled = true; };
    }, [children, displayMode]);

    return <span ref={containerRef} className={className} />;
};

interface LaTeXBlockProps {
    equation: string;
    className?: string;
}

export const LaTeXBlock: React.FC<LaTeXBlockProps> = ({
    equation,
    className = ''
}) => {
    return (
        <div className={`my-8 p-6 bg-secondary border-l-2 border-primary/50 overflow-x-auto text-center ${className}`}>
            <div className="inline-block">
                <LaTeX displayMode={true}>{equation}</LaTeX>
            </div>
        </div>
    );
};

export default LaTeX;
