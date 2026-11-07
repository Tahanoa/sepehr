import assert from 'node:assert/strict';
import {createServer} from 'vite';
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
const server=await createServer({server:{middlewareMode:true}});
try{
 const {schoolStore:s}=await server.ssrLoadModule('/src/services/school-store.ts');
 const a=await server.ssrLoadModule('/src/services/academic-store.ts');
 const {authService}=await server.ssrLoadModule('/src/services/auth-service.ts');
 const {DEMO_USERS}=await server.ssrLoadModule('/src/data/demo-data.ts');
 for(const value of ['خیلی خوب','خوب','قابل قبول','نیاز به تلاش بیشتر'])a.validateMark(value,true);
 for(const value of ['19','عالی','نیازمند تلاش بیشتر'])assert.throws(()=>a.validateMark(value,true));
 assert.throws(()=>s.deleteClass('cls-sec-121'));assert(s.getClasses('org-101').some(c=>c.id==='cls-sec-121'));
 const student=s.getStudents('org-101')[0];s.updateStudent(student.id,{classId:'cls-sec-101',className:'کلاس ۱۰/۱ ریاضی'});assert.equal(s.getStudents('org-101').filter(x=>x.id===student.id).length,1);assert.equal(s.getStudents('org-101').find(x=>x.id===student.id).classId,'cls-sec-101');
 const admin=DEMO_USERS.find(u=>u.memberships.some(m=>m.organizationId==='org-101'&&m.role==='school_admin'));await authService.signIn({demoUserId:admin.id});const m=admin.memberships.find(m=>m.organizationId==='org-101'&&m.role==='school_admin');authService.setActiveMembership(m.id);
 const report=a.buildReport(m,student.id,'۱۴۰۵–۱۴۰۶','ongoing');assert.equal(report.term,'ongoing');assert.equal(report.published,false);assert.throws(()=>a.publishReport(m,report.id,true));
 const empty=s.addClass({organizationId:'org-101',name:'آزمایشی',code:'test',gradeLevel:'دهم',capacity:20,roomNumber:'۱',homeroomTeacherId:'',homeroomTeacherName:''});assert(s.deleteClass(empty.id));assert(!s.getClasses('org-101').some(c=>c.id===empty.id));
 const course = {
   organizationId: 'org-103', name: 'دوره زمان‌بندی‌شده', code: 'SCHED-1',
   gradeLevel: 'پیشرفته', capacity: 20, roomNumber: '۱',
   homeroomTeacherId: 'stf-inst-01', homeroomTeacherName: 'استاد سعید تهرانی',
 };
 const schedule = { days: ['monday'], startTime: '16:00', endTime: '17:00' };
 const scheduled = s.addClass({ ...course, schedule });
 assert.throws(() => s.addClass({ ...course, schedule: { ...schedule, startTime: '16:30' } }), /تداخل|در این بازه/);
 assert.throws(() => s.addClass({ ...course, schedule: { ...schedule, days: ['saturday'] } }), /برنامه هفتگی/);
 assert.throws(() => s.addClass({ ...course, schedule: { ...schedule, endTime: '15:00' } }), /ساعت پایان/);
 const adjacent = s.addClass({
   ...course, name: 'دوره بعدی', schedule: { ...schedule, startTime: '17:00', endTime: '18:00' },
 });
 assert.throws(() => s.updateClass(adjacent.id, { schedule }), /در این بازه/);
 assert.equal(s.getClasses('org-103').find(c => c.id === adjacent.id).schedule.startTime, '17:00');
 assert.equal(s.checkTimetableConflict('org-103', 'monday', 1, 'cls-inst-101', 'stf-inst-01').hasConflict, true);
 assert.equal(s.checkTimetableConflict('org-103', 'monday', 1, 'cls-inst-101', 'stf-inst-02').hasConflict, false);
 assert.equal(s.updateClass(scheduled.id, { schedule: null }).schedule, null);
 const assignment=s.getAssignments('org-102')[0];s.deleteAssignment(assignment.id);assert.equal(s.getSubmissionsForAssignment(assignment.id).length,0);assert(!s.getAssignments('org-102').some(x=>x.id===assignment.id));
 const original=s.getExams('org-101').find(e=>e.id==='ex-s1');const generated=s.addExam({...original,id:undefined,title:'AI demo',status:'draft',aiSourceName:'source.pdf',aiReviewed:false});assert.throws(()=>s.updateExam(generated.id,{status:'published'}));assert.equal(s.updateExam(generated.id,{aiReviewed:true,status:'published'}).status,'published');
 s.deleteExam('ex-s1');assert.equal(s.getExamQuestions('ex-s1').length,0);assert.equal(s.getGradesForExam('org-101','ex-s1').length,0);
 const before=s.getAttendance('org-101').length;
 s.addParentConversation({organizationId:'org-101',parentId:'parent',parentName:student.guardianName,parentPhone:student.guardianPhone,studentId:student.id,studentName:student.fullName,className:student.className,category:'attendance',subject:'اعلام غیبت'},'بیماری');assert.equal(s.getAttendance('org-101').length,before);assert(s.getParentConversations('org-101').some(c=>c.subject==='اعلام غیبت'));
 const {requestGrading}=await server.ssrLoadModule('/src/components/dashboard/ai-grading-modal.ts');const result=await requestGrading({questionPrompt:'test',studentAnswer:'test',referenceAnswer:'test',maxPoints:20,rubricCriteria:[]});assert.equal(result.proposedScore,15);assert.match(result.reasoningSummary,/نمایشی/);
 console.log('Client requirements: store, descriptive marks, report drafts, deletion, transfer, absence requests and demo AI passed.');
}finally{await server.close();}
