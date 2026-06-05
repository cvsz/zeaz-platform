# Security Patches

- Added `FileUploadSecurity` and `SafeUploadResult` to centralize upload policy.
- Updated selected upload endpoints to reject traversal, unsupported extensions, empty files, and oversized files.
- Converted selected raw SQL statements to parameterized commands.
- Cleared reusable `SqlCommand` parameters before assigning new command text.
- Encoded selected JavaScript notification messages.
- Validated certificate subdirectories before copying template report files.
