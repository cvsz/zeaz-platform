# Application Modules

## Module inventory

| Module/path | Purpose inferred from source | Representative assets |
| --- | --- | --- |
| `app/Admin/` | Administrative landing area. | `Default.aspx`, `Default.aspx.cs` |
| `app/User/` | End-user landing area for rank/group redirected users. | `Default.aspx`, `Default.aspx.cs` |
| `app/Course/` | Course administration: courses, details, documents, uploads, calendar/scheduler, and user assignment. | `Default.aspx`, `Course_edit.aspx`, `Coursedetail.aspx`, `CourseUpload.aspx`, `Coursecalenda.aspx`, `setusercourse.aspx` |
| `app/Course_user/` | Learner-facing course views and course content detail pages. | `Default.aspx`, `Coursedetail.aspx`, `Coursecalenda.aspx` |
| `app/QA/` and `app/QA_NEW/` | QA/standards/project/activity/poll/asset workflows and reports. `QA_NEW` appears to be a parallel/newer copy of QA pages. | `Standard.aspx`, `Project_edit.aspx`, `Activities.aspx`, `asset.aspx`, `View_report.aspx` |
| `app/USER_QA/` | User-facing QA/poll/standard/activity/report workflows. | `Standard.aspx`, `activities_detail.aspx`, `Poll_detail.aspx`, `View_report.aspx` |
| `app/Question/` | Question bank/group/answer management. | `Question_edit.aspx`, `Questiongroup_edit.aspx`, `Questionanswer.aspx`, `Questiondetail.aspx` |
| `app/Certificate/` | Certificate/report template and issue flows. | certificate `.aspx` pages and report resource files |
| `app/USERREPORT/` | User report pages. | report `.aspx` and `.cs` files |
| `app/Multimedia/` and `app/Multimedia_user/` | Multimedia upload/admin and user views. | multimedia `.aspx` pages |
| `app/ebook/` | Ebook listing/add/edit/delete and metadata persistence. | `Default.aspx`, `add.aspx`, `edit.aspx`, `del.aspx` |
| `app/knowledge/`, `app/knowledge_old/`, `app/knowledge_crash/` | Embedded knowledge/forum-style payloads. | YAF assemblies, SQL scripts, controls, images, CSS/JS |
| `app/Police_service/` | Service client/data contracts used by service check page. | `GET_NAME.cs`, `Police_webClient.cs` |
| `app/phpMyAdmin/`, `app/examdb/`, `app/student/`, `app/test/` | Embedded PHP/database utilities or examples. | Treat as high-risk legacy/vendor material and isolate from production exposure unless explicitly required. |

## Authentication and navigation

- Login page handles authentication, password reset token creation, and SMTP dispatch.
- Successful login stores session keys used throughout the app: `SessionID`, `IDX`, `FULLNAME`, `RANK`, and `group`.
- `Police.Master.cs` redirects unauthenticated users to `~/web/` and redirects rank `4` users to `~/User/`.
- `Police_user.Master.cs` exposes user display data but currently does not enforce a redirect by itself; pages using it should perform authorization checks explicitly.

## Course workflows

Primary course management is split between administrator and learner views:

1. Admin creates/edits courses and details.
2. Course upload pages persist documents/materials.
3. Scheduler pages use DevExpress scheduler controls for calendars.
4. `setusercourse.aspx` maps users to courses/groups.
5. Learner pages render assigned course details and calendar information.

Security notes:

- Review every upload path for use of `FileUploadSecurity.Save`.
- Replace string-concatenated SQL in course assignment flows with parameterized commands.
- Ensure assignment and delete actions verify the acting user's authorization from the database, not only from session or page state.

## QA, standards, and assessment workflows

QA areas contain standard/project/activity/asset/poll/report flows. There are three audience variants:

- `QA/`: administrative QA workflows.
- `QA_NEW/`: parallel/newer implementation, likely intended to supersede or experiment with `QA/`.
- `USER_QA/`: learner/user-facing QA interactions and reports.

Operational guidance:

- Keep `QA` and `QA_NEW` behavior mapped before deleting duplicate-looking pages.
- When fixing bugs, check whether the same page exists in both trees.
- Asset upload/evidence pages should use centralized upload validation and generated filenames.

## Question bank workflows

The `Question` module manages question groups, question details, answer pages, and selection flows. It contains several direct SQL command patterns and session helper methods. Use this module as a priority target for:

- Parameterized SQL rewrites.
- Authorization checks around edit/delete operations.
- Output encoding in grid/detail render paths.
- Tests for query behavior before and after refactors.

## Content and vendor payloads

The repository includes large static/vendor payloads required by legacy runtime behavior. Do not bulk-format, minify, or spellcheck these directories without a scoped plan:

- `app/assets/`
- `app/bin/`
- `app/obj/`
- `app/courseware/`
- `app/devexpress/`
- `app/examdb/`
- `app/knowledge*`
- `app/phpMyAdmin/`
- `app/ui__/` and `app/web/`

For production, restrict direct web exposure to utilities such as `phpinfo.php`, `pinfo.php`, `phpMyAdmin`, `test`, and sample PHP/database folders unless there is an approved operational need.
