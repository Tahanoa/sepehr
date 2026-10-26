/**
 * POLARIS PLAN CARD & FAQ ACCORDION COMPONENTS
 */

import { createElement } from '../../utils/dom';
import { EducationalPlan, FAQItem } from '../../data/public-data';

export function createPlanCard(plan: EducationalPlan): HTMLElement {
  const card = createElement('div', {
    className: 'flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group',
  });

  const topBanner = createElement('div', {
    className: `p-6 text-white bg-gradient-to-r ${
      plan.id === 'elementary'
        ? 'from-amber-600 to-amber-500'
        : plan.id === 'secondary'
        ? 'from-brand-purple to-purple-800'
        : 'from-brand-evergreen to-brand-darkgreen'
    }`,
  });

  topBanner.innerHTML = `
    <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm text-white mb-3">
      ${plan.badge}
    </span>
    <h3 class="text-xl font-bold mb-2">${plan.title}</h3>
    <p class="text-xs text-white/90 leading-relaxed">${plan.targetAudience}</p>
  `;

  const body = createElement('div', { className: 'p-6 flex-1 flex flex-col justify-between space-y-6' });

  const desc = createElement('p', {
    className: 'text-sm text-gray-600 leading-relaxed',
    textContent: plan.shortDescription,
  });

  const rolesContainer = createElement('div', { className: 'space-y-2' });
  rolesContainer.innerHTML = `
    <span class="text-xs font-bold text-gray-500 uppercase tracking-wider block">کاربران هدف:</span>
    <div class="flex flex-wrap gap-1.5">
      ${plan.roles.map(r => `<span class="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg font-medium">${r}</span>`).join('')}
    </div>
  `;

  const capsContainer = createElement('div', { className: 'space-y-2.5' });
  capsContainer.innerHTML = `
    <span class="text-xs font-bold text-gray-500 uppercase tracking-wider block">قابلیت‌های کلیدی:</span>
    <ul class="space-y-2 text-xs text-gray-700">
      ${plan.capabilities.slice(0, 4).map(c => `
        <li class="flex items-start gap-2">
          <svg class="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          <span>${c}</span>
        </li>
      `).join('')}
    </ul>
  `;

  const footer = createElement('div', { className: 'pt-4 border-t border-gray-100 space-y-3' });

  const pricingNote = createElement('div', {
    className: 'text-xs text-center py-2 px-3 rounded-lg bg-gray-50 text-gray-600 font-medium',
    textContent: 'جهت دریافت تعرفه و ساختار قیمت‌گذاری با ما تماس بگیرید',
  });

  const btnContainer = createElement('div', { className: 'grid grid-cols-2 gap-2' });

  const detailBtn = createElement('a', {
    attributes: { href: plan.detailRoute },
    className: 'w-full py-2.5 px-3 rounded-xl border border-gray-300 text-center text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors',
    textContent: 'مشاهده جزییات',
  });
  detailBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: plan.detailRoute }));
  });

  const reqBtn = createElement('a', {
    attributes: { href: `/register?plan=${plan.id}` },
    className: 'w-full py-2.5 px-3 rounded-xl bg-brand-evergreen hover:bg-brand-darkgreen text-center text-xs font-bold text-white shadow-sm transition-colors',
    textContent: 'درخواست مشاوره',
  });
  reqBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: `/register?plan=${plan.id}` }));
  });

  btnContainer.appendChild(detailBtn);
  btnContainer.appendChild(reqBtn);

  footer.appendChild(pricingNote);
  footer.appendChild(btnContainer);

  body.appendChild(desc);
  body.appendChild(rolesContainer);
  body.appendChild(capsContainer);
  body.appendChild(footer);

  card.appendChild(topBanner);
  card.appendChild(body);

  return card;
}

export function createFaqAccordion(faqs: FAQItem[]): HTMLElement {
  const accordion = createElement('div', { className: 'space-y-4 max-w-3xl mx-auto' });

  faqs.forEach((faq) => {
    const item = createElement('div', {
      className: 'border border-gray-200 rounded-2xl bg-white overflow-hidden transition-all duration-200',
    });

    const header = createElement('button', {
      className: 'w-full px-6 py-4 text-right font-bold text-gray-800 flex justify-between items-center hover:bg-gray-50 focus:outline-none text-sm md:text-base gap-4',
    });

    header.innerHTML = `
      <span>${faq.question}</span>
      <svg class="w-5 h-5 text-gray-400 transform transition-transform duration-200 accordion-icon flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    `;

    const body = createElement('div', {
      className: 'hidden px-6 pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50',
      textContent: faq.answer,
    });

    header.addEventListener('click', () => {
      const isHidden = body.classList.contains('hidden');
      body.classList.toggle('hidden', !isHidden);
      const icon = header.querySelector('.accordion-icon');
      if (icon) {
        icon.classList.toggle('rotate-180', isHidden);
      }
    });

    item.appendChild(header);
    item.appendChild(body);
    accordion.appendChild(item);
  });

  return accordion;
}
