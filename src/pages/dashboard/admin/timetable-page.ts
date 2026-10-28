/**
 * POLARIS TIMETABLE & SCHEDULING PAGE
 * Full Administrator Weekly Schedule Manager with Class, Teacher, and Configuration views,
 * slot editing, real-time synchronization, and conflict validation.
 */

import { OrganizationMembership } from '../../../types/auth';
import { TimetableSlot, ScheduleConfig } from '../../../types/school';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { authService } from '../../../services/auth-service';
import { AccessPolicy } from '../../../services/access-policy';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createTimetablePage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;
  const currentUser = authService.getCurrentUser();

  const isManagement = AccessPolicy.canManageOrgRecords(membership);
  const isTeacher = membership.role === 'teacher' || membership.role === 'instructor';

  let classes = schoolStore.getClasses(orgId);
  if (isTeacher && currentUser) {
    classes = schoolStore.getTeacherClasses(orgId, currentUser.email || currentUser.phone || currentUser.id);
  }

  const subjects = schoolStore.getSubjects(orgId);
  const staff = schoolStore.getStaff(orgId);

  // Active Tab state for Admin
  let activeTab: 'class' | 'teacher' | 'config' = 'class';
  let selectedClassId = classes.length > 0 ? classes[0]!.id : '';
  let selectedTeacherId = staff.length > 0 ? staff[0]!.id : '';

  const daysMap: { key: TimetableSlot['dayOfWeek']; title: string }[] = [
    { key: 'saturday', title: 'شنبه' },
    { key: 'sunday', title: 'یکشنبه' },
    { key: 'monday', title: 'دوشنبه' },
    { key: 'tuesday', title: 'سه‌شنبه' },
    { key: 'wednesday', title: 'چهارشنبه' },
  ];

  // Calculate dynamic periods based on ScheduleConfig
  const getDynamicPeriods = (config: ScheduleConfig) => {
    const periods: { num: number; label: string; timeRange: string }[] = [];
    const [startH, startM] = config.startTime.split(':').map((n) => parseInt(n, 10));
    let currentTotalMin = (startH || 8) * 60 + (startM || 0);

    for (let p = 1; p <= config.periodsCount; p++) {
      const endTotalMin = currentTotalMin + config.periodDurationMinutes;

      const formatTime = (totalMin: number) => {
        const h = Math.floor(totalMin / 60) % 24;
        const m = totalMin % 60;
        const hStr = h < 10 ? '۰' + h.toLocaleString('fa-IR') : h.toLocaleString('fa-IR');
        const mStr = m < 10 ? '۰' + m.toLocaleString('fa-IR') : m.toLocaleString('fa-IR');
        return `${hStr}:${mStr}`;
      };

      const range = `${formatTime(currentTotalMin)} - ${formatTime(endTotalMin)}`;
      periods.push({
        num: p,
        label: `زنگ ${p.toLocaleString('fa-IR')} (${range})`,
        timeRange: range,
      });

      currentTotalMin = endTotalMin + config.breakDurationMinutes;
    }
    return periods;
  };

  const render = () => {
    rootWrapper.innerHTML = '';

    const config = schoolStore.getScheduleConfig(orgId);
    const periodsMap = getDynamicPeriods(config);
    const timetableSlots = schoolStore.getTimetable(orgId);

    // Header Row
    const headerRow = createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    const title = createElement('h2', {
      className: 'text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5',
    });
    title.innerHTML = `${getDashboardIcon('calendar', 'w-6 h-6 text-[#012622]')} مدیریت برنامه هفتگی`;

    const desc = createElement('p', {
      className: 'text-xs sm:text-sm text-gray-600 font-normal',
      textContent: 'تنظیم برنامه هفتگی کلاس‌ها، برنامه تدریس معلمان، ساعت زنگ‌ها و همگام‌سازی لحظه‌ای همپوشانی‌ها.',
    });

    headerText.appendChild(title);
    headerText.appendChild(desc);

    const actionGroup = createElement('div', { className: 'flex items-center gap-2' });

    if (isManagement) {
      const publishBtn = createElement('button', {
        className: `px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
          config.isPublished
            ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
            : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
        }`,
        innerHTML: config.isPublished
          ? `<svg class="w-4 h-4 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> منتشر شده`
          : `⏳ پیش‌نویس (کلیک برای انتشار)`,
      });
      publishBtn.addEventListener('click', () => {
        schoolStore.updateScheduleConfig(orgId, { isPublished: !config.isPublished });
        showToast({
          title: config.isPublished ? 'تغییر به پیش‌نویس' : 'برنامه منتشر شد',
          message: config.isPublished ? 'برنامه به حالت پیش‌نویس تغییر یافت.' : 'برنامه هفتگی جهت تمامی کاربران و اولیا منتشر گردید.',
          type: 'success',
        });
        render();
      });

      const addBtn = createElement('button', {
        className:
          'px-4 py-2.5 bg-[#012622] hover:bg-[#003B36] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
        innerHTML: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> افزودن زنگ جدید`,
      });
      addBtn.addEventListener('click', () => openSlotModal(config, periodsMap));

      actionGroup.appendChild(publishBtn);
      actionGroup.appendChild(addBtn);
    } else {
      const statusBadge = createElement('span', {
        className: `px-3 py-1.5 rounded-xl text-xs font-bold ${
          config.isPublished ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
        }`,
        textContent: config.isPublished ? 'برنامه منتشر شده' : 'پیش‌نویس (غیرقابل مشاهده عمومی)',
      });
      actionGroup.appendChild(statusBadge);
    }

    headerRow.appendChild(headerText);
    headerRow.appendChild(actionGroup);

    // Tab Navigation Bar for Management
    if (isManagement) {
      const tabsNav = createElement('div', { className: 'flex items-center gap-2 border-b border-gray-200 pb-1' });

      const classTab = createElement('button', {
        className: `px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
          activeTab === 'class' ? 'bg-[#012622] text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`,
        textContent: 'برنامه هفتگی کلاس‌ها',
      });
      classTab.addEventListener('click', () => {
        activeTab = 'class';
        render();
      });

      const teacherTab = createElement('button', {
        className: `px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
          activeTab === 'teacher' ? 'bg-[#012622] text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`,
        textContent: 'برنامه هفتگی معلمان',
      });
      teacherTab.addEventListener('click', () => {
        activeTab = 'teacher';
        render();
      });

      const configTab = createElement('button', {
        className: `px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
          activeTab === 'config' ? 'bg-[#012622] text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`,
        textContent: 'تنظیمات زنگ‌ها و ساعات',
      });
      configTab.addEventListener('click', () => {
        activeTab = 'config';
        render();
      });

      tabsNav.appendChild(classTab);
      tabsNav.appendChild(teacherTab);
      tabsNav.appendChild(configTab);

      rootWrapper.appendChild(headerRow);
      rootWrapper.appendChild(tabsNav);
    } else {
      rootWrapper.appendChild(headerRow);
    }

    // Config Tab View
    if (isManagement && activeTab === 'config') {
      const configCard = createElement('div', { className: 'bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs space-y-5 max-w-2xl' });
      configCard.innerHTML = `
        <h3 class="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
          ${getDashboardIcon('settings', 'w-4 h-4 text-[#E98A15]')} پیکربندی زنگ‌ها و زمان‌بندی روزانه
        </h3>

        <form id="schedule-config-form" class="space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold mb-1">تعداد زنگ‌ها در روز *</label>
              <input type="number" id="cfg-count" value="${config.periodsCount}" min="1" max="8" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-mono" />
            </div>
            <div>
              <label class="block font-bold mb-1">ساعت شروع اولین زنگ *</label>
              <input type="text" id="cfg-start" value="${config.startTime}" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-mono" placeholder="08:00" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block font-bold mb-1">مدت هر زنگ (دقیقه) *</label>
              <input type="number" id="cfg-duration" value="${config.periodDurationMinutes}" min="30" max="180" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-mono" />
            </div>
            <div>
              <label class="block font-bold mb-1">مدت زنگ تفریح (دقیقه) *</label>
              <input type="number" id="cfg-break" value="${config.breakDurationMinutes}" min="5" max="60" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-mono" />
            </div>
          </div>

          <div class="pt-3 border-t border-gray-100 flex justify-end">
            <button type="submit" class="px-5 py-2.5 bg-[#012622] hover:bg-[#003B36] text-white text-xs font-bold rounded-xl transition-all cursor-pointer">
              ذخیره تنظیمات زنگ‌ها
            </button>
          </div>
        </form>
      `;

      const cfgForm = configCard.querySelector('#schedule-config-form') as HTMLFormElement;
      cfgForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const periodsCount = parseInt((cfgForm.querySelector('#cfg-count') as HTMLInputElement).value, 10) || 4;
        const startTime = (cfgForm.querySelector('#cfg-start') as HTMLInputElement).value.trim() || '08:00';
        const periodDurationMinutes = parseInt((cfgForm.querySelector('#cfg-duration') as HTMLInputElement).value, 10) || 90;
        const breakDurationMinutes = parseInt((cfgForm.querySelector('#cfg-break') as HTMLInputElement).value, 10) || 20;

        schoolStore.updateScheduleConfig(orgId, { periodsCount, startTime, periodDurationMinutes, breakDurationMinutes });
        showToast({ title: 'ذخیره شد', message: 'تنظیمات ساعت و زنگ‌ها با موفقیت بروزرسانی شد.', type: 'success' });
        render();
      });

      rootWrapper.appendChild(configCard);
      return;
    }

    // Toolbar Selector
    const toolbar = createElement('div', {
      className: 'bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between gap-3',
    });

    const selectorBox = createElement('div', { className: 'flex items-center gap-3' });

    if (activeTab === 'teacher') {
      const teacherLabel = createElement('label', { className: 'text-xs font-bold text-gray-700 shrink-0', textContent: 'انتخاب معلم / مدرس:' });
      const teacherSelect = createElement('select', {
        className: 'bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E98A15] max-w-xs',
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
      const classLabel = createElement('label', { className: 'text-xs font-bold text-gray-700 shrink-0', textContent: isTeacher ? 'کلاس مدرس:' : 'انتخاب کلاس:' });
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

      selectorBox.appendChild(classLabel);
      selectorBox.appendChild(classSelect);
    }

    const timingBadge = createElement('div', {
      className: 'text-xs font-mono font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200',
      textContent: `شروع: ${config.startTime} | مدت زنگ: ${config.periodDurationMinutes} دقیقه‌`,
    });

    toolbar.appendChild(selectorBox);
    toolbar.appendChild(timingBadge);

    // Filter Slots
    let displaySlots = timetableSlots;
    if (activeTab === 'teacher') {
      displaySlots = timetableSlots.filter((s) => s.teacherId === selectedTeacherId);
    } else if (isTeacher && currentUser) {
      const staffMem = schoolStore.getStaffByEmailOrPhone(orgId, currentUser.email || currentUser.phone || currentUser.id);
      if (staffMem) {
        displaySlots = timetableSlots.filter((s) => s.teacherId === staffMem.id);
      } else {
        displaySlots = timetableSlots.filter((s) => s.classId === selectedClassId);
      }
    } else {
      displaySlots = timetableSlots.filter((s) => s.classId === selectedClassId);
    }

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
        const slot = displaySlots.find((s) => s.dayOfWeek === day.key && s.periodNumber === period.num);
        const td = createElement('td', { className: 'text-center p-2' });

        if (slot) {
          const clsObj = classes.find((c) => c.id === slot.classId);
          const slotBox = createElement('div', {
            className: 'p-2.5 rounded-xl bg-[#ECE5F0]/80 border border-[#012622]/20 text-right space-y-1 relative group shadow-2xs hover:border-[#012622] transition-all cursor-pointer',
          });
          slotBox.innerHTML = `
            <div class="font-bold text-xs text-[#012622]">${slot.subjectName}</div>
            <div class="text-[10px] text-gray-600 font-medium">${activeTab === 'teacher' ? `کلاس: ${clsObj ? clsObj.name : 'نامشخص'}` : slot.teacherName}</div>
            <div class="text-[10px] text-gray-500 font-mono">اتاق ${slot.roomNumber}</div>
          `;

          if (isManagement) {
            slotBox.addEventListener('click', () => openSlotModal(config, periodsMap, day.key, period.num, slot));
          }

          td.appendChild(slotBox);
        } else {
          if (isManagement) {
            const emptyBtn = createElement('button', {
              className: 'w-full py-3 rounded-xl border border-dashed border-gray-200 text-gray-400 hover:border-[#012622] hover:text-[#012622] text-[11px] font-bold transition-all cursor-pointer',
              textContent: '+ جدید',
            });
            emptyBtn.addEventListener('click', () => openSlotModal(config, periodsMap, day.key, period.num));
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

  const openSlotModal = (
    _config: ScheduleConfig,
    periodsMap: { num: number; label: string; timeRange: string }[],
    presetDay?: TimetableSlot['dayOfWeek'],
    presetPeriod?: number,
    existingSlot?: TimetableSlot
  ) => {
    const form = createElement('form', { className: 'space-y-3.5 dir-rtl text-xs text-gray-800' });

    const currentClassVal = existingSlot ? existingSlot.classId : selectedClassId;
    const currentTeacherVal = existingSlot ? existingSlot.teacherId : selectedTeacherId;

    form.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">کلاس / گروه *</label>
          <select id="slot-class" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs">
            ${classes.map((c) => `<option value="${c.id}" ${currentClassVal === c.id ? 'selected' : ''}>${c.name} (${c.gradeLevel})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-bold mb-1">استاد / معلم *</label>
          <select id="slot-teacher" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs">
            ${staff.map((st) => `<option value="${st.id}" ${currentTeacherVal === st.id ? 'selected' : ''}>${st.fullName} (${st.roleTitle})</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">روز هفته *</label>
          <select id="slot-day" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs">
            ${daysMap
              .map((d) => `<option value="${d.key}" ${(existingSlot ? existingSlot.dayOfWeek : presetDay) === d.key ? 'selected' : ''}>${d.title}</option>`)
              .join('')}
          </select>
        </div>
        <div>
          <label class="block font-bold mb-1">زنگ آموزشی *</label>
          <select id="slot-period" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs">
            ${periodsMap
              .map((p) => `<option value="${p.num}" ${(existingSlot ? existingSlot.periodNumber : presetPeriod) === p.num ? 'selected' : ''}>${p.label}</option>`)
              .join('')}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">درس آموزشی *</label>
          <select id="slot-subject" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs">
            ${subjects.map((sb) => `<option value="${sb.id}" ${existingSlot && existingSlot.subjectId === sb.id ? 'selected' : ''}>${sb.name} (${sb.gradeLevel})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-bold mb-1">شماره اتاق / مکان</label>
          <input type="text" id="slot-room" value="${existingSlot ? existingSlot.roomNumber : '۱۰۱'}" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs font-mono" />
        </div>
      </div>

      ${existingSlot ? `
        <div class="pt-2 border-t border-gray-100 flex items-center justify-between">
          <button type="button" id="btn-delete-slot" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-all cursor-pointer">
            حذف این زنگ
          </button>
          <span class="text-[10px] text-gray-500">جهت ویرایش مقادیر فوق را تغییر دهید.</span>
        </div>
      ` : ''}
    `;

    if (existingSlot) {
      const delBtn = form.querySelector('#btn-delete-slot');
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          if (confirm('آیا از حذف این زنگ از برنامه هفتگی اطمینان دارید؟')) {
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
      confirmText: existingSlot ? 'ذخیره تغییرات' : 'بررسی و ثبت',
      cancelText: 'انصراف',
      onConfirm: () => {
        const classId = (form.querySelector('#slot-class') as HTMLSelectElement).value;
        const teacherId = (form.querySelector('#slot-teacher') as HTMLSelectElement).value;
        const dayOfWeek = (form.querySelector('#slot-day') as HTMLSelectElement).value as TimetableSlot['dayOfWeek'];
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
          existingSlot ? existingSlot.id : undefined
        );

        if (conflict.hasConflict) {
          showToast({ title: 'تداخل زمان‌بندی!', message: conflict.reason || 'تداخل در برنامه زمان‌بندی شناسایی شد.', type: 'error' });
          return;
        }

        const periodLabel = periodsMap.find((p) => p.num === periodNumber)?.label.split('(')[1]?.replace(')', '') || '۰۸:۰۰ - ۰۹:۳۰';

        if (existingSlot) {
          schoolStore.updateTimetableSlot(existingSlot.id, {
            classId,
            dayOfWeek,
            periodNumber,
            timeLabel: periodLabel,
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
            timeLabel: periodLabel,
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
