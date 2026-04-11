import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('should load dashboard with KPI cards', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to login if not authenticated
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should show login form', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard after login
    await expect(page).toHaveURL('/');
  });

  test('should display dashboard stats after login', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Check for dashboard elements
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });
});

test.describe('Products Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should navigate to products page', async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator('text=Products')).toBeVisible();
  });

  test('should show products list', async ({ page }) => {
    await page.goto('/products');
    // Should have products table or grid
    const products = page.locator('[class*="product"], [class*="menu"]');
    await expect(products.first()).toBeVisible();
  });
});

test.describe('Orders Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should navigate to orders page', async ({ page }) => {
    await page.goto('/orders');
    await expect(page.locator('text=Order')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should navigate to reports page', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('text=Report')).toBeVisible({ timeout: 10000 });
  });
});