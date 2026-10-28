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

// --- Homework & Assignments ---
export interface Assignment {
  id: string;
  organizationId: string;
  classId: string;
  className: string;
  subjectId?: string;
  subjectName?: string;
  title: string;
  description: string;
  dueDate: string;
  assignedByTeacherId: string;
  assignedByTeacherName: string;
  maxScore: number;
}

export interface HomeworkSubmission {
  id: string;
  assignmentId: string;
  organizationId: string;
  studentId: string;
  studentName: string;
  submissionDate: string;
  textContent: string;
  fileName?: string;
  fileSize?: string;
  status: 'submitted' | 'graded' | 'late';
  score?: number;
  feedback?: string;
}

// --- Learning Materials ---
export interface LearningMaterial {
  id: string;
  organizationId: string;
  classId?: string;
  className?: string;
  subjectId?: string;
  subjectName?: string;
  title: string;
  description: string;
  category: string;
  fileType: string;
  fileSize: string;
  fileName: string;
  uploadedBy: string;
  uploadDate: string;
}

// --- Assessment Questions & AI Grading ---
export interface QuestionOption {
  id: string;
  text: string;
}

export interface RubricCriterion {
  id: string;
  title: string;
  maxPoints: number;
  description: string;
}

export interface ExamQuestion {
  id: string;
  examId: string;
  type: 'mcq' | 'descriptive';
  prompt: string;
  points: number;
  options?: QuestionOption[];
  correctOptionId?: string;
  referenceAnswer?: string;
  rubricCriteria?: RubricCriterion[];
}

export interface AIGradingSuggestion {
  proposedScore: number;
  criteriaBreakdown: { criterionTitle: string; scoreGiven: number; maxPoints: number; feedback: string }[];
  reasoningSummary: string;
}

export interface StudentExamAttempt {
  id: string;
  organizationId: string;
  examId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  mcqAnswers: Record<string, string>;
  descriptiveAnswers: Record<string, string>;
  mcqScore?: number;
  descriptiveScore?: number;
  totalScore?: number;
  status: 'in_progress' | 'submitted' | 'graded';
  aiGradingSuggestions?: Record<string, AIGradingSuggestion>;
  teacherFeedback?: string;
}

// --- Institute Applications & Tuition Invoices ---
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'enrolled';

export interface InstituteApplication {
  id: string;
  organizationId: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  nationalId: string;
  courseId: string;
  courseName: string;
  classId?: string;
  className?: string;
  submissionDate: string;
  status: ApplicationStatus;
  refCode: string;
  tuitionFee: number;
  isPaid: boolean;
  notes?: string;
}

export type InvoiceStatus = 'unpaid' | 'paid' | 'partially_paid' | 'overdue';

export interface PaymentTransaction {
  id: string;
  paymentDate: string;
  amount: number;
  method: 'online_demo' | 'card_transfer' | 'cash';
  refCode: string;
  receiptNumber: string;
}

export interface TuitionInvoice {
  id: string;
  organizationId: string;
  studentId: string;
  studentName: string;
  title: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: InvoiceStatus;
  issuedDate: string;
  transactions: PaymentTransaction[];
}

// --- Messaging, SMS Logs & Developer Support ---
export interface WeeklyGradebookNote {
  id: string;
  organizationId: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  studentId: string;
  studentName: string;
  noteDate: string; // YYYY-MM-DD or Solar Hijri
  weekLabel: string; // e.g. "هفته ۱ اسفند"
  authorId: string;
  authorName: string;
  content: string;
  isParentVisible: boolean;
  createdAt: string;
}

export interface ScheduleConfig {
  organizationId: string;
  periodsCount: number; // e.g. 4 or 5
  startTime: string; // e.g. "08:00"
  periodDurationMinutes: number; // e.g. 90
  breakDurationMinutes: number; // e.g. 30
  isPublished: boolean;
}

export interface ParentConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  sentAt: string;
}

export interface ParentConversation {
  id: string;
  organizationId: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  studentId: string;
  studentName: string;
  className: string;
  category: 'educational' | 'attendance' | 'administrative' | 'other';
  subject: string;
  status: 'sent' | 'awaiting_reply' | 'replied' | 'resolved';
  createdAt: string;
  updatedAt: string;
  messages: ParentConversationMessage[];
}

export interface DirectMessage {
  id: string;
  organizationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId: string;
  recipientName: string;
  recipientRole: string;
  subject: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  isPrivate: boolean;
  isCounselingNote?: boolean;
  visibleToStudent?: boolean;
  visibleToParent?: boolean;
}

export interface SMSNotificationLog {
  id: string;
  organizationId: string;
  recipientName: string;
  recipientPhone: string;
  templateName: string;
  messageText: string;
  sentAt: string;
  status: 'simulated_sent' | 'delivered' | 'failed';
  triggerReason: string;
}

export interface SupportTicket {
  id: string;
  organizationId: string;
  userId: string;
  userName: string;
  userRole: string;
  category: 'technical' | 'academic' | 'billing' | 'feature_request';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  createdAt: string;
  status: 'open' | 'in_progress' | 'resolved';
  responseNotes?: string;
}
