import { OrganizationMembership } from '../../../types/auth';
import { chats, contacts, selfContact, sendMessage, markRead } from '../../../services/academic-store';
import { el, heading, field, input, button, status } from '../../../components/workspace';
export function createMessengerPage(m: OrganizationMembership): HTMLElement {
  const root=el('div',{className:'workspace-page messenger-page'}),notice=status(),drafts=new Map<string,string>();let selected='',query='',mobileOpen=false;
  function render(){
    root.replaceChildren(heading('پیام‌رسان','گفتگوهای مرکز، در یک فضای ساده و متمرکز.'));
    try{
      const self=selfContact(m),people=contacts(m),threads=chats(m),grid=el('div',{className:`inbox-shell ${mobileOpen?'inbox-open':''}`}),side=el('aside',{className:'inbox-sidebar','attributes':{'aria-label':'مخاطبان و گفتگوها'}}),content=el('section',{className:'inbox-content'});
      const search=input(query,'search');search.placeholder='جستجوی مخاطب…';side.append(field('جستجوی مخاطب',search));
      const list=el('div',{className:'inbox-contacts'});
      function drawList(){list.replaceChildren();const filtered=people.filter(p=>p.name.includes(query)).sort((a,b)=>{const last=(id:string)=>threads.find(t=>t.participants.some(p=>p.id===id))?.messages.at(-1)?.at||'';return last(b.id).localeCompare(last(a.id));});
        for(const person of filtered){const thread=threads.find(t=>t.participants.some(p=>p.id===person.id)),last=thread?.messages.at(-1),unread=thread?.messages.filter(v=>v.sender!==self.id&&v.at>(thread.read[self.id]||'')).length||0;
          const b=button('',()=>{selected=person.id;mobileOpen=true;render();});b.className='inbox-contact';b.setAttribute('aria-label',person.name);if(selected===person.id)b.setAttribute('aria-current','true');
          const avatar=el('span',{className:'contact-avatar',textContent:person.name.trim().slice(0,1),attributes:{'aria-hidden':'true'}}),copy=el('span',{className:'contact-copy'});copy.append(el('strong',{textContent:person.name}),el('span',{textContent:last?.text||'شروع گفتگو',className:'contact-preview'}));b.append(avatar,copy);if(unread)b.append(el('span',{textContent:unread.toLocaleString('fa-IR'),className:'unread-count'}));list.append(b);
        }if(!filtered.length)list.append(el('p',{textContent:'مخاطبی پیدا نشد.',className:'inbox-empty'}));
      }search.addEventListener('input',()=>{query=search.value;drawList();});drawList();side.append(list,el('p',{textContent:'پیام‌ها فعلاً در همین مرورگر نگهداری می‌شوند.',className:'inbox-local-note'}));
      const person=people.find(p=>p.id===selected),thread=threads.find(t=>t.participants.some(p=>p.id===selected));
      if(person){const header=el('header',{className:'conversation-header'}),back=button('بازگشت به گفتگوها',()=>{mobileOpen=false;render();});back.classList.add('inbox-back');header.append(back,el('span',{className:'contact-avatar',textContent:person.name.trim().slice(0,1)}),el('h3',{textContent:person.name,className:'sepehr-section-title'}));content.append(header);
        const log=el('div',{className:'conversation-log',attributes:{role:'log','aria-label':'پیام‌های گفتگو'}});let day='';
        for(const msg of thread?.messages||[]){const date=new Date(msg.at),nextDay=date.toLocaleDateString('fa-IR');if(day!==nextDay){day=nextDay;log.append(el('p',{className:'chat-day',textContent:day}));}const bubble=el('article',{className:`chat-bubble ${msg.sender===self.id?'chat-own':''}`});bubble.append(el('p',{textContent:msg.text}),el('time',{textContent:date.toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'}),attributes:{datetime:msg.at}}));log.append(bubble);}
        if(!thread?.messages.length)log.append(el('p',{textContent:'گفتگو از اینجا شروع می‌شود.',className:'inbox-empty'}));
        const form=el('form',{className:'conversation-composer'}),text=el('textarea',{attributes:{rows:'2',maxlength:'4000',required:'true','aria-label':'متن پیام',placeholder:'پیام خود را بنویسید…'}}),send=el('button',{textContent:'ارسال پیام',className:'sepehr-primary',attributes:{type:'submit'}});text.value=drafts.get(selected)||'';
        const sync=()=>{drafts.set(selected,text.value);send.disabled=!text.value.trim();};text.addEventListener('input',sync);sync();form.append(text,send);form.addEventListener('submit',e=>{e.preventDefault();try{sendMessage(m,selected,text.value);drafts.delete(selected);notice.textContent='پیام در این مرورگر ثبت شد.';render();root.querySelector<HTMLTextAreaElement>('[aria-label="متن پیام"]')?.focus();}catch(e){notice.textContent=(e as Error).message;}});content.append(log,form,notice);if(thread)markRead(m,thread.id);queueMicrotask(()=>{log.scrollTop=log.scrollHeight;});
      }else{content.append(el('div',{className:'inbox-empty-state',innerHTML:'<span class="empty-orbit" aria-hidden="true">✉</span><h3>فضایی برای گفتگو</h3><p>یک مخاطب انتخاب کنید و گفتگو را ادامه دهید.</p>'}));}
      grid.append(side,content);root.append(grid);
    }catch(e){notice.textContent=(e as Error).message;root.append(notice);}
  }render();return root;
}
