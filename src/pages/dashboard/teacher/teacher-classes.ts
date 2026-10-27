/**
 * POLARIS TEACHER CLASSES & ROSTERS PAGE
 * Display assigned class rosters, student counts, and guardian contact details.
 */

import { OrganizationMembership } from '../../../types/auth';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createTeacherClassesPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  const classes = schoolStore.getClasses(orgId);
  const students = schoolStore.getStudents(orgId);

  let selectedClassId = classes.length > 0 ? classes[0]!.id : '';

  const render = () => {
    rootWrapper.innerHTML = '';

    const selectedClass = classes.find((c) => c.id === selectedClassId);
    const classStudents = students.filter((s) => s.classId === selectedClassId);

    // Header
    const headerRow = createElement('div', { className: 'pb-2 border-b border-gray-200 space-y-1' });
    headerRow.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
        ${getDashboardIcon('classes', 'w-6 h-6 text-[#012622]')} کلاس‌های من و لیست فراگیران
      </h2>
      <p class="text-xs text-gray-600">مشاهده مشخصات دانش‌آموزان/فراگیران، شماره تماس سرپرست و وضعیت تحصیلی</p>
    `;

    // Class selector tabs
    const tabsRow = createElement('div', { className: 'flex items-center gap-2 overflow-x-auto pb-1' });
    classes.forEach((c) => {
      const isSelected = c.id === selectedClassId;
      const btn = createElement('button', {
        className: `px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
          isSelected ? 'bg-[#012622] text-white shadow' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
        }`,
        textContent: `${c.name} (${c.studentCount} نفر)`,
      });
      btn.addEventListener('click', () => {
        selectedClassId = c.id;
        render();
      });
      tabsRow.appendChild(btn);
    });

    // Roster Card Table
    const rosterCard = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden p-4 space-y-3' });

    if (selectedClass) {
      const classMeta = createElement('div', { className: 'flex items-center justify-between pb-3 border-b border-gray-100 text-xs' });
      classMeta.innerHTML = `
        <span class="font-extrabold text-[#012622] text-sm">${selectedClass.name} — ${selectedClass.gradeLevel}</span>
        <span class="text-gray-500 font-medium">معلم راهنما / مدرس: ${selectedClass.homeroomTeacherName} | شماره اتاق/کلاس: ${selectedClass.roomNumber}</span>
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
              <div class="w-7 h-7 rounded-full bg-[#012622] text-white font-bold flex items-center justify-center text-xs shrink-0">${std.fullName.slice(0, 1)}</div>
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
    rootWrapper.appendChild(tabsRow);
    rootWrapper.appendChild(rosterCard);
  };

  render();
  return rootWrapper;
}
