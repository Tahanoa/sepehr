import { Modal } from '../components/modal';
import { createElement } from '../utils/dom';
import { applyTheme, defaultTheme, palettes, readTheme, saveTheme, ThemeSettings, validateTheme } from './theme';

/** Local appearance preferences. Does not claim to persist organization branding to a server. */
export function createThemePanel(): HTMLElement {
  const root = createElement('section', { className: 'sepehr-panel theme-panel' });
  const title = createElement('h2', { textContent: 'ظاهر سپهر', className: 'sepehr-section-title' });
  const description = createElement('p', { textContent: 'رنگ، فونت و تراکم را با پیش‌نمایش زنده انتخاب کنید. این تنظیمات در همین مرورگر ذخیره می‌شوند.', className: 'sepehr-muted' });
  let draft = readTheme();
  const form = document.createElement('form');
  const fields = document.createElement('div'); fields.className = 'theme-fields';
  const status = createElement('p', { attributes: { role: 'status', 'aria-live': 'polite' }, className: 'sepehr-muted' });
  const controls: Record<string, HTMLInputElement | HTMLSelectElement> = {};
  function select(name: keyof ThemeSettings, label: string, options: Record<string, string>) {
    const wrapper = document.createElement('label'); wrapper.className = 'theme-field';
    wrapper.append(document.createTextNode(label));
    const input = document.createElement('select');
    for (const [value, text] of Object.entries(options)) { const option = document.createElement('option'); option.value = value; option.textContent = text; input.append(option); }
    controls[name] = input; wrapper.append(input); fields.append(wrapper);
  }
  select('palette', 'تم آماده', Object.fromEntries(Object.entries(palettes).map(([k, v]) => [k, v.label])));
  select('font', 'فونت', { vazirmatn: 'وزیرمتن', system: 'فونت دستگاه' });
  select('density', 'تراکم اطلاعات', { comfortable: 'راحت', compact: 'فشرده' });
  select('radius', 'گوشهٔ اجزا', { soft: 'نرم', crisp: 'کم‌انحنا' });
  for (const [name, label] of [['primary', 'رنگ اصلی'], ['accent', 'رنگ تأکیدی']]) {
    const wrapper = document.createElement('label'); wrapper.className = 'theme-field'; wrapper.append(document.createTextNode(label!));
    const input = document.createElement('input'); input.type = 'color'; controls[name!] = input; wrapper.append(input); fields.append(wrapper);
  }
  function sync() { for (const [name, control] of Object.entries(controls)) control.value = String(draft[name as keyof ThemeSettings]); }
  sync();
  form.addEventListener('input', e => {
    if (e.target === controls.palette) {
      const palette = controls.palette!.value as ThemeSettings['palette'];
      draft = { ...draft, palette, primary: palettes[palette].primary, accent: palettes[palette].accent }; sync();
    }
    const candidate = { version: 1, ...Object.fromEntries(Object.entries(controls).map(([k, v]) => [k, v.value])) };
    try { draft = validateTheme(candidate); applyTheme(draft); status.textContent = 'پیش‌نمایش فعال است؛ برای نگه داشتن تغییرات، ذخیره کنید.'; } catch (error) { status.textContent = (error as Error).message; }
  });
  const preview = createElement('div', { className: 'theme-preview' });
  preview.innerHTML = '<span class="sepehr-eyebrow">پیش‌نمایش اجزا</span><h3 class="sepehr-section-title">یک تجربهٔ هماهنگ، با سلیقهٔ شما</h3><p class="sepehr-muted">رنگ وضعیت‌ها مستقل از هویت برند باقی می‌ماند.</p><div class="flex flex-wrap gap-3"><span class="sepehr-primary">اقدام اصلی</span><span class="sepehr-accent">اقدام پیشنهادی</span><span class="text-emerald-800 bg-emerald-50 rounded-lg p-2">ذخیره شد</span></div>';
  const actions = createElement('div', { className: 'flex flex-wrap gap-3' });
  function button(text: string, action: () => void) { const b = createElement('button', { textContent: text, className: 'sepehr-secondary', attributes: { type: 'button' } }); b.addEventListener('click', action); actions.append(b); }
  const save = createElement('button', { textContent: 'ذخیرهٔ ظاهر', className: 'sepehr-primary', attributes: { type: 'submit' } }); actions.append(save);
  form.addEventListener('submit', e => { e.preventDefault(); try {
    draft = validateTheme({ version: 1, ...Object.fromEntries(Object.entries(controls).map(([k, v]) => [k, v.value])) });
    status.textContent = saveTheme(draft) ? 'ظاهر ذخیره شد.' : 'ظاهر اعمال شد؛ ذخیره در مرورگر در دسترس نیست.';
  } catch(error) { status.textContent = (error as Error).message; } });
  button('بازگشت به ظاهر ذخیره‌شده', () => { draft = readTheme(); sync(); applyTheme(draft); status.textContent = 'ظاهر ذخیره‌شده بازیابی شد.'; });
  button('پیش‌فرض سپهر', () => { draft = { ...defaultTheme }; sync(); applyTheme(draft); status.textContent = 'پیش‌نمایش پیش‌فرض فعال شد؛ برای نگه داشتن، ذخیره کنید.'; });
  button('خروجی فایل تم', () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'sepehr-theme.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  const upload = document.createElement('input'); upload.type = 'file'; upload.accept = '.json,application/json'; upload.hidden = true;
  button('ورود فایل تم', () => upload.click());
  upload.addEventListener('change', async () => {
    const file = upload.files?.[0]; if (!file) return;
    try { if (file.size > 16384) throw new Error('حجم فایل تم بیش از حد مجاز است.'); draft = validateTheme(JSON.parse(await file.text())); sync(); applyTheme(draft); status.textContent = 'تم وارد شد؛ برای نگه داشتن، ذخیره کنید.'; } catch(error) { status.textContent = (error as Error).message; }
    upload.value = '';
  });
  form.append(fields, preview, actions, upload, status); root.append(title, description, form); return root;
}
export function openThemePanel(): void {
  const saved = readTheme();
  const modal = new Modal({ title: 'تنظیم ظاهر', content: createThemePanel(), confirmText: 'بستن', onClose: () => applyTheme(readTheme()) });
  applyTheme(saved); modal.open();
}
