import { OrganizationMembership } from '../../../types/auth';
import { linkedStudents } from '../../../services/academic-store';
import { schoolStore } from '../../../services/school-store';
import { el, heading, panel, button, navigate } from '../../../components/workspace';
export function createParentChildrenPage(m: OrganizationMembership): HTMLElement {
  const root=el('div',{className:'workspace-page space-y-5'});
  root.append(heading('فرزندان من','اطلاعات تحصیلی و مسیرهای پیگیری فرزندان شما در این مرکز.'));
  const children=linkedStudents(m);
  if(!children.length)root.append(panel(),el('p',{textContent:'پرونده فرزندی به این حساب متصل نیست.'}));
  for(const child of children){
    const card=panel(),cls=schoolStore.getClasses(m.organizationId).find(c=>c.id===child.classId);
    card.append(el('h3',{textContent:child.fullName,className:'sepehr-section-title'}),el('p',{textContent:`${child.gradeLevel} · ${child.className} · کد دانش‌آموزی ${child.studentCode}`}),el('p',{textContent:`آموزگار / دبیر راهنما: ${cls?.homeroomTeacherName||'تعیین نشده'} · اتاق ${cls?.roomNumber||'—'}`,className:'sepehr-muted'}));
    const stats=el('div',{className:'class-meta'}),attendance=schoolStore.getAttendance(m.organizationId).filter(a=>a.studentId===child.id);
    stats.append(el('span',{textContent:`غیبت ثبت‌شده: ${attendance.filter(a=>a.status==='absent').length.toLocaleString('fa-IR')}`}),el('span',{textContent:`یادداشت آموزگار: ${schoolStore.getWeeklyNotes(m.organizationId,child.classId,child.id).filter(n=>n.isParentVisible).length.toLocaleString('fa-IR')}`}));card.append(stats);
    const actions=el('div',{className:'flex flex-wrap gap-2'});
    for(const [label,section] of [['مشاهده کارنامه','grades'],['گزارش و اعلام غیبت','attendance'],['برنامه هفتگی','schedule'],['گفتگو با مدرسه','messages']])actions.append(button(label!,()=>navigate(m.organizationId,`${section}?student=${child.id}`)));
    card.append(actions);root.append(card);
  }
  return root;
}
