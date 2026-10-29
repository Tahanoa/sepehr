/**
 * POLARIS DOM UTILITIES
 * Typed DOM manipulation and helper utilities.
 */

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: {
    className?: string;
    id?: string;
    attributes?: Record<string, string>;
    innerHTML?: string;
    textContent?: string;
  }
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);

  if (options?.className) {
    element.className = options.className;
  }
  if (options?.id) {
    element.id = options.id;
  }
  if (options?.attributes) {
    Object.entries(options.attributes).forEach(([key, val]) => {
      if (['disabled','required','checked','selected','multiple','readonly'].includes(key) && val === 'false') return;
      element.setAttribute(key, val);
    });
  }
  if (options?.innerHTML) {
    element.innerHTML = options.innerHTML;
  } else if (options?.textContent) {
    element.textContent = options.textContent;
  }

  return element;
}

export function clearElement(element: HTMLElement): void {
  element.innerHTML = '';
}

