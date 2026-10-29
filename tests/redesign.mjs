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
  await dialog.locator('select').and(dialog.getByLabel('تم آماده', {exact:true})).selectOption('ocean', {force:true});
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim()), '24 63 112');
  await dialog.locator('select').and(dialog.getByLabel('تراکم اطلاعات', {exact:true})).selectOption('compact', {force:true});
  await dialog.locator('select').and(dialog.getByLabel('گوشهٔ اجزا', {exact:true})).selectOption('crisp', {force:true});
  await dialog.getByRole('button', { name: 'ذخیرهٔ ظاهر', exact: true }).click();
  await page.keyboard.press('Escape');
  await page.reload();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.density), 'compact');
  assert.equal(await page.evaluate(() => document.documentElement.dataset.radius), 'crisp');
  await page.getByRole('button', { name: 'تنظیم رنگ و ظاهر سپهر' }).click();
  await dialog.locator('select').and(dialog.getByLabel('تم آماده', {exact:true})).selectOption('plum', {force:true});
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
    await dialog.locator('select').and(dialog.getByLabel('تم آماده', {exact:true})).selectOption('sepehr', {force:true});
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => !!document.activeElement.closest('[role=dialog]')), true, 'modal focus escaped');
    await page.screenshot({ path: `/tmp/sepehr-mobile-${width}.png`, fullPage: true, animations: 'disabled' });
    await page.keyboard.press('Escape');
  }
  await page.evaluate(() => {localStorage.setItem('polaris_demo_user_id','usr-sec-admin');localStorage.removeItem('polaris_active_membership_id');});
  await page.goto('http://127.0.0.1:4174/app/org-101/grades');
  await page.getByRole('heading', {name:'کارنامه‌های الکترونیک',exact:true}).waitFor();
  await page.getByRole('button',{name:'بستن ورود نمرات دبیران',exact:true}).click();
  await page.getByRole('button',{name:'باز کردن ورود نمرات دبیران',exact:true}).waitFor();
  await page.getByRole('button',{name:'باز کردن ورود نمرات دبیران',exact:true}).click();
  await page.goto('http://127.0.0.1:4174/app/org-101/messages');
  await page.getByRole('heading',{name:'پیام‌رسان',exact:true}).waitFor();
  await page.locator('.inbox-contact').first().click();
  await page.getByLabel('متن پیام').fill('<script>unsafe</script> پیگیری حضور');
  await page.getByRole('button',{name:'ارسال پیام',exact:true}).click();
  await page.getByRole('log').getByText('<script>unsafe</script> پیگیری حضور',{exact:true}).waitFor();
  await page.goto('http://127.0.0.1:4174/app/org-101/attendance');
  await page.getByRole('button',{name:'همه حاضر',exact:true}).click();
  await page.getByRole('button',{name:'ثبت نهایی جلسه',exact:true}).click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'attendance overflow');
  await page.goto('http://127.0.0.1:4174/app/org-101/messages');
  await page.locator('.inbox-contact').first().click();
  await page.getByLabel('متن پیام').fill('پیش‌نویس نگهداری شود');
  await page.getByRole('button',{name:'بازگشت به گفتگوها',exact:true}).click();
  await page.locator('.inbox-contact').first().click();
  assert.equal(await page.getByLabel('متن پیام').inputValue(),'پیش‌نویس نگهداری شود');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'messenger overflow');
  await page.screenshot({path:'/tmp/sepehr-inbox-mobile.png',fullPage:true,animations:'disabled'});
  await page.evaluate(()=>{localStorage.setItem('polaris_demo_user_id','usr-sec-teacher');localStorage.setItem('polaris_active_membership_id','mem-teacher-101');});
  await page.goto('http://127.0.0.1:4174/app/org-101/grades');
  await page.getByRole('heading',{name:'دفتر نمرات',exact:true}).waitFor();
  await page.locator('select').and(page.getByLabel('روز نمایش در موبایل', {exact:true})).selectOption('0', {force:true});
  assert.equal(await page.locator('.gradebook-grid tbody tr').first().locator('td:visible').count(),1);
  const mark=page.locator('.gradebook-grid tbody tr').first().locator('td:visible input');
  await mark.fill('18');
  const notes=page.locator('.gradebook-grid tbody tr').first().locator('td:visible details');
  await notes.locator('summary').click();
  await notes.locator('textarea').fill('پیشرفت در حل مسئله');
  await page.getByRole('button',{name:'ذخیرهٔ دفتر هفتگی',exact:true}).click();
  await page.reload();
  await page.locator('select').and(page.getByLabel('روز نمایش در موبایل', {exact:true})).selectOption('0', {force:true});
  assert.equal(await page.locator('.gradebook-grid tbody tr').first().locator('td:visible input').inputValue(),'18');
  await page.screenshot({path:'/tmp/sepehr-gradebook-mobile.png',fullPage:true,animations:'disabled'});
  await page.setViewportSize({width:1440,height:1000});
  assert.equal(await page.locator('.gradebook-grid tbody tr').first().locator('td:visible').count(),7);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'desktop gradebook overflow');
  await page.screenshot({path:'/tmp/sepehr-gradebook-desktop.png',fullPage:true,animations:'disabled'});
  const name=await page.locator('.gradebook-grid tbody tr th').first().textContent();
  await page.getByLabel('جستجوی دانش‌آموز').fill('نام ناموجود');
  assert.equal(await page.locator('.gradebook-grid tbody tr:visible').count(),0);
  await page.getByLabel('جستجوی دانش‌آموز').fill(name);
  assert.ok(await page.locator('.gradebook-grid tbody tr:visible').count()>0);
  await page.evaluate(async()=>{const {getNavigationForRoleAndOrg}=await import('/src/config/navigation-config.ts');for(const role of ['school_admin','teacher','student','parent','counselor','institute_admin','instructor']){const items=getNavigationForRoleAndOrg(role,'secondary_school','org-101');if(new Set(items.map(i=>i.sectionKey)).size!==items.length)throw Error('duplicate navigation '+role);}});
  for(const width of [320,390,768,1440]) {await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'gradebook overflow '+width);}
  await page.evaluate(()=>{localStorage.setItem('polaris_demo_user_id','usr-sec-admin');localStorage.removeItem('polaris_active_membership_id');});
  await page.goto('http://127.0.0.1:4174/app/org-101/messages');
  await page.locator('.inbox-contact').first().click();
  for(const width of [320,390,768,1440]) {await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'inbox overflow '+width);}
  await page.screenshot({path:'/tmp/sepehr-inbox-desktop.png',fullPage:true,animations:'disabled'});
  assert.deepEqual(errors, []);
  console.log('PASS: themes, navigation uniqueness, gradebook persistence/search/day layout, messaging drafts/text safety, attendance and 320–1440px layout');
} finally { await browser.close(); await server.close(); }

