import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const file = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});
const files = () => walk(dist);
const productUrl = /\/products(?:[\/?#"'<>\s]|$)/i;
const catalogAsset = /atm-style-toy|electronic-toy-guitar|rh-reference-/i;
const casesCanonical = 'https://www.leanodm.com/case-studies/';
const catalogAssetDirectories = ['images/products', 'media/concept-demos', 'media/sound-book'];
const retiredRoutes = [
  '/products', '/products/', '/products/?utm_source=removal-check',
  '/products/atm-style-toy/', '/products/toys-collectibles/',
  '/products/toys-collectibles/musical-toys/',
  '/products/toys-collectibles/musical-toys/electronic-toy-guitars/',
  '/products/references/childrens-ear-hook-wireless-headphones/',
  '/products/page/2/', '/products/plastic-electronic-products/',
  '/products/plastic-electronic-toys/learning-educational-intelligent-sound-toys/',
  '/products/plastic-electronic-toys/learning-educational-intelligent-sound-toys/interactive-sound-toys/baby-musical-light-up-drum/',
  '/products/plastic-electronic-toys/original-product-concepts/page/2/',
  '/products/plastic-electronic-toys/original-product-concepts/echo-trail/',
  '/products/plastic-electronic-toys/original-product-concepts/say-island-picture-guessing-game-concept/',
  '/products/custom-sound-book/', '/products/custom-sound-book/ten-button-sound-book/',
  '/products/not-a-real-product/nested/',
];

test('the build contains no product catalog pages or catalog image assets', () => {
  assert.ok(!fs.existsSync(path.join(dist, 'products')), 'The removed catalog is still being published');
  for (const file of files()) assert.ok(!catalogAsset.test(path.basename(file)), `Catalog image still published: ${file}`);
});

test('catalog-only public asset directories are absent from the build', () => {
  for (const directory of catalogAssetDirectories) {
    assert.ok(!fs.existsSync(path.join(dist, directory)), `Catalog media directory still published: ${directory}`);
  }
});

test('all published documents, metadata and bundles are detached from product catalog URLs', () => {
  for (const file of files().filter(file => /\.(?:html|xml|json|js|css|txt)$/i.test(file))) {
    const text = fs.readFileSync(file, 'utf8').replaceAll('\\/', '/');
    assert.ok(!productUrl.test(text), `Catalog URL still published in ${path.relative(dist, file)}`);
  }
});

test('home presents manufacturing and project services without the removed catalog showcase', () => {
  const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  for (const href of ['/manufacturing/', '/quality/', '/customization/new-product-development/', '/rfq/']) {
    assert.ok(html.includes(`href="${href}`), `Home lost the retained ${href} destination`);
  }
  assert.ok(!/ATM-style|product-stage|product-story|home-product-study|showcase examples|categories shown/i.test(html));
});

test('Case Studies replaces Projects as the canonical landing page', () => {
  const location = path.join(dist, 'case-studies', 'index.html');
  assert.ok(fs.existsSync(location), 'The build must contain /case-studies/');
  const html = fs.readFileSync(location, 'utf8');
  assert.match(html, /<h1\b[^>]*>\s*Case Studies\s*<\/h1>/);
  assert.ok(html.includes(`<link rel="canonical" href="${casesCanonical}">`), 'Case Studies must have the correct canonical URL');
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? '';
  assert.match(main, /<a\b[^>]*\bhref="\/rfq\/"/, 'Case Studies must link to the inquiry page');
  const xml = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
  assert.ok(xml.includes(`<loc>${casesCanonical}</loc>`), 'Case Studies must appear in the sitemap');
  assert.doesNotMatch(xml, /<loc>[^<]+\/projects\//);
  assert.match(fs.readFileSync(path.join(dist, '_redirects'), 'utf8'), /^\/projects\/ \/case-studies\/ 301$/m);
});

test('the previously published driving sound book case and its media remain available', () => {
  const slug = 'interactive-driving-sound-book';
  const route = `/case-studies/${slug}/`;
  const catalog = fs.readFileSync(path.join(dist, 'case-studies', 'index.html'), 'utf8');
  assert.ok(catalog.includes(`href="${route}"`), 'The published case must remain linked from Case Studies');
  const detail = fs.readFileSync(path.join(dist, 'case-studies', slug, 'index.html'), 'utf8');
  const xml = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
  const canonical = new URL(route, casesCanonical);
  assert.ok(detail.includes(`<link rel="canonical" href="${canonical}">`));
  assert.doesNotMatch(detail, /<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i);
  assert.ok(xml.includes(`<loc>${canonical}</loc>`));
  for (const name of ['finished-product.webp', 'driving-activity-book.mp4', 'driving-activity-book-poster.webp', 'driving-activity-book-en.vtt']) {
    const asset = `/media/cases/${slug}/${name}`;
    assert.ok(detail.includes(asset), `Published case lost ${asset}`);
    assert.ok(fs.existsSync(path.join(dist, asset)), `Build is missing ${asset}`);
  }
});

test('locally reviewed cases are excluded from the public build', () => {
  const source = path.join(root, '.case-study-preview');
  const localSlugs = (fs.existsSync(source) ? fs.readdirSync(source) : [])
    .filter(file => file.endsWith('.json')).map(file => path.basename(file, '.json'));
  const catalog = fs.readFileSync(path.join(dist, 'case-studies', 'index.html'), 'utf8');
  const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
  const redirects = fs.readFileSync(path.join(dist, '_redirects'), 'utf8');
  const storeFile = path.join(root, 'node_modules/.astro/data-store.json');
  const contentStore = fs.existsSync(storeFile) ? fs.readFileSync(storeFile, 'utf8') : '';
  for (const slug of localSlugs) {
    const route = `/case-studies/${slug}/`;
    const detailFile = path.join(dist, 'case-studies', slug, 'index.html');
    const hasPublishedVersion = fs.existsSync(path.join(root, 'src/content/case-studies', `${slug}.json`));
    assert.ok(!contentStore.includes(`"local/${slug}"`), `Ordinary Astro build ingested locally reviewed content: ${slug}`);
    if (hasPublishedVersion) {
      const detail = fs.readFileSync(detailFile, 'utf8');
      assert.ok(!detail.includes(`${route}media/`), `Published case uses private media: ${slug}`);
    } else {
      assert.ok(!fs.existsSync(detailFile));
      assert.ok(!catalog.includes(route));
      assert.ok(!sitemap.includes(route));
      assert.ok(!redirects.includes(route));
    }
  }
});

test('Case Studies occupies the former Projects slot once in each navigation menu', () => {
  const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const desktopStart = html.indexOf('aria-label="LEANODM global navigation"');
  const mobileStart = html.indexOf('aria-label="LEANODM mobile navigation"');
  const headerEnd = html.indexOf('</header>', mobileStart);
  assert.ok(desktopStart >= 0 && mobileStart > desktopStart && headerEnd > mobileStart, 'Both global navigation menus must render');
  for (const [name, menu] of [
    ['desktop', html.slice(desktopStart, mobileStart)],
    ['mobile', html.slice(mobileStart, headerEnd)],
  ]) {
    const odm = menu.search(/>ODM &amp; OEM(?:\s|<)/);
    const cases = [...menu.matchAll(/<a\b[^>]*\bhref="\/case-studies\/"[^>]*>\s*Case Studies\s*<\/a>/g)];
    const capabilities = menu.search(/>Capabilities(?:\s|<)/);
    assert.equal(cases.length, 1, `One Case Studies entry required in ${name} navigation`);
    assert.ok(odm >= 0 && cases[0].index > odm && capabilities > cases[0].index, `Case Studies must follow ODM & OEM and precede Capabilities in ${name} navigation`);
  }
});

const base = process.env.REMOVAL_BASE_URL;
test('retired product addresses return genuine 404 responses without redirects', { skip: !base }, async () => {
  for (const route of retiredRoutes) {
    const response = await fetch(new URL(route, base), { redirect: 'manual' });
    assert.equal(response.status, 404, `${route}: expected 404, received ${response.status}`);
    await response.arrayBuffer();
  }
});

test('every sitemap page remains available and contains no catalog URLs', { skip: !base }, async () => {
  const sitemap = await fetch(new URL('/sitemap.xml', base));
  assert.equal(sitemap.status, 200);
  const xml = await sitemap.text();
  assert.ok(!productUrl.test(xml));
  const routes = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname);
  assert.ok(routes.length > 20, 'The sitemap must retain the rest of the website');
  for (const route of routes) {
    const response = await fetch(new URL(route, base), { redirect: 'manual' });
    assert.equal(response.status, 200, `${route}: expected 200, received ${response.status}`);
    assert.ok(!productUrl.test(await response.text()), `Catalog URL still rendered on ${route}`);
  }
});
