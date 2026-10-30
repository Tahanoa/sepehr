import { createStudentSchedule } from '../student/student-schedule';
import { confirmAction } from '../../../components/feedback';
/**
 * POLARIS TIMETABLE & SCHEDULING PAGE
 * Full Administrator Weekly Schedule Manager with 3 connected views:
 * 1. Class Timetables («برنامه کلاس‌ها»)
 * 2. Teacher Timetables («برنامه دبیران و معلمان»)
 * 3. Schedule Settings & Periods Configuration («تنظیمات زنگ‌ها و روزهای آموزشی»)
 * Real-time synchronization across class, teacher, student, and parent views,
 * dynamic period structure management, and strict conflict detection.
 */

import { OrganizationMembership } from '../../../types/auth';
import { PeriodDefinition, ScheduleConfig, TimetableSlot, WeekDay } from '../../../types/school';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { authService } from '../../../services/auth-service';
import { AccessPolicy } from '../../../services/access-policy';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';
import { getDashboardIcon } from '../../../components/dashboard/icons';

const ALL_WEEKDAYS: { key: WeekDay; title: string }[] = [
  { key: 'saturday', title: 'شنبه' },
  { key: 'sunday', title: 'یکشنبه' },
  { key: 'monday', title: 'دوشنبه' },
  { key: 'tuesday', title: 'سه‌شنبه' },
  { key: 'wednesday', title: 'چهارشنبه' },
  { key: 'thursday', title: 'پنج‌شنبه' },
  { key: 'friday', title: 'جمعه' },
];

export function createTimetablePage(membership: OrganizationMembership): HTMLElement {
  if(membership.role==='student'||membership.role==='parent')return createStudentSchedule(membership);
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in pb-12' });
  const orgId = membership.organizationId;
  const currentUser = authService.getCurrentUser();

  const isManagement = AccessPolicy.canManageOrgRecords(membership);
  const isTeacherRole = membership.role === 'teacher' || membership.role === 'instructor';
  let classes = schoolStore.getClasses(orgId);
  const teacherIdentity=currentUser?schoolStore.getStaffByEmailOrPhone(orgId,currentUser.email||currentUser.phone||currentUser.id):null;
  const staff = schoolStore.getStaff(orgId).filter(st=>!isTeacherRole||st.id===teacherIdentity?.id);
  const subjects = schoolStore.getSubjects(orgId);
  // Teacher filtered classes
  if (isTeacherRole && currentUser) {
    const teacherClasses = schoolStore.getTeacherClasses(orgId, currentUser.email || currentUser.phone || currentUser.id);
    classes = teacherClasses;
  }

  // Active Tab & Selection States
  let activeTab: 'class' | 'teacher' | 'config' = isTeacherRole ? 'teacher' : 'class';
  let selectedClassId = (classes[0] ? classes[0].id : '');

  // Find staff record for current teacher user if applicable
  const currentTeacherStaff = currentUser ? schoolStore.getStaffByEmailOrPhone(orgId, currentUser.email || currentUser.phone || currentUser.id) : null;
  let selectedTeacherId = currentTeacherStaff ? currentTeacherStaff.id : (staff[0] ? staff[0].id : '');

  const render = () => {
    rootWrapper.innerHTML = '';

    const config = schoolStore.getScheduleConfig(orgId);
    const activeDaysKeys: WeekDay[] = config.activeDays && config.activeDays.length > 0
      ? config.activeDays
      : ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday'];

    const activeDaysList = ALL_WEEKDAYS.filter((d) => activeDaysKeys.includes(d.key));
    const periodsList: PeriodDefinition[] = config.periods && config.periods.length > 0
      ? config.periods
      : schoolStore.generateDefaultPeriods(config.periodsCount || 4, config.startTime || '08:00', config.periodDurationMinutes || 90, config.breakDurationMinutes || 20);

    const timetableSlots = schoolStore.getTimetable(orgId);

    // Header Row
    const headerRow = createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    const title = createElement('h2', {
      className: 'text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5',
    });
    title.innerHTML = `${getDashboardIcon('calendar', 'w-6 h-6 text-[rgb(var(--theme-primary))]')} ${isManagement?'مدیریت برنامه هفتگی':'برنامه تدریس من'}`;

    const desc = createElement('p', {
      className: 'text-xs sm:text-sm text-gray-600 font-normal',
      textContent: isManagement
        ? 'مدیریت زنگ‌ها، روزهای فعال، برنامه درسی کلاس‌ها و برنامه تدریس معلمان با سیستم هوشمند پیشگیری از تداخل.'
        : 'مشاهده برنامه هفتگی و زمان‌بندی رسمی کلاس‌های آموزشی.',
    });

    headerText.appendChild(title);
    headerText.appendChild(desc);

    const actionGroup = createElement('div', { className: 'flex items-center gap-2 flex-wrap' });

    if (isManagement) {
      const publishBtn = createElement('button', {
        className: `px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
          config.isPublished
            ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
            : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
        }`,
        innerHTML: config.isPublished
          ? `✅ برنامه منتشر شده (کلیک برای پیش‌نویس)`
          : `⏳ حالت پیش‌نویس (کلیک برای انتشار)`,
      });
      publishBtn.addEventListener('click', () => {
        schoolStore.updateScheduleConfig(orgId, { isPublished: !config.isPublished });
        showToast({
          title: config.isPublished ? 'تغییر به پیش‌نویس' : 'برنامه منتشر شد',
          message: config.isPublished ? 'برنامه به حالت پیش‌نویس تغییر یافت.' : 'برنامه هفتگی برای دانش‌آموزان، معلمان و اولیا منتشر گردید.',
          type: 'success',
        });
        render();
      });

      actionGroup.appendChild(publishBtn);
    } else {
      const statusBadge = createElement('span', {
        className: `px-3 py-1.5 rounded-xl text-xs font-bold ${
          config.isPublished ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
        }`,
        textContent: config.isPublished ? 'برنامه رسمی منتشر شده' : 'پیش‌نویس (غیرقابل مشاهده عمومی)',
      });
      actionGroup.appendChild(statusBadge);
    }

    headerRow.appendChild(headerText);
    headerRow.appendChild(actionGroup);

    // Tab Navigation Bar for Management
    if (isManagement) {
      const tabsNav = createElement('div', { className: 'flex items-center gap-2 border-b border-gray-200 pb-1' });

      const classTab = createElement('button', {
        className: `px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
          activeTab === 'class' ? 'bg-[rgb(var(--theme-primary))] text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`,
        textContent: 'برنامه کلاس‌ها',
      });
      classTab.addEventListener('click', () => { activeTab = 'class'; render(); });

      const teacherTab = createElement('button', {
        className: `px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
          activeTab === 'teacher' ? 'bg-[rgb(var(--theme-primary))] text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`,
        textContent: 'برنامه دبیران و معلمان',
      });
      teacherTab.addEventListener('click', () => { activeTab = 'teacher'; render(); });

      const configTab = createElement('button', {
        className: `px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
          activeTab === 'config' ? 'bg-[rgb(var(--theme-primary))] text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`,
        textContent: 'تنظیمات زنگ‌ها و روزهای آموزشی',
      });
      configTab.addEventListener('click', () => { activeTab = 'config'; render(); });

      tabsNav.appendChild(classTab);
      tabsNav.appendChild(teacherTab);
      tabsNav.appendChild(configTab);

      rootWrapper.appendChild(headerRow);
      rootWrapper.appendChild(tabsNav);
    } else {
      rootWrapper.appendChild(headerRow);
    }

    // VIEW 3: SCHEDULE CONFIGURATION & PERIODS EDITOR
    if (isManagement && activeTab === 'config') {
      rootWrapper.appendChild(renderScheduleConfigView(config, periodsList, activeDaysKeys));
      return;
    }

    // VIEW 1 & 2: CLASS / TEACHER TIMETABLE GRID
    const toolbar = createElement('div', {
      className: 'bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3',
    });

    const selectorBox = createElement('div', { className: 'flex items-center gap-3 w-full sm:w-auto' });

    if (activeTab === 'teacher' || (isTeacherRole && !isManagement)) {
      const teacherLabel = createElement('label', { className: 'text-xs font-bold text-gray-700 shrink-0', textContent: 'دبیر / مدرس:' });
      const teacherSelect = createElement('select', {
        className: 'bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))] max-w-xs',
      });

      staff.forEach((st) => {
        const opt = createElement('option', { textContent: `${st.fullName} (${st.roleTitle})`, attributes: { value: st.id } });
        if (st.id === selectedTeacherId) opt.setAttribute('selected', 'true');
        teacherSelect.appendChild(opt);
      });

      teacherSelect.addEventListener('change', (e) => {
        selectedTeacherId = (e.target as HTMLSelectElement).value;
        render();
      });

      selectorBox.appendChild(teacherLabel);
      selectorBox.appendChild(teacherSelect);
    } else {
      const classLabel = createElement('label', { className: 'text-xs font-bold text-gray-700 shrink-0', textContent: 'انتخاب کلاس:' });
      const classSelect = createElement('select', {
        className: 'bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))] max-w-xs',
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

      selectorBox.appendChild(classLabel);
      selectorBox.appendChild(classSelect);
    }

    const timingBadge = createElement('div', {
      className: 'text-xs font-mono font-bold text-gray-600 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200',
      textContent: `تعداد زنگ‌ها: ${periodsList.length.toLocaleString('fa-IR')} | روزهای فعال: ${activeDaysList.length.toLocaleString('fa-IR')} روز`,
    });

    toolbar.appendChild(selectorBox);
    toolbar.appendChild(timingBadge);

    // Filter Slots based on active view
    let displaySlots = timetableSlots;
    if (activeTab === 'teacher' || (isTeacherRole && !isManagement)) {
      displaySlots = timetableSlots.filter((s) => s.teacherId === selectedTeacherId);
    } else {
      displaySlots = timetableSlots.filter((s) => s.classId === selectedClassId);
    }

    // Timetable Grid Table
    const tableContainer = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-x-auto' });
    const table = createElement('table', { className: 'polaris-table min-w-[700px] w-full' });

    const thead = createElement('thead');
    const headerTr = createElement('tr');
    headerTr.appendChild(createElement('th', { className: 'w-32 text-center', textContent: 'روز / زنگ' }));

    periodsList.forEach((p) => {
      headerTr.appendChild(createElement('th', { className: 'text-center', textContent: p.name || `زنگ ${p.number}` }));
    });
    thead.appendChild(headerTr);
    table.appendChild(thead);

    const tbody = createElement('tbody');

    activeDaysList.forEach((day) => {
      const tr = createElement('tr');
      const dayTd = createElement('td', { className: 'font-semibold text-xs text-gray-900 text-center bg-gray-50/80', textContent: day.title });
      tr.appendChild(dayTd);

      periodsList.forEach((period) => {
        const td = createElement('td', { className: 'text-center p-2' });

        if (period.isBreak) {
          td.innerHTML = `<span class="text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded-lg font-bold">☕ زنگ تفریح</span>`;
          tr.appendChild(td);
          return;
        }

        const slot = displaySlots.find((s) => s.dayOfWeek === day.key && s.periodNumber === period.number);

        if (slot) {
          const clsObj = classes.find((c) => c.id === slot.classId);
          const slotBox = createElement('div', {
            className: 'p-2.5 rounded-xl bg-[rgb(var(--theme-subtle))]/80 border border-[rgb(var(--theme-primary))]/20 text-right space-y-1 relative group shadow-2xs hover:border-[rgb(var(--theme-primary))] transition-all cursor-pointer',
          });
          slotBox.innerHTML = `
            <div class="font-bold text-xs text-[rgb(var(--theme-primary))]">${slot.subjectName}</div>
            <div class="text-[10px] text-gray-600 font-medium">${activeTab === 'teacher' ? `کلاس: ${clsObj ? clsObj.name : 'نامشخص'}` : slot.teacherName}</div>
            <div class="text-[10px] text-gray-500 font-mono">${slot.timeLabel || `${period.startTime} - ${period.endTime}`} | ${slot.roomNumber || '۱۰۱'}</div>
          `;

          if (isManagement) {
            slotBox.addEventListener('click', () => openSlotModal(periodsList, day.key, period.number, slot));
          }

          td.appendChild(slotBox);
        } else {
          if (isManagement) {
            const emptyBtn = createElement('button', {
              className: 'w-full py-3 rounded-xl border border-dashed border-gray-200 text-gray-400 hover:border-[rgb(var(--theme-primary))] hover:text-[rgb(var(--theme-primary))] text-[11px] font-bold transition-all cursor-pointer',
              textContent: '+ افزودن درس',
            });
            emptyBtn.addEventListener('click', () => openSlotModal(periodsList, day.key, period.number));
            td.appendChild(emptyBtn);
          } else {
            td.innerHTML = `<span class="text-xs text-gray-300 font-bold">—</span>`;
          }
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);

    rootWrapper.appendChild(toolbar);
    rootWrapper.appendChild(tableContainer);
  };

  // --- VIEW 3: CONFIGURATION FORM ---
  const renderScheduleConfigView = (_config: ScheduleConfig, periods: PeriodDefinition[], activeDays: WeekDay[]): HTMLElement => {
    const container = createElement('div', { className: 'space-y-6 dir-rtl text-xs' });

    // Active Weekdays Config Card
    const daysCard = createElement('div', { className: 'bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3' });
    daysCard.innerHTML = `
      <h3 class="font-semibold text-sm text-[rgb(var(--theme-primary))] flex items-center gap-2">
        📅 روزهای آموزشی فعال مدرسه / مرکز
      </h3>
      <p class="text-gray-500 text-[11px]">روزهایی که کلاس‌های آموزشی در آن‌ها برگزار می‌شوند را مشخص کنید.</p>

      <div class="flex items-center gap-3 flex-wrap pt-2">
        ${ALL_WEEKDAYS.map((d) => {
          const isActive = activeDays.includes(d.key);
          return `
            <label class="p-2.5 px-4 rounded-xl border ${isActive ? 'bg-[rgb(var(--theme-primary))] text-white border-[rgb(var(--theme-primary))]' : 'bg-gray-50 text-gray-700 border-gray-200'} flex items-center gap-2 cursor-pointer font-bold transition-all">
              <input type="checkbox" value="${d.key}" class="day-chk text-[rgb(var(--theme-accent))]" ${isActive ? 'checked' : ''} />
              <span>${d.title}</span>
            </label>
          `;
        }).join('')}
      </div>
    `;

    daysCard.querySelectorAll('.day-chk').forEach((chk) => {
      chk.addEventListener('change', () => {
        const selectedDays = Array.from(daysCard.querySelectorAll('.day-chk:checked')).map((el) => (el as HTMLInputElement).value as WeekDay);
        schoolStore.updateScheduleConfig(orgId, { activeDays: selectedDays });
        showToast({ title: 'بروز شد', message: 'روزهای کاری فعال تغییر یافت.', type: 'info' });
        render();
      });
    });

    // Periods Structure Card
    const periodsCard = createElement('div', { className: 'bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4' });
    const pHeader = createElement('div', { className: 'flex items-center justify-between border-b border-gray-100 pb-3' });
    pHeader.innerHTML = `
      <div>
        <h3 class="font-semibold text-sm text-[rgb(var(--theme-primary))]">⏰ زنگ‌های درسی و تفریح</h3>
        <p class="text-gray-500 text-[11px]">تعریف نام، زمان شروع و پایان و نوع زنگ (آموزشی یا تفریح).</p>
      </div>
      <button type="button" id="btn-add-period" class="px-3.5 py-2 bg-[rgb(var(--theme-primary))] hover:bg-[rgb(var(--theme-hover))] text-white font-bold rounded-xl text-xs transition-all cursor-pointer">
        + افزودن زنگ جدید
      </button>
    `;

    const pList = createElement('div', { className: 'space-y-3' });

    periods.forEach((p, idx) => {
      const row = createElement('div', { className: 'p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3' });

      row.innerHTML = `
        <div class="flex items-center gap-2 flex-1">
          <span class="w-6 h-6 rounded-full bg-[rgb(var(--theme-primary))] text-white flex items-center justify-center font-bold text-xs font-mono">${(idx + 1).toLocaleString('fa-IR')}</span>
          <input type="text" value="${p.name}" class="p-name-input bg-white border border-gray-300 rounded-lg p-1.5 text-xs font-bold w-48" placeholder="نام زنگ..." />
        </div>

        <div class="flex items-center gap-3">
          <div>
            <span class="text-[10px] text-gray-500 font-bold block">زمان شروع:</span>
            <input type="text" value="${p.startTime}" class="p-start-input bg-white border border-gray-300 rounded-lg p-1.5 text-xs font-mono font-bold w-20 text-center" />
          </div>
          <div>
            <span class="text-[10px] text-gray-500 font-bold block">زمان پایان:</span>
            <input type="text" value="${p.endTime}" class="p-end-input bg-white border border-gray-300 rounded-lg p-1.5 text-xs font-mono font-bold w-20 text-center" />
          </div>

          <label class="flex items-center gap-1.5 cursor-pointer font-bold text-amber-900 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
            <input type="checkbox" class="p-break-input" ${p.isBreak ? 'checked' : ''} />
            <span>زنگ تفریح</span>
          </label>

          <button type="button" class="btn-del-period p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold cursor-pointer" title="حذف زنگ">🗑️</button>
        </div>
      `;

      // Handlers
      const nameInput = row.querySelector('.p-name-input') as HTMLInputElement;
      const startInput = row.querySelector('.p-start-input') as HTMLInputElement;
      const endInput = row.querySelector('.p-end-input') as HTMLInputElement;
      const breakInput = row.querySelector('.p-break-input') as HTMLInputElement;

      const savePeriodsChange = () => {
        p.name = nameInput.value;
        p.startTime = startInput.value;
        p.endTime = endInput.value;
        p.isBreak = breakInput.checked;
        schoolStore.updateScheduleConfig(orgId, { periods });
      };

      nameInput.addEventListener('input', savePeriodsChange);
      startInput.addEventListener('input', savePeriodsChange);
      endInput.addEventListener('input', savePeriodsChange);
      breakInput.addEventListener('change', savePeriodsChange);

      row.querySelector('.btn-del-period')!.addEventListener('click', async () => {
        if (await confirmAction(`آیا از حذف «${p.name}» اطمینان دارید؟`)) {
          const updatedPeriods = periods.filter((item) => item.id !== p.id);
          schoolStore.updateScheduleConfig(orgId, { periods: updatedPeriods });
          showToast({ title: 'حذف شد', message: 'زنگ انتخابی حذف گردید.', type: 'info' });
          render();
        }
      });

      pList.appendChild(row);
    });

    periodsCard.appendChild(pHeader);
    periodsCard.appendChild(pList);

    pHeader.querySelector('#btn-add-period')!.addEventListener('click', () => {
      const lastPeriod = periods[periods.length - 1];
      const newNum = periods.length + 1;
      const newPeriod: PeriodDefinition = {
        id: `p-${Date.now().toString(36)}`,
        number: newNum,
        name: `زنگ ${newNum.toLocaleString('fa-IR')}`,
        startTime: lastPeriod ? lastPeriod.endTime : '08:00',
        endTime: '10:00',
        isBreak: false,
      };
      periods.push(newPeriod);
      schoolStore.updateScheduleConfig(orgId, { periods });
      showToast({ title: 'افزوده شد', message: 'زنگ جدید به برنامه زمان‌بندی اضافه شد.', type: 'success' });
      render();
    });

    container.appendChild(daysCard);
    container.appendChild(periodsCard);

    return container;
  };

  // --- SLOT EDIT / ADD MODAL WITH STRICT CONFLICT VALIDATION ---
  const openSlotModal = (
    periodsList: PeriodDefinition[],
    presetDay?: WeekDay,
    presetPeriodNum?: number,
    existingSlot?: TimetableSlot
  ) => {
    const form = createElement('form', { className: 'space-y-3.5 dir-rtl text-xs text-gray-800' });

    const currentClassVal = existingSlot ? existingSlot.classId : selectedClassId;
    const currentTeacherVal = existingSlot ? existingSlot.teacherId : selectedTeacherId;

    form.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">کلاس / گروه آموزشی *</label>
          <select id="slot-class" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold">
            ${classes.map((c) => `<option value="${c.id}" ${currentClassVal === c.id ? 'selected' : ''}>${c.name} (${c.gradeLevel})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-bold mb-1">استاد / مدرس *</label>
          <select id="slot-teacher" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold">
            ${staff.map((st) => `<option value="${st.id}" ${currentTeacherVal === st.id ? 'selected' : ''}>${st.fullName} (${st.roleTitle})</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">روز هفته *</label>
          <select id="slot-day" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold">
            ${ALL_WEEKDAYS.map((d) => `<option value="${d.key}" ${(existingSlot ? existingSlot.dayOfWeek : presetDay) === d.key ? 'selected' : ''}>${d.title}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-bold mb-1">زنگ آموزشی *</label>
          <select id="slot-period" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold">
            ${periodsList.map((p) => `<option value="${p.number}" ${(existingSlot ? existingSlot.periodNumber : presetPeriodNum) === p.number ? 'selected' : ''}>${p.name} (${p.startTime} - ${p.endTime})</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">درس آموزشی *</label>
          <select id="slot-subject" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold">
            ${subjects.map((sb) => `<option value="${sb.id}" ${existingSlot && existingSlot.subjectId === sb.id ? 'selected' : ''}>${sb.name} (${sb.gradeLevel})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-bold mb-1">شماره اتاق / کلاس درس</label>
          <input type="text" id="slot-room" value="${existingSlot ? existingSlot.roomNumber : '۱۰۱'}" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-mono font-bold" />
        </div>
      </div>

      ${existingSlot ? `
        <div class="pt-2 border-t border-gray-100 flex items-center justify-between">
          <button type="button" id="btn-delete-slot" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-all cursor-pointer">
            حذف این زنگ
          </button>
          <span class="text-[10px] text-gray-500">ویرایش و ذخیره مقادیر.</span>
        </div>
      ` : ''}
    `;

    if (existingSlot) {
      const delBtn = form.querySelector('#btn-delete-slot');
      if (delBtn) {
        delBtn.addEventListener('click', async () => {
          if (await confirmAction('آیا از حذف این زنگ از برنامه هفتگی اطمینان دارید؟')) {
            schoolStore.deleteTimetableSlot(existingSlot.id);
            showToast({ title: 'حذف شد', message: 'زنگ درسی از برنامه هفتگی حذف گردید.', type: 'info' });
            modal.close();
            render();
          }
        });
      }
    }

    const modal = new Modal({
      title: existingSlot ? 'ویرایش زنگ درسی' : 'افزودن زنگ درسی به برنامه هفتگی',
      content: form,
      confirmText: existingSlot ? 'ذخیره تغییرات' : 'بررسی و ثبت زنگ',
      cancelText: 'انصراف',
      onConfirm: () => {
        const classId = (form.querySelector('#slot-class') as HTMLSelectElement).value;
        const teacherId = (form.querySelector('#slot-teacher') as HTMLSelectElement).value;
        const dayOfWeek = (form.querySelector('#slot-day') as HTMLSelectElement).value as WeekDay;
        const periodNumber = parseInt((form.querySelector('#slot-period') as HTMLSelectElement).value, 10);
        const subjectId = (form.querySelector('#slot-subject') as HTMLSelectElement).value;
        const roomNumber = (form.querySelector('#slot-room') as HTMLInputElement).value.trim();

        const sbjObj = subjects.find((sb) => sb.id === subjectId);
        const tchObj = staff.find((st) => st.id === teacherId);

        // Schedule Conflict Validation
        const conflict = schoolStore.checkTimetableConflict(
          orgId,
          dayOfWeek,
          periodNumber,
          classId,
          teacherId,
          existingSlot ? existingSlot.id : undefined,
          roomNumber
        );

        if (conflict.hasConflict) {
          showToast({ title: 'تداخل زمان‌بندی!', message: conflict.reason || 'تداخل در برنامه زمان‌بندی شناسایی شد.', type: 'error' });
          return;
        }

        const periodDef = periodsList.find((p) => p.number === periodNumber);
        const timeLabel = periodDef ? `${periodDef.startTime} - ${periodDef.endTime}` : '۰۸:۰۰ - ۰۹:۳۰';

        if (existingSlot) {
          schoolStore.updateTimetableSlot(existingSlot.id, {
            classId,
            dayOfWeek,
            periodNumber,
            timeLabel,
            subjectId,
            subjectName: sbjObj ? sbjObj.name : 'درس نامشخص',
            teacherId,
            teacherName: tchObj ? tchObj.fullName : 'استاد نامشخص',
            roomNumber: roomNumber || '۱۰۱',
          });
          showToast({ title: 'بروزرسانی شد', message: 'تغییرات زنگ درسی با موفقیت ثبت شد.', type: 'success' });
        } else {
          schoolStore.addTimetableSlot({
            organizationId: orgId,
            classId,
            dayOfWeek,
            periodNumber,
            timeLabel,
            subjectId,
            subjectName: sbjObj ? sbjObj.name : 'درس نامشخص',
            teacherId,
            teacherName: tchObj ? tchObj.fullName : 'استاد نامشخص',
            roomNumber: roomNumber || '۱۰۱',
          });
          showToast({ title: 'ثبت شد', message: 'زنگ درسی با موفقیت به برنامه هفتگی اضافه شد.', type: 'success' });
        }

        render();
      },
    });

    modal.open();
  };

  render();
  return rootWrapper;
}

