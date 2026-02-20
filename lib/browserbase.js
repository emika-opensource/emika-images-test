/**
 * BrowserBase session helper — creates cloud browser sessions via Emika API
 */
const { chromium } = require('playwright');

const SEAT_TOKEN = process.env.SEAT_TOKEN;
const API_BASE = 'https://api.emika.ai/seat-skills/browserbase';

async function createSession(purpose = 'Playwright test') {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: {
      'X-Seat-Token': SEAT_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ purpose }),
  });
  const data = await res.json();
  if (!data.connect_url) throw new Error(`Failed to create session: ${JSON.stringify(data)}`);
  return data;
}

async function endSession(sessionId) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/end`, {
    method: 'POST',
    headers: { 'X-Seat-Token': SEAT_TOKEN },
  });
  return res.json();
}

async function connectBrowser(connectUrl) {
  const browser = await chromium.connectOverCDP(connectUrl);
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  return { browser, context, page };
}

module.exports = { createSession, endSession, connectBrowser };
