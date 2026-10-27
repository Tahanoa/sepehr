/**
 * POLARIS TIMETABLE & SCHEDULING PAGE
 * Weekly timetable grid view with class and teacher filters, lesson creation form,
 * and automatic schedule conflict detection (class & teacher overlap validation).
 */

import { OrganizationMembership } from '../../../types/auth';
import { TimetableSlot } from '../../../types/school';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createTimetablePage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  const classes = schoolStore.getClasses(orgId);
  const subjects = schoolStore.getSubjects(orgId);
  const staff = schoolStore.getStaff(orgId);

  let selectedClassId = classes.length > 0 ? classes[0]!.id : '';

  const daysMap: { key: TimetableSlot['dayOfWeek']; title: string }[] = [
    { key: 'saturday', title: 'شنبه' },
    { key: 'sunday', title: 'یکشنبه' },
    { key: 'monday', title: 'دوشنبه' },
    { key: 'tuesday', title: 'سه‌شنبه' },
    { key: 'wednesday', title: 'چهارشنبه' },
  ];

  const periodsMap = [
    { num: 1, label: 'زنگ اول (۰۸:۰۰ - ۰۹:۳۰)' },
    { num: 2, label: 'زنگ دوم (۱۰:۰۰ - ۱۱:۳۰)' },
    { num: 3, label: 'زنگ سوم (۱۲:۰۰ - ۱۳:۳۰)' },
    { num: 4, label: 'زنگ چهارم (۱۴:۰۰ - ۱۵:۳۰)' },
  ];

  const render = () => {
    rootWrapper.innerHTML = '';

    const timetableSlots = schoolStore.getTimetable(orgId);
    const classSlots = timetableSlots.filter((s) => s.classId === selectedClassId);

    // Header Row
    const headerRow = createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    const title = createElement('h2', {
      className: 'text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5',
    });
    title.innerHTML = `${getDashboardIcon('calendar', 'w-6 h-6 text-[#012622]')} برنامه هفتگی و زمان‌بندی دروس`;

    const desc = createElement('p', {
      className: 'text-xs sm:text-sm text-gray-600 font-normal',
      textContent: 'تنظیم جدول برنامه‌ریزی هفتگی، تخصیص مدرسان و سنجش خودکار تداخل زنگ‌های درسی.',
    });

    headerText.appendChild(title);
    headerText.appendChild(desc);

    const addBtn = createElement('button', {
      className:
        'px-4 py-2.5 bg-[#012622] hover:bg-[#003B36] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
      innerHTML: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> افزودن زنگ جدید`,
    });
    addBtn.addEventListener('click', () => openAddSlotModal());

    headerRow.appendChild(headerText);
    headerRow.appendChild(addBtn);

    // Toolbar Selector
    const toolbar = createElement('div', {
      className: 'bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center gap-3',
    });

    const classLabel = createElement('label', { className: 'text-xs font-bold text-gray-700 shrink-0', textContent: 'انتخاب کلاس:' });
    const classSelect = createElement('select', {
      className: 'bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E98A15] max-w-xs',
    });

    classes.forEach((c) => {
      const opt = createElement('option', { textContent: `${c.name} (${c.gradeLevel})`, attributes: { value: c.id } });
      if (c.id === selectedClassId) opt.setAttribute('selected', 'true');
      classSelect.appendChild(opt);
    });

    classSelect.addEventListener('change', (e) => {
      selectedClassId = (e.target as HTMLSelectElement).value;
      render();
    });

    toolbar.appendChild(classLabel);
    toolbar.appendChild(classSelect);

    // Timetable Grid Table
    const tableContainer = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-x-auto' });
    const table = createElement('table', { className: 'polaris-table min-w-[700px]' });

    const thead = createElement('thead');
    const headerTr = createElement('tr');
    headerTr.appendChild(createElement('th', { className: 'w-32 text-center', textContent: 'روز / زنگ' }));

    periodsMap.forEach((p) => {
      headerTr.appendChild(createElement('th', { className: 'text-center', textContent: p.label }));
    });
    thead.appendChild(headerTr);
    table.appendChild(thead);

    const tbody = createElement('tbody');

    daysMap.forEach((day) => {
      const tr = createElement('tr');
      const dayTd = createElement('td', { className: 'font-extrabold text-xs text-gray-900 text-center bg-gray-50/80', textContent: day.title });
      tr.appendChild(dayTd);

      periodsMap.forEach((period) => {
        const slot = classSlots.find((s) => s.dayOfWeek === day.key && s.periodNumber === period.num);
        const td = createElement('td', { className: 'text-center p-2' });

        if (slot) {
          const slotBox = createElement('div', {
            className: 'p-2.5 rounded-xl bg-[#ECE5F0]/70 border border-[#012622]/20 text-right space-y-1 relative group shadow-2xs',
          });
          slotBox.innerHTML = `
            <div class="font-bold text-xs text-[#012622]">${slot.subjectName}</div>
            <div class="text-[10px] text-gray-600 font-medium">${slot.teacherName}</div>
            <div class="text-[10px] text-gray-500 font-mono">اتاق ${slot.roomNumber}</div>
          `;
          td.appendChild(slotBox);
        } else {
          const emptyBtn = createElement('button', {
            className: 'w-full py-3 rounded-xl border border-dashed border-gray-200 text-gray-400 hover:border-[#012622] hover:text-[#012622] text-[11px] font-bold transition-all cursor-pointer',
            textContent: '+ جدید',
          });
          emptyBtn.addEventListener('click', () => openAddSlotModal(day.key, period.num));
          td.appendChild(emptyBtn);
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(toolbar);
    rootWrapper.appendChild(tableContainer);
  };

  const openAddSlotModal = (presetDay?: TimetableSlot['dayOfWeek'], presetPeriod?: number) => {
    if (!selectedClassId) return;

    const form = createElement('form', { className: 'space-y-3.5 dir-rtl text-xs text-gray-800' });

    form.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">روز هفته *</label>
          <select id="slot-day" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs">
            ${daysMap
              .map((d) => `<option value="${d.key}" ${presetDay === d.key ? 'selected' : ''}>${d.title}</option>`)
              .join('')}
          </select>
        </div>
        <div>
          <label class="block font-bold mb-1">زنگ آموزشی *</label>
          <select id="slot-period" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs">
            ${periodsMap
              .map((p) => `<option value="${p.num}" ${presetPeriod === p.num ? 'selected' : ''}>${p.label}</option>`)
              .join('')}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">درس آموزشی *</label>
          <select id="slot-subject" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs">
            ${subjects.map((sb) => `<option value="${sb.id}">${sb.name} (${sb.gradeLevel})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-bold mb-1">استاد / مدرس *</label>
          <select id="slot-teacher" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs">
            ${staff.map((st) => `<option value="${st.id}">${st.fullName} (${st.roleTitle})</option>`).join('')}
          </select>
        </div>
      </div>

      <div>
        <label class="block font-bold mb-1">شماره اتاق</label>
        <input type="text" id="slot-room" value="۱۰۱" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs font-mono" />
      </div>
    `;

    const modal = new Modal({
      title: 'افزودن زنگ درسی به برنامه هفتگی',
      content: form,
      confirmText: 'بررسی و ثبت',
      cancelText: 'انصراف',
      onConfirm: () => {
        const dayOfWeek = (form.querySelector('#slot-day') as HTMLSelectElement).value as TimetableSlot['dayOfWeek'];
        const periodNumber = parseInt((form.querySelector('#slot-period') as HTMLSelectElement).value, 10);
        const subjectId = (form.querySelector('#slot-subject') as HTMLSelectElement).value;
        const teacherId = (form.querySelector('#slot-teacher') as HTMLSelectElement).value;
        const roomNumber = (form.querySelector('#slot-room') as HTMLInputElement).value.trim();

        const sbjObj = subjects.find((sb) => sb.id === subjectId);
        const tchObj = staff.find((st) => st.id === teacherId);

        // Schedule Conflict Validation
        const conflict = schoolStore.checkTimetableConflict(orgId, dayOfWeek, periodNumber, selectedClassId, teacherId);

        if (conflict.hasConflict) {
          showToast({ title: 'تداخل زمان‌بندی!', message: conflict.reason || 'تداخل در برنامه زمان‌بندی شناسایی شد.', type: 'error' });
          return;
        }

        const periodLabel = periodsMap.find((p) => p.num === periodNumber)?.label.split('(')[1]?.replace(')', '') || '۰۸:۰۰ - ۰۹:۳۰';

        schoolStore.addTimetableSlot({
          organizationId: orgId,
          classId: selectedClassId,
          dayOfWeek,
          periodNumber,
          timeLabel: periodLabel,
          subjectId,
          subjectName: sbjObj ? sbjObj.name : 'درس نامشخص',
          teacherId,
          teacherName: tchObj ? tchObj.fullName : 'استاد نامشخص',
          roomNumber: roomNumber || '۱۰۱',
        });

        showToast({ title: 'ثبت شد', message: 'زنگ درسی با موفقیت به برنامه هفتگی اضافه شد.', type: 'success' });
        render();
      },
    });

    modal.open();
  };

  render();
  return rootWrapper;
}
