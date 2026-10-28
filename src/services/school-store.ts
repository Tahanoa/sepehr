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
  Assignment,
  HomeworkSubmission,
  LearningMaterial,
  ExamQuestion,
  StudentExamAttempt,
  InstituteApplication,
  TuitionInvoice,
  DirectMessage,
  SMSNotificationLog,
  SupportTicket,
} from '../types/school';

const STORAGE_KEY_PREFIX = 'polaris_school_store_v2_';

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
  assignments: Assignment[];
  submissions: HomeworkSubmission[];
  materials: LearningMaterial[];
  examQuestions: ExamQuestion[];
  examAttempts: StudentExamAttempt[];
  applications: InstituteApplication[];
  invoices: TuitionInvoice[];
  messages: DirectMessage[];
  smsLogs: SMSNotificationLog[];
  supportTickets: SupportTicket[];
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

  // Institute org-103
  { id: 'cls-inst-101', organizationId: 'org-103', code: 'I-101', name: 'دوره جامع زبان انگلیسی (IELTS Master)', gradeLevel: 'سطح پیشرفته C1', homeroomTeacherId: 'stf-inst-01', homeroomTeacherName: 'استاد سعید تهرانی', capacity: 20, studentCount: 15, roomNumber: 'کلاس آنلاین ۴' },
  { id: 'cls-inst-102', organizationId: 'org-103', code: 'I-102', name: 'دوره مکالمه فشرده آلمانی B1', gradeLevel: 'سطح متوسط', homeroomTeacherId: 'stf-inst-02', homeroomTeacherName: 'استاد مریم کاظمی', capacity: 18, studentCount: 12, roomNumber: 'سالن همایش B' },

  // General org-104
  { id: 'cls-gen-101', organizationId: 'org-104', code: 'G-101', name: 'کلاس ۵/الف ابتدایی', gradeLevel: 'پایه پنجم', homeroomTeacherId: 'stf-gen-01', homeroomTeacherName: 'آقای علی اکبرپور', capacity: 28, studentCount: 25, roomNumber: '۳۰۱' },
];

const DEFAULT_STUDENTS: Student[] = [
  // Elementary org-102
  { id: 'std-e1', organizationId: 'org-102', studentCode: '۴۰۲۱۰۱۰۱', fullName: 'نازنین‌زهرا عباسی', nationalId: '۰۰۲۱۴۵۸۷۹۶', gradeLevel: 'پایه اول', className: 'کلاس ۱/الف (شکوفه‌ها)', classId: 'cls-elem-101', guardianName: 'امیر عباسی', guardianRelation: 'پدر', guardianPhone: '۰۹۱۲۱۱۱۰۰۱۱', gender: 'female', status: 'active', enrollmentDate: '۱۴۰۲/۰۷/۰۱', notes: 'نیازمند تشویق صوتی' },
  { id: 'std-e2', organizationId: 'org-102', studentCode: '۴۰۲۱۰۱۰۲', fullName: 'ثنا محمدی', nationalId: '۰۰۲۱۴۵۸۷۹۷', gradeLevel: 'پایه اول', className: 'کلاس ۱/الف (شکوفه‌ها)', classId: 'cls-elem-101', guardianName: 'سعید محمدی', guardianRelation: 'پدر', guardianPhone: '۰۹۱۲۱۱۱۰۰۲۲', gender: 'female', status: 'active', enrollmentDate: '۱۴۰۲/۰۷/۰۱' },

  // Secondary org-101
  { id: 'std-s1', organizationId: 'org-101', studentCode: '۴۰۲۲۰۱۰۱', fullName: 'امیرحسین رضایی', nationalId: '۰۰۱۹۸۷۶۵۴۳', gradeLevel: 'پایه دوازدهم', className: 'کلاس ۱۲/۱ ریاضی (کنکور)', classId: 'cls-sec-121', guardianName: 'رضا رضایی', guardianRelation: 'پدر', guardianPhone: '۰۹۱۲۴۴۴۵۵۶۶', gender: 'male', status: 'active', enrollmentDate: '۱۴۰۲/۰۷/۰۱' },
  { id: 'std-s2', organizationId: 'org-101', studentCode: '۴۰۲۲۰۱۰۲', fullName: 'محمدجواد حسینی', nationalId: '۰۰۱۹۸۷۶۵۴۴', gradeLevel: 'پایه یازدهم', className: 'کلاس ۱۱/۱ تجربی', classId: 'cls-sec-111', guardianName: 'علی حسینی', guardianRelation: 'پدر', guardianPhone: '۰۹۱۲۵۵۵۶۶۷۷', gender: 'male', status: 'active', enrollmentDate: '۱۴۰۲/۰۷/۰۱' },
  { id: 'std-s3', organizationId: 'org-101', studentCode: '۴۰۲۲۰۱۰۳', fullName: 'پویا مرادی', nationalId: '۰۰۱۹۸۷۶۵۴۵', gradeLevel: 'پایه دهم', className: 'کلاس ۱۰/۱ ریاضی', classId: 'cls-sec-101', guardianName: 'فرزاد مرادی', guardianRelation: 'پدر', guardianPhone: '۰۹۱۲۶۶۶۷۷۸۸', gender: 'male', status: 'active', enrollmentDate: '۱۴۰۲/۰۷/۰۱' },

  // Institute org-103
  { id: 'std-inst-1', organizationId: 'org-103', studentCode: 'INST-001', fullName: 'پارسا تهرانی', nationalId: '۰۰۲۵۴۱۸۷۹۰', gradeLevel: 'سطح پیشرفته C1', className: 'دوره جامع زبان انگلیسی (IELTS Master)', classId: 'cls-inst-101', guardianName: 'حمید تهرانی', guardianRelation: 'پدر', guardianPhone: '۰۹۱۲۹۹۹۸۸۷۷', gender: 'male', status: 'active', enrollmentDate: '۱۴۰۳/۰۱/۱۰' },
  { id: 'std-inst-2', organizationId: 'org-103', studentCode: 'INST-002', fullName: 'کیمیا رضایی', nationalId: '۰۰۲۵۴۱۸۷۹۱', gradeLevel: 'سطح متوسط', className: 'دوره مکالمه فشرده آلمانی B1', classId: 'cls-inst-102', guardianName: 'زهرا کاظمی', guardianRelation: 'مادر', guardianPhone: '۰۹۱۲۸۸۸۷۷۶۶', gender: 'female', status: 'active', enrollmentDate: '۱۴۰۳/۰۱/۱۲' },
];

const DEFAULT_STAFF: StaffMember[] = [
  // Elementary
  { id: 'stf-elem-01', organizationId: 'org-102', staffCode: 'T-101', fullName: 'خانم فاطمه طاهری', role: 'teacher', roleTitle: 'معلم آموزگار پایه اول', email: 'f.taheri@sun-sch.ir', phone: '۰۹۱۲۱۱۱۸۸۷۷', assignedSubjects: ['فارسی اول', 'ریاضی اول', 'علوم اول'], assignedClasses: ['کلاس ۱/الف (شکوفه‌ها)'], status: 'active', weeklyHours: 24 },
  { id: 'stf-elem-02', organizationId: 'org-102', staffCode: 'T-102', fullName: 'خانم مریم نوری', role: 'teacher', roleTitle: 'معلم آموزگار پایه دوم', email: 'm.nouri@sun-sch.ir', phone: '۰۹۱۲۲۲۲۸۸۷۷', assignedSubjects: ['فارسی دوم', 'ریاضی دوم'], assignedClasses: ['کلاس ۲/ب (یاس)'], status: 'active', weeklyHours: 24 },

  // Secondary
  { id: 'stf-sec-01', organizationId: 'org-101', staffCode: 'T-201', fullName: 'استاد مریم حسینی', role: 'teacher', roleTitle: 'دبیر ارشد حسابان و هندسه', email: 'm.hosseini@alborz-sch.ir', phone: '۰۹۱۲۲۲۲۳۳۴۴', assignedSubjects: ['حسابان ۲', 'هندسه ۳', 'ریاضی ۱۰'], assignedClasses: ['کلاس ۱۰/۱ ریاضی', 'کلاس ۱۲/۱ ریاضی'], status: 'active', weeklyHours: 22 },
  { id: 'stf-sec-02', organizationId: 'org-101', staffCode: 'T-202', fullName: 'دکتر محسن کاظمی', role: 'teacher', roleTitle: 'دبیر زیست‌شناسی و شیمی', email: 'm.kazemi@alborz-sch.ir', phone: '۰۹۱۲۴۴۴۸۸۷۷', assignedSubjects: ['زیست ۳', 'شیمی ۲'], assignedClasses: ['کلاس ۱۱/۱ تجربی'], status: 'active', weeklyHours: 20 },
  { id: 'stf-sec-03', organizationId: 'org-101', staffCode: 'T-203', fullName: 'دکتر سارا کریمی', role: 'counselor', roleTitle: 'مشاور تحصیلی و کنکور', email: 's.karimi@alborz-sch.ir', phone: '۰۹۱۲۵۵۵۶۶۷۷', assignedSubjects: [], assignedClasses: ['کلیه پایه‌ها'], status: 'active', weeklyHours: 30 },

  // Institute
  { id: 'stf-inst-01', organizationId: 'org-103', staffCode: 'INS-101', fullName: 'استاد سعید تهرانی', role: 'teacher', roleTitle: 'مدرس ارشد آیلتس و زبان انگلیسی', email: 's.tehrani@daneshnik.ir', phone: '۰۹۱۲۷۷۷۸۸۹۹', assignedSubjects: ['IELTS Speaking & Writing', 'English Grammar'], assignedClasses: ['دوره جامع زبان انگلیسی (IELTS Master)'], status: 'active', weeklyHours: 18 },
  { id: 'stf-inst-02', organizationId: 'org-103', staffCode: 'INS-102', fullName: 'استاد مریم کاظمی', role: 'teacher', roleTitle: 'مدرس زبان آلمانی', email: 'm.kazemi@daneshnik.ir', phone: '۰۹۱۲۶۶۶۵۵۴۴', assignedSubjects: ['German B1 Conversation'], assignedClasses: ['دوره مکالمه فشرده آلمانی B1'], status: 'active', weeklyHours: 16 },
];

const DEFAULT_SUBJECTS: Subject[] = [
  // Elementary
  { id: 'sbj-e1', organizationId: 'org-102', code: 'SUB-E1', name: 'فارسی و نگارش', gradeLevel: 'پایه اول', weeklyHours: 6, category: 'core' },
  { id: 'sbj-e2', organizationId: 'org-102', code: 'SUB-E2', name: 'ریاضی ابتدایی', gradeLevel: 'پایه اول', weeklyHours: 5, category: 'core' },

  // Secondary
  { id: 'sbj-s1', organizationId: 'org-101', code: 'SUB-S1', name: 'حسابان ۲', gradeLevel: 'پایه دوازدهم', weeklyHours: 4, category: 'core' },
  { id: 'sbj-s2', organizationId: 'org-101', code: 'SUB-S2', name: 'هندسه ۳', gradeLevel: 'پایه دوازدهم', weeklyHours: 3, category: 'core' },
  { id: 'sbj-s3', organizationId: 'org-101', code: 'SUB-S3', name: 'زیست‌شناسی ۳', gradeLevel: 'پایه یازدهم', weeklyHours: 4, category: 'lab' },

  // Institute
  { id: 'sbj-i1', organizationId: 'org-103', code: 'SUB-I1', name: 'مهارت نگارش و مکالمه آیلتس', gradeLevel: 'پیشرفته C1', weeklyHours: 6, category: 'core' },
  { id: 'sbj-i2', organizationId: 'org-103', code: 'SUB-I2', name: 'مکالمه آلمانی B1', gradeLevel: 'متوسط', weeklyHours: 4, category: 'core' },
];

const DEFAULT_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-e1', organizationId: 'org-102', date: '۱۴۰۲/۱۲/۰۱', studentId: 'std-e1', studentName: 'نازنین‌زهرا عباسی', classId: 'cls-elem-101', status: 'present', recordedBy: 'فاطمه طاهری', submitted: true },
  { id: 'att-e2', organizationId: 'org-102', date: '۱۴۰۲/۱۲/۰۱', studentId: 'std-e2', studentName: 'ثنا محمدی', classId: 'cls-elem-101', status: 'absent', recordedBy: 'فاطمه طاهری', submitted: true, notes: 'اطلاع تلفنی ولی (سرماخوردگی)' },
  { id: 'att-s1', organizationId: 'org-101', date: '۱۴۰۲/۱۲/۰۱', studentId: 'std-s1', studentName: 'امیرحسین رضایی', classId: 'cls-sec-121', status: 'present', recordedBy: 'مریم حسینی', submitted: true },
  { id: 'att-inst-1', organizationId: 'org-103', date: '۱۴۰۳/۰۱/۱۵', studentId: 'std-inst-1', studentName: 'پارسا تهرانی', classId: 'cls-inst-101', status: 'present', recordedBy: 'سعید تهرانی', submitted: true },
];

const DEFAULT_TIMETABLE: TimetableSlot[] = [
  { id: 'tt-s1', organizationId: 'org-101', classId: 'cls-sec-121', dayOfWeek: 'saturday', periodNumber: 1, timeLabel: '۰۸:۰۰ - ۰۹:۳۰', subjectId: 'sbj-s1', subjectName: 'حسابان ۲', teacherId: 'stf-sec-01', teacherName: 'استاد مریم حسینی', roomNumber: '۲۰۳' },
  { id: 'tt-s2', organizationId: 'org-101', classId: 'cls-sec-121', dayOfWeek: 'saturday', periodNumber: 2, timeLabel: '۱۰:۰۰ - ۱۱:۳۰', subjectId: 'sbj-s2', subjectName: 'هندسه ۳', teacherId: 'stf-sec-01', teacherName: 'استاد مریم حسینی', roomNumber: '۲۰۳' },
  { id: 'tt-e1', organizationId: 'org-102', classId: 'cls-elem-101', dayOfWeek: 'saturday', periodNumber: 1, timeLabel: '۰۸:۳۰ - ۰۹:۴۵', subjectId: 'sbj-e1', subjectName: 'فارسی و نگارش', teacherId: 'stf-elem-01', teacherName: 'خانم فاطمه طاهری', roomNumber: '۱۰۱' },
  { id: 'tt-inst-1', organizationId: 'org-103', classId: 'cls-inst-101', dayOfWeek: 'saturday', periodNumber: 1, timeLabel: '۱۶:۰۰ - ۱۸:۰۰', subjectId: 'sbj-i1', subjectName: 'مهارت نگارش و مکالمه آیلتس', teacherId: 'stf-inst-01', teacherName: 'استاد سعید تهرانی', roomNumber: 'کلاس آنلاین ۴' },
];

const DEFAULT_EXAMS: Exam[] = [
  { id: 'ex-s1', organizationId: 'org-101', title: 'آزمون میان‌ترم حسابان ۲', subjectId: 'sbj-s1', subjectName: 'حسابان ۲', gradeLevel: 'پایه دوازدهم', classIds: ['cls-sec-121'], examDate: '۱۴۰۲/۱۲/۱۵', startTime: '۰۹:۰۰', durationMinutes: 90, maxScore: 20, term: 'midterm_2', status: 'published', evalType: 'numeric' },
  { id: 'ex-e1', organizationId: 'org-102', title: 'ارزشیابی توصیفی ریاضی اول', subjectId: 'sbj-e2', subjectName: 'ریاضی ابتدایی', gradeLevel: 'پایه اول', classIds: ['cls-elem-101'], examDate: '۱۴۰۲/۱۲/۱۲', startTime: '۰۹:۰۰', durationMinutes: 45, maxScore: 4, term: 'term_1', status: 'published', evalType: 'descriptive' },
  { id: 'ex-i1', organizationId: 'org-103', title: 'کوییز سنجش سطح آیلتس (IELTS Mock)', subjectId: 'sbj-i1', subjectName: 'مهارت نگارش و مکالمه آیلتس', gradeLevel: 'پیشرفته C1', classIds: ['cls-inst-101'], examDate: '۱۴۰۳/۰۱/۲۰', startTime: '۱۷:۰۰', durationMinutes: 60, maxScore: 100, term: 'term_1', status: 'published', evalType: 'numeric' },
];

const DEFAULT_EXAM_QUESTIONS: ExamQuestion[] = [
  {
    id: 'q-s1-1',
    examId: 'ex-s1',
    type: 'mcq',
    prompt: 'مشتق تابع f(x) = x^3 - 3x در نقطه x = 2 برابر کدام است؟',
    points: 5,
    options: [
      { id: 'opt-1', text: '۹' },
      { id: 'opt-2', text: '۱۲' },
      { id: 'opt-3', text: '۶' },
      { id: 'opt-4', text: '۳' },
    ],
    correctOptionId: 'opt-1',
  },
  {
    id: 'q-s1-2',
    examId: 'ex-s1',
    type: 'descriptive',
    prompt: 'با استفاده از تعریف مشتق (حد کسر پیشرفت)، مشتق تابع g(x) = 2x^2 + 1 را در نقطه x = a محاسبه و اثبات نمایید.',
    points: 15,
    referenceAnswer: 'حد [g(a+h) - g(a)] / h وقتی h به صفر میل می‌کند محاسبه می‌شود: g(a+h) = 2(a+h)^2 + 1 = 2a^2 + 4ah + 2h^2 + 1. کسر حاصل ۲a^2 + 4ah + 2h^2 + 1 - 2a^2 - 1 = 4ah + 2h^2. با تقسیم بر h حاصل برابر 4a + 2h است که در حد h->0 برابر 4a خواهد بود.',
    rubricCriteria: [
      { id: 'rc-1', title: 'فرمول‌بندی صحیح تعریف مشتق', maxPoints: 5, description: 'نوشتن حد کسر تفاضلی به شکل درست' },
      { id: 'rc-2', title: 'جای‌گذاری و ساده‌سازی جبر', maxPoints: 5, description: 'ساده کردن عبارت با فاکتورگیری از h' },
      { id: 'rc-3', title: 'محاسبه نهایی حد و پاسخ درست', maxPoints: 5, description: 'رسیدن به جواب 4a با استدلال کامل' },
    ],
  },
];

const DEFAULT_GRADES: StudentGrade[] = [
  { id: 'grd-1', organizationId: 'org-101', examId: 'ex-s1', studentId: 'std-s1', score: 19, feedback: 'پاسخ عالی و با دقت بالایی نوشته شده است.', updatedAt: '۱۴۰۲/۱۲/۱۶' },
  { id: 'grd-2', organizationId: 'org-102', examId: 'ex-e1', studentId: 'std-e1', descriptiveScore: 'خیلی خوب', feedback: 'دقت بالا در شمارش و الگویابی', updatedAt: '۱۴۰۲/۱۲/۱۳' },
];

const DEFAULT_ASSIGNMENTS: Assignment[] = [
  { id: 'asg-s1', organizationId: 'org-101', classId: 'cls-sec-121', className: 'کلاس ۱۲/۱ ریاضی (کنکور)', subjectId: 'sbj-s1', subjectName: 'حسابان ۲', title: 'حل مسائل فصل مشتق و کاربردها', description: 'تمرینات شماره ۱ تا ۱۰ صفحه ۸۵ کتاب درسی حسابان ۲ را حل نموده و پاسخ را به صورت متنی یا فایل PDF ارسال نمایید.', dueDate: '۱۴۰۲/۱۲/۲۰', assignedByTeacherId: 'stf-sec-01', assignedByTeacherName: 'استاد مریم حسینی', maxScore: 20 },
  { id: 'asg-e1', organizationId: 'org-102', classId: 'cls-elem-101', className: 'کلاس ۱/الف (شکوفه‌ها)', subjectId: 'sbj-e2', subjectName: 'ریاضی ابتدایی', title: 'رسم الگوهای متقارن رنگی', description: 'برگه الگویابی رنگی را تکمیل کنید و همراه اولیا در سامانه آپلود نمایید.', dueDate: '۱۴۰۲/۱۲/۲۲', assignedByTeacherId: 'stf-elem-01', assignedByTeacherName: 'خانم فاطمه طاهری', maxScore: 10 },
  { id: 'asg-i1', organizationId: 'org-103', classId: 'cls-inst-101', className: 'دوره جامع زبان انگلیسی (IELTS Master)', subjectId: 'sbj-i1', subjectName: 'مهارت نگارش و مکالمه آیلتس', title: 'IELTS Writing Task 2 Essay', description: 'Write an essay of at least 250 words on the topic: "Should education be completely free for everyone?"', dueDate: '۱۴۰۳/۰۱/۲۵', assignedByTeacherId: 'stf-inst-01', assignedByTeacherName: 'استاد سعید تهرانی', maxScore: 100 },
];

const DEFAULT_SUBMISSIONS: HomeworkSubmission[] = [
  { id: 'sub-s1', assignmentId: 'asg-s1', organizationId: 'org-101', studentId: 'std-s1', studentName: 'امیرحسین رضایی', submissionDate: '۱۴۰۲/۱۲/۱۹ - ۱۸:۳۰', textContent: 'استاد محترم تمرینات تکمیلی بخش مشتق توابع مثلثاتی به پیوست ارسال شد.', fileName: 'Hassaban_Homework_Rezaei.pdf', fileSize: '۱.۸ مگابایت', status: 'graded', score: 20, feedback: 'بسیار تمیز و پاسخ‌ها کاملاً درست است.' },
];

const DEFAULT_MATERIALS: LearningMaterial[] = [
  { id: 'mat-s1', organizationId: 'org-101', classId: 'cls-sec-121', className: 'کلاس ۱۲/۱ ریاضی', subjectId: 'sbj-s1', subjectName: 'حسابان ۲', title: 'جزوه خلاصه فرمول‌های مشتق و حد', description: 'خلاصه‌برداری نکات کلیدی جهت آمادگی در آزمون‌های تست کنکور', category: 'جزوه آموزشی', fileType: 'PDF', fileSize: '۳.۴ مگابایت', fileName: 'Calculus_Derivatives_Summary.pdf', uploadedBy: 'استاد مریم حسینی', uploadDate: '۱۴۰۲/۱۲/۱۰' },
  { id: 'mat-e1', organizationId: 'org-102', classId: 'cls-elem-101', className: 'کلاس ۱/الف', subjectId: 'sbj-e1', subjectName: 'فارسی و نگارش', title: 'فایل صوتی و تصویری حروف الفبای فارسی', description: 'داستان صوتی حروف «ن» و «و» جهت تمرین در منزل', category: 'محتوای مالتی‌مدیا', fileType: 'MP4', fileSize: '۱۲.۵ مگابایت', fileName: 'Alphabet_Story_E1.mp4', uploadedBy: 'خانم فاطمه طاهری', uploadDate: '۱۴۰۲/۱۲/۱۵' },
];

const DEFAULT_APPLICATIONS: InstituteApplication[] = [
  { id: 'app-1', organizationId: 'org-103', applicantName: 'مریم صبوری', applicantPhone: '۰۹۱۲۳۳۳۲۲۱۱', applicantEmail: 'm.sabouri@gmail.com', nationalId: '۰۰۲۴۵۱۸۹۷۲', courseId: 'cls-inst-101', courseName: 'دوره جامع زبان انگلیسی (IELTS Master)', className: 'دوره جامع زبان انگلیسی (IELTS Master)', submissionDate: '۱۴۰۳/۰۱/۱۴', status: 'pending', refCode: 'REG-88210', tuitionFee: 4500000, isPaid: false, notes: 'متقاضی شرکت در کلاس‌های بعدازظهر' },
];

const DEFAULT_INVOICES: TuitionInvoice[] = [
  { id: 'inv-1', organizationId: 'org-103', studentId: 'std-inst-1', studentName: 'پارسا تهرانی', title: 'شهریه دوره جامع آیلتس - ترم بهار ۱۴۰۳', totalAmount: 4500000, paidAmount: 4500000, dueDate: '۱۴۰۳/۰۱/۳۰', status: 'paid', issuedDate: '۱۴۰۳/۰۱/۱۰', transactions: [{ id: 'trn-1', paymentDate: '۱۴۰۳/۰۱/۱۰ - ۱۱:۲۰', amount: 4500000, method: 'online_demo', refCode: 'DEMO-PAY-9011', receiptNumber: 'RCP-10023' }] },
  { id: 'inv-2', organizationId: 'org-103', studentId: 'std-inst-2', studentName: 'کیمیا رضایی', title: 'شهریه دوره آلمانی B1 - ترم بهار ۱۴۰۳', totalAmount: 3800000, paidAmount: 0, dueDate: '۱۴۰۳/۰۲/۰۵', status: 'unpaid', issuedDate: '۱۴۰۳/۰۱/۱۲', transactions: [] },
];

const DEFAULT_MESSAGES: DirectMessage[] = [
  { id: 'msg-1', organizationId: 'org-101', senderId: 'stf-sec-03', senderName: 'دکتر سارا کریمی', senderRole: 'counselor', recipientId: 'std-s1', recipientName: 'امیرحسین رضایی', recipientRole: 'student', subject: 'پیگیری برنامه مطالعاتی آزمون سراسری', content: 'سلام امیرحسین عزیز. لطفاً جدول ساعات مطالعه هفته گذشته خود را برای بررسی در جلسه فردا همراه داشته باش.', sentAt: '۱۴۰۲/۱۲/۰۴ - ۱۴:۲۰', isRead: true, isPrivate: true, isCounselingNote: true, visibleToStudent: true, visibleToParent: true },
];

const DEFAULT_SMS_LOGS: SMSNotificationLog[] = [
  { id: 'sms-1', organizationId: 'org-101', recipientName: 'رضا رضایی (ولی دانش‌آموز)', recipientPhone: '۰۹۱۲۴۴۴۵۵۶۶', templateName: 'هشدار عدم حضور در کلاس', messageText: 'ولی محترم؛ دانش‌آموز امیرحسین رضایی در تاریخ ۱۴۰۲/۱۲/۰۱ با تأخیر ۱۰ دقیقه‌ای در کلاس درس حاضر شد.', sentAt: '۱۴۰۲/۱۲/۰۱ - ۰۸:۳۰', status: 'simulated_sent', triggerReason: 'ثبت تأخیر در حضور و غیاب' },
];

const DEFAULT_SUPPORT_TICKETS: SupportTicket[] = [
  { id: 'sup-1', organizationId: 'org-101', userId: 'usr-admin', userName: 'دکتر علیرضا رضایی', userRole: 'school_admin', category: 'technical', priority: 'medium', title: 'درخواست افزایش حجم آپلود فایل‌های آموزشی', description: 'جهت بارگذاری ویدیوی کارگاه‌های کنکور نیازمند سقف ۵۰ مگابایت هستیم.', createdAt: '۱۴۰۲/۱۲/۰۲', status: 'resolved', responseNotes: 'سقف بارگذاری محتوا در محیط دمو شبیه‌سازی شد.' },
];

const DEFAULT_COUNSELING: CounselingReferral[] = [
  { id: 'cns-1', organizationId: 'org-101', studentId: 'std-s1', studentName: 'امیرحسین رضایی', className: 'کلاس ۱۲/۱ ریاضی', referredBy: 'استاد مریم حسینی', referralDate: '۱۴۰۲/۱۱/۲۸', reason: 'کاهش نمره‌ی مستمر در درس حسابان و استرس کنکور', priority: 'high', status: 'in_progress', counselorName: 'دکتر سارا کریمی', scheduledAppointment: '۱۴۰۲/۱۲/۰۵ - ساعت ۱۱:۰۰', privateNotes: 'جلسه اول برگزار شد. برنامه‌ریزی مطالعه مطالعاتی ارائه گردید.' },
];

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  { id: 'anc-1', organizationId: 'org-102', title: 'برگزاری جشن شکرگزاری حروف الفبا', content: 'اولیا محترم پایه اول، مراسم جشن الفبا روز سه‌شنبه برگزار خواهد شد.', audience: 'parents', targetGrade: 'پایه اول', authorName: 'مدیر دبستان آفتاب', createdAt: '۱۴۰۲/۱۲/۰۲', isPublished: true, priority: 'important' },
  { id: 'anc-2', organizationId: 'org-101', title: 'جدول زمانی امتحانات شبه‌نهایی کنکور', content: 'برنامه‌ زمانی آزمون‌های آزمایشی پایه دوازدهم روی سامانه قرار گرفت.', audience: 'all', authorName: 'دکتر علیرضا رضایی', createdAt: '۱۴۰۲/۱۲/۰۱', isPublished: true, priority: 'urgent' },
];

const DEFAULT_SETTINGS: Record<string, SchoolSettings> = {
  'org-101': { organizationId: 'org-101', schoolName: 'دبیرستان هوشمند البرز', principalName: 'دکتر علیرضا رضایی', phone: '۰۲۱-۸۸۹۹۰۰۱۱', address: 'تهران، خیابان انقلاب، خیابان البرز', academicYear: '۱۴۰۳ - ۱۴۰۲', termName: 'نیم‌سال دوم', allowParentMessaging: true, autoAttendanceAlerts: true, passingScore: 10 },
  'org-102': { organizationId: 'org-102', schoolName: 'دبستان و پیش‌دبستانی آفتاب', principalName: 'خانم علیرضا رضایی (سرپرست)', phone: '۰۲۱-۲۲۳۳۴۴۵۵', address: 'تهران، پاسداران، بوستان چهارم', academicYear: '۱۴۰۳ - ۱۴۰۲', termName: 'ترم دوم', allowParentMessaging: true, autoAttendanceAlerts: true, passingScore: 7 },
  'org-103': { organizationId: 'org-103', schoolName: 'آموزشگاه زبان و علوم دانش‌نیک', principalName: 'مهندس مهدی احمدی', phone: '۰۲۱-۶۶۷۷۸۸۹۹', address: 'تهران، خیابان ولیعصر، نرسیده به ونک', academicYear: 'ترم بهار ۱۴۰۳', termName: 'ترم بهار', allowParentMessaging: true, autoAttendanceAlerts: true, passingScore: 70 },
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
          assignments: parsed.assignments || DEFAULT_ASSIGNMENTS,
          submissions: parsed.submissions || DEFAULT_SUBMISSIONS,
          materials: parsed.materials || DEFAULT_MATERIALS,
          examQuestions: parsed.examQuestions || DEFAULT_EXAM_QUESTIONS,
          examAttempts: parsed.examAttempts || [],
          applications: parsed.applications || DEFAULT_APPLICATIONS,
          invoices: parsed.invoices || DEFAULT_INVOICES,
          messages: parsed.messages || DEFAULT_MESSAGES,
          smsLogs: parsed.smsLogs || DEFAULT_SMS_LOGS,
          supportTickets: parsed.supportTickets || DEFAULT_SUPPORT_TICKETS,
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
      assignments: DEFAULT_ASSIGNMENTS,
      submissions: DEFAULT_SUBMISSIONS,
      materials: DEFAULT_MATERIALS,
      examQuestions: DEFAULT_EXAM_QUESTIONS,
      examAttempts: [],
      applications: DEFAULT_APPLICATIONS,
      invoices: DEFAULT_INVOICES,
      messages: DEFAULT_MESSAGES,
      smsLogs: DEFAULT_SMS_LOGS,
      supportTickets: DEFAULT_SUPPORT_TICKETS,
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
      assignments: [...DEFAULT_ASSIGNMENTS],
      submissions: [...DEFAULT_SUBMISSIONS],
      materials: [...DEFAULT_MATERIALS],
      examQuestions: [...DEFAULT_EXAM_QUESTIONS],
      examAttempts: [],
      applications: [...DEFAULT_APPLICATIONS],
      invoices: [...DEFAULT_INVOICES],
      messages: [...DEFAULT_MESSAGES],
      smsLogs: [...DEFAULT_SMS_LOGS],
      supportTickets: [...DEFAULT_SUPPORT_TICKETS],
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

      // Auto SMS simulation for unjustified absence
      if (e.status === 'absent' && (!e.notes || !e.notes.includes('موجه'))) {
        const student = this.state.students.find((s) => s.id === e.studentId);
        if (student && student.guardianPhone) {
          this.addSMSLog({
            organizationId: orgId,
            recipientName: `${student.guardianName} (ولی ${student.fullName})`,
            recipientPhone: student.guardianPhone,
            templateName: 'هشدار عدم حضور غیرموجه',
            messageText: `ولی محترم؛ دانش‌آموز ${student.fullName} در تاریخ ${date} در کلاس درس حاضر نشده است.`,
            status: 'simulated_sent',
            triggerReason: 'ثبت غیبت غیرموجه در سیستم',
          });
        }
      }
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

  // --- Exams & Questions & Attempts ---
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

  public getExamQuestions(examId: string): ExamQuestion[] {
    return this.state.examQuestions.filter((q) => q.examId === examId);
  }

  public addExamQuestion(q: Omit<ExamQuestion, 'id'>): ExamQuestion {
    const newQ: ExamQuestion = {
      ...q,
      id: 'q-' + Date.now().toString(36),
    };
    this.state.examQuestions.push(newQ);
    this.saveState();
    return newQ;
  }

  public saveExamAttempt(attempt: Omit<StudentExamAttempt, 'id' | 'submittedAt'>): StudentExamAttempt {
    const existingIdx = this.state.examAttempts.findIndex(
      (a) => a.examId === attempt.examId && a.studentId === attempt.studentId
    );

    const fullAttempt: StudentExamAttempt = {
      ...attempt,
      id: existingIdx !== -1 ? this.state.examAttempts[existingIdx]!.id : 'att-' + Date.now().toString(36),
      submittedAt: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };

    if (existingIdx !== -1) {
      this.state.examAttempts[existingIdx] = fullAttempt;
    } else {
      this.state.examAttempts.push(fullAttempt);
    }

    this.saveState();
    return fullAttempt;
  }

  public getExamAttempt(examId: string, studentId: string): StudentExamAttempt | null {
    return this.state.examAttempts.find((a) => a.examId === examId && a.studentId === studentId) || null;
  }

  public getGradesForExam(orgId: string, examId: string): StudentGrade[] {
    return this.state.grades.filter((g) => g.organizationId === orgId && g.examId === examId);
  }

  public saveStudentGrades(orgId: string, examId: string, gradesList: Omit<StudentGrade, 'id' | 'organizationId' | 'examId' | 'updatedAt'>[]): void {
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

    const exam = this.state.exams.find((e) => e.id === examId);
    if (exam && exam.status === 'scheduled') {
      exam.status = 'grading';
    }

    this.saveState();
  }

  // --- Assignments & Homework ---
  public getAssignments(orgId: string): Assignment[] {
    return this.state.assignments.filter((a) => a.organizationId === orgId);
  }

  public addAssignment(asg: Omit<Assignment, 'id'>): Assignment {
    const newAsg: Assignment = {
      ...asg,
      id: 'asg-' + Date.now().toString(36),
    };
    this.state.assignments.unshift(newAsg);
    this.saveState();
    return newAsg;
  }

  public getSubmissionsForAssignment(asgId: string): HomeworkSubmission[] {
    return this.state.submissions.filter((s) => s.assignmentId === asgId);
  }

  public getSubmissionsForStudent(orgId: string, studentId: string): HomeworkSubmission[] {
    return this.state.submissions.filter((s) => s.organizationId === orgId && s.studentId === studentId);
  }

  public submitHomework(sub: Omit<HomeworkSubmission, 'id' | 'submissionDate' | 'status'>): HomeworkSubmission {
    const newSub: HomeworkSubmission = {
      ...sub,
      id: 'sub-' + Date.now().toString(36),
      submissionDate: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      status: 'submitted',
    };
    this.state.submissions.unshift(newSub);
    this.saveState();
    return newSub;
  }

  public gradeHomeworkSubmission(id: string, score: number, feedback: string): void {
    const item = this.state.submissions.find((s) => s.id === id);
    if (item) {
      item.score = score;
      item.feedback = feedback;
      item.status = 'graded';
      this.saveState();
    }
  }

  // --- Learning Materials ---
  public getMaterials(orgId: string): LearningMaterial[] {
    return this.state.materials.filter((m) => m.organizationId === orgId);
  }

  public addMaterial(mat: Omit<LearningMaterial, 'id' | 'uploadDate'>): LearningMaterial {
    const newMat: LearningMaterial = {
      ...mat,
      id: 'mat-' + Date.now().toString(36),
      uploadDate: new Date().toLocaleDateString('fa-IR'),
    };
    this.state.materials.unshift(newMat);
    this.saveState();
    return newMat;
  }

  public deleteMaterial(id: string): void {
    this.state.materials = this.state.materials.filter((m) => m.id !== id);
    this.saveState();
  }

  // --- Institute Applications & Invoices ---
  public getApplications(orgId: string): InstituteApplication[] {
    return this.state.applications.filter((a) => a.organizationId === orgId);
  }

  public addApplication(app: Omit<InstituteApplication, 'id' | 'submissionDate' | 'refCode' | 'status'>): InstituteApplication {
    const refCode = 'REG-' + Math.floor(10000 + Math.random() * 90000).toString();
    const newApp: InstituteApplication = {
      ...app,
      id: 'app-' + Date.now().toString(36),
      submissionDate: new Date().toLocaleDateString('fa-IR'),
      refCode,
      status: 'pending',
    };
    this.state.applications.unshift(newApp);
    this.saveState();
    return newApp;
  }

  public updateApplicationStatus(id: string, status: InstituteApplication['status']): void {
    const item = this.state.applications.find((a) => a.id === id);
    if (item) {
      item.status = status;
      this.saveState();
    }
  }

  public getInvoices(orgId: string): TuitionInvoice[] {
    return this.state.invoices.filter((i) => i.organizationId === orgId);
  }

  public getInvoicesForStudent(orgId: string, studentId: string): TuitionInvoice[] {
    return this.state.invoices.filter((i) => i.organizationId === orgId && i.studentId === studentId);
  }

  public recordPayment(invoiceId: string, amount: number, method: 'online_demo' | 'card_transfer' | 'cash'): TuitionInvoice | null {
    const invoice = this.state.invoices.find((i) => i.id === invoiceId);
    if (!invoice) return null;

    const refCode = 'PAY-' + Math.floor(100000 + Math.random() * 900000).toString();
    const receiptNumber = 'RCP-' + Math.floor(10000 + Math.random() * 90000).toString();

    invoice.transactions.push({
      id: 'trn-' + Date.now().toString(36),
      paymentDate: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      amount,
      method,
      refCode,
      receiptNumber,
    });

    invoice.paidAmount += amount;
    if (invoice.paidAmount >= invoice.totalAmount) {
      invoice.status = 'paid';
    } else if (invoice.paidAmount > 0) {
      invoice.status = 'partially_paid';
    }

    this.saveState();
    return invoice;
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

  // --- Messages, SMS & Support ---
  public getMessages(orgId: string): DirectMessage[] {
    return this.state.messages.filter((m) => m.organizationId === orgId);
  }

  public addMessage(msg: Omit<DirectMessage, 'id' | 'sentAt' | 'isRead'>): DirectMessage {
    const newMsg: DirectMessage = {
      ...msg,
      id: 'msg-' + Date.now().toString(36),
      sentAt: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };
    this.state.messages.unshift(newMsg);
    this.saveState();
    return newMsg;
  }

  public getSMSLogs(orgId: string): SMSNotificationLog[] {
    return this.state.smsLogs.filter((s) => s.organizationId === orgId);
  }

  public addSMSLog(log: Omit<SMSNotificationLog, 'id' | 'sentAt'>): SMSNotificationLog {
    const newLog: SMSNotificationLog = {
      ...log,
      id: 'sms-' + Date.now().toString(36),
      sentAt: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };
    this.state.smsLogs.unshift(newLog);
    this.saveState();
    return newLog;
  }

  public getSupportTickets(orgId: string): SupportTicket[] {
    return this.state.supportTickets.filter((st) => st.organizationId === orgId);
  }

  public addSupportTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>): SupportTicket {
    const newTicket: SupportTicket = {
      ...ticket,
      id: 'sup-' + Date.now().toString(36),
      createdAt: new Date().toLocaleDateString('fa-IR'),
      status: 'open',
    };
    this.state.supportTickets.unshift(newTicket);
    this.saveState();
    return newTicket;
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
