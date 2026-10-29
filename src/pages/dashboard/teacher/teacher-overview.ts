import { OrganizationMembership } from '../../../types/auth';
import { schoolStore } from '../../../services/school-store';
import { classesFor } from '../../../services/academic-store';
import { el, heading, button, navigate } from '../../../components/workspace';
export function createTeacherOverviewPage(m:OrganizationMembership):HTMLElement{
  const root=el('div',{className:'workspace-page'}),classes=classesFor(m),students=schoolStore.getStudents(m.organizationId);
  root.append(heading('کلاس‌های شما','دفتر کار معلم؛ حضور، یادگیری و بازخورد در کنار هم.'));
  const list=el('section',{className:'teacher-class-ledger'});
  for(const cls of classes){const row=el('article',{className:'teacher-class-row'}),copy=el('div');const count=students.filter(s=>s.classId===cls.id).length;copy.append(el('p',{textContent:cls.gradeLevel,className:'sepehr-eyebrow'}),el('h3',{textContent:cls.name,className:'sepehr-section-title'}),el('p',{textContent:`${count.toLocaleString('fa-IR')} دانش‌آموز`,className:'sepehr-muted'}));const actions=el('div',{className:'flex flex-wrap gap-2'});actions.append(button('ثبت حضور کلاس',()=>navigate(m.organizationId,`attendance?class=${encodeURIComponent(cls.id)}`),true),button('دفتر نمرات',()=>navigate(m.organizationId,`grades?class=${encodeURIComponent(cls.id)}`)));row.append(copy,actions);list.append(row);}
  if(!classes.length)list.append(el('p',{textContent:'هنوز کلاسی به شما اختصاص داده نشده است.',className:'sepehr-muted'}));root.append(list);return root;
}
