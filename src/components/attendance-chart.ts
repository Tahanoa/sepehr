import { OrganizationMembership } from '../types/auth';
import { schoolStore } from '../services/school-store';
import { el, field, select, table } from './workspace';
/** Counts, never invented rates: submitted records only, including late/excused. */
export function createAttendanceChart(m:OrganizationMembership):HTMLElement{
  const root=el('section',{className:'attendance-chart'}),all=schoolStore.getAttendance(m.organizationId).filter(a=>a.submitted),classes=schoolStore.getClasses(m.organizationId);let date='all';
  const states=[['present','حاضر','var(--color-primary)'],['late','تأخیر','var(--color-accent)'],['absent','غایب','var(--color-danger)'],['excused','موجه','var(--color-secondary)']] as const;
  const render=()=>{root.replaceChildren();const dates=[...new Set(all.map(a=>a.date))].sort().reverse();const head=el('div',{className:'section-topline'});head.append(el('h3',{textContent:'حضور، به تفکیک کلاس'}),field('بازهٔ سوابق',select([{id:'all',name:'همهٔ سوابق'},...dates.map(d=>({id:d,name:d}))],date,v=>{date=v;render();})));root.append(head);
    const legend=el('div',{className:'chart-legend'});for(const [,label,color]of states){const s=el('span',{textContent:label});s.style.setProperty('--series',color);legend.append(s);}root.append(legend);
    const records=all.filter(a=>date==='all'||a.date===date);const t=table(['کلاس',...states.map(s=>s[1]),'مجموع']);let shown=0;
    for(const c of classes){const rows=records.filter(a=>a.classId===c.id);if(!rows.length)continue;shown++;
      const counts=states.map(([key])=>rows.filter(a=>a.status===key).length);const row=el('button',{className:'chart-row',attributes:{type:'button','aria-label':`${c.name}؛ ${states.map((s,i)=>s[1]+': '+counts[i]).join('، ')}؛ مشاهدهٔ جزئیات`}}),bar=el('span',{className:'chart-bar',attributes:{'aria-hidden':'true'}});
      counts.forEach((n,i)=>{const segment=el('span');segment.style.width=`${n/rows.length*100}%`;segment.style.setProperty('--series',states[i]![2]);bar.append(segment);});row.append(el('span',{textContent:c.name}),bar,el('span',{textContent:rows.length.toLocaleString('fa-IR')}));row.addEventListener('click',()=>{details.open=true;details.scrollIntoView({block:'nearest'});});root.append(row);
      const tr=el('tr');tr.append(el('th',{textContent:c.name,attributes:{scope:'row'}}));for(const n of [...counts,rows.length])tr.append(el('td',{textContent:n.toLocaleString('fa-IR')}));t.body.append(tr);
    }
    if(!shown)root.append(el('p',{className:'inbox-empty',textContent:'هنوز سابقهٔ نهایی‌شده‌ای در این بازه وجود ندارد.'}));
    const details=el('details',{className:'chart-details'});details.append(el('summary',{textContent:'مشاهدهٔ جدول دقیق'}),t.wrap);root.append(el('p',{className:'chart-caption',textContent:'طول هر ردیف سهم وضعیت‌ها را نشان می‌دهد؛ عدد کنار آن تعداد ثبت‌هاست، نه تعداد افراد یکتا. منبع: سوابق نهایی‌شدهٔ این مرورگر.'}),details);
  };render();return root;
}
