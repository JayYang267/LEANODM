import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Verify the built document, including what a crawler receives without JavaScript.
const root = resolve(import.meta.dirname, '..');
const dist = process.env.APPEARANCE_DIST || resolve(root, 'dist');
const file = resolve(dist, 'quality/appearance-inspection/index.html');
assert.ok(existsSync(file), 'The appearance inspection route must build to static HTML');
const html = readFileSync(file, 'utf8');
const preview = process.argv.includes('--preview');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
assert.equal(new Set(ids).size, ids.length, 'HTML ids must be unique');
const expected = ['insects-hair-bloodstains', 'drag-whitening', 'dirt-oil-fingerprints',
  'flash-sharp-points-burrs', 'surface-step-mismatch', 'weld-lines', 'sink-marks',
  'short-shots', 'gas-marks', 'gaps', 'scratches-impact-damage',
  'off-color-specks-color-contamination', 'deformation', 'ejector-pressure-whitening', 'printed-text-graphics'];
for (const id of expected) {
  assert.ok(ids.includes(id), `Missing defect: ${id}`);
  assert.ok(html.includes(`href="#${id}"`), `Missing navigable defect anchor: ${id}`);
}
for (const [, href] of html.matchAll(/\bhref="([^"]+)"/g)) {
  if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), `Broken anchor: ${href}`);
  if (href.startsWith('/') && !href.startsWith('//')) {
    const path = href.split(/[?#]/)[0];
    assert.ok(existsSync(resolve(dist, `.${path}`)), `Broken local link: ${href}`);
  }
}
const pictures = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
const evidence = pictures.filter((tag) => tag.includes('/images/quality/appearance-inspection/'));
assert.ok(evidence.length >= 35, 'All 35 photographic examples must be rendered');
for (const tag of pictures) {
  const src = tag.match(/\bsrc="([^"]+)"/)?.[1];
  assert.ok(tag.includes('alt='), `Missing alt attribute: ${src}`);
  if (tag.includes('/images/quality/appearance-inspection/')) {
    assert.ok((tag.match(/\balt="([^"]+)"/)?.[1]?.length ?? 0) > 20, 'Evidence requires descriptive alt text');
    assert.ok(/\bwidth="\d+"/.test(tag) && /\bheight="\d+"/.test(tag), 'Evidence needs intrinsic dimensions');
  }
  if (src?.startsWith('/')) assert.ok(existsSync(resolve(dist, `.${src.split(/[?#]/)[0]}`)), `Missing image: ${src}`);
}
assert.equal((html.match(/<h1\b/g) ?? []).length, 1, 'One page H1');
assert.match(html, /<title>Product Appearance Inspection Standard \| LEANODM<\/title>/);
assert.match(html, /<meta name="description" content="[^"]{50,}"/);
const canonical = html.match(/<link rel="canonical" href="(https:\/\/[^"/]+\/quality\/appearance-inspection\/)"/);
if (!preview) assert.ok(canonical, 'Production requires a confirmed PUBLIC_SITE_URL and canonical URL');
assert.ok(!/yourdomain|astroflow|warehousing|logistics|yourcompany|TODO|TBD/i.test(html), 'No template or placeholder content');
const scripts = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
if (!preview || canonical) assert.ok(scripts.length > 0, 'Structured data exists');
for (const script of scripts) JSON.parse(script[1]);
if (!preview || canonical) assert.ok(html.includes('BreadcrumbList') && html.includes('WebPage'), 'Visible page and breadcrumb schemas');
if (!preview) {
  const project = html.match(/<section id="project-requirements"[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.match(project, /href="(?:mailto:|https:\/\/|\/(?!#))[^\"]+"/, 'Production requires a real project/contact destination');
}
assert.ok(!html.includes('FAQPage'), 'No unnecessary FAQ rich-result markup');
assert.ok(!/<astro-island/.test(html), 'Technical page must not require hydrated components');
assert.ok((html.match(/<table\b/g) ?? []).length >= 15, 'Surface/severity and defect rules remain semantic tables');
assert.ok((html.match(/<caption\b/g) ?? []).length >= 15, 'Tables have accessible captions');
console.log('PASS: static route, 15 defect anchors, 35 source images, local links, semantic tables, title/description, and no template content.');
console.log(canonical ? 'PASS: canonical URL and WebPage/BreadcrumbList JSON-LD.' : 'PENDING: confirmed production domain; canonical and JSON-LD omitted from local preview.');
if (preview) console.log('PREVIEW verification only. Run without --preview to enforce production canonical and contact configuration.');
