import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const file = 'dist/quality/product-testing/index.html';
assert.ok(fs.existsSync(file), 'Product testing must have a static, built HTML route');
const html = fs.readFileSync(file, 'utf8');
const data = JSON.parse(fs.readFileSync('src/data/product-testing.json', 'utf8'));
const tests = data.groups.flatMap(g => g.tests);
assert.equal(tests.length, 39, 'Cover all 20 left-block and 19 right-block source projects');
assert.equal(new Set(tests.map(t => t.sourceRef)).size, 39);
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert.match(html, /<link rel="canonical" href="https:\/\/www\.leanodm\.com\/quality\/product-testing\/"/);
assert.match(html, /name="description" content="[^"]{80,180}"/);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(ids.length, new Set(ids).size);
for (const test of tests) {
  assert.ok(ids.includes(test.id), `Missing test ${test.id}`);
  assert.ok(test.methods.length && test.criteria.length && test.sourceRef);
  assert.ok(test.stages.length && test.stages.every(s => data.stages.includes(s)));
}
for (const [, href] of html.matchAll(/\bhref="([^"]+)"/g)) {
  if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), `Broken anchor ${href}`);
  else if (href.startsWith('/') && !href.startsWith('//')) {
    const clean = href.split(/[?#]/)[0];
    assert.ok(fs.existsSync(path.join('dist', clean, 'index.html')) || fs.existsSync(path.join('dist', clean)), `Missing local link ${href}`);
  }
}
assert.ok(!html.includes('<astro-island'), 'Core content must not require JavaScript hydration');
for (const bad of ['Lorem ipsum', 'TODO', 'TBD', 'yourdomain.com', 'AstroFlow']) assert.ok(!html.includes(bad));
const graph = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m => JSON.parse(m[1])['@graph']);
assert.ok(graph.some(s => s['@type'] === 'WebPage'));
assert.ok(graph.some(s => s['@type'] === 'BreadcrumbList'));
assert.deepEqual(graph.find(s => s['@type'] === 'FAQPage').mainEntity.map(q => ({ question: q.name, answer: q.acceptedAnswer.text })), data.faqs);
assert.ok(html.includes('not completed test records'));
assert.ok(html.includes('1C + 25'));
assert.ok(html.includes('No stage mark'));
console.log('PASS: 39 source projects, static content, metadata, JSON-LD, anchors and local links');
