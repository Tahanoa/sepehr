/**
 * POLARIS ANNOUNCEMENTS & PARENT COMMUNICATION PAGE
 * School announcements directory, target audience selection, create/edit form,
 * draft/published state toggles, and detail view modal.
 */

import { OrganizationMembership } from '../../../types/auth';
import { Announcement } from '../../../types/school';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createAnnouncementsPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  let searchQuery = '';
  let selectedAudience = 'all';

  const render = () => {
    rootWrapper.innerHTML = '';

    const announcements = schoolStore.getAnnouncements(orgId);

    // Filtering
    const filtered = announcements.filter((anc) => {
      const matchSearch =
        anc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        anc.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchAudience = selectedAudience === 'all' || anc.audience === selectedAudience;
      return matchSearch && matchAudience;
    });

    // Header Row
    const headerRow = createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    const title = createElement('h2', {
      className: 'text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5',
    });
    title.innerHTML = `${getDashboardIcon('announcement', 'w-6 h-6 text-[#012622]')} اطلاعیه‌ها و ارتباطات مدرسه`;

    const desc = createElement('p', {
      className: 'text-xs sm:text-sm text-gray-600 font-normal',
      textContent: `ارسال اطلاعیه‌های آموزشی، ارتباط با اولیا و معلمان، تنظیم مخاطبان هدف و زمان‌بندی انتشار.`,
    });

    headerText.appendChild(title);
    headerText.appendChild(desc);

    const addBtn = createElement('button', {
      className:
        'px-4 py-2.5 bg-[#012622] hover:bg-[#003B36] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
      innerHTML: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> ثبت اطلاعیه جدید`,
    });
    addBtn.addEventListener('click', () => openAddAnnouncementModal());

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
      attributes: { type: 'text', placeholder: 'جستجو در عنوان یا متن اطلاعیه...', value: searchQuery },
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

    const audienceSelect = createElement('select', {
      className: 'bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
    });
    audienceSelect.innerHTML = `
      <option value="all" ${selectedAudience === 'all' ? 'selected' : ''}>همه گروه مخاطبان</option>
      <option value="parents" ${selectedAudience === 'parents' ? 'selected' : ''}>اولیا دانش‌آموزان</option>
      <option value="teachers" ${selectedAudience === 'teachers' ? 'selected' : ''}>معلمان و کادر</option>
      <option value="students" ${selectedAudience === 'students' ? 'selected' : ''}>دانش‌آموزان</option>
    `;
    audienceSelect.addEventListener('change', (e) => {
      selectedAudience = (e.target as HTMLSelectElement).value;
      render();
    });

    toolbar.appendChild(searchWrapper);
    toolbar.appendChild(audienceSelect);

    // List Cards
    const list = createElement('div', { className: 'space-y-3.5' });

    if (filtered.length === 0) {
      const emptyState = createElement('div', {
        className: 'bg-white rounded-2xl p-8 text-center border border-gray-200 text-gray-500 text-xs',
        textContent: 'اطلاعیه‌ای با فیلترهای انتخابی موجود نیست.',
      });
      list.appendChild(emptyState);
    } else {
      filtered.forEach((anc) => {
        const card = createElement('div', {
          className: 'bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-3',
        });

        let priorityBadge = 'bg-gray-100 text-gray-800';
        if (anc.priority === 'urgent') priorityBadge = 'bg-rose-100 text-rose-900 font-extrabold';
        else if (anc.priority === 'important') priorityBadge = 'bg-amber-100 text-amber-900 font-bold';

        let audienceText = 'عمومی (همه مخاطبان)';
        if (anc.audience === 'parents') audienceText = 'اولیا دانش‌آموزان';
        else if (anc.audience === 'teachers') audienceText = 'کادر آموزشی و معلمان';
        else if (anc.audience === 'students') audienceText = 'دانش‌آموزان';

        card.innerHTML = `
          <div class="flex items-center justify-between border-b border-gray-100 pb-2.5">
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-sm text-gray-900">${anc.title}</span>
              <span class="px-2 py-0.5 rounded text-[10px] ${priorityBadge}">${anc.priority === 'urgent' ? 'فوری' : 'مهم'}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-[10px] font-bold">${audienceText}</span>
              <span class="px-2.5 py-1 ${
                anc.isPublished ? 'bg-emerald-100 text-emerald-900' : 'bg-gray-200 text-gray-700'
              } rounded-lg text-[10px] font-extrabold">
                ${anc.isPublished ? 'منتشر شده' : 'پیش‌نویس'}
              </span>
            </div>
          </div>

          <p class="text-xs text-gray-700 leading-relaxed font-normal">${anc.content}</p>

          <div class="text-[10px] text-gray-400 flex items-center justify-between pt-1">
            <span>نویسنده: ${anc.authorName}</span>
            <span class="font-mono">${anc.createdAt}</span>
          </div>
        `;

        const actionsRow = createElement('div', { className: 'pt-2 border-t border-gray-100 flex items-center justify-end gap-2 text-xs' });
        const toggleBtn = createElement('button', {
          className: 'px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg transition-colors cursor-pointer',
          textContent: anc.isPublished ? 'تغییر به پیش‌نویس' : 'انتشار عمومی',
        });
        toggleBtn.addEventListener('click', () => {
          schoolStore.updateAnnouncement(anc.id, { isPublished: !anc.isPublished });
          showToast({ title: 'بروزرسانی', message: 'وضعیت انتشار اطلاعیه تغییر یافت.', type: 'info' });
          render();
        });

        actionsRow.appendChild(toggleBtn);
        card.appendChild(actionsRow);

        list.appendChild(card);
      });
    }

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(toolbar);
    rootWrapper.appendChild(list);
  };

  const openAddAnnouncementModal = () => {
    const form = createElement('form', { className: 'space-y-3.5 dir-rtl text-xs text-gray-800' });

    form.innerHTML = `
      <div>
        <label class="block font-bold mb-1">عنوان اطلاعیه *</label>
        <input type="text" id="anc-title" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs" placeholder="مثال: تاریخ برگزاری جلسه اولیا و مربیان" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">گروه مخاطبین هدف *</label>
          <select id="anc-audience" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs">
            <option value="parents">اولیا دانش‌آموزان</option>
            <option value="teachers">کادر آموزشی و معلمان</option>
            <option value="students">دانش‌آموزان</option>
            <option value="all">همه کاربران مرکز</option>
          </select>
        </div>
        <div>
          <label class="block font-bold mb-1">درجه اولویت *</label>
          <select id="anc-priority" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs">
            <option value="normal">عادی</option>
            <option value="important" selected>مهم</option>
            <option value="urgent">فوری</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block font-bold mb-1">متن کامل اطلاعیه *</label>
        <textarea id="anc-content" rows="4" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs leading-relaxed" placeholder="شرح کامل اطلاعیه..."></textarea>
      </div>
    `;

    const modal = new Modal({
      title: 'ثبت اطلاعیه جدید',
      content: form,
      confirmText: 'انتشار اطلاعیه',
      cancelText: 'انصراف',
      onConfirm: () => {
        const title = (form.querySelector('#anc-title') as HTMLInputElement).value.trim();
        const audience = (form.querySelector('#anc-audience') as HTMLSelectElement).value as Announcement['audience'];
        const priority = (form.querySelector('#anc-priority') as HTMLSelectElement).value as Announcement['priority'];
        const content = (form.querySelector('#anc-content') as HTMLTextAreaElement).value.trim();

        if (!title || !content) {
          showToast({ title: 'فیلد خالی', message: 'لطفاً عنوان و متن اطلاعیه را تکمیل نمایید.', type: 'warning' });
          return;
        }

        schoolStore.addAnnouncement({
          organizationId: orgId,
          title,
          content,
          audience,
          authorName: membership.organization.name,
          isPublished: true,
          priority,
        });

        showToast({ title: 'ارسال شد', message: 'اطلاعیه جدید با موفقیت ثبت و ارسال شد.', type: 'success' });
        render();
      },
    });

    modal.open();
  };

  render();
  return rootWrapper;
}
