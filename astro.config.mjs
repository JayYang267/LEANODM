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
  redirects: {
    '/customization/': { destination: '/customization/how-we-work/', status: 301 },
    '/about/ip-protection/': { destination: '/customization/ip-protection/', status: 301 },
    '/about/ip-protection/confidentiality/': { destination: '/customization/ip-protection/confidentiality/', status: 301 },
    '/about/ip-protection/design-ownership/': { destination: '/customization/ip-protection/design-ownership/', status: 301 },
    '/about/ip-protection/samples-tooling/': { destination: '/customization/ip-protection/samples-tooling/', status: 301 },
    '/about/ip-protection/nda-project-start/': { destination: '/customization/ip-protection/nda-project-start/', status: 301 },
  },
  integrations: [react(), icon()],
  vite: {
    plugins: [tailwindcss()]
  }
});
