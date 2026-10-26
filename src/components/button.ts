/**
 * POLARIS BUTTON COMPONENT
 * Reusable button & icon button generator with accessibility support.
 */

import { createElement } from '../utils/dom';

export interface ButtonOptions {
  label: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  onClick?: (e: MouseEvent) => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function createButton(options: ButtonOptions): HTMLButtonElement {
  const {
    label,
    variant = 'primary',
    size = 'md',
    icon,
    onClick,
    className = '',
    type = 'button',
    disabled = false,
  } = options;

  const button = createElement('button', {
    className: `polaris-btn polaris-btn--${variant} polaris-btn--${size} ${className}`.trim(),
    attributes: { type },
  }) as HTMLButtonElement;

  if (disabled) {
    button.disabled = true;
  }

  if (icon) {
    const iconSpan = createElement('span', { className: 'polaris-btn-icon-svg' });
    iconSpan.innerHTML = icon;
    button.appendChild(iconSpan);
  }

  const labelSpan = createElement('span', { textContent: label });
  button.appendChild(labelSpan);

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return button;
}

export interface IconButtonOptions {
  ariaLabel: string;
  iconSvg: string;
  onClick?: (e: MouseEvent) => void;
  className?: string;
  variant?: 'ghost' | 'outline';
}

export function createIconButton(options: IconButtonOptions): HTMLButtonElement {
  const { ariaLabel, iconSvg, onClick, className = '', variant = 'outline' } = options;

  const btn = createElement('button', {
    className: `polaris-btn-icon polaris-btn-icon--${variant} ${className}`.trim(),
    attributes: {
      'aria-label': ariaLabel,
      title: ariaLabel,
      type: 'button',
    },
  }) as HTMLButtonElement;

  btn.innerHTML = iconSvg;

  if (onClick) {
    btn.addEventListener('click', onClick);
  }

  return btn;
}
