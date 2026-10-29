import { OrganizationMembership } from '../../../types/auth';
import { schoolStore } from '../../../services/school-store';
import { classesFor } from '../../../services/academic-store';
import { el, heading, panel, button, navigate } from '../../../components/workspace';
export function createTeacherOverviewPage(m:OrganizationMembership):HTMLElement{
  const root=el('div',{className:'workspace-page'}),classes=classesFor(m);
  root.append(heading('کلاس‌های شما','برای ثبت روزانه، کلاس را مرور کنید؛ ابزارهای آموزشی از منوی اصلی در دسترس‌اند.'));
  const card=panel();card.append(el('h3',{textContent:'کلاس‌های تحت تدریس',className:'sepehr-section-title'}));
  for(const cls of classes){const row=el('article',{className:'sepehr-task'}),copy=el('div');const count=schoolStore.getStudents(m.organizationId).filter(s=>s.classId===cls.id).length;copy.append(el('h4',{textContent:cls.name,className:'sepehr-task-title'}),el('p',{textContent:`${cls.gradeLevel} · ${count.toLocaleString('fa-IR')} دانش‌آموز`,className:'sepehr-muted'}));row.append(copy);card.append(row);}
  if(!classes.length)card.append(el('p',{textContent:'هنوز کلاسی به شما اختصاص داده نشده است.',className:'sepehr-muted'}));
  card.append(button('ثبت حضور کلاس',()=>navigate(m.organizationId,'attendance'),true));root.append(card);return root;
}
