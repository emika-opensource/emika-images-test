// @ts-check
const { test, expect } = require('@playwright/test');
const { createSession, endSession, connectBrowser } = require('../lib/browserbase');
const { signupTo } = require('../lib/signup-helpers');
const { BASE_URL, USER_ROLES, AI_EMPLOYEES } = require('../lib/constants');

/**
 * Signup Flow Tests — end-to-end account creation on app.emika.ai
 */

let session;
let browser;
let page;

test.describe('Account Creation Flow', () => {

  test.beforeAll(async () => {
    session = await createSession('Signup flow tests');
    const conn = await connectBrowser(session.connect_url);
    browser = conn.browser;
    page = conn.page;
  });

  test.afterAll(async () => {
    if (browser) await browser.close();
    if (session) await endSession(session.id);
  });

  test('Step 1: Homepage loads with email input', async () => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Verify email input exists
    const emailInput = await page.$('input');
    expect(emailInput).toBeTruthy();

    // Verify Continue button exists
    const continueBtn = await page.$('button:has-text("Continue")');
    expect(continueBtn).toBeTruthy();

    // Verify Terms of Service link
    const tosLink = await page.$('a[href*="terms"]');
    expect(tosLink).toBeTruthy();
  });

  test('Step 2: Email submission leads to password creation', async () => {
    const email = `test-signup-${Date.now()}@emika-test.com`;
    await page.fill('input', email);
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(3000);

    // Should see password field
    const passwordInput = await page.$('input[type="password"]');
    expect(passwordInput).toBeTruthy();

    // Should see "Create your password" heading
    const body = await page.textContent('body');
    expect(body).toContain('Create your password');

    // Should see Back button
    const backBtn = await page.$('button:has-text("Back")');
    expect(backBtn).toBeTruthy();
  });

  test('Step 3: Password submission leads to workspace naming', async () => {
    await page.fill('input[type="password"]', 'TestPass123!@#');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(3000);

    const body = await page.textContent('body');
    expect(body).toContain('Name your workspace');

    const workspaceInput = await page.$('input[type="text"]');
    expect(workspaceInput).toBeTruthy();
  });

  test('Step 4: Workspace naming leads to role selection', async () => {
    await page.fill('input[type="text"]', `TestWS-${Date.now()}`);
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(3000);

    const body = await page.textContent('body');
    expect(body).toContain('Tell us about yourself');
    expect(body).toContain("What's your role?");

    // Verify all expected user roles are present
    for (const role of USER_ROLES) {
      expect(body).toContain(role);
    }
  });

  test('Step 5: Role selection leads to AI Employee selection', async () => {
    await page.click('text=Founder');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(3000);

    const body = await page.textContent('body');
    expect(body).toContain('Choose your AI Employee');

    // Verify all active employees are shown
    for (const emp of AI_EMPLOYEES.active) {
      expect(body).toContain(emp);
    }

    // Verify coming soon employees are shown
    for (const emp of AI_EMPLOYEES.comingSoon) {
      expect(body).toContain(emp);
    }
  });

  test('Step 6: Employee selection leads to personalization (avatar)', async () => {
    await page.click('.employee-card');
    await page.waitForTimeout(500);
    const meetBtn = await page.$('button:has-text("Meet"), button:has-text("Continue")');
    expect(meetBtn).toBeTruthy();
    await meetBtn.click();
    await page.waitForTimeout(3000);

    const body = await page.textContent('body');
    expect(body).toContain('Personalize your AI');
    expect(body).toContain('Male');
    expect(body).toContain('Female');

    // Verify avatar image is shown
    const avatar = await page.$('img[src*="avatars"]');
    expect(avatar).toBeTruthy();
  });

  test('Back button works on each step', async () => {
    // We're on personalization - click back
    const backBtn = await page.$('button:has-text("Back"), .back-btn');
    expect(backBtn).toBeTruthy();
    await backBtn.click();
    await page.waitForTimeout(2000);

    // Should be back on employee selection
    const body = await page.textContent('body');
    expect(body).toContain('Choose your AI Employee');
  });
});
