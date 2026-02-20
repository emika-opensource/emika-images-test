// @ts-check
const { test, expect } = require('@playwright/test');
const { chromium } = require('playwright');
const { createSession, endSession } = require('../lib/browserbase');
const { signupTo } = require('../lib/signup-helpers');
const { BASE_URL, AI_EMPLOYEES } = require('../lib/constants');

/**
 * AI Employee Role Tests
 * For each active role: create account, select that role, chat with the AI,
 * and verify it responds appropriately to role-specific use cases.
 */

for (const employee of AI_EMPLOYEES.active) {

  test.describe(`Role: ${employee.name}`, () => {
    let session;
    let browser;
    let page;

    test.beforeAll(async () => {
      session = await createSession(`Testing role: ${employee.name}`);
      browser = await chromium.connectOverCDP(session.connect_url);
      page = browser.contexts()[0].pages()[0];

      // Signup, select this role, and get to the chat
      await signupTo(page, 'chat', { employeeRole: employee.name });
    });

    test.afterAll(async () => {
      if (browser) await browser.close();
      if (session) await endSession(session.id);
    });

    test(`chat interface loads after selecting ${employee.name}`, async () => {
      const url = page.url();
      console.log(`URL after signup: ${url}`);

      const body = await page.textContent('body');
      console.log(`Body (first 500): ${body.substring(0, 500)}`);
      await page.screenshot({ path: `test-results/${employee.name.replace(/\s+/g, '-').toLowerCase()}-chat.png` });

      // Look for chat input
      const chatInput = await page.$('textarea, input[type="text"], [contenteditable="true"]');
      expect(chatInput, `Chat input should exist for ${employee.name}`).toBeTruthy();
    });

    for (const useCase of employee.useCases) {
      test(`${useCase.name}`, async () => {
        // Capture message count before sending
        const msgCountBefore = await page.evaluate(() => {
          const msgs = document.querySelectorAll('[class*="message"], [class*="bubble"], [class*="response"]');
          return msgs.length;
        });

        // Find chat input — try multiple selectors
        let chatInput = await page.$('textarea');
        if (!chatInput) chatInput = await page.$('[contenteditable="true"]');
        if (!chatInput) chatInput = await page.$('input[type="text"]');
        if (!chatInput) {
          // Scroll to bottom and try again
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(1000);
          chatInput = await page.$('textarea, [contenteditable="true"], input[type="text"]');
        }
        expect(chatInput, 'Chat input should be available').toBeTruthy();

        // Type and send
        await chatInput.fill(useCase.prompt);
        
        const sendBtn = await page.$('button[type="submit"], button:has-text("Send"), [class*="send"]');
        if (sendBtn) {
          await sendBtn.click();
        } else {
          await chatInput.press('Enter');
        }

        // Wait for AI response — poll for new message elements
        let responseText = '';
        for (let attempt = 0; attempt < 24; attempt++) {
          await page.waitForTimeout(5000); // 5s intervals, up to 2 min

          // Get the page text and look for new content after our prompt
          const pageText = await page.evaluate((prompt) => {
            const body = document.body.textContent || '';
            const promptIdx = body.lastIndexOf(prompt);
            if (promptIdx >= 0) {
              return body.substring(promptIdx + prompt.length).trim();
            }
            return body;
          }, useCase.prompt);

          if (pageText.length > 50) {
            responseText = pageText;
            break;
          }
        }

        console.log(`\n[${employee.name}] ${useCase.name}`);
        console.log(`Prompt: ${useCase.prompt.substring(0, 80)}...`);
        console.log(`Response length: ${responseText.length} chars`);
        console.log(`Response preview: ${responseText.substring(0, 300)}`);

        // Verify we got a response
        expect(responseText.length, 'AI should respond with substantial text').toBeGreaterThan(20);

        // Check for expected keywords (case-insensitive)
        const lowerResponse = responseText.toLowerCase();
        const matched = useCase.expectContains.filter(k => lowerResponse.includes(k.toLowerCase()));
        const missed = useCase.expectContains.filter(k => !lowerResponse.includes(k.toLowerCase()));

        console.log(`Keywords matched: ${matched.length}/${useCase.expectContains.length}`);
        if (missed.length > 0) console.log(`Missing: ${missed.join(', ')}`);

        // At least half the keywords should match
        const minRequired = Math.ceil(useCase.expectContains.length / 2);
        expect(matched.length, `Should match ≥${minRequired}/${useCase.expectContains.length} keywords`).toBeGreaterThanOrEqual(minRequired);
      });
    }
  });
}

// Test that "Coming Soon" roles can't be selected
test.describe('Coming Soon Roles', () => {
  let session, browser, page;

  test.beforeAll(async () => {
    session = await createSession('Testing coming soon roles');
    browser = await chromium.connectOverCDP(session.connect_url);
    page = browser.contexts()[0].pages()[0];
    await signupTo(page, 'role');
  });

  test.afterAll(async () => {
    if (browser) await browser.close();
    if (session) await endSession(session.id);
  });

  test('all Coming Soon roles are visible but not selectable', async () => {
    const body = await page.textContent('body');

    for (const roleName of AI_EMPLOYEES.comingSoon) {
      expect(body, `${roleName} should be visible`).toContain(roleName);
    }

    // Try clicking a coming soon card
    const comingSoonCards = await page.$$('.employee-card.coming-soon');
    console.log(`Found ${comingSoonCards.length} Coming Soon cards`);

    if (comingSoonCards.length > 0) {
      await comingSoonCards[0].click();
      await page.waitForTimeout(500);
      const isSelected = await comingSoonCards[0].evaluate(el => el.classList.contains('selected'));
      expect(isSelected, 'Coming Soon cards should not get selected').toBe(false);
    }
  });
});
