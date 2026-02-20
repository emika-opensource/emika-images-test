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

      // Wait for AI's initial greeting to appear
      let greeting = '';
      for (let i = 0; i < 12; i++) {
        await page.waitForTimeout(5000);
        const body = await page.textContent('body');
        if (body.includes("I'm") || body.includes('Hey') || body.includes('Hello') || body.includes('Welcome')) {
          greeting = body;
          break;
        }
      }
      console.log(`Greeting received (first 300): ${greeting.substring(0, 300)}`);

      // Verify chat input exists
      const chatInput = await page.$('textarea, [contenteditable="true"], input[type="text"]');
      expect(chatInput, `Chat input should exist for ${employee.name}`).toBeTruthy();

      // Wait a bit more for the AI to finish its initial message
      await page.waitForTimeout(5000);
    });

    for (const useCase of employee.useCases) {
      test(`${useCase.name}`, async () => {
        // Capture page text before sending
        const textBefore = await page.evaluate(() => document.body.innerText);

        // Find chat input — try multiple selectors
        let chatInput = await page.$('textarea');
        if (!chatInput) chatInput = await page.$('[contenteditable="true"]');
        if (!chatInput) chatInput = await page.$('input[type="text"]');
        if (!chatInput) {
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

        // Wait for AI response — compare page text to find new content
        let responseText = '';
        
        for (let attempt = 0; attempt < 24; attempt++) {
          await page.waitForTimeout(5000);

          const textNow = await page.evaluate(() => document.body.innerText);
          
          // Check if AI is still typing/thinking
          const isTyping = textNow.includes('is typing') || textNow.includes('is thinking');
          if (isTyping && attempt < 20) continue;

          // Find new text that wasn't there before
          const newText = textNow.replace(textBefore, '').trim();
          
          if (newText.length > 30 && !isTyping) {
            responseText = newText;
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

        // At least 1 keyword should match (AI may paraphrase or ask clarifying Qs)
        expect(matched.length, `Should match ≥1/${useCase.expectContains.length} keywords. Response: ${responseText.substring(0, 200)}`).toBeGreaterThanOrEqual(1);
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
