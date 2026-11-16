import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const documents = () => walk(dist).filter(file => file.endsWith('.html')).map(file => ({file, html:fs.readFileSync(file, 'utf8')}));

test('historical activity dates are not presented as unverified page publication dates', () => {
  for (const {file, html} of documents().filter(item => item.file.includes(`${path.sep}activities${path.sep}`))) {
    for (const block of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
      const data = JSON.parse(block[1]);
      for (const item of data['@graph'] || [data]) {
        if (item['@type'] === 'Article') assert.ok(!Object.hasOwn(item, 'datePublished'), file);
      }
    }
  }
});

test('canonical origin validation rejects preview and inconsistent domain configuration', async () => {
  const configFile = path.join(root, 'src/config/seo.ts');
  assert.ok(fs.existsSync(configFile), 'A shared canonical origin validator is required');
  const { resolveCanonicalOrigin, CANONICAL_SITE_ORIGIN } = await import('../src/config/seo.ts');
  assert.equal(CANONICAL_SITE_ORIGIN, 'https://www.leanodm.com');
  for (const value of ['', 'https://www.leanodm.com', 'https://www.leanodm.com/']) assert.equal(resolveCanonicalOrigin(value), CANONICAL_SITE_ORIGIN);
  for (const value of ['http://localhost:4321', 'https://project.vercel.app', 'http://www.leanodm.com', 'https://leanodm.com', 'https://www.leanodm.com/path', 'https://www.leanodm.com/?preview=1', 'https://user:password@www.leanodm.com']) assert.throws(() => resolveCanonicalOrigin(value), /PUBLIC_SITE_URL/);
});

test('activity articles connect to visible breadcrumb hierarchy and the website entity', () => {
  for (const {file, html} of documents().filter(item => item.file.includes(`${path.sep}activities${path.sep}`) && !item.file.endsWith(`${path.sep}activities${path.sep}index.html`))) {
    const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(block => { const data=JSON.parse(block[1]); return data['@graph'] || [data]; });
    const article = blocks.find(item => item['@type'] === 'Article');
    const breadcrumbs = blocks.find(item => item['@type'] === 'BreadcrumbList');
    assert.ok(article && breadcrumbs, file);
    assert.equal(article.isPartOf['@id'], 'https://www.leanodm.com/#website');
    assert.equal(breadcrumbs.itemListElement.at(-1).item, article.url);
    assert.ok(html.includes('href="/about/"'), file);
  }
});

test('sitemap includes exactly canonical indexable built documents with no fabricated lastmod', () => {
  const expected = documents().flatMap(({html}) => /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html) ? [] : [...html.matchAll(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/g)].map(match => match[1])).sort();
  const xml = fs.readFileSync(path.join(dist,'sitemap.xml'), 'utf8');
  assert.deepEqual([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]).sort(),expected);
  assert.equal(new Set(expected).size, expected.length);
  assert.ok(!xml.includes('<lastmod>'));
});
