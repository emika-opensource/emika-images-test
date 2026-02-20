/**
 * Signup flow helper — navigates through the Emika signup steps
 */
const { BASE_URL } = require('./constants');

/**
 * Complete signup through all steps up to a target step
 * Steps: email -> password -> workspace -> role -> employee -> personalize
 */
async function signupTo(page, targetStep, options = {}) {
  const {
    email = `test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@emika-test.com`,
    password = 'TestPass123!@#',
    workspaceName = `TestWS-${Date.now()}`,
    userRole = 'Founder',
    employeeRole = 'Executive Assistant',
  } = options;

  const results = { email, password, workspaceName, userRole, employeeRole };

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
  // Click the specific employee card
  const employeeCards = await page.$$('.employee-card');
  for (const card of employeeCards) {
    const text = await card.textContent();
    if (text.includes(employeeRole)) {
      await card.click();
      break;
    }
  }
  await page.waitForTimeout(500);
  
  // Click the continue/meet button
  const meetBtn = await page.$('button:has-text("Meet"), button:has-text("Continue")');
  if (meetBtn) await meetBtn.click();
  await page.waitForTimeout(3000);
  if (targetStep === 'employee') return results;

  // Step 6: Personalization (avatar page)
  if (targetStep === 'personalize') return results;

  return results;
}

module.exports = { signupTo };
