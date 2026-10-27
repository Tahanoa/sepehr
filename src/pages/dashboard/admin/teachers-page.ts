/**
 * POLARIS TEACHER & STAFF MANAGEMENT PAGE
 * Directory of teachers and staff, search, role filters, teaching assignments,
 * workload summary, active status toggle, add and edit staff forms.
 */

import { OrganizationMembership } from '../../../types/auth';
import { StaffMember, StaffRole } from '../../../types/school';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createTeachersPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  let searchQuery = '';
  let selectedRole = 'all';

  const render = () => {
    rootWrapper.innerHTML = '';

    const staffList = schoolStore.getStaff(orgId);
    const classes = schoolStore.getClasses(orgId);

    // Filtering
    const filtered = staffList.filter((st) => {
      const matchSearch =
        st.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.phone.includes(searchQuery);

      const matchRole = selectedRole === 'all' || st.role === selectedRole;
      return matchSearch && matchRole;
    });

    // Header Row
    const headerRow = createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    const title = createElement('h2', {
      className: 'text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5',
    });
    title.innerHTML = `${getDashboardIcon('teacher', 'w-6 h-6 text-[#012622]')} مدیریت معلمان و همکاران آموزشی`;

    const desc = createElement('p', {
      className: 'text-xs sm:text-sm text-gray-600 font-normal',
      textContent: `مشاهده و مدیریت ${staffList.length.toLocaleString('fa-IR')} همکار کادر آموزشی و اجرایی، ساعات تدریس و کلاس‌های انتسابی.`,
    });

    headerText.appendChild(title);
    headerText.appendChild(desc);

    const addBtn = createElement('button', {
      className:
        'px-4 py-2.5 bg-[#012622] hover:bg-[#003B36] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
      innerHTML: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> افزودن همکار جدید`,
    });
    addBtn.addEventListener('click', () => openAddStaffModal());

    headerRow.appendChild(headerText);
    headerRow.appendChild(addBtn);

    // Filter Toolbar
    const toolbar = createElement('div', {
      className: 'bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-3',
    });

    const searchWrapper = createElement('div', { className: 'relative' });
    const searchInput = createElement('input', {
      className:
        'w-full bg-gray-50 border border-gray-300 rounded-xl ps-9 pe-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
      attributes: { type: 'text', placeholder: 'جستجو با نام، عنوان سمت یا شماره تماس...', value: searchQuery },
    });
    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value;
      render();
    });

    const searchIcon = createElement('div', {
      className: 'absolute start-3 top-2.5 text-gray-400 pointer-events-none',
      innerHTML: getDashboardIcon('search', 'w-4 h-4'),
    });
    searchWrapper.appendChild(searchIcon);
    searchWrapper.appendChild(searchInput);

    const roleSelect = createElement('select', {
      className:
        'bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
    });
    roleSelect.innerHTML = `
      <option value="all" ${selectedRole === 'all' ? 'selected' : ''}>همه نقش‌های شغلی</option>
      <option value="teacher" ${selectedRole === 'teacher' ? 'selected' : ''}>دبیر / معلم</option>
      <option value="counselor" ${selectedRole === 'counselor' ? 'selected' : ''}>مشاور تحصیلی</option>
      <option value="vice_principal" ${selectedRole === 'vice_principal' ? 'selected' : ''}>معاون آموزشی/انضباطی</option>
      <option value="admin_staff" ${selectedRole === 'admin_staff' ? 'selected' : ''}>کادر اداری</option>
    `;
    roleSelect.addEventListener('change', (e) => {
      selectedRole = (e.target as HTMLSelectElement).value;
      render();
    });

    toolbar.appendChild(searchWrapper);
    toolbar.appendChild(roleSelect);

    // Staff Grid
    const grid = createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' });

    if (filtered.length === 0) {
      const emptyState = createElement('div', {
        className: 'col-span-full bg-white rounded-2xl p-8 text-center border border-gray-200 text-gray-500 text-xs',
        textContent: 'هیچ همکاری با فیلترهای انتخابی یافت نشد.',
      });
      grid.appendChild(emptyState);
    } else {
      filtered.forEach((st) => {
        const card = createElement('div', {
          className:
            'bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between',
        });

        card.innerHTML = `
          <div class="space-y-3">
            <div class="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div class="w-10 h-10 rounded-full bg-[#012622] text-white font-bold flex items-center justify-center text-sm shrink-0">
                ${st.fullName.slice(0, 1)}
              </div>
              <div class="min-w-0">
                <h3 class="font-extrabold text-sm text-gray-900 truncate">${st.fullName}</h3>
                <div class="text-[11px] text-gray-500 font-medium">${st.roleTitle}</div>
              </div>
            </div>

            <div class="space-y-1.5 text-xs text-gray-700">
              <div class="flex items-center justify-between">
                <span class="text-gray-500">ساعات موظفی هفتگی:</span>
                <span class="font-bold text-[#012622] font-mono">${st.weeklyHours} ساعت</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500">شماره تماس:</span>
                <span class="font-mono text-gray-800">${st.phone}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500">وضعیت فعلی:</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                  st.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                }">
                  ${st.status === 'active' ? 'مشغول به کار' : 'مرخصی/غیرفعال'}
                </span>
              </div>
            </div>

            ${
              st.assignedClasses.length > 0
                ? `<div class="bg-gray-50 p-2.5 rounded-xl text-[11px] text-gray-600">
                    <strong>کلاس‌های انتسابی:</strong> ${st.assignedClasses.join('، ')}
                   </div>`
                : ''
            }
          </div>
        `;

        const actionsRow = createElement('div', {
          className: 'pt-3 border-t border-gray-100 flex items-center justify-between text-xs',
        });

        const toggleBtn = createElement('button', {
          className: 'px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer',
          textContent: st.status === 'active' ? 'تغییر به غیرفعال' : 'فعال‌سازی',
        });
        toggleBtn.addEventListener('click', () => {
          const newStatus = st.status === 'active' ? 'inactive' : 'active';
          schoolStore.updateStaff(st.id, { status: newStatus });
          showToast({ title: 'بروزرسانی وضعیت', message: `وضعیت همکار به ${newStatus === 'active' ? 'فعال' : 'غیرفعال'} تغییر یافت.`, type: 'info' });
          render();
        });

        const editBtn = createElement('button', {
          className: 'px-3 py-1.5 bg-[#012622] hover:bg-[#003B36] text-white font-bold rounded-lg cursor-pointer',
          textContent: 'ویرایش همکار',
        });
        editBtn.addEventListener('click', () => openEditStaffModal(st, classes.map((c) => c.name)));

        actionsRow.appendChild(toggleBtn);
        actionsRow.appendChild(editBtn);

        card.appendChild(actionsRow);
        grid.appendChild(card);
      });
    }

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(toolbar);
    rootWrapper.appendChild(grid);
  };

  const openAddStaffModal = () => {
    const classes = schoolStore.getClasses(orgId);
    const form = createElement('form', { className: 'space-y-3.5 dir-rtl text-xs text-gray-800' });

    form.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">نام و نام خانوادگی *</label>
          <input type="text" id="stf-fullName" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs" placeholder="مثال: مریم حسینی" />
        </div>
        <div>
          <label class="block font-bold mb-1">نقش شغلی *</label>
          <select id="stf-role" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs">
            <option value="teacher">دبیر / معلم</option>
            <option value="counselor">مشاور تحصیلی</option>
            <option value="vice_principal">معاون آموزشی/انضباطی</option>
            <option value="admin_staff">کادر اداری</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">عنوان تخصصی/سمت *</label>
          <input type="text" id="stf-roleTitle" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs" placeholder="مثال: دبیر حسابان و هندسه" />
        </div>
        <div>
          <label class="block font-bold mb-1">شماره تماس *</label>
          <input type="text" id="stf-phone" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs font-mono" placeholder="۰۹۱۲..." />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">پست الکترونیکی</label>
          <input type="email" id="stf-email" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs font-mono" placeholder="email@polaris-edu.ir" />
        </div>
        <div>
          <label class="block font-bold mb-1">ساعات تدریس هفتگی</label>
          <input type="number" id="stf-weeklyHours" value="20" min="2" max="44" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs font-mono" />
        </div>
      </div>
    `;

    const modal = new Modal({
      title: 'افزودن همکار/معلم جدید',
      content: form,
      confirmText: 'ذخیره همکار',
      cancelText: 'انصراف',
      onConfirm: () => {
        const fullName = (form.querySelector('#stf-fullName') as HTMLInputElement).value.trim();
        const role = (form.querySelector('#stf-role') as HTMLSelectElement).value as StaffRole;
        const roleTitle = (form.querySelector('#stf-roleTitle') as HTMLInputElement).value.trim();
        const phone = (form.querySelector('#stf-phone') as HTMLInputElement).value.trim();
        const email = (form.querySelector('#stf-email') as HTMLInputElement).value.trim();
        const weeklyHours = parseInt((form.querySelector('#stf-weeklyHours') as HTMLInputElement).value, 10) || 20;

        if (!fullName || !roleTitle || !phone) {
          showToast({ title: 'خطا', message: 'لطفاً تمامی فیلدهای الزامی را پر کنید.', type: 'warning' });
          return;
        }

        const newCode = 'T-' + Math.floor(100 + Math.random() * 900).toString();

        schoolStore.addStaff({
          organizationId: orgId,
          staffCode: newCode,
          fullName,
          role,
          roleTitle,
          phone,
          email: email || 'user@polaris-edu.ir',
          assignedSubjects: [],
          assignedClasses: classes.length > 0 ? [classes[0]!.name] : [],
          status: 'active',
          weeklyHours,
        });

        showToast({ title: 'افزوده شد', message: `همکار «${fullName}» با موفقیت اضافه شد.`, type: 'success' });
        render();
      },
    });

    modal.open();
  };

  const openEditStaffModal = (st: StaffMember, _classNames: string[]) => {
    const form = createElement('form', { className: 'space-y-3.5 dir-rtl text-xs text-gray-800' });

    form.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">نام و نام خانوادگی *</label>
          <input type="text" id="edit-stf-fullName" value="${st.fullName}" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs" />
        </div>
        <div>
          <label class="block font-bold mb-1">عنوان سمت *</label>
          <input type="text" id="edit-stf-roleTitle" value="${st.roleTitle}" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">شماره تماس *</label>
          <input type="text" id="edit-stf-phone" value="${st.phone}" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs font-mono" />
        </div>
        <div>
          <label class="block font-bold mb-1">ساعات موظفی هفتگی</label>
          <input type="number" id="edit-stf-weeklyHours" value="${st.weeklyHours}" min="2" max="44" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs font-mono" />
        </div>
      </div>
    `;

    const modal = new Modal({
      title: 'ویرایش مشخصات همکار',
      content: form,
      confirmText: 'بروزرسانی',
      cancelText: 'انصراف',
      onConfirm: () => {
        const fullName = (form.querySelector('#edit-stf-fullName') as HTMLInputElement).value.trim();
        const roleTitle = (form.querySelector('#edit-stf-roleTitle') as HTMLInputElement).value.trim();
        const phone = (form.querySelector('#edit-stf-phone') as HTMLInputElement).value.trim();
        const weeklyHours = parseInt((form.querySelector('#edit-stf-weeklyHours') as HTMLInputElement).value, 10) || 20;

        schoolStore.updateStaff(st.id, {
          fullName,
          roleTitle,
          phone,
          weeklyHours,
        });

        showToast({ title: 'بروزرسانی', message: 'اطلاعات همکار بروزرسانی گردید.', type: 'success' });
        render();
      },
    });

    modal.open();
  };

  render();
  return rootWrapper;
}
