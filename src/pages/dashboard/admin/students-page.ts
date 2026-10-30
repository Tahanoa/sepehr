/**
 * POLARIS STUDENT MANAGEMENT PAGE
 * Student directory with search, filtering, sorting, pagination,
 * student detail view modal, add/edit student forms with validation,
 * guardian contact info, and local persistence.
 */

import { OrganizationMembership } from '../../../types/auth';
import { Student, StudentStatus } from '../../../types/school';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { authService } from '../../../services/auth-service';
import { AccessPolicy } from '../../../services/access-policy';
import { createDataTable } from '../../../components/data-table';
import { TableColumn } from '../../../types/common';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';
import { getDashboardIcon } from '../../../components/dashboard/icons';
import { createExcelImportModal } from '../../../components/dashboard/excel-import-modal';

export function createStudentsPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;
  const currentUser = authService.getCurrentUser();

  const isManagement = AccessPolicy.canManageOrgRecords(membership);
  const isTeacher = membership.role === 'teacher' || membership.role === 'instructor';

  // Local UI State
  let searchQuery = '';
  let selectedGrade = 'all';
  let selectedStatus = 'all';
  let currentPage = 1;
  let sortKey: keyof Student = 'fullName';
  let sortDirection: 'asc' | 'desc' = 'asc';
  const pageSize = 5;

  const render = () => {
    rootWrapper.innerHTML = '';

    let allStudents = schoolStore.getStudents(orgId);
    let classes = schoolStore.getClasses(orgId);

    if (isTeacher && currentUser) {
      const teacherClasses = schoolStore.getTeacherClasses(orgId, currentUser.email || currentUser.phone || currentUser.id);
      const teacherClassIds = teacherClasses.map((c) => c.id);
      allStudents = allStudents.filter((s) => teacherClassIds.includes(s.classId));
      classes = teacherClasses;
    }

    // Extract unique grades for filter dropdown
    const availableGrades = Array.from(new Set(classes.map((c) => c.gradeLevel)));

    // Filtering
    let filtered = allStudents.filter((s) => {
      const matchSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentCode.includes(searchQuery) ||
        s.nationalId.includes(searchQuery);

      const matchGrade = selectedGrade === 'all' || s.gradeLevel === selectedGrade;
      const matchStatus = selectedStatus === 'all' || s.status === selectedStatus;

      return matchSearch && matchGrade && matchStatus;
    });

    filtered.sort((a,b)=>String(a[sortKey]??'').localeCompare(String(b[sortKey]??''),'fa',{numeric:true})*(sortDirection==='asc'?1:-1));
    // Pagination
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * pageSize;
    const paginated = filtered.slice(startIdx, startIdx + pageSize);

    // Page Header & Add Button
    const headerRow = createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    const title = createElement('h2', {
      className: 'text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5',
    });
    title.innerHTML = `${getDashboardIcon('users', 'w-6 h-6 text-[rgb(var(--theme-primary))]')} مدیریت و پرونده دانش‌آموزان`;

    const desc = createElement('p', {
      className: 'text-xs sm:text-sm text-gray-600 font-normal',
      textContent: `مشاهده لیست کل دانش‌آموزان (${allStudents.length.toLocaleString('fa-IR')} نفر)، جستجو، ثبت‌نام جدید و مدیریت وضعیت.`,
    });

    headerText.appendChild(title);
    headerText.appendChild(desc);

    const actionBtns = createElement('div', { className: 'flex items-center gap-2' });

    if (isManagement) {
      const importBtn = createElement('button', {
        className:
          'px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl border border-gray-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))]',
        innerHTML: `<svg class="w-4 h-4 text-[rgb(var(--theme-accent))]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg> ورود گروهی Excel`,
      });
      importBtn.addEventListener('click', () => {
        const modal = createExcelImportModal({
          entityType: 'students',
          organizationId: orgId,
          onImportComplete: (count) => {
            showToast({ title: 'ورود گروهی موفق', message: `${count} دانش‌آموز جدید افزوده گردید.`, type: 'success' });
            render();
          },
          onClose: () => {
            if (document.body.contains(modal)) document.body.removeChild(modal);
          },
        });
        document.body.appendChild(modal);
      });

      const addBtn = createElement('button', {
        className:
          'px-4 py-2.5 bg-[rgb(var(--theme-primary))] hover:bg-[rgb(var(--theme-hover))] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))]',
        innerHTML: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> ثبت دانش‌آموز جدید`,
      });
      addBtn.addEventListener('click', () => openAddStudentModal());

      actionBtns.appendChild(importBtn);
      actionBtns.appendChild(addBtn);
    }

    headerRow.appendChild(headerText);
    headerRow.appendChild(actionBtns);

    // Filter Toolbar
    const toolbar = createElement('div', {
      className: 'bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3',
    });

    // Search input
    const searchWrapper = createElement('div', { className: 'relative' });
    const searchInput = createElement('input', {
      className:
        'w-full bg-gray-50 border border-gray-300 rounded-xl ps-9 pe-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))]',
      attributes: { type: 'text', placeholder: 'جستجو با نام، کدملی یا کد دانش‌آموزی...', value: searchQuery },
    });
    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value;
      currentPage = 1;
      render();
    });

    const searchIcon = createElement('div', {
      className: 'absolute start-3 top-2.5 text-gray-400 pointer-events-none',
      innerHTML: getDashboardIcon('search', 'w-4 h-4'),
    });
    searchWrapper.appendChild(searchIcon);
    searchWrapper.appendChild(searchInput);

    // Grade Select
    const gradeSelect = createElement('select', {
      className:
        'bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))]',
    });
    gradeSelect.innerHTML = `<option value="all">همه پایه‌های تحصیلی</option>`;
    availableGrades.forEach((g) => {
      const opt = createElement('option', { textContent: g, attributes: { value: g } });
      if (g === selectedGrade) opt.setAttribute('selected', 'true');
      gradeSelect.appendChild(opt);
    });
    gradeSelect.addEventListener('change', (e) => {
      selectedGrade = (e.target as HTMLSelectElement).value;
      currentPage = 1;
      render();
    });

    // Status Select
    const statusSelect = createElement('select', {
      className:
        'bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--theme-accent))]',
    });
    statusSelect.innerHTML = `
      <option value="all" ${selectedStatus === 'all' ? 'selected' : ''}>همه وضعیت‌ها</option>
      <option value="active" ${selectedStatus === 'active' ? 'selected' : ''}>فعال</option>
      <option value="pending" ${selectedStatus === 'pending' ? 'selected' : ''}>در انتظار بررسی</option>
      <option value="suspended" ${selectedStatus === 'suspended' ? 'selected' : ''}>معلق</option>
    `;
    statusSelect.addEventListener('change', (e) => {
      selectedStatus = (e.target as HTMLSelectElement).value;
      currentPage = 1;
      render();
    });

    toolbar.appendChild(searchWrapper);
    toolbar.appendChild(gradeSelect);
    toolbar.appendChild(statusSelect);

    // Data Table Section
    const tableContainer = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden' });

    const columns: TableColumn<Student>[] = [
      {
        title: 'دانش‌آموز',
        key: 'fullName',
        render: (row) => `
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-[rgb(var(--theme-primary))] text-white flex items-center justify-center font-bold text-xs shrink-0">
              ${row.fullName.slice(0, 1)}
            </div>
            <div>
              <div class="font-bold text-gray-900 text-xs">${row.fullName}</div>
              <div class="text-[10px] text-gray-500 font-mono">کد: ${row.studentCode}</div>
            </div>
          </div>
        `,
      },
      { title: 'کد ملی', key: 'nationalId', align: 'center' },
      { title: 'پایه تحصیلی', key: 'gradeLevel', align: 'center' },
      { title: 'کلاس', key: 'className', align: 'center' },
      {
        title: 'سرپرست و تماس',
        key: 'guardianName',
        render: (row) => `
          <div class="text-xs">
            <span class="font-semibold text-gray-800">${row.guardianName} (${row.guardianRelation})</span>
            <div class="text-[10px] font-mono text-gray-500">${row.guardianPhone}</div>
          </div>
        `,
      },
      { title: 'وضعیت', key: 'status' },
      {
        title: 'عملیات',
        key: 'id',
        align: 'center',
        render: (row) => {
          const actionBox = createElement('div', { className: 'flex items-center justify-center gap-1.5' });

          const viewBtn = createElement('button', {
            className: 'p-1.5 text-gray-600 hover:text-[rgb(var(--theme-primary))] hover:bg-gray-100 rounded-lg transition-colors title="مشاهده پرونده"',
            innerHTML: getDashboardIcon('info', 'w-4 h-4'),
          });
          viewBtn.setAttribute('aria-label', 'مشاهده پرونده');
          viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openStudentDetailModal(row);
          });

          actionBox.appendChild(viewBtn);

          if (isTeacher) {
            const referBtn = createElement('button', {
              className: 'px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-[11px] font-bold rounded-lg transition-colors cursor-pointer',
              textContent: '+ ارجاع مشاور',
            });
            referBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              openCounselorReferralModal(row);
            });
            actionBox.appendChild(referBtn);
          }

          if (isManagement) {
            const editBtn = createElement('button', {
              className: 'p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors title="ویرایش مشخصات"',
              innerHTML: getDashboardIcon('exam', 'w-4 h-4'),
            });
            editBtn.setAttribute('aria-label', 'ویرایش مشخصات');
          editBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              openEditStudentModal(row);
            });

            const deleteBtn = createElement('button', {
              className: 'p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors title="حذف دانش‌آموز"',
              innerHTML: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
            });
            deleteBtn.setAttribute('aria-label', 'حذف دانش‌آموز');
          deleteBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              confirmDeleteStudent(row);
            });

            actionBox.appendChild(editBtn);
            actionBox.appendChild(deleteBtn);
          }

          return actionBox;
        },
      },
    ];

    const dataTable = createDataTable({
      columns,
      data: paginated,
      sort: { key: sortKey, direction: sortDirection, onChange: (key, direction) => {sortKey=key as keyof Student;sortDirection=direction;currentPage=1;render();} },
      emptyText: searchQuery || selectedGrade !== 'all' || selectedStatus !== 'all'
        ? 'هیچ دانش‌آموزی با فیلترهای انتخابی یافت نشد.'
        : 'هنوز دانش‌آموزی در این مرکز ثبت نشده است.',
    });

    tableContainer.appendChild(dataTable);

    filtered.sort((a,b)=>String(a[sortKey]??'').localeCompare(String(b[sortKey]??''),'fa',{numeric:true})*(sortDirection==='asc'?1:-1));
    // Pagination Controls
    const paginationBox = createElement('div', {
      className: 'flex items-center justify-between p-4 bg-gray-50/80 border-t border-gray-200/80 text-xs text-gray-600',
    });

    const infoText = createElement('span', {
      textContent: `نمایش ${filtered.length > 0 ? startIdx + 1 : 0} تا ${Math.min(
        startIdx + pageSize,
        filtered.length
      )} از ${filtered.length} دانش‌آموز`,
    });

    const pageNav = createElement('div', { className: 'flex items-center gap-1.5' });

    const prevBtn = createElement('button', {
      className: `px-3 py-1.5 rounded-lg border border-gray-300 font-bold transition-all ${
        currentPage === 1 ? 'opacity-40 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-gray-100 text-gray-800'
      }`,
      textContent: 'قبلی',
      attributes: { disabled: currentPage === 1 ? 'true' : 'false' },
    });
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        render();
      }
    });

    const pageCounter = createElement('span', { className: 'px-2 font-mono font-bold text-gray-900', textContent: `${currentPage} / ${totalPages}` });

    const nextBtn = createElement('button', {
      className: `px-3 py-1.5 rounded-lg border border-gray-300 font-bold transition-all ${
        currentPage === totalPages || totalPages === 0
          ? 'opacity-40 cursor-not-allowed bg-gray-100'
          : 'bg-white hover:bg-gray-100 text-gray-800'
      }`,
      textContent: 'بعدی',
      attributes: { disabled: currentPage === totalPages || totalPages === 0 ? 'true' : 'false' },
    });
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        render();
      }
    });

    pageNav.appendChild(prevBtn);
    pageNav.appendChild(pageCounter);
    pageNav.appendChild(nextBtn);

    paginationBox.appendChild(infoText);
    paginationBox.appendChild(pageNav);

    tableContainer.appendChild(paginationBox);

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(toolbar);
    rootWrapper.appendChild(tableContainer);
  };

  // Modals
  const openCounselorReferralModal = (std: Student) => {
    const form = createElement('form', { className: 'space-y-3.5 dir-rtl text-xs text-gray-800' });
    form.innerHTML = `
      <div class="bg-purple-50 p-3 rounded-xl border border-purple-200 space-y-1">
        <div class="font-bold text-purple-950">دانش‌آموز ارجاعی: ${std.fullName} (${std.className})</div>
        <div class="text-[11px] text-purple-800">این ارجاع مستقیماً در کارتابل مشاور تحصیلی مدرسه قرار خواهد گرفت.</div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">سطح اولویت *</label>
          <select id="ref-priority" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold">
            <option value="high">بالا / فوری</option>
            <option value="medium" selected>متوسط</option>
            <option value="low">عادی</option>
          </select>
        </div>
        <div>
          <label class="block font-bold mb-1">تاریخ ارجاع *</label>
          <input type="text" id="ref-date" value="۱۴۰۲/۱۲/۰۵" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-mono" />
        </div>
      </div>

      <div>
        <label class="block font-bold mb-1">علت ارجاع به مشاور *</label>
        <textarea id="ref-reason" rows="3" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs leading-relaxed" placeholder="شرح علت ارجاع (افت تحصیلی، استرس، غیبت مکرر یا...)..."></textarea>
      </div>
    `;

    const modal = new Modal({
      title: 'ارسال ارجاع به مشاور تحصیلی',
      content: form,
      confirmText: 'ثبت ارجاع',
      cancelText: 'انصراف',
      onConfirm: () => {
        const priority = (form.querySelector('#ref-priority') as HTMLSelectElement).value as any;
        const referralDate = (form.querySelector('#ref-date') as HTMLInputElement).value.trim();
        const reason = (form.querySelector('#ref-reason') as HTMLTextAreaElement).value.trim();

        if (!reason) {
          showToast({ title: 'علت ارجاع خالی است', message: 'لطفاً علت ارجاع را شرح دهید.', type: 'warning' });
          return;
        }

        schoolStore.addCounselingReferral({
          organizationId: orgId,
          studentId: std.id,
          studentName: std.fullName,
          className: std.className,
          referredBy: `${currentUser?.name || 'استاد آموزگار'} (دبیر)`,
          referralDate: referralDate || '۱۴۰۲/۱۲/۰۵',
          reason,
          priority,
          status: 'pending',
          counselorName: 'دکتر سارا کریمی',
        });

        showToast({ title: 'ارجاع ثبت شد', message: `دانش‌آموز «${std.fullName}» به مشاور ارجاع داده شد.`, type: 'success' });
        render();
      },
    });

    modal.open();
  };

  const openStudentDetailModal = (std: Student) => {
    const content = createElement('div', { className: 'space-y-4 text-xs dir-rtl text-gray-800' });
    content.innerHTML = `
      <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
        <div class="flex items-center justify-between pb-2 border-b border-gray-200">
          <span class="font-bold text-sm text-[rgb(var(--theme-primary))]">${std.fullName}</span>
          <span class="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-emerald-100 text-emerald-800">کد: ${std.studentCode}</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-gray-600">
          <div><strong>کد ملی:</strong> ${std.nationalId}</div>
          <div><strong>جنسیت:</strong> ${std.gender === 'female' ? 'دختر' : 'پسر'}</div>
          <div><strong>پایه تحصیلی:</strong> ${std.gradeLevel}</div>
          <div><strong>کلاس:</strong> ${std.className}</div>
          <div><strong>تاریخ ثبت‌نام:</strong> ${std.enrollmentDate}</div>
          <div><strong>وضعیت:</strong> ${std.status === 'active' ? 'فعال' : 'غیرفعال/معلق'}</div>
        </div>
      </div>

      <div class="bg-amber-50/80 p-4 rounded-xl border border-amber-200 space-y-1.5">
        <div class="font-bold text-amber-950 flex items-center gap-1.5">
          ${getDashboardIcon('child', 'w-4 h-4 text-amber-700')} مشخصات ولی و سرپرست قانونی:
        </div>
        <div class="grid grid-cols-2 gap-2 text-amber-900">
          <div><strong>نام سرپرست:</strong> ${std.guardianName}</div>
          <div><strong>نسبت:</strong> ${std.guardianRelation}</div>
          <div><strong>تلفن همراه:</strong> <span class="font-mono">${std.guardianPhone}</span></div>
        </div>
      </div>

      ${
        std.notes
          ? `<div class="p-3 bg-gray-100 rounded-xl"><strong>توضیحات پرونده:</strong> ${std.notes}</div>`
          : ''
      }
    `;

    const reportButton=createElement('button',{textContent:'مشاهده کارنامه',className:'sepehr-primary'});
    reportButton.addEventListener('click',()=>{modal.close();window.dispatchEvent(new CustomEvent('polaris-navigate',{detail:`/app/${orgId}/grades?student=${std.id}`}));});content.append(reportButton);
    const modal = new Modal({
      title: 'پرونده تفصیلی دانش‌آموز',
      content,
      confirmText: 'بستن',
    });
    modal.open();
  };

  const openAddStudentModal = () => {
    const classes = schoolStore.getClasses(orgId);
    if (classes.length === 0) {
      showToast({ title: 'خطا', message: 'ابتدا باید حداقل یک کلاس در سیستم تعریف شود.', type: 'warning' });
      return;
    }

    const form = createElement('form', { className: 'space-y-3.5 dir-rtl text-xs text-gray-800' });

    const defaultClass = classes[0]!;

    form.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">نام و نام خانوادگی دانش‌آموز *</label>
          <input type="text" id="std-fullName" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-[rgb(var(--theme-accent))]" placeholder="مثال: علی رضایی" />
        </div>
        <div>
          <label class="block font-bold mb-1">کد ملی دانش‌آموز *</label>
          <input type="text" id="std-nationalId" required maxlength="10" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs font-mono focus:ring-2 focus:ring-[rgb(var(--theme-accent))]" placeholder="۱۰ رقم کد ملی" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">کلاس انتسابی *</label>
          <select id="std-classId" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-[rgb(var(--theme-accent))]">
            ${classes.map((c) => `<option value="${c.id}">${c.name} (${c.gradeLevel})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-bold mb-1">جنسیت *</label>
          <select id="std-gender" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-[rgb(var(--theme-accent))]">
            <option value="male">پسر</option>
            <option value="female">دختر</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-gray-200 pt-3">
        <div>
          <label class="block font-bold mb-1">نام و نام خانوادگی ولی *</label>
          <input type="text" id="std-guardianName" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs" placeholder="نام ولی" />
        </div>
        <div>
          <label class="block font-bold mb-1">نسبت سرپرست *</label>
          <select id="std-guardianRelation" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs">
            <option value="پدر">پدر</option>
            <option value="مادر">مادر</option>
            <option value="سرپرست قانونی">سرپرست قانونی</option>
          </select>
        </div>
        <div>
          <label class="block font-bold mb-1">شماره تماس ولی *</label>
          <input type="text" id="std-guardianPhone" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs font-mono" placeholder="۰۹۱۲..." />
        </div>
      </div>

      <div>
        <label class="block font-bold mb-1">توضیحات و ملاحظات پزشكی/آموزشی</label>
        <textarea id="std-notes" rows="2" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs" placeholder="اختیاری..."></textarea>
      </div>
    `;

    const modal = new Modal({
      title: 'ثبت دانش‌آموز جدید',
      content: form,
      confirmText: 'ذخیره و ثبت‌نام',
      cancelText: 'انصراف',
      onConfirm: () => {
        const fullName = (form.querySelector('#std-fullName') as HTMLInputElement).value.trim();
        const nationalId = (form.querySelector('#std-nationalId') as HTMLInputElement).value.trim();
        const selectedClassId = (form.querySelector('#std-classId') as HTMLSelectElement).value;
        const gender = (form.querySelector('#std-gender') as HTMLSelectElement).value as 'male' | 'female';
        const guardianName = (form.querySelector('#std-guardianName') as HTMLInputElement).value.trim();
        const guardianRelation = (form.querySelector('#std-guardianRelation') as HTMLSelectElement).value;
        const guardianPhone = (form.querySelector('#std-guardianPhone') as HTMLInputElement).value.trim();
        const notes = (form.querySelector('#std-notes') as HTMLTextAreaElement).value.trim();

        if (!fullName || !nationalId || !guardianName || !guardianPhone) {
          showToast({ title: 'خطا در ثبت', message: 'لطفاً کلیه فیلدهای الزامی را به درستی تکمیل کنید.', type: 'error' });
          return;
        }

        const targetClass = classes.find((c) => c.id === selectedClassId) || defaultClass;

        const newCode = (40200000 + Math.floor(Math.random() * 89999)).toString();

        const studentPayload: Omit<Student, 'id'> = {
          organizationId: orgId,
          studentCode: newCode,
          fullName,
          nationalId,
          gradeLevel: targetClass.gradeLevel,
          className: targetClass.name,
          classId: targetClass.id,
          guardianName,
          guardianRelation,
          guardianPhone,
          gender,
          status: 'active',
          enrollmentDate: new Date().toLocaleDateString('fa-IR'),
        };
        if (notes) studentPayload.notes = notes;

        schoolStore.addStudent(studentPayload);

        showToast({ title: 'ثبت موفق', message: `دانش‌آموز «${fullName}» با موفقیت در سیستم ثبت شد.`, type: 'success' });
        render();
      },
    });

    modal.open();
  };

  const openEditStudentModal = (std: Student) => {
    const classes = schoolStore.getClasses(orgId);
    const form = createElement('form', { className: 'space-y-3.5 dir-rtl text-xs text-gray-800' });

    form.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">نام و نام خانوادگی *</label>
          <input type="text" id="edit-fullName" value="${std.fullName}" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs" />
        </div>
        <div>
          <label class="block font-bold mb-1">کد ملی *</label>
          <input type="text" id="edit-nationalId" value="${std.nationalId}" required maxlength="10" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs font-mono" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">کلاس انتسابی</label>
          <select id="edit-classId" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs">
            ${classes.map((c) => `<option value="${c.id}" ${c.id === std.classId ? 'selected' : ''}>${c.name} (${c.gradeLevel})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-bold mb-1">وضعیت تحصیلی</label>
          <select id="edit-status" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs">
            <option value="active" ${std.status === 'active' ? 'selected' : ''}>فعال</option>
            <option value="pending" ${std.status === 'pending' ? 'selected' : ''}>در انتظار بررسی</option>
            <option value="suspended" ${std.status === 'suspended' ? 'selected' : ''}>معلق / انصراف</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-200 pt-3">
        <div>
          <label class="block font-bold mb-1">نام ولی *</label>
          <input type="text" id="edit-guardianName" value="${std.guardianName}" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs" />
        </div>
        <div>
          <label class="block font-bold mb-1">تلفن همراه ولی *</label>
          <input type="text" id="edit-guardianPhone" value="${std.guardianPhone}" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs font-mono" />
        </div>
      </div>
    `;

    const modal = new Modal({
      title: 'ویرایش اطلاعات دانش‌آموز',
      content: form,
      confirmText: 'بروزرسانی',
      cancelText: 'انصراف',
      onConfirm: () => {
        const fullName = (form.querySelector('#edit-fullName') as HTMLInputElement).value.trim();
        const nationalId = (form.querySelector('#edit-nationalId') as HTMLInputElement).value.trim();
        const selectedClassId = (form.querySelector('#edit-classId') as HTMLSelectElement).value;
        const status = (form.querySelector('#edit-status') as HTMLSelectElement).value as StudentStatus;
        const guardianName = (form.querySelector('#edit-guardianName') as HTMLInputElement).value.trim();
        const guardianPhone = (form.querySelector('#edit-guardianPhone') as HTMLInputElement).value.trim();

        const targetClass = classes.find((c) => c.id === selectedClassId);

        schoolStore.updateStudent(std.id, {
          fullName,
          nationalId,
          status,
          guardianName,
          guardianPhone,
          ...(targetClass ? { classId: targetClass.id, className: targetClass.name, gradeLevel: targetClass.gradeLevel } : {}),
        });

        showToast({ title: 'بروزرسانی موفق', message: 'اطلاعات دانش‌آموز به روز گردید.', type: 'success' });
        render();
      },
    });

    modal.open();
  };

  const confirmDeleteStudent = (std: Student) => {
    const modal = new Modal({
      title: 'تأیید حذف پرونده',
      content: `آیا از حذف دانش‌آموز «${std.fullName}» اطمینان دارید؟ این عمل قابل بازگشت نیست.`,
      confirmText: 'حذف دانش‌آموز',
      cancelText: 'انصراف',
      onConfirm: () => {
        schoolStore.deleteStudent(std.id);
        showToast({ title: 'حذف گردید', message: 'پرونده دانش‌آموز حذف شد.', type: 'info' });
        render();
      },
    });
    modal.open();
  };

  render();
  return rootWrapper;
}

