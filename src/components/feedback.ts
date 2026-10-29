import { Modal } from './modal';
import { createElement as el } from '../utils/dom';
import { showToast } from './toast';

/** Nonblocking decisions; cancel, Escape and backdrop all resolve safely. */
export function confirmAction(message: string, confirmText = 'ادامه می‌دهم'): Promise<boolean> {
  return new Promise(resolve => {
    const modal = new Modal({ title: 'پیش از ادامه', content: el('p', { textContent: message, className: 'decision-copy' }), confirmText, cancelText: 'انصراف', onConfirm: () => resolve(true), onClose: () => resolve(false) });
    modal.open();
  });
}
export function requestText(message: string, value = ''): Promise<string | null> {
  return new Promise(resolve => {
    const content = el('div', { className: 'workspace-page' });
    const label = el('label', { textContent: message, className: 'workspace-field' });
    const input = el('textarea', { attributes: { rows: '5', maxlength: '4000', 'aria-label': message } });
    input.value = value; label.append(input); content.append(label);
    const error = el('p', { attributes: { role: 'alert' }, className: 'field-error' }); content.append(error);
    const modal = new Modal({ title: 'پیام به خانواده', content, confirmText: 'ثبت پیام محلی', cancelText: 'انصراف', onConfirm: () => { if (!input.value.trim()) { error.textContent = 'متن پیام را وارد کنید.'; input.focus(); return false; } resolve(input.value.trim()); return true; }, onClose: () => resolve(null) });
    modal.open(); input.focus();
  });
}
export function notify(message: string): void { showToast({ title: 'سپهر', message, type: 'info' }); }
/** Navigation is cancelled synchronously; the router supplies a retry for async decisions. */
export function protectUnsaved(isDirty: () => boolean, discard: () => void): void {
  let pending = false;
  const leave = (event: Event) => {
    if (!isDirty()) return;
    event.preventDefault();
    if (pending) return;
    pending = true;
    void confirmAction('تغییرات ذخیره نشده‌اند. با خروج، این تغییرات کنار گذاشته می‌شوند.', 'کنار گذاشتن و خروج').then(ok => {
      pending = false;
      if (ok) { discard(); (event as CustomEvent<{retry: () => void}>).detail?.retry(); }
    });
  };
  window.addEventListener('sepehr-before-navigate', leave);
  window.addEventListener('sepehr-route-leave', () => window.removeEventListener('sepehr-before-navigate', leave), { once: true });
}
