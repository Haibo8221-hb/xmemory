# xmemory E2E Tests

Playwright-based end-to-end tests for xmemory.work

## Quick Start

```bash
# Install dependencies
cd tests/e2e
npm install

# Run all tests
npm test

# Run with browser visible
npm run test:headed

# Run specific test file
npm run test:public
npm run test:auth
npm run test:cloud

# Interactive UI mode
npm run test:ui

# Debug mode
npm run test:debug
```

## Test Structure

```
tests/e2e/
├── specs/
│   ├── 01-public-pages.spec.ts   # Public page tests (no auth needed)
│   ├── 02-auth.spec.ts           # Authentication flow tests
│   └── 03-cloud-memory.spec.ts   # Cloud memory features
├── test-data/                     # Test data files (auto-generated)
├── playwright.config.ts           # Playwright configuration
├── run-tests.sh                   # Unix test runner
├── run-tests.ps1                  # Windows test runner
└── package.json
```

## Test Categories

### 1. Public Pages (01-public-pages.spec.ts)
Tests that don't require authentication:
- Homepage
- Pricing page
- Login page
- Documentation pages
- Legal pages
- 404 handling

### 2. Authentication (02-auth.spec.ts)
- Login redirect for protected routes
- Google OAuth flow initiation
- API 401 responses

### 3. Cloud Memory (03-cloud-memory.spec.ts)
- Memory upload
- Memory list
- Memory download
- Version history
- Memory deletion
- API endpoints

## Running Authenticated Tests

Some tests require a valid session. To run these:

1. Log in to xmemory.work manually
2. Open DevTools → Application → Cookies
3. Copy the `sb-uupwzvbrcmiwkutgeqza-auth-token` cookie value
4. Run tests with the cookie:

```bash
# Unix
TEST_SESSION_COOKIE="your_cookie_value" npm test

# Windows PowerShell
$env:TEST_SESSION_COOKIE="your_cookie_value"; npm test

# Or use the runner scripts
./run-tests.sh --auth "your_cookie_value"
.\run-tests.ps1 -Auth "your_cookie_value"
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TEST_URL` | Target URL | `https://xmemory.work` |
| `TEST_SESSION_COOKIE` | Auth cookie for protected tests | - |

### Custom URL

```bash
TEST_URL=http://localhost:3000 npm test
```

## Test Reports

After running tests, view the HTML report:

```bash
npm run report
```

Reports are saved in `playwright-report/`.

## Recording New Tests

Use Playwright's codegen to record new tests:

```bash
npm run codegen
```

This opens a browser where your actions are recorded as test code.

## CI Integration

Example GitHub Actions workflow:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: |
          cd tests/e2e
          npm ci
          npx playwright install --with-deps
      - name: Run tests
        run: |
          cd tests/e2e
          npm test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: tests/e2e/playwright-report/
```

## Troubleshooting

### Tests timeout on first run
Playwright needs to download browser binaries. Run:
```bash
npx playwright install
```

### Cannot find module '@playwright/test'
Install dependencies:
```bash
npm install
```

### Auth tests are skipped
Provide the session cookie via environment variable.

### Tests fail with network errors
- Check if the target URL is accessible
- Check for CORS issues
- Verify session cookie is valid and not expired
