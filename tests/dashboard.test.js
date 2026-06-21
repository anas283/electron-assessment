const test = require('node:test');
const assert = require('node:assert');
const { launchApp, waitForSignIn, waitForDashboard, clearAuthState, closeApp, VALID_USERNAME, VALID_PASSWORD } = require('./utils');

test('dashboard renders overview section and charts', async () => {
  const { app, page, userDataDir } = await launchApp();
  try {
    await waitForSignIn(page);
    await page.fill('#username', VALID_USERNAME);
    await page.fill('#password', VALID_PASSWORD);
    await page.click('#signin-btn');
    await waitForDashboard(page);

    const overviewHeading = await page.locator('text=Overview').count();
    assert.ok(overviewHeading > 0, 'Overview heading should be visible');

    const donutChart = await page.locator('#donut-chart').count();
    assert.ok(donutChart > 0, 'Donut chart container should exist');

    const barChart = await page.locator('#bar-chart').count();
    assert.ok(barChart > 0, 'Bar chart container should exist');

    const donutSvg = await page.locator('#donut-chart svg').count();
    const barSvg = await page.locator('#bar-chart svg').count();
    assert.ok(donutSvg > 0, 'Donut chart should render an SVG');
    assert.ok(barSvg > 0, 'Bar chart should render an SVG');

    await clearAuthState(page);
  } finally {
    await closeApp(app, userDataDir);
  }
});

test('dashboard renders user list table with headers', async () => {
  const { app, page, userDataDir } = await launchApp();
  try {
    await waitForSignIn(page);
    await page.fill('#username', VALID_USERNAME);
    await page.fill('#password', VALID_PASSWORD);
    await page.click('#signin-btn');
    await waitForDashboard(page);

    const table = await page.locator('#users-table').count();
    assert.ok(table > 0, 'User list table should exist');

    const headers = await page.locator('#users-table thead th').allTextContents();
    assert.ok(headers.includes('#'), 'Table should include # header');
    assert.ok(headers.includes('First Name'), 'Table should include First Name header');
    assert.ok(headers.includes('Last Name'), 'Table should include Last Name header');
    assert.ok(headers.includes('User Name'), 'Table should include User Name header');

    const rows = await page.locator('#users-table-body tr').count();
    assert.ok(rows > 0, 'User list table should have at least one data row');

    await clearAuthState(page);
  } finally {
    await closeApp(app, userDataDir);
  }
});

test('sign out returns user to the sign-in page', async () => {
  const { app, page, userDataDir } = await launchApp();
  try {
    await waitForSignIn(page);
    await page.fill('#username', VALID_USERNAME);
    await page.fill('#password', VALID_PASSWORD);
    await page.click('#signin-btn');
    await waitForDashboard(page);

    await page.click('#signout-link');
    await waitForSignIn(page);

    const signInHeading = await page.locator('text=Sign in to your dashboard').count();
    assert.ok(signInHeading > 0, 'User should be back on sign-in page after logout');
  } finally {
    await closeApp(app, userDataDir);
  }
});
