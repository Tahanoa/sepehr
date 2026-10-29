import { confirmAction } from '../../../components/feedback';
import { protectUnsaved } from '../../../components/feedback';
import { OrganizationMembership } from '../../../types/auth';
import { schoolStore } from '../../../services/school-store';
import { classesFor, subjectsFor, descriptive, journal, saveJournal, marks, saveMarks, components, Component, entryOpen, Journal } from '../../../services/academic-store';
import { el, heading, panel, field, select, input, button, status, guard, table, isoToday, faDate } from '../../../components/workspace';
export function createGradebookPage(m: OrganizationMembership): HTMLElement {
  const root=el('div',{className:'workspace-page gradebook-page'}), classes=classesFor(m), notice=status();
  let classId=classes.find(c=>c.id===new URLSearchParams(location.search).get('class'))?.id||classes.find(c=>subjectsFor(m,c.id).length>0)?.id||classes[0]?.id||'', subjectId=subjectsFor(m,classId)[0]?.id||'', week=isoToday(), tab='weekly', year=m.organization.academicYear||'۱۴۰۵–۱۴۰۶', component:Component='continuous1', dirty=false;
  const change=async (action:()=>void)=>{if(dirty && !await confirmAction('تغییرات ذخیره نشده کنار گذاشته شوند؟'))return;dirty=false;action();render();};
  const render=()=>{
    root.replaceChildren(heading('دفتر نمرات','ثبت روزانه و ارزشیابی نوبت‌ها، در یک دفتر.'));
    const toolbar=panel(), filters=el('div',{className:'workspace-filters'});
    const choices=classes.flatMap(c=>subjectsFor(m,c.id).map(s=>({id:c.id+'|'+s.id,name:c.name+' · '+s.name})));
    filters.append(field('کلاس و درس',select(choices,classId+'|'+subjectId,v=>change(()=>{const pair=v.split('|');classId=pair[0]||'';subjectId=pair[1]||'';}))));
    const tabs=el('div',{className:'workspace-segments'});for(const [id,label]of[['weekly','دفتر هفتگی'],['term','ثبت نمرات کارنامه']]){const b=button(label!,()=>change(()=>{tab=id!;}));b.setAttribute('aria-pressed',String(tab===id));tabs.append(b);};toolbar.append(filters,tabs);root.append(toolbar);
    if(!classId||!subjectId){root.append(el('p',{textContent:'کلاس یا درس قابل دسترسی یافت نشد.',className:'sepehr-muted'}));return;}
    const search=input('','search');search.placeholder='نام دانش‌آموز…';toolbar.append(field('جستجوی دانش‌آموز',search));search.addEventListener('input',()=>{root.querySelectorAll<HTMLTableRowElement>('tbody tr').forEach(row=>{row.hidden=!row.querySelector('th')?.textContent?.includes(search.value);});});
    const students=schoolStore.getStudents(m.organizationId).filter(s=>s.classId===classId), isDesc=descriptive(m,classId), card=panel();
    notice.textContent=dirty?'تغییرات ذخیره نشده دارید.':'';
    if(tab==='weekly'){
      const weekTools=el('div',{className:'gradebook-week-tools'});const move=(days:number)=>change(()=>{const d=new Date(week+'T12:00:00');d.setDate(d.getDate()+days);week=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');});weekTools.append(button('هفتهٔ قبل',()=>{void move(-7);}),el('strong',{textContent:faDate(week)}),button('این هفته',()=>change(()=>{week=isoToday();})),button('هفتهٔ بعد',()=>{void move(7);}));card.append(weekTools);
      const start=new Date(week+'T12:00:00'); start.setDate(start.getDate()-((start.getDay()+1)%7));
      const dates=Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;});
      const names=['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'], t=table(['دانش‌آموز',...dates.map((d,i)=>`${names[i]} · ${faDate(d)}`)]), existing=journal(m), drafts:Journal[]=[];
      t.wrap.classList.add('gradebook-grid');
      const dayPicker=select(names.map((name,i)=>({id:String(i),name})),String((new Date().getDay()+1)%7),v=>{t.wrap.dataset.day=v;});t.wrap.dataset.day=dayPicker.value;const dayField=field('روز نمایش در موبایل',dayPicker);dayField.classList.add('gradebook-day-picker');weekTools.append(dayField);
      for(const student of students){const row=el('tr');row.append(el('th',{textContent:student.fullName,attributes:{scope:'row'}}));for(const day of dates){const cell=el('td',{attributes:{'data-day':String(dates.indexOf(day))}}), old=existing.find(v=>v.studentId===student.id&&v.subjectId===subjectId&&v.date===day), draft:Journal={studentId:student.id,subjectId,date:day,value:old?.value||'',note:old?.note||''};drafts.push(draft);
        const value=isDesc?el('textarea',{attributes:{rows:'2',placeholder:'شرح پیشرفت'}}):input(draft.value,'number');value.value=draft.value;if(value instanceof HTMLInputElement){value.min='0';value.max='20';value.step='.25';}
        value.setAttribute('aria-label',`${student.fullName} ${names[dates.indexOf(day)]} ${isDesc?'توصیف':'نمره'}`);value.addEventListener('input',()=>{draft.value=value.value;dirty=true;notice.textContent='تغییرات ذخیره نشده دارید.';});
        const note=el('textarea',{attributes:{rows:'2',placeholder:'یادداشت روزانه','aria-label':`یادداشت ${student.fullName} ${names[dates.indexOf(day)]}`}});note.value=draft.note;note.addEventListener('input',()=>{draft.note=note.value;dirty=true;notice.textContent='تغییرات ذخیره نشده دارید.';});const details=el('details',{className:'gradebook-note'}),summary=el('summary',{textContent:draft.note?'مشاهدهٔ یادداشت':'افزودن یادداشت'});details.append(summary,note);note.addEventListener('input',()=>{summary.textContent=note.value?'ویرایش یادداشت':'افزودن یادداشت';});cell.append(value,details);row.append(cell);}t.body.append(row);}
      card.append(el('p',{textContent:'نمره را در خانهٔ روز وارد کنید؛ یادداشت هر خانه با یک کلیک باز می‌شود.',className:'sepehr-muted'}),t.wrap,button('ذخیرهٔ دفتر هفتگی',()=>guard(notice,()=>{saveJournal(m,classId,drafts);dirty=false;notice.textContent='دفتر هفتگی ذخیره شد.';}),true));
    }else{
      const yearInput=input(year);yearInput.addEventListener('change',()=>change(()=>{year=yearInput.value.trim();}));
      const advanced=el('details'),advancedTitle=el('summary',{textContent:'تغییر سال تحصیلی'});advanced.append(advancedTitle,field('سال تحصیلی',yearInput));card.append(advanced,field('بخش کارنامه',select(Object.entries(components).map(([id,name])=>({id,name})),component,v=>change(()=>{component=v as Component;}))));
      const open=entryOpen(m,classId,year,component.endsWith('1')?'first':'second');card.append(el('p',{textContent:open?'ثبت نمرات این نوبت باز است.':'ثبت نمرات این نوبت توسط مدیر بسته شده است.',className:'workspace-notice'}));
      const existing=marks(m), drafts:{studentId:string;subjectId:string;year:string;component:Component;value:string;feedback:string}[]=[], t=table(['دانش‌آموز',isDesc?'شرح پیشرفت و نیاز آموزشی':'نمره از ۲۰','بازخورد']);
      for(const student of students){const old=existing.find(v=>v.studentId===student.id&&v.subjectId===subjectId&&v.year===year&&v.component===component), draft={studentId:student.id,subjectId,year,component,value:old?.value||'',feedback:old?.feedback||''};drafts.push(draft);const row=el('tr'),cell=el('td');row.append(el('th',{textContent:student.fullName,attributes:{scope:'row'}}));
        const value=isDesc?el('textarea',{attributes:{rows:'3',placeholder:'شرح توانایی، شاهد یادگیری و گام بعدی'}}):input(draft.value,'number');value.value=draft.value;value.disabled=!open;value.setAttribute('aria-label',`${isDesc?'توصیف':'نمره'} ${student.fullName}`);if(value instanceof HTMLInputElement){value.min='0';value.max='20';value.step='.25';}
        value.addEventListener('input',()=>{draft.value=value.value;dirty=true;notice.textContent='تغییرات ذخیره نشده دارید.';});cell.append(value);const feedback=el('textarea',{attributes:{rows:'2','aria-label':`بازخورد ${student.fullName}`}});feedback.value=draft.feedback;feedback.disabled=!open;feedback.addEventListener('input',()=>{draft.feedback=feedback.value;dirty=true;});const feedbackCell=el('td');feedbackCell.append(feedback);row.append(cell,feedbackCell);t.body.append(row);}
      const save=button('ذخیرهٔ ارزشیابی کارنامه',()=>guard(notice,()=>{if(!year.trim())throw Error('سال تحصیلی را وارد کنید.');saveMarks(m,classId,drafts);dirty=false;notice.textContent='ارزشیابی ذخیره شد.';}),true);save.disabled=!open;card.append(t.wrap,save);
    }
    root.append(card,notice);
  };render();
  protectUnsaved(()=>dirty,()=>{dirty=false;});return root;
}
