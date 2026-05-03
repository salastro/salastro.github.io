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
const JSON_FEED_PATH = 'feed.json';
const DEFAULT_SITE_URL = process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://example.com';
const FEED_TITLE = 'SalahDin Rezk Blog';
const FEED_DESCRIPTION = 'Essays and technical writing from SalahDin Rezk.';
const PAGE_SIZE = 10;

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
        tags: string[];
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
    const posts: Array<{ id: string; title: string; date: string | null; description: string; tags: string[] }> = [];

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
                tags: frontmatter.tags || [],
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
                    tags: n.tags || [],
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

function buildRssXml(posts: ParsedContent['posts'], pageHref: string, nextHref?: string): string {
    const siteUrl = normalizeSiteUrl(DEFAULT_SITE_URL);
    const now = new Date().toUTCString();

    const items = posts.map((post) => {
        const link = `${siteUrl}/#${encodeURIComponent(post.id)}`;
        const categories = (post.tags || []).map((t) => `      <category>${escapeXml(t)}</category>`).join('\n');
        return [
            '    <item>',
            `      <title>${escapeXml(post.title)}</title>`,
            `      <link>${escapeXml(link)}</link>`,
            `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
            `      <pubDate>${toRfc822Date(post.date)}</pubDate>`,
            categories ? categories : '',
            `      <description>${escapeXml(post.description)}</description>`,
            '    </item>',
        ].filter(Boolean).join('\n');
    });

    // rss includes atom namespace for atom:link elements
    const nextAtom = nextHref ? `    <atom:link rel="next" href="${escapeXml(nextHref)}" type="application/rss+xml"/>` : '';

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        '  <channel>',
        `    <title>${escapeXml(FEED_TITLE)}</title>`,
        `    <link>${escapeXml(siteUrl)}</link>`,
        `    <description>${escapeXml(FEED_DESCRIPTION)}</description>`,
        `    <lastBuildDate>${now}</lastBuildDate>`,
        `    <atom:link href="${escapeXml(pageHref)}" rel="self" type="application/rss+xml"/>`,
        nextAtom,
        ...items,
        '  </channel>',
        '</rss>',
        '',
    ].join('\n');
}

function buildJsonFeed(posts: ParsedContent['posts'], pageHref: string, nextHref?: string) {
    const siteUrl = normalizeSiteUrl(DEFAULT_SITE_URL);
    const items = posts.map((post) => {
        const link = `${siteUrl}/#${encodeURIComponent(post.id)}`;
        return {
            id: link,
            url: link,
            title: post.title,
            content_text: post.description,
            date_published: post.date || undefined,
            tags: post.tags && post.tags.length ? post.tags : undefined,
        };
    });

    const feed: any = {
        version: 'https://jsonfeed.org/version/1',
        title: FEED_TITLE,
        home_page_url: siteUrl,
        feed_url: pageHref,
        description: FEED_DESCRIPTION,
        items,
    };
    if (nextHref) feed.next_url = nextHref;
    return JSON.stringify(feed, null, 2);
}

export default function markdownGraph(): Plugin {
    const contentDir = path.resolve(__dirname, '../content');
    const siteUrl = normalizeSiteUrl(DEFAULT_SITE_URL);

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

            // Emit main feeds (all posts)
            const pageCount = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
            for (let p = 1; p <= pageCount; p++) {
                const start = (p - 1) * PAGE_SIZE;
                const pagePosts = posts.slice(start, start + PAGE_SIZE);
                const xmlFileName = p === 1 ? RSS_FEED_PATH : `feed-page-${p}.xml`;
                const jsonFileName = p === 1 ? JSON_FEED_PATH : `feed-page-${p}.json`;
                const pageHref = `${siteUrl}/${xmlFileName}`;
                const pageJsonHref = `${siteUrl}/${jsonFileName}`;
                const nextXml = p < pageCount ? `${siteUrl}/${p + 1 === 1 ? RSS_FEED_PATH : `feed-page-${p + 1}.xml`}` : undefined;
                const nextJson = p < pageCount ? `${siteUrl}/${p + 1 === 1 ? JSON_FEED_PATH : `feed-page-${p + 1}.json`}` : undefined;

                const rssXml = buildRssXml(pagePosts, pageHref, nextXml);
                this.emitFile({
                    type: 'asset',
                    fileName: xmlFileName,
                    source: rssXml,
                });

                const jsonFeed = buildJsonFeed(pagePosts, pageJsonHref, nextJson);
                this.emitFile({
                    type: 'asset',
                    fileName: jsonFileName,
                    source: jsonFeed,
                });
            }

            // Emit tag-specific feeds
            const allTags = new Set<string>();
            for (const post of posts) {
                for (const tag of post.tags || []) {
                    allTags.add(tag);
                }
            }

            for (const tag of allTags) {
                const taggedPosts = posts.filter((p) => (p.tags || []).includes(tag));
                const tagPageCount = Math.max(1, Math.ceil(taggedPosts.length / PAGE_SIZE));
                const tagSafeFileName = tag.replace(/\s+/g, '-').toLowerCase();

                for (let p = 1; p <= tagPageCount; p++) {
                    const start = (p - 1) * PAGE_SIZE;
                    const pagePosts = taggedPosts.slice(start, start + PAGE_SIZE);
                    const xmlFileName = p === 1 ? `feed-${tagSafeFileName}.xml` : `feed-${tagSafeFileName}-page-${p}.xml`;
                    const jsonFileName = p === 1 ? `feed-${tagSafeFileName}.json` : `feed-${tagSafeFileName}-page-${p}.json`;
                    const pageHref = `${siteUrl}/${xmlFileName}`;
                    const pageJsonHref = `${siteUrl}/${jsonFileName}`;
                    const nextXml = p < tagPageCount ? `${siteUrl}/${p + 1 === 1 ? `feed-${tagSafeFileName}.xml` : `feed-${tagSafeFileName}-page-${p + 1}.xml`}` : undefined;
                    const nextJson = p < tagPageCount ? `${siteUrl}/${p + 1 === 1 ? `feed-${tagSafeFileName}.json` : `feed-${tagSafeFileName}-page-${p + 1}.json`}` : undefined;

                    const rssXml = buildRssXml(pagePosts, pageHref, nextXml);
                    this.emitFile({
                        type: 'asset',
                        fileName: xmlFileName,
                        source: rssXml,
                    });

                    const jsonFeed = buildJsonFeed(pagePosts, pageJsonHref, nextJson);
                    this.emitFile({
                        type: 'asset',
                        fileName: jsonFileName,
                        source: jsonFeed,
                    });
                }
            }
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
            // Serve RSS and JSON feeds in dev mode (main and tag-filtered feeds with pagination)
            server.middlewares.use(async (req, res, next) => {
                try {
                    if (!req.url) return next();
                    const url = req.url.split('?')[0].replace(/^\//, '');

                    // Match main feeds: /feed.xml, /feed-page-2.xml, /feed.json, /feed-page-2.json
                    const mainRssMatch = url.match(/^feed(?:-page-(\d+))?\.xml$/);
                    const mainJsonMatch = url.match(/^feed(?:-page-(\d+))?\.json$/);

                    // Match tag feeds: /feed-{tag}.xml, /feed-{tag}-page-2.xml, etc.
                    const tagFeedMatch = url.match(/^feed-(.+?)(?:-page-(\d+))?\.(?:xml|json)$/);

                    if (!(mainRssMatch || mainJsonMatch || tagFeedMatch) || !fs.existsSync(contentDir)) {
                        return next();
                    }

                    const { posts } = await parseMarkdownContent(contentDir);
                    const pageCount = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));

                    // Handle main feeds (all posts)
                    if (mainRssMatch) {
                        const pageIndex = mainRssMatch[1] ? parseInt(mainRssMatch[1], 10) : 1;
                        if (pageIndex >= 1 && pageIndex <= pageCount) {
                            const start = (pageIndex - 1) * PAGE_SIZE;
                            const pagePosts = posts.slice(start, start + PAGE_SIZE);
                            const xmlFileName = pageIndex === 1 ? RSS_FEED_PATH : `feed-page-${pageIndex}.xml`;
                            const pageHref = `${siteUrl}/${xmlFileName}`;
                            const nextXml =
                                pageIndex < pageCount ? `${siteUrl}/${pageIndex + 1 === 1 ? RSS_FEED_PATH : `feed-page-${pageIndex + 1}.xml`}` : undefined;
                            const xml = buildRssXml(pagePosts, pageHref, nextXml);
                            res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
                            res.end(xml);
                            return;
                        }
                    }

                    if (mainJsonMatch) {
                        const pageIndex = mainJsonMatch[1] ? parseInt(mainJsonMatch[1], 10) : 1;
                        if (pageIndex >= 1 && pageIndex <= pageCount) {
                            const start = (pageIndex - 1) * PAGE_SIZE;
                            const pagePosts = posts.slice(start, start + PAGE_SIZE);
                            const jsonFileName = pageIndex === 1 ? JSON_FEED_PATH : `feed-page-${pageIndex}.json`;
                            const pageHref = `${siteUrl}/${jsonFileName}`;
                            const nextJson =
                                pageIndex < pageCount ? `${siteUrl}/${pageIndex + 1 === 1 ? JSON_FEED_PATH : `feed-page-${pageIndex + 1}.json`}` : undefined;
                            const json = buildJsonFeed(pagePosts, pageHref, nextJson);
                            res.setHeader('Content-Type', 'application/json; charset=utf-8');
                            res.end(json);
                            return;
                        }
                    }

                    // Handle tag feeds
                    if (tagFeedMatch) {
                        const tagSafeFileName = tagFeedMatch[1];
                        const pageIndex = tagFeedMatch[2] ? parseInt(tagFeedMatch[2], 10) : 1;
                        const isXml = url.endsWith('.xml');

                        // Find the original tag by matching safe filename (case-insensitive)
                        let originalTag: string | null = null;
                        for (const post of posts) {
                            for (const tag of post.tags || []) {
                                if (tag.replace(/\s+/g, '-').toLowerCase() === tagSafeFileName) {
                                    originalTag = tag;
                                    break;
                                }
                            }
                            if (originalTag) break;
                        }

                        if (originalTag) {
                            const taggedPosts = posts.filter((p) => (p.tags || []).includes(originalTag));
                            const tagPageCount = Math.max(1, Math.ceil(taggedPosts.length / PAGE_SIZE));

                            if (pageIndex >= 1 && pageIndex <= tagPageCount) {
                                const start = (pageIndex - 1) * PAGE_SIZE;
                                const pagePosts = taggedPosts.slice(start, start + PAGE_SIZE);

                                if (isXml) {
                                    const xmlFileName = pageIndex === 1 ? `feed-${tagSafeFileName}.xml` : `feed-${tagSafeFileName}-page-${pageIndex}.xml`;
                                    const pageHref = `${siteUrl}/${xmlFileName}`;
                                    const nextXml =
                                        pageIndex < tagPageCount
                                            ? `${siteUrl}/${pageIndex + 1 === 1 ? `feed-${tagSafeFileName}.xml` : `feed-${tagSafeFileName}-page-${pageIndex + 1}.xml`}`
                                            : undefined;
                                    const xml = buildRssXml(pagePosts, pageHref, nextXml);
                                    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
                                    res.end(xml);
                                } else {
                                    const jsonFileName = pageIndex === 1 ? `feed-${tagSafeFileName}.json` : `feed-${tagSafeFileName}-page-${pageIndex}.json`;
                                    const pageHref = `${siteUrl}/${jsonFileName}`;
                                    const nextJson =
                                        pageIndex < tagPageCount
                                            ? `${siteUrl}/${pageIndex + 1 === 1 ? `feed-${tagSafeFileName}.json` : `feed-${tagSafeFileName}-page-${pageIndex + 1}.json`}`
                                            : undefined;
                                    const json = buildJsonFeed(pagePosts, pageHref, nextJson);
                                    res.setHeader('Content-Type', 'application/json; charset=utf-8');
                                    res.end(json);
                                }
                                return;
                            }
                        }
                    }
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error('[markdown-graph] feed dev middleware error', err);
                }
                return next();
            });
        },
    };
}
