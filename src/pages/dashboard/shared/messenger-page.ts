import { OrganizationMembership } from '../../../types/auth';
import { chats, contacts, selfContact, sendMessage, markRead } from '../../../services/academic-store';
import { el, heading, panel, field, select, button, status, guard } from '../../../components/workspace';
export function createMessengerPage(m: OrganizationMembership): HTMLElement {
  const root=el('div',{className:'space-y-6'}), notice=status(); let selected='';
  const render=()=>{
    root.replaceChildren(heading('پیام‌رسان مرکز','گفتگوی مستقیم و خصوصی با مخاطب منتخب؛ نسخهٔ فعلی پیام‌ها را در همین مرورگر نگه می‌دارد.'));
    try {
      const self=selfContact(m), people=contacts(m), list=chats(m).sort((a,b)=>(b.messages.at(-1)?.at || '').localeCompare(a.messages.at(-1)?.at || ''));
      const grid=el('div',{className:'messenger-grid'}), sidebar=panel(), conversation=panel();
      sidebar.append(el('h3',{textContent:'گفتگوها',className:'sepehr-section-title'}));
      const recipient=select([{id:'',name:'شروع گفتگوی جدید…'},...people],selected,id=>{selected=id;render();}); sidebar.append(field('مخاطب',recipient));
      for(const chat of list){const other=chat.participants.find(p=>p.id!==self.id)!; const unread=chat.messages.filter(v=>v.sender!==self.id && v.at>(chat.read[self.id]||'')).length;
        const b=button(`${other.name}${unread ? ` · ${unread.toLocaleString('fa-IR')} پیام تازه`:''}`,()=>{selected=other.id;markRead(m,chat.id);render();}); b.classList.add('chat-contact'); if(selected===other.id)b.setAttribute('aria-current','true');sidebar.append(b);
      }
      if(!list.length)sidebar.append(el('p',{textContent:'هنوز گفتگویی ندارید؛ یک مخاطب انتخاب کنید.',className:'sepehr-muted'}));
      const person=people.find(p=>p.id===selected), current=list.find(c=>c.participants.some(p=>p.id===selected));
      if(person){
        conversation.append(el('h3',{textContent:person.name,className:'sepehr-section-title'}));
        const log=el('div',{className:'chat-log',attributes:{role:'log','aria-label':'پیام‌های گفتگو'}});
        for(const msg of current?.messages||[]){const item=el('article',{className:`chat-bubble ${msg.sender===self.id?'chat-own':''}`});item.append(el('p',{textContent:msg.text}),el('time',{textContent:new Date(msg.at).toLocaleString('fa-IR'),attributes:{datetime:msg.at}}));log.append(item);}
        if(!current?.messages.length)log.append(el('p',{textContent:'پیام نخست را بنویسید.',className:'sepehr-muted'}));
        const form=el('form',{className:'space-y-3'}), text=el('textarea',{attributes:{rows:'3',maxlength:'4000',required:'true',placeholder:'پیام خود را بنویسید…'}}), send=el('button',{textContent:'ارسال پیام',className:'sepehr-primary',attributes:{type:'submit'}});
        form.append(field('متن پیام',text),send,notice);form.addEventListener('submit',e=>{e.preventDefault();guard(notice,()=>{sendMessage(m,selected,text.value);notice.textContent='پیام در این مرورگر ثبت شد.';render();});});conversation.append(log,form);
        if(current)markRead(m,current.id);
      }else conversation.append(el('h3',{textContent:'گفتگو را انتخاب کنید',className:'sepehr-section-title'}),el('p',{textContent:'پیام‌های مدیر و مشاور در گفتگوهای جدا نمایش داده می‌شوند.',className:'sepehr-muted'}));
      grid.append(sidebar,conversation);root.append(grid);
    }catch(error){notice.textContent=(error as Error).message;root.append(notice);}
  };render();return root;
}
