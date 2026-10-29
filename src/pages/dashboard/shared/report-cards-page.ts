import { confirmAction } from '../../../components/feedback';
import { protectUnsaved } from '../../../components/feedback';
import { OrganizationMembership } from '../../../types/auth';
import { schoolStore } from '../../../services/school-store';
import { classesFor, linkedStudents, isAdmin, reports, buildReport, publishReport, entryOpen, setAllEntryOpen, Report } from '../../../services/academic-store';
import { el, heading, panel, field, select, input, button, status, guard, table } from '../../../components/workspace';
function reportView(report: Report, name: string): HTMLElement {
  const card=panel();card.append(heading(`کارنامهٔ ${name}`,`${report.year} · ${report.term==='first'?'نوبت اول':'نوبت دوم'} · ${report.published?'منتشرشده':'پیش‌نویس'} · ${report.descriptive?'ارزشیابی توصیفی':'نمرات عددی از ۲۰'}`));
  const t=table(['درس','مستمر','پایانی','بازخورد']);for(const v of report.rows){const row=el('tr');[v.subject,v.continuous||'ثبت نشده',v.final||'ثبت نشده',v.feedback||'—'].forEach(text=>row.append(el('td',{textContent:text})));t.body.append(row);}card.append(t.wrap,el('p',{textContent:`زمان ساخت: ${new Date(report.updatedAt).toLocaleString('fa-IR')}`,className:'sepehr-muted'}));return card;
}
function printReport(view:HTMLElement):void{const copy=view.cloneNode(true) as HTMLElement;copy.classList.add('print-report');document.body.append(copy);const cleanup=()=>copy.remove();window.addEventListener('afterprint',cleanup,{once:true});window.print();}
export function createReportCardsPage(m: OrganizationMembership): HTMLElement {
  const root=el('div',{className:'space-y-6'}), admin=isAdmin(m), classes=admin?classesFor(m):[], allStudents=admin?schoolStore.getStudents(m.organizationId):linkedStudents(m), notice=status();
  let classId=classes[0]?.id||allStudents[0]?.classId||'', studentId=allStudents.find(s=>s.classId===classId)?.id||'', year=m.organization.academicYear||'۱۴۰۵–۱۴۰۶', term:'first'|'second'='first', dirty=false;
  const change=async (action:()=>void)=>{if(dirty&&!await confirmAction('تغییرات نمرات ذخیره نشده؛ کنار گذاشته شوند؟'))return;dirty=false;action();render();};
  function render(){
    root.replaceChildren(heading('کارنامه‌های الکترونیک',admin?'دسترسی همهٔ دبیران را یکجا تنظیم کنید؛ کارنامه‌ها را بازبینی و منتشر کنید.':'کارنامه‌های منتشرشدهٔ مرکز؛ نسخه‌های پیش‌نویس نمایش داده نمی‌شوند.'));
    const filters=panel(), row=el('div',{className:'workspace-filters'});
    if(admin)row.append(field('کلاس',select(classes,classId,v=>change(()=>{classId=v;studentId=allStudents.find(s=>s.classId===v)?.id||'';}))));
    row.append(field('دانش‌آموز',select(allStudents.filter(s=>!admin||s.classId===classId).map(s=>({id:s.id,name:s.fullName})),studentId,v=>change(()=>{studentId=v;classId=allStudents.find(s=>s.id===v)?.classId||'';}))));
    const yearInput=input(year);yearInput.addEventListener('change',()=>change(()=>{year=yearInput.value.trim();}));row.append(field('سال تحصیلی',yearInput),field('نوبت',select([{id:'first',name:'نوبت اول'},{id:'second',name:'نوبت دوم'}],term,v=>change(()=>{term=v as 'first'|'second';}))));filters.append(row);root.append(filters);
    const student=allStudents.find(s=>s.id===studentId);if(!student){root.append(el('p',{textContent:'پروندهٔ مرتبطی پیدا نشد.',className:'sepehr-muted'}));return;}
    if(admin){
      const open=entryOpen(m,'*',year,term), lock=panel();lock.append(el('h3',{textContent:'دسترسی دبیران به ثبت نمرات',className:'sepehr-section-title'}),el('p',{textContent:`${open?'باز':'بسته'} · تمام کلاس‌های مرکز · ${year} · ${term==='first'?'نوبت اول':'نوبت دوم'}. نمره‌ها فقط توسط دبیر تغییر می‌کنند.`,className:'sepehr-muted'}),button(open?'بستن ورود نمرات همهٔ کلاس‌ها':'باز کردن ورود نمرات همهٔ کلاس‌ها',()=>guard(notice,()=>{setAllEntryOpen(m,year,term,!open);render();})));root.append(lock);
      const editor=panel();editor.append(el('p',{textContent:'نمرات را دبیر ثبت می‌کند. پس از بازبینی، پیش‌نویس کارنامه را بسازید.',className:'workspace-notice'}),button('ساخت پیش‌نویس کارنامه',()=>guard(notice,async()=>{const old=reports(m).find(r=>r.studentId===studentId&&r.year===year&&r.term===term);if(old?.published&&!await confirmAction('نسخهٔ منتشرشده به پیش‌نویس تبدیل می‌شود؛ ادامه می‌دهید؟'))return;buildReport(m,studentId,year,term);render();})));root.append(editor);
    }
    const report=reports(m).find(r=>r.studentId===studentId&&r.year===year&&r.term===term);
    if(report){const view=reportView(report,student.fullName),actions=el('div',{className:'flex flex-wrap gap-3'});if(admin)actions.append(button(report.published?'لغو انتشار':'انتشار برای دانش‌آموز و والد',()=>guard(notice,()=>{publishReport(m,report.id,!report.published);render();}),true));actions.append(button('چاپ کارنامه',()=>printReport(view)));root.append(view,actions);}else root.append(el('p',{textContent:admin?'هنوز کارنامه‌ای برای این انتخاب ساخته نشده است.':'هنوز کارنامه‌ای برای این نوبت منتشر نشده است.',className:'sepehr-muted'}));
    root.append(notice);
  }render();
  protectUnsaved(()=>dirty,()=>{dirty=false;});return root;
}
