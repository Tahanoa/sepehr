import { OrganizationMembership } from '../../../types/auth';
import { authService } from '../../../services/auth-service';
import { linkedStudents } from '../../../services/academic-store';
import { schoolStore } from '../../../services/school-store';
export function selectedLearner(m: OrganizationMembership) {
  const students = linkedStudents(m);
  const requested = new URLSearchParams(location.search).get('student');
  return students.find(s => s.id === requested) || students[0];
}
export function familyAnnouncements(m: OrganizationMembership) {
  const students = linkedStudents(m);
  return schoolStore.getAnnouncements(m.organizationId).filter(a => a.isPublished &&
    (a.audience === 'all' || a.audience === (m.role === 'parent' ? 'parents' : 'students') ||
    (a.audience === 'grade_level' && students.some(s => s.gradeLevel === a.targetGrade))));
}
export function ownApplications(m: OrganizationMembership) {
  const user = authService.getCurrentUser();
  const normalize = (s: string) => s.replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[\s()-]/g,'');
  return schoolStore.getApplications(m.organizationId).filter(a =>
    !!user && ((!!user.phone && normalize(a.applicantPhone) === normalize(user.phone)) ||
    (!!user.email && a.applicantEmail.toLowerCase() === user.email.toLowerCase())));
}
