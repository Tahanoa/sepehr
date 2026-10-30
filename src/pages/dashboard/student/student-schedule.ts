import { OrganizationMembership } from '../../../types/auth';
import { linkedStudents } from '../../../services/academic-store';
import { selectedLearner } from '../shared/family-data';
import { schoolStore } from '../../../services/school-store';
import { el,heading,panel,table,select,field } from '../../../components/workspace';
export function createStudentSchedule(m:OrganizationMembership):HTMLElement {
 const root=el('div',{className:'space-y-5 family-schedule'}),students=linkedStudents(m);
 let student=selectedLearner(m),timer:number|undefined;
 const days=[['saturday','شنبه'],['sunday','یکشنبه'],['monday','دوشنبه'],['tuesday','سه‌شنبه'],['wednesday','چهارشنبه'],['thursday','پنج‌شنبه'],['friday','جمعه']];
 const minutes=(value:string)=>{const normalized=value.replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))),parts=normalized.trim().split(':').map(Number);return (parts[0]||0)*60+(parts[1]||0);};
 const render=()=>{
  if(timer)clearInterval(timer);root.replaceChildren(heading(m.role==='parent'?'برنامه هفتگی فرزند':'برنامه هفتگی من','برنامه درسی به تفکیک روز و زنگ؛ ساعت‌ها بر اساس زمان تهران.'));
  if(!student){root.append(el('p',{textContent:'پرونده مرتبطی به حساب شما متصل نیست.',className:'sepehr-muted'}));return;}
  if(m.role==='parent'&&students.length>1)root.append(field('فرزند',select(students.map(s=>({id:s.id,name:s.fullName})),student.id,id=>{student=students.find(s=>s.id===id);render();})));
  const cfg=schoolStore.getScheduleConfig(m.organizationId),slots=schoolStore.getTimetable(m.organizationId).filter(s=>s.classId===student!.classId),live=panel();live.classList.add('schedule-now');live.setAttribute('aria-live','polite');root.append(el('p',{textContent:`${student.fullName} · ${student.className}`,className:'sepehr-muted'}),live);
  if(!cfg.isPublished){live.textContent='برنامه هنوز توسط مدرسه منتشر نشده است.';return;}
  const periods=cfg.periods||[],activeDays=days.filter(d=>cfg.activeDays?.some(key=>key===d[0])||slots.some(s=>s.dayOfWeek===d[0]));
  const cells=new Map<string,HTMLElement>();
  const update=()=>{const now=new Date(),parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tehran',weekday:'long',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now),part=(type:string)=>parts.find(p=>p.type===type)?.value||'',day=part('weekday').toLowerCase(),minute=Number(part('hour'))*60+Number(part('minute'));const current=slots.find(s=>{const range=s.timeLabel.split(/[-–]/),p=periods.find(p=>p.number===s.periodNumber);return s.dayOfWeek===day&&minute>=minutes(range[0]||p?.startTime||'')&&minute<minutes(range[1]||p?.endTime||'');});live.replaceChildren(el('span',{textContent:'اکنون · '+new Intl.DateTimeFormat('fa-IR',{timeZone:'Asia/Tehran',hour:'2-digit',minute:'2-digit'}).format(now),className:'sepehr-eyebrow'}),el('strong',{textContent:current?`${current.subjectName} · زنگ ${current.periodNumber.toLocaleString('fa-IR')}`:'اکنون درسی در برنامه ندارید.'}));for(const [key,cell]of cells){cell.classList.toggle('is-current',key===`${current?.dayOfWeek}|${current?.periodNumber}`);}};
  const grid=table(['روز / زنگ',...periods.map(p=>`${p.name?.replace(/\s*\([^)]*\)/g,'').trim()||'زنگ '+p.number.toLocaleString('fa-IR')} · ${p.startTime}–${p.endTime}`)]);grid.wrap.classList.add('weekly-grid');grid.wrap.setAttribute('aria-label','جدول برنامه هفتگی');
  for(const [day,label]of activeDays){const row=el('tr');row.append(el('th',{textContent:label||'',attributes:{scope:'row'}}));for(const p of periods){const cell=el('td'),slot=slots.find(s=>s.dayOfWeek===day&&s.periodNumber===p.number);if(p.isBreak)cell.append(el('span',{textContent:'زنگ تفریح',className:'sepehr-muted'}));else if(slot){const card=el('div',{className:'schedule-lesson'});card.append(el('strong',{textContent:slot.subjectName}),el('small',{textContent:slot.teacherName}),el('small',{textContent:`${slot.timeLabel} · اتاق ${slot.roomNumber||'—'}`}));cell.append(card);cells.set(`${day}|${p.number}`,card);}else cell.append(el('span',{textContent:'—',className:'sepehr-muted'}));row.append(cell);}grid.body.append(row);}root.append(grid.wrap);update();timer=window.setInterval(()=>{if(!root.isConnected){clearInterval(timer);return;}update();},30000);
 };
 render();window.addEventListener('sepehr-route-leave',()=>{if(timer)clearInterval(timer);},{once:true});return root;
}
