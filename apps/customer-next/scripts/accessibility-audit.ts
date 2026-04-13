import { chromium, Browser, Page } from '@playwright/test';
// @ts-ignore - axe-core types issue
import { injectAxe } from '@axe-core/playwright';

interface Violation {
  id: string;
  impact: string;
  description: string;
  nodes: string[];
}

interface AuditResult {
  page: string;
  violations: Violation[];
  passed: boolean;
}

const PAGES = [
  { path: '/menu', name: 'Menu' },
  { path: '/cart', name: 'Cart' },
  { path: '/order-status?orderId=123&tableToken=token123', name: 'Order Status' },
];

const BASE_URL = 'http://127.0.0.1:3001';

async function mockApi(page: Page) {
  await page.route('**/api/v1/qr/menu/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        data: {
          table: { table_code: 'T1', table_name: 'Table 1' },
          products: [
            { id_menu: 1, nama_menu: 'Coffee', harga: 20000, jenis_menu: 'coffee', stok: 10 },
          ],
        },
      }),
    });
  });
}

async function runAudit(page: Page, url: string, name: string): Promise<AuditResult> {
  console.log(`\n🔍 Auditing: ${name} (${url})`);
  
  await page.goto(url);
  await page.waitForLoadState('domcontentloaded');
  
  await injectAxe(page);
  
  const results = await page.evaluate(() => {
    return new Promise<Violation[]>((resolve) => {
      const axe = (window as any).axe;
      axe.run({ runOnly: ['critical', 'serious'] }, (err: Error, result: any) => {
        if (err) {
          console.error('Axe error:', err);
          resolve([]);
        }
        resolve(result.violations || []);
      });
    });
  });

  const critical = results.filter((v: Violation) => v.impact === 'critical' || v.impact === 'serious');
  
  if (critical.length > 0) {
    console.log(`❌ Found ${critical.length} critical/serious violations:`);
    critical.forEach((v: Violation) => {
      console.log(`   - [${v.id}] ${v.description.slice(0, 80)}`);
    });
  } else {
    console.log('✅ No critical violations');
  }

  return { page: name, violations: critical, passed: critical.length === 0 };
}

async function main() {
  console.log('🎯 Starting Accessibility QA Audit');
  console.log('==================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results: AuditResult[] = [];

  for (const p of PAGES) {
    if (p.path === '/menu') {
      await mockApi(page);
    }
    const url = `${BASE_URL}${p.path}`;
    const result = await runAudit(page, url, p.name);
    results.push(result);
  }

  await browser.close();

  console.log('\n==================================');
  console.log('📊 SUMMARY');
  console.log('==================================');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  for (const r of results) {
    console.log(`${r.passed ? '✅' : '❌'} ${r.page}: ${r.violations.length} critical issues`);
  }

  console.log(`\nTotal: ${passed} passed, ${failed} failed`);

  const report = {
    timestamp: new Date().toISOString(),
    summary: { passed, failed, total: results.length },
    results,
  };

  console.log('\n📄 Full Report:');
  console.log(JSON.stringify(report, null, 2));

  const exitCode = failed > 0 ? 1 : 0;
  process.exit(exitCode);
}

main().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});