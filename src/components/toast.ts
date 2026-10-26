/**
 * POLARIS TOAST NOTIFICATION COMPONENT
 * Feedback banner notifications with auto-dismissal.
 */

import { createElement } from '../utils/dom';

export interface ToastOptions {
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  duration?: number; // in ms
}

class ToastContainer {
  private static instance: ToastContainer;
  private containerEl: HTMLElement;

  private constructor() {
    this.containerEl = createElement('div', { className: 'polaris-toast-container' });
    document.body.appendChild(this.containerEl);
  }

  public static getInstance(): ToastContainer {
    if (!ToastContainer.instance) {
      ToastContainer.instance = new ToastContainer();
    }
    return ToastContainer.instance;
  }

  public show(options: ToastOptions): void {
    const { title, message, type = 'info', duration = 4000 } = options;

    const toast = createElement('div', { className: `polaris-toast polaris-toast--${type}` });

    const content = createElement('div', { className: 'polaris-toast-content' });
    const titleEl = createElement('div', { className: 'polaris-toast-title', textContent: title });
    const messageEl = createElement('div', { className: 'polaris-toast-message', textContent: message });

    content.appendChild(titleEl);
    content.appendChild(messageEl);
    toast.appendChild(content);

    this.containerEl.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease-in';
        setTimeout(() => {
          if (toast.parentNode === this.containerEl) {
            this.containerEl.removeChild(toast);
          }
        }, 300);
      }, duration);
    }
  }
}

export function showToast(options: ToastOptions): void {
  ToastContainer.getInstance().show(options);
}
