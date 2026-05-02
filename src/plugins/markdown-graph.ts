import { Plugin } from 'vite';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { globSync } from 'glob';
import fs from 'fs';
import path from 'path';

const VIRTUAL_MODULE_ID = 'virtual:graph-content';
const RESOLVED_ID = '\0' + VIRTUAL_MODULE_ID;

const RSS_FEED_PATH = 'feed.xml';
const DEFAULT_SITE_URL = process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://example.com';
const FEED_TITLE = 'SalahDin Rezk Blog';
const FEED_DESCRIPTION = 'Essays and technical writing from SalahDin Rezk.';

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

interface ParsedContent {
    nodes: any[];
    nodeContentMap: Record<string, any>;
    links: any[];
    posts: Array<{
        id: string;
        title: string;
        date: string | null;
        description: string;
    }>;
}

function normalizeSiteUrl(url: string): string {
    return url.endsWith('/') ? url.slice(0, -1) : url;
}

function escapeXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function toRfc822Date(value: string | null): string {
    if (!value) return new Date(0).toUTCString();
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return new Date(0).toUTCString();
    return date.toUTCString();
}

async function parseMarkdownContent(contentDir: string): Promise<ParsedContent> {
    const files = globSync('**/*.md', { cwd: contentDir });

    const nodes: any[] = [];
    const nodeContentMap: Record<string, any> = {};
    const links: any[] = [];
    const posts: Array<{ id: string; title: string; date: string | null; description: string }> = [];

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
        const firstParagraph = content.trim().split('\n\n')[0]?.replace(/[#*_`]/g, '').trim() || '';
        const description = frontmatter.description || firstParagraph;

        nodes.push({
            id: frontmatter.id,
            title: frontmatter.title || frontmatter.id,
            group: frontmatter.group || 'concept',
            level: frontmatter.level ?? 2,
            val: frontmatter.val ?? 5,
            date: frontmatter.date,
            img: frontmatter.img,
            description,
            tags: frontmatter.tags,
        });

        nodeContentMap[frontmatter.id] = {
            title: frontmatter.title || frontmatter.id,
            abstract: description,
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

        if ((frontmatter.group || '').toLowerCase() === 'essay') {
            posts.push({
                id: frontmatter.id,
                title: frontmatter.title || frontmatter.id,
                date: frontmatter.date || null,
                description,
            });
        }
    }

    // Fallback: if no essay group exists, use dated non-root entries as feed items
    if (posts.length === 0) {
        for (const n of nodes) {
            if (n.group !== 'root' && n.date) {
                posts.push({
                    id: n.id,
                    title: n.title || n.id,
                    date: n.date || null,
                    description: n.description || '',
                });
            }
        }
    }

    posts.sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
    });

    return { nodes, nodeContentMap, links, posts };
}

function buildRssXml(posts: ParsedContent['posts']): string {
    const siteUrl = normalizeSiteUrl(DEFAULT_SITE_URL);
    const now = new Date().toUTCString();

    const items = posts.map((post) => {
        const link = `${siteUrl}/#${encodeURIComponent(post.id)}`;
        return [
            '    <item>',
            `      <title>${escapeXml(post.title)}</title>`,
            `      <link>${escapeXml(link)}</link>`,
            `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
            `      <pubDate>${toRfc822Date(post.date)}</pubDate>`,
            `      <description>${escapeXml(post.description)}</description>`,
            '    </item>',
        ].join('\n');
    });

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0">',
        '  <channel>',
        `    <title>${escapeXml(FEED_TITLE)}</title>`,
        `    <link>${escapeXml(siteUrl)}</link>`,
        `    <description>${escapeXml(FEED_DESCRIPTION)}</description>`,
        `    <lastBuildDate>${now}</lastBuildDate>`,
        `    <atom:link href="${escapeXml(`${siteUrl}/${RSS_FEED_PATH}`)}" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom"/>`,
        ...items,
        '  </channel>',
        '</rss>',
        '',
    ].join('\n');
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

            const { nodes, nodeContentMap, links } = await parseMarkdownContent(contentDir);

            return `
        export const markdownNodes = ${JSON.stringify(nodes)};
        export const markdownNodeContent = ${JSON.stringify(nodeContentMap)};
        export const markdownLinks = ${JSON.stringify(links)};
      `;
        },

        async generateBundle() {
            if (!fs.existsSync(contentDir)) return;
            const { posts } = await parseMarkdownContent(contentDir);
            const rssXml = buildRssXml(posts);
            this.emitFile({
                type: 'asset',
                fileName: RSS_FEED_PATH,
                source: rssXml,
            });
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

        configureServer(server) {
            // Serve RSS feed in dev mode at /feed.xml
            server.middlewares.use(async (req, res, next) => {
                try {
                    if (!req.url) return next();
                    const url = req.url.split('?')[0];
                    if (url === `/${RSS_FEED_PATH}` || url === RSS_FEED_PATH) {
                        if (!fs.existsSync(contentDir)) {
                            res.statusCode = 404;
                            res.end('Not Found');
                            return;
                        }
                        const { posts } = await parseMarkdownContent(contentDir);
                        const xml = buildRssXml(posts);
                        res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
                        res.end(xml);
                        return;
                    }
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error('[markdown-graph] RSS dev middleware error', err);
                }
                return next();
            });
        },
    };
}
