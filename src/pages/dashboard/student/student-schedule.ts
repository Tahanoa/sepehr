import { OrganizationMembership } from '../../../types/auth';
import { linkedStudents } from '../../../services/academic-store';
import { schoolStore } from '../../../services/school-store';
import { el,heading,panel,table } from '../../../components/workspace';
export function createStudentSchedule(m:OrganizationMembership):HTMLElement {
 const root=el('div',{className:'space-y-6'}),student=linkedStudents(m)[0];root.append(heading('کلاس من · برنامه هفتگی',student?student.className:'پرونده دانش‌آموز به حساب متصل نیست.'));if(!student)return root;
 const slots=schoolStore.getTimetable(m.organizationId).filter(s=>s.classId===student.classId),cfg=schoolStore.getScheduleConfig(m.organizationId),live=panel();live.setAttribute('aria-live','polite');
 const digits=(v:string)=>v.replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)));const minutes=(v:string)=>{const [h,n]=digits(v).split(':').map(Number);return (h||0)*60+(n||0);};
 const days=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'],labels:Record<string,string>={saturday:'شنبه',sunday:'یکشنبه',monday:'دوشنبه',tuesday:'سه‌شنبه',wednesday:'چهارشنبه',thursday:'پنجشنبه',friday:'جمعه'};
 const update=()=>{const now=new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Tehran'})),minute=now.getHours()*60+now.getMinutes(),day=days[now.getDay()];const current=slots.find(s=>{const period=cfg.periods?.find(p=>p.number===s.periodNumber);const range=s.timeLabel.split(/[-–]/);return s.dayOfWeek===day&&minute>=minutes(range[0]||period?.startTime||'')&&minute<minutes(range[1]||period?.endTime||'');});live.textContent=cfg.isPublished?(current?`اکنون · زنگ ${current.periodNumber.toLocaleString('fa-IR')} · ${current.subjectName} · ${current.teacherName}`:'اکنون کلاس درسی در برنامه ندارید.'):'برنامه هنوز توسط مدرسه منتشر نشده است.';};update();
 const timer=window.setInterval(()=>{if(!root.isConnected){clearInterval(timer);return;}update();},30000);root.append(live);
 if(!cfg.isPublished)return root;
 const t=table(['روز','زنگ','ساعت','درس','دبیر']);for(const day of ['saturday','sunday','monday','tuesday','wednesday','thursday','friday']){const daily=slots.filter(s=>s.dayOfWeek===day).sort((a,b)=>a.periodNumber-b.periodNumber);if(!daily.length){const r=el('tr');for(const v of [labels[day]||day,'—','—','درسی ثبت نشده','—'])r.append(el('td',{textContent:v}));t.body.append(r);}for(const s of daily){const r=el('tr');for(const v of [labels[day]||day,String(s.periodNumber),s.timeLabel,s.subjectName,s.teacherName])r.append(el('td',{textContent:v}));t.body.append(r);}}root.append(t.wrap);return root;
}
