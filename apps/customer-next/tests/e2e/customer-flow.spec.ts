import { test, expect } from '@playwright/test';

test('customer qr flow: menu -> cart -> place order -> status', async ({ page }) => {
  await page.route('**/api/v1/qr/menu/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        message: 'OK',
        data: {
          table: { table_code: 'A1', table_name: 'Table A1' },
          products: [{ id_menu: 1, nama_menu: 'Espresso', stok: 10, harga: 18000 }],
        },
        server_time: '2026-03-06 00:00:00',
      }),
    });
  });

  await page.route('**/api/v1/qr/place-order', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        message: 'Order QR berhasil dibuat',
        data: { order_id: 123, order_no: 'ORD-TEST', status: 'new', total_amount: 18000 },
        server_time: '2026-03-06 00:00:00',
      }),
    });
  });

  await page.route('**/api/v1/qr/order-status/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        message: 'OK',
        data: { order_id: 123, order_no: 'ORD-TEST', status: 'new', total_amount: 18000 },
        server_time: '2026-03-06 00:00:00',
      }),
    });
  });

  await page.goto('/');
  await page.getByPlaceholder('table_token').fill('token-a1');
  await page.getByRole('button', { name: 'Lihat Menu' }).click();

  await expect(page.getByText('Menu Meja')).toBeVisible();
  await page.getByRole('button', { name: 'Tambah' }).click();
  await page.getByRole('button', { name: 'Lihat Cart' }).click();

  await expect(page.getByText('Cart')).toBeVisible();
  await page.getByRole('button', { name: 'Place Order' }).click();

  await expect(page.getByText('Status Order')).toBeVisible();
  await expect(page.getByText('Order #123')).toBeVisible();
});
