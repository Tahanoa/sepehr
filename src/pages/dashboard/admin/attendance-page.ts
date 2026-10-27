/**
 * POLARIS ATTENDANCE MANAGEMENT PAGE
 * Daily attendance recording and monitoring, class filtering, status updates
 * (Present, Absent, Late, Excused), distinction between recorded vs unsubmitted attendance,
 * live summary recalculations, and weekly trend visualizations.
 */

import { OrganizationMembership } from '../../../types/auth';
import { AttendanceStatus } from '../../../types/school';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { showToast } from '../../../components/toast';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createAttendancePage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  const classes = schoolStore.getClasses(orgId);
  const students = schoolStore.getStudents(orgId);

  let selectedClassId = classes.length > 0 ? classes[0]!.id : '';
  let selectedDate = '۱۴۰۲/۱۲/۰۱'; // Current demo date

  // Local draft status for current class & date
  let localDrafts: Record<string, { status: AttendanceStatus; notes?: string }> = {};

  const initLocalDrafts = (clsId: string, date: string) => {
    localDrafts = {};
    const existing = schoolStore.getAttendance(orgId).filter((a) => a.classId === clsId && a.date === date);
    const classStudents = students.filter((s) => s.classId === clsId);

    classStudents.forEach((std) => {
      const rec = existing.find((a) => a.studentId === std.id);
      if (rec) {
        const item: { status: AttendanceStatus; notes?: string } = { status: rec.status };
        if (rec.notes) item.notes = rec.notes;
        localDrafts[std.id] = item;
      } else {
        localDrafts[std.id] = { status: 'present' };
      }
    });
  };

  const render = () => {
    rootWrapper.innerHTML = '';

    const selectedClassObj = classes.find((c) => c.id === selectedClassId);
    const classStudents = students.filter((s) => s.classId === selectedClassId);

    const allAttendance = schoolStore.getAttendance(orgId);
    const isSubmitted = allAttendance.some((a) => a.classId === selectedClassId && a.date === selectedDate && a.submitted);

    // Compute status counts from localDrafts
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;

    classStudents.forEach((std) => {
      const draft = localDrafts[std.id];
      if (draft) {
        if (draft.status === 'present') presentCount++;
        else if (draft.status === 'absent') absentCount++;
        else if (draft.status === 'late') lateCount++;
        else if (draft.status === 'excused') excusedCount++;
      }
    });

    // Header Row
    const headerRow = createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    const title = createElement('h2', {
      className: 'text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5',
    });
    title.innerHTML = `${getDashboardIcon('attendance', 'w-6 h-6 text-[#012622]')} ثبت و مدیریت حضور و غیاب روزانه`;

    const desc = createElement('p', {
      className: 'text-xs sm:text-sm text-gray-600 font-normal',
      textContent: 'ثبت آنلاین وضعیت حضور، غیبت غیرمجاز، تأخیر ورودی و مرخصی موجه دانش‌آموزان به تفکیک کلاس.',
    });

    headerText.appendChild(title);
    headerText.appendChild(desc);

    const submitBtn = createElement('button', {
      className:
        'px-5 py-2.5 bg-[#012622] hover:bg-[#003B36] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
      innerHTML: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> ثبت نهایی حضور و غیاب`,
    });
    submitBtn.addEventListener('click', () => {
      if (!selectedClassObj) return;

      const entries = classStudents.map((std) => {
        const draft = localDrafts[std.id];
        const entry: { studentId: string; studentName: string; status: AttendanceStatus; notes?: string } = {
          studentId: std.id,
          studentName: std.fullName,
          status: draft?.status || 'present',
        };
        if (draft?.notes) entry.notes = draft.notes;
        return entry;
      });

      schoolStore.recordAttendance(orgId, selectedClassId, selectedDate, entries, membership.organization.name);
      showToast({ title: 'ثبت شد', message: `حضور و غیاب ${selectedClassObj.name} با موفقیت نهایی گردید.`, type: 'success' });
      render();
    });

    headerRow.appendChild(headerText);
    headerRow.appendChild(submitBtn);

    // Filter Controls
    const toolbar = createElement('div', {
      className: 'bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3 items-center',
    });

    // Class Select
    const classSelectGroup = createElement('div', { className: 'space-y-1' });
    const classLabel = createElement('label', { className: 'block text-[11px] font-bold text-gray-600', textContent: 'انتخاب کلاس:' });
    const classSelect = createElement('select', {
      className: 'w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
    });

    classes.forEach((c) => {
      const opt = createElement('option', { textContent: `${c.name} (${c.gradeLevel})`, attributes: { value: c.id } });
      if (c.id === selectedClassId) opt.setAttribute('selected', 'true');
      classSelect.appendChild(opt);
    });

    classSelect.addEventListener('change', (e) => {
      selectedClassId = (e.target as HTMLSelectElement).value;
      initLocalDrafts(selectedClassId, selectedDate);
      render();
    });

    classSelectGroup.appendChild(classLabel);
    classSelectGroup.appendChild(classSelect);

    // Date Select
    const dateGroup = createElement('div', { className: 'space-y-1' });
    const dateLabel = createElement('label', { className: 'block text-[11px] font-bold text-gray-600', textContent: 'تاریخ ارزیابی:' });
    const dateInput = createElement('input', {
      className: 'w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
      attributes: { type: 'text', value: selectedDate },
    });
    dateInput.addEventListener('change', (e) => {
      selectedDate = (e.target as HTMLInputElement).value;
      initLocalDrafts(selectedClassId, selectedDate);
      render();
    });

    dateGroup.appendChild(dateLabel);
    dateGroup.appendChild(dateInput);

    // Submission Status Badge
    const statusBox = createElement('div', { className: 'sm:text-left flex items-center justify-end gap-2' });
    const statusBadge = createElement('span', {
      className: `px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 ${
        isSubmitted ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
      }`,
      innerHTML: isSubmitted
        ? `✓ نهایی و ثبت شده`
        : `⏳ ثبت پیش‌نویس (ارسال نشده)`,
    });
    statusBox.appendChild(statusBadge);

    toolbar.appendChild(classSelectGroup);
    toolbar.appendChild(dateGroup);
    toolbar.appendChild(statusBox);

    // Live Metrics Cards
    const metricsGrid = createElement('div', {
      className: 'grid grid-cols-2 sm:grid-cols-4 gap-3.5',
    });

    const m1 = createElement('div', { className: 'bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 text-center' });
    m1.innerHTML = `<div class="text-[11px] font-bold text-emerald-800">حاضرین</div><div class="text-xl font-black font-mono text-emerald-950 mt-1">${presentCount.toLocaleString('fa-IR')}</div>`;

    const m2 = createElement('div', { className: 'bg-rose-50 border border-rose-200/80 rounded-2xl p-3.5 text-center' });
    m2.innerHTML = `<div class="text-[11px] font-bold text-rose-800">غایبین غیرمجاز</div><div class="text-xl font-black font-mono text-rose-950 mt-1">${absentCount.toLocaleString('fa-IR')}</div>`;

    const m3 = createElement('div', { className: 'bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-center' });
    m3.innerHTML = `<div class="text-[11px] font-bold text-amber-800">تأخیر ورودی</div><div class="text-xl font-black font-mono text-amber-950 mt-1">${lateCount.toLocaleString('fa-IR')}</div>`;

    const m4 = createElement('div', { className: 'bg-blue-50 border border-blue-200/80 rounded-2xl p-3.5 text-center' });
    m4.innerHTML = `<div class="text-[11px] font-bold text-blue-800">غایب موجه / مرخصی</div><div class="text-xl font-black font-mono text-blue-950 mt-1">${excusedCount.toLocaleString('fa-IR')}</div>`;

    metricsGrid.appendChild(m1);
    metricsGrid.appendChild(m2);
    metricsGrid.appendChild(m3);
    metricsGrid.appendChild(m4);

    // Student Roster Table
    const tableCard = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden' });
    const table = createElement('table', { className: 'polaris-table' });

    table.innerHTML = `
      <thead>
        <tr>
          <th>نام دانش‌آموز</th>
          <th class="text-center">کد دانش‌آموزی</th>
          <th class="text-center">وضعیت حضور</th>
          <th>توضیحات و علت غیبت</th>
        </tr>
      </thead>
    `;

    const tbody = createElement('tbody');

    if (classStudents.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-gray-500 py-6">دانش‌آموزی در این کلاس یافت نشد.</td></tr>`;
    } else {
      classStudents.forEach((std) => {
        const tr = createElement('tr');

        const currentStatus = localDrafts[std.id]?.status || 'present';

        // Student Info cell
        const nameTd = createElement('td', {
          innerHTML: `
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-[#012622] text-white font-bold flex items-center justify-center text-xs shrink-0">${std.fullName.slice(0, 1)}</div>
              <span class="font-bold text-xs text-gray-900">${std.fullName}</span>
            </div>
          `,
        });

        // Code cell
        const codeTd = createElement('td', { className: 'text-center font-mono text-xs text-gray-600', textContent: std.studentCode });

        // Status choices cell
        const statusTd = createElement('td', { className: 'text-center' });

        const btnGroup = createElement('div', { className: 'inline-flex items-center rounded-xl p-1 bg-gray-100 border border-gray-200 gap-1' });

        const statuses: { key: AttendanceStatus; label: string; activeClass: string }[] = [
          { key: 'present', label: 'حاضر', activeClass: 'bg-emerald-700 text-white font-black shadow-2xs' },
          { key: 'absent', label: 'غایب', activeClass: 'bg-rose-700 text-white font-black shadow-2xs' },
          { key: 'late', label: 'تأخیر', activeClass: 'bg-amber-600 text-white font-black shadow-2xs' },
          { key: 'excused', label: 'موجه', activeClass: 'bg-blue-600 text-white font-black shadow-2xs' },
        ];

        statuses.forEach((st) => {
          const isSelected = currentStatus === st.key;
          const btn = createElement('button', {
            className: `px-2.5 py-1 text-[11px] rounded-lg transition-all cursor-pointer ${
              isSelected ? st.activeClass : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`,
            textContent: st.label,
          });

          btn.addEventListener('click', () => {
            localDrafts[std.id] = { ...localDrafts[std.id], status: st.key };
            render();
          });

          btnGroup.appendChild(btn);
        });

        statusTd.appendChild(btnGroup);

        // Notes cell
        const notesTd = createElement('td');
        const notesInput = createElement('input', {
          className: 'w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#E98A15]',
          attributes: { type: 'text', placeholder: 'ثبت علت غیبت/تأخیر...', value: localDrafts[std.id]?.notes || '' },
        });

        notesInput.addEventListener('input', (e) => {
          const val = (e.target as HTMLInputElement).value;
          localDrafts[std.id] = { ...localDrafts[std.id], status: localDrafts[std.id]?.status || 'present', notes: val };
        });

        notesTd.appendChild(notesInput);

        tr.appendChild(nameTd);
        tr.appendChild(codeTd);
        tr.appendChild(statusTd);
        tr.appendChild(notesTd);

        tbody.appendChild(tr);
      });
    }

    table.appendChild(tbody);
    tableCard.appendChild(table);

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(toolbar);
    rootWrapper.appendChild(metricsGrid);
    rootWrapper.appendChild(tableCard);
  };

  initLocalDrafts(selectedClassId, selectedDate);
  render();
  return rootWrapper;
}
