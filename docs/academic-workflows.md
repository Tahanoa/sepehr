# Academic workspace, phase 2

The demo uses browser-local storage, not a production backend. Messages do not travel between devices, attendance notices are in-app records rather than SMS, and role checks are client-side demonstrations, not a security boundary.

- `/grades`: administrators edit continuous/final evaluations by school year and term, control teacher entry, build a student report snapshot and publish it. Parents/students see published reports only. Elementary reports use written descriptions.
- Teacher `/grades`: weekly student-by-day journal and term mark entry. Closing a term blocks term entry in both UI and storage operations.
- `/messages`: administrator–parent and counselor–parent/student conversations. Text uses DOM textContent, not HTML. Contacts come from demo identities and student records.
- `/attendance`: teacher class roster and administrator follow-up. Save attendance before creating a guardian notice.
- `/exam-builder`: dedicated four-step builder with contextual guidance, preview and publication checks.
- Student exam runner: responsive answer workspace and browser-local answer persistence.

## AI endpoint contract

`POST /api/ai/grade` is an integration boundary, not an implemented AI backend. A missing endpoint produces an explicit error and no suggested grade. No provider key belongs in the client bundle.

Request: questionPrompt, studentAnswer, referenceAnswer, maxPoints, rubricCriteria. No student name is sent by this component. Response: proposedScore, reasoningSummary, criteriaBreakdown (criterionTitle, scoreGiven, maxPoints, feedback). The UI validates score bounds, renders text safely, and requires teacher acceptance before saving.

Production server must authenticate staff, authorize the specific exam/student, rate-limit calls, validate rubric totals and provider output, store audit history and protect submitted answers. Replace local academic storage with authenticated database operations before real multi-user use. Published reports are snapshots; changing marks requires rebuilding and republishing.

Validation: TypeScript production build plus browser smoke checks for appearance, mobile layout, report-entry lock, attendance save and escaped message content. No live AI provider or cross-device messaging was tested.
