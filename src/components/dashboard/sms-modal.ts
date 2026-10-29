import { notify } from '../feedback';
/**
 * POLARIS LOCAL SIMULATED PARENT SMS MODAL
 * Interactive SMS notification composer with templates, estimated character count,
 * target selection, simulated sending, and logging into schoolStore.
 */

import { createElement } from '../../utils/dom';
import { getDashboardIcon } from './icons';
import { schoolStore } from '../../services/school-store';

export interface SMSModalOptions {
  organizationId: string;
  defaultRecipientPhone?: string;
  defaultRecipientName?: string;
  onSendComplete?: () => void;
  onClose: () => void;
}

const SMS_TEMPLATES = [
  { id: 'absent', name: 'هشدار غیبت غیرموجه', text: 'اولیا محترم؛ فرزند شما در تاریخ {تاریخ} در کلاس درس حاضر نشده است. لطفاً جهت اطلاع علت غیبت با دفتر مدرسه تماس حاصل فرمایید.' },
  { id: 'grades', name: 'اعلام کارنامه و نمرات', text: 'اولیا محترم؛ نمرات ارزشیابی دوره جدید فرزند شما در سامانه سپهر ثبت شد. جهت مشاهده به پنل اولیا مراجعه کنید.' },
  { id: 'tuition', name: 'یادآوری سررسید شهریه', text: 'سرپرست محترم؛ صورت‌حساب شهریه ترم جدید فرزند شما صادر گردید. لطفاً نسبت به تسویه حساب اقدام فرمایید.' },
  { id: 'event', name: 'دعوت به جلسه اولیا و مربیان', text: 'اولیای گرامی؛ جلسه تعاملی ماهانه روز {روز} ساعت {ساعت} در سالن همایش مرکز برگزار می‌گردد. حضور شما موجب امتنان است.' },
];

export function createSMSModal(options: SMSModalOptions): HTMLElement {
  const { organizationId, defaultRecipientPhone, defaultRecipientName, onSendComplete, onClose } = options;

  const backdrop = createElement('div', {
    className: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 dir-rtl animate-fadeIn',
  });

  const dialog = createElement('div', {
    className: 'bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]',
  });

  // Header
  const header = createElement('div', {
    className: 'bg-[rgb(var(--theme-primary))] text-white p-5 flex items-center justify-between border-b border-white/10 shrink-0',
  });
  header.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="p-2 bg-[rgb(var(--theme-accent))] text-[rgb(var(--theme-primary))] rounded-xl font-bold">
        ${getDashboardIcon('chat', 'w-5 h-5')}
      </div>
      <div>
        <h3 class="text-base font-semibold text-white">ارسال پیامک اطلاع‌رسانی اولیا (شبیه‌ساز SMS)</h3>
        <p class="text-xs text-amber-200">ارسال پیامک آزمایشی به شماره تماس اولیا با قالب‌های آماده</p>
      </div>
    </div>
  `;

  const closeBtn = createElement('button', {
    className: 'text-gray-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors',
    innerHTML: getDashboardIcon('close', 'w-5 h-5'),
  });
  closeBtn.addEventListener('click', onClose);
  header.appendChild(closeBtn);

  // Notice Banner
  const banner = createElement('div', {
    className: 'bg-amber-50 border-b border-amber-200 px-5 py-2 text-xs text-amber-900 flex items-center gap-2 shrink-0',
  });
  banner.innerHTML = `${getDashboardIcon('info', 'w-4 h-4 text-amber-700 shrink-0')}
    <span><strong>شبیه‌ساز پیامک:</strong> هیچ پیامک واقعی یا هزینه‌ای ارسال نخواهد شد و رکورد پیامک در لاگ سیستم ذخیره می‌گردد.</span>`;

  // Body Form
  const body = createElement('div', { className: 'p-6 overflow-y-auto space-y-4 flex-1' });

  const students = schoolStore.getStudents(organizationId);

  const form = createElement('form', { className: 'space-y-4' });
  form.innerHTML = `
    <div class="space-y-1 text-right">
      <label class="block text-xs font-bold text-gray-700">گیرنده پیامک:</label>
      <select id="sms-recipient" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-800 focus:border-[rgb(var(--theme-accent))] focus:ring-1 focus:ring-[rgb(var(--theme-accent))]">
        <option value="all">کلیه اولیا و سرپرستان (همگانی)</option>
        ${students
          .map(
            (s) =>
              `<option value="${s.guardianPhone}" ${
                defaultRecipientPhone === s.guardianPhone ? 'selected' : ''
              }>${s.guardianName} (ولی ${s.fullName}) — ${s.guardianPhone}</option>`
          )
          .join('')}
      </select>
    </div>

    <div class="space-y-1 text-right">
      <label class="block text-xs font-bold text-gray-700">انتخاب قالب آماده پیامک:</label>
      <select id="sms-template" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-800 focus:border-[rgb(var(--theme-accent))] focus:ring-1 focus:ring-[rgb(var(--theme-accent))]">
        <option value="">متن سفارشی (بدون قالب)</option>
        ${SMS_TEMPLATES.map((t) => `<option value="${t.id}">${t.name}</option>`).join('')}
      </select>
    </div>

    <div class="space-y-1 text-right">
      <div class="flex justify-between items-center">
        <label class="block text-xs font-bold text-gray-700">متن پیامک:</label>
        <span id="char-counter" class="text-[11px] text-gray-500 font-semibold">۰ کاراکتر (۱ پیامک)</span>
      </div>
      <textarea id="sms-text" rows="4" required class="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 leading-relaxed focus:border-[rgb(var(--theme-accent))] focus:ring-1 focus:ring-[rgb(var(--theme-accent))]" placeholder="متن پیامک خود را بنویسید...">${
        SMS_TEMPLATES[0]!.text
      }</textarea>
    </div>
  `;

  const templateSelect = form.querySelector('#sms-template') as HTMLSelectElement;
  const textarea = form.querySelector('#sms-text') as HTMLTextAreaElement;
  const charCounter = form.querySelector('#char-counter') as HTMLElement;

  const updateCharCounter = () => {
    const len = textarea.value.length;
    const parts = Math.ceil(len / 70) || 1;
    charCounter.textContent = `${len} کاراکتر (${parts} بخش پیامک)`;
  };

  textarea.addEventListener('input', updateCharCounter);
  updateCharCounter();

  templateSelect.addEventListener('change', () => {
    const selectedId = templateSelect.value;
    const t = SMS_TEMPLATES.find((item) => item.id === selectedId);
    if (t) {
      textarea.value = t.text;
      updateCharCounter();
    }
  });

  body.appendChild(form);

  // Footer Actions
  const footer = createElement('div', {
    className: 'bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-between shrink-0',
  });

  const cancelBtn = createElement('button', {
    className: 'px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-xl transition-colors',
    textContent: 'انصراف',
  });
  cancelBtn.addEventListener('click', onClose);

  const sendBtn = createElement('button', {
    className: 'px-5 py-2.5 bg-[rgb(var(--theme-primary))] hover:bg-[rgb(var(--theme-hover))] text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5',
    innerHTML: `${getDashboardIcon('announcement', 'w-4 h-4')} <span>شبیه‌سازی ارسال SMS</span>`,
  });

  sendBtn.addEventListener('click', () => {
    const recipientSelect = form.querySelector('#sms-recipient') as HTMLSelectElement;
    const msgText = textarea.value.trim();

    if (!msgText) {
      notify('لطفاً متن پیامک را وارد کنید.');
      return;
    }

    const recipientPhone = recipientSelect.value;
    const recipientName =
      recipientSelect.options[recipientSelect.selectedIndex]?.text || defaultRecipientName || 'اولیا';

    schoolStore.addSMSLog({
      organizationId,
      recipientName,
      recipientPhone: recipientPhone === 'all' ? 'کلیه شماره‌ها' : recipientPhone,
      templateName: templateSelect.options[templateSelect.selectedIndex]?.text || 'پیامک مستقیم',
      messageText: msgText,
      status: 'simulated_sent',
      triggerReason: 'ارسال مستقیم توسط کاربر در پنل دمو',
    });

    notify('پیامک شبیه‌سازی‌شده با موفقیت ارسال و در سوابق ذخیره شد.');
    if (onSendComplete) onSendComplete();
    onClose();
  });

  footer.appendChild(cancelBtn);
  footer.appendChild(sendBtn);

  dialog.appendChild(header);
  dialog.appendChild(banner);
  dialog.appendChild(body);
  dialog.appendChild(footer);

  backdrop.appendChild(dialog);
  return backdrop;
}

