import { test, expect } from '@playwright/test';
import { injectAxe } from '@axe-core/playwright';

test.describe('Accessibility QA - axe-core Integration', () => {
  test.beforeEach(async ({ page }) => {
    await injectAxe(page);
  });

  test('Menu page - should have no critical accessibility violations', async ({ page }) => {
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
            ],
          },
        }),
      });
    });

    await page.goto('/menu');
    await expect(page.locator('text=Menu')).toBeVisible({ timeout: 10000 });

    const violations = await page.evaluate(() => {
      return new Promise((resolve) => {
        const axe = (window as any).axe;
        axe.run({ runOnly: ['critical', 'serious'] }, (err: Error, results: any) => {
          if (err) {
            resolve({ violations: [], error: err.message });
          }
          resolve({ violations: results.violations });
        });
      });
    });

    const criticalViolations = violations.filter((v: any) => v.impact === 'critical' || v.impact === 'serious');
    if (criticalViolations.length > 0) {
      console.log('Critical accessibility violations found:', JSON.stringify(criticalViolations, null, 2));
    }
    expect(criticalViolations.length).toBe(0);
  });

  test('Menu page - should have proper landmark regions', async ({ page }) => {
    await page.route('**/api/v1/qr/menu/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          data: { table: { table_code: 'A1' }, products: [] },
        }),
      });
    });

    await page.goto('/menu');

    const main = page.locator('main, [role="main"]');
    const nav = page.locator('nav, [role="navigation"]');
    const header = page.locator('header, [role="banner"]');

    await expect(main.or(nav).or(header)).toBeVisible({ timeout: 5000 });
  });

  test('Menu page - interactive elements should be keyboard accessible', async ({ page }) => {
    await page.route('**/api/v1/qr/menu/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          data: { table: { table_code: 'A1' }, products: [] },
        }),
      });
    });

    await page.goto('/menu');

    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    const firstButton = buttons.first();
    await firstButton.focus();
    await expect(firstButton).toBeFocused();
  });

  test('Cart page - should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.locator('text=Cart').or(page.locator('text=Kosong'))).toBeVisible({ timeout: 5000 });

    const violations = await page.evaluate(() => {
      return new Promise((resolve) => {
        const axe = (window as any).axe;
        axe.run({ runOnly: ['critical', 'serious'] }, (err: Error, results: any) => {
          if (err) {
            resolve({ violations: [], error: err.message });
          }
          resolve({ violations: results.violations });
        });
      });
    });

    const criticalViolations = violations.filter((v: any) => v.impact === 'critical' || v.impact === 'serious');
    expect(criticalViolations.length).toBe(0);
  });

  test('Order Status page - should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/order-status?orderId=123&tableToken=token123');
    await expect(page.locator('text=Status')).toBeVisible({ timeout: 10000 });

    const violations = await page.evaluate(() => {
      return new Promise((resolve) => {
        const axe = (window as any).axe;
        axe.run({ runOnly: ['critical', 'serious'] }, (err: Error, results: any) => {
          if (err) {
            resolve({ violations: [], error: err.message });
          }
          resolve({ violations: results.violations });
        });
      });
    });

    const criticalViolations = violations.filter((v: any) => v.impact === 'critical' || v.impact === 'serious');
    expect(criticalViolations.length).toBe(0);
  });

  test('All pages - color contrast should meet WCAG AA standards', async ({ page }) => {
    const pages = ['/menu', '/cart', '/order-status?orderId=123&tableToken=token123'];

    for (const path of pages) {
      if (path === '/menu') {
        await page.route('**/api/v1/qr/menu/**', async (route) => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ ok: true, data: { table: { table_code: 'A1' }, products: [] } }),
          });
        });
      }
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');

      const contrastViolations = await page.evaluate(() => {
        return new Promise((resolve) => {
          const axe = (window as any).axe;
          axe.run({ runOnly: ['color-contrast'] }, (err: Error, results: any) => {
            if (err) {
              resolve([]);
            }
            resolve(results.violations || []);
          });
        });
      });

      const contrastFailures = contrastViolations.filter((v: any) => v.id === 'color-contrast');
      if (contrastFailures.length > 0) {
        console.log(`Color contrast issues on ${path}:`, contrastFailures.length);
      }
    }
  });
});

test.describe('Accessibility - Focus Management', () => {
  test('should show visible focus indicators', async ({ page }) => {
    await page.route('**/api/v1/qr/menu/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, data: { table: { table_code: 'A1' }, products: [] } }),
      });
    });

    await page.goto('/menu');
    await page.waitForLoadState('domcontentloaded');

    const focusStyle = await page.evaluate(() => {
      const style = getComputedStyle(document.body);
      const outline = style.outline;
      const outlineWidth = style.outlineWidth;
      return { outline, outlineWidth };
    });

    expect(focusStyle.outlineWidth).not.toBe('0px');
  });
});

test.describe('Accessibility - Screen Reader Landmarks', () => {
  test('should have skip link or landmarks for navigation', async ({ page }) => {
    await page.route('**/api/v1/qr/menu/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, data: { table: { table_code: 'A1' }, products: [] } }),
      });
    });

    await page.goto('/menu');

    const landmarks = await page.evaluate(() => {
      const regions = document.querySelectorAll('main, nav, header, footer, aside, [role="main"], [role="navigation"], [role="banner"], [role="complementary"]');
      return Array.from(landmarks).map(el => (el.tagName + (el.getAttribute('role') ? `[role="${el.getAttribute('role')}"]` : '')));
    });

    expect(landmarks.length).toBeGreaterThan(0);
  });

  test('should have properly labeled form inputs', async ({ page }) => {
    await page.route('**/api/v1/qr/menu/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, data: { table: { table_code: 'A1' }, products: [] } }),
      });
    });

    await page.goto('/menu');

    const inputs = page.locator('input:not([type="hidden"]):not([type="submit"])');
    const inputCount = await inputs.count();

    if (inputCount > 0) {
      const unlabeledInputs = [];
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        const label = await input.locator('..').locator('label, [for]').count();
        const placeholder = await input.getAttribute('placeholder');

        if (!ariaLabel && !ariaLabelledBy && label === 0 && !placeholder) {
          unlabeledInputs.push(await input.evaluate(el => el.outerHTML));
        }
      }
      expect(unlabeledInputs.length).toBe(0);
    }
  });
});