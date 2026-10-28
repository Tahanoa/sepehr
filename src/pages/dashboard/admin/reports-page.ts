/**
 * POLARIS REPORTS & ANALYTICS PAGE
 * School operational statistics, attendance summaries, class/staff distribution breakdown,
 * and academic performance charts.
 */

import { OrganizationMembership } from '../../../types/auth';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';

import { showToast } from '../../../components/toast';

export function createReportsPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  let activeReportTab: 'overview' | 'attendance' | 'academic' | 'communication' | 'financial' = 'overview';

  const students = schoolStore.getStudents(orgId);
  const classes = schoolStore.getClasses(orgId);
  const staff = schoolStore.getStaff(orgId);
  const attendance = schoolStore.getAttendance(orgId);
  const exams = schoolStore.getExams(orgId);
  const announcements = schoolStore.getAnnouncements(orgId);
  const smsLogs = schoolStore.getSMSLogs(orgId);
  const parentConvs = schoolStore.getParentConversations(orgId);
  const invoices = schoolStore.getInvoices(orgId);

  const render = () => {
    rootWrapper.innerHTML = '';

    // Header Row
    const headerRow = createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    const title = createElement('h2', {
      className: 'text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5',
    });
    title.innerHTML = `${getDashboardIcon('reports', 'w-6 h-6 text-[#012622]')} گزارش‌های تحلیلی و آمار مدیریتی`;

    const desc = createElement('p', {
      className: 'text-xs sm:text-sm text-gray-600 font-normal',
      textContent: `مشاهده تحلیل‌های کلی حضور و غیاب، عملکرد تحصیلی، کمپین‌های ارتباطی و گزارش مالی.`,
    });

    headerText.appendChild(title);
    headerText.appendChild(desc);

    const exportCsvBtn = createElement('button', {
      className:
        'px-4 py-2.5 bg-[#012622] hover:bg-[#003B36] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer',
      innerHTML: `<svg class="w-4 h-4 text-[#E98A15]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg> دانلود خروجی CSV`,
    });
    exportCsvBtn.addEventListener('click', () => exportCurrentReportToCSV());

    headerRow.appendChild(headerText);
    headerRow.appendChild(exportCsvBtn);

    // Report Tabs
    const tabBar = createElement('div', { className: 'flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto' });

    const tabs: { key: typeof activeReportTab; label: string }[] = [
      { key: 'overview', label: 'نگاه کلی و آمارهای اصلی' },
      { key: 'attendance', label: 'گزارش حضور و غیاب' },
      { key: 'academic', label: 'گزارش تحصیلی و آزمون‌ها' },
      { key: 'communication', label: 'گزارش ارتباطات و SMS' },
      { key: 'financial', label: 'گزارش مالی و شهریه‌ها' },
    ];

    tabs.forEach((t) => {
      const btn = createElement('button', {
        className: `px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
          activeReportTab === t.key ? 'bg-[#012622] text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`,
        textContent: t.label,
      });
      btn.addEventListener('click', () => {
        activeReportTab = t.key;
        render();
      });
      tabBar.appendChild(btn);
    });

    const contentArea = createElement('div', { className: 'space-y-6' });

    if (activeReportTab === 'overview') {
      const activeStudents = students.filter((s) => s.status === 'active').length;
      const activeStaff = staff.filter((st) => st.status === 'active').length;
      const presentCount = attendance.filter((a) => a.status === 'present').length;
      const attRate = attendance.length > 0 ? ((presentCount / attendance.length) * 100).toFixed(1) : '۹۶.۴';

      const statsGrid = createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4' });
      statsGrid.innerHTML = `
        <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-2">
          <div class="text-xs text-gray-500 font-bold">کل دانش‌آموزان فعال</div>
          <div class="text-2xl font-black text-[#012622] font-mono">${activeStudents.toLocaleString('fa-IR')} نفر</div>
          <div class="text-[11px] text-emerald-800 font-bold">در ${classes.length} کلاس آموزشی</div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-2">
          <div class="text-xs text-gray-500 font-bold">کادر آموزشی و معلمان</div>
          <div class="text-2xl font-black text-[#012622] font-mono">${activeStaff.toLocaleString('fa-IR')} نفر</div>
          <div class="text-[11px] text-emerald-800 font-bold">معلمان فعال</div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-2">
          <div class="text-xs text-gray-500 font-bold">میانگین نرخ حضور و غیاب</div>
          <div class="text-2xl font-black text-emerald-800 font-mono">٪${attRate}</div>
          <div class="text-[11px] text-gray-500">مجموع ثبت‌های حضور</div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-2">
          <div class="text-xs text-gray-500 font-bold">آزمون‌های برنامه‌ریزی‌شده</div>
          <div class="text-2xl font-black text-[#012622] font-mono">${exams.length.toLocaleString('fa-IR')} مورد</div>
          <div class="text-[11px] text-amber-800 font-bold">فعال در ترم جاری</div>
        </div>
      `;

      const mainGrid = createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' });

      const cardA = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4' });
      cardA.innerHTML = `
        <h3 class="font-extrabold text-sm text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
          ${getDashboardIcon('classes', 'w-4 h-4 text-[#012622]')} توزیع جمعیت دانش‌آموزان در کلاس‌ها
        </h3>
        <div class="space-y-3 text-xs">
          ${classes
            .map((c) => {
              const cStudents = students.filter((s) => s.classId === c.id);
              const percent = Math.min(100, Math.round((cStudents.length / c.capacity) * 100));
              return `
                <div class="space-y-1">
                  <div class="flex justify-between font-bold text-gray-800">
                    <span>${c.name} (${c.gradeLevel})</span>
                    <span class="font-mono">${cStudents.length} از ${c.capacity} نفر (٪${percent})</span>
                  </div>
                  <div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div class="h-full bg-[#012622] rounded-full" style="width: ${percent}%"></div>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      `;

      const cardB = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4' });
      cardB.innerHTML = `
        <h3 class="font-extrabold text-sm text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
          ${getDashboardIcon('teacher', 'w-4 h-4 text-[#012622]')} گزارش ساعات تدریس معلمان
        </h3>
        <div class="space-y-3 text-xs">
          ${staff
            .map((st) => {
              const percent = Math.min(100, Math.round((st.weeklyHours / 30) * 100));
              return `
                <div class="space-y-1">
                  <div class="flex justify-between font-bold text-gray-800">
                    <span>${st.fullName} (${st.roleTitle})</span>
                    <span class="font-mono text-emerald-800">${st.weeklyHours} ساعت در هفته</span>
                  </div>
                  <div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div class="h-full bg-[#003B36] rounded-full" style="width: ${percent}%"></div>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      `;

      mainGrid.appendChild(cardA);
      mainGrid.appendChild(cardB);

      contentArea.appendChild(statsGrid);
      contentArea.appendChild(mainGrid);
    } else if (activeReportTab === 'attendance') {
      const attTable = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4' });
      attTable.innerHTML = `
        <h3 class="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3">گزارش تفکیکی حضور و غیاب</h3>
        <table class="polaris-table">
          <thead>
            <tr>
              <th>تاریخ</th>
              <th>نام دانش‌آموز</th>
              <th>کلاس</th>
              <th class="text-center">وضعیت</th>
              <th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${
              attendance.length === 0
                ? `<tr><td colspan="5" class="text-center text-gray-500 py-4">سابقه‌ای ثبت نشده است.</td></tr>`
                : attendance
                    .map(
                      (a) => `
                  <tr>
                    <td class="font-mono text-xs font-bold">${a.date}</td>
                    <td class="font-bold text-xs">${a.studentName}</td>
                    <td class="text-xs">${classes.find((c) => c.id === a.classId)?.name || 'کلاس'}</td>
                    <td class="text-center">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.status === 'present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : a.status === 'absent'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }">
                        ${a.status === 'present' ? 'حاضر' : a.status === 'absent' ? 'غایب' : 'تأخیر'}
                      </span>
                    </td>
                    <td class="text-xs text-gray-600">${a.notes || '—'}</td>
                  </tr>
                `
                    )
                    .join('')
            }
          </tbody>
        </table>
      `;
      contentArea.appendChild(attTable);
    } else if (activeReportTab === 'academic') {
      const acadTable = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4' });
      acadTable.innerHTML = `
        <h3 class="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3">گزارش آزمون‌های برگزارشده و میانگین نمرات</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          ${exams
            .map(
              (ex) => `
            <div class="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
              <div class="flex justify-between font-bold text-gray-900">
                <span>${ex.title}</span>
                <span class="font-mono text-emerald-800">${ex.subjectName}</span>
              </div>
              <div class="text-gray-600">تاریخ: <span class="font-mono">${ex.examDate}</span> | نوع سنجش: ${ex.evalType === 'descriptive' ? 'توصیفی' : 'عددی'}</div>
            </div>
          `
            )
            .join('')}
        </div>
      `;
      contentArea.appendChild(acadTable);
    } else if (activeReportTab === 'communication') {
      const commBox = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4' });
      commBox.innerHTML = `
        <h3 class="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3">گزارش کمپین‌های پیامکی و اطلاعیه‌ها</h3>
        <div class="grid grid-cols-3 gap-3 text-center text-xs">
          <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <div class="text-gray-500 font-bold">اطلاعیه‌های داخلی</div>
            <div class="text-xl font-black text-[#012622] font-mono mt-1">${announcements.length}</div>
          </div>
          <div class="bg-amber-50 p-3 rounded-xl border border-amber-200">
            <div class="text-amber-900 font-bold">پیامک‌های شبیه‌سازی‌شده</div>
            <div class="text-xl font-black text-amber-950 font-mono mt-1">${smsLogs.length}</div>
          </div>
          <div class="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            <div class="text-emerald-900 font-bold">گفتگوهای اولیا</div>
            <div class="text-xl font-black text-emerald-950 font-mono mt-1">${parentConvs.length}</div>
          </div>
        </div>
      `;
      contentArea.appendChild(commBox);
    } else if (activeReportTab === 'financial') {
      const finBox = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4' });
      const paidTotal = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0);
      const unpaidTotal = invoices.filter((i) => i.status !== 'paid').reduce((sum, i) => sum + i.totalAmount, 0);

      finBox.innerHTML = `
        <h3 class="font-bold text-sm text-gray-900 border-b border-gray-100 pb-3">خلاصه صورت‌حساب‌ها و شهریه‌های شبیه‌سازی شده</h3>
        <div class="grid grid-cols-2 gap-4 text-xs text-center">
          <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
            <div class="font-bold text-emerald-900">مجموع شهریه‌های دریافتی</div>
            <div class="text-xl font-black text-emerald-950 font-mono">${paidTotal.toLocaleString('fa-IR')} تومان</div>
          </div>
          <div class="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
            <div class="font-bold text-rose-900">مجموع مطالبات و معوقات</div>
            <div class="text-xl font-black text-rose-950 font-mono">${unpaidTotal.toLocaleString('fa-IR')} تومان</div>
          </div>
        </div>
      `;
      contentArea.appendChild(finBox);
    }

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(tabBar);
    rootWrapper.appendChild(contentArea);
  };

  const exportCurrentReportToCSV = () => {
    let csvString = 'Category,Title,Details\n';

    if (activeReportTab === 'attendance') {
      csvString = 'Date,Student,Status,Notes\n';
      attendance.forEach((a) => {
        csvString += `"${a.date}","${a.studentName}","${a.status}","${a.notes || ''}"\n`;
      });
    } else {
      students.forEach((s) => {
        csvString += `"${s.fullName}","${s.studentCode}","${s.className}","${s.gradeLevel}"\n`;
      });
    }

    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Polaris_Report_${activeReportTab}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({ title: 'خروجی آماده شد', message: 'فایل CSV با موفقیت دانلود شد.', type: 'success' });
  };

  render();
  return rootWrapper;
}
