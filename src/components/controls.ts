/** Progressive enhancement keeps the existing value/change/form contracts intact. */
import { createElement as el } from '../utils/dom';
let counter = 0;
const normal = (s: string) => s.replace(/ي/g,'ی').replace(/ك/g,'ک').toLocaleLowerCase();
function labelFor(source: HTMLInputElement | HTMLSelectElement): string {
  const labels = Array.from(source.labels || []).map(l => { const copy=l.cloneNode(true) as HTMLElement; copy.querySelectorAll('select,input,textarea,button,.custom-control').forEach(n=>n.remove()); return copy.textContent?.trim(); }).join(' ');
  return source.getAttribute('aria-label') || labels || (source.previousElementSibling?.tagName === 'LABEL' ? source.previousElementSibling.textContent?.trim() : '') || source.getAttribute('placeholder') || 'انتخاب';
}
function shell(source: HTMLInputElement | HTMLSelectElement) {
  source.setAttribute('aria-label',labelFor(source));
  const wrap = el('span', { className: 'custom-control' });
  const trigger = el('button', { className: 'control-trigger', attributes: { type:'button', 'aria-label': labelFor(source), 'aria-haspopup':'dialog', 'aria-expanded':'false' } });
  const pop = el('div', { className: 'control-popover', attributes:{ popover:'auto', role:'dialog', 'aria-label':'گزینه‌های ' + labelFor(source), id:`control-${++counter}` } });
  trigger.setAttribute('aria-controls', pop.id);
  source.before(wrap); wrap.append(source, trigger, pop); source.classList.add('control-source'); source.tabIndex=-1; source.setAttribute('aria-hidden','true'); source.dataset.enhanced='true';
  const position = () => { const r=trigger.getBoundingClientRect(); pop.style.width=`${Math.min(Math.max(r.width,280),innerWidth-24)}px`; pop.style.left=`${Math.max(12,Math.min(r.right-parseFloat(pop.style.width),innerWidth-parseFloat(pop.style.width)-12))}px`; pop.style.top=`${Math.max(12,Math.min(r.bottom+6,innerHeight-Math.min(pop.scrollHeight,400)-12))}px`; };
  trigger.addEventListener('click', () => { if(pop.matches(':popover-open'))pop.hidePopover(); else { pop.showPopover(); position(); pop.querySelector<HTMLElement>('input, [aria-selected=true], button:not([disabled])')?.focus(); } });
  pop.addEventListener('toggle', () => trigger.setAttribute('aria-expanded',String(pop.matches(':popover-open'))));
  pop.addEventListener('keydown', e => { if(e.key==='Escape'){e.stopPropagation();pop.hidePopover();trigger.focus();} });
  const close=()=>{pop.hidePopover(); if(trigger.isConnected)trigger.focus();};
  source.addEventListener('invalid',e=>{e.preventDefault();trigger.setAttribute('aria-invalid','true');trigger.focus();});
  return {wrap,trigger,pop,close};
}
function enhanceSelect(source: HTMLSelectElement) {
  if(source.multiple)return; // no multiple selects currently exist
  const {trigger,pop,close}=shell(source);
  const search=el('input',{className:'control-search',attributes:{type:'search',placeholder:'جستجو…','aria-label':'جستجوی گزینه‌ها'}});
  const list=el('div',{className:'control-options',attributes:{role:'listbox','aria-label':labelFor(source)}});pop.append(search,list);
  const sync=()=>{trigger.textContent=source.selectedOptions[0]?.textContent || 'انتخاب کنید';trigger.disabled=source.disabled;trigger.removeAttribute('aria-invalid');};
  const render=()=>{list.replaceChildren();for(const option of Array.from(source.options).filter(o=>normal(o.text).includes(normal(search.value)))){
    const b=el('button',{textContent:option.text,className:'control-option',attributes:{type:'button',role:'option','aria-selected':String(option.selected)}});b.disabled=option.disabled;
    b.addEventListener('click',()=>{source.value=option.value;source.dispatchEvent(new Event('input',{bubbles:true}));source.dispatchEvent(new Event('change',{bubbles:true}));sync();close();});list.append(b);
  }if(!list.children.length)list.append(el('p',{className:'inbox-empty',textContent:'گزینه‌ای پیدا نشد.'}));};
  search.addEventListener('input',render);trigger.addEventListener('click',()=>{search.value='';render();search.focus();});
  pop.addEventListener('keydown',e=>{const options=Array.from(list.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));let index=options.indexOf(document.activeElement as HTMLButtonElement);if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();index=e.key==='Home'?0:e.key==='End'?options.length-1:Math.max(0,Math.min(options.length-1,index+(e.key==='ArrowDown'?1:-1)));options[index]?.focus();}});
  const desc=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value')!;
  Object.defineProperty(source,'value',{get(){return desc.get!.call(source);},set(v:string){desc.set!.call(source,v);sync();},configurable:true});
  source.addEventListener('change',sync);sync();render();
}
const iso=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const persian=new Intl.DateTimeFormat('fa-IR-u-nu-latn',{year:'numeric',month:'numeric',day:'numeric'});
function parts(d:Date){const p=persian.formatToParts(d);return {month:Number(p.find(x=>x.type==='month')!.value),day:Number(p.find(x=>x.type==='day')!.value)};}
function enhanceDate(source:HTMLInputElement){
  const {trigger,pop,close}=shell(source);pop.classList.add('calendar-popover');
  let current=source.value?new Date(source.value+'T12:00:00'):new Date();
  const shift=(days:number)=>{current.setDate(current.getDate()+days);render();};
  const month=(direction:number)=>{const d=parts(current).day;current.setDate(current.getDate()-d+1);current.setDate(current.getDate()+(direction>0?32:-1));current.setDate(current.getDate()-parts(current).day+1);render();};
  const sync=()=>{trigger.textContent=source.value?new Date(source.value+'T12:00:00').toLocaleDateString('fa-IR',{year:'numeric',month:'long',day:'numeric'}):'انتخاب تاریخ';trigger.disabled=source.disabled;};
  const choose=(d:Date)=>{source.value=iso(d);sync();source.dispatchEvent(new Event('input',{bubbles:true}));source.dispatchEvent(new Event('change',{bubbles:true}));close();};
  function render(){pop.replaceChildren();const head=el('div',{className:'calendar-head'});
    for(const [name,action]of [['سال قبل',()=>{for(let i=0;i<12;i++)month(-1);}],['ماه قبل',()=>month(-1)]] as const){const b=el('button',{textContent:name,attributes:{type:'button'}});b.addEventListener('click',action);head.append(b);}
    head.append(el('strong',{textContent:current.toLocaleDateString('fa-IR',{month:'long',year:'numeric'}),attributes:{'aria-live':'polite'}}));
    for(const [name,action]of [['ماه بعد',()=>month(1)],['سال بعد',()=>{for(let i=0;i<12;i++)month(1);}]] as const){const b=el('button',{textContent:name,attributes:{type:'button'}});b.addEventListener('click',action);head.append(b);}pop.append(head);
    const grid=el('div',{className:'calendar-grid',attributes:{role:'grid','aria-label':'تقویم شمسی'}});for(const name of ['ش','ی','د','س','چ','پ','ج'])grid.append(el('span',{textContent:name,attributes:{'aria-hidden':'true'}}));
    const first=new Date(current);first.setDate(first.getDate()-parts(first).day+1);for(let i=0;i<(first.getDay()+1)%7;i++)grid.append(el('span'));
    const monthNumber=parts(first).month;
    for(let i=0;i<32;i++){const d=new Date(first);d.setDate(d.getDate()+i);if(parts(d).month!==monthNumber)break;const value=iso(d);const b=el('button',{textContent:parts(d).day.toLocaleString('fa-IR'),attributes:{type:'button',role:'gridcell','aria-label':d.toLocaleDateString('fa-IR',{dateStyle:'full'}),'aria-selected':String(value===source.value),'data-date':value,tabindex:value===iso(current)?'0':'-1'}});b.disabled=Boolean((source.min&&value<source.min)||(source.max&&value>source.max));b.addEventListener('click',()=>choose(d));grid.append(b);}
    grid.addEventListener('keydown',e=>{const moves:Record<string,number>={ArrowRight:-1,ArrowLeft:1,ArrowDown:7,ArrowUp:-7};if(e.key in moves){e.preventDefault();shift(moves[e.key]!);pop.querySelector<HTMLElement>(`[data-date="${iso(current)}"]`)?.focus();}if(e.key==='PageDown'||e.key==='PageUp'){e.preventDefault();month(e.key==='PageDown'?1:-1);pop.querySelector<HTMLElement>('[tabindex="0"]')?.focus();}});pop.append(grid);
    const today=el('button',{className:'calendar-today',textContent:'رفتن به امروز',attributes:{type:'button'}});today.addEventListener('click',()=>{current=new Date();render();});pop.append(today);
  }
  trigger.addEventListener('click',()=>{current=source.value?new Date(source.value+'T12:00:00'):new Date();render();});source.addEventListener('change',sync);sync();render();
}
export function installControls(): void {
  const scan=(root:ParentNode)=>{root.querySelectorAll<HTMLSelectElement|HTMLInputElement>('select:not([data-enhanced]),input[type=date]:not([data-enhanced])').forEach(s=>{if(s instanceof HTMLSelectElement)enhanceSelect(s);else enhanceDate(s);});};
  scan(document);
  new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node instanceof HTMLElement){if(node.matches('select:not([data-enhanced]),input[type=date]:not([data-enhanced])'))scan(node.parentElement!);else scan(node);}}).observe(document.body,{subtree:true,childList:true});
}
