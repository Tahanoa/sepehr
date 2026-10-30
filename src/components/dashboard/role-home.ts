import { OrganizationMembership } from '../../types/auth';
import { getNavigationForRoleAndOrg } from '../../config/navigation-config';
import { getDashboardIcon } from './icons';
import { el } from '../workspace';
/** Applicant-inspired entry: a clear role identity and three real destinations. */
export function enhanceRoleHome(content:HTMLElement,m:OrganizationMembership):HTMLElement {
 if(m.role==='applicant')return content;
 const preferences:Record<string,string[]>={school_admin:['attendance','grades','messages'],institute_admin:['attendance','grades','payments'],teacher:['grades','exams','attendance'],instructor:['grades','exams','attendance'],student:['assignments','exams','grades'],parent:['grades','attendance','messages'],counselor:['students','messages','reports']};
 const notes:Record<string,string>={attendance:'ثبت سریع و پیگیری وضعیت حضور',grades:'دفتر نمرات و کارنامه‌ها',messages:'ادامهٔ گفتگو با مرکز و خانواده',exams:'طراحی، تصحیح و بازبینی آزمون',assignments:'مشاهده و تحویل تکلیف',payments:'بررسی شهریه و رسیدها',students:'پرونده‌ها و پیگیری آموزشی',reports:'بررسی گزارش‌های مرکز'};
 const grid=el('div',{className:'role-home-actions'}),nav=getNavigationForRoleAndOrg(m.role,m.organization.type,m.organizationId);
 for(const key of preferences[m.role]||[]){const item=nav.find(i=>i.sectionKey===key);if(!item)continue;const a=el('a',{className:'role-home-action',attributes:{href:item.path}});a.append(el('span',{className:'role-action-icon',innerHTML:getDashboardIcon(item.icon,'w-6 h-6')}),el('strong',{textContent:item.title}),el('small',{textContent:notes[key]||''}),el('span',{textContent:'ورود ←',className:'role-action-enter'}));a.addEventListener('click',e=>{e.preventDefault();window.dispatchEvent(new CustomEvent('polaris-navigate',{detail:item.path}));});grid.append(a);}
 const root=el('div',{className:'role-home'});root.append(grid,content);return root;
}
