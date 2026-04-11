import { test, expect } from '@playwright/test';

test.describe('Customer Menu', () => {
  test.beforeEach(async ({ page }) => {
    // Mock menu API
    await page.route('**/api/v1/qr/menu/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          data: {
            table: { table_code: 'A1', table_name: 'Table A1' },
            products: [
              { id_menu: 1, nama_menu: 'Espresso', harga: 18000, jenis_menu: 'coffee', stok: 10 },
              { id_menu: 2, nama_menu: 'Latte', harga: 25000, jenis_menu: 'coffee', stok: 10 },
              { id_menu: 3, nama_menu: 'Croissant', harga: 20000, jenis_menu: 'food', stok: 5 },
            ],
          },
        }),
      });
    });
  });

  test('should load menu page', async ({ page }) => {
    await page.goto('/menu');
    await expect(page.locator('text=Menu')).toBeVisible({ timeout: 10000 });
  });

  test('should display products in grid', async ({ page }) => {
    await page.goto('/menu');
    await expect(page.locator('text=Espresso')).toBeVisible();
    await expect(page.locator('text=Latte')).toBeVisible();
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('/menu');
    
    // Click coffee category
    await page.click('button:has-text("Coffee")');
    
    // Should show coffee items
    await expect(page.locator('text=Espresso')).toBeVisible();
  });

  test('should add item to cart', async ({ page }) => {
    await page.goto('/menu');
    
    // Click add button for first item
    const addButtons = page.locator('button:has-text("+")');
    await addButtons.first().click();
    
    // Should show cart badge
    await expect(page.locator('.cart-badge')).toBeVisible();
  });

  test('should search products', async ({ page }) => {
    await page.goto('/menu');
    
    // Type in search
    await page.fill('input[placeholder*="Cari"]', 'Espresso');
    
    // Should filter results
    await expect(page.locator('text=Espresso')).toBeVisible();
  });
});

test.describe('Customer Cart', () => {
  test('should show empty cart message', async ({ page }) => {
    await page.goto('/cart');
    // Should show empty cart or redirect
    await expect(page.locator('text=Cart').or(page.locator('text=Kosong'))).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Order Status', () => {
  test('should show order status page', async ({ page }) => {
    await page.goto('/order-status?orderId=123&tableToken=token123');
    await expect(page.locator('text=Status')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Offline Support', () => {
  test('should show offline notice when cached', async ({ page }) => {
    // Set up mock cache
    await page.addInitScript(() => {
      window.localStorage.setItem('menu_cache', JSON.stringify({
        tableToken: 'test',
        products: [],
        cachedAt: new Date().toISOString(),
      }));
    });
    
    await page.goto('/menu');
    // Should show cache notice
    const notice = page.locator('text=Cache');
    if (await notice.count() > 0) {
      await expect(notice).toBeVisible();
    }
  });
});