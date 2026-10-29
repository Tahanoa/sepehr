/**
 * POLARIS TEACHER CLASSES & ROSTERS PAGE
 * Display assigned class rosters, student counts, and guardian contact details.
 */

import { OrganizationMembership } from '../../../types/auth';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';

import { authService } from '../../../services/auth-service';

export function createTeacherClassesPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;
  const currentUser = authService.getCurrentUser();

  const isTeacher = membership.role === 'teacher' || membership.role === 'instructor';
  let classes = schoolStore.getClasses(orgId);
  if (isTeacher && currentUser) {
    classes = schoolStore.getTeacherClasses(orgId, currentUser.email || currentUser.phone || currentUser.id);
  }

  const students = schoolStore.getStudents(orgId);
  const allAssignments = schoolStore.getAssignments(orgId);
  const allExams = schoolStore.getExams(orgId);
  const allAttendance = schoolStore.getAttendance(orgId);

  let selectedClassId = classes.length > 0 ? classes[0]!.id : '';

  const render = () => {
    rootWrapper.innerHTML = '';

    const selectedClass = classes.find((c) => c.id === selectedClassId);
    const classStudents = students.filter((s) => s.classId === selectedClassId);

    // Header
    const headerRow = createElement('div', { className: 'pb-2 border-b border-gray-200 space-y-1' });
    headerRow.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
        ${getDashboardIcon('classes', 'w-6 h-6 text-[rgb(var(--theme-primary))]')} کلاس‌های من و لیست فراگیران
      </h2>
      <p class="text-xs text-gray-600">مشاهده مشخصات دانش‌آموزان/فراگیران، شماره تماس سرپرست و وضعیت تحصیلی</p>
    `;

    // Class Overview Cards Grid
    const cardsGrid = createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' });

    classes.forEach((cls) => {
      const clsStudents = students.filter((s) => s.classId === cls.id);
      const clsAssignments = allAssignments.filter((a) => a.classId === cls.id);
      const clsExams = allExams.filter((e) => e.classIds && e.classIds.includes(cls.id));
      const clsAttendance = allAttendance.filter((a) => a.classId === cls.id && a.submitted);

      const presentCount = clsAttendance.filter((a) => a.status === 'present').length;
      const attPercent = clsAttendance.length > 0 ? Math.round((presentCount / clsAttendance.length) * 100) : 98;

      const isSelected = cls.id === selectedClassId;

      const card = createElement('div', {
        className: `bg-white rounded-2xl border ${
          isSelected ? 'border-[rgb(var(--theme-primary))] ring-2 ring-[rgb(var(--theme-primary))]/20' : 'border-gray-200/80'
        } p-5 shadow-2xs space-y-4 flex flex-col justify-between transition-all`,
      });

      card.innerHTML = `
        <div class="space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-gray-100">
            <span class="font-semibold text-sm text-[rgb(var(--theme-primary))]">${cls.name}</span>
            <span class="px-2.5 py-0.5 bg-[rgb(var(--theme-subtle))] text-[rgb(var(--theme-primary))] rounded-lg text-[11px] font-bold">${cls.gradeLevel}</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
              <div class="text-[10px] text-gray-500 font-bold">تعداد کل دانش‌آموزان</div>
              <div class="text-base font-bold text-gray-900 font-mono mt-0.5">${clsStudents.length} نفر</div>
            </div>

            <div class="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
              <div class="text-[10px] text-emerald-800 font-bold">نرخ حضور و غیاب</div>
              <div class="text-base font-bold text-emerald-950 font-mono mt-0.5">٪${attPercent}</div>
            </div>

            <div class="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
              <div class="text-[10px] text-blue-800 font-bold">تکالیف فعال</div>
              <div class="text-base font-bold text-blue-950 font-mono mt-0.5">${clsAssignments.length} مورد</div>
            </div>

            <div class="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
              <div class="text-[10px] text-amber-800 font-bold">آزمون‌های برنامه‌ریزی‌شده</div>
              <div class="text-base font-bold text-amber-950 font-mono mt-0.5">${clsExams.length} مورد</div>
            </div>
          </div>
        </div>

        <!-- Shortcuts -->
        <div class="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
          <button class="nav-att-btn px-2.5 py-1.5 bg-[rgb(var(--theme-primary))] text-white font-bold rounded-xl text-[11px] hover:bg-[rgb(var(--theme-hover))] transition-colors cursor-pointer text-center">
            ثبت حضور/غیاب
          </button>
          <button class="nav-grd-btn px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-[11px] transition-colors cursor-pointer text-center">
            دفتر نمرات
          </button>
        </div>
      `;

      const navAttBtn = card.querySelector('.nav-att-btn') as HTMLButtonElement;
      const navGrdBtn = card.querySelector('.nav-grd-btn') as HTMLButtonElement;

      navAttBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: `/app/${orgId}/attendance` }));
      });

      navGrdBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: `/app/${orgId}/grades` }));
      });

      card.addEventListener('click', () => {
        selectedClassId = cls.id;
        render();
      });

      cardsGrid.appendChild(card);
    });

    // Roster Card Table
    const rosterCard = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden p-5 space-y-4' });

    if (selectedClass) {
      const classMeta = createElement('div', { className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-gray-100 gap-2 text-xs' });
      classMeta.innerHTML = `
        <span class="font-bold text-[rgb(var(--theme-primary))] text-base">لیست دانش‌آموزان ${selectedClass.name} (${selectedClass.gradeLevel})</span>
        <span class="text-gray-600 font-medium">مدرس/معلم راهنما: ${selectedClass.homeroomTeacherName} | شماره اتاق: ${selectedClass.roomNumber}</span>
      `;
      rosterCard.appendChild(classMeta);
    }

    const table = createElement('table', { className: 'polaris-table' });
    table.innerHTML = `
      <thead>
        <tr>
          <th>نام دانش‌آموز / فراگیر</th>
          <th class="text-center">کد تحصیلی</th>
          <th class="text-center">کد ملی</th>
          <th>نام ولی / سرپرست</th>
          <th class="text-center">شماره تماس</th>
          <th class="text-center">وضعیت</th>
        </tr>
      </thead>
    `;

    const tbody = createElement('tbody');
    if (classStudents.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-gray-500 py-6">هیچ دانش‌آموزی در این کلاس ثبت نشده است.</td></tr>`;
    } else {
      classStudents.forEach((std) => {
        const tr = createElement('tr');
        tr.innerHTML = `
          <td>
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-[rgb(var(--theme-primary))] text-white font-bold flex items-center justify-center text-xs shrink-0">${std.fullName.slice(0, 1)}</div>
              <span class="font-bold text-xs text-gray-900">${std.fullName}</span>
            </div>
          </td>
          <td class="text-center font-mono text-xs text-gray-600">${std.studentCode}</td>
          <td class="text-center font-mono text-xs text-gray-600">${std.nationalId}</td>
          <td class="text-xs text-gray-800">${std.guardianName} (${std.guardianRelation})</td>
          <td class="text-center font-mono text-xs text-gray-800">${std.guardianPhone}</td>
          <td class="text-center">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${std.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}">${std.status === 'active' ? 'فعال' : 'غیرفعال'}</span>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    table.appendChild(tbody);
    rosterCard.appendChild(table);

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(cardsGrid);
    rootWrapper.appendChild(rosterCard);
  };

  render();
  return rootWrapper;
}
