/**
 * POLARIS SCHOOL DATA STORE SERVICE
 * Centralized local state management with persistence, CRUD operations,
 * state validation, and demo data reset.
 */

import {
  Student,
  StaffMember,
  SchoolClass,
  Subject,
  AttendanceRecord,
  TimetableSlot,
  Exam,
  StudentGrade,
  CounselingReferral,
  Announcement,
  SchoolSettings,
  AttendanceStatus,
} from '../types/school';

const STORAGE_KEY_PREFIX = 'polaris_school_store_v1_';

interface SchoolDataState {
  students: Student[];
  staff: StaffMember[];
  classes: SchoolClass[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
  timetable: TimetableSlot[];
  exams: Exam[];
  grades: StudentGrade[];
  counseling: CounselingReferral[];
  announcements: Announcement[];
  settings: Record<string, SchoolSettings>;
}

// Default Seed Data
const DEFAULT_CLASSES: SchoolClass[] = [
  // Elementary org-102
  { id: 'cls-elem-101', organizationId: 'org-102', code: 'E-101', name: 'کلاس ۱/الف (شکوفه‌ها)', gradeLevel: 'پایه اول', homeroomTeacherId: 'stf-elem-01', homeroomTeacherName: 'خانم فاطمه طاهری', capacity: 25, studentCount: 22, roomNumber: '۱۰۱' },
  { id: 'cls-elem-201', organizationId: 'org-102', code: 'E-201', name: 'کلاس ۲/ب (یاس)', gradeLevel: 'پایه دوم', homeroomTeacherId: 'stf-elem-02', homeroomTeacherName: 'خانم مریم نوری', capacity: 25, studentCount: 24, roomNumber: '۱۰۲' },
  { id: 'cls-elem-301', organizationId: 'org-102', code: 'E-301', name: 'کلاس ۳/الف (نیلوفر)', gradeLevel: 'پایه سوم', homeroomTeacherId: 'stf-elem-03', homeroomTeacherName: 'خانم زهرا علوی', capacity: 25, studentCount: 23, roomNumber: '۱۰۳' },

  // Secondary org-101
  { id: 'cls-sec-101', organizationId: 'org-101', code: 'S-101', name: 'کلاس ۱۰/۱ ریاضی', gradeLevel: 'پایه دهم', homeroomTeacherId: 'stf-sec-01', homeroomTeacherName: 'استاد مریم حسینی', capacity: 30, studentCount: 28, roomNumber: '۲۰۱' },
  { id: 'cls-sec-111', organizationId: 'org-101', code: 'S-111', name: 'کلاس ۱۱/۱ تجربی', gradeLevel: 'پایه یازدهم', homeroomTeacherId: 'stf-sec-02', homeroomTeacherName: 'دکتر محسن کاظمی', capacity: 30, studentCount: 27, roomNumber: '۲۰۲' },
  { id: 'cls-sec-121', organizationId: 'org-101', code: 'S-121', name: 'کلاس ۱۲/۱ ریاضی (کنکور)', gradeLevel: 'پایه دوازدهم', homeroomTeacherId: 'stf-sec-01', homeroomTeacherName: 'استاد مریم حسینی', capacity: 30, studentCount: 29, roomNumber: '۲۰۳' },

  // General org-104
  { id: 'cls-gen-101', organizationId: 'org-104', code: 'G-101', name: 'کلاس ۵/الف ابتدایی', gradeLevel: 'پایه پنجم', homeroomTeacherId: 'stf-gen-01', homeroomTeacherName: 'آقای علی اکبرپور', capacity: 28, studentCount: 25, roomNumber: '۳۰۱' },
  { id: 'cls-gen-201', organizationId: 'org-104', code: 'G-201', name: 'کلاس ۸/۲ متوسطه اول', gradeLevel: 'پایه هشتم', homeroomTeacherId: 'stf-gen-02', homeroomTeacherName: 'خانم سمیرا محمدی', capacity: 30, studentCount: 26, roomNumber: '۳۰۲' },
  { id: 'cls-gen-301', organizationId: 'org-104', code: 'G-301', name: 'کلاس ۱۱/۲ علوم انسانی', gradeLevel: 'پایه یازدهم', homeroomTeacherId: 'stf-gen-03', homeroomTeacherName: 'آقای حسن کریمی', capacity: 30, studentCount: 24, roomNumber: '۳۰۳' },
];

const DEFAULT_STUDENTS: Student[] = [
  // Elementary org-102
  { id: 'std-e1', organizationId: 'org-102', studentCode: '۴۰۲۱۰۱۰۱', fullName: 'نازنین‌زهرا عباسی', nationalId: '۰۰۲۱۴۵۸۷۹۶', gradeLevel: 'پایه اول', className: 'کلاس ۱/الف (شکوفه‌ها)', classId: 'cls-elem-101', guardianName: 'امیر عباسی', guardianRelation: 'پدر', guardianPhone: '۰۹۱۲۱۱۱۰۰۱۱', gender: 'female', status: 'active', enrollmentDate: '۱۴۰۲/۰۷/۰۱', notes: 'نیازمند تشویق صوتی' },
  { id: 'std-e2', organizationId: 'org-102', studentCode: '۴۰۲۱۰۱۰۲', fullName: 'ثنا محمدی', nationalId: '۰۰۲۱۴۵۸۷۹۷', gradeLevel: 'پایه اول', className: 'کلاس ۱/الف (شکوفه‌ها)', classId: 'cls-elem-101', guardianName: 'سعید محمدی', guardianRelation: 'پدر', guardianPhone: '۰۹۱۲۱۱۱۰۰۲۲', gender: 'female', status: 'active', enrollmentDate: '۱۴۰۲/۰۷/۰۱' },
  { id: 'std-e3', organizationId: 'org-102', studentCode: '۴۰۲۱۰۱۰۳', fullName: 'رقیه نجفی', nationalId: '۰۰۲۱۴۵۸۷۹۸', gradeLevel: 'پایه دوم', className: 'کلاس ۲/ب (یاس)', classId: 'cls-elem-201', guardianName: 'مریم نجفی', guardianRelation: 'مادر', guardianPhone: '۰۹۱۲۱۱۱۰۰۳۳', gender: 'female', status: 'active', enrollmentDate: '۱۴۰۲/۰۷/۰۱' },
  { id: 'std-e4', organizationId: 'org-102', studentCode: '۴۰۲۱۰۱۰۴', fullName: 'یلدا حسینی', nationalId: '۰۰۲۱۴۵۸۷۹۹', gradeLevel: 'پایه سوم', className: 'کلاس ۳/الف (نیلوفر)', classId: 'cls-elem-301', guardianName: 'حمید حسینی', guardianRelation: 'پدر', guardianPhone: '۰۹۱۲۱۱۱۰۰۴۴', gender: 'female', status: 'active', enrollmentDate: '۱۴۰۲/۰۷/۰۱' },

  // Secondary org-101
  { id: 'std-s1', organizationId: 'org-101', studentCode: '۴۰۲۲۰۱۰۱', fullName: 'امیرحسین رضایی', nationalId: '۰۰۱۹۸۷۶۵۴۳', gradeLevel: 'پایه دوازدهم', className: 'کلاس ۱۲/۱ ریاضی (کنکور)', classId: 'cls-sec-121', guardianName: 'رضا رضایی', guardianRelation: 'پدر', guardianPhone: '۰۹۱۲۴۴۴۵۵۶۶', gender: 'male', status: 'active', enrollmentDate: '۱۴۰۲/۰۷/۰۱' },
  { id: 'std-s2', organizationId: 'org-101', studentCode: '۴۰۲۲۰۱۰۲', fullName: 'محمدجواد حسینی', nationalId: '۰۰۱۹۸۷۶۵۴۴', gradeLevel: 'پایه یازدهم', className: 'کلاس ۱۱/۱ تجربی', classId: 'cls-sec-111', guardianName: 'علی حسینی', guardianRelation: 'پدر', guardianPhone: '۰۹۱۲۵۵۵۶۶۷۷', gender: 'male', status: 'active', enrollmentDate: '۱۴۰۲/۰۷/۰۱' },
  { id: 'std-s3', organizationId: 'org-101', studentCode: '۴۰۲۲۰۱۰۳', fullName: 'پویا مرادی', nationalId: '۰۰۱۹۸۷۶۵۴۵', gradeLevel: 'پایه دهم', className: 'کلاس ۱۰/۱ ریاضی', classId: 'cls-sec-101', guardianName: 'فرزاد مرادی', guardianRelation: 'پدر', guardianPhone: '۰۹۱۲۶۶۶۷۷۸۸', gender: 'male', status: 'active', enrollmentDate: '۱۴۰۲/۰۷/۰۱' },
  { id: 'std-s4', organizationId: 'org-101', studentCode: '۴۰۲۲۰۱۰۴', fullName: 'سینا احمدی', nationalId: '۰۰۱۹۸۷۶۵۴۶', gradeLevel: 'پایه دوازدهم', className: 'کلاس ۱۲/۱ ریاضی (کنکور)', classId: 'cls-sec-121', guardianName: 'مهدی احمدی', guardianRelation: 'پدر', guardianPhone: '۰۹۱۲۷۷۷۸۸۹۹', gender: 'male', status: 'active', enrollmentDate: '۱۴۰۲/۰۷/۰۱' },

  // General org-104
  { id: 'std-g1', organizationId: 'org-104', studentCode: '۴۰۲۳۰۱۰۱', fullName: 'سارا احمدی', nationalId: '۰۰۳۴۵۶۷۸۹۰', gradeLevel: 'پایه پنجم', className: 'کلاس ۵/الف ابتدایی', classId: 'cls-gen-101', guardianName: 'کامران احمدی', guardianRelation: 'پدر', guardianPhone: '۰۹۱۲۸۸۸۹۹۰۰', gender: 'female', status: 'active', enrollmentDate: '۱۴۰۲/۰۷/۰۱' },
  { id: 'std-g2', organizationId: 'org-104', studentCode: '۴۰۲۳۰۱۰۲', fullName: 'دانیال کریمی', nationalId: '۰۰۳۴۵۶۷۸۹۱', gradeLevel: 'پایه هشتم', className: 'کلاس ۸/۲ متوسطه اول', classId: 'cls-gen-201', guardianName: 'حسن کریمی', guardianRelation: 'پدر', guardianPhone: '۰۹۱۲۹۹۹۰۰۱۱', gender: 'male', status: 'active', enrollmentDate: '۱۴۰۲/۰۷/۰۱' },
  { id: 'std-g3', organizationId: 'org-104', studentCode: '۴۰۲۳۰۱۰۳', fullName: 'زهرا کاظمی', nationalId: '۰۰۳۴۵۶۷۸۹۲', gradeLevel: 'پایه یازدهم', className: 'کلاس ۱۱/۲ علوم انسانی', classId: 'cls-gen-301', guardianName: 'مرتضی کاظمی', guardianRelation: 'پدر', guardianPhone: '۰۹۱۲۰۰۰۱۱۸۸', gender: 'female', status: 'active', enrollmentDate: '۱۴۰۲/۰۷/۰۱' },
];

const DEFAULT_STAFF: StaffMember[] = [
  // Elementary
  { id: 'stf-elem-01', organizationId: 'org-102', staffCode: 'T-101', fullName: 'خانم فاطمه طاهری', role: 'teacher', roleTitle: 'معلم آموزگار پایه اول', email: 'f.taheri@sun-sch.ir', phone: '۰۹۱۲۱۱۱۸۸۷۷', assignedSubjects: ['فارسی اول', 'ریاضی اول', 'علوم اول'], assignedClasses: ['کلاس ۱/الف (شکوفه‌ها)'], status: 'active', weeklyHours: 24 },
  { id: 'stf-elem-02', organizationId: 'org-102', staffCode: 'T-102', fullName: 'خانم مریم نوری', role: 'teacher', roleTitle: 'معلم آموزگار پایه دوم', email: 'm.nouri@sun-sch.ir', phone: '۰۹۱۲۲۲۲۸۸۷۷', assignedSubjects: ['فارسی دوم', 'ریاضی دوم'], assignedClasses: ['کلاس ۲/ب (یاس)'], status: 'active', weeklyHours: 24 },
  { id: 'stf-elem-03', organizationId: 'org-102', staffCode: 'T-103', fullName: 'خانم زهرا علوی', role: 'teacher', roleTitle: 'معلم هنر و قرآن', email: 'z.alavi@sun-sch.ir', phone: '۰۹۱۲۳۳۳۸۸۷۷', assignedSubjects: ['هنر', 'قرآن'], assignedClasses: ['کلاس ۱/الف', 'کلاس ۲/ب', 'کلاس ۳/الف'], status: 'active', weeklyHours: 18 },

  // Secondary
  { id: 'stf-sec-01', organizationId: 'org-101', staffCode: 'T-201', fullName: 'استاد مریم حسینی', role: 'teacher', roleTitle: 'دبیر ارشد حسابان و هندسه', email: 'm.hosseini@alborz-sch.ir', phone: '۰۹۱۲۲۲۲۳۳۴۴', assignedSubjects: ['حسابان ۲', 'هندسه ۳', 'ریاضی ۱۰'], assignedClasses: ['کلاس ۱۰/۱ ریاضی', 'کلاس ۱۲/۱ ریاضی'], status: 'active', weeklyHours: 22 },
  { id: 'stf-sec-02', organizationId: 'org-101', staffCode: 'T-202', fullName: 'دکتر محسن کاظمی', role: 'teacher', roleTitle: 'دبیر زیست‌شناسی و شیمی', email: 'm.kazemi@alborz-sch.ir', phone: '۰۹۱۲۴۴۴۸۸۷۷', assignedSubjects: ['زیست ۳', 'شیمی ۲'], assignedClasses: ['کلاس ۱۱/۱ تجربی'], status: 'active', weeklyHours: 20 },
  { id: 'stf-sec-03', organizationId: 'org-101', staffCode: 'T-203', fullName: 'دکتر سارا کریمی', role: 'counselor', roleTitle: 'مشاور تحصیلی و کنکور', email: 's.karimi@alborz-sch.ir', phone: '۰۹۱۲۵۵۵۶۶۷۷', assignedSubjects: [], assignedClasses: ['کلیه پایه‌ها'], status: 'active', weeklyHours: 30 },

  // General
  { id: 'stf-gen-01', organizationId: 'org-104', staffCode: 'T-301', fullName: 'آقای علی اکبرپور', role: 'teacher', roleTitle: 'آموزگار ارشد ابتدایی', email: 'a.akbarpour@hekmat-edu.ir', phone: '۰۹۱۲۵۵۵۹۹۸۸', assignedSubjects: ['ریاضی ۵', 'علوم ۵'], assignedClasses: ['کلاس ۵/الف ابتدایی'], status: 'active', weeklyHours: 24 },
  { id: 'stf-gen-02', organizationId: 'org-104', staffCode: 'T-302', fullName: 'خانم سمیرا محمدی', role: 'teacher', roleTitle: 'دبیر زبان انگلیسی', email: 's.mohammadi@hekmat-edu.ir', phone: '۰۹۱۲۶۶۶۹۹۸۸', assignedSubjects: ['زبان هشتم', 'زبان دهم'], assignedClasses: ['کلاس ۸/۲ متوسطه اول'], status: 'active', weeklyHours: 20 },
  { id: 'stf-gen-03', organizationId: 'org-104', staffCode: 'T-303', fullName: 'آقای حسن کریمی', role: 'teacher', roleTitle: 'دبیر ادبیات و علوم انسانی', email: 'h.karimi@hekmat-edu.ir', phone: '۰۹۱۲۷۷۷۹۹۸۸', assignedSubjects: ['جامعه‌شناسی', 'منطق'], assignedClasses: ['کلاس ۱۱/۲ علوم انسانی'], status: 'active', weeklyHours: 18 },
];

const DEFAULT_SUBJECTS: Subject[] = [
  // Elementary
  { id: 'sbj-e1', organizationId: 'org-102', code: 'SUB-E1', name: 'فارسی و نگارش', gradeLevel: 'پایه اول', weeklyHours: 6, category: 'core' },
  { id: 'sbj-e2', organizationId: 'org-102', code: 'SUB-E2', name: 'ریاضی ابتدایی', gradeLevel: 'پایه اول', weeklyHours: 5, category: 'core' },
  { id: 'sbj-e3', organizationId: 'org-102', code: 'SUB-E3', name: 'علوم تجربی', gradeLevel: 'پایه دوم', weeklyHours: 3, category: 'lab' },

  // Secondary
  { id: 'sbj-s1', organizationId: 'org-101', code: 'SUB-S1', name: 'حسابان ۲', gradeLevel: 'پایه دوازدهم', weeklyHours: 4, category: 'core' },
  { id: 'sbj-s2', organizationId: 'org-101', code: 'SUB-S2', name: 'هندسه ۳', gradeLevel: 'پایه دوازدهم', weeklyHours: 3, category: 'core' },
  { id: 'sbj-s3', organizationId: 'org-101', code: 'SUB-S3', name: 'زیست‌شناسی ۳', gradeLevel: 'پایه یازدهم', weeklyHours: 4, category: 'lab' },
  { id: 'sbj-s4', organizationId: 'org-101', code: 'SUB-S4', name: 'فیزیک ۲', gradeLevel: 'پایه دهم', weeklyHours: 3, category: 'core' },

  // General
  { id: 'sbj-g1', organizationId: 'org-104', code: 'SUB-G1', name: 'ریاضیات جامع', gradeLevel: 'پایه پنجم', weeklyHours: 4, category: 'core' },
  { id: 'sbj-g2', organizationId: 'org-104', code: 'SUB-G2', name: 'زبان انگلیسی', gradeLevel: 'پایه هشتم', weeklyHours: 3, category: 'general' },
  { id: 'sbj-g3', organizationId: 'org-104', code: 'SUB-G3', name: 'جامعه‌شناسی', gradeLevel: 'پایه یازدهم', weeklyHours: 2, category: 'core' },
];

const DEFAULT_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-e1', organizationId: 'org-102', date: '۱۴۰۲/۱۲/۰۱', studentId: 'std-e1', studentName: 'نازنین‌زهرا عباسی', classId: 'cls-elem-101', status: 'present', recordedBy: 'فاطمه طاهری', submitted: true },
  { id: 'att-e2', organizationId: 'org-102', date: '۱۴۰۲/۱۲/۰۱', studentId: 'std-e2', studentName: 'ثنا محمدی', classId: 'cls-elem-101', status: 'absent', recordedBy: 'فاطمه طاهری', submitted: true, notes: 'اطلاع تلفنی ولی (سرماخوردگی)' },
  { id: 'att-s1', organizationId: 'org-101', date: '۱۴۰۲/۱۲/۰۱', studentId: 'std-s1', studentName: 'امیرحسین رضایی', classId: 'cls-sec-121', status: 'present', recordedBy: 'مریم حسینی', submitted: true },
  { id: 'att-s2', organizationId: 'org-101', date: '۱۴۰۲/۱۲/۰۱', studentId: 'std-s4', studentName: 'سینا احمدی', classId: 'cls-sec-121', status: 'late', recordedBy: 'مریم حسینی', submitted: true, notes: '۱۰ دقیقه تأخیر' },
  { id: 'att-g1', organizationId: 'org-104', date: '۱۴۰۲/۱۲/۰۱', studentId: 'std-g1', studentName: 'سارا احمدی', classId: 'cls-gen-101', status: 'present', recordedBy: 'علی اکبرپور', submitted: true },
];

const DEFAULT_TIMETABLE: TimetableSlot[] = [
  // Secondary
  { id: 'tt-s1', organizationId: 'org-101', classId: 'cls-sec-121', dayOfWeek: 'saturday', periodNumber: 1, timeLabel: '۰۸:۰۰ - ۰۹:۳۰', subjectId: 'sbj-s1', subjectName: 'حسابان ۲', teacherId: 'stf-sec-01', teacherName: 'استاد مریم حسینی', roomNumber: '۲۰۳' },
  { id: 'tt-s2', organizationId: 'org-101', classId: 'cls-sec-121', dayOfWeek: 'saturday', periodNumber: 2, timeLabel: '۱۰:۰۰ - ۱۱:۳۰', subjectId: 'sbj-s2', subjectName: 'هندسه ۳', teacherId: 'stf-sec-01', teacherName: 'استاد مریم حسینی', roomNumber: '۲۰۳' },
  { id: 'tt-s3', organizationId: 'org-101', classId: 'cls-sec-111', dayOfWeek: 'sunday', periodNumber: 1, timeLabel: '۰۸:۰۰ - ۰۹:۳۰', subjectId: 'sbj-s3', subjectName: 'زیست‌شناسی ۳', teacherId: 'stf-sec-02', teacherName: 'دکتر محسن کاظمی', roomNumber: '۲۰۲' },

  // Elementary
  { id: 'tt-e1', organizationId: 'org-102', classId: 'cls-elem-101', dayOfWeek: 'saturday', periodNumber: 1, timeLabel: '۰۸:۳۰ - ۰۹:۴۵', subjectId: 'sbj-e1', subjectName: 'فارسی و نگارش', teacherId: 'stf-elem-01', teacherName: 'خانم فاطمه طاهری', roomNumber: '۱۰۱' },
  { id: 'tt-e2', organizationId: 'org-102', classId: 'cls-elem-101', dayOfWeek: 'saturday', periodNumber: 2, timeLabel: '۱۰:۱۵ - ۱۱:۳۰', subjectId: 'sbj-e2', subjectName: 'ریاضی ابتدایی', teacherId: 'stf-elem-01', teacherName: 'خانم فاطمه طاهری', roomNumber: '۱۰۱' },

  // General
  { id: 'tt-g1', organizationId: 'org-104', classId: 'cls-gen-101', dayOfWeek: 'saturday', periodNumber: 1, timeLabel: '۰۸:۰۰ - ۰۹:۳۰', subjectId: 'sbj-g1', subjectName: 'ریاضیات جامع', teacherId: 'stf-gen-01', teacherName: 'آقای علی اکبرپور', roomNumber: '۳۰۱' },
];

const DEFAULT_EXAMS: Exam[] = [
  { id: 'ex-s1', organizationId: 'org-101', title: 'آزمون میان‌ترم حسابان ۲', subjectId: 'sbj-s1', subjectName: 'حسابان ۲', gradeLevel: 'پایه دوازدهم', classIds: ['cls-sec-121'], examDate: '۱۴۰۲/۱۲/۱۵', startTime: '۰۹:۰۰', durationMinutes: 90, maxScore: 20, term: 'midterm_2', status: 'scheduled', evalType: 'numeric' },
  { id: 'ex-s2', organizationId: 'org-101', title: 'امتحان مستمر زیست‌شناسی ۳', subjectId: 'sbj-s3', subjectName: 'زیست‌شناسی ۳', gradeLevel: 'پایه یازدهم', classIds: ['cls-sec-111'], examDate: '۱۴۰۲/۱۲/۱۰', startTime: '۱۰:۳۰', durationMinutes: 60, maxScore: 20, term: 'term_1', status: 'completed', evalType: 'numeric' },

  { id: 'ex-e1', organizationId: 'org-102', title: 'ارزشیابی توصیفی ریاضی اول', subjectId: 'sbj-e2', subjectName: 'ریاضی ابتدایی', gradeLevel: 'پایه اول', classIds: ['cls-elem-101'], examDate: '۱۴۰۲/۱۲/۱۲', startTime: '۰۹:۰۰', durationMinutes: 45, maxScore: 4, term: 'term_1', status: 'published', evalType: 'descriptive' },

  { id: 'ex-g1', organizationId: 'org-104', title: 'آزمون ریاضی پایه پنجم', subjectId: 'sbj-g1', subjectName: 'ریاضیات جامع', gradeLevel: 'پایه پنجم', classIds: ['cls-gen-101'], examDate: '۱۴۰۲/۱۲/۱۸', startTime: '۰۹:۳۰', durationMinutes: 60, maxScore: 20, term: 'term_1', status: 'scheduled', evalType: 'numeric' },
];

const DEFAULT_GRADES: StudentGrade[] = [
  { id: 'grd-1', organizationId: 'org-101', examId: 'ex-s2', studentId: 'std-s2', score: 18.5, feedback: 'عملکرد عالی در بخش سوالات تشریحی', updatedAt: '۱۴۰۲/۱۲/۱۱' },
  { id: 'grd-2', organizationId: 'org-102', examId: 'ex-e1', studentId: 'std-e1', descriptiveScore: 'خیلی خوب', feedback: 'دقت بالا در شمارش و الگویابی', updatedAt: '۱۴۰۲/۱۲/۱۳' },
  { id: 'grd-3', organizationId: 'org-102', examId: 'ex-e1', studentId: 'std-e2', descriptiveScore: 'خوب', feedback: 'نیازمند تمرین بیشتر در تفریق', updatedAt: '۱۴۰۲/۱۲/۱۳' },
];

const DEFAULT_COUNSELING: CounselingReferral[] = [
  { id: 'cns-1', organizationId: 'org-101', studentId: 'std-s1', studentName: 'امیرحسین رضایی', className: 'کلاس ۱۲/۱ ریاضی', referredBy: 'استاد مریم حسینی', referralDate: '۱۴۰۲/۱۱/۲۸', reason: 'کاهش نمره‌ی مستمر در درس حسابان و استرس کنکور', priority: 'high', status: 'in_progress', counselorName: 'دکتر سارا کریمی', scheduledAppointment: '۱۴۰۲/۱۲/۰۵ - ساعت ۱۱:۰۰', privateNotes: 'جلسه اول برگزار شد. برنامه‌ریزی مطالعه مطالعاتی ارائه گردید.' },
  { id: 'cns-2', organizationId: 'org-101', studentId: 'std-s3', studentName: 'پویا مرادی', className: 'کلاس ۱۰/۱ ریاضی', referredBy: 'معاون انضباطی', referralDate: '۱۴۰۲/۱۲/۰۲', reason: 'تأخیرهای متوالی ورودی صبح', priority: 'medium', status: 'pending', counselorName: 'دکتر سارا کریمی' },
];

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  { id: 'anc-1', organizationId: 'org-102', title: 'برگزاری جشن شکرگزاری حروف الفبا', content: 'اولیا محترم پایه اول، مراسم جشن الفبا روز سه‌شنبه برگزار خواهد شد.', audience: 'parents', targetGrade: 'پایه اول', authorName: 'مدیر دبستان آفتاب', createdAt: '۱۴۰۲/۱۲/۰۲', isPublished: true, priority: 'important' },
  { id: 'anc-2', organizationId: 'org-101', title: 'جدول زمانی امتحانات شبه‌نهایی کنکور', content: 'برنامه‌ زمانی آزمون‌های آزمایشی پایه دوازدهم روی سامانه قرار گرفت.', audience: 'all', authorName: 'دکتر علیرضا رضایی', createdAt: '۱۴۰۲/۱۲/۰۱', isPublished: true, priority: 'urgent' },
  { id: 'anc-3', organizationId: 'org-104', title: 'جلسه عمومی انجمن اولیا و مربیان', content: 'از کلیه اولیای گرامی دعوت می‌شود در نشست ماهانه مجتمع شرکت نمایند.', audience: 'parents', authorName: 'مدیر مجتمع حکمت', createdAt: '۱۴۰۲/۱۱/۳۰', isPublished: true, priority: 'normal' },
];

const DEFAULT_SETTINGS: Record<string, SchoolSettings> = {
  'org-101': { organizationId: 'org-101', schoolName: 'دبیرستان هوشمند البرز', principalName: 'دکتر علیرضا رضایی', phone: '۰۲۱-۸۸۹۹۰۰۱۱', address: 'تهران، خیابان انقلاب، خیابان البرز', academicYear: '۱۴۰۳ - ۱۴۰۲', termName: 'نیم‌سال دوم', allowParentMessaging: true, autoAttendanceAlerts: true, passingScore: 10 },
  'org-102': { organizationId: 'org-102', schoolName: 'دبستان و پیش‌دبستانی آفتاب', principalName: 'خانم علیرضا رضایی (سرپرست)', phone: '۰۲۱-۲۲۳۳۴۴۵۵', address: 'تهران، پاسداران، بوستان چهارم', academicYear: '۱۴۰۳ - ۱۴۰۲', termName: 'ترم دوم', allowParentMessaging: true, autoAttendanceAlerts: true, passingScore: 7 },
  'org-104': { organizationId: 'org-104', schoolName: 'مجتمع آموزشی جامع حکمت', principalName: 'دکتر علیرضا رضایی', phone: '۰۲۱-۴۴۵۵۶۶۷۷', address: 'تهران، شهرک غرب، بلوار دادمان', academicYear: '۱۴۰۳ - ۱۴۰۲', termName: 'نیم‌سال دوم', allowParentMessaging: true, autoAttendanceAlerts: true, passingScore: 10 },
};

class SchoolStoreService {
  private state: SchoolDataState;

  constructor() {
    this.state = this.loadStateFromStorage();
  }

  private loadStateFromStorage(): SchoolDataState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PREFIX + 'state');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          students: parsed.students || DEFAULT_STUDENTS,
          staff: parsed.staff || DEFAULT_STAFF,
          classes: parsed.classes || DEFAULT_CLASSES,
          subjects: parsed.subjects || DEFAULT_SUBJECTS,
          attendance: parsed.attendance || DEFAULT_ATTENDANCE,
          timetable: parsed.timetable || DEFAULT_TIMETABLE,
          exams: parsed.exams || DEFAULT_EXAMS,
          grades: parsed.grades || DEFAULT_GRADES,
          counseling: parsed.counseling || DEFAULT_COUNSELING,
          announcements: parsed.announcements || DEFAULT_ANNOUNCEMENTS,
          settings: parsed.settings || DEFAULT_SETTINGS,
        };
      }
    } catch (e) {
      console.warn('پایگاه داده محلی مقداردهی اولیه شد.', e);
    }

    return {
      students: DEFAULT_STUDENTS,
      staff: DEFAULT_STAFF,
      classes: DEFAULT_CLASSES,
      subjects: DEFAULT_SUBJECTS,
      attendance: DEFAULT_ATTENDANCE,
      timetable: DEFAULT_TIMETABLE,
      exams: DEFAULT_EXAMS,
      grades: DEFAULT_GRADES,
      counseling: DEFAULT_COUNSELING,
      announcements: DEFAULT_ANNOUNCEMENTS,
      settings: DEFAULT_SETTINGS,
    };
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'state', JSON.stringify(this.state));
    } catch (e) {
      console.error('خطا در ذخیره‌سازی داده‌ها در حافظه محلی:', e);
    }
  }

  public resetDemoData(): void {
    this.state = {
      students: [...DEFAULT_STUDENTS],
      staff: [...DEFAULT_STAFF],
      classes: [...DEFAULT_CLASSES],
      subjects: [...DEFAULT_SUBJECTS],
      attendance: [...DEFAULT_ATTENDANCE],
      timetable: [...DEFAULT_TIMETABLE],
      exams: [...DEFAULT_EXAMS],
      grades: [...DEFAULT_GRADES],
      counseling: [...DEFAULT_COUNSELING],
      announcements: [...DEFAULT_ANNOUNCEMENTS],
      settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
    };
    this.saveState();
  }

  private recalculateClassStudentCounts(organizationId: string): void {
    this.state.classes = this.state.classes.map((cls) => {
      if (cls.organizationId === organizationId) {
        const count = this.state.students.filter((s) => s.classId === cls.id && s.status === 'active').length;
        return { ...cls, studentCount: count };
      }
      return cls;
    });
  }

  // --- Students ---
  public getStudents(orgId: string): Student[] {
    return this.state.students.filter((s) => s.organizationId === orgId);
  }

  public addStudent(student: Omit<Student, 'id'>): Student {
    const newStudent: Student = {
      ...student,
      id: 'std-' + Date.now().toString(36),
    };
    this.state.students.unshift(newStudent);
    this.recalculateClassStudentCounts(student.organizationId);
    this.saveState();
    return newStudent;
  }

  public updateStudent(id: string, updates: Partial<Student>): Student | null {
    const idx = this.state.students.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    this.state.students[idx] = { ...this.state.students[idx]!, ...updates };
    const orgId = this.state.students[idx]!.organizationId;
    this.recalculateClassStudentCounts(orgId);
    this.saveState();
    return this.state.students[idx]!;
  }

  public deleteStudent(id: string): boolean {
    const std = this.state.students.find((s) => s.id === id);
    if (!std) return false;

    this.state.students = this.state.students.filter((s) => s.id !== id);
    this.recalculateClassStudentCounts(std.organizationId);
    this.saveState();
    return true;
  }

  // --- Staff ---
  public getStaff(orgId: string): StaffMember[] {
    return this.state.staff.filter((st) => st.organizationId === orgId);
  }

  public addStaff(staff: Omit<StaffMember, 'id'>): StaffMember {
    const newMember: StaffMember = {
      ...staff,
      id: 'stf-' + Date.now().toString(36),
    };
    this.state.staff.unshift(newMember);
    this.saveState();
    return newMember;
  }

  public updateStaff(id: string, updates: Partial<StaffMember>): StaffMember | null {
    const idx = this.state.staff.findIndex((st) => st.id === id);
    if (idx === -1) return null;

    this.state.staff[idx] = { ...this.state.staff[idx]!, ...updates };
    this.saveState();
    return this.state.staff[idx]!;
  }

  public deleteStaff(id: string): boolean {
    const count = this.state.staff.length;
    this.state.staff = this.state.staff.filter((st) => st.id !== id);
    if (this.state.staff.length !== count) {
      this.saveState();
      return true;
    }
    return false;
  }

  // --- Classes ---
  public getClasses(orgId: string): SchoolClass[] {
    return this.state.classes.filter((c) => c.organizationId === orgId);
  }

  public addClass(cls: Omit<SchoolClass, 'id' | 'studentCount'>): SchoolClass {
    const newClass: SchoolClass = {
      ...cls,
      id: 'cls-' + Date.now().toString(36),
      studentCount: 0,
    };
    this.state.classes.push(newClass);
    this.saveState();
    return newClass;
  }

  public updateClass(id: string, updates: Partial<SchoolClass>): SchoolClass | null {
    const idx = this.state.classes.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    this.state.classes[idx] = { ...this.state.classes[idx]!, ...updates };
    this.saveState();
    return this.state.classes[idx]!;
  }

  // --- Subjects ---
  public getSubjects(orgId: string): Subject[] {
    return this.state.subjects.filter((sb) => sb.organizationId === orgId);
  }

  public addSubject(sbj: Omit<Subject, 'id'>): Subject {
    const newSbj: Subject = {
      ...sbj,
      id: 'sbj-' + Date.now().toString(36),
    };
    this.state.subjects.push(newSbj);
    this.saveState();
    return newSbj;
  }

  // --- Attendance ---
  public getAttendance(orgId: string): AttendanceRecord[] {
    return this.state.attendance.filter((att) => att.organizationId === orgId);
  }

  public recordAttendance(
    orgId: string,
    classId: string,
    date: string,
    entries: { studentId: string; studentName: string; status: AttendanceStatus; notes?: string }[],
    recorderName: string
  ): void {
    // Filter existing attendance for same class & date
    this.state.attendance = this.state.attendance.filter(
      (a) => !(a.organizationId === orgId && a.classId === classId && a.date === date)
    );

    entries.forEach((e) => {
      const rec: AttendanceRecord = {
        id: 'att-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        organizationId: orgId,
        date,
        studentId: e.studentId,
        studentName: e.studentName,
        classId,
        status: e.status,
        recordedBy: recorderName,
        submitted: true,
      };
      if (e.notes) rec.notes = e.notes;
      this.state.attendance.push(rec);
    });

    this.saveState();
  }

  // --- Timetable ---
  public getTimetable(orgId: string): TimetableSlot[] {
    return this.state.timetable.filter((tt) => tt.organizationId === orgId);
  }

  public addTimetableSlot(slot: Omit<TimetableSlot, 'id'>): TimetableSlot {
    const newSlot: TimetableSlot = {
      ...slot,
      id: 'tt-' + Date.now().toString(36),
    };
    this.state.timetable.push(newSlot);
    this.saveState();
    return newSlot;
  }

  public checkTimetableConflict(
    orgId: string,
    dayOfWeek: TimetableSlot['dayOfWeek'],
    periodNumber: number,
    classId: string,
    teacherId: string,
    excludeId?: string
  ): { hasConflict: boolean; reason?: string } {
    const slots = this.getTimetable(orgId).filter((s) => s.id !== excludeId);

    const classConflict = slots.find((s) => s.classId === classId && s.dayOfWeek === dayOfWeek && s.periodNumber === periodNumber);
    if (classConflict) {
      return { hasConflict: true, reason: `کلاس در زنگ ${periodNumber} روز انتخابی دارای درس «${classConflict.subjectName}» است.` };
    }

    const teacherConflict = slots.find((s) => s.teacherId === teacherId && s.dayOfWeek === dayOfWeek && s.periodNumber === periodNumber);
    if (teacherConflict) {
      return { hasConflict: true, reason: `استاد انتخابی (${teacherConflict.teacherName}) در این زنگ در کلاس دیگری مشغول به تدریس است.` };
    }

    return { hasConflict: false };
  }

  // --- Exams & Grades ---
  public getExams(orgId: string): Exam[] {
    return this.state.exams.filter((ex) => ex.organizationId === orgId);
  }

  public addExam(exam: Omit<Exam, 'id'>): Exam {
    const newExam: Exam = {
      ...exam,
      id: 'ex-' + Date.now().toString(36),
    };
    this.state.exams.unshift(newExam);
    this.saveState();
    return newExam;
  }

  public updateExam(id: string, updates: Partial<Exam>): Exam | null {
    const idx = this.state.exams.findIndex((e) => e.id === id);
    if (idx === -1) return null;

    this.state.exams[idx] = { ...this.state.exams[idx]!, ...updates };
    this.saveState();
    return this.state.exams[idx]!;
  }

  public getGradesForExam(orgId: string, examId: string): StudentGrade[] {
    return this.state.grades.filter((g) => g.organizationId === orgId && g.examId === examId);
  }

  public saveStudentGrades(orgId: string, examId: string, gradesList: Omit<StudentGrade, 'id' | 'organizationId' | 'examId' | 'updatedAt'>[]): void {
    // Remove existing for this exam
    this.state.grades = this.state.grades.filter((g) => !(g.organizationId === orgId && g.examId === examId));

    const dateStr = new Date().toLocaleDateString('fa-IR');
    gradesList.forEach((g) => {
      const rec: StudentGrade = {
        id: 'grd-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        organizationId: orgId,
        examId,
        studentId: g.studentId,
        updatedAt: dateStr,
      };
      if (g.score !== undefined) rec.score = g.score;
      if (g.descriptiveScore !== undefined) rec.descriptiveScore = g.descriptiveScore;
      if (g.feedback) rec.feedback = g.feedback;

      this.state.grades.push(rec);
    });

    // Update exam status to completed if appropriate
    const exam = this.state.exams.find((e) => e.id === examId);
    if (exam && exam.status === 'scheduled') {
      exam.status = 'grading';
    }

    this.saveState();
  }

  // --- Counseling ---
  public getCounselingReferrals(orgId: string): CounselingReferral[] {
    return this.state.counseling.filter((c) => c.organizationId === orgId);
  }

  public addCounselingReferral(ref: Omit<CounselingReferral, 'id'>): CounselingReferral {
    const newRef: CounselingReferral = {
      ...ref,
      id: 'cns-' + Date.now().toString(36),
    };
    this.state.counseling.unshift(newRef);
    this.saveState();
    return newRef;
  }

  public updateCounselingStatus(id: string, status: CounselingReferral['status'], notes?: string): void {
    const item = this.state.counseling.find((c) => c.id === id);
    if (item) {
      item.status = status;
      if (notes) item.privateNotes = notes;
      this.saveState();
    }
  }

  // --- Announcements ---
  public getAnnouncements(orgId: string): Announcement[] {
    return this.state.announcements.filter((a) => a.organizationId === orgId);
  }

  public addAnnouncement(ann: Omit<Announcement, 'id' | 'createdAt'>): Announcement {
    const newAnn: Announcement = {
      ...ann,
      id: 'anc-' + Date.now().toString(36),
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };
    this.state.announcements.unshift(newAnn);
    this.saveState();
    return newAnn;
  }

  public updateAnnouncement(id: string, updates: Partial<Announcement>): Announcement | null {
    const idx = this.state.announcements.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    this.state.announcements[idx] = { ...this.state.announcements[idx]!, ...updates };
    this.saveState();
    return this.state.announcements[idx]!;
  }

  // --- Settings ---
  public getSettings(orgId: string): SchoolSettings {
    if (this.state.settings[orgId]) {
      return this.state.settings[orgId]!;
    }
    const defaultSetting: SchoolSettings = {
      organizationId: orgId,
      schoolName: 'مرکز آموزشی پولاریس',
      principalName: 'مدیر مرکز',
      phone: '۰۲۱-۱۲۳۴۵۶۷۸',
      address: 'تهران، خیابان اصلی',
      academicYear: '۱۴۰۳ - ۱۴۰۲',
      termName: 'ترم جاری',
      allowParentMessaging: true,
      autoAttendanceAlerts: true,
      passingScore: 10,
    };
    this.state.settings[orgId] = defaultSetting;
    return defaultSetting;
  }

  public updateSettings(orgId: string, settings: Partial<SchoolSettings>): SchoolSettings {
    const current = this.getSettings(orgId);
    this.state.settings[orgId] = { ...current, ...settings };
    this.saveState();
    return this.state.settings[orgId]!;
  }
}

export const schoolStore = new SchoolStoreService();
