// Uses bundled Playwright via NODE_PATH; starts a separate headless Chrome.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
let activeBrowser;

(async () => {
  const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4322';
  const out = process.env.QA_OUTPUT || path.resolve('.incoming-qa');
  fs.mkdirSync(out, { recursive: true });
  const data = JSON.parse(fs.readFileSync('src/data/incoming-standard.json', 'utf8'));
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  activeBrowser = browser;
  const results = [], failures = [];
  for (const [width, height, js] of [[1440,1000,true], [390,844,true], [320,740,false], [768,1024,false]]) {
    const context = await browser.newContext({ viewport: { width, height }, javaScriptEnabled: js, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', e => failures.push(e.message));
    page.on('response', r => { if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`); });
    assert.equal((await page.goto(base + '/quality/incoming-inspection/', { waitUntil: 'networkidle' })).status(), 200);
    await page.screenshot({ path: path.join(out, `hero-${width}${js?'':'-no-js'}.png`) });
    const bodyText = await page.locator('main').textContent();
    for (const material of data.families.flatMap(f => f.materials)) {
      for (const row of material.rows) assert.ok(bodyText.includes(row.criterion), `Missing server-rendered criterion: ${row.sourceRef}`);
      const materialElement = page.locator(`#${material.id}`);
      const disclosure = (await materialElement.evaluate(e => e.tagName)) === 'DETAILS' ? materialElement : materialElement.locator('details').first();
      if (await disclosure.count() && !(await disclosure.evaluate(e => e.open))) await disclosure.locator('summary').first().click();
    }
    for (const img of await page.locator('main img').all()) { await img.scrollIntoViewIfNeeded(); await img.evaluate(e => e.decode()); }
    const audit = await page.evaluate(() => {
      const hs = [...document.querySelectorAll('h1,h2,h3,h4')].map(e => +e.tagName[1]);
      const ids = new Set([...document.querySelectorAll('[id]')].map(e => e.id));
      const headerItems=[...document.querySelectorAll('.lean-global-brand, .lean-global-desktop > *, .lean-global-secondary > *, .lean-global-actions > .lean-global-contact')].filter(e=>e.checkVisibility());
      const headerOverlaps=[];
      headerItems.forEach((e,i)=>headerItems.slice(i+1).forEach(f=>{
        const a=e.getBoundingClientRect(),b=f.getBoundingClientRect();
        if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>2 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2) headerOverlaps.push([e.textContent.trim(),f.textContent.trim()]);
      }));
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        overflowing: [...document.querySelectorAll('body *')].filter(e => !e.closest('thead') && e.checkVisibility() && e.getBoundingClientRect().right > innerWidth+1).slice(0,10).map(e => e.tagName+'.'+e.className),
        headingSkips: hs.filter((h,i) => i && h>hs[i-1]+1),
        h1: document.querySelectorAll('h1').length,
        images: [...document.querySelectorAll('main img')].filter(e => e.complete && e.naturalWidth).length,
        brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(e => !ids.has(e.getAttribute('href').slice(1))).map(e => e.getAttribute('href')),
        tables: document.querySelectorAll('main table').length,
        rows: document.querySelectorAll('main tbody tr').length,
        canonical: document.querySelector('link[rel=canonical]')?.href,
        narrowMobileRowHeaders: innerWidth > 640 ? [] : [...document.querySelectorAll('main tbody th')].filter(e => e.getBoundingClientRect().width < e.parentElement.getBoundingClientRect().width * .9).map(e=>e.textContent).slice(0,10),
        panelTitleSize: parseFloat(getComputedStyle(document.querySelector('.iqc-panel-heading h2')).fontSize),
        headerOverlaps,
      };
    });
    assert.equal(audit.overflow, false, `Horizontal overflow at ${width}: ${audit.overflowing}`);
    assert.deepEqual(audit.headingSkips, [], 'Heading hierarchy');
    assert.equal(audit.h1, 1);
    assert.deepEqual(audit.narrowMobileRowHeaders, [], 'Stacked row titles must span the full card width');
    assert.ok(audit.panelTitleSize <= 20, 'Control panel label must not inherit the large section heading size');
    assert.deepEqual(audit.headerOverlaps, [], 'Global navigation items must not overlap the logo or one another');
    assert.equal(audit.images, data.evidence.length);
    assert.deepEqual(audit.brokenAnchors, []);
    assert.equal(audit.canonical, 'https://www.leanodm.com/quality/incoming-inspection/');
    for (const id of ['material-standards','outer-cartons','pcba','fabrics','source-evidence','project-requirements']) {
      assert.equal(await page.locator(`#${id}`).count(),1,`Required section ${id}`);
      await page.locator(`#${id}`).evaluate(e=>e.scrollIntoView({block:'start'}));
      const y=await page.locator(`#${id}`).evaluate(e=>e.getBoundingClientRect().top);
      assert.ok(y>=116 && y<=170,`Anchor ${id} must clear the two-level header at ${width}: ${y}`);
      if (width===1440||width===390) await page.screenshot({path:path.join(out,`${id}-${width}.png`)});
    }
    if (width<1120) {
      await page.goto(base+'/quality/incoming-inspection/');
      await page.locator('.technical-mobile-menu summary').click();
      assert.equal(await page.locator('.technical-mobile-menu').getAttribute('open'),'');
      const link=page.locator('.technical-mobile-panel a[href^="#"]').first();
      const href=await link.getAttribute('href');await link.click();
      assert.equal(new URL(page.url()).hash,href);
      if(js) assert.equal(await page.locator('.technical-mobile-menu').getAttribute('open'),null);
    }
    const brief = await context.request.get(base+'/resources/incoming-inspection-project-brief.txt');
    assert.equal(brief.status(),200);
    assert.ok((await brief.text()).includes('This file does not'));
    results.push({width,height,javaScript:js,...audit});
    await context.close();
  }
  await browser.close();
  assert.deepEqual(failures,[],'Browser errors or failed requests');
  fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
})().catch(async e=>{console.error(e); if(activeBrowser) await activeBrowser.close(); process.exitCode=1});
