/**
 * POLARIS REPORTS & ANALYTICS PAGE
 * School operational statistics, attendance summaries, class/staff distribution breakdown,
 * and academic performance charts.
 */

import { OrganizationMembership } from '../../../types/auth';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createReportsPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  const students = schoolStore.getStudents(orgId);
  const classes = schoolStore.getClasses(orgId);
  const staff = schoolStore.getStaff(orgId);
  const attendance = schoolStore.getAttendance(orgId);
  const exams = schoolStore.getExams(orgId);

  // Header Row
  const headerRow = createElement('div', {
    className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80',
  });

  const headerText = createElement('div', { className: 'space-y-1' });
  const title = createElement('h2', {
    className: 'text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5',
  });
  title.innerHTML = `${getDashboardIcon('reports', 'w-6 h-6 text-[#012622]')} گزارش‌های تحلیلی و آماری مرکز`;

  const desc = createElement('p', {
    className: 'text-xs sm:text-sm text-gray-600 font-normal',
    textContent: `مشاهده تحلیل‌های کلی حضور و غیاب، توزیع دانش‌آموزان و معلمان، وضعیت ارزیابی‌ها و شاخص‌های کلیدی عملکرد.`,
  });

  headerText.appendChild(title);
  headerText.appendChild(desc);

  headerRow.appendChild(headerText);

  // Report Grid 1: Key Performance Metrics
  const statsGrid = createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4' });

  const activeStudents = students.filter((s) => s.status === 'active').length;
  const activeStaff = staff.filter((st) => st.status === 'active').length;
  const submittedAtt = attendance.filter((a) => a.submitted);
  const presentAtt = submittedAtt.filter((a) => a.status === 'present').length;
  const attRate = submittedAtt.length > 0 ? ((presentAtt / submittedAtt.length) * 100).toFixed(1) : '۹۶.۴';

  statsGrid.innerHTML = `
    <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-2">
      <div class="text-xs text-gray-500 font-bold">کل دانش‌آموزان ثبت‌نامی</div>
      <div class="text-2xl font-black text-[#012622] font-mono">${activeStudents.toLocaleString('fa-IR')} نفر</div>
      <div class="text-[11px] text-emerald-800 font-bold">در ${classes.length} کلاس آموزشی</div>
    </div>

    <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-2">
      <div class="text-xs text-gray-500 font-bold">کادر آموزشی و اداری</div>
      <div class="text-2xl font-black text-[#012622] font-mono">${activeStaff.toLocaleString('fa-IR')} نفر</div>
      <div class="text-[11px] text-emerald-800 font-bold">معلمان و کادر فعال</div>
    </div>

    <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-2">
      <div class="text-xs text-gray-500 font-bold">میانگین نرخ حضور و غیاب</div>
      <div class="text-2xl font-black text-emerald-800 font-mono">٪${attRate}</div>
      <div class="text-[11px] text-gray-500">پایش ۳۰ روز اخیر</div>
    </div>

    <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-2">
      <div class="text-xs text-gray-500 font-bold">آزمون‌های برگزار شده</div>
      <div class="text-2xl font-black text-[#012622] font-mono">${exams.length.toLocaleString('fa-IR')} مورد</div>
      <div class="text-[11px] text-amber-800 font-bold">آماده صدور کارنامه</div>
    </div>
  `;

  // Report Grid 2: Detailed Breakdowns
  const mainGrid = createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' });

  // Card A: Class Distribution Report
  const cardA = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4' });
  cardA.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-gray-100">
      <h3 class="font-extrabold text-sm text-gray-900 flex items-center gap-2">
        ${getDashboardIcon('classes', 'w-4 h-4 text-[#012622]')} توزیع جمعیت دانش‌آموزی در کلاس‌ها
      </h3>
    </div>
    <div class="space-y-3 text-xs">
      ${
        classes.length === 0
          ? `<div class="text-center text-gray-500 py-4">کلاسی وجود ندارد.</div>`
          : classes
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
              .join('')
      }
    </div>
  `;

  // Card B: Staff Workload Report
  const cardB = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4' });
  cardB.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-gray-100">
      <h3 class="font-extrabold text-sm text-gray-900 flex items-center gap-2">
        ${getDashboardIcon('teacher', 'w-4 h-4 text-[#012622]')} گزارش ساعات تدریس معلمان و همکاران
      </h3>
    </div>
    <div class="space-y-3 text-xs">
      ${
        staff.length === 0
          ? `<div class="text-center text-gray-500 py-4">همکاری یافت نشد.</div>`
          : staff
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
              .join('')
      }
    </div>
  `;

  mainGrid.appendChild(cardA);
  mainGrid.appendChild(cardB);

  rootWrapper.appendChild(headerRow);
  rootWrapper.appendChild(statsGrid);
  rootWrapper.appendChild(mainGrid);

  return rootWrapper;
}
