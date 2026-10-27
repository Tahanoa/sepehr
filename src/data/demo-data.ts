/**
 * POLARIS DEMO DATA
 * Realistic, fictional Persian sample data for development and demonstration purposes only.
 */

import { Organization } from '../types/organization';
import { User } from '../types/auth';

export const org101: Organization = {
  id: 'org-101',
  name: 'دبیرستان هوشمند البرز',
  type: 'secondary_school',
  code: 'SCH-101',
  description: 'دبیرستان دوره دوم پسرانه - منطقه ۶ تهران',
  academicYear: '۱۴۰۳ - ۱۴۰۲',
};

export const org102: Organization = {
  id: 'org-102',
  name: 'دبستان و پیش‌دبستانی آفتاب',
  type: 'elementary_school',
  code: 'SCH-102',
  description: 'دبستان هوشمند دخترانه - منطقه ۳ تهران',
  academicYear: '۱۴۰۳ - ۱۴۰۲',
};

export const org103: Organization = {
  id: 'org-103',
  name: 'آموزشگاه زبان و علوم دانش‌نیک',
  type: 'independent_institute',
  code: 'INST-103',
  description: 'مؤسسه تخصصی آموزش‌های آزاد و مهارتی',
  academicYear: 'ترم بهار ۱۴۰۳',
};

export const org104: Organization = {
  id: 'org-104',
  name: 'مجتمع آموزشی جامع حکمت',
  type: 'general_school',
  code: 'SCH-104',
  description: 'مجتمع آموزشی همه مقاطع تحصیلی - منطقه ۲ تهران',
  academicYear: '۱۴۰۳ - ۱۴۰۲',
};

export const DEMO_ORGANIZATIONS: Record<string, Organization> = {
  'org-101': org101,
  'org-102': org102,
  'org-103': org103,
  'org-104': org104,
};

export const DEMO_USERS: User[] = [
  {
    id: 'usr-admin',
    name: 'دکتر علیرضا رضایی',
    email: 'a.rezaei@polaris-edu.ir',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    phone: '۰۹۱۲۱۱۱۲۲۳۳',
    memberships: [
      {
        id: 'mem-admin-101',
        userId: 'usr-admin',
        organizationId: 'org-101',
        organization: org101,
        role: 'school_admin',
        status: 'active',
        title: 'مدیر دبیرستان البرز',
        department: 'مدیریت دبیرستان',
        isPrimary: true,
      },
      {
        id: 'mem-admin-102',
        userId: 'usr-admin',
        organizationId: 'org-102',
        organization: org102,
        role: 'school_admin',
        status: 'active',
        title: 'مدیر دبستان آفتاب',
        department: 'مدیریت دبستان',
      },
      {
        id: 'mem-admin-104',
        userId: 'usr-admin',
        organizationId: 'org-104',
        organization: org104,
        role: 'school_admin',
        status: 'active',
        title: 'مدیر مجتمع آموزشی حکمت',
        department: 'مدیریت کل مجتمع',
      },
    ],
  },
  {
    id: 'usr-teacher',
    name: 'استاد مریم حسینی',
    email: 'm.hosseini@polaris-edu.ir',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    phone: '۰۹۱۲۲۲۲۳۳۴۴',
    memberships: [
      {
        id: 'mem-teacher-101',
        userId: 'usr-teacher',
        organizationId: 'org-101',
        organization: org101,
        role: 'teacher',
        status: 'active',
        title: 'دبیر ارشد ریاضیات و حسابان',
        department: 'گروه آموزشی علوم پایه',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'usr-student',
    name: 'امیرحسین رضایی',
    email: 'a.rezaei.std@polaris-edu.ir',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    phone: '۰۹۱۲۳۳۳۴۴۵۵',
    memberships: [
      {
        id: 'mem-student-101',
        userId: 'usr-student',
        organizationId: 'org-101',
        organization: org101,
        role: 'student',
        status: 'active',
        title: 'دانش‌آموز پایه دوازدهم ریاضی',
        department: 'کلاس ۱۲/۱',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'usr-parent',
    name: 'مهندس رضا رضایی',
    email: 'r.rezaei.parent@polaris-edu.ir',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    phone: '۰۹۱۲۴۴۴۵۵۶۶',
    memberships: [
      {
        id: 'mem-parent-101',
        userId: 'usr-parent',
        organizationId: 'org-101',
        organization: org101,
        role: 'parent',
        status: 'active',
        title: 'ولی دانش‌آموز (امیرحسین رضایی)',
        department: 'انجمن اولیا و مربیان',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'usr-counselor',
    name: 'دکتر سارا کریمی',
    email: 's.karimi@polaris-edu.ir',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    phone: '۰۹۱۲۵۵۵۶۶۷۷',
    memberships: [
      {
        id: 'mem-counselor-101',
        userId: 'usr-counselor',
        organizationId: 'org-101',
        organization: org101,
        role: 'counselor',
        status: 'active',
        title: 'مشاور تحصیلی و برنامه‌ریزی',
        department: 'دپارتمان مشاوره',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'usr-inst-admin',
    name: 'مهندس مهدی احمدی',
    email: 'm.ahmadi@daneshnik.ir',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    phone: '۰۹۱۲۶۶۶۷۷۸۸',
    memberships: [
      {
        id: 'mem-inst-admin-103',
        userId: 'usr-inst-admin',
        organizationId: 'org-103',
        organization: org103,
        role: 'institute_admin',
        status: 'active',
        title: 'مدیر آموزشگاه دانش‌نیک',
        department: 'مدیریت موسسه',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'usr-instructor',
    name: 'استاد سعید تهرانی',
    email: 's.tehrani@daneshnik.ir',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    phone: '۰۹۱۲۷۷۷۸۸۹۹',
    memberships: [
      {
        id: 'mem-instructor-103',
        userId: 'usr-instructor',
        organizationId: 'org-103',
        organization: org103,
        role: 'instructor',
        status: 'active',
        title: 'مدرس ارشد برنامه‌نویسی و زبان',
        department: 'دپارتمان فناوری اطلاعات',
        isPrimary: true,
      },
    ],
  },
];

export const DEFAULT_DEMO_USER_ID = 'usr-admin';

export interface DemoActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: 'attendance' | 'grade' | 'announcement' | 'class' | 'system';
  actorName: string;
  badgeType: 'success' | 'warning' | 'info' | 'primary';
}

export const DEMO_RECENT_ACTIVITIES: DemoActivity[] = [
  {
    id: 'act-1',
    title: 'ثبت حضور و غیاب روزانه',
    description: 'حضور و غیاب کلاس ۱۲/۱ ریاضی توسط استاد مریم حسینی نهایی شد.',
    timestamp: '۱۰ دقیقه پیش',
    category: 'attendance',
    actorName: 'مریم حسینی',
    badgeType: 'success',
  },
  {
    id: 'act-2',
    title: 'انتشار اطلاعیه جلسه اولیا و مربیان',
    description: 'اطلاعیه برگزاری جلسه تعاملی ماه اسفند ارسال گردید.',
    timestamp: '۴۵ دقیقه پیش',
    category: 'announcement',
    actorName: 'دکتر علیرضا رضایی',
    badgeType: 'primary',
  },
  {
    id: 'act-3',
    title: 'ثبت نمرات آزمون مستمر حسابان ۲',
    description: 'نمرات ۲۸ دانش‌آموز پایه دوازدهم ثبت و تحویل سیستم شد.',
    timestamp: '۲ ساعت پیش',
    category: 'grade',
    actorName: 'مریم حسینی',
    badgeType: 'info',
  },
  {
    id: 'act-4',
    title: 'برنامه‌ریزی کارگاه مشاوره کنکور',
    description: 'جلسه بررسی افت تحصیلی پایه یازدهم با حضور مشاوره تنظیم شد.',
    timestamp: 'دیروز، ۱۶:۳۰',
    category: 'class',
    actorName: 'دکتر سارا کریمی',
    badgeType: 'warning',
  },
];
