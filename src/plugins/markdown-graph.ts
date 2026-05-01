import { Plugin } from 'vite';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { globSync } from 'glob';
import fs from 'fs';
import path from 'path';

const VIRTUAL_MODULE_ID = 'virtual:graph-content';
const RESOLVED_ID = '\0' + VIRTUAL_MODULE_ID;

interface MarkdownFrontmatter {
    id: string;
    title: string;
    group?: string;
    level?: number;
    val?: number;
    date?: string;
    img?: string;
    description?: string;
    tags?: string[];
    projects?: string[];
    concepts?: string[];
    equations?: string[];
    links?: string[];
}

export default function markdownGraph(): Plugin {
    const contentDir = path.resolve(__dirname, '../content');

    return {
        name: 'markdown-graph',

        resolveId(id) {
            if (id === VIRTUAL_MODULE_ID) return RESOLVED_ID;
        },

        async load(id) {
            if (id !== RESOLVED_ID) return;

            if (!fs.existsSync(contentDir)) {
                // Return empty data if no content directory exists yet
                return `
          export const markdownNodes = [];
          export const markdownNodeContent = {};
          export const markdownLinks = [];
        `;
            }

            const files = globSync('**/*.md', { cwd: contentDir });

            const nodes: any[] = [];
            const nodeContentMap: Record<string, any> = {};
            const links: any[] = [];

            for (const file of files) {
                const raw = fs.readFileSync(path.join(contentDir, file), 'utf-8');
                const { data, content } = matter(raw);
                const frontmatter = data as MarkdownFrontmatter;

                if (!frontmatter.id) {
                    console.warn(`[markdown-graph] Skipping ${file}: missing 'id' in frontmatter`);
                    continue;
                }

                const htmlContent = (await remark().use(html).process(content)).toString();

                // Extract first paragraph as description if not provided
                const firstParagraph = content.trim().split('\n\n')[0]?.replace(/[#*_`]/g, '').trim();

                nodes.push({
                    id: frontmatter.id,
                    title: frontmatter.title || frontmatter.id,
                    group: frontmatter.group || 'concept',
                    level: frontmatter.level ?? 2,
                    val: frontmatter.val ?? 5,
                    date: frontmatter.date,
                    img: frontmatter.img,
                    description: frontmatter.description || firstParagraph,
                    tags: frontmatter.tags,
                });

                nodeContentMap[frontmatter.id] = {
                    title: frontmatter.title || frontmatter.id,
                    abstract: frontmatter.description || firstParagraph,
                    date: frontmatter.date || null,
                    htmlContent,
                    equations: frontmatter.equations || [],
                    tags: frontmatter.tags || [],
                    projects: frontmatter.projects || [],
                    concepts: frontmatter.concepts || [],
                };

                // Generate links from frontmatter
                if (frontmatter.links) {
                    for (const target of frontmatter.links) {
                        links.push({ source: frontmatter.id, target });
                    }
                }
            }

            return `
        export const markdownNodes = ${JSON.stringify(nodes)};
        export const markdownNodeContent = ${JSON.stringify(nodeContentMap)};
        export const markdownLinks = ${JSON.stringify(links)};
      `;
        },

        handleHotUpdate({ file, server }) {
            if (file.endsWith('.md') && file.includes('content')) {
                const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
                if (mod) {
                    server.moduleGraph.invalidateModule(mod);
                    return [mod];
                }
            }
        },
    };
}
