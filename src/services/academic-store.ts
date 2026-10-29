import { OrganizationMembership, Role, User } from '../types/auth';
import { schoolStore } from './school-store';
import { authService } from './auth-service';
import { DEMO_USERS } from '../data/demo-data';
import { Student } from '../types/school';

export type Component = 'continuous1' | 'final1' | 'continuous2' | 'final2';
export const components: Record<Component, string> = { continuous1: 'مستمر نوبت اول', final1: 'پایانی نوبت اول', continuous2: 'مستمر نوبت دوم', final2: 'پایانی نوبت دوم' };
export interface Mark { studentId: string; subjectId: string; year: string; component: Component; value: string; feedback: string; updatedBy: string; updatedAt: string; }
export interface Journal { studentId: string; subjectId: string; date: string; value: string; note: string; }
export interface Report { id: string; studentId: string; year: string; term: 'first' | 'second'; published: boolean; descriptive: boolean; rows: { subjectId: string; subject: string; continuous: string; final: string; feedback: string }[]; updatedAt: string; }
export interface Contact { id: string; name: string; role: Role; studentId?: string; }
export interface Chat { id: string; participants: [Contact,Contact]; messages: { id: string; sender: string; text: string; at: string }[]; read: Record<string, string>; }
interface State { version: 1; locks: Record<string, boolean>; marks: Mark[]; journal: Journal[]; reports: Report[]; chats: Chat[]; }
const key = (org: string) => `sepehr.academic.v1.${org}`;
function read(org: string): State {
  const empty: State = { version: 1, locks: {}, marks: [], journal: [], reports: [], chats: [] };
  const raw = localStorage.getItem(key(org)); if (!raw) return empty;
  try { const v = JSON.parse(raw) as State; if (v.version !== 1 || !v.locks || !Array.isArray(v.marks) || !Array.isArray(v.journal) || !Array.isArray(v.reports) || !Array.isArray(v.chats)) throw Error(); return v; } catch { throw Error('داده‌های آموزشی محلی قابل خواندن نیست؛ پیش از ادامه از داده‌ها نسخهٔ پشتیبان تهیه کنید.'); }
}
function write(org: string, state: State): void { try { localStorage.setItem(key(org), JSON.stringify(state)); } catch { throw Error('ذخیره انجام نشد؛ فضای مرورگر را بررسی کنید.'); } }
export function context(m: OrganizationMembership): User {
  const user = authService.getCurrentUser(), active = authService.getActiveMembership();
  if (!user || active?.id !== m.id || active.role !== m.role || active.organizationId !== m.organizationId || active.status !== 'active') throw Error('نشست یا دسترسی تغییر کرده است؛ صفحه را تازه کنید.'); return user;
}
export function isAdmin(m: OrganizationMembership): boolean { return ['school_admin','institute_admin'].includes(m.role); }
export function classesFor(m: OrganizationMembership) {
  const user = context(m);
  return isAdmin(m) ? schoolStore.getClasses(m.organizationId) : ['teacher','instructor'].includes(m.role) ? schoolStore.getTeacherClasses(m.organizationId, user.email || user.phone || user.id) : [];
}
export function subjectsFor(m: OrganizationMembership, classId: string) {
  const cls = classesFor(m).find(c => c.id === classId); if (!cls) return [];
  return schoolStore.getSubjects(m.organizationId).filter(s => s.gradeLevel === cls.gradeLevel || m.organization.type === 'independent_institute');
}
export function requireClass(m: OrganizationMembership, classId: string): void { if (!classesFor(m).some(c => c.id === classId)) throw Error('به این کلاس دسترسی ندارید.'); }
const normalize = (text: string) => text.replace(/\s*\([^)]*\)/g, '').replace(/[\s\u200c]+/g, ' ').trim();
export function linkedStudents(m: OrganizationMembership): Student[] {
  const user = context(m), students = schoolStore.getStudents(m.organizationId);
  if (isAdmin(m)) return students;
  if (m.role === 'student') return students.filter(s => normalize(s.fullName) === normalize(user.name) || s.studentCode === user.phone);
  if (m.role === 'parent') return students.filter(s => !!user.phone && s.guardianPhone === user.phone);
  return [];
}
export function descriptive(m: OrganizationMembership, classId: string): boolean {
  const cls = schoolStore.getClasses(m.organizationId).find(c => c.id === classId);
  return m.organization.type === 'elementary_school' || (m.organization.type === 'general_school' && !!cls && /اول|دوم|سوم|چهارم|پنجم|ششم|ابتدایی/.test(cls.gradeLevel));
}
const lockKey = (classId: string, year: string, term: string) => `${classId}|${year}|${term}`;
export function entryOpen(m: OrganizationMembership, classId: string, year: string, term: string): boolean { return read(m.organizationId).locks[lockKey(classId,year,term)] !== false; }
export function setEntryOpen(m: OrganizationMembership, classId: string, year: string, term: string, open: boolean): void {
  context(m); if (!isAdmin(m)) throw Error('فقط مدیر می‌تواند دسترسی ثبت نمرات را تغییر دهد.'); requireClass(m,classId);
  const state = read(m.organizationId); state.locks[lockKey(classId,year,term)] = open; write(m.organizationId,state);
}
export function marks(m: OrganizationMembership): Mark[] { const ids=new Set(classesFor(m).flatMap(c=>schoolStore.getStudents(m.organizationId).filter(s=>s.classId===c.id).map(s=>s.id))); return read(m.organizationId).marks.filter(v=>ids.has(v.studentId)); }
export function validateMark(value: string, isDescriptive: boolean): void {
  if (value.length > 2000) throw Error('توصیف بیش از حد طولانی است.');
  if (!isDescriptive && value !== '' && (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 20)) throw Error('نمره باید بین صفر تا بیست باشد.');
}
export function saveMarks(m: OrganizationMembership, classId: string, rows: Omit<Mark,'updatedBy'|'updatedAt'>[]): void {
  requireClass(m,classId); const user = context(m), allowed = schoolStore.getStudents(m.organizationId).filter(s => s.classId === classId), subjects = subjectsFor(m,classId);
  for (const row of rows) {
    if (!allowed.some(s => s.id === row.studentId) || !subjects.some(s => s.id === row.subjectId) || !Object.hasOwn(components,row.component)) throw Error('دانش‌آموز یا درس نامعتبر است.');
    if (!isAdmin(m) && !entryOpen(m,classId,row.year,row.component.endsWith('1') ? 'first':'second')) throw Error('ثبت نمرات این نوبت توسط مدیر بسته شده است.');
    validateMark(row.value,descriptive(m,classId));
  }
  const state = read(m.organizationId);
  for (const row of rows) { state.marks = state.marks.filter(v => !(v.studentId === row.studentId && v.subjectId === row.subjectId && v.year === row.year && v.component === row.component)); if (row.value || row.feedback) state.marks.push({ ...row, updatedBy:user.id, updatedAt:new Date().toISOString() }); }
  write(m.organizationId,state);
}
export function journal(m: OrganizationMembership): Journal[] { const ids=new Set(classesFor(m).flatMap(c=>schoolStore.getStudents(m.organizationId).filter(s=>s.classId===c.id).map(s=>s.id))); return read(m.organizationId).journal.filter(v=>ids.has(v.studentId)); }
export function saveJournal(m: OrganizationMembership, classId: string, rows: Journal[]): void {
  requireClass(m,classId); const allowed = schoolStore.getStudents(m.organizationId).filter(s => s.classId === classId), subjects = subjectsFor(m,classId);
  for (const row of rows) { if (!allowed.some(s => s.id === row.studentId) || !subjects.some(s => s.id === row.subjectId) || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) throw Error('دادهٔ دفتر هفتگی نامعتبر است.'); validateMark(row.value,descriptive(m,classId)); }
  const state = read(m.organizationId);
  for (const row of rows) { state.journal = state.journal.filter(v => !(v.studentId === row.studentId && v.subjectId === row.subjectId && v.date === row.date)); if (row.value || row.note) state.journal.push(row); }
  write(m.organizationId,state);
}
export function reports(m: OrganizationMembership): Report[] {
  context(m); const all = read(m.organizationId).reports;
  if (isAdmin(m)) return all;
  const students = linkedStudents(m); return all.filter(r => r.published && students.some(s => s.id === r.studentId));
}
export function buildReport(m: OrganizationMembership, studentId: string, year: string, term: 'first'|'second'): Report {
  context(m); if (!isAdmin(m)) throw Error('صدور کارنامه فقط در اختیار مدیر است.');
  const student = schoolStore.getStudents(m.organizationId).find(s => s.id === studentId); if (!student) throw Error('دانش‌آموز پیدا نشد.');
  const state = read(m.organizationId), suffix = term === 'first' ? '1':'2';
  const rows = subjectsFor(m,student.classId).map(s => {
    const continuous = state.marks.find(v => v.studentId===studentId && v.subjectId===s.id && v.year===year && v.component===`continuous${suffix}`), final = state.marks.find(v => v.studentId===studentId && v.subjectId===s.id && v.year===year && v.component===`final${suffix}`);
    return { subjectId:s.id, subject:s.name, continuous:continuous?.value || '', final:final?.value || '', feedback:final?.feedback || continuous?.feedback || '' };
  });
  const report: Report = { id:crypto.randomUUID(), studentId, year, term, published:false, descriptive:descriptive(m,student.classId), rows, updatedAt:new Date().toISOString() };
  state.reports = state.reports.filter(r => !(r.studentId===studentId && r.year===year && r.term===term)); state.reports.push(report); write(m.organizationId,state); return report;
}
export function publishReport(m: OrganizationMembership, id: string, publish: boolean): void {
  context(m); if (!isAdmin(m)) throw Error('دسترسی کافی نیست.'); const state = read(m.organizationId), report = state.reports.find(r => r.id===id); if (!report) throw Error('کارنامه پیدا نشد.');
  if (publish && (!report.rows.length || report.rows.some(r => !r.continuous.trim() || !r.final.trim()))) throw Error('پیش از انتشار، ارزشیابی مستمر و پایانی همهٔ درس‌ها را تکمیل و کارنامه را دوباره بسازید.');
  report.published=publish; write(m.organizationId,state);
}
export function selfContact(m: OrganizationMembership): Contact {
  const user=context(m), student=linkedStudents(m)[0];
  if (m.role==='student' || m.role==='parent') { if (!student) throw Error('پروندهٔ مرتبط با این حساب پیدا نشد.'); return { id: m.role==='student' ? `learner:${student.id}` : `guardian:${student.guardianPhone}`, name:user.name, role:m.role, studentId:student.id }; }
  return { id:user.id, name:user.name, role:m.role };
}
export function contacts(m: OrganizationMembership): Contact[] {
  context(m); const students=schoolStore.getStudents(m.organizationId), people: Contact[]=[];
  if (isAdmin(m) || m.role==='counselor') for (const s of students) {
    people.push({id:`guardian:${s.guardianPhone}`,name:`${s.guardianName} · ولی ${s.fullName}`,role:'parent',studentId:s.id});
    if (m.role==='counselor') people.push({id:`learner:${s.id}`,name:s.fullName,role:'student',studentId:s.id});
  }
  if (m.role==='parent' || m.role==='student') for (const u of DEMO_USERS) {
    const membership=u.memberships.find(v=>v.organizationId===m.organizationId && v.status==='active');
    if (membership && (membership.role==='counselor' || (m.role==='parent' && ['school_admin','institute_admin'].includes(membership.role)))) people.push({id:u.id,name:u.name,role:membership.role});
  }
  return [...new Map(people.map(p=>[p.id,p])).values()];
}
export function chats(m: OrganizationMembership): Chat[] { const self=selfContact(m); return read(m.organizationId).chats.filter(c=>c.participants.some(p=>p.id===self.id)); }
export function sendMessage(m: OrganizationMembership, recipientId: string, text: string): string {
  const self=selfContact(m), recipient=contacts(m).find(c=>c.id===recipientId); if (!recipient || !text.trim() || text.length>4000) throw Error('گیرنده یا متن پیام معتبر نیست.');
  const state=read(m.organizationId); let chat=state.chats.find(c=>c.participants.some(p=>p.id===self.id) && c.participants.some(p=>p.id===recipient.id));
  if (!chat) { chat={id:crypto.randomUUID(),participants:[self,recipient],messages:[],read:{}}; state.chats.push(chat); }
  const at=new Date().toISOString(); chat.messages.push({id:crypto.randomUUID(),sender:self.id,text:text.trim(),at}); chat.read[self.id]=at; write(m.organizationId,state); return chat.id;
}
export function markRead(m: OrganizationMembership, id: string): void { const self=selfContact(m), state=read(m.organizationId), chat=state.chats.find(c=>c.id===id && c.participants.some(p=>p.id===self.id)); if(chat) {chat.read[self.id]=new Date().toISOString();write(m.organizationId,state);} }
