# Incident Response Checklist

1. Preserve IIS logs, application security logs, database audit logs, and uploaded-file directories.
2. Search for uploaded scriptable files or unexpected extensions in upload roots.
3. Rotate database credentials and GitHub deployment secrets if compromise is suspected.
4. Review `zlms.security` trace output for rejected uploads and database command errors.
5. Disable affected upload pages at the IIS routing level if active exploitation is observed.
6. Restore clean files from backup and compare database metadata against known-good records.
7. File follow-up issues for every confirmed exploit path and add regression tests before reopening endpoints.
