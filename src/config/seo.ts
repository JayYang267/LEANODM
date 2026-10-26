// The confirmed primary origin. Domain migrations must update this deliberately.
export const CANONICAL_SITE_ORIGIN = 'https://www.leanodm.com';

/** Keep preview/environment URLs out of public metadata, entities and sitemaps. */
export function resolveCanonicalOrigin(configured = ''): string {
  if (!configured.trim()) return CANONICAL_SITE_ORIGIN;
  let candidate: URL;
  try { candidate = new URL(configured.trim()); }
  catch { throw new Error('PUBLIC_SITE_URL must be the confirmed HTTPS origin: ' + CANONICAL_SITE_ORIGIN); }
  if (candidate.origin !== CANONICAL_SITE_ORIGIN || candidate.pathname !== '/' ||
      candidate.search || candidate.hash || candidate.username || candidate.password) {
    throw new Error('PUBLIC_SITE_URL must be the confirmed HTTPS origin: ' + CANONICAL_SITE_ORIGIN + '. Change src/config/seo.ts deliberately for a verified domain migration.');
  }
  return CANONICAL_SITE_ORIGIN;
}

// Explicitly published source routes; planned routes and future utility pages do
// not become index candidates merely because an .astro file was added.
export const PUBLIC_PAGE_PATHS = [
  '/', '/rfq/', '/about/', '/about/activities/', '/about/ethical-manufacturing/',
  '/customization/ip-protection/', '/customization/ip-protection/confidentiality/',
  '/customization/ip-protection/design-ownership/', '/customization/ip-protection/samples-tooling/',
  '/customization/ip-protection/nda-project-start/', '/manufacturing/secure-programming/',
  '/customization/existing-products/', '/customization/product-adaptation/',
  '/customization/new-product-development/', '/customization/oem-manufacturing/',
  '/customization/how-we-work/', '/customization/project-fit/',
  '/manufacturing/', '/manufacturing/electronics-smt/',
  '/manufacturing/tooling-injection-molding/', '/manufacturing/screen-printing/',
  '/manufacturing/assembly-packaging/', '/capabilities/production-equipment/', '/quality/',
  '/quality/quality-control-process/', '/quality/appearance-inspection/',
  '/quality/incoming-inspection/', '/quality/product-testing/',
  '/quality/inspector-training/', '/quality/traceability/',
  '/products/plastic-electronic-toys/original-product-concepts/say-island-picture-guessing-game-concept/',
] as const;
