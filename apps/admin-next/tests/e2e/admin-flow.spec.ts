import { test, expect } from '@playwright/test';

test('admin flow: login -> tables -> reports', async ({ page }) => {
  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        message: 'Login berhasil',
        data: {
          token: 'mock-token',
          user: { username: 'admin', role: 'admin' },
        },
        server_time: '2026-03-06 00:00:00',
      }),
    });
  });

  await page.route('**/api/v1/master/tables', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        message: 'OK',
        data: { items: [{ id: 1, table_code: 'A1', table_name: 'Table A1', qr_token: 'abc', is_active: 1 }] },
        server_time: '2026-03-06 00:00:00',
      }),
    });
  });

  await page.route('**/api/v1/tables/upsert', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        message: 'Table saved',
        data: { table_code: 'A2', table_name: 'Table A2', qr_token: 'tok' },
        server_time: '2026-03-06 00:00:00',
      }),
    });
  });

  await page.route('**/api/v1/reports/summary', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        message: 'OK',
        data: { date: '2026-03-06', orders_count: 10, sales_total: 100000 },
        server_time: '2026-03-06 00:00:00',
      }),
    });
  });

  await page.route('**/api/v1/reports/shift*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        message: 'OK',
        data: { orders_total: 10, void_count: 1 },
        server_time: '2026-03-06 00:00:00',
      }),
    });
  });

  await page.goto('/login');
  await page.getByPlaceholder('Username').fill('admin');
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText('Dashboard Admin POS')).toBeVisible();

  await page.goto('/tables');
  await expect(page.getByRole('heading', { name: 'Tables' })).toBeVisible();
  await page.getByRole('button', { name: 'Save + Rotate QR' }).click();

  await page.goto('/reports');
  await page.getByRole('button', { name: 'Load Summary' }).click();
  await expect(page.getByText('orders_count')).toBeVisible();
});
