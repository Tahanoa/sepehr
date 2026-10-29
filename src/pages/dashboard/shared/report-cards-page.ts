import { confirmAction } from '../../../components/feedback';
import { protectUnsaved } from '../../../components/feedback';
import { OrganizationMembership } from '../../../types/auth';
import { schoolStore } from '../../../services/school-store';
import { classesFor, subjectsFor, linkedStudents, descriptive, isAdmin, marks, saveMarks, reports, buildReport, publishReport, entryOpen, setEntryOpen, Component, Report } from '../../../services/academic-store';
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
    root.replaceChildren(heading('کارنامه‌های الکترونیک',admin?'۱. نمرات را ثبت کنید؛ ۲. کارنامه را بسازید؛ ۳. پس از بازبینی منتشر کنید. تغییر نمرات، نسخهٔ منتشرشده را خودکار تغییر نمی‌دهد.':'کارنامه‌های منتشرشدهٔ مرکز؛ نسخه‌های پیش‌نویس نمایش داده نمی‌شوند.'));
    const filters=panel(), row=el('div',{className:'workspace-filters'});
    if(admin)row.append(field('کلاس',select(classes,classId,v=>change(()=>{classId=v;studentId=allStudents.find(s=>s.classId===v)?.id||'';}))));
    row.append(field('دانش‌آموز',select(allStudents.filter(s=>!admin||s.classId===classId).map(s=>({id:s.id,name:s.fullName})),studentId,v=>change(()=>{studentId=v;classId=allStudents.find(s=>s.id===v)?.classId||'';}))));
    const yearInput=input(year);yearInput.addEventListener('change',()=>change(()=>{year=yearInput.value.trim();}));row.append(field('سال تحصیلی',yearInput),field('نوبت',select([{id:'first',name:'نوبت اول'},{id:'second',name:'نوبت دوم'}],term,v=>change(()=>{term=v as 'first'|'second';}))));filters.append(row);root.append(filters);
    const student=allStudents.find(s=>s.id===studentId);if(!student){root.append(el('p',{textContent:'پروندهٔ مرتبطی پیدا نشد.',className:'sepehr-muted'}));return;}
    if(admin){
      const open=entryOpen(m,classId,year,term), lock=panel();lock.append(el('h3',{textContent:'دسترسی دبیران به ثبت نمرات',className:'sepehr-section-title'}),el('p',{textContent:`${open?'باز':'بسته'} · این کلاس · ${year} · ${term==='first'?'نوبت اول':'نوبت دوم'}. مدیر در هر دو حالت امکان اصلاح دارد.`,className:'sepehr-muted'}),button(open?'بستن ورود نمرات دبیران':'باز کردن ورود نمرات دبیران',()=>guard(notice,()=>{setEntryOpen(m,classId,year,term,!open);render();})));root.append(lock);
      const editor=panel(), desc=descriptive(m,classId), existing=marks(m), suffix=term==='first'?'1':'2', t=table(['درس',desc?'توصیف عملکرد مستمر':'مستمر از ۲۰',desc?'توصیف عملکرد پایانی':'پایانی از ۲۰','بازخورد']);const drafts:{studentId:string;subjectId:string;year:string;component:Component;value:string;feedback:string}[]=[];
      editor.append(el('h3',{textContent:'ثبت یا اصلاح ارزشیابی',className:'sepehr-section-title'}));
      if(desc)editor.append(el('p',{textContent:'برای ابتدایی، شرح توانایی‌ها، شواهد یادگیری و نیاز آموزشی بنویسید؛ نمرهٔ عددی یا برچسب رتبه‌ای استفاده نمی‌شود.',className:'sepehr-muted'}));
      for(const subject of subjectsFor(m,classId)){const tr=el('tr');tr.append(el('th',{textContent:subject.name,attributes:{scope:'row'}}));const old=existing.filter(v=>v.studentId===studentId&&v.subjectId===subject.id&&v.year===year), feedback=el('textarea',{attributes:{rows:'2','aria-label':`بازخورد ${subject.name}`}});feedback.value=old.find(v=>v.component===`final${suffix}`)?.feedback||'';
        for(const kind of ['continuous','final']){const component=`${kind}${suffix}` as Component, draft={studentId,subjectId:subject.id,year,component,value:old.find(v=>v.component===component)?.value||'',feedback:feedback.value};drafts.push(draft);const td=el('td'),value=desc?el('textarea',{attributes:{rows:'3'}}):input(draft.value,'number');value.value=draft.value;value.setAttribute('aria-label',`${kind==='continuous'?'مستمر':'پایانی'} ${subject.name}`);if(value instanceof HTMLInputElement){value.min='0';value.max='20';value.step='.25';}value.addEventListener('input',()=>{draft.value=value.value;dirty=true;notice.textContent='تغییرات ذخیره نشده دارید.';});feedback.addEventListener('input',()=>{draft.feedback=feedback.value;dirty=true;});td.append(value);tr.append(td);}
        const td=el('td');td.append(feedback);tr.append(td);t.body.append(tr);
      }
      editor.append(t.wrap,button('ذخیرهٔ ارزشیابی',()=>guard(notice,()=>{if(!year)throw Error('سال تحصیلی الزامی است.');saveMarks(m,classId,drafts);dirty=false;notice.textContent='ارزشیابی ذخیره شد؛ برای اعمال در کارنامه، آن را دوباره بسازید.';}),true),button('ساخت / بازسازی پیش‌نویس کارنامه',()=>guard(notice,async ()=>{if(dirty)throw Error('ابتدا تغییرات ارزشیابی را ذخیره کنید.');const old=reports(m).find(r=>r.studentId===studentId&&r.year===year&&r.term===term);if(old?.published&&!await confirmAction('بازسازی، نسخهٔ منتشرشده را به پیش‌نویس تبدیل می‌کند؛ ادامه می‌دهید؟'))return;buildReport(m,studentId,year,term);render();})));root.append(editor);
    }
    const report=reports(m).find(r=>r.studentId===studentId&&r.year===year&&r.term===term);
    if(report){const view=reportView(report,student.fullName),actions=el('div',{className:'flex flex-wrap gap-3'});if(admin)actions.append(button(report.published?'لغو انتشار':'انتشار برای دانش‌آموز و والد',()=>guard(notice,()=>{publishReport(m,report.id,!report.published);render();}),true));actions.append(button('چاپ کارنامه',()=>printReport(view)));root.append(view,actions);}else root.append(el('p',{textContent:admin?'هنوز کارنامه‌ای برای این انتخاب ساخته نشده است.':'هنوز کارنامه‌ای برای این نوبت منتشر نشده است.',className:'sepehr-muted'}));
    root.append(notice);
  }render();
  protectUnsaved(()=>dirty,()=>{dirty=false;});return root;
}
