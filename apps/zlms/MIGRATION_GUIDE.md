# Migration Guide

## Behavior changes

Uploaded files are now saved with generated safe filenames that include a timestamp and GUID. Database metadata stores the generated filename rather than the original user-supplied filename.

## Operational impact

- Existing uploaded files remain in place and are not renamed by this patch.
- New uploads are limited to 50 MB per file.
- New uploads must use one of the allow-listed extensions: PDF, Office documents, text/CSV, common images, or ZIP archives.
- Request owner IDs used as upload subdirectories must be alphanumeric with optional `_` or `-` characters.

## Deployment steps

1. Deploy the application binaries and updated source together.
2. Ensure upload directories are writable by the application pool identity.
3. Verify representative upload flows for course materials, question images, QA activities, QA results, and QA evidence.
4. If users require additional file types, add those extensions to `FileUploadSecurity.AllowedExtensions` after security review.

## Rollback

Rollback is source-only: redeploy the previous application build. No database migration is introduced by this patch.
