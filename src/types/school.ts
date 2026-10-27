/**
 * POLARIS SCHOOL DOMAIN TYPES
 * Strongly typed entity models for students, staff, classes, attendance,
 * timetables, exams, grades, counseling, announcements, and settings.
 */

export type StudentStatus = 'active' | 'pending' | 'suspended' | 'transferred' | 'graduated';

export interface Student {
  id: string;
  organizationId: string;
  studentCode: string;
  fullName: string;
  nationalId: string;
  gradeLevel: string; // e.g. 'پایه اول', 'پایه دهم'
  className: string; // e.g. 'کلاس ۱۰۱', 'کلاس ۱۲/۱'
  classId: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  gender: 'male' | 'female';
  birthDate?: string;
  status: StudentStatus;
  enrollmentDate: string;
  avatarUrl?: string;
  notes?: string;
}

export type StaffRole = 'teacher' | 'counselor' | 'admin_staff' | 'vice_principal';

export interface StaffMember {
  id: string;
  organizationId: string;
  staffCode: string;
  fullName: string;
  role: StaffRole;
  roleTitle: string; // e.g. 'دبیر ریاضی', 'مشاور تحصیلی', 'معلم پایه دوم'
  email: string;
  phone: string;
  assignedSubjects: string[];
  assignedClasses: string[];
  status: 'active' | 'inactive';
  weeklyHours: number;
  avatarUrl?: string;
}

export interface SchoolClass {
  id: string;
  organizationId: string;
  code: string; // e.g. 'CLS-101'
  name: string; // e.g. '۱۰۱', '۱۲/۱ ریاضی'
  gradeLevel: string; // e.g. 'پایه اول', 'پایه دوازدهم'
  homeroomTeacherId: string;
  homeroomTeacherName: string;
  capacity: number;
  studentCount: number;
  roomNumber: string;
}

export interface Subject {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  gradeLevel: string;
  weeklyHours: number;
  category: 'core' | 'elective' | 'lab' | 'general';
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  organizationId: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  studentName: string;
  classId: string;
  status: AttendanceStatus;
  recordedBy: string;
  submitted: boolean;
  notes?: string;
}

export interface TimetableSlot {
  id: string;
  organizationId: string;
  classId: string;
  dayOfWeek: 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday';
  periodNumber: number; // 1, 2, 3, 4, 5
  timeLabel: string; // e.g. "08:00 - 09:30"
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  roomNumber: string;
}

export type ExamStatus = 'scheduled' | 'in_progress' | 'grading' | 'completed' | 'published';

export interface Exam {
  id: string;
  organizationId: string;
  title: string;
  subjectId: string;
  subjectName: string;
  gradeLevel: string;
  classIds: string[];
  examDate: string; // YYYY-MM-DD
  startTime: string; // e.g. "09:00"
  durationMinutes: number;
  maxScore: number;
  term: 'term_1' | 'term_2' | 'midterm_1' | 'midterm_2';
  status: ExamStatus;
  evalType: 'numeric' | 'descriptive'; // numeric for secondary/general, descriptive for elementary
}

export interface StudentGrade {
  id: string;
  organizationId: string;
  examId: string;
  studentId: string;
  score?: number; // Numeric score (0-20)
  descriptiveScore?: 'خیلی خوب' | 'خوب' | 'قابل قبول' | 'نیازمند تلاش بیشتر'; // Primary qualitative assessment
  feedback?: string;
  updatedAt: string;
}

export type CounselingPriority = 'high' | 'medium' | 'low';
export type CounselingStatus = 'pending' | 'in_progress' | 'completed' | 'closed';

export interface CounselingReferral {
  id: string;
  organizationId: string;
  studentId: string;
  studentName: string;
  className: string;
  referredBy: string; // e.g. "استاد حسینی (دبیر)"
  referralDate: string;
  reason: string;
  priority: CounselingPriority;
  status: CounselingStatus;
  counselorName: string;
  scheduledAppointment?: string;
  privateNotes?: string;
}

export interface Announcement {
  id: string;
  organizationId: string;
  title: string;
  content: string;
  audience: 'all' | 'parents' | 'teachers' | 'students' | 'grade_level';
  targetGrade?: string;
  authorName: string;
  createdAt: string;
  isPublished: boolean;
  priority: 'normal' | 'important' | 'urgent';
}

export interface SchoolSettings {
  organizationId: string;
  schoolName: string;
  principalName: string;
  phone: string;
  address: string;
  academicYear: string;
  termName: string;
  allowParentMessaging: boolean;
  autoAttendanceAlerts: boolean;
  passingScore: number;
}
