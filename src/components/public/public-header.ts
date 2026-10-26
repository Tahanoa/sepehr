/**
 * POLARIS PUBLIC NAVBAR COMPONENT
 */

import { createElement } from '../../utils/dom';

export interface NavItem {
  label: string;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'صفحه اصلی', path: '/' },
  { label: 'طرح‌ها و بسته‌ها', path: '/plans' },
  { label: 'درباره پولاریس', path: '/about' },
  { label: 'تماس با ما', path: '/contact' },
];

export function createPublicHeader(currentPath: string): HTMLElement {
  const header = createElement('header', {
    className: 'sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all',
  });

  const container = createElement('div', {
    className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between',
  });

  // Brand Logo
  const logoLink = createElement('a', {
    attributes: { href: '/' },
    className: 'flex items-center gap-3 group focus:outline-none',
  });
  logoLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: '/' }));
  });

  const logoIcon = createElement('div', {
    className: 'w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-evergreen via-brand-darkgreen to-brand-amber flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform',
  });
  logoIcon.innerHTML = `<svg class="w-6 h-6 stroke-current fill-none stroke-[2.2]" viewBox="0 0 24 24"><path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z"/></svg>`;

  const logoText = createElement('div', { className: 'flex flex-col' });
  const brandName = createElement('span', {
    className: 'text-xl font-bold text-brand-evergreen tracking-tight',
    textContent: 'پولاریس',
  });
  const brandSub = createElement('span', {
    className: 'text-[11px] font-medium text-gray-500 -mt-1',
    textContent: 'سامانه هوشمند مدیریت آموزش',
  });
  logoText.appendChild(brandName);
  logoText.appendChild(brandSub);
  logoLink.appendChild(logoIcon);
  logoLink.appendChild(logoText);

  // Desktop Navigation Menu
  const nav = createElement('nav', { className: 'hidden md:flex items-center gap-1 lg:gap-2' });

  NAV_ITEMS.forEach((item) => {
    const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
    const link = createElement('a', {
      attributes: { href: item.path },
      className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-brand-lavender/60 text-brand-evergreen font-bold'
          : 'text-gray-700 hover:text-brand-evergreen hover:bg-gray-100'
      }`,
      textContent: item.label,
    });
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: item.path }));
    });
    nav.appendChild(link);
  });

  // Auth Buttons
  const actionsContainer = createElement('div', { className: 'hidden md:flex items-center gap-3' });

  const loginBtn = createElement('a', {
    attributes: { href: '/login' },
    className: 'px-4 py-2 text-sm font-semibold text-brand-evergreen hover:text-brand-darkgreen transition-colors',
    textContent: 'ورود به سامانه',
  });
  loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: '/login' }));
  });

  const registerBtn = createElement('a', {
    attributes: { href: '/register' },
    className: 'px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-amber hover:bg-amber-600 text-white shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5',
    textContent: 'ثبت‌نام و مشاوره',
  });
  registerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: '/register' }));
  });

  actionsContainer.appendChild(loginBtn);
  actionsContainer.appendChild(registerBtn);

  // Mobile Menu Toggle Button
  const mobileToggleBtn = createElement('button', {
    attributes: { 'aria-label': 'منوی موبایل' },
    className: 'md:hidden p-2.5 rounded-xl text-gray-700 hover:bg-gray-100 focus:outline-none',
  });
  mobileToggleBtn.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>`;

  // Mobile Drawer
  const mobileDrawer = createElement('div', {
    className: 'hidden md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg',
  });

  NAV_ITEMS.forEach((item) => {
    const isActive = currentPath === item.path;
    const link = createElement('a', {
      attributes: { href: item.path },
      className: `block px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
        isActive ? 'bg-brand-lavender/70 text-brand-evergreen font-bold' : 'text-gray-700 hover:bg-gray-50'
      }`,
      textContent: item.label,
    });
    link.addEventListener('click', (e) => {
      e.preventDefault();
      mobileDrawer.classList.add('hidden');
      window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: item.path }));
    });
    mobileDrawer.appendChild(link);
  });

  const mobileActions = createElement('div', { className: 'pt-3 border-t border-gray-100 flex flex-col gap-2' });
  const mLogin = createElement('a', {
    attributes: { href: '/login' },
    className: 'w-full py-2.5 text-center font-semibold text-brand-evergreen bg-gray-50 rounded-xl',
    textContent: 'ورود به سامانه',
  });
  mLogin.addEventListener('click', (e) => {
    e.preventDefault();
    mobileDrawer.classList.add('hidden');
    window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: '/login' }));
  });

  const mReg = createElement('a', {
    attributes: { href: '/register' },
    className: 'w-full py-2.5 text-center font-bold text-white bg-brand-amber rounded-xl shadow',
    textContent: 'ثبت‌نام و مشاوره موسسات',
  });
  mReg.addEventListener('click', (e) => {
    e.preventDefault();
    mobileDrawer.classList.add('hidden');
    window.dispatchEvent(new CustomEvent('polaris-navigate', { detail: '/register' }));
  });

  mobileActions.appendChild(mLogin);
  mobileActions.appendChild(mReg);
  mobileDrawer.appendChild(mobileActions);

  mobileToggleBtn.addEventListener('click', () => {
    mobileDrawer.classList.toggle('hidden');
  });

  container.appendChild(logoLink);
  container.appendChild(nav);
  container.appendChild(actionsContainer);
  container.appendChild(mobileToggleBtn);

  header.appendChild(container);
  header.appendChild(mobileDrawer);

  return header;
}
