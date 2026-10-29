/**
 * POLARIS FOUNDATION DEMO PAGE
 * Demonstrates Polaris design system, brand colors, statistics, data table, modal & toast.
 */

import { mockDashboardStats, mockStudentRecords } from '../../data/mock-data';
import { createStatCard } from '../../components/card';
import { createDataTable, createStatusBadge } from '../../components/data-table';
import { createButton } from '../../components/button';
import { createEmptyState } from '../../components/empty-state';
import { Modal } from '../../components/modal';
import { showToast } from '../../components/toast';
import { createElement } from '../../utils/dom';
import { TableColumn, StudentRecord } from '../../types/common';

export function createHomePage(): HTMLElement {
  const container = createElement('div', { className: 'flex flex-col gap-6' });

  // 1. Welcome Header Banner
  const welcomeBanner = createElement('div', {
    className: 'polaris-card',
    innerHTML: `
      <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--spacing-4);">
        <div>
          <h2 style="margin-bottom: var(--spacing-2); color: var(--color-primary);">زیرساخت معماری پلتفرم آموزشی سپهر (Polaris)</h2>
          <p style="color: var(--color-text-secondary); max-width: 700px;">
            این صفحه نمایش‌دهنده سیستم طراحی، توکن‌های رنگی رسمی برند، متغیرهای معنایی CSS و کامپوننت‌های پایه قابل استفاده مجدد سامانه سپهر است.
          </p>
        </div>
        <div id="banner-actions" style="display: flex; gap: var(--spacing-3); flex-wrap: wrap;"></div>
      </div>
    `,
  });

  const bannerActions = welcomeBanner.querySelector('#banner-actions') as HTMLElement;

  const testToastBtn = createButton({
    label: 'تست اعلان (Toast)',
    variant: 'accent',
    onClick: () => {
      showToast({
        title: 'اعلان موفقیت‌آمیز',
        message: 'سیستم طراحی و معماری اولیه سپهر با موفقیت بارگذاری شد.',
        type: 'success',
      });
    },
  });

  const testModalBtn = createButton({
    label: 'نمایش مدال تعاملی',
    variant: 'primary',
    onClick: () => {
      const modal = new Modal({
        title: 'تأییدیه عملیات سامانه',
        content: `
          <p>آیا از ذخیره‌سازی و ثبت تغییرات سیستم در پلتفرم آموزش سپهر اطمینان دارید؟</p>
          <div style="padding: 12px; background: var(--color-lavender-mist); border-radius: 8px; margin-top: 12px;">
            <strong style="color: var(--color-evergreen);">پالت رنگی برند:</strong> EVERGREEN, DARK GREEN, LAVENDER MIST, AMBER EARTH, DEEP PURPLE.
          </div>
        `,
        confirmText: 'ثبت و ذخیره',
        cancelText: 'انصراف',
        onConfirm: () => {
          showToast({
            title: 'عملیات تأیید شد',
            message: 'اطلاعات در حافظه سامانه ذخیره گردید.',
            type: 'info',
          });
        },
      });
      modal.open();
    },
  });

  bannerActions.appendChild(testToastBtn);
  bannerActions.appendChild(testModalBtn);

  container.appendChild(welcomeBanner);

  // 2. Official Brand Palette Swatches
  const paletteSection = createElement('div', {
    className: 'polaris-card',
    innerHTML: `
      <h3 style="margin-bottom: var(--spacing-2);">پالت رنگی رسمی برند (Official Brand Palette)</h3>
      <p style="color: var(--color-muted); font-size: var(--font-size-sm); margin-bottom: var(--spacing-4);">
        ۵ رنگ اصلی مشخص شده به عنوان توکن‌های مرکزی سیستم طراحی در src/styles/theme.css
      </p>
      <div class="color-swatch-grid">
        <div class="color-swatch-card">
          <div class="color-swatch-preview" style="background-color: #012622;"></div>
          <div class="color-swatch-info">
            <div class="color-swatch-name">EVERGREEN</div>
            <div class="color-swatch-hex">#012622</div>
          </div>
        </div>
        <div class="color-swatch-card">
          <div class="color-swatch-preview" style="background-color: #003B36;"></div>
          <div class="color-swatch-info">
            <div class="color-swatch-name">DARK GREEN</div>
            <div class="color-swatch-hex">#003B36</div>
          </div>
        </div>
        <div class="color-swatch-card">
          <div class="color-swatch-preview" style="background-color: #ECE5F0; border-bottom: 1px solid #DDD6E3;"></div>
          <div class="color-swatch-info">
            <div class="color-swatch-name" style="color: #59114D;">LAVENDER MIST</div>
            <div class="color-swatch-hex">#ECE5F0</div>
          </div>
        </div>
        <div class="color-swatch-card">
          <div class="color-swatch-preview" style="background-color: #E98A15;"></div>
          <div class="color-swatch-info">
            <div class="color-swatch-name">AMBER EARTH</div>
            <div class="color-swatch-hex">#E98A15</div>
          </div>
        </div>
        <div class="color-swatch-card">
          <div class="color-swatch-preview" style="background-color: #59114D;"></div>
          <div class="color-swatch-info">
            <div class="color-swatch-name">DEEP PURPLE</div>
            <div class="color-swatch-hex">#59114D</div>
          </div>
        </div>
      </div>
    `,
  });
  container.appendChild(paletteSection);

  // 3. Executive KPI Statistic Cards Grid
  const statsGrid = createElement('div', { className: 'grid grid-cols-4 gap-4 lg:grid-cols-2 md:grid-cols-1' });
  mockDashboardStats.forEach((stat) => {
    statsGrid.appendChild(createStatCard(stat));
  });
  container.appendChild(statsGrid);

  // 4. Sample Data Table Section
  const tableCard = createElement('div', { className: 'polaris-card' });

  const tableCardHeader = createElement('div', {
    className: 'flex items-center justify-between mb-4',
    innerHTML: `
      <div>
        <h3 style="margin: 0;">لیست نمونه دانش‌آموزان و وضعیت تحصیلی</h3>
        <p style="color: var(--color-muted); font-size: var(--font-size-xs); margin: 0;">اطلاعات آزمایشی فارسی جهت ارزیابی کامپوننت Data Table</p>
      </div>
      <div id="table-toggle-btn"></div>
    `,
  });

  const tableContainerWrapper = createElement('div', { id: 'table-wrapper' });

  const columns: TableColumn<StudentRecord>[] = [
    { key: 'studentCode', title: 'کد دانش‌آموزی', width: '120px' },
    { key: 'fullName', title: 'نام و نام خانوادگی' },
    { key: 'gradeLevel', title: 'پایه تحصیلی و رشته' },
    { key: 'courseName', title: 'دوره اصلی' },
    { key: 'gpa', title: 'معدل', align: 'center' },
    {
      key: 'status',
      title: 'وضعیت',
      align: 'center',
      render: (row) => createStatusBadge(row.status),
    },
  ];

  const dataTable = createDataTable<StudentRecord>({
    columns,
    data: mockStudentRecords,
    onRowClick: (row) => {
      showToast({
        title: row.fullName,
        message: `معدل: ${row.gpa} | دوره: ${row.courseName}`,
        type: 'info',
      });
    },
  });

  tableContainerWrapper.appendChild(dataTable);

  let isEmptyStateVisible = false;
  const toggleBtn = createButton({
    label: 'پیش‌نمایش حالت خالی (Empty State)',
    variant: 'outline',
    size: 'sm',
    onClick: () => {
      isEmptyStateVisible = !isEmptyStateVisible;
      tableContainerWrapper.innerHTML = '';

      if (isEmptyStateVisible) {
        const emptyState = createEmptyState({
          title: 'هیچ دانش‌آموزی یافت نشد',
          description: 'در حال حاضر هیچ رکوردی در سیستم ثبت نشده است یا فیلترهای انتخابی شما نتیجه‌ای نداشتند.',
          actionButton: {
            label: 'بازنشانی لیست',
            variant: 'primary',
            onClick: () => {
              isEmptyStateVisible = false;
              tableContainerWrapper.innerHTML = '';
              tableContainerWrapper.appendChild(dataTable);
            },
          },
        });
        tableContainerWrapper.appendChild(emptyState);
      } else {
        tableContainerWrapper.appendChild(dataTable);
      }
    },
  });

  tableCardHeader.querySelector('#table-toggle-btn')?.appendChild(toggleBtn);

  tableCard.appendChild(tableCardHeader);
  tableCard.appendChild(tableContainerWrapper);
  container.appendChild(tableCard);

  return container;
}

export function createGenericPage(title: string, description: string): HTMLElement {
  const container = createElement('div', { className: 'polaris-card' });

  const empty = createEmptyState({
    title: `بخش ${title}`,
    description: description,
    actionButton: {
      label: 'بازگشت به پیش‌خوان',
      variant: 'primary',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: '/' }));
      },
    },
  });

  container.appendChild(empty);
  return container;
}
