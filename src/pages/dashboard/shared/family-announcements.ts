import { OrganizationMembership } from '../../../types/auth';
import { familyAnnouncements } from './family-data';
import { el, heading, panel } from '../../../components/workspace';
export function createFamilyAnnouncements(m:OrganizationMembership):HTMLElement {
 const root=el('div',{className:'space-y-5'});root.append(heading('اطلاعیه‌های مدرسه','پیام‌های منتشرشده و مرتبط با شما.'));
 const items=familyAnnouncements(m);
 if(!items.length)root.append(el('p',{textContent:'اطلاعیه‌ای برای شما منتشر نشده است.',className:'sepehr-muted'}));
 for(const a of items){const card=panel();card.append(el('h3',{textContent:a.title,className:'sepehr-section-title'}),el('p',{textContent:a.content}),el('small',{textContent:`${a.authorName} · ${a.createdAt}`,className:'sepehr-muted'}));root.append(card);}return root;
}
