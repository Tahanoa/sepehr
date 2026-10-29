/**
 * POLARIS CENTRALIZED NAVIGATION CONFIGURATION
 * Single source of truth for role-aware dashboard navigation items and metadata.
 */

import { Role, Permission } from '../types/auth';
import { OrganizationType } from '../types/organization';
import { NavigationItem, DashboardRouteMetadata } from '../types/navigation';

export interface NavigationConfigEntry {
  id: string;
  title: string;
  sectionKey: string;
  icon: string;
  badge?: string | number;
  roles: Role[];
  allowedOrgTypes?: OrganizationType[];
  requiredPermission?: Permission;
}

const MASTER_NAVIGATION: NavigationConfigEntry[] = [
  { id: 'direct-messages', title: 'پیام‌رسان', sectionKey: 'messages', icon: 'chat', roles: ['school_admin','institute_admin','student'] },
  // School Administrator
  {
    id: 'school_admin-overview',
    title: 'پیش‌خوان و نگاه کلی',
    sectionKey: 'overview',
    icon: 'dashboard',
    roles: ['school_admin'],
  },
  {
    id: 'school_admin-students',
    title: 'مدیریت دانش‌آموزان',
    sectionKey: 'students',
    icon: 'users',
    roles: ['school_admin'],
  },
  {
    id: 'school_admin-teachers',
    title: 'معلمان و همکاران',
    sectionKey: 'teachers',
    icon: 'teacher',
    roles: ['school_admin'],
  },
  {
    id: 'school_admin-classes',
    title: 'کلاس‌ها و پایه‌ها',
    sectionKey: 'classes',
    icon: 'classes',
    roles: ['school_admin'],
  },
  {
    id: 'school_admin-attendance',
    title: 'حضور و غیاب',
    sectionKey: 'attendance',
    icon: 'attendance',
    roles: ['school_admin'],
  },
  {
    id: 'school_admin-schedule',
    title: 'برنامه هفتگی',
    sectionKey: 'schedule',
    icon: 'calendar',
    roles: ['school_admin'],
  },
  {
    id: 'school_admin-exams',
    title: 'امتحانات و ارزشیابی',
    sectionKey: 'exams',
    icon: 'exam',
    roles: ['school_admin'],
    allowedOrgTypes: ['secondary_school', 'general_school'],
  },
  {
    id: 'school_admin-grades',
    title: 'نمرات و کارنامه‌ها',
    sectionKey: 'grades',
    icon: 'award',
    roles: ['school_admin'],
  },
  {
    id: 'school_admin-counseling',
    title: 'هماهنگی و مشاوره',
    sectionKey: 'counseling',
    icon: 'chat',
    roles: ['school_admin'],
    allowedOrgTypes: ['secondary_school'],
  },
  {
    id: 'school_admin-announcements',
    title: 'اطلاعیه‌ها و ارتباطات',
    sectionKey: 'announcements',
    icon: 'announcement',
    roles: ['school_admin'],
  },
  {
    id: 'school_admin-reports',
    title: 'گزارش‌ها و آمار',
    sectionKey: 'reports',
    icon: 'reports',
    roles: ['school_admin'],
  },
  {
    id: 'school_admin-settings',
    title: 'تنظیمات مدرسه',
    sectionKey: 'settings',
    icon: 'settings',
    roles: ['school_admin'],
  },

  // Teacher
  {
    id: 'teacher-overview',
    title: 'پیش‌خوان دبیر',
    sectionKey: 'overview',
    icon: 'dashboard',
    roles: ['teacher'],
  },
  {
    id: 'teacher-classes',
    title: 'کلاس‌های من',
    sectionKey: 'classes',
    icon: 'classes',
    roles: ['teacher'],
  },
  {
    id: 'teacher-students',
    title: 'دانش‌آموزان',
    sectionKey: 'students',
    icon: 'users',
    roles: ['teacher'],
  },
  {
    id: 'teacher-attendance',
    title: 'ثبت حضور و غیاب',
    sectionKey: 'attendance',
    icon: 'attendance',
    roles: ['teacher'],
  },
  {
    id: 'teacher-assignments',
    title: 'تکالیف و تمرین‌ها',
    sectionKey: 'assignments',
    icon: 'assignment',
    roles: ['teacher'],
  },
  {
    id: 'teacher-exams',
    title: 'آزمون‌ها و ارزشیابی',
    sectionKey: 'exams',
    icon: 'exam',
    roles: ['teacher'],
  },
  {
    id: 'teacher-grades',
    title: 'ثبت نمرات',
    sectionKey: 'grades',
    icon: 'award',
    roles: ['teacher'],
  },
  {
    id: 'teacher-materials',
    title: 'محتوای آموزشی',
    sectionKey: 'materials',
    icon: 'book',
    roles: ['teacher'],
  },

  // Student
  {
    id: 'student-overview',
    title: 'پیش‌خوان دانش‌آموز',
    sectionKey: 'overview',
    icon: 'dashboard',
    roles: ['student'],
  },
  {
    id: 'student-classes',
    title: 'کلاس‌های من',
    sectionKey: 'classes',
    icon: 'classes',
    roles: ['student'],
  },
  {
    id: 'student-assignments',
    title: 'تکالیف من',
    sectionKey: 'assignments',
    icon: 'assignment',
    badge: '۳',
    roles: ['student'],
  },
  {
    id: 'student-exams',
    title: 'آزمون‌های آنلاین',
    sectionKey: 'exams',
    icon: 'exam',
    roles: ['student'],
  },
  {
    id: 'student-grades',
    title: 'کارنامه و نمرات',
    sectionKey: 'grades',
    icon: 'award',
    roles: ['student'],
  },
  {
    id: 'student-materials',
    title: 'جزوات و منابع',
    sectionKey: 'materials',
    icon: 'book',
    roles: ['student'],
  },
  {
    id: 'student-schedule',
    title: 'برنامه هفتگی',
    sectionKey: 'schedule',
    icon: 'calendar',
    roles: ['student'],
  },

  // Parent
  {
    id: 'parent-overview',
    title: 'پیش‌خوان اولیا',
    sectionKey: 'overview',
    icon: 'dashboard',
    roles: ['parent'],
  },
  {
    id: 'parent-children',
    title: 'فرزندان من',
    sectionKey: 'children',
    icon: 'child',
    roles: ['parent'],
  },
  {
    id: 'parent-attendance',
    title: 'گزارش حضور و غیاب',
    sectionKey: 'attendance',
    icon: 'attendance',
    roles: ['parent'],
  },
  {
    id: 'parent-grades',
    title: 'کارنامه و نمرات',
    sectionKey: 'grades',
    icon: 'award',
    roles: ['parent'],
  },
  {
    id: 'parent-announcements',
    title: 'اطلاعیه‌های مدرسه',
    sectionKey: 'announcements',
    icon: 'announcement',
    roles: ['parent'],
  },
  {
    id: 'parent-schedule',
    title: 'برنامه هفتگی فرزند',
    sectionKey: 'schedule',
    icon: 'calendar',
    roles: ['parent'],
  },
  {
    id: 'parent-messages',
    title: 'ارتباط با کادر مدرسه',
    sectionKey: 'messages',
    icon: 'chat',
    roles: ['parent'],
  },

  // Counselor
  {
    id: 'counselor-overview',
    title: 'پیش‌خوان مشاوره',
    sectionKey: 'overview',
    icon: 'dashboard',
    roles: ['counselor'],
  },
  {
    id: 'counselor-students',
    title: 'دانش‌آموزان تحت مشاوره',
    sectionKey: 'students',
    icon: 'users',
    roles: ['counselor'],
  },
  {
    id: 'counselor-progress',
    title: 'پایش پیشرفت تحصیلی',
    sectionKey: 'progress',
    icon: 'chart',
    roles: ['counselor'],
  },
  {
    id: 'counselor-messages',
    title: 'پیام‌های مشاوره',
    sectionKey: 'messages',
    icon: 'chat',
    roles: ['counselor'],
  },
  {
    id: 'counselor-reports',
    title: 'گزارش‌های مشاوره‌ای',
    sectionKey: 'reports',
    icon: 'reports',
    roles: ['counselor'],
  },

  // Institute Administrator
  {
    id: 'institute_admin-overview',
    title: 'پیش‌خوان آموزشگاه',
    sectionKey: 'overview',
    icon: 'dashboard',
    roles: ['institute_admin'],
    allowedOrgTypes: ['independent_institute'],
  },
  {
    id: 'institute_admin-students',
    title: 'فراگیران و زبان‌آموزان',
    sectionKey: 'students',
    icon: 'users',
    roles: ['institute_admin'],
    allowedOrgTypes: ['independent_institute'],
  },
  {
    id: 'institute_admin-instructors',
    title: 'اساتید و مدرسین',
    sectionKey: 'instructors',
    icon: 'teacher',
    roles: ['institute_admin'],
    allowedOrgTypes: ['independent_institute'],
  },
  {
    id: 'institute_admin-courses',
    title: 'دوره‌ها و ترم‌ها',
    sectionKey: 'courses',
    icon: 'book',
    roles: ['institute_admin'],
    allowedOrgTypes: ['independent_institute'],
  },
  {
    id: 'institute_admin-attendance',
    title: 'حضور و غیاب کلاس‌ها',
    sectionKey: 'attendance',
    icon: 'attendance',
    roles: ['institute_admin'],
    allowedOrgTypes: ['independent_institute'],
  },
  {
    id: 'institute_admin-grades',
    title: 'ارزیابی و گواهینامه‌ها',
    sectionKey: 'grades',
    icon: 'award',
    roles: ['institute_admin'],
    allowedOrgTypes: ['independent_institute'],
  },
  {
    id: 'institute_admin-payments',
    title: 'شهریه‌ها و امور مالی',
    sectionKey: 'payments',
    icon: 'payment',
    roles: ['institute_admin'],
    allowedOrgTypes: ['independent_institute'],
  },
  {
    id: 'institute_admin-settings',
    title: 'تنظیمات آموزشگاه',
    sectionKey: 'settings',
    icon: 'settings',
    roles: ['institute_admin'],
    allowedOrgTypes: ['independent_institute'],
  },

  // Instructor
  {
    id: 'instructor-overview',
    title: 'پیش‌خوان مدرس',
    sectionKey: 'overview',
    icon: 'dashboard',
    roles: ['instructor'],
  },
  {
    id: 'instructor-courses',
    title: 'دوره‌های من',
    sectionKey: 'courses',
    icon: 'book',
    roles: ['instructor'],
  },
  {
    id: 'instructor-students',
    title: 'فراگیران من',
    sectionKey: 'students',
    icon: 'users',
    roles: ['instructor'],
  },
  {
    id: 'instructor-schedule',
    title: 'برنامه زمانی کلاس‌ها',
    sectionKey: 'schedule',
    icon: 'calendar',
    roles: ['instructor'],
  },
  {
    id: 'instructor-attendance',
    title: 'ثبت حضور و غیاب',
    sectionKey: 'attendance',
    icon: 'attendance',
    roles: ['instructor'],
  },
  {
    id: 'instructor-assignments',
    title: 'تکالیف و پروژه',
    sectionKey: 'assignments',
    icon: 'assignment',
    roles: ['instructor'],
  },
  {
    id: 'instructor-exams',
    title: 'آزمون‌ها و کوییزها',
    sectionKey: 'exams',
    icon: 'exam',
    roles: ['instructor'],
  },
  {
    id: 'instructor-grades',
    title: 'ثبت نمرات و بازخورد',
    sectionKey: 'grades',
    icon: 'award',
    roles: ['instructor'],
  },
  {
    id: 'instructor-materials',
    title: 'منابع و جزوات آموزشی',
    sectionKey: 'materials',
    icon: 'book',
    roles: ['instructor'],
  },

  // Prospective Applicant
  {
    id: 'applicant-overview',
    title: 'معرفی آموزشگاه',
    sectionKey: 'overview',
    icon: 'dashboard',
    roles: ['applicant'],
  },
  {
    id: 'applicant-courses',
    title: 'کاتالوگ دوره‌ها',
    sectionKey: 'courses',
    icon: 'book',
    roles: ['applicant'],
  },
  {
    id: 'applicant-registration',
    title: 'ثبت‌نام آنلاین',
    sectionKey: 'registration',
    icon: 'assignment',
    roles: ['applicant'],
  },
  {
    id: 'applicant-status',
    title: 'پیگیری وضعیت',
    sectionKey: 'status',
    icon: 'attendance',
    roles: ['applicant'],
  },
  {
    id: 'applicant-payments',
    title: 'شهریه و رسید',
    sectionKey: 'payments',
    icon: 'payment',
    roles: ['applicant'],
  },
];

export function getNavigationForRoleAndOrg(
  role: Role,
  orgType: OrganizationType,
  organizationId: string
): NavigationItem[] {
  return MASTER_NAVIGATION.filter((item) => {
    const roleMatches = item.roles.includes(role);
    if (!roleMatches) return false;

    if (item.allowedOrgTypes && item.allowedOrgTypes.length > 0) {
      if (!item.allowedOrgTypes.includes(orgType)) return false;
    }

    return true;
  }).map((item) => ({
    ...item,
    path: `/app/${organizationId}/${item.sectionKey}`,
  }));
}

export function getDashboardSectionTitles(): Record<string, string> {
  return {
    overview: 'پیش‌خوان و نگاه کلی',
    students: 'مدیریت دانش‌آموزان و فراگیران',
    teachers: 'مدیریت معلمان و کادر آموزشی',
    instructors: 'اساتید و مدرسین',
    classes: 'مدیریت کلاس‌ها و برنامه‌ها',
    courses: 'دوره‌ها و ترم‌های آموزشی',
    attendance: 'حضور و غیاب',
    assignments: 'تکالیف و تمرین‌ها',
    exams: 'آزمون‌ها و ارزشیابی',
    'exam-builder': 'طراح هوشمند و سازنده آزمون',
    grades: 'کارنامه‌ها و نمرات',
    materials: 'محتوا و منابع آموزشی',
    announcements: 'اطلاعیه‌ها و پیام‌ها',
    messages: 'ارتباطات و پیام‌رسانی',
    children: 'فرزندان تحت سرپرستی',
    counseling: 'هماهنگی و خدمات مشاوره',
    progress: 'پایش و پیشرفت تحصیلی',
    reports: 'گزارش‌های تحلیلی و مدیریتی',
    payments: 'شهریه‌ها و امور مالی',
    schedule: 'برنامه هفتگی و زمان‌بندی',
    settings: 'تنظیمات مرکز',
    registration: 'ثبت‌نام و درخواست پذیرش',
    status: 'پیگیری وضعیت درخواست',
  };
}

export function getDashboardRouteMetadata(
  sectionKey: string,
  role?: Role
): DashboardRouteMetadata {
  const titles = getDashboardSectionTitles();
  const title = titles[sectionKey] || 'بخش سیستم';

  const metadata: DashboardRouteMetadata = {
    sectionKey,
    title,
  };

  if (role) {
    metadata.roles = [role];
  }

  return metadata;
}
