import { el } from '../workspace';
/** Visible local-demo progress; no provider request or automatic save occurs here. */
export async function runAIDemo(host:HTMLElement,action:()=>void|Promise<void>,progressHost:HTMLElement=host):Promise<void>{
 if(host.getAttribute('aria-busy')==='true')return;
 const controls=Array.from(host.querySelectorAll<HTMLButtonElement|HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('button,input,select,textarea')).map(control=>({control,disabled:control.disabled}));
 const progress=el('div',{className:'ai-working',attributes:{role:'status','aria-live':'polite'}}),spinner=el('span',{className:'ai-spinner',attributes:{'aria-hidden':'true'}}),copy=el('div'),label=el('strong',{textContent:'در حال آماده‌سازی پیش‌نمایش…'});
 copy.append(label,el('small',{textContent:'نمایشی · هیچ داده‌ای به سرویس خارجی ارسال نمی‌شود.'}));progress.append(spinner,copy);progressHost.append(progress);host.setAttribute('aria-busy','true');controls.forEach(({control})=>{control.disabled=true;});
 try{
  for(const text of ['آماده‌سازی نمونه نمایشی…','مرتب‌سازی پیشنهادها برای بازبینی…','پیش‌نمایش آماده است…']){label.textContent=text;await new Promise<void>(resolve=>window.setTimeout(resolve,350));if(!host.isConnected||!progress.isConnected)return;}
  await action();
 }catch(error){label.textContent=(error as Error).message;return;}
 finally{host.removeAttribute('aria-busy');controls.forEach(({control,disabled})=>{control.disabled=disabled;});if(progress.isConnected)progress.remove();}
}
