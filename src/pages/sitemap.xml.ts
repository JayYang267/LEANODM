import type { APIRoute } from 'astro';
import { activities } from '../data/activities';
import { SITE } from '../config/site';
import { PUBLIC_PAGE_PATHS } from '../config/seo';

// Astro source pages only: configured redirect aliases never enter the sitemap.
export const GET: APIRoute = () => {
  const origin = SITE.url;
  const routes = PUBLIC_PAGE_PATHS;
  const activityRoutes = activities.map(activity => `/about/activities/${activity.slug}/`);
  // No lastmod: archive event dates and build times are not page revision dates.
  const urls = [...new Set([...routes, ...activityRoutes])].sort().map(route => `<url><loc>${new URL(route, origin).href}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
