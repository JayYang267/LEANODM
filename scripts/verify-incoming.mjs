import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const built = 'dist/quality/incoming-inspection/index.html';
assert.ok(fs.existsSync(built), 'Incoming inspection route must be built');
const html = fs.readFileSync(built, 'utf8');
const data = JSON.parse(fs.readFileSync('src/data/incoming-standard.json', 'utf8'));
const plain = html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const h1 = (html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/) || [,''])[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
assert.match(h1, /^Incoming Material Inspection Standard(?:s)?(?: \(IQC\))?$/);
assert.match(html, /<link\s+rel="canonical"\s+href="https:\/\/www\.leanodm\.com\/quality\/incoming-inspection\/"/);
assert.match(html, /name="description" content="[^"]{80,180}"/);
assert.equal((html.match(/<h1\b/g) || []).length, 1);
for (const value of ['25–30', '45°', '5', 'MIL-STD-105E', '0.65', '2.5', 'CR', 'MAJ', 'MIN']) assert.ok(plain.includes(value), `Missing control: ${value}`);
assert.equal(data.families.flatMap(f => f.materials).length, 20, 'All 20 source material categories must be represented');
for (const material of data.families.flatMap(f => f.materials)) {
  assert.ok(html.includes(`id="${material.id}"`), `Missing material anchor ${material.id}`);
  assert.ok(plain.includes(material.name), `Missing material ${material.name}`);
  for (const row of material.rows) {
    assert.ok(row.sourceRef && row.criterion && row.method && row.severity, `Incomplete source mapping: ${material.id}`);
  }
}
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(ids.length, new Set(ids).size, 'Duplicate HTML IDs');
for (const [, href] of html.matchAll(/\bhref="([^"]+)"/g)) {
  if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), `Broken anchor: ${href}`);
  else if (href.startsWith('/') && !href.startsWith('//')) {
    const clean = href.split(/[?#]/)[0];
    assert.ok(fs.existsSync(path.join('dist', clean, 'index.html')) || fs.existsSync(path.join('dist', clean + '.html')) || fs.existsSync(path.join('dist', clean)), `Missing internal route: ${href}`);
  }
}
for (const evidence of data.evidence) {
  assert.ok(fs.existsSync(path.join('public', evidence.src)), `Missing evidence ${evidence.src}`);
  assert.ok(html.includes(evidence.src), `Evidence not rendered: ${evidence.src}`);
}
assert.ok(data.evidence.length >= 3, 'Original document excerpts required');
const schemas=[...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(([,script])=>JSON.parse(script));
const graph=schemas.flatMap(s=>s['@graph']||[s]);
for(const type of ['WebPage','BreadcrumbList','FAQPage']) assert.ok(graph.some(s=>s['@type']===type),`Missing ${type} structured data`);
const faq=graph.find(s=>s['@type']==='FAQPage');
assert.deepEqual(faq.mainEntity.map(q=>({question:q.name,answer:q.acceptedAnswer.text})),data.faqs,'FAQ schema must match the rendered source data');
assert.ok(!html.includes('<astro-island'), 'Important content must not require client hydration');
assert.ok(plain.includes('TV-QM-S001') && plain.includes('13 August 2021'), 'Visible document identity and effective date');
for (const bad of ['AstroFlow', 'yourdomain.com', 'yourcompany', 'Lorem ipsum', 'TODO', 'TBD', 'Global Logistics']) assert.ok(!html.includes(bad), `Placeholder/demo content: ${bad}`);
console.log(`PASS: built route, 20 materials, ${data.families.flatMap(f => f.materials).reduce((n,m) => n+m.rows.length,0)} source-linked criteria, metadata, anchors, local links and ${data.evidence.length} document excerpts`);
