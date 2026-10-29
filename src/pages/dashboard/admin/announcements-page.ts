/**
 * POLARIS ANNOUNCEMENTS & PARENT COMMUNICATION PAGE
 * School announcements directory, target audience selection, create/edit form,
 * draft/published state toggles, and detail view modal with dark mode support.
 */

import { OrganizationMembership } from '../../../types/auth';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createAnnouncementsPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  let activeTab: 'announcements' | 'sms' | 'parent_inbox' = 'announcements';
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
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80 dark:border-gray-700/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    const title = createElement('h2', {
      className: 'text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2.5',
    });
    title.innerHTML = `${getDashboardIcon('announcement', 'w-6 h-6 text-[#012622] dark:text-teal-400')} اطلاعیه‌ها و ارتباطات مدرسه`;

    const desc = createElement('p', {
      className: 'text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-normal',
      textContent: `ارسال اطلاعیه‌های آموزشی، ارتباط با اولیا و معلمان، تنظیم مخاطبان هدف و زمان‌بندی انتشار.`,
    });

    headerText.appendChild(title);
    headerText.appendChild(desc);

    const addBtn = createElement('button', {
      className:
        'px-4 py-2.5 bg-[#012622] dark:bg-teal-700 hover:bg-[#003B36] dark:hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
      innerHTML: `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> ایجاد اطلاعیه / ارسال کمپین`,
    });
    addBtn.addEventListener('click', () => openCampaignModal());

    headerRow.appendChild(headerText);
    headerRow.appendChild(addBtn);

    // Tab Navigation Bar
    const tabBar = createElement('div', { className: 'flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2' });
    const tabAnnouncements = createElement('button', {
      className: `px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
        activeTab === 'announcements' ? 'bg-[#012622] dark:bg-teal-700 text-white shadow-2xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`,
      textContent: 'اطلاعیه‌های داخلی سامانه',
    });
    tabAnnouncements.addEventListener('click', () => {
      activeTab = 'announcements';
      render();
    });

    const tabSMS = createElement('button', {
      className: `px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
        activeTab === 'sms' ? 'bg-[#012622] dark:bg-teal-700 text-white shadow-2xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`,
      textContent: 'گزارش SMS شبیه‌سازی شده',
    });
    tabSMS.addEventListener('click', () => {
      activeTab = 'sms';
      render();
    });

    const parentConvs = schoolStore.getParentConversations(orgId);
    const unreadCount = parentConvs.filter((c) => c.status === 'awaiting_reply').length;

    const tabParentInbox = createElement('button', {
      className: `px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
        activeTab === 'parent_inbox' ? 'bg-[#012622] dark:bg-teal-700 text-white shadow-2xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`,
      innerHTML: `<span>صندوق پیام‌های اولیا</span>${
        unreadCount > 0 ? `<span class="px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full">${unreadCount}</span>` : ''
      }`,
    });
    tabParentInbox.addEventListener('click', () => {
      activeTab = 'parent_inbox';
      render();
    });

    tabBar.appendChild(tabAnnouncements);
    tabBar.appendChild(tabSMS);
    tabBar.appendChild(tabParentInbox);

    // Filter Toolbar
    const toolbar = createElement('div', {
      className: 'bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-3',
    });

    const searchWrapper = createElement('div', { className: 'relative' });
    const searchInput = createElement('input', {
      className:
        'w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl ps-9 pe-3 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
      attributes: { type: 'text', placeholder: 'جستجو در عنوان یا متن اطلاعیه...', value: searchQuery },
    });
    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value;
      render();
    });

    const searchIcon = createElement('div', {
      className: 'absolute start-3 top-2.5 text-gray-400 dark:text-gray-500 pointer-events-none',
      innerHTML: getDashboardIcon('search', 'w-4 h-4'),
    });
    searchWrapper.appendChild(searchIcon);
    searchWrapper.appendChild(searchInput);

    const audienceSelect = createElement('select', {
      className: 'bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
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

    if (activeTab === 'announcements') {
      if (filtered.length === 0) {
        const emptyState = createElement('div', {
          className: 'bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs',
          textContent: 'اطلاعیه‌ای با فیلترهای انتخابی موجود نیست.',
        });
        list.appendChild(emptyState);
      } else {
        filtered.forEach((anc) => {
          const card = createElement('div', {
            className: 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-5 shadow-2xs space-y-3',
          });

          let priorityBadge = 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
          if (anc.priority === 'urgent') priorityBadge = 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 font-extrabold';
          else if (anc.priority === 'important') priorityBadge = 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold';

          let audienceText = 'عمومی (همه مخاطبان)';
          if (anc.audience === 'parents') audienceText = 'اولیا دانش‌آموزان';
          else if (anc.audience === 'teachers') audienceText = 'کادر آموزشی و معلمان';
          else if (anc.audience === 'students') audienceText = 'دانش‌آموزان';

          card.innerHTML = `
            <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2.5">
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-sm text-gray-900 dark:text-gray-100">${anc.title}</span>
                <span class="px-2 py-0.5 rounded text-[10px] ${priorityBadge}">${anc.priority === 'urgent' ? 'فوری' : 'مهم'}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-[10px] font-bold">${audienceText}</span>
                <span class="px-2.5 py-1 ${
                  anc.isPublished ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                } rounded-lg text-[10px] font-extrabold">
                  ${anc.isPublished ? 'منتشر شده' : 'پیش‌نویس'}
                </span>
              </div>
            </div>

            <p class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-normal">${anc.content}</p>

            <div class="text-[10px] text-gray-400 dark:text-gray-500 flex items-center justify-between pt-1">
              <span>نویسنده: ${anc.authorName}</span>
              <span class="font-mono">${anc.createdAt}</span>
            </div>
          `;

          const actionsRow = createElement('div', { className: 'pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2 text-xs' });
          const toggleBtn = createElement('button', {
            className: 'px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-lg transition-colors cursor-pointer',
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
    } else if (activeTab === 'sms') {
      // SMS Logs Tab
      const smsLogs = schoolStore.getSMSLogs(orgId).filter((s) => {
        return (
          s.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.recipientPhone.includes(searchQuery) ||
          s.messageText.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });

      if (smsLogs.length === 0) {
        const emptyState = createElement('div', {
          className: 'bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs',
          textContent: 'سابقه پیامکی یافت نشد.',
        });
        list.appendChild(emptyState);
      } else {
        const tableCard = createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-2xs overflow-hidden' });
        const table = createElement('table', { className: 'polaris-table' });
        table.innerHTML = `
          <thead>
            <tr>
              <th>گیرنده</th>
              <th class="text-center">شماره همراه</th>
              <th>متن پیامک شبیه‌سازی شده</th>
              <th class="text-center">زمان ارسال</th>
              <th class="text-center">وضعیت</th>
            </tr>
          </thead>
        `;
        const tbody = createElement('tbody');
        smsLogs.forEach((log) => {
          const tr = createElement('tr');
          tr.innerHTML = `
            <td class="font-bold text-xs text-gray-900 dark:text-gray-100">${log.recipientName}</td>
            <td class="text-center font-mono text-xs text-gray-600 dark:text-gray-400">${log.recipientPhone}</td>
            <td class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">${log.messageText}</td>
            <td class="text-center font-mono text-xs text-gray-500 dark:text-gray-400">${log.sentAt}</td>
            <td class="text-center">
              <span class="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 rounded-lg text-[10px] font-black">
                شبیه‌سازی شده (دمو)
              </span>
            </td>
          `;
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        tableCard.appendChild(table);
        list.appendChild(tableCard);
      }
    } else {
      // Parent Messages Inbox Tab
      const convs = schoolStore.getParentConversations(orgId).filter((c) => {
        return (
          c.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.subject.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });

      if (convs.length === 0) {
        const emptyState = createElement('div', {
          className: 'bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs',
          textContent: 'هیچ پیام دریافتی از اولیا یافت نشد.',
        });
        list.appendChild(emptyState);
      } else {
        convs.forEach((conv) => {
          const item = createElement('div', {
            className: 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-5 shadow-2xs space-y-3 cursor-pointer hover:border-[#012622] dark:hover:border-teal-400 transition-colors',
          });

          let statusBadge = 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800';
          let statusText = 'در انتظار پاسخ مدیریت';
          if (conv.status === 'replied') {
            statusBadge = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            statusText = 'پاسخ داده شده';
          } else if (conv.status === 'resolved') {
            statusBadge = 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600';
            statusText = 'حل شده / بسته';
          }

          item.innerHTML = `
            <div class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-xs text-[#012622] dark:text-teal-300">${conv.parentName} (ولی ${conv.studentName} — ${conv.className})</span>
                <span class="text-[10px] text-gray-500 dark:text-gray-400 font-mono">${conv.parentPhone}</span>
              </div>
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusBadge}">${statusText}</span>
            </div>

            <h3 class="font-bold text-sm text-gray-900 dark:text-gray-100">${conv.subject}</h3>
            <p class="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">${conv.messages[0]?.content || ''}</p>

            <div class="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500 pt-1">
              <span>تعداد پیام‌ها: ${conv.messages.length}</span>
              <span class="font-mono">تاریخ درخواست: ${conv.createdAt}</span>
            </div>
          `;

          item.addEventListener('click', () => openAdminConversationModal(conv));
          list.appendChild(item);
        });
      }
    }

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(tabBar);
    rootWrapper.appendChild(toolbar);
    rootWrapper.appendChild(list);
  };

  const openCampaignModal = () => {
    const students = schoolStore.getStudents(orgId);
    const staff = schoolStore.getStaff(orgId);
    const classes = schoolStore.getClasses(orgId);

    const form = createElement('form', { className: 'space-y-4 dir-rtl text-xs text-gray-800 dark:text-gray-200' });

    form.innerHTML = `
      <div>
        <label class="block font-bold mb-1">عنوان / موضوع پیام *</label>
        <input type="text" id="cmp-title" required class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs font-bold text-gray-900 dark:text-gray-100" placeholder="مثال: فراخوان جلسه اولیا و مربیان" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-bold mb-1">کانال‌های ارسال *</label>
          <div class="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-2.5 rounded-xl border border-gray-300 dark:border-gray-600">
            <label class="flex items-center gap-1.5 font-bold cursor-pointer">
              <input type="checkbox" id="cmp-ch-internal" checked class="w-4 h-4 text-[#012622] rounded" /> اطلاعیه سامانه
            </label>
            <label class="flex items-center gap-1.5 font-bold cursor-pointer text-amber-900 dark:text-amber-300">
              <input type="checkbox" id="cmp-ch-sms" checked class="w-4 h-4 text-amber-600 rounded" /> پیامک SMS (دمو)
            </label>
          </div>
        </div>

        <div>
          <label class="block font-bold mb-1">گروه مخاطبان هدف *</label>
          <select id="cmp-audience" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs font-bold text-gray-900 dark:text-gray-100">
            <option value="all">همه کاربران (دانش‌آموزان، اولیا و معلمان)</option>
            <option value="parents">اولیا دانش‌آموزان</option>
            <option value="teachers">کادر آموزشی و معلمان</option>
            <option value="students">دانش‌آموزان</option>
            ${classes.map((c) => `<option value="class_${c.id}">کلاس ${c.name}</option>`).join('')}
            <option value="csv_import">ورود از فایل CSV / اکسل</option>
          </select>
        </div>
      </div>

      <!-- CSV Import Section (Hidden by default) -->
      <div id="csv-section" class="hidden space-y-2 bg-amber-50/60 dark:bg-amber-950/40 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/80">
        <label class="block font-bold text-amber-900 dark:text-amber-200">محتوای CSV گیرندگان (نام, شماره همراه):</label>
        <textarea id="csv-content" rows="3" class="w-full bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 rounded-lg p-2 text-xs font-mono text-gray-900 dark:text-gray-100" placeholder="رضا عباسی,09121110011&#10;مریم حسینی,09122223344"></textarea>
        <div id="csv-preview" class="text-[11px] text-gray-700 dark:text-gray-300 font-medium"></div>
      </div>

      <div class="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80">
        <span class="font-bold text-emerald-900 dark:text-emerald-200">تعداد تخمینی گیرندگان:</span>
        <span id="cmp-count-badge" class="px-3 py-1 bg-emerald-700 dark:bg-emerald-600 text-white rounded-lg font-mono font-black text-xs">...</span>
      </div>

      <div>
        <label class="block font-bold mb-1">متن پیام *</label>
        <textarea id="cmp-body" rows="4" required class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs text-gray-900 dark:text-gray-100 leading-relaxed" placeholder="شرح پیام..."></textarea>
      </div>
    `;

    const audienceSelect = form.querySelector('#cmp-audience') as HTMLSelectElement;
    const csvSection = form.querySelector('#csv-section') as HTMLElement;
    const csvContent = form.querySelector('#csv-content') as HTMLTextAreaElement;
    const csvPreview = form.querySelector('#csv-preview') as HTMLElement;
    const countBadge = form.querySelector('#cmp-count-badge') as HTMLElement;

    const calculateRecipients = () => {
      const aud = audienceSelect.value;
      if (aud === 'all') {
        const count = students.length + staff.length;
        countBadge.textContent = `${count.toLocaleString('fa-IR')} نفر`;
        csvSection.classList.add('hidden');
      } else if (aud === 'parents') {
        countBadge.textContent = `${students.length.toLocaleString('fa-IR')} ولی دانش‌آموز`;
        csvSection.classList.add('hidden');
      } else if (aud === 'teachers') {
        countBadge.textContent = `${staff.length.toLocaleString('fa-IR')} معلم و مدرس`;
        csvSection.classList.add('hidden');
      } else if (aud === 'students') {
        countBadge.textContent = `${students.length.toLocaleString('fa-IR')} دانش‌آموز`;
        csvSection.classList.add('hidden');
      } else if (aud.startsWith('class_')) {
        const clsId = aud.replace('class_', '');
        const count = students.filter((s) => s.classId === clsId).length;
        countBadge.textContent = `${count.toLocaleString('fa-IR')} دانش‌آموز کلاس`;
        csvSection.classList.add('hidden');
      } else if (aud === 'csv_import') {
        csvSection.classList.remove('hidden');
        const lines = csvContent.value.split('\n').filter((l) => l.trim().length > 0);
        let valid = 0;
        lines.forEach((line) => {
          const parts = line.split(',');
          if (parts.length >= 2 && parts[1]?.trim().match(/^09\d{9}$/)) {
            valid++;
          }
        });
        countBadge.textContent = `${valid.toLocaleString('fa-IR')} مخاطب CSV معتبر`;
        csvPreview.textContent = `تعداد کل سطرها: ${lines.length} | سطر معتبر: ${valid}`;
      }
    };

    audienceSelect.addEventListener('change', calculateRecipients);
    csvContent.addEventListener('input', calculateRecipients);
    calculateRecipients();

    let isSubmitting = false;

    const modal = new Modal({
      title: 'ایجاد اطلاعیه و کمپین اطلاع‌رسانی',
      content: form,
      confirmText: 'ارسال و ثبت کمپین',
      cancelText: 'انصراف',
      onConfirm: () => {
        if (isSubmitting) return;

        const title = (form.querySelector('#cmp-title') as HTMLInputElement).value.trim();
        const body = (form.querySelector('#cmp-body') as HTMLTextAreaElement).value.trim();
        const sendInternal = (form.querySelector('#cmp-ch-internal') as HTMLInputElement).checked;
        const sendSMS = (form.querySelector('#cmp-ch-sms') as HTMLInputElement).checked;
        const aud = audienceSelect.value;

        if (!title || !body) {
          showToast({ title: 'فیلد خالی', message: 'لطفاً عنوان و متن پیام را وارد نمایید.', type: 'warning' });
          return;
        }

        if (!sendInternal && !sendSMS) {
          showToast({ title: 'انتخاب کانال', message: 'حداقل یک کانال ارسال (سامانه یا SMS) باید انتخاب شود.', type: 'warning' });
          return;
        }

        isSubmitting = true;

        // 1. Internal Announcement
        if (sendInternal) {
          schoolStore.addAnnouncement({
            organizationId: orgId,
            title,
            content: body,
            audience: aud === 'parents' ? 'parents' : aud === 'teachers' ? 'teachers' : aud === 'students' ? 'students' : 'all',
            authorName: membership.organization.name,
            isPublished: true,
            priority: 'important',
          });
        }

        // 2. Simulated SMS Logs
        if (sendSMS) {
          let recipientsList: { name: string; phone: string }[] = [];

          if (aud === 'csv_import') {
            const lines = csvContent.value.split('\n');
            lines.forEach((line) => {
              const parts = line.split(',');
              if (parts.length >= 2) {
                const phone = parts[1]!.trim();
                if (phone.length >= 10) {
                  recipientsList.push({ name: parts[0]!.trim() || 'مخاطب CSV', phone });
                }
              }
            });
          } else {
            students.forEach((s) => {
              if (s.guardianPhone) recipientsList.push({ name: `${s.guardianName} (ولی ${s.fullName})`, phone: s.guardianPhone });
            });
            staff.forEach((st) => {
              if (st.phone) recipientsList.push({ name: st.fullName, phone: st.phone });
            });
          }

          recipientsList.forEach((r) => {
            schoolStore.addSMSLog({
              organizationId: orgId,
              recipientName: r.name,
              recipientPhone: r.phone,
              templateName: title,
              messageText: body,
              status: 'simulated_sent',
              triggerReason: 'کمپین اطلاع‌رسانی مدیریت',
            });
          });
        }

        showToast({ title: 'ارسال با موفقیت انجام شد', message: 'کمپین اطلاع‌رسانی با موفقیت پردازش و ثبت گردید.', type: 'success' });
        render();
      },
    });

    modal.open();
  };

  const openAdminConversationModal = (conv: any) => {
    const container = createElement('div', { className: 'space-y-4 text-xs dir-rtl text-gray-800 dark:text-gray-200' });

    const messagesList = createElement('div', { className: 'space-y-3 max-h-[300px] overflow-y-auto p-1' });

    conv.messages.forEach((msg: any) => {
      const isParent = msg.senderRole === 'parent';
      const msgBox = createElement('div', {
        className: `p-3.5 rounded-2xl border ${
          isParent ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80 ms-6' : 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 me-6'
        } space-y-1.5`,
      });

      msgBox.innerHTML = `
        <div class="flex items-center justify-between pb-1 border-b border-gray-200/60 dark:border-gray-700 text-[11px]">
          <span class="font-extrabold ${isParent ? 'text-amber-900 dark:text-amber-200' : 'text-emerald-950 dark:text-emerald-200'}">${msg.senderName}</span>
          <span class="font-mono text-gray-500 dark:text-gray-400 text-[10px]">${msg.sentAt}</span>
        </div>
        <p class="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">${msg.content}</p>
      `;

      messagesList.appendChild(msgBox);
    });

    const replyBox = createElement('div', { className: 'space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700' });
    replyBox.innerHTML = `
      <label class="block font-bold">ارسال پاسخ رسمی مدیریت:</label>
      <textarea id="admin-reply-text" rows="3" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-2 text-xs text-gray-900 dark:text-gray-100" placeholder="متن پاسخ مدیریت..."></textarea>
    `;

    const actionsRow = createElement('div', { className: 'flex items-center gap-2' });

    const sendReplyBtn = createElement('button', {
      className: 'flex-1 py-2 bg-[#012622] dark:bg-teal-700 hover:bg-[#003B36] dark:hover:bg-teal-600 text-white font-bold rounded-xl transition-colors cursor-pointer',
      textContent: 'ارسال پاسخ به ولی',
    });

    sendReplyBtn.addEventListener('click', () => {
      const textInput = container.querySelector('#admin-reply-text') as HTMLTextAreaElement;
      const val = textInput?.value.trim();
      if (!val) return;

      schoolStore.addReplyToParentConversation(
        conv.id,
        membership.userId,
        `${membership.organization.name} (مدیریت)`,
        'school_admin',
        val
      );

      showToast({ title: 'پاسخ ثبت شد', message: 'پاسخ مدیریت برای ولی ارسال گردید.', type: 'success' });
      modal.close();
      render();
    });

    const resolveBtn = createElement('button', {
      className: 'px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition-colors cursor-pointer',
      textContent: conv.status === 'resolved' ? 'بازگشایی گفتگو' : 'بستن گفتگو (حل شده)',
    });

    resolveBtn.addEventListener('click', () => {
      const newStatus = conv.status === 'resolved' ? 'replied' : 'resolved';
      schoolStore.updateParentConversationStatus(conv.id, newStatus);
      showToast({ title: 'بروزرسانی', message: 'وضعیت گفتگو بروزرسانی شد.', type: 'info' });
      modal.close();
      render();
    });

    actionsRow.appendChild(sendReplyBtn);
    actionsRow.appendChild(resolveBtn);
    replyBox.appendChild(actionsRow);

    container.appendChild(messagesList);
    container.appendChild(replyBox);

    const modal = new Modal({
      title: `رسیدگی به پیام ولی — ${conv.parentName} (${conv.studentName})`,
      content: container,
      confirmText: 'بستن',
    });

    modal.open();
  };

  render();
  return rootWrapper;
}
