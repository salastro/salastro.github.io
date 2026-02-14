import React from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { useTheme } from 'next-themes';

interface CodeBlockProps {
    code: string;
    language?: string;
    className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
    code,
    language = 'python',
    className = '',
}) => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    return (
        <Highlight
            theme={isDark ? themes.nightOwl : themes.nightOwlLight}
            code={code.trim()}
            language={language}
        >
            {({ className: preClassName, style, tokens, getLineProps, getTokenProps }) => (
                <pre
                    className={`${preClassName} ${className} p-4 text-xs md:text-sm font-mono rounded-sm overflow-x-auto border border-border`}
                    style={{ ...style, margin: 0 }}
                >
                    {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })} className="table-row">
                            <span className="table-cell pr-4 text-muted-foreground/50 select-none text-right w-8">
                                {i + 1}
                            </span>
                            <span className="table-cell">
                                {line.map((token, key) => (
                                    <span key={key} {...getTokenProps({ token })} />
                                ))}
                            </span>
                        </div>
                    ))}
                </pre>
            )}
        </Highlight>
    );
};

export default CodeBlock;
