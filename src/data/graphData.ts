import type { GraphData, NodeObject, LinkObject } from 'react-force-graph-2d';
import { markdownNodes, markdownNodeContent, markdownLinks } from 'virtual:graph-content';

export interface MyNode extends NodeObject {
  id: string;
  group: 'root' | 'focus' | 'project' | 'concept' | 'essay' | 'idea';
  title?: string; // Display name
  description?: string;
  tags?: string[];
  level: number;
  val?: number; // Size
  img?: string; // Image URL
  date?: string; // Date added/updated (ISO format)
  readingTime?: number;
}

export interface MyLink extends LinkObject {
  source: string | MyNode;
  target: string | MyNode;
}

// ── Base nodes ──────────────────────────────────────────────────────
// All nodes are now defined in src/content/*.md files
const baseNodes: MyNode[] = [];

const baseLinks: MyLink[] = [];

// ── Merge base data with markdown-generated data ──────────────────────
const markdownNodeIds = new Set(markdownNodes.map(n => n.id));

export const graphData: { nodes: MyNode[]; links: MyLink[] } = {
  nodes: [
    ...baseNodes.filter(n => !markdownNodeIds.has(n.id)),
    ...markdownNodes as MyNode[],
  ],
  links: [
    ...baseLinks,
    ...markdownLinks as MyLink[],
  ],
};

// ── Base node content ──────────────────────────────────────────────
// All content is now defined in src/content/*.md files
const baseNodeContent: Record<string, any> = {
  // Default fallback for nodes without content
  'default': {
    title: 'Node Details',
    abstract: 'Detailed technical breakdown of this concept is currently being archived from physical lab notes. Please refer to the related project section for implementation details.',
    equations: ['E = mc^2'],
    tags: ['Pending', 'Archive'],
    projects: [],
    concepts: []
  }
};

// Markdown content takes precedence over base content
export const nodeContent: Record<string, any> = {
  ...baseNodeContent,
  ...markdownNodeContent,
};
