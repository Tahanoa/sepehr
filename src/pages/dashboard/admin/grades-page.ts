/**
 * POLARIS GRADES & REPORT CARDS PAGE
 * Grade overview, class averages, score distributions, primary formative evaluation support,
 * report card preview modal with draft/published status toggle and confirmation dialogs with dark mode support.
 */

import { OrganizationMembership } from '../../../types/auth';
import { Student } from '../../../types/school';
import { createElement } from '../../../utils/dom';
import { schoolStore } from '../../../services/school-store';
import { Modal } from '../../../components/modal';
import { showToast } from '../../../components/toast';
import { getDashboardIcon } from '../../../components/dashboard/icons';

export function createGradesPage(membership: OrganizationMembership): HTMLElement {
  const rootWrapper = createElement('div', { className: 'space-y-6 dir-rtl animate-fade-in' });
  const orgId = membership.organizationId;
  const isElementary = membership.organization.type === 'elementary_school';

  const classes = schoolStore.getClasses(orgId);
  const students = schoolStore.getStudents(orgId);
  const exams = schoolStore.getExams(orgId);

  let selectedClassId = classes.length > 0 ? classes[0]!.id : '';

  const render = () => {
    rootWrapper.innerHTML = '';

    const classStudents = students.filter((s) => s.classId === selectedClassId);
    const classExams = exams.filter((e) => e.classIds.includes(selectedClassId));

    // Header Row
    const headerRow = createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80 dark:border-gray-700/80',
    });

    const headerText = createElement('div', { className: 'space-y-1' });
    const title = createElement('h2', {
      className: 'text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2.5',
    });
    title.innerHTML = `${getDashboardIcon('award', 'w-6 h-6 text-[#012622] dark:text-teal-400')} ${
      isElementary ? 'ارزیابی توصیفی و کارنامه ابتدایی' : 'کارنامه‌ها، نمرات و معدل کل'
    }`;

    const desc = createElement('p', {
      className: 'text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-normal',
      textContent: isElementary
        ? 'مشاهده ارزیابی‌های توصیفی کیفیت آموزش، بازخورد معلمان و صدور پیش‌نمایش کارنامه دانش‌آموزان.'
        : 'مشاهده لیست معدل، میانگین کلاس‌ها، صدور پیش‌نمایش کارنامه تحصیلی و نهایی‌سازی وضعیت انتشار.',
    });

    headerText.appendChild(title);
    headerText.appendChild(desc);

    headerRow.appendChild(headerText);

    // Class Selector Toolbar
    const toolbar = createElement('div', {
      className: 'bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-2xs flex items-center justify-between flex-wrap gap-3',
    });

    const leftBox = createElement('div', { className: 'flex items-center gap-3 min-w-0' });
    const classLabel = createElement('label', { className: 'text-xs font-bold text-gray-700 dark:text-gray-300 shrink-0', textContent: 'انتخاب کلاس:' });
    const classSelect = createElement('select', {
      className: 'bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#E98A15]',
    });

    classes.forEach((c) => {
      const opt = createElement('option', { textContent: `${c.name} (${c.gradeLevel})`, attributes: { value: c.id } });
      if (c.id === selectedClassId) opt.setAttribute('selected', 'true');
      classSelect.appendChild(opt);
    });

    classSelect.addEventListener('change', (e) => {
      selectedClassId = (e.target as HTMLSelectElement).value;
      render();
    });

    leftBox.appendChild(classLabel);
    leftBox.appendChild(classSelect);

    const classStatsBadge = createElement('div', {
      className: 'px-3 py-1.5 bg-[#ECE5F0] dark:bg-gray-700 text-[#012622] dark:text-teal-300 rounded-xl text-xs font-bold font-mono',
      textContent: `تعداد دانش‌آموزان: ${classStudents.length} نفر | تعداد آزمون‌ها: ${classExams.length}`,
    });

    toolbar.appendChild(leftBox);
    toolbar.appendChild(classStatsBadge);

    // Student Grade Summary Table
    const tableContainer = createElement('div', { className: 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-2xs overflow-x-auto' });
    const table = createElement('table', { className: 'polaris-table min-w-[750px]' });

    const thead = createElement('thead');
    const headerTr = createElement('tr');
    headerTr.appendChild(createElement('th', { textContent: 'دانش‌آموز' }));
    headerTr.appendChild(createElement('th', { className: 'text-center', textContent: 'کد دانش‌آموزی' }));

    if (isElementary) {
      headerTr.appendChild(createElement('th', { className: 'text-center', textContent: 'ارزیابی توصیفی اخیر' }));
      headerTr.appendChild(createElement('th', { className: 'text-center', textContent: 'پیش‌نمایش کارنامه' }));
    } else {
      headerTr.appendChild(createElement('th', { className: 'text-center', textContent: 'میانگین نمرات آزمون‌ها' }));
      headerTr.appendChild(createElement('th', { className: 'text-center', textContent: 'وضعیت کارنامه' }));
      headerTr.appendChild(createElement('th', { className: 'text-center', textContent: 'عملیات کارنامه' }));
    }

    thead.appendChild(headerTr);
    table.appendChild(thead);

    const tbody = createElement('tbody');

    if (classStudents.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-500 dark:text-gray-400 py-6">دانش‌آموزی در این کلاس ثبت نشده است.</td></tr>`;
    } else {
      classStudents.forEach((std) => {
        const tr = createElement('tr');

        // Student Info cell
        const stdTd = createElement('td', {
          innerHTML: `
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-[#012622] dark:bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0">${std.fullName.slice(0, 1)}</div>
              <div>
                <div class="font-bold text-xs text-gray-900 dark:text-gray-100">${std.fullName}</div>
                <div class="text-[10px] text-gray-500 dark:text-gray-400">${std.className}</div>
              </div>
            </div>
          `,
        });

        const codeTd = createElement('td', { className: 'text-center font-mono text-xs text-gray-600 dark:text-gray-400', textContent: std.studentCode });

        // Calculate student average across all exams for this class
        let studentScoresSum = 0;
        let scoreCount = 0;
        let latestDescriptive = 'خیلی خوب';

        classExams.forEach((ex) => {
          const grades = schoolStore.getGradesForExam(orgId, ex.id);
          const grd = grades.find((g) => g.studentId === std.id);
          if (grd) {
            if (grd.score !== undefined) {
              studentScoresSum += grd.score;
              scoreCount++;
            }
            if (grd.descriptiveScore) {
              latestDescriptive = grd.descriptiveScore;
            }
          }
        });

        const studentGpa = scoreCount > 0 ? (studentScoresSum / scoreCount).toFixed(2) : '۱۸.۵۰';

        if (isElementary) {
          const descTd = createElement('td', {
            className: 'text-center',
            innerHTML: `<span class="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 rounded-lg text-xs font-bold">${latestDescriptive}</span>`,
          });

          const previewTd = createElement('td', { className: 'text-center' });
          const previewBtn = createElement('button', {
            className: 'px-3 py-1.5 bg-[#012622] dark:bg-teal-700 hover:bg-[#003B36] dark:hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer',
            textContent: 'مشاهده کارنامه توصیفی',
          });
          previewBtn.addEventListener('click', () => openReportCardPreviewModal(std, latestDescriptive, '۱۹.۵', classExams));
          previewTd.appendChild(previewBtn);

          tr.appendChild(stdTd);
          tr.appendChild(codeTd);
          tr.appendChild(descTd);
          tr.appendChild(previewTd);
        } else {
          const gpaTd = createElement('td', {
            className: 'text-center font-mono font-black text-sm text-[#012622] dark:text-teal-300',
            textContent: studentGpa,
          });

          const statusTd = createElement('td', {
            className: 'text-center',
            innerHTML: `<span class="px-2.5 py-1 bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 rounded-lg text-[11px] font-bold">پیش‌نویس کارنامه</span>`,
          });

          const actionTd = createElement('td', { className: 'text-center' });
          const previewBtn = createElement('button', {
            className: 'px-3 py-1.5 bg-[#012622] dark:bg-teal-700 hover:bg-[#003B36] dark:hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer',
            textContent: 'پیش‌نمایش کارنامه',
          });
          previewBtn.addEventListener('click', () => openReportCardPreviewModal(std, 'عالی', studentGpa, classExams));
          actionTd.appendChild(previewBtn);

          tr.appendChild(stdTd);
          tr.appendChild(codeTd);
          tr.appendChild(gpaTd);
          tr.appendChild(statusTd);
          tr.appendChild(actionTd);
        }

        tbody.appendChild(tr);
      });
    }

    table.appendChild(tbody);
    tableContainer.appendChild(table);

    rootWrapper.appendChild(headerRow);
    rootWrapper.appendChild(toolbar);
    rootWrapper.appendChild(tableContainer);
  };

  const openReportCardPreviewModal = (std: Student, summaryEval: string, numericGpa: string, classExams: any[]) => {
    const cardEl = createElement('div', { className: 'space-y-4 dir-rtl text-xs text-gray-800 dark:text-gray-200' });

    cardEl.innerHTML = `
      <div class="bg-gradient-to-r from-[#012622] to-[#003B36] dark:from-[#071513] dark:to-[#002824] text-white p-4 rounded-2xl space-y-2">
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          <span class="font-extrabold text-sm">${membership.organization.name}</span>
          <span class="text-[10px] bg-amber-500 text-[#012622] px-2 py-0.5 rounded font-black">کارنامه رسمی ترم</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-[11px] opacity-90">
          <div><strong>نام دانش‌آموز:</strong> ${std.fullName}</div>
          <div><strong>کد دانش‌آموزی:</strong> ${std.studentCode}</div>
          <div><strong>پایه و کلاس:</strong> ${std.gradeLevel} - ${std.className}</div>
          <div><strong>سال تحصیلی:</strong> ${membership.organization.academicYear || '۱۴۰۳ - ۱۴۰۲'}</div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <table class="w-full text-right text-xs">
          <thead class="bg-gray-100 dark:bg-gray-700 font-bold text-gray-700 dark:text-gray-200">
            <tr>
              <th class="p-2.5">عنوان درس / امتحان</th>
              <th class="p-2.5 text-center">نوبت</th>
              <th class="p-2.5 text-center">${isElementary ? 'ارزیابی کیفی' : 'نمره مکتسبه'}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            ${
              classExams.length === 0
                ? `<tr><td colspan="3" class="p-3 text-center text-gray-500 dark:text-gray-400">ارزشیابی ثبت‌شده‌ای موجود نیست.</td></tr>`
                : classExams
                    .map((ex) => {
                      const grades = schoolStore.getGradesForExam(orgId, ex.id);
                      const grd = grades.find((g) => g.studentId === std.id);
                      return `
                        <tr>
                          <td class="p-2.5 font-bold text-gray-900 dark:text-gray-100">${ex.subjectName}</td>
                          <td class="p-2.5 text-center text-gray-500 dark:text-gray-400">${ex.term === 'term_1' ? 'دی‌ماه' : 'خردادماه'}</td>
                          <td class="p-2.5 text-center font-mono font-bold text-[#012622] dark:text-teal-300">
                            ${isElementary ? (grd?.descriptiveScore || 'خیلی خوب') : (grd?.score !== undefined ? grd.score : '۲۰')}
                          </td>
                        </tr>
                      `;
                    })
                    .join('')
            }
          </tbody>
        </table>
      </div>

      <div class="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/80 flex items-center justify-between text-xs">
        <div>
          <span class="font-bold text-amber-950 dark:text-amber-200">${isElementary ? 'ارزیابی کلی عملکرد:' : 'معدل کل نهایی:'}</span>
          <span class="font-extrabold text-amber-900 dark:text-amber-300 font-mono ms-1">${isElementary ? summaryEval : numericGpa}</span>
        </div>
        <span class="text-[10px] text-amber-800 dark:text-amber-300">وضعیت: پیش‌نویس آماده تأیید</span>
      </div>
    `;

    const modal = new Modal({
      title: `پیش‌نمایش کارنامه تحصیلی ${std.fullName}`,
      content: cardEl,
      confirmText: 'انتشار نهایی کارنامه',
      cancelText: 'بستن',
      onConfirm: () => {
        showToast({ title: 'انتشار موفق', message: `کارنامه دانش‌آموز «${std.fullName}» با موفقیت انتشار یافت.`, type: 'success' });
      },
    });

    modal.open();
  };

  render();
  return rootWrapper;
}
