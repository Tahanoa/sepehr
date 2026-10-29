/**
 * POLARIS INSTITUTE LEARNER TUITION & PAYMENTS PAGE
 * Tuition invoice list, online demo payment simulation, and receipt previews.
 */

import { OrganizationMembership } from '../../../types/auth';
import { authService } from '../../../services/auth-service';
import { TuitionInvoice } from '../../../types/school';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';

export function createStudentPaymentsPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  const user = authService.getCurrentUser();
  const students = schoolStore.getStudents(orgId);
  const currentStudent = students.find((s) => s.fullName === user?.name) || students[0];

  const invoices = currentStudent ? schoolStore.getInvoicesForStudent(orgId, currentStudent.id) : [];

  const render = () => {
    rootWrapper.innerHTML = '';

    // Header
    const headerRow = createElement('div', { className: 'pb-2 border-b border-gray-200 space-y-1' });
    headerRow.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2.5">
        ${getDashboardIcon('payment', 'w-6 h-6 text-[#012622]')} شهریه و پرداخت آنلاین آموزشگاه
      </h2>
      <p class="text-xs sm:text-sm text-gray-600">مشاهده صورت‌حساب‌های صادرشده، پرداخت آنلاین آزمایشی و دریافت رسید رسمی.</p>
    `;

    // Invoices List Card
    const tableCard = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4' });

    const table = createElement('table', { className: 'polaris-table' });
    table.innerHTML = `
      <thead>
        <tr>
          <th>عنوان صورت‌حساب</th>
          <th class="text-center">تاریخ سررسید</th>
          <th class="text-center">مبلغ کل</th>
          <th class="text-center">وضعیت</th>
          <th class="text-center">عملیات</th>
        </tr>
      </thead>
    `;

    const tbody = createElement('tbody');
    if (invoices.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500 py-6">صورت‌حسابی برای شما ثبت نشده است.</td></tr>`;
    } else {
      invoices.forEach((inv) => {
        const remaining = Math.max(0, inv.totalAmount - inv.paidAmount);
        const tr = createElement('tr');
        tr.innerHTML = `
          <td>
            <div class="font-bold text-xs text-gray-900">${inv.title}</div>
            <div class="text-[11px] text-gray-500">تاریخ صدور: ${inv.issuedDate}</div>
          </td>
          <td class="text-center font-mono text-xs text-gray-600">${inv.dueDate}</td>
          <td class="text-center font-mono font-bold text-xs">${inv.totalAmount.toLocaleString('fa-IR')} تومان</td>
          <td class="text-center">
            <span class="px-2.5 py-1 rounded text-[10px] font-bold ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
              ${inv.status === 'paid' ? 'تسویه کامل' : 'در انتظار پرداخت'}
            </span>
          </td>
        `;

        const actionTd = createElement('td', { className: 'text-center' });
        const payBtn = createElement('button', {
          className: 'px-3.5 py-1.5 bg-[#012622] hover:bg-[#003B36] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer',
          textContent: inv.status === 'paid' ? 'مشاهده رسید' : 'پرداخت آنلاین دمو',
        });

        payBtn.addEventListener('click', () => {
          if (inv.status === 'paid') {
            openReceiptModal(inv);
          } else {
            openDemoPayModal(inv, remaining);
          }
        });

        actionTd.appendChild(payBtn);
        tr.appendChild(actionTd);
        tbody.appendChild(tr);
      });
    }

    table.appendChild(tbody);
    tableCard.appendChild(table);

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(tableCard);
  };

  const openDemoPayModal = (inv: TuitionInvoice, remaining: number) => {
    const content = createElement('div', { className: 'space-y-4 text-xs dir-rtl text-gray-800' });
    content.innerHTML = `
      <div class="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
        <div class="font-extrabold text-[#012622]">درگاه پرداخت آنلاین شبیه‌سازی‌شده پولاریس</div>
        <div><strong>عنوان دوره:</strong> ${inv.title}</div>
        <div><strong>مبلغ قابل پرداخت:</strong> <span class="font-mono text-base font-black text-emerald-800">${remaining.toLocaleString('fa-IR')} تومان</span></div>
      </div>
      <p class="text-gray-500 leading-relaxed">
        توجه: این یک شبیه‌سازی محلی بوده و هیچ وجه واقعی منتقل نخواهد شد. با کلیک بر روی تایید، فیش واریزی در سیستم ثبت می‌گردد.
      </p>
    `;

    const modal = new Modal({
      title: 'پرداخت آنلاین شهریه',
      content,
      confirmText: 'تایید پرداخت شبیه‌سازی شده',
      cancelText: 'انصراف',
      onConfirm: () => {
        schoolStore.recordPayment(inv.id, remaining, 'online_demo');
        showToast({ title: 'پرداخت آنلاین موفق', message: 'شهریه شما تسویه شد و رسید صادر گردید.', type: 'success' });
        render();
      },
    });
    modal.open();
  };

  const openReceiptModal = (inv: TuitionInvoice) => {
    const lastTrn = inv.transactions[inv.transactions.length - 1];
    const content = createElement('div', { className: 'space-y-4 text-xs dir-rtl text-gray-800 p-4 bg-gray-50 border border-gray-200 rounded-2xl' });
    content.innerHTML = `
      <div class="text-center pb-3 border-b border-gray-300">
        <h4 class="text-sm font-black text-[#012622]">رسید پرداخت آنلاین شهریه آموزشگاه</h4>
        <p class="text-[11px] text-gray-500 mt-0.5">کد رسید: ${lastTrn?.receiptNumber || 'RCP-10023'}</p>
      </div>
      <div class="grid grid-cols-2 gap-2 text-gray-700">
        <div><strong>فراگیر:</strong> ${inv.studentName}</div>
        <div><strong>عنوان دوره:</strong> ${inv.title}</div>
        <div><strong>مبلغ تسویه‌شده:</strong> ${inv.paidAmount.toLocaleString('fa-IR')} تومان</div>
        <div><strong>کد پیگیری:</strong> <span class="font-mono">${lastTrn?.refCode || 'PAY-DEMO'}</span></div>
        <div><strong>تاریخ پرداخت:</strong> ${lastTrn?.paymentDate || inv.issuedDate}</div>
        <div><strong>وضعیت:</strong> تسویه کامل</div>
      </div>
    `;

    const modal = new Modal({
      title: 'رسید پرداخت شهریه',
      content,
      confirmText: 'بستن',
    });
    modal.open();
  };

  render();
  return rootWrapper;
}
