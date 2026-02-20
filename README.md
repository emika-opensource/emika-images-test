# Emika Images Test

Playwright test suite for testing the app.emika.ai signup flow, AI Employee roles, avatar images, and AI conversation verification.

## Setup

```bash
npm install
```

Requires `SEAT_TOKEN` environment variable for BrowserBase cloud browser sessions.

## Test Suites

| Suite | Command | Description |
|-------|---------|-------------|
| Avatar Images | `npm run test:avatars` | Verifies all avatar images load correctly |
| Signup Flow | `npm run test:signup` | Tests full account creation flow |
| Employee Roles | `npm run test:roles` | Tests AI Employee role selection |
| AI Conversation | `npm run test:chat` | Tests talking with AI Employees |
| All | `npm test` | Runs everything |

## Architecture

- `tests/` — Playwright test specs
- `lib/constants.js` — Discovered app constants (roles, avatars, etc.)
- `lib/browserbase.js` — BrowserBase cloud browser session management
- `lib/signup-helpers.js` — Reusable signup flow navigation

## Discovered App Data (2026-02-20)

### Signup Flow Steps
1. Email entry
2. Password creation
3. Workspace naming
4. User role selection (8 roles)
5. AI Employee selection (14 employees, 6 active + 8 coming soon)
6. Avatar personalization (name + image)

### Avatar Images
- **Confirmed working:** `men-1..8`, `female-1..8` (16 images, 256x256)
- **Cloudflare-blocked from cloud browsers:** `men-9..15`, `women-*`, `male-*`, `female-9..15`
- **URL patterns:** `/avatars/{prefix}-{n}.jpg` where prefix = men|women|male|female, n = 1-15
- **Note:** All 60 URLs return 200 OK via direct curl, but many serve Cloudflare challenge pages instead of images when accessed from cloud browsers

### AI Employee Roles
**Active:** Executive Assistant, Software Developer, QA Engineer, System Analyst, Sales Development Rep, SEO Manager

**Coming Soon:** Copywriter, Social Media Manager, Workflow Engineer, Customer Support Rep, UI/UX Designer, Marketing Manager, Recruiter, Head of Operations

### User Roles
Software Engineer, Product Manager, Founder, Marketing Manager, Sales Manager, Designer, Data Analyst, Operations Manager

### AI Names (Male)
Atlas, Nova, Orion, Zephyr, Phoenix, Jasper, Felix, Leo, Kai, Axel, Finn, Oscar
