/**
 * POLARIS EMPTY STATE COMPONENT
 * Renders structured empty state message with title, illustration, and call to action.
 */

import { createElement } from '../utils/dom';
import { createButton, ButtonOptions } from './button';

export interface EmptyStateOptions {
  title: string;
  description: string;
  actionButton?: ButtonOptions;
  iconSvg?: string;
}

export function createEmptyState(options: EmptyStateOptions): HTMLElement {
  const { title, description, actionButton, iconSvg } = options;

  const container = createElement('div', { className: 'polaris-empty-state' });

  const iconWrapper = createElement('div', { className: 'polaris-empty-icon' });
  iconWrapper.innerHTML =
    iconSvg ||
    `<svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>`;

  const titleEl = createElement('h3', { className: 'polaris-empty-title', textContent: title });
  const descEl = createElement('p', { className: 'polaris-empty-description', textContent: description });

  container.appendChild(iconWrapper);
  container.appendChild(titleEl);
  container.appendChild(descEl);

  if (actionButton) {
    const btn = createButton(actionButton);
    container.appendChild(btn);
  }

  return container;
}
