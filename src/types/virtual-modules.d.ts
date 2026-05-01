declare module 'virtual:graph-content' {
    import type { MyNode, MyLink } from '../data/graphData';

    export const markdownNodes: MyNode[];
    export const markdownNodeContent: Record<string, {
        title: string;
        abstract: string;
        htmlContent: string;
        equations: string[];
        tags: string[];
        projects: string[];
        concepts: string[];
    }>;
    export const markdownLinks: MyLink[];
}
