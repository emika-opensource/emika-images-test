/**
 * Signup flow helper — navigates through the Emika signup steps
 */
const { BASE_URL } = require('./constants');

/**
 * Complete signup through all steps up to a target step
 * Steps: email -> password -> workspace -> role -> employee -> personalize -> chat
 */
async function signupTo(page, targetStep, options = {}) {
  const {
    email = `test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@emika-test.com`,
    password = 'TestPass123!@#',
    workspaceName = `TestWS-${Date.now()}`,
    userRole = 'Founder',
    employeeRole = 'Executive Assistant',
    aiName = 'Atlas', // Default AI name — must click a suggestion chip
  } = options;

  const results = { email, password, workspaceName, userRole, employeeRole, aiName };

  // Step 1: Email
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.fill('input', email);
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(3000);
  if (targetStep === 'email') return results;

  // Step 2: Password
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(3000);
  if (targetStep === 'password') return results;

  // Step 3: Workspace name
  await page.fill('input[type="text"]', workspaceName);
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(3000);
  if (targetStep === 'workspace') return results;

  // Step 4: Role selection
  await page.click(`text=${userRole}`);
  await page.waitForTimeout(500);
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(3000);
  if (targetStep === 'role') return results;

  // Step 5: AI Employee selection
  const employeeCards = await page.$$('.employee-card');
  for (const card of employeeCards) {
    const text = await card.textContent();
    if (text.includes(employeeRole)) {
      await card.click();
      break;
    }
  }
  await page.waitForTimeout(500);

  // Click continue (in the fixed bottom bar)
  const continueBtn = await page.$('.employee-continue-fixed button, button:has-text("Continue")');
  if (continueBtn) await continueBtn.click();
  await page.waitForTimeout(3000);
  if (targetStep === 'employee') return results;

  // Step 6: Personalization — select a name chip to enable the "Meet your AI" button
  const nameChip = await page.$(`button.suggestion-chip:has-text("${aiName}")`);
  if (nameChip) {
    await nameChip.click();
    await page.waitForTimeout(500);
  }
  if (targetStep === 'personalize') return results;

  // Step 7: Click "Meet [name]" or "Meet your AI" to enter chat
  const meetBtn = await page.$(`button:has-text("Meet ${aiName}"), button:has-text("Meet your AI"), button.btn-primary`);
  if (meetBtn) {
    await meetBtn.click();
  }
  await page.waitForTimeout(5000);

  // Step 8: Trial activation — click "Activate" button if trial wall appears
  const trialBtn = await page.$('button:has-text("Activate"), button:has-text("Start"), a:has-text("Activate")');
  if (trialBtn) {
    await trialBtn.click();
    await page.waitForTimeout(10000); // Wait for chat to load after activation
  } else {
    await page.waitForTimeout(5000);
  }
  if (targetStep === 'chat') return results;

  return results;
}

module.exports = { signupTo };
