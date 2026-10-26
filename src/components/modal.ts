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
  onConfirm?: () => void;
  onCancel?: () => void;
}

export class Modal {
  private backdropEl: HTMLElement;
  private modalEl: HTMLElement;
  private options: ModalOptions;
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
      onClick: () => {
        if (this.options.onConfirm) this.options.onConfirm();
        this.close();
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
      if (e.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('keydown', this.keydownListener);
  }

  public open(): void {
    document.body.appendChild(this.backdropEl);
    // Trigger transition next frame
    requestAnimationFrame(() => {
      this.backdropEl.classList.add('polaris-modal-backdrop--open');
    });
  }

  public close(): void {
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
