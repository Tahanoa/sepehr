/** Action-first learner home. Counts are scoped to the resolved learner and class. */
import { OrganizationMembership } from '../../../types/auth';
import { authService } from '../../../services/auth-service';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { Assignment, Student } from '../../../types/school';

export function resolveLearner(students: Student[], user: { name: string; phone?: string } | null): Student | undefined {
  if (!user) return undefined;
  const normalize = (name: string) => name.replace(/\s*\([^)]*\)/g, '').replace(/[\s\u200c]+/g, ' ').trim();
  return students.find(s => normalize(s.fullName) === normalize(user.name) || (!!user.phone && s.studentCode === user.phone));
}
export function assignmentDateKey(date: string): string {
  return date.replace(/[۰-۹]/g, c => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[٠-٩]/g, c => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).split(/[/-]/).map(c => c.padStart(2, '0')).join('-');
}
export function createStudentOverviewPage(membership: OrganizationMembership): HTMLElement {
  const root = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId, user = authService.getCurrentUser();
  const learner = resolveLearner(schoolStore.getStudents(orgId), user);
  const navigateLink = (text: string, section: string, primary = false) => {
    const href = `/app/${orgId}/${section}`;
    const link = createElement('a', { textContent: text, attributes: { href }, className: primary ? 'sepehr-primary' : 'sepehr-secondary' });
    link.addEventListener('click', e => { e.preventDefault(); window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: href })); }); return link;
  };
  const heading = createElement('div', { className: 'flex flex-wrap items-end justify-between gap-4' });
  const headingText = document.createElement('div');
  headingText.append(createElement('p', { className: 'sepehr-eyebrow', textContent: membership.organization.name }), createElement('h2', { className: 'text-2xl font-bold mt-2 text-gray-900', textContent: `سلام، ${user?.name || 'دوست عزیز'}` }), createElement('p', { className: 'sepehr-muted mt-2', textContent: 'برنامه‌ات را ببین، کار بعدی را انتخاب کن و ادامه بده.' }));
  heading.append(headingText, navigateLink('برنامهٔ هفتگی', 'schedule')); root.append(heading);
  if (!learner) {
    const empty = createElement('section', { className: 'sepehr-panel' });
    empty.append(createElement('h3', { className: 'sepehr-section-title', textContent: 'پروفایل آموزشی پیدا نشد' }), createElement('p', { className: 'sepehr-muted', textContent: 'برای اتصال حساب به پروندهٔ دانش‌آموز با مسئول مرکز تماس بگیرید.' })); root.append(empty); return root;
  }
  const submissions = schoolStore.getSubmissionsForStudent(orgId, learner.id);
  const pending = schoolStore.getAssignments(orgId).filter(a => a.classId === learner.classId && !submissions.some(s => s.assignmentId === a.id)).sort((a,b) => assignmentDateKey(a.dueDate).localeCompare(assignmentDateKey(b.dueDate)));
  const exams = schoolStore.getExams(orgId).filter(e => e.classIds.includes(learner.classId) && !e.excludedStudentIds?.includes(learner.id) && ['scheduled','published','available','in_progress'].includes(e.status) && !['submitted','graded'].includes(schoolStore.getExamAttempt(e.id, learner.id)?.status || ''));
  const attendance = schoolStore.getAttendance(orgId).filter(a => a.studentId === learner.id && a.submitted);
  const attended = attendance.filter(a => ['present','late'].includes(a.status)).length;
  const stats = createElement('div', { className: 'sepehr-stats' });
  for (const [label, value, note] of [
    ['تکالیف تحویل‌نداده', pending.length.toLocaleString('fa-IR'), 'ویژهٔ کلاس شما'],
    ['آزمون‌های فعال و زمان‌بندی‌شده', exams.length.toLocaleString('fa-IR'), 'ویژهٔ شما'],
    ['حضور در جلسات ثبت‌شده', attendance.length ? Math.round(attended / attendance.length * 100).toLocaleString('fa-IR') + '٪' : '—', attendance.length ? `${attendance.length.toLocaleString('fa-IR')} جلسهٔ ثبت‌شده` : 'هنوز داده‌ای ثبت نشده'],
  ]) {
    const card = createElement('section', { className: 'sepehr-panel' }); card.append(createElement('h3', { className: 'sepehr-muted', textContent: label! }), createElement('strong', { className: 'sepehr-stat-number', textContent: value! }), createElement('p', { className: 'sepehr-muted', textContent: note! })); stats.append(card);
  }
  root.append(stats);
  const columns = createElement('div', { className: 'sepehr-student-grid' });
  const work = createElement('section', { className: 'sepehr-panel' }); work.append(createElement('h3', { className: 'sepehr-section-title', textContent: 'از اینجا ادامه بده' }), createElement('p', { className: 'sepehr-muted mb-3', textContent: 'تکالیف تحویل‌نداده به ترتیب مهلت؛ تاریخ‌های دمو ممکن است گذشته باشند.' }));
  const taskRow = (assignment: Assignment) => {
    const row = createElement('div', { className: 'sepehr-task' }), text = document.createElement('div');
    text.append(createElement('h4', { className: 'sepehr-task-title', textContent: assignment.title }), createElement('p', { className: 'sepehr-muted', textContent: `${assignment.subjectName || assignment.className} · مهلت: ${assignment.dueDate}` }));
    row.append(text, navigateLink('مشاهدهٔ تکلیف', 'assignments', true)); return row;
  };
  if (pending.length) pending.slice(0,3).forEach(a => work.append(taskRow(a)));
  else work.append(createElement('p', { className: 'sepehr-muted py-6', textContent: 'تکلیف تحویل‌نداده‌ای نداری. برنامهٔ هفته را بررسی کن.' }));
  const tools = createElement('div', { className: 'flex flex-wrap gap-3 mt-4' }); tools.append(navigateLink('همهٔ تکالیف', 'assignments'), navigateLink('آزمون‌های من', 'exams')); work.append(tools);
  const side = createElement('div', { className: 'space-y-6' });
  const updates = createElement('section', { className: 'sepehr-panel' }); updates.append(createElement('h3', { className: 'sepehr-section-title', textContent: 'اطلاعیه‌های مرکز' }));
  const announcements = schoolStore.getAnnouncements(orgId).slice(0,3);
  if (!announcements.length) updates.append(createElement('p', { className: 'sepehr-muted mt-3', textContent: 'اطلاعیهٔ جدیدی وجود ندارد.' }));
  for (const announcement of announcements) {
    const item = createElement('article', { className: 'py-4 border-b border-gray-100 last:border-0' });
    item.append(createElement('h4', { className: 'sepehr-task-title', textContent: announcement.title }), createElement('p', { className: 'sepehr-muted mt-1', textContent: announcement.content }), createElement('p', { className: 'sepehr-muted mt-1', textContent: announcement.createdAt })); updates.append(item);
  }
  const resources = createElement('section', { className: 'sepehr-panel space-y-3' }); resources.append(createElement('h3', { className: 'sepehr-section-title', textContent: 'مسیرهای پرکاربرد' }), navigateLink('منابع آموزشی', 'materials'), navigateLink('کارنامه و بازخورد', 'grades'));
  if (membership.organization.type === 'independent_institute') resources.append(navigateLink('شهریه و پرداخت‌ها', 'payments'));
  side.append(updates, resources); columns.append(work,side); root.append(columns); return root;
}
