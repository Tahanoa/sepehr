/**
 * POLARIS MOCK DATA
 * Fictional, realistic Persian sample data for the Polaris Platform.
 */

import { StudentRecord, StatMetric, UserProfile } from '../types/common';
import { NavItem } from '../types/navigation';

export const currentUser: UserProfile = {
  id: 'usr-101',
  name: 'دکتر علیرضا رضایی',
  role: 'admin',
  roleLabel: 'مدیر کل سامانه',
  email: 'a.rezaei@polaris-edu.ir',
};

export const mainNavigation: NavItem[] = [
  { id: 'home', title: 'پیش‌خوان اصلی', path: '/', icon: 'dashboard' },
  { id: 'students', title: 'مدیریت دانش‌آموزان', path: '/students', icon: 'users', badge: '۱۲' },
  { id: 'courses', title: 'دوره‌های آموزشی', path: '/courses', icon: 'book' },
  { id: 'grades', title: 'کارنامه‌ها و نمرات', path: '/grades', icon: 'award' },
  { id: 'reports', title: 'گزارش‌های تحلیلی', path: '/reports', icon: 'chart' },
  { id: 'settings', title: 'تنظیمات سیستم', path: '/settings', icon: 'settings' },
];

export const mockDashboardStats: StatMetric[] = [
  {
    id: 'stat-1',
    title: 'کل دانش‌آموزان فعال',
    value: '۱,۴۵۰',
    changePercent: 12.5,
    changeType: 'increase',
    periodLabel: 'نسبت به ماه گذشته',
    iconName: 'users',
  },
  {
    id: 'stat-2',
    title: 'دوره‌های در حال برگزاری',
    value: '۴۸',
    changePercent: 4.2,
    changeType: 'increase',
    periodLabel: 'ترم جاری',
    iconName: 'book',
  },
  {
    id: 'stat-3',
    title: 'میانگین معدل کل',
    value: '۱۷.۸۵',
    changePercent: 1.8,
    changeType: 'increase',
    periodLabel: 'ارزیابی اخیر',
    iconName: 'award',
  },
  {
    id: 'stat-4',
    title: 'هشدار افت تحصیلی',
    value: '۲۳',
    changePercent: 5.4,
    changeType: 'decrease',
    periodLabel: 'نیازمند پیگیری مشاوره',
    iconName: 'alert',
  },
];

export const mockStudentRecords: StudentRecord[] = [
  {
    id: 'st-01',
    studentCode: '۴۰۲۱۰۱۰۱',
    fullName: 'سارا احمدی',
    gradeLevel: 'پایه دوازدهم - ریاضی',
    courseName: 'حسابان ۲ و هندسه ۳',
    gpa: 19.75,
    status: 'active',
    enrollmentDate: '۱۴۰۲/۰۷/۰۱',
  },
  {
    id: 'st-02',
    studentCode: '۴۰۲۱۰۱۰۲',
    fullName: 'محمدجواد حسینی',
    gradeLevel: 'پایه دوازدهم - تجربی',
    courseName: 'زیست‌شناسی ۳ و شیمی',
    gpa: 18.50,
    status: 'active',
    enrollmentDate: '۱۴۰۲/۰۷/۰۱',
  },
  {
    id: 'st-03',
    studentCode: '۴۰۲۱۰۱۰۳',
    fullName: 'زهرا کاظمی',
    gradeLevel: 'پایه یازدهم - ریاضی',
    courseName: 'فیزیک ۲ و آمار',
    gpa: 16.25,
    status: 'pending',
    enrollmentDate: '۱۴۰۲/۰۷/۰۵',
  },
  {
    id: 'st-04',
    studentCode: '۴۰۲۱۰۱۰۴',
    fullName: 'امیرحسین رضایی',
    gradeLevel: 'پایه دهم - انسانی',
    courseName: 'جامعه‌شناسی و منطق',
    gpa: 14.80,
    status: 'suspended',
    enrollmentDate: '۱۴۰۲/۰۷/۱۰',
  },
  {
    id: 'st-05',
    studentCode: '۴۰۲۱۰۱۰۵',
    fullName: 'نیلوفر صادقی',
    gradeLevel: 'پایه دوازدهم - تجربی',
    courseName: 'فیزیک ۳ و ریاضی تجربی',
    gpa: 19.20,
    status: 'active',
    enrollmentDate: '۱۴۰۲/۰۷/۰۱',
  },
  {
    id: 'st-06',
    studentCode: '۴۰۲۱۰۱۰۶',
    fullName: 'پویا مرادی',
    gradeLevel: 'پایه یازدهم - فنی و حرفه‌ای',
    courseName: 'شبکه و سخت‌افزار',
    gpa: 17.10,
    status: 'completed',
    enrollmentDate: '۱۴۰۲/۰۶/۱۵',
  },
];
