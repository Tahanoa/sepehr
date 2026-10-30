import { selectedLearner } from '../shared/family-data';
import { linkedStudents } from '../../../services/academic-store';
import { el,field,input,button,select,status,guard,isoToday } from '../../../components/workspace';
/**
 * POLARIS PARENT ATTENDANCE REPORT PAGE
 */

import { OrganizationMembership } from '../../../types/auth';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createParentAttendancePage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;

  const children=linkedStudents(membership);
  let child=selectedLearner(membership);



  const render = () => {
    rootWrapper.innerHTML = '';
    const attendance=schoolStore.getAttendance(orgId).filter(a=>a.studentId===child?.id);

    const headerRow = createElement('div', { className: 'pb-2 border-b border-gray-200 space-y-1' });
    headerRow.innerHTML = `
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2.5">
        ${getDashboardIcon('attendance', 'w-6 h-6 text-[rgb(var(--theme-primary))]')} گزارش حضور و غیاب فرزند
      </h2>
      <p class="text-xs sm:text-sm text-gray-600">مشاهده ریز سوابق حضور، غیبت‌ها و تأخیرهای ورودی ثبت‌شده توسط معلم.</p>
    `;

    const tableCard = createElement('div', { className: 'bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs overflow-hidden' });
    const table = createElement('table', { className: 'polaris-table' });
    table.innerHTML = `
      <thead>
        <tr>
          <th>تاریخ ثبت</th>
          <th class="text-center">کلاس</th>
          <th class="text-center">وضعیت حضور</th>
          <th>توضیحات معلم</th>
        </tr>
      </thead>
    `;

    const tbody = createElement('tbody');
    if (attendance.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-gray-500 py-6">سابقه‌ای برای نمایش موجود نیست.</td></tr>`;
    } else {
      attendance.forEach((att) => {
        const tr = createElement('tr');
        tr.innerHTML = `
          <td class="font-mono text-xs font-bold text-gray-900">${att.date}</td>
          <td class="text-center text-xs text-gray-600">${child ? child.className : '-'}</td>
          <td class="text-center">
            <span class="px-2.5 py-1 rounded text-[10px] font-bold ${
              att.status === 'present' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }">
              ${att.status === 'present' ? 'حاضر' : att.status === 'absent' ? 'غایب' : 'تأخیر'}
            </span>
          </td>
          <td class="text-xs text-gray-700">${att.notes || 'بدون توضیح'}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    table.appendChild(tbody);
    tableCard.appendChild(table);

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(tableCard);
    if(child){const form=el('form',{className:'sepehr-panel space-y-4'}),date=input(isoToday(),'date'),reason=el('textarea',{attributes:{rows:'3',required:'true',maxlength:'1000'}}),notice=status();
    form.append(el('h3',{textContent:'اعلام غیبت فرزند'}),field('فرزند',select(children.map(s=>({id:s.id,name:s.fullName})),child.id,id=>{child=children.find(s=>s.id===id);render();})),field('تاریخ غیبت',date),field('علت غیبت',reason),el('p',{textContent:'درخواست برای بررسی مدرسه ارسال می‌شود و به‌تنهایی غیبت را موجه نمی‌کند.',className:'sepehr-muted'}),button('ثبت اعلام غیبت',()=>guard(notice,()=>{if(!child||!date.value||!reason.value.trim())throw Error('تاریخ و علت غیبت را وارد کنید.');schoolStore.addParentConversation({organizationId:orgId,parentId:membership.userId,parentName:child.guardianName,parentPhone:child.guardianPhone,category:'attendance',studentId:child.id,studentName:child.fullName,className:child.className,subject:'اعلام غیبت فرزند'},`تاریخ: ${date.value} — علت: ${reason.value.trim()}`);reason.value='';notice.textContent='اعلام غیبت ثبت شد؛ مدرسه آن را در صندوق پیام اولیا بررسی می‌کند.';}),true),notice);rootWrapper.insertBefore(form,tableCard);}

  };

  render();
  return rootWrapper;
}
