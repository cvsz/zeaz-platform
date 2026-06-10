# Database and Data Model

## Connection model

The main application uses the `cdas_conn` SQL Server connection string configured in `app/Web.config`. Code accesses it with `ConfigurationManager.ConnectionStrings["cdas_conn"]`, `asp:SqlDataSource`, and legacy helper wrappers.

Default repository connection string characteristics:

- SQL Server instance: `POLOCEDBC-LMS\SQLEXPRESS`
- Database: `POLICE_LMS`
- Integrated Security: enabled
- Encryption: enabled
- TrustServerCertificate: false

For production, store environment-specific connection strings outside source control and use a trusted SQL Server certificate.

## Repository database assets

| Path | Purpose |
| --- | --- |
| `db/POLICE_LMS.bak` | SQL Server backup for restore/reference. |
| `db/POLICE_LMS.mdf` | SQL Server data file. |
| `db/POLICE_LMS_log.ldf` | SQL Server log file. |
| `app/test/tbl_info.sql` | Test/sample SQL. |
| `app/knowledge/**.sql` | Knowledge/forum SQL assets. |

## Table families inferred from source

| Table/name pattern | Used for |
| --- | --- |
| `Member` | User account records, names, ranks, active flags, email, and login credentials. |
| `Forgetpass` | Password reset token records. |
| `usergroup` | User group definitions. |
| `useringroup` | User-to-group membership mapping. |
| Course-related tables | Courses, course details, course documents, calendars, and assignments. |
| QA/standard/project/activity/asset tables | Standards, projects, activities, assets/evidence, polls, and reports. |
| Question-related tables | Question groups, questions, details, answers, and selections. |
| Ebook/multimedia/certificate/report tables | Metadata for uploaded content and generated reports. |

Because the repo includes a live database backup rather than a schema-first migration folder for the legacy app, verify exact table/column names directly from the restored database before writing migrations.

## Data access patterns

The codebase contains a mix of:

- Safe parameterized `SqlCommand` usage in security-patched login/password reset paths.
- Declarative `asp:SqlDataSource` controls in `.aspx` files.
- Legacy helper methods such as `CConnect.sqlCmd`, `sqlCmdReturn`, and `sqlCmdReturn2`.
- Raw string-concatenated SQL in older modules.

Modernization priority:

1. Inventory all raw SQL strings.
2. Replace concatenation with parameterized `SqlCommand` or a vetted repository/data access layer.
3. Add authorization checks based on fresh database reads.
4. Add regression tests around query results and side effects.
5. Remove broad catch-and-ignore blocks that hide database failures.

## Backup and restore guidance

- Back up `POLICE_LMS` and uploaded-file directories together.
- Document restore order: database first, app configuration second, uploaded file tree third, then smoke tests.
- Use least-privilege database users for runtime.
- Encrypt backups at rest and restrict access to operators with a business need.
- Avoid exporting production data into development repositories or CI artifacts.

## Migration guidance

For schema changes:

1. Create idempotent SQL migration scripts in a dedicated migrations folder.
2. Include rollback or forward-fix notes.
3. Test against a restored copy of `POLICE_LMS`.
4. Include before/after row-count checks for destructive operations.
5. Record security impacts when tables involve identity, roles, uploads, audit logs, or reports.
