// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import icon from 'astro-iconset';
import tailwindcss from '@tailwindcss/vite';
import { CANONICAL_SITE_ORIGIN } from './src/config/seo.ts';

// https://astro.build/config
export default defineConfig({
  site: CANONICAL_SITE_ORIGIN,
  trailingSlash: 'always',
  integrations: [react(), icon()],
  vite: {
    plugins: [tailwindcss()]
  }
});
