const test = require('node:test');
const assert = require('node:assert');
const { launchApp, waitForSignIn, waitForDashboard, clearAuthState, closeApp, VALID_USERNAME, VALID_PASSWORD } = require('./utils');

const INVALID_USERNAME = 'not_a_user';
const INVALID_PASSWORD = 'wrong_password';

test('sign-in page loads with required fields', async () => {
  const { app, page, userDataDir } = await launchApp();
  try {
    await waitForSignIn(page);

    const usernameInput = page.locator('#username');
    const passwordInput = page.locator('#password');
    const submitButton = page.locator('#signin-btn');

    assert.strictEqual(await usernameInput.count(), 1, 'Username input should exist');
    assert.strictEqual(await passwordInput.count(), 1, 'Password input should exist');
    assert.strictEqual(await submitButton.count(), 1, 'Submit button should exist');
    assert.strictEqual(await submitButton.isDisabled(), true, 'Submit button should be disabled initially');
  } finally {
    await closeApp(app, userDataDir);
  }
});

test('sign-in form enables submit when both fields are filled', async () => {
  const { app, page, userDataDir } = await launchApp();
  try {
    await waitForSignIn(page);

    const usernameInput = page.locator('#username');
    const passwordInput = page.locator('#password');
    const submitButton = page.locator('#signin-btn');

    await usernameInput.fill('user');
    assert.strictEqual(await submitButton.isDisabled(), true, 'Submit should stay disabled with only username');

    await passwordInput.fill('pass');
    assert.strictEqual(await submitButton.isDisabled(), false, 'Submit should be enabled when both fields are filled');
  } finally {
    await closeApp(app, userDataDir);
  }
});

test('invalid credentials show an error message', async () => {
  const { app, page, userDataDir } = await launchApp();
  try {
    await waitForSignIn(page);

    await page.fill('#username', INVALID_USERNAME);
    await page.fill('#password', INVALID_PASSWORD);
    await page.click('#signin-btn');

    const errorAlert = page.locator('#signin-error');
    await errorAlert.waitFor({ state: 'visible', timeout: 10000 });

    const errorText = await errorAlert.textContent();
    assert.ok(errorText && errorText.length > 0, 'Error message should be displayed');
  } finally {
    await closeApp(app, userDataDir);
  }
});

test('valid credentials navigate to the dashboard', async () => {
  const { app, page, userDataDir } = await launchApp();
  try {
    await waitForSignIn(page);

    await page.fill('#username', VALID_USERNAME);
    await page.fill('#password', VALID_PASSWORD);
    await page.click('#signin-btn');

    await waitForDashboard(page);

    const overviewHeading = await page.locator('text=Overview').count();
    assert.ok(overviewHeading > 0, 'Dashboard overview should be visible after login');
  } finally {
    await closeApp(app, userDataDir);
  }
});

test('authenticated session persists across app restarts', async () => {
  // First launch: log in.
  const first = await launchApp();
  const sharedUserDataDir = first.userDataDir;
  try {
    await waitForSignIn(first.page);
    await first.page.fill('#username', VALID_USERNAME);
    await first.page.fill('#password', VALID_PASSWORD);
    await first.page.click('#signin-btn');
    await waitForDashboard(first.page);
  } finally {
    // Close the app but keep the user-data dir so the session persists.
    await first.app.close();
  }

  // Second launch: reuse the same user-data dir so PouchDB session is available.
  const second = await launchApp({ userDataDir: sharedUserDataDir });
  try {
    await waitForDashboard(second.page);
    const overviewHeading = await second.page.locator('text=Overview').count();
    assert.ok(overviewHeading > 0, 'Dashboard should be visible on restart when authenticated');

    // Clean up session for subsequent tests.
    await clearAuthState(second.page);
  } finally {
    await closeApp(second.app, second.userDataDir);
  }
});
