import { createElement as el } from '../utils/dom';
export { el };
export function button(label: string, action: () => void, primary = false): HTMLButtonElement {
  const b = el('button', { textContent: label, className: primary ? 'sepehr-primary' : 'sepehr-secondary', attributes: { type: 'button' } }); b.addEventListener('click', action); return b;
}
export function field(label: string, input: HTMLElement): HTMLLabelElement { const wrap = el('label', { className: 'workspace-field' }); wrap.append(el('span', { textContent: label }), input); return wrap; }
export function select(items: { id: string; name: string }[], value: string, change: (value: string) => void): HTMLSelectElement {
  const s = el('select'); for (const item of items) s.append(el('option', { textContent: item.name, attributes: { value: item.id } })); s.value = value; s.addEventListener('change', () => change(s.value)); return s;
}
export function input(value: string, type = 'text'): HTMLInputElement { const i = el('input', { attributes: { type } }); i.value = value; return i; }
export function heading(title: string, description: string): HTMLElement { const h = el('header', { className: 'space-y-2' }); h.append(el('h2', { textContent: title, className: 'text-2xl font-bold' }), el('p', { textContent: description, className: 'sepehr-muted' })); return h; }
export function panel(): HTMLElement { return el('section', { className: 'sepehr-panel space-y-4' }); }
export function status(): HTMLParagraphElement { return el('p', { className: 'sepehr-muted', attributes: { role: 'status', 'aria-live': 'polite' } }); }
export function guard(message: HTMLElement, action: () => void): void { try { action(); } catch (e) { message.textContent = (e as Error).message; } }
export function navigate(org: string, path: string): void { window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: `/app/${org}/${path}` })); }
export function table(headers: string[]): { wrap: HTMLElement; body: HTMLTableSectionElement } {
  const wrap = el('div', { className: 'workspace-table', attributes: { tabindex: '0', 'aria-label': 'جدول؛ برای دیدن ستون‌های دیگر پیمایش کنید' } }), t = el('table'), head = el('thead'), row = el('tr'), body = el('tbody');
  headers.forEach(h => row.append(el('th', { textContent: h, attributes: { scope: 'col' } }))); head.append(row); t.append(head, body); wrap.append(t); return { wrap, body };
}
export function isoToday(): string { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
export function faDate(date: string): string { const d = new Date(date + 'T12:00:00'); return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString('fa-IR'); }
