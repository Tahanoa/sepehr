import { createElement as el } from '../utils/dom';
export interface ToastOptions {
  title: string; message: string; type?: 'success' | 'warning' | 'error' | 'info' | 'loading';
  duration?: number; position?: 'top' | 'bottom'; action?: { label: string; onClick: () => void };
}
export function showToast(options: ToastOptions): () => void {
  const position = options.position || 'bottom';
  let container = document.querySelector<HTMLElement>(`.toast-stack[data-position="${position}"]`);
  if (!container) { container = el('div', { className: 'toast-stack', attributes: { 'data-position': position, 'aria-label': 'اعلان‌ها' } }); document.body.append(container); }
  const type = options.type || 'info';
  const toast = el('div', { className: `product-toast toast-${type}`, attributes: { role: type === 'error' ? 'alert' : 'status', 'aria-atomic': 'true' } });
  const icon = el('span', { className: 'toast-symbol', textContent: ({ success: '✓', error: '!', warning: '!', info: 'i', loading: '◌' })[type], attributes: { 'aria-hidden': 'true' } });
  const copy = el('div'); copy.append(el('strong', { textContent: options.title }), el('p', { textContent: options.message }));
  let timer: ReturnType<typeof setTimeout> | undefined;
  const dismiss = () => { clearTimeout(timer); toast.classList.add('toast-exit'); setTimeout(() => toast.remove(), 180); };
  const close = el('button', { textContent: '×', attributes: { type: 'button', 'aria-label': 'بستن اعلان' } }); close.addEventListener('click', dismiss);
  if (options.action) { const action = el('button', { textContent: options.action.label, className: 'toast-action' }); action.addEventListener('click', () => { options.action!.onClick(); dismiss(); }); copy.append(action); }
  toast.append(icon, copy, close); container.append(toast);
  while (container.children.length > 4) container.firstElementChild?.remove();
  const duration = options.duration ?? (type === 'loading' ? 0 : 6000);
  const schedule = () => { if (duration > 0) timer = setTimeout(dismiss, duration); };
  toast.addEventListener('mouseenter', () => clearTimeout(timer)); toast.addEventListener('mouseleave', schedule);
  toast.addEventListener('focusin', () => clearTimeout(timer)); toast.addEventListener('focusout', schedule); schedule();
  return dismiss;
}
