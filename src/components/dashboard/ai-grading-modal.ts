import { RubricCriterion, AIGradingSuggestion } from '../../types/school';
import { el, field, input, button, status } from '../workspace';
export interface AIGradingModalOptions {
  studentName:string; examTitle:string; questionPrompt:string; studentAnswer:string;
  referenceAnswer:string; maxPoints:number; rubricCriteria:RubricCriterion[];
  onAcceptGrading:(finalScore:number,feedback:string)=>void; onClose:()=>void;
}
/** Local demo only: no answer or source is uploaded. */
export async function requestGrading(payload:Pick<AIGradingModalOptions,'questionPrompt'|'studentAnswer'|'referenceAnswer'|'maxPoints'|'rubricCriteria'>):Promise<AIGradingSuggestion>{
 const ratio=.75;
 return {proposedScore:Math.round(payload.maxPoints*ratio*4)/4,criteriaBreakdown:payload.rubricCriteria.map(c=>({criterionTitle:c.title,scoreGiven:c.maxPoints*ratio,maxPoints:c.maxPoints,feedback:'نمونه نمایشی؛ نیازمند بررسی دبیر'})),reasoningSummary:'پیشنهاد ثابت نمایشی است و از تحلیل هوش مصنوعی به دست نیامده؛ پاسخ و نمره را پیش از ثبت بررسی کنید.'};
}
export function createAIGradingModal(o:AIGradingModalOptions):HTMLElement{
  const previous=document.activeElement as HTMLElement|null, backdrop=el('div',{className:'fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 dir-rtl'}),dialog=el('section',{className:'sepehr-panel space-y-4 overflow-y-auto w-full max-w-3xl',attributes:{role:'dialog','aria-modal':'true','aria-label':'دستیار تصحیح آزمون',tabindex:'-1'}});dialog.style.maxHeight='90dvh';
  let closed=false;
  const close=()=>{closed=true;document.removeEventListener('keydown',keys);o.onClose();previous?.focus();};
  const keys=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const nodes=Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled),input,textarea'));const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===dialog)){e.preventDefault();first?.focus();}}};document.addEventListener('keydown',keys);
  dialog.append(el('h2',{textContent:'دستیار تصحیح آزمون',className:'sepehr-section-title'}),el('p',{textContent:`${o.examTitle} · ${o.studentName}`,className:'sepehr-muted'}));
  for(const [title,text]of[['صورت سؤال',o.questionPrompt],['پاسخ دانش‌آموز',o.studentAnswer],['پاسخ مرجع',o.referenceAnswer]]){dialog.append(el('h3',{textContent:title||""}),el('p',{textContent:text||'ثبت نشده',className:'workspace-notice'}));}
  dialog.append(el('p',{textContent:'نمایش قابلیت تصحیح با AI؛ هیچ داده‌ای ارسال نمی‌شود. این پیشنهاد نمونه است و ثبت نهایی پس از بازبینی دبیر انجام می‌شود.',className:'sepehr-muted'}));
  const notice=status(),results=el('div',{className:'space-y-3'}),score=input('','number'),feedback=el('textarea',{attributes:{rows:'3'}});score.min='0';score.max=String(o.maxPoints);score.step='.25';
  const accept=button('تأیید و ثبت نمره',()=>{const value=Number(score.value);if(!score.value.trim()||!Number.isFinite(value)||value<0||value>o.maxPoints){notice.textContent=`نمره باید بین صفر و ${o.maxPoints} باشد.`;return;}try{o.onAcceptGrading(value,feedback.value);close();}catch(e){notice.textContent=(e as Error).message;}},true);accept.disabled=true;
  const run=button('✦ تصحیح با AI (نمایشی)',()=>{void(async()=>{run.disabled=true;accept.disabled=true;notice.textContent='در حال دریافت پیشنهاد…';try{if(!o.referenceAnswer.trim()||!o.studentAnswer.trim())throw Error('پاسخ مرجع و پاسخ دانش‌آموز باید تکمیل باشند.');const v=await requestGrading({questionPrompt:o.questionPrompt,studentAnswer:o.studentAnswer,referenceAnswer:o.referenceAnswer,maxPoints:o.maxPoints,rubricCriteria:o.rubricCriteria});if(closed)return;results.replaceChildren(el('p',{textContent:v.reasoningSummary,className:'workspace-notice'}));for(const c of v.criteriaBreakdown)results.append(el('p',{textContent:`${c.criterionTitle}: ${c.scoreGiven} از ${c.maxPoints} · ${c.feedback}`}));score.value=String(v.proposedScore);feedback.value=v.reasoningSummary;accept.disabled=false;notice.textContent='پیشنهاد آماده است؛ نمره و بازخورد را بررسی کنید.';}catch(e){if(!closed)notice.textContent=(e as Error).message;}finally{run.disabled=false;}})();},true);
  dialog.append(run,notice,results,field(`نمرهٔ نهایی از ${o.maxPoints}`,score),field('بازخورد دبیر',feedback),accept,button('بستن',close));backdrop.append(dialog);queueMicrotask(()=>dialog.focus());return backdrop;
}
