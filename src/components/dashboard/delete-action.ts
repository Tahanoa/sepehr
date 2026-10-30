import { button } from '../workspace';
import { confirmAction, notify } from '../feedback';
export function deleteAction(label:string, action:()=>void, refresh:()=>void):HTMLButtonElement {
 const b=button('حذف '+label,()=>{void(async()=>{if(!await confirmAction('حذف '+label+' و اطلاعات وابسته تأیید شود؟'))return;try{action();refresh();}catch(e){notify((e as Error).message);}})();});
 b.classList.add('delete-action');return b;
}
