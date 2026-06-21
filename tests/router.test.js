const test = require('node:test');
const assert = require('node:assert');
const { launchApp, waitForSignIn, waitForDashboard, clearAuthState, closeApp, VALID_USERNAME, VALID_PASSWORD } = require('./utils');

test('unauthenticated user is kept on the sign-in page', async () => {
  const { app, page, userDataDir } = await launchApp();
  try {
    await waitForSignIn(page);

    const signInHeading = await page.locator('text=Sign in to your dashboard').count();
    assert.ok(signInHeading > 0, 'Sign-in page should be shown');

    const dashboardHeading = await page.locator('text=Overview').count();
    assert.strictEqual(dashboardHeading, 0, 'Dashboard should not be visible');
  } finally {
    await closeApp(app, userDataDir);
  }
});

test('attempting to navigate to dashboard while unauthenticated redirects to sign-in', async () => {
  const { app, page, userDataDir } = await launchApp();
  try {
    await waitForSignIn(page);

    // Try navigating to dashboard through the router directly.
    await page.evaluate(async () => {
      if (window.Router && typeof window.Router.navigate === 'function') {
        await window.Router.navigate('dashboard');
      }
    });

    // Give the router a moment to redirect.
    await page.waitForTimeout(500);

    const signInHeading = await page.locator('text=Sign in to your dashboard').count();
    assert.ok(signInHeading > 0, 'User should be redirected back to sign-in');
  } finally {
    await closeApp(app, userDataDir);
  }
});

test('authenticated user is taken to the dashboard on launch', async () => {
  // Log in first.
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

  // Re-launch with the same profile: should be on dashboard.
  const second = await launchApp({ userDataDir: sharedUserDataDir });
  try {
    await waitForDashboard(second.page);

    const dashboardHeading = await second.page.locator('text=Overview').count();
    assert.ok(dashboardHeading > 0, 'Authenticated user should see dashboard on launch');

    await clearAuthState(second.page);
  } finally {
    await closeApp(second.app, second.userDataDir);
  }
});

test('authenticated user navigating to sign-in stays on dashboard', async () => {
  const { app, page, userDataDir } = await launchApp();
  try {
    await waitForSignIn(page);
    await page.fill('#username', VALID_USERNAME);
    await page.fill('#password', VALID_PASSWORD);
    await page.click('#signin-btn');
    await waitForDashboard(page);

    // Try navigating to signin through the router.
    await page.evaluate(async () => {
      if (window.Router && typeof window.Router.navigate === 'function') {
        await window.Router.navigate('signin');
      }
    });

    await page.waitForTimeout(500);

    const dashboardHeading = await page.locator('text=Overview').count();
    assert.ok(dashboardHeading > 0, 'Authenticated user should remain on dashboard');

    await clearAuthState(page);
  } finally {
    await closeApp(app, userDataDir);
  }
});
