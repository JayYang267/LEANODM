// @ts-check
import { readFile, rm } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import icon from 'astro-iconset';
import tailwindcss from '@tailwindcss/vite';
import { CANONICAL_SITE_ORIGIN } from './src/config/seo.ts';

/** @type {import('astro').AstroIntegration} */
const pagesVideoRedirects = {
  name: 'leanodm-pages-video-redirects',
  hooks: {
    async 'astro:build:done'({ dir }) {
      const [ignored, redirects] = await Promise.all([
        readFile(new URL('.assetsignore', dir), 'utf8'),
        readFile(new URL('_redirects', dir), 'utf8'),
      ]);
      const externalVideos = new Set(redirects.split(/\r?\n/).flatMap(line => {
        const [source, destination, status] = line.trim().split(/\s+/);
        return status === '302' && destination?.startsWith('https://') ? [source] : [];
      }));
      const paths = ignored.split(/\r?\n/).map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
      for (const path of paths) {
        if (!/^\/media\/[a-z0-9-]+\/[a-z0-9-]+\.mp4$/.test(path) || !externalVideos.has(path)) {
          throw new Error(`Pages video exclusion must have a matching external 302 redirect: ${path}`);
        }
      }
      await Promise.all(paths.map(path => rm(new URL('.' + path, dir), { force: true })));
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site: CANONICAL_SITE_ORIGIN,
  server: {
    host: '127.0.0.1',
    port: 4321,
    strictPort: true,
  },
  trailingSlash: 'always',
  redirects: {
    '/projects/': { destination: '/case-studies/', status: 301 },
    '/projects/interactive-driving-sound-book/': { destination: '/case-studies/interactive-driving-sound-book/', status: 301 },
    '/customization/': { destination: '/customization/how-we-work/', status: 301 },
    '/about/ip-protection/': { destination: '/customization/ip-protection/', status: 301 },
    '/about/ip-protection/confidentiality/': { destination: '/customization/ip-protection/confidentiality/', status: 301 },
    '/about/ip-protection/design-ownership/': { destination: '/customization/ip-protection/design-ownership/', status: 301 },
    '/about/ip-protection/samples-tooling/': { destination: '/customization/ip-protection/samples-tooling/', status: 301 },
    '/about/ip-protection/nda-project-start/': { destination: '/customization/ip-protection/nda-project-start/', status: 301 },
  },
  integrations: [react(), icon(), ...(process.env.CF_PAGES === '1' ? [pagesVideoRedirects] : [])],
  vite: {
    plugins: [tailwindcss()],
    server: {
      fs: {
        deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/.case-study-preview/**', '**/data-store.json'],
      },
    },
  }
});
