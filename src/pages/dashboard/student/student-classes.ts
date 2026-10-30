import { OrganizationMembership } from '../../../types/auth';
import { selectedLearner } from '../shared/family-data';
import { schoolStore } from '../../../services/school-store';
import { el, heading, panel, button, navigate } from '../../../components/workspace';
import { assignmentDateKey } from './student-overview';
export function createStudentClasses(m:OrganizationMembership):HTMLElement {
 const root=el('div',{className:'space-y-5 class-hub'}),student=selectedLearner(m);
 root.append(heading('کلاس‌های من','اطلاعات کلاس، فعالیت‌های جاری و هم‌کلاسی‌ها.'));
 const cls=schoolStore.getClasses(m.organizationId).find(c=>c.id===student?.classId);
 if(!student||!cls){root.append(el('p',{textContent:'کلاسی به پرونده شما متصل نیست.',className:'sepehr-muted'}));return root;}
 const peers=schoolStore.getStudents(m.organizationId).filter(s=>s.classId===cls.id&&s.status==='active');
 const info=panel();info.append(el('h3',{textContent:cls.name,className:'sepehr-section-title'}),el('p',{textContent:`${cls.gradeLevel} · آموزگار / دبیر راهنما: ${cls.homeroomTeacherName||'تعیین نشده'}`}),el('p',{textContent:`اتاق ${cls.roomNumber||'—'} · ${peers.length.toLocaleString('fa-IR')} دانش‌آموز · سال تحصیلی ${m.organization.academicYear||'—'}`,className:'sepehr-muted'}),button('مشاهده برنامه هفتگی',()=>navigate(m.organizationId,'schedule')));root.append(info);
 const columns=el('div',{className:'class-columns'}),tasks=panel(),exams=panel();tasks.append(el('h3',{textContent:'تکالیف جاری',className:'sepehr-section-title'}));exams.append(el('h3',{textContent:'آزمون‌های جاری و پیش‌رو',className:'sepehr-section-title'}));
 const submitted=new Set(schoolStore.getSubmissionsForStudent(m.organizationId,student.id).map(s=>s.assignmentId)),pending=schoolStore.getAssignments(m.organizationId).filter(a=>a.classId===cls.id&&!submitted.has(a.id));
 const today=assignmentDateKey(new Date().toLocaleDateString('fa-IR',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}));
 for(const a of pending){const item=el('article',{className:'class-activity'});item.append(el('strong',{textContent:a.title}),el('p',{textContent:`${a.subjectName||'تکلیف کلاس'} · مهلت ${a.dueDate}${assignmentDateKey(a.dueDate)<today?' · مهلت گذشته':''}`,className:'sepehr-muted'}));tasks.append(item);}
 if(!pending.length)tasks.append(el('p',{textContent:'تکلیف تحویل‌نداده‌ای ندارید.',className:'sepehr-muted'}));tasks.append(button('همه تکالیف و پاسخ‌ها',()=>navigate(m.organizationId,'assignments')));
 const active=schoolStore.getExams(m.organizationId).filter(e=>e.classIds.includes(cls.id)&&!e.excludedStudentIds?.includes(student.id)&&['published','available','scheduled','in_progress'].includes(e.status));
 for(const e of active){const item=el('article',{className:'class-activity'});item.append(el('strong',{textContent:e.title}),el('p',{textContent:`${e.examDate} · ساعت ${e.startTime} · ${e.durationMinutes.toLocaleString('fa-IR')} دقیقه`,className:'sepehr-muted'}));exams.append(item);}
 if(!active.length)exams.append(el('p',{textContent:'آزمون فعالی برای کلاس منتشر نشده است.',className:'sepehr-muted'}));exams.append(button('ورود به آزمون‌های من',()=>navigate(m.organizationId,'exams')));columns.append(tasks,exams);root.append(columns);
 const roster=panel(),list=el('ul',{className:'class-peers'});roster.append(el('h3',{textContent:'هم‌کلاسی‌ها',className:'sepehr-section-title'}));for(const peer of peers)list.append(el('li',{textContent:peer.fullName+(peer.id===student.id?' · شما':'' )}));roster.append(list);root.append(roster);
 const subjects=panel();subjects.append(el('h3',{textContent:'درس‌ها و منابع کلاس',className:'sepehr-section-title'}));const names=[...new Set(schoolStore.getTimetable(m.organizationId).filter(t=>t.classId===cls.id).map(t=>t.subjectName))];subjects.append(el('p',{textContent:names.join(' · ')||'هنوز درسی در برنامه ثبت نشده است.'}),button('منابع و جزوه‌های من',()=>navigate(m.organizationId,'materials')));root.append(subjects);return root;
}
