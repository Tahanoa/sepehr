import { Modal } from './modal';
import { createElement as el } from '../utils/dom';
import { authService } from '../services/auth-service';
import { getNavigationForRoleAndOrg } from '../config/navigation-config';
import { getDashboardIcon } from './dashboard/icons';
let opened=false;
export function openCommandMenu(): void {
  const m=authService.getActiveMembership();if(!m||opened)return;opened=true;
  const content=el('div',{className:'command-menu'}),search=el('input',{attributes:{type:'search',placeholder:'به کدام بخش می‌روید؟','aria-label':'جستجوی بخش‌های سپهر'}}),list=el('div',{className:'command-results'});
  const items=getNavigationForRoleAndOrg(m.role,m.organization.type,m.organizationId);
  const modal=new Modal({title:'جستجو در سپهر',content,confirmText:'بستن',onClose:()=>{opened=false;}});
  const render=()=>{list.replaceChildren();const filtered=items.filter(i=>i.title.includes(search.value.trim()));for(const item of filtered){const b=el('button',{className:'command-result',attributes:{type:'button'}});b.append(el('span',{innerHTML:getDashboardIcon(item.icon,'w-5 h-5')}),el('span',{textContent:item.title}),el('span',{textContent:'↵',className:'command-enter'}));b.addEventListener('click',()=>{modal.close();window.dispatchEvent(new CustomEvent('polaris-navigate',{detail:item.path}));});list.append(b);}if(!filtered.length)list.append(el('p',{textContent:'بخشی با این نام پیدا نشد.',className:'inbox-empty'}));};
  search.addEventListener('input',render);content.append(search,list);render();modal.open();search.focus();
  content.addEventListener('keydown',e=>{const choices=Array.from(list.querySelectorAll<HTMLButtonElement>('button'));let i=choices.indexOf(document.activeElement as HTMLButtonElement);if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();choices[Math.max(0,Math.min(choices.length-1,i+(e.key==='ArrowDown'?1:-1)))]?.focus();}if(e.key==='Enter'&&document.activeElement===search){e.preventDefault();choices[0]?.click();}});
}
export function installCommandShortcut(){document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'&&location.pathname.startsWith('/app')){e.preventDefault();openCommandMenu();}});}
