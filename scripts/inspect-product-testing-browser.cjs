// Bundled Playwright through NODE_PATH; a separate headless browser.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const data = JSON.parse(fs.readFileSync('src/data/product-testing.json','utf8'));
const tests = data.groups.flatMap(g=>g.tests);
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4323';
const out = process.env.QA_OUTPUT || path.resolve('.product-testing-qa');
fs.mkdirSync(out,{recursive:true});
let browser;
(async()=>{
  browser = await chromium.launch({channel:'chrome',headless:true});
  const results=[],failures=[];
  for(const [width,height,js] of [[1440,1000,true],[390,844,true],[320,740,false],[768,1024,false]]){
    const context=await browser.newContext({viewport:{width,height},javaScriptEnabled:js,reducedMotion:'reduce'});
    const page=await context.newPage();
    page.on('pageerror',e=>failures.push(e.message));
    page.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${r.url()}`);});
    assert.equal((await page.goto(base+'/quality/product-testing/',{waitUntil:'load'})).status(),200);
    await page.evaluate(()=>document.fonts.ready);
    for(const img of await page.locator('.lean-global-header img').all())await img.evaluate(e=>e.decode());
    await page.screenshot({path:path.join(out,`hero-${width}${js?'':'-no-js'}.png`)});
    await page.keyboard.press('Tab');
    assert.equal(await page.locator(':focus').textContent(),'Skip to content');
    await page.keyboard.press('Enter');
    assert.equal(await page.locator(':focus').getAttribute('id'),'main-content');
    const main=await page.locator('main').textContent();
    for(const test of tests){
      for(const content of [...test.methods,...test.criteria,...test.notes])assert.ok(main.includes(content),`Missing server-rendered content: ${test.id}: ${content}`);
      const entry=page.locator('#'+test.id);
      // Exercise keyboard operation; text in closed disclosures must become visible.
      await entry.locator('summary').focus();
      await page.keyboard.press('Enter');
      assert.equal(await entry.getAttribute('open'),'');
      assert.ok(await entry.locator('.pt-test-body').isVisible());
    }
    for(const img of await page.locator('main img').all()){
      await img.scrollIntoViewIfNeeded();await img.evaluate(e=>e.decode());
      assert.deepEqual(await img.evaluate(e=>[e.width,e.height]),await img.evaluate(e=>[e.naturalWidth,e.naturalHeight]));
    }
    const audit=await page.evaluate(()=>{
      const hs=[...document.querySelectorAll('h1,h2,h3,h4,h5')].map(e=>+e.tagName[1]);
      const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
      const headerItems=[...document.querySelectorAll('.lean-global-brand,.lean-global-desktop>*,.lean-global-secondary>*,.lean-global-actions>.lean-global-contact')].filter(e=>e.checkVisibility());
      const overlaps=[];
      headerItems.forEach((e,i)=>headerItems.slice(i+1).forEach(f=>{const a=e.getBoundingClientRect(),b=f.getBoundingClientRect();if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2)overlaps.push([e.textContent,f.textContent]);}));
      return {overflow:document.documentElement.scrollWidth>innerWidth,h1:document.querySelectorAll('h1').length,headingSkips:hs.filter((h,i)=>i&&h>hs[i-1]+1),brokenAnchors:[...document.querySelectorAll('a[href^="#"]')].filter(e=>!ids.includes(e.hash.slice(1))).map(e=>e.hash),overlaps,openTests:document.querySelectorAll('.pt-test[open]').length,canonical:document.querySelector('link[rel=canonical]').href};
    });
    assert.equal(audit.overflow,false,`Overflow at ${width}`);assert.equal(audit.h1,1);assert.equal(audit.openTests,39);assert.deepEqual(audit.headingSkips,[]);assert.deepEqual(audit.brokenAnchors,[]);assert.deepEqual(audit.overlaps,[]);
    assert.equal(audit.canonical,'https://www.leanodm.com/quality/product-testing/');
    for(const id of ['plan-overview','test-examples','test-library','unpackaged-drop','tension','book-lining-bond','project-requirements']){
      await page.locator('#'+id).evaluate(e=>e.scrollIntoView({block:'start'}));
      const y=await page.locator('#'+id).evaluate(e=>e.getBoundingClientRect().top);
      assert.ok(y>=116&&y<=175,`Covered anchor ${id} at ${width}: ${y}`);
      if(width===1440||width===390)await page.screenshot({path:path.join(out,`${id}-${width}.png`)});
    }
    await page.locator('.pt-stage-wrap').screenshot({path:path.join(out,`stage-matrix-${width}.png`)});
    if(width<860){
      await page.locator('.technical-mobile-menu summary').focus();await page.keyboard.press('Enter');
      const link=page.locator('.technical-mobile-panel a').first();await link.focus();await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash,'#plan-overview');
      if(js){assert.equal(await page.locator('.technical-mobile-menu').getAttribute('open'),null);}
      else{await page.locator('.technical-mobile-menu summary').focus();await page.keyboard.press('Enter');}
    }
    if(width<1120){
      await page.locator('.lean-global-mobile summary').focus();await page.keyboard.press('Enter');
      assert.equal(await page.locator('.lean-global-mobile').getAttribute('open'),'');
      const cta=page.locator('.lean-global-panel a.lean-global-contact');await cta.focus();await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash,'#project-requirements');
      if(!js){await page.locator('.lean-global-mobile summary').focus();await page.keyboard.press('Enter');}
      else{await page.locator('.lean-global-mobile summary').focus();await page.keyboard.press('Enter');await page.keyboard.press('Escape');assert.equal(await page.locator('.lean-global-mobile').getAttribute('open'),null);}
    }
    if(js){
      await page.goto(base+'/quality/product-testing/#thermal-shock',{waitUntil:'load'});
      assert.equal(await page.locator('#thermal-shock').getAttribute('open'),'');
    }
    for(const route of ['/quality/appearance-inspection/','/quality/incoming-inspection/']){
      assert.equal((await page.goto(base+route,{waitUntil:'load'})).status(),200);
      assert.equal(await page.locator('h1').count(),1);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Regression overflow ${route} ${width}`);
      assert.ok(await page.locator('a[href="/quality/product-testing/"]').count(),`Reciprocal navigation missing from ${route}`);
      const appearance=route.includes('appearance');
      if(appearance){
        assert.equal(await page.locator('.inspection-defect').count(),15);
        assert.equal(await page.locator('.inspection-defects img').count(),35);
      }else{
        assert.equal(await page.locator('.iqc-material').count(),20);
        assert.equal(await page.locator('main tbody tr').count(),199);
        for(const detail of await page.locator('.iqc-material').all())await detail.locator('summary').click();
      }
      for(const img of await page.locator('main img').all()){
        // Appearance intentionally hides its duplicate hero image on mobile.
        if(await img.isVisible())await img.scrollIntoViewIfNeeded();
        await img.evaluate(e=>e.decode());
      }
      for(const id of appearance?['inspection-conditions','weld-lines','printed-text-graphics']:['outer-cartons','pcba','source-evidence']){
        await page.locator('#'+id).evaluate(e=>e.scrollIntoView({block:'start'}));
        const y=await page.locator('#'+id).evaluate(e=>e.getBoundingClientRect().top);
        assert.ok(y>=116&&y<=175,`Regression anchor ${route} ${id}: ${y}`);
      }
      if(width===1440||width===390)await page.screenshot({path:path.join(out,`regression-${appearance?'appearance':'incoming'}-${width}.png`)});
    }
    const brief=await context.request.get(base+'/resources/product-testing-project-brief.txt');assert.equal(brief.status(),200);assert.ok((await brief.text()).includes('This file does not'));
    results.push({width,height,javaScript:js,...audit});await context.close();
  }
  await browser.close();assert.deepEqual(failures,[]);
  fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({result:'PASS',viewports:results,errors:failures},null,2));
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});
