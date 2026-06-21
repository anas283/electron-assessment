const { _electron: electron } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// Test credentials are read from the environment so real values are never
// committed to the repository. Set them when running tests, e.g.:
//   TEST_USERNAME=user@example.com TEST_PASSWORD=secret npm test
const VALID_USERNAME = process.env.TEST_USERNAME;
const VALID_PASSWORD = process.env.TEST_PASSWORD;

if (!VALID_USERNAME || !VALID_PASSWORD) {
  throw new Error(
    'TEST_USERNAME and TEST_PASSWORD environment variables must be set to run tests. ' +
    'Example: TEST_USERNAME=user@example.com TEST_PASSWORD=secret npm test'
  );
}

async function launchApp(options = {}) {
  // Use a unique user-data directory for each launch so tests are isolated,
  // unless the caller wants to reuse a directory (e.g. for session persistence tests).
  const userDataDir = options.userDataDir || fs.mkdtempSync(path.join(os.tmpdir(), 'electron-test-'));

  const app = await electron.launch({
    executablePath: path.join(PROJECT_ROOT, 'node_modules', '.bin', 'electron'),
    args: ['.', `--user-data-dir=${userDataDir}`, '--remote-debugging-port=0'],
    cwd: PROJECT_ROOT,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      ...options.env
    }
  });

  const page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');

  return { app, page, userDataDir };
}

async function waitForSignIn(page, timeout = 10000) {
  // The router loads the sign-in view dynamically, so wait for it explicitly.
  await page.waitForFunction(() => {
    return document.getElementById('app')?.children.length > 0;
  }, { timeout });
  await page.waitForSelector('text=Sign in to your dashboard', { timeout });
}

async function waitForDashboard(page, timeout = 10000) {
  await page.waitForSelector('text=Overview', { timeout });
}

async function clearAuthState(page) {
  await page.evaluate(async () => {
    if (window.Auth && typeof window.Auth.logout === 'function') {
      await window.Auth.logout();
    }
  });
}

async function closeApp(app, userDataDir) {
  await app.close();
  try {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors.
  }
}

module.exports = {
  launchApp,
  waitForSignIn,
  waitForDashboard,
  clearAuthState,
  closeApp,
  VALID_USERNAME,
  VALID_PASSWORD
};
