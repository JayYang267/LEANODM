import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import { defineConfig } from 'astro/config';
import siteConfig from './astro.config.mjs';

const catalogPath = '/case-studies';
const caseSlug = 'interactive-driving-sound-book';
const casePath = `${catalogPath}/${caseSlug}`;
const legacyCasePath = `/projects/${caseSlug}`;
const mediaRoute = `${casePath}/media/`;
const legacyMediaRoute = `${legacyCasePath}/media/`;
const mediaFiles = new Map([
  ['case.mp4', { file: 'driving-activity-book.mp4', type: 'video/mp4' }],
  ['poster.webp', { file: 'driving-activity-book-poster.webp', type: 'image/webp' }],
  ['captions.en.vtt', { file: 'driving-activity-book-en.vtt', type: 'text/vtt; charset=utf-8' }],
  ['finished-product.webp', { file: 'finished-product.webp', type: 'image/webp' }],
]);

function mediaRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2])) return null;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  return Number.isSafeInteger(start) && start <= end && end < size ? { start, end } : null;
}

function caseMedia(directory) {
  return {
    name: 'leanodm-private-case-media',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const localSocket = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(request.socket.remoteAddress);
        const localHost = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(request.headers.host ?? '');
        if (!localSocket || !localHost) return response.writeHead(404).end();

        const pathname = request.url?.split('?')[0] ?? '';
        const mediaPrefix = [mediaRoute, legacyMediaRoute].find(prefix => pathname.startsWith(prefix));
        const isCatalog = pathname === catalogPath || pathname.startsWith(`${catalogPath}/`);
        const isLegacyCase = pathname === legacyCasePath || pathname === `${legacyCasePath}/`;
        if (isCatalog || isLegacyCase || mediaPrefix) {
          response.setHeader('Cache-Control', 'no-store');
          response.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
        }
        if (!mediaPrefix) return next();

        const media = mediaFiles.get(pathname.slice(mediaPrefix.length));
        if (!media) return response.writeHead(404).end();
        if (request.method !== 'GET' && request.method !== 'HEAD') {
          return response.writeHead(405, { Allow: 'GET, HEAD' }).end();
        }

        const file = join(directory, media.file);
        const info = await stat(file).catch(() => null);
        const resolved = info?.isFile() ? await realpath(file).catch(() => null) : null;
        if (!resolved || resolved !== file || !info?.size) return response.writeHead(404).end();

        const range = request.headers.range ? mediaRange(request.headers.range, info.size) : null;
        if (request.headers.range && !range) {
          return response.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end();
        }

        response.setHeader('Content-Type', media.type);
        response.setHeader('X-Content-Type-Options', 'nosniff');
        response.setHeader('Accept-Ranges', 'bytes');
        response.setHeader('Content-Length', range ? range.end - range.start + 1 : info.size);
        if (range) response.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${info.size}`);
        response.statusCode = range ? 206 : 200;
        if (request.method === 'HEAD') return response.end();

        const stream = createReadStream(resolved, range ?? undefined);
        response.on('close', () => stream.destroy());
        stream.on('error', () => response.destroy());
        stream.pipe(response);
      });
    },
  };
}

const review = {
  name: 'leanodm-local-case-preview',
  hooks: {
    async 'astro:config:setup'({ command, updateConfig }) {
      if (command !== 'dev') throw new Error('Use this configuration with Astro dev on localhost.');
      const input = process.env.LEANODM_CASE_PREVIEW_DIR;
      if (!input || !isAbsolute(input)) throw new Error('Set LEANODM_CASE_PREVIEW_DIR to the absolute private edit directory.');
      const directory = await realpath(input);
      if (!(await stat(directory)).isDirectory()) throw new Error('The private edit path must be a directory.');

      updateConfig({
        // A production alias can be added when this previously local case is published.
        redirects: { [`${legacyCasePath}/`]: { destination: `${casePath}/`, status: 301 } },
        vite: {
          define: { 'import.meta.env.LEANODM_LOCAL_CASE_PREVIEW': 'true' },
          plugins: [caseMedia(directory)],
        },
      });
    },
  },
};

export default defineConfig({
  ...siteConfig,
  server: { ...siteConfig.server, host: '127.0.0.1', port: 4362 },
  devToolbar: { enabled: false },
  integrations: [...(siteConfig.integrations ?? []), review],
});
