// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 120_000,
  retries: 0,
  workers: 1, // Sequential — we share BrowserBase sessions
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    screenshot: 'on',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'avatar-images',
      testMatch: /avatar-images\.spec\.js/,
    },
    {
      name: 'signup-flow',
      testMatch: /signup-flow\.spec\.js/,
    },
    {
      name: 'employee-roles',
      testMatch: /employee-roles\.spec\.js/,
    },
    {
      name: 'ai-conversation',
      testMatch: /ai-conversation\.spec\.js/,
    },
  ],
});
