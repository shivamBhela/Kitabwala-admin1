import { chromium, devices } from 'playwright';
import fs from 'fs';
import path from 'path';

const URL = 'http://localhost:3000';
const OUT_DIR = path.join(process.cwd(), 'docs', 'evidence', 'screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const tabs = [
  'dashboard', 'orders', 'products', 'vendors', 'users', 'delivery',
  'pincodes', 'returns', 'withdrawals', 'coupons', 'banners', 'pins',
  'reviews', 'support', 'exams', 'settings', 'static-pages',
  'notifications', 'audit-logs', 'email-logs', 'migration-logs', 'schema-ref'
];

const tabLabels = {
  'dashboard': 'Dashboard',
  'orders': 'Orders Management',
  'products': 'Products & Books',
  'vendors': 'Vendor Partners',
  'users': 'Users & Wallet',
  'delivery': 'Same-Day & Delivery',
  'pincodes': 'Pincodes & COD Rules',
  'returns': 'Return Requests',
  'withdrawals': 'Vendor Payouts',
  'coupons': 'Coupons & Offers',
  'banners': 'Homepage Banners',
  'pins': 'Homepage Pin Overrides',
  'reviews': 'Product Reviews',
  'support': 'Support & Issues',
  'exams': 'Competitive Exams',
  'settings': 'Platform Settings',
  'static-pages': 'Static Legal Pages',
  'notifications': 'Push Notifications',
  'audit-logs': 'Admin Audit Logs',
  'email-logs': 'Outgoing Email Logs',
  'migration-logs': 'Migration Logs',
  'schema-ref': 'Prisma Schema Ref'
};

async function capture() {
  console.log('Launching browser...');
  const browser = await chromium.launch();
  
  const contexts = [
    { name: 'Desktop-Light', ...devices['Desktop Chrome'], colorScheme: 'light' },
    { name: 'Desktop-Dark', ...devices['Desktop Chrome'], colorScheme: 'dark' },
    { name: 'Mobile-Light', ...devices['Pixel 5'], colorScheme: 'light' },
    { name: 'Mobile-Dark', ...devices['Pixel 5'], colorScheme: 'dark' },
  ];

  for (const ctx of contexts) {
    console.log(`Starting context: ${ctx.name}`);
    const context = await browser.newContext(ctx);
    const page = await context.newPage();
    
    await page.goto(URL);
    await page.waitForLoadState('networkidle');

    for (const tab of tabs) {
      console.log(`  Capturing tab: ${tab}`);
      const label = tabLabels[tab];
      try {
        await page.evaluate((lbl) => {
          const buttons = Array.from(document.querySelectorAll('aside button'));
          const btn = buttons.find(b => b.textContent && b.textContent.includes(lbl));
          if (btn) btn.click();
        }, label);
        
        await page.waitForTimeout(500); // give it time to render the new state
        await page.screenshot({ path: path.join(OUT_DIR, `${ctx.name}-${tab}.png`), fullPage: true });
      } catch (e) {
        console.error(`  Failed on ${tab}`, e);
      }
    }
    await context.close();
  }
  console.log('Closing browser...');
  await browser.close();
}

capture().catch(console.error);
