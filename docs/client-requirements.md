# Client workflow update

- Staff, class, exam and assignment lists expose confirmed delete actions. Occupied classes require student transfer first. Existing student and material deletion remain available.
- Student details link to that student's themed report page. First-term, second-term and ongoing reports support print/PDF through the browser print dialog. Ongoing reports use second-term continuous marks.
- Elementary gradebook, homework and exam review use the four requested qualitative levels. A student has one scalar class ID; reassignment transfers their class rather than adding membership.
- SMS campaigns target registered guardians only, deduplicate phone numbers, and respect class targeting. Student, teacher and CSV audiences cannot use SMS.
- Elementary dashboards have contextual page help; other plans have general help.
- Source-based AI exam creation is a labeled local demo accepting PDF/DOCX/TXT metadata up to 10 MB. It appends editable fixed sample questions, uploads nothing and requires teacher review before publication (including list shortcuts).
- AI grading is a labeled local simulation. Teachers review suggestions and explicitly save final assessments.
- Student classes/schedule shows only their linked class timetable and current lesson using Tehran time, refreshed every 30 seconds while mounted.
- Parents can submit a dated absence reason to the school's parent inbox. This does not overwrite teacher attendance or automatically excuse absence.

Validation: `npm run build`, `npm run test:client`, `git diff --check`.
UI regression suite requires the Playwright Chromium browser, unavailable in this environment. These are browser-local demo workflows; no SMS or AI backend is connected.
