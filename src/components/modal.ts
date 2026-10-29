/**
 * POLARIS MODAL DIALOG COMPONENT
 * Accessible modal dialog with focus management and keyboard handling.
 */

import { createElement } from '../utils/dom';
import { createButton, createIconButton } from './button';

export interface ModalOptions {
  title: string;
  content: HTMLElement | string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | boolean | Promise<void | boolean>;
  onCancel?: () => void;
  onClose?: () => void;
}

export class Modal {
  private backdropEl: HTMLElement;
  private modalEl: HTMLElement;
  private options: ModalOptions;
  private previousFocus: HTMLElement | null = null;
  private previousOverflow = "";
  private closed = false;
  private keydownListener?: (e: KeyboardEvent) => void;

  constructor(options: ModalOptions) {
    this.options = options;
    this.backdropEl = createElement('div', { className: 'polaris-modal-backdrop' });
    this.modalEl = createElement('div', {
      className: 'polaris-modal',
      attributes: {
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': 'polaris-modal-title',
      },
    });

    this.render();
    this.attachEvents();
  }

  private render(): void {
    // Header
    const header = createElement('div', { className: 'polaris-modal-header' });
    const title = createElement('h3', {
      id: 'polaris-modal-title',
      className: 'polaris-modal-title',
      textContent: this.options.title,
    });

    const closeBtn = createIconButton({
      ariaLabel: 'بستن پنجره',
      iconSvg: `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
      onClick: () => this.close(),
      variant: 'ghost',
    });

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Body
    const body = createElement('div', { className: 'polaris-modal-body' });
    if (typeof this.options.content === 'string') {
      body.innerHTML = this.options.content;
    } else {
      body.appendChild(this.options.content);
    }

    // Footer
    const footer = createElement('div', { className: 'polaris-modal-footer' });

    if (this.options.cancelText) {
      const cancelBtn = createButton({
        label: this.options.cancelText,
        variant: 'outline',
        onClick: () => {
          if (this.options.onCancel) this.options.onCancel();
          this.close();
        },
      });
      footer.appendChild(cancelBtn);
    }

    const confirmText = this.options.confirmText || 'تأیید';
    const confirmBtn = createButton({
      label: confirmText,
      variant: 'primary',
      onClick: async () => {
        if (confirmBtn.disabled) return;
        confirmBtn.disabled = true;
        try { if (await this.options.onConfirm?.() !== false) this.close(); }
        finally { confirmBtn.disabled = false; }
      },
    });
    footer.appendChild(confirmBtn);

    this.modalEl.appendChild(header);
    this.modalEl.appendChild(body);
    this.modalEl.appendChild(footer);
    this.backdropEl.appendChild(this.modalEl);
  }

  private attachEvents(): void {
    // Close on backdrop click outside modal
    this.backdropEl.addEventListener('click', (e) => {
      if (e.target === this.backdropEl) {
        this.close();
      }
    });

    // Close on Escape key
    this.keydownListener = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const items = Array.from(this.modalEl.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]):not([hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]')).filter(el => el.getClientRects().length > 0);
        const first = items[0], last = items[items.length - 1];
        if (!first || !last) { e.preventDefault(); this.modalEl.focus(); }
        else if (!this.modalEl.contains(document.activeElement) || document.activeElement === this.modalEl) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      if (e.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('keydown', this.keydownListener);
  }

  public open(): void {
    this.previousFocus = document.activeElement as HTMLElement | null;
    this.previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.modalEl.tabIndex = -1;
    document.body.appendChild(this.backdropEl);
    this.backdropEl.classList.add('polaris-modal-backdrop--open');
    this.modalEl.focus();
  }

  public close(): void {
    if (this.closed) return;
    this.closed = true;
    this.options.onClose?.();
    document.body.style.overflow = this.previousOverflow;
    this.previousFocus?.focus();
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
    }
    this.backdropEl.classList.remove('polaris-modal-backdrop--open');
    setTimeout(() => {
      if (this.backdropEl.parentNode) {
        this.backdropEl.parentNode.removeChild(this.backdropEl);
      }
    }, 250);
  }
}

