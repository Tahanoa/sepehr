import { OrganizationMembership } from '../../../types/auth';
import { schoolStore } from '../../../services/school-store';
import { el,heading,panel,field,input,table,button } from '../../../components/workspace';
import { Modal } from '../../../components/modal';
export function createCounselorStudents(m:OrganizationMembership):HTMLElement {
 const root=el('div',{className:'space-y-5'});root.append(heading('پرونده و پیگیری دانش‌آموزان','مرور آموزشی و ارجاع‌های مشاوره؛ بدون ابزار مدیریت ثبت‌نام.'));
 const search=input('','search'),t=table(['دانش‌آموز','کلاس','غیبت ثبت‌شده','پیگیری']);root.append(field('جستجوی نام دانش‌آموز',search),t.wrap);
 for(const s of schoolStore.getStudents(m.organizationId)){const row=el('tr'),cell=el('td');for(const text of [s.fullName,s.className,String(schoolStore.getAttendance(m.organizationId).filter(a=>a.studentId===s.id&&a.status==='absent').length)])row.append(el('td',{textContent:text}));cell.append(button('مشاهده وضعیت آموزشی',()=>{const content=panel();content.append(el('p',{textContent:`${s.fullName} · ${s.gradeLevel} · ${s.className}`}));const referrals=schoolStore.getCounselingReferrals(m.organizationId).filter(r=>r.studentId===s.id);for(const r of referrals)content.append(el('p',{textContent:`${r.reason} · ${r.status}`}));if(!referrals.length)content.append(el('p',{textContent:'ارجاع مشاوره‌ای ثبت نشده است.'}));new Modal({title:'پیگیری آموزشی دانش‌آموز',content,confirmText:'بستن'}).open();}));row.append(cell);t.body.append(row);}
 search.addEventListener('input',()=>{for(const r of Array.from(t.body.rows))r.hidden=!r.cells[0]?.textContent?.includes(search.value);});return root;
}
export function createCounselorReports(m:OrganizationMembership):HTMLElement {
 const root=el('div',{className:'space-y-5'});root.append(heading('گزارش پیگیری مشاوره','نمای وضعیت ارجاع‌ها و جلسات؛ متناسب با کار مشاور.'));
 const referrals=schoolStore.getCounselingReferrals(m.organizationId),t=table(['دانش‌آموز','کلاس','علت ارجاع','وضعیت','جلسه بعدی']);for(const r of referrals){const row=el('tr');for(const v of [r.studentName,r.className,r.reason,r.status,r.scheduledAppointment||'تعیین نشده'])row.append(el('td',{textContent:v}));t.body.append(row);}root.append(t.wrap);if(!referrals.length)root.append(el('p',{textContent:'ارجاعی برای پیگیری ثبت نشده است.',className:'sepehr-muted'}));return root;
}
