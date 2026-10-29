/** Theme packages are data, never page-specific styles. RGB channels support Tailwind opacity. */
export const palettes = {
  sepehr: { label: 'سبز سپهر', primary: '#012622', hover: '#003B36', accent: '#E98A15', secondary: '#59114D', subtle: '#ECE5F0' },
  ocean: { label: 'آبی اقیانوس', primary: '#183F70', hover: '#24558F', accent: '#F0BC65', secondary: '#635992', subtle: '#EDF3FA' },
  plum: { label: 'ارغوان', primary: '#553451', hover: '#70476B', accent: '#EDBD85', secondary: '#38685F', subtle: '#F7F0F5' },
} as const;
export interface ThemeSettings {
  version: 1;
  palette: keyof typeof palettes;
  density: 'comfortable' | 'compact';
  font: 'vazirmatn' | 'system';
  radius: 'soft' | 'crisp';
  primary: string;
  accent: string;
}
export const defaultTheme: ThemeSettings = { version: 1, palette: 'sepehr', density: 'comfortable', font: 'vazirmatn', radius: 'soft', primary: palettes.sepehr.primary, accent: palettes.sepehr.accent };
const key = 'sepehr.theme.v1';
export function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const rgb = hex.match(/[a-f\d]{2}/gi)!.map(c => parseInt(c, 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
    return rgb[0]! * .2126 + rgb[1]! * .7152 + rgb[2]! * .0722;
  };
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
export function validateTheme(value: unknown): ThemeSettings {
  if (!value || typeof value !== 'object') throw new Error('فایل تم معتبر نیست.');
  const v = value as Record<string, unknown>;
  if (v.version !== 1 || !Object.hasOwn(palettes, String(v.palette)) || !['comfortable','compact'].includes(String(v.density)) || !['vazirmatn','system'].includes(String(v.font)) || !['soft','crisp'].includes(String(v.radius)) || !/^#[\da-f]{6}$/i.test(String(v.primary)) || !/^#[\da-f]{6}$/i.test(String(v.accent))) throw new Error('ساختار یا نسخهٔ فایل تم پشتیبانی نمی‌شود.');
  if (contrast(String(v.primary), '#FFFFFF') < 4.5 || contrast(String(v.accent), '#18201F') < 4.5) throw new Error('رنگ انتخابی خوانایی کافی ندارد؛ رنگ اصلی را تیره‌تر و رنگ تأکیدی را روشن‌تر انتخاب کنید.');
  return { version: 1, palette: v.palette as ThemeSettings['palette'], density: v.density as ThemeSettings['density'], font: v.font as ThemeSettings['font'], radius: v.radius as ThemeSettings['radius'], primary: String(v.primary), accent: String(v.accent) };
}
export function readTheme(): ThemeSettings {
  try { const saved=JSON.parse(localStorage.getItem(key) || 'null'); if(saved?.palette==='sepehr' && saved.primary==='#123E38' && saved.accent==='#E5AE58'){saved.primary=palettes.sepehr.primary;saved.accent=palettes.sepehr.accent;} return validateTheme(saved); } catch { return { ...defaultTheme }; }
}
export function applyTheme(settings: ThemeSettings): void {
  const t = validateTheme(settings), p = palettes[t.palette], root = document.documentElement;
  const channels = (hex: string) => hex.match(/[a-f\d]{2}/gi)!.map(c => parseInt(c, 16)).join(' ');
  for (const [name, value] of Object.entries({ primary: t.primary, hover: t.primary === p.primary ? p.hover : t.primary, accent: t.accent, secondary: p.secondary, subtle: p.subtle })) root.style.setProperty(`--theme-${name}`, channels(value));
  root.dataset.density = t.density;
  root.dataset.radius = t.radius;
  root.style.setProperty('--font-family-base', t.font === 'system' ? "Tahoma, 'Segoe UI', sans-serif" : "'Vazirmatn', Tahoma, sans-serif");
}
export function saveTheme(settings: ThemeSettings): boolean {
  const t = validateTheme(settings);
  applyTheme(t);
  try { localStorage.setItem(key, JSON.stringify(t)); return true; } catch { return false; }
}

