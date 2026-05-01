import type { GraphData, NodeObject, LinkObject } from 'react-force-graph-2d';
import rootImg from '../assets/072d2fe6dcba0b4485129f2618be5d85ed8f7655.png';
import { markdownNodes, markdownNodeContent, markdownLinks } from 'virtual:graph-content';

export interface MyNode extends NodeObject {
  id: string;
  group: 'root' | 'focus' | 'project' | 'concept' | 'idea';
  title?: string; // Display name
  description?: string;
  tags?: string[];
  level: number;
  val?: number; // Size
  img?: string; // Image URL
  date?: string; // Date added/updated (ISO format)
}

export interface MyLink extends LinkObject {
  source: string | MyNode;
  target: string | MyNode;
}

// ── Base nodes (minimal - only root) ──────────────────────────────────
// All other nodes are defined in src/content/*.md files
const baseNodes: MyNode[] = [
  { id: 'root', title: 'SalahDin Rezk', group: 'root', level: 0, val: 20, img: rootImg, date: '2024-01-01' },
];

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

// ── Base node content (minimal - only root) ──────────────────────────
// All other content is defined in src/content/*.md files
const baseNodeContent: Record<string, any> = {
  'root': {
    title: 'SalahDin Rezk',
    abstract: 'Researcher focused on the intersection of information theory, physical systems, and computational modeling. My work explores how fundamental physical limits constrain and enable new forms of communication and computation.',
    equations: [
      'I(X;Y) = H(Y) - H(Y|X)',
      '\\frac{d}{dt} \\mathbf{x}(t) = \\mathbf{f}(\\mathbf{x}(t), \\mathbf{u}(t))'
    ],
    tags: ['Researcher', 'Engineer', 'Physicist'],
    projects: ['proj-satellite', 'proj-qkey'],
    concepts: ['signal-processing', 'systems-modeling']
  },
  // Default fallback for others
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
