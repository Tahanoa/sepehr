/**
 * POLARIS DATA TABLE COMPONENT
 * Reusable data grid with column specs, status badges, action items, and empty state support.
 */

import { TableColumn, StatusType } from '../types/common';
import { createElement } from '../utils/dom';
import { formatStatusLabel, toPersianDigits } from '../utils/formatters';

export interface DataTableOptions<T> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyText?: string;
  sort?: { key: string; direction: 'asc' | 'desc'; onChange: (key:string,direction:'asc'|'desc')=>void };
}

export function createDataTable<T extends Record<string, any>>(options: DataTableOptions<T>): HTMLElement {
  const { columns, data, onRowClick, emptyText = 'هیچ داده‌ای برای نمایش یافت نشد.' } = options;

  const container = createElement('div', { className: 'polaris-table-container responsive-records' });
  const table = createElement('table', { className: 'polaris-table' });

  // Table Header
  const thead = createElement('thead');
  const headerRow = createElement('tr');

  columns.forEach((col) => {
    const th = createElement('th', { textContent: col.title, attributes: {scope:'col'} });
    if (options.sort && col.key !== 'id') {
      const active=options.sort.key===col.key;th.setAttribute('aria-sort',active?(options.sort.direction==='asc'?'ascending':'descending'):'none');
      const button=createElement('button',{textContent:col.title+(active?(options.sort.direction==='asc'?' ↑':' ↓'):' ↕'),attributes:{type:'button','aria-label':`مرتب‌سازی ${col.title}`}});
      button.addEventListener('click',()=>options.sort!.onChange(String(col.key),active&&options.sort!.direction==='asc'?'desc':'asc'));th.replaceChildren(button);
    }
    if (col.align) {
      th.style.textAlign = col.align;
    }
    if (col.width) {
      th.style.width = col.width;
    }
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Table Body
  const tbody = createElement('tbody');

  if (!data || data.length === 0) {
    const emptyRow = createElement('tr');
    const emptyTd = createElement('td', {
      className: 'text-center',
      textContent: emptyText,
      attributes: { colspan: String(columns.length) },
    });
    emptyTd.style.padding = 'var(--spacing-8)';
    emptyTd.style.color = 'var(--color-muted)';
    emptyRow.appendChild(emptyTd);
    tbody.appendChild(emptyRow);
  } else {
    data.forEach((row) => {
      const tr = createElement('tr');

      if (onRowClick) {
        tr.style.cursor = 'pointer';
        tr.tabIndex = 0;
        tr.addEventListener('keydown', e => {if(e.target===tr&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onRowClick(row);}});
        tr.addEventListener('click', () => onRowClick(row));
      }

      columns.forEach((col) => {
        const td = createElement('td', { attributes: {'data-label':col.title} });
        if (col.align) {
          td.style.textAlign = col.align;
        }

        if (col.render) {
          const rendered = col.render(row);
          if (typeof rendered === 'string') {
            td.innerHTML = rendered;
          } else if (rendered instanceof HTMLElement) {
            td.appendChild(rendered);
          }
        } else {
          const rawValue = row[col.key as string];
          if (col.key === 'status') {
            td.appendChild(createStatusBadge(rawValue as StatusType));
          } else {
            td.textContent = rawValue !== undefined && rawValue !== null ? toPersianDigits(rawValue) : '-';
          }
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  }

  table.appendChild(tbody);
  container.appendChild(table);

  return container;
}

export function createStatusBadge(status: StatusType): HTMLElement {
  let badgeClass = 'polaris-badge--neutral';

  switch (status) {
    case 'active':
      badgeClass = 'polaris-badge--success';
      break;
    case 'pending':
      badgeClass = 'polaris-badge--warning';
      break;
    case 'suspended':
    case 'inactive':
      badgeClass = 'polaris-badge--danger';
      break;
    case 'completed':
      badgeClass = 'polaris-badge--info';
      break;
  }

  return createElement('span', {
    className: `polaris-badge ${badgeClass}`,
    textContent: formatStatusLabel(status),
  });
}

