import { OrganizationMembership } from '../../../types/auth';
import { schoolStore } from '../../../services/school-store';
import { ownApplications } from '../shared/family-data';
import { el,heading,panel,button,navigate } from '../../../components/workspace';
export function createApplicantCourses(m:OrganizationMembership):HTMLElement {
 const root=el('div',{className:'space-y-5'});root.append(heading('کاتالوگ دوره‌ها','دوره، سطح و مدرس را بررسی کنید و درخواست پذیرش بدهید.'));
 for(const c of schoolStore.getClasses(m.organizationId)){const card=panel();card.append(el('h3',{textContent:c.name,className:'sepehr-section-title'}),el('p',{textContent:`${c.gradeLevel} · مدرس: ${c.homeroomTeacherName||'تعیین نشده'}`}),el('p',{textContent:`ظرفیت باقی‌مانده: ${Math.max(0,c.capacity-c.studentCount).toLocaleString('fa-IR')}`,className:'sepehr-muted'}),button('درخواست ثبت‌نام در دوره',()=>navigate(m.organizationId,`registration?course=${c.id}`),true));root.append(card);}return root;
}
export function createApplicantPayments(m:OrganizationMembership):HTMLElement {
 const root=el('div',{className:'space-y-5'});root.append(heading('شهریه و رسید درخواست‌های من','فقط درخواست‌های ثبت‌شده با اطلاعات تماس حساب شما نمایش داده می‌شوند.'));
 const applications=ownApplications(m);if(!applications.length)root.append(el('p',{textContent:'هنوز درخواستی با اطلاعات این حساب ثبت نشده است.',className:'sepehr-muted'}),button('ثبت درخواست پذیرش',()=>navigate(m.organizationId,'registration')));
 for(const a of applications){const card=panel();card.append(el('h3',{textContent:a.courseName,className:'sepehr-section-title'}),el('p',{textContent:`کد پیگیری ${a.refCode} · ${a.tuitionFee.toLocaleString('fa-IR')} تومان · ${a.isPaid?'پرداخت ثبت شده':'پرداخت ثبت نشده'}`}),el('p',{textContent:'برای رسیدگی به پرداخت یا دریافت رسید، با آموزشگاه هماهنگ کنید.',className:'sepehr-muted'}));root.append(card);}return root;
}
