// @ts-check
const { test, expect } = require('@playwright/test');
const { chromium } = require('playwright');
const { createSession, endSession } = require('../lib/browserbase');
const { BASE_URL, AVATAR_PREFIXES } = require('../lib/constants');

/**
 * Avatar Image Tests — verify all avatar images load correctly
 * Uses real <img> element loading to bypass Cloudflare fetch restrictions
 */

let session;
let browser;
let page;

test.beforeAll(async () => {
  session = await createSession('Avatar image tests');
  browser = await chromium.connectOverCDP(session.connect_url);
  page = browser.contexts()[0].pages()[0];
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
});

test.afterAll(async () => {
  if (browser) await browser.close();
  if (session) await endSession(session.id);
});

test.describe('Avatar Images Availability', () => {

  test('discover all avatar images by loading them as <img> elements', async () => {
    // Use the browser to load each image as an <img> and check naturalWidth
    const results = await page.evaluate(async () => {
      const prefixes = ['men', 'women', 'male', 'female'];
      const results = [];

      for (const prefix of prefixes) {
        for (let i = 1; i <= 20; i++) {
          const url = `/avatars/${prefix}-${i}.jpg`;
          const loaded = await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ url, ok: img.naturalWidth > 0, width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = () => resolve({ url, ok: false, width: 0, height: 0 });
            img.src = url;
            // Timeout after 5s
            setTimeout(() => resolve({ url, ok: false, width: 0, height: 0, timeout: true }), 5000);
          });
          results.push(loaded);
        }
      }
      return results;
    });

    const loaded = results.filter(r => r.ok);
    const failed = results.filter(r => !r.ok);

    console.log(`\n=== AVATAR IMAGE DISCOVERY REPORT ===`);
    console.log(`Total checked: ${results.length}`);
    console.log(`Successfully loaded: ${loaded.length}`);
    console.log(`Failed to load: ${failed.length}\n`);

    // Group by prefix
    for (const prefix of AVATAR_PREFIXES) {
      const prefixResults = results.filter(r => r.url.includes(`/${prefix}-`));
      const prefixLoaded = prefixResults.filter(r => r.ok);
      const prefixRange = prefixLoaded.map(r => parseInt(r.url.match(/(\d+)\.jpg/)[1]));
      console.log(`  ${prefix}: ${prefixLoaded.length} images (range: ${Math.min(...prefixRange)}-${Math.max(...prefixRange)})`);
      if (prefixLoaded.length > 0) {
        console.log(`    Dimensions: ${prefixLoaded[0].width}x${prefixLoaded[0].height}`);
      }
    }

    console.log('\nLoaded images:');
    loaded.forEach(r => console.log(`  ✓ ${r.url} (${r.width}x${r.height})`));

    if (failed.length > 0) {
      console.log('\nFailed images:');
      failed.forEach(r => console.log(`  ✘ ${r.url}${r.timeout ? ' (timeout)' : ''}`));
    }

    // We expect at least 15 per prefix to exist
    for (const prefix of AVATAR_PREFIXES) {
      const prefixLoaded = results.filter(r => r.url.includes(`/${prefix}-`) && r.ok);
      expect(prefixLoaded.length, `${prefix} should have at least 15 images`).toBeGreaterThanOrEqual(15);
    }
  });

  test('avatar images have consistent dimensions within each prefix', async () => {
    const results = await page.evaluate(async () => {
      const prefixes = ['men', 'women', 'male', 'female'];
      const res = {};
      for (const prefix of prefixes) {
        res[prefix] = [];
        for (let i = 1; i <= 15; i++) {
          const loaded = await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ i, w: img.naturalWidth, h: img.naturalHeight });
            img.onerror = () => resolve({ i, w: 0, h: 0 });
            img.src = `/avatars/${prefix}-${i}.jpg`;
            setTimeout(() => resolve({ i, w: 0, h: 0 }), 5000);
          });
          res[prefix].push(loaded);
        }
      }
      return res;
    });

    console.log('\n=== DIMENSION CONSISTENCY ===');
    for (const prefix of AVATAR_PREFIXES) {
      const dims = results[prefix].filter(r => r.w > 0);
      const unique = [...new Set(dims.map(d => `${d.w}x${d.h}`))];
      console.log(`  ${prefix}: ${unique.length} unique dimension(s): ${unique.join(', ')}`);
      
      if (unique.length > 1) {
        console.log(`    ⚠ Inconsistent dimensions!`);
        dims.forEach(d => console.log(`      ${prefix}-${d.i}: ${d.w}x${d.h}`));
      }
    }
  });

  test('no broken image references in personalization page', async () => {
    // Navigate through signup to reach personalization page
    const { signupTo } = require('../lib/signup-helpers');
    
    // Create a new page for this test
    const newPage = await browser.contexts()[0].newPage();
    await signupTo(newPage, 'personalize');

    // Check the displayed avatar image loads correctly
    const avatarImg = await newPage.$('img[src*="avatars"]');
    expect(avatarImg, 'Avatar image element should exist on personalization page').toBeTruthy();

    const imgSrc = await avatarImg.getAttribute('src');
    console.log(`\nPersonalization page shows: ${imgSrc}`);

    // Verify the image actually loaded (has dimensions)
    const dimensions = await newPage.evaluate((el) => {
      return { w: el.naturalWidth, h: el.naturalHeight };
    }, avatarImg);
    
    expect(dimensions.w, 'Avatar image should have loaded (naturalWidth > 0)').toBeGreaterThan(0);
    console.log(`Image dimensions: ${dimensions.w}x${dimensions.h}`);

    await newPage.close();
  });
});
