// Run with NODE_PATH pointing to the workspace's bundled node_modules.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

(async () => {
  const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4321';
  const output = process.env.QA_OUTPUT || path.resolve('.appearance-qa');
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const failures = [];
  const results = [];
  for (const [width, height, js] of [[1440, 1000, true], [390, 844, true], [320, 740, false], [768, 1024, false]]) {
    const context = await browser.newContext({ viewport: { width, height }, javaScriptEnabled: js, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', (error) => failures.push(error.message));
    page.on('response', (response) => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
    const response = await page.goto(`${base}/quality/appearance-inspection/`, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    // Trigger every lazy image before checking decode and requesting captures.
    for (const img of await page.locator('.inspection-defects img').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate((el) => el.decode());
    }
    const audit = await page.evaluate(() => {
      const headingTags = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => Number(h.tagName[1]));
      return {
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        overflowElements: [...document.querySelectorAll('main *')].filter((el) => el.getBoundingClientRect().right > innerWidth + 1).map((el) => el.tagName + '.' + el.className).slice(0, 12),
        defects: document.querySelectorAll('.inspection-defect').length,
        loadedImages: [...document.querySelectorAll('.inspection-defects img')].filter((img) => img.complete && img.naturalWidth > 0).length,
        h1Count: document.querySelectorAll('h1').length,
        headingSkips: headingTags.filter((level, i) => i && level > headingTags[i - 1] + 1),
        tableOverflow: [...document.querySelectorAll('table')].filter((t) => t.scrollWidth > t.clientWidth + 1).length,
        tables: document.querySelectorAll('table').length,
      };
    });
    assert.equal(audit.horizontalOverflow, false, `Page overflows at ${width}px: ${audit.overflowElements}`);
    assert.equal(audit.defects, 15);
    assert.equal(audit.loadedImages, 35);
    assert.equal(audit.h1Count, 1);
    assert.deepEqual(audit.headingSkips, []);
    assert.equal(audit.tableOverflow, 0);
    await page.goto(`${base}/quality/appearance-inspection/`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(output, `hero-${width}${js ? '' : '-no-js'}.png`) });
    for (const id of ['inspection-conditions', 'weld-lines', 'scratches-impact-damage', 'printed-text-graphics']) {
      await page.goto(`${base}/quality/appearance-inspection/#${id}`, { waitUntil: 'networkidle' });
      const y = await page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect().top);
      assert.ok(y >= 79 && y <= 140, `Anchor ${id} hidden under header at ${width}px: ${y}`);
      if (width === 1440 || width === 390) await page.screenshot({ path: path.join(output, `${id}-${width}.png`) });
    }
    if (width < 1120) {
      await page.goto(`${base}/quality/appearance-inspection/`);
      await page.locator('.technical-mobile-menu summary').click();
      assert.equal(await page.locator('.technical-mobile-menu').getAttribute('open'), '');
      await page.locator('.technical-mobile-panel a[href="#defect-library"]').click();
      assert.equal(new URL(page.url()).hash, '#defect-library');
      if (js) assert.equal(await page.locator('.technical-mobile-menu').getAttribute('open'), null);
      else await page.locator('.technical-mobile-menu summary').click();
    }
    results.push({ width, height, javaScript: js, ...audit });
    await context.close();
  }
  await browser.close();
  assert.deepEqual(failures, [], 'Browser errors or failed requests');
  fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
})().catch((error) => { console.error(error); process.exitCode = 1; });
