const { chromium } = require('playwright');
const CONNECT_URL = process.env.BB_CONNECT_URL;

(async () => {
  const browser = await chromium.connectOverCDP(CONNECT_URL);
  const page = browser.contexts()[0].pages()[0];
  const email = 'debug-' + Date.now() + '@emika-test.com';

  // Full signup
  await page.goto('https://app.emika.ai', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.fill('input', email);
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(3000);

  await page.fill('input[type="password"]', 'TestPass123!@#');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(3000);

  await page.fill('input[type="text"]', 'DebugWS');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(3000);

  await page.click('text=Founder');
  await page.waitForTimeout(500);
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(3000);

  // Select Executive Assistant
  await page.click('.employee-card');
  await page.waitForTimeout(500);
  
  // Find and click the continue button at bottom
  const btns = await page.$$('button');
  for (const btn of btns) {
    const text = await btn.textContent();
    console.log('Button:', text.trim());
  }
  
  const meetBtn = await page.$('.employee-continue-fixed button, button:has-text("Meet"), button:has-text("Continue")');
  if (meetBtn) {
    const meetText = await meetBtn.textContent();
    console.log('Clicking:', meetText.trim());
    await meetBtn.click();
  }
  await page.waitForTimeout(3000);

  // PERSONALIZATION PAGE
  console.log('\n=== PERSONALIZATION PAGE ===');
  console.log('URL:', page.url());
  const body = await page.textContent('body');
  console.log('Body:', body.substring(0, 500));
  
  // Find all buttons
  const allBtns = await page.$$('button');
  for (const btn of allBtns) {
    const text = await btn.textContent();
    const cls = await btn.getAttribute('class');
    console.log('Btn:', text.trim(), '| class:', cls);
  }

  // Click "Meet your AI"
  const meetAI = await page.$('button:has-text("Meet your AI"), button:has-text("Meet"), button.btn-primary');
  if (meetAI) {
    const t = await meetAI.textContent();
    console.log('\nClicking "Meet your AI":', t.trim());
    await meetAI.click();
  }
  
  // Wait for transition
  await page.waitForTimeout(10000);
  
  console.log('\n=== AFTER MEET YOUR AI ===');
  console.log('URL:', page.url());
  const body2 = await page.textContent('body');
  console.log('Body:', body2.substring(0, 1000));
  
  // Screenshot
  await page.screenshot({ path: 'debug-after-meet.png', fullPage: true });
  
  // Check for chat elements
  const chatElements = await page.evaluate(() => {
    const selectors = {
      textarea: document.querySelectorAll('textarea').length,
      textInput: document.querySelectorAll('input[type="text"]').length,
      contentEditable: document.querySelectorAll('[contenteditable]').length,
      chatClass: document.querySelectorAll('[class*="chat"]').length,
      messageClass: document.querySelectorAll('[class*="message"]').length,
      inputClass: document.querySelectorAll('[class*="input"]').length,
      sendBtn: document.querySelectorAll('[class*="send"]').length,
    };
    return selectors;
  });
  console.log('Chat elements:', JSON.stringify(chatElements, null, 2));

  // Get all classes on the page
  const classes = await page.evaluate(() => {
    const all = new Set();
    document.querySelectorAll('*').forEach(el => el.classList.forEach(c => all.add(c)));
    return [...all].sort();
  });
  console.log('All classes:', JSON.stringify(classes));

  // Wait more and check again
  await page.waitForTimeout(10000);
  console.log('\n=== AFTER 20s TOTAL ===');
  console.log('URL:', page.url());
  const body3 = await page.textContent('body');
  console.log('Body:', body3.substring(0, 1000));
  await page.screenshot({ path: 'debug-after-20s.png', fullPage: true });

  const chatElements2 = await page.evaluate(() => {
    return {
      textarea: document.querySelectorAll('textarea').length,
      iframes: Array.from(document.querySelectorAll('iframe')).map(f => f.src),
    };
  });
  console.log('Chat elements after 20s:', JSON.stringify(chatElements2, null, 2));

  console.log('DONE');
})().catch(e => console.error('ERROR:', e.message));
