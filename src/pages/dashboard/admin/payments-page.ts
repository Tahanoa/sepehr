/**
 * POLARIS INSTITUTE PAYMENTS & TUITION MANAGEMENT PAGE
 * Interactive tuition invoice listing, status filter, application approvals,
 * simulated payment recording, and receipt preview.
 */

import { OrganizationMembership } from '../../../types/auth';
import { TuitionInvoice, InvoiceStatus } from '../../../types/school';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';

export function createInstitutePaymentsPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  let selectedStatus: InvoiceStatus | 'all' = 'all';

  const render = () => {
    rootWrapper.innerHTML = '';

    const invoices = schoolStore.getInvoices(orgId);
    const applications = schoolStore.getApplications(orgId);

    const filtered = invoices.filter((i) => selectedStatus === 'all' || i.status === selectedStatus);

    let totalRevenue = 0;
    let totalOutstanding = 0;

    invoices.forEach((inv) => {
      totalRevenue += inv.paidAmount;
      totalOutstanding += Math.max(0, inv.totalAmount - inv.paidAmount);
    });

    // Header Row
    const headerRow = createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    const title = createElement('h2', {
      className: 'text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5',
    });
    title.innerHTML = `${getDashboardIcon('payment', 'w-6 h-6 text-[#012622]')} امور شهریه و صورت‌حساب‌های مالی`;

    const desc = createElement('p', {
      className: 'text-xs sm:text-sm text-gray-600 font-normal',
      textContent: 'مدیریت صورت‌حساب‌ها، ثبت پرداختی‌های جدید، مشاهده رسیدها و بررسی متقاضیان آنلاین.',
    });

    headerText.appendChild(title);
    headerText.appendChild(desc);

    headerRow.appendChild(headerText);

    // Summary Financial Cards
    const finSummary = createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-3 gap-4' });
    finSummary.innerHTML = `
      <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
        <span class="text-xs font-bold text-gray-500">کل دریافتی‌های ثبت‌شده</span>
        <div class="text-xl font-black text-emerald-800 font-mono">${totalRevenue.toLocaleString('fa-IR')} تومان</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
        <span class="text-xs font-bold text-gray-500">مجموع مانده شهریه معوق</span>
        <div class="text-xl font-black text-rose-800 font-mono">${totalOutstanding.toLocaleString('fa-IR')} تومان</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
        <span class="text-xs font-bold text-gray-500">متقاضیان جدید ثبت‌نام</span>
        <div class="text-xl font-black text-[#012622] font-mono">${applications.length.toLocaleString('fa-IR')} نفر</div>
      </div>
    `;

    // Applications Section (if any)
    if (applications.length > 0) {
      const appCard = createElement('div', { className: 'bg-amber-50/80 border border-amber-200 rounded-2xl p-5 space-y-3' });
      appCard.innerHTML = `
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-extrabold text-amber-950 flex items-center gap-2">
            ${getDashboardIcon('assignment', 'w-4 h-4 text-[#E98A15]')} درخواست‌های جدید ثبت‌نام آنلاین آموزشگاه
          </h3>
          <span class="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-bold rounded">${applications.length} مورد</span>
        </div>
      `;

      const appList = createElement('div', { className: 'space-y-2' });
      applications.forEach((app) => {
        const row = createElement('div', { className: 'p-3 bg-white rounded-xl border border-amber-200/80 flex items-center justify-between text-xs' });
        row.innerHTML = `
          <div>
            <span class="font-bold text-gray-900">${app.applicantName}</span> — <span class="text-gray-600">${app.courseName}</span>
            <div class="text-[11px] text-gray-500 font-mono">کد پیگیری: ${app.refCode} | شهریه: ${app.tuitionFee.toLocaleString('fa-IR')} تومان</div>
          </div>
        `;
        const approveBtn = createElement('button', {
          className: 'px-3 py-1.5 bg-[#012622] text-white font-bold rounded-lg text-xs hover:bg-[#003B36]',
          textContent: 'تایید پذیرش و صدور کارت',
        });
        approveBtn.addEventListener('click', () => {
          schoolStore.updateApplicationStatus(app.id, 'enrolled');
          showToast({ title: 'تایید شد', message: `پذیرش «${app.applicantName}» نهایی شد.`, type: 'success' });
          render();
        });
        row.appendChild(approveBtn);
        appList.appendChild(row);
      });
      appCard.appendChild(appList);
      rootWrapper.appendChild(appCard);
    }

    // Invoice Filter & List Table
    const tableCard = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden space-y-3 p-4' });

    const filterRow = createElement('div', { className: 'flex items-center justify-between pb-3 border-b border-gray-100' });
    filterRow.innerHTML = `<h3 class="text-sm font-bold text-gray-900">صورت‌حساب‌های صادرشده</h3>`;

    const filterSelect = createElement('select', {
      className: 'bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800',
    });
    filterSelect.innerHTML = `
      <option value="all" ${selectedStatus === 'all' ? 'selected' : ''}>همه صورت‌حساب‌ها</option>
      <option value="unpaid" ${selectedStatus === 'unpaid' ? 'selected' : ''}>پرداخت نشده</option>
      <option value="paid" ${selectedStatus === 'paid' ? 'selected' : ''}>تسویه کامل</option>
    `;
    filterSelect.addEventListener('change', (e) => {
      selectedStatus = (e.target as HTMLSelectElement).value as any;
      render();
    });
    filterRow.appendChild(filterSelect);
    tableCard.appendChild(filterRow);

    const table = createElement('table', { className: 'polaris-table' });
    table.innerHTML = `
      <thead>
        <tr>
          <th>عنوان صورت‌حساب / فراگیر</th>
          <th class="text-center">مبلغ کل</th>
          <th class="text-center">پرداخت شده</th>
          <th class="text-center">مانده</th>
          <th class="text-center">وضعیت</th>
          <th class="text-center">عملیات</th>
        </tr>
      </thead>
    `;

    const tbody = createElement('tbody');
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-gray-500 py-6">هیچ صورت‌حسابی یافت نشد.</td></tr>`;
    } else {
      filtered.forEach((inv) => {
        const remaining = Math.max(0, inv.totalAmount - inv.paidAmount);
        const tr = createElement('tr');
        tr.innerHTML = `
          <td>
            <div class="font-bold text-xs text-gray-900">${inv.title}</div>
            <div class="text-[11px] text-gray-500">${inv.studentName}</div>
          </td>
          <td class="text-center font-mono font-bold text-xs">${inv.totalAmount.toLocaleString('fa-IR')} تومان</td>
          <td class="text-center font-mono font-bold text-xs text-emerald-800">${inv.paidAmount.toLocaleString('fa-IR')} تومان</td>
          <td class="text-center font-mono font-bold text-xs text-rose-800">${remaining.toLocaleString('fa-IR')} تومان</td>
          <td class="text-center">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
              inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }">${inv.status === 'paid' ? 'تسویه کامل' : 'در انتظار پرداخت'}</span>
          </td>
        `;

        const actionTd = createElement('td', { className: 'text-center' });
        const payBtn = createElement('button', {
          className: 'px-3 py-1 bg-[#012622] hover:bg-[#003B36] text-white rounded text-xs font-bold',
          textContent: inv.status === 'paid' ? 'رسید پرداخت' : 'ثبت پرداختی',
        });
        payBtn.addEventListener('click', () => {
          if (inv.status === 'paid') {
            openReceiptModal(inv);
          } else {
            openRecordPaymentModal(inv);
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
    rootWrapper.appendChild(finSummary);
    rootWrapper.appendChild(tableCard);
  };

  const openRecordPaymentModal = (inv: TuitionInvoice) => {
    const remaining = Math.max(0, inv.totalAmount - inv.paidAmount);
    const content = createElement('div', { className: 'space-y-4 text-xs dir-rtl text-gray-800' });
    content.innerHTML = `
      <div class="bg-amber-50 border border-amber-200 p-3 rounded-xl">
        <strong>ثبت پرداختی شهریه برای:</strong> ${inv.studentName} (${inv.title})<br>
        <strong>مانده قابل پرداخت:</strong> ${remaining.toLocaleString('fa-IR')} تومان
      </div>
      <div class="space-y-1">
        <label class="block font-bold">مبلغ دریافتی (تومان):</label>
        <input type="number" id="pay-amount" value="${remaining}" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-mono font-bold" />
      </div>
      <div class="space-y-1">
        <label class="block font-bold">روش پرداخت:</label>
        <select id="pay-method" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs">
          <option value="online_demo">درگاه آنلاین شبیه‌سازی شده</option>
          <option value="card_transfer">کارت به کارت / فیش واریزی</option>
          <option value="cash">نقدی / دستگاه کارتخوان</option>
        </select>
      </div>
    `;

    const modal = new Modal({
      title: 'ثبت دریافت شهریه شبیه‌سازی‌شده',
      content,
      confirmText: 'تایید و صدور رسید',
      cancelText: 'انصراف',
      onConfirm: () => {
        const amtInput = content.querySelector('#pay-amount') as HTMLInputElement;
        const methodSelect = content.querySelector('#pay-method') as HTMLSelectElement;
        const amt = parseFloat(amtInput.value) || remaining;

        const updated = schoolStore.recordPayment(inv.id, amt, methodSelect.value as any);
        if (updated) {
          showToast({ title: 'ثبت شد', message: 'پرداخت با موفقیت ثبت و رسید صادر شد.', type: 'success' });
          render();
        }
      },
    });
    modal.open();
  };

  const openReceiptModal = (inv: TuitionInvoice) => {
    const lastTrn = inv.transactions[inv.transactions.length - 1];
    const content = createElement('div', { className: 'space-y-4 text-xs dir-rtl text-gray-800 p-4 bg-gray-50 border border-gray-200 rounded-2xl' });
    content.innerHTML = `
      <div class="text-center pb-3 border-b border-gray-300">
        <h4 class="text-sm font-black text-[#012622]">رسید رسمی پرداخت شهریه (نسخه دمو)</h4>
        <p class="text-[11px] text-gray-500 mt-0.5">کد رسید: ${lastTrn?.receiptNumber || 'RCP-10023'}</p>
      </div>
      <div class="grid grid-cols-2 gap-2 text-gray-700">
        <div><strong>نام فراگیر:</strong> ${inv.studentName}</div>
        <div><strong>عنوان دوره:</strong> ${inv.title}</div>
        <div><strong>مبلغ پرداختی:</strong> ${inv.paidAmount.toLocaleString('fa-IR')} تومان</div>
        <div><strong>کد پیگیری:</strong> <span class="font-mono">${lastTrn?.refCode || 'PAY-DEMO'}</span></div>
        <div><strong>تاریخ پرداخت:</strong> ${lastTrn?.paymentDate || inv.issuedDate}</div>
        <div><strong>وضعیت حساب:</strong> تسویه شده</div>
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
