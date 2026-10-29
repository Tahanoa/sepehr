/**
 * POLARIS PLANS OVERVIEW & PLAN DETAIL PAGES
 */

import { createElement } from '../../utils/dom';
import { EDUCATIONAL_PLANS, EducationalPlan } from '../../data/public-data';
import { createPlanCard, createFaqAccordion } from '../../components/public/public-cards';

export function createPlansOverviewPage(): HTMLElement {
  const container = createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12' });

  const header = createElement('div', { className: 'text-center space-y-4 max-w-3xl mx-auto' });
  header.innerHTML = `
    <span class="px-3 py-1 rounded-full bg-brand-amber/10 text-brand-amber text-xs font-bold">بسته‌های سازمانی سپهر</span>
    <h1 class="text-3xl sm:text-4xl font-semibold text-brand-evergreen">طرح‌های تخصصی سپهر</h1>
    <p class="text-gray-600 text-sm sm:text-base leading-relaxed">
      با توجه به تفاوت‌های بنیادین در فرایندهای آموزشی مدارس ابتدایی، متوسطه و آموزشگاه‌های تخصصی، سپهر سه طرح کاملا اختصاصی ارائه می‌دهد.
    </p>
  `;
  container.appendChild(header);

  const grid = createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-8' });
  Object.values(EDUCATIONAL_PLANS).forEach((plan) => {
    grid.appendChild(createPlanCard(plan));
  });
  container.appendChild(grid);

  return container;
}

export function createPlanDetailPage(planId: string): HTMLElement {
  const plan: EducationalPlan = EDUCATIONAL_PLANS[planId] || (EDUCATIONAL_PLANS['elementary'] as EducationalPlan);

  const container = createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16' });

  // Hero section for detail page
  const detailHero = createElement('div', {
    className: 'bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-sm space-y-6',
  });
  detailHero.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-brand-lavender text-brand-evergreen">
        ${plan.badge}
      </span>
      <a href="/plans" class="polaris-plan-back text-xs text-gray-500 hover:text-brand-evergreen flex items-center gap-1">
        ← بازگشت به لیست همه طرح‌ها
      </a>
    </div>
    <h1 class="text-2xl sm:text-4xl font-semibold text-brand-evergreen">${plan.title}</h1>
    <p class="text-gray-600 text-base sm:text-lg leading-relaxed max-w-4xl">${plan.fullDescription}</p>
  `;

  const ctaBtn = createElement('a', {
    attributes: { href: `/register?plan=${plan.id}` },
    className: 'inline-block px-6 py-3 rounded-xl bg-brand-amber hover:brightness-95 text-gray-900 font-bold text-sm shadow transition-all',
    textContent: `درخواست مشاوره برای ${plan.title}`,
  });
  ctaBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: `/register?plan=${plan.id}` }));
  });
  detailHero.appendChild(ctaBtn);

  // Back link listener
  const backLink = detailHero.querySelector('.polaris-plan-back');
  if (backLink) {
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: '/plans' }));
    });
  }
  container.appendChild(detailHero);

  // Feature groups
  const featuresSec = createElement('div', { className: 'space-y-8' });
  featuresSec.innerHTML = `<h2 class="text-2xl font-bold text-brand-evergreen border-r-4 border-brand-amber pr-3">قابلیت‌ها و زیرسیستم‌های تخصصی</h2>`;

  const featGrid = createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' });
  plan.featureGroups.forEach((fg) => {
    const card = createElement('div', { className: 'bg-white p-6 rounded-2xl border border-gray-200 space-y-4 shadow-sm' });
    card.innerHTML = `
      <h3 class="text-base font-bold text-brand-evergreen pb-2 border-b border-gray-100">${fg.category}</h3>
      <ul class="space-y-2.5 text-xs sm:text-sm text-gray-700">
        ${fg.items.map(item => `
          <li class="flex items-start gap-2">
            <span class="text-brand-amber font-bold">•</span>
            <span>${item}</span>
          </li>
        `).join('')}
      </ul>
    `;
    featGrid.appendChild(card);
  });
  featuresSec.appendChild(featGrid);
  container.appendChild(featuresSec);

  // Detail FAQs
  if (plan.faqs && plan.faqs.length > 0) {
    const faqSec = createElement('div', { className: 'space-y-6' });
    faqSec.innerHTML = `<h2 class="text-2xl font-bold text-brand-evergreen border-r-4 border-brand-amber pr-3">سوالات متداول این طرح</h2>`;
    faqSec.appendChild(createFaqAccordion(plan.faqs));
    container.appendChild(faqSec);
  }

  return container;
}
