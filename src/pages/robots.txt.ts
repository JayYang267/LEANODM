import type { APIRoute } from 'astro';
import { SITE } from '../config/site';

// Keep the existing wildcard access policy, including the owner's training
// crawler choice. robots.txt controls crawling, not confidentiality or noindex.
export const GET: APIRoute = () => new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', SITE.url).href}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
