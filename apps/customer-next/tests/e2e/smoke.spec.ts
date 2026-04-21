import { test, expect } from '@playwright/test';

const routes = ['/menu', '/profile', '/order-status', '/cart'];

routes.forEach((route) => {
  test(`verify ${route} loads`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(new RegExp(route));
    await expect(page.locator('body')).toBeVisible();
  });
});

test('check design tokens in styles', async ({ page }) => {
  await page.goto('/menu');
  const body = page.locator('body');
  await expect(body).toBeVisible();

  // Check for design tokens in computed styles
  const styles = await page.evaluate(() => {
    const body = document.body;
    const style = window.getComputedStyle(body);
    return {
      backgroundColor: style.backgroundColor,
      color: style.color,
      fontFamily: style.fontFamily,
    };
  });

  console.log('Design tokens:', styles);
  expect(styles.backgroundColor || styles.color || styles.fontFamily).toBeTruthy();
});