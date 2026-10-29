// Run against the Vite dev server: node tests/redesign.mjs
import { chromium } from 'playwright';
import { createServer } from 'vite';
import assert from 'node:assert/strict';
const server = await createServer({ server: { host: '127.0.0.1', port: 4174, strictPort: true } });
await server.listen();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = []; page.on('pageerror', e => errors.push(e.message));
try {
  await page.goto('http://127.0.0.1:4174/app/org-101/overview');
  await page.getByRole('button', { name: 'تنظیم رنگ و ظاهر سپهر' }).click();
  const dialog = page.getByRole('dialog', { name: 'تنظیم ظاهر', exact: true });
  await dialog.getByLabel('تم آماده').selectOption('ocean');
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim()), '24 63 112');
  await dialog.getByLabel('تراکم اطلاعات').selectOption('compact');
  await dialog.getByLabel('گوشهٔ اجزا').selectOption('crisp');
  await dialog.getByRole('button', { name: 'ذخیرهٔ ظاهر', exact: true }).click();
  await page.keyboard.press('Escape');
  await page.reload();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.density), 'compact');
  assert.equal(await page.evaluate(() => document.documentElement.dataset.radius), 'crisp');
  await page.getByRole('button', { name: 'تنظیم رنگ و ظاهر سپهر' }).click();
  await dialog.getByLabel('تم آماده').selectOption('plum');
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim()), '24 63 112', 'unsaved previews must revert');
  await page.evaluate(async () => {
    const { validateTheme, defaultTheme, palettes, applyTheme } = await import('/src/theme/theme.ts');
    for (const [palette, colors] of Object.entries(palettes)) validateTheme({ ...defaultTheme, palette, primary: colors.primary, accent: colors.accent });
    for (const invalid of [{...defaultTheme, primary:'#ffffff'}, {...defaultTheme, version:99}, {...defaultTheme, palette:'__proto__'}, {...defaultTheme, primary:'red'}]) {
      let rejected = false; try { validateTheme(invalid); } catch { rejected = true; } if (!rejected) throw Error('invalid theme accepted');
    }
    applyTheme(defaultTheme);
    localStorage.setItem('polaris_demo_user_id','usr-sec-student');
    localStorage.setItem('polaris_active_membership_id','mem-student-101');
  });
  await page.reload();
  await page.getByRole('heading', { name: 'از اینجا ادامه بده' }).waitFor();
  await page.screenshot({ path: '/tmp/sepehr-desktop.png', fullPage: true, animations: 'disabled' });
  await page.evaluate(async () => {
    const { resolveLearner, assignmentDateKey } = await import('/src/pages/dashboard/student/student-overview.ts');
    if (resolveLearner([{ fullName:'پارسا تهرانی',studentCode:'1' }],{name:'پارسا تهرانی (فراگیر)'})?.studentCode !== '1') throw Error('learner normalization');
    if (resolveLearner([{ fullName:'دیگری',studentCode:'1' }],{name:'ناشناس'})) throw Error('unrelated student selected');
    if (assignmentDateKey('۱۴۰۳/۲/۹') !== '1403-02-09') throw Error('Persian date sorting');
  });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'student home overflows');
    await page.getByRole('button', { name: 'باز کردن منوی اصلی' }).click();
    await page.getByRole('button', { name: 'بستن منو', exact: true }).click();
    assert.equal(await page.locator('#mobile-drawer-root').count(), 0, 'closed drawer remains in DOM');
    await page.getByRole('button', { name: 'تنظیم رنگ و ظاهر سپهر' }).click();
    await dialog.getByLabel('تم آماده').selectOption('sepehr');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => !!document.activeElement.closest('[role=dialog]')), true, 'modal focus escaped');
    await page.screenshot({ path: `/tmp/sepehr-mobile-${width}.png`, fullPage: true, animations: 'disabled' });
    await page.keyboard.press('Escape');
  }
  assert.deepEqual(errors, []);
  console.log('PASS: theme palettes, validation, persistence, preview rollback, learner identity, dates, desktop/mobile layout and drawer/modal interaction');
} finally { await browser.close(); await server.close(); }
