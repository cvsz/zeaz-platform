# Installation and Operations

## Supported install path

The repository provides a Ubuntu/Debian-oriented Mono compatibility installer for the legacy ASP.NET Web Forms app.

```bash
./installer.sh --yes
```

The installer is designed to:

1. Install Linux dependencies such as Mono and utilities.
2. Restore NuGet packages.
3. Validate DevExpress assemblies referenced by `app/lms.csproj`.
4. Build `app/lms.csproj` in Release mode.

## DevExpress dependency model

The app references DevExpress 16.2 assemblies from `../../lms-library`. The installer/check scripts can also use `app/devexpress` as a seeded source. Before building, run:

```bash
./scripts/check_devexpress_references.sh
```

If assemblies are missing, provide them through a licensed source:

```bash
DEVEXPRESS_SOURCE=/path/to/devexpress-folder-or-zip ./installer.sh --yes
```

Do not commit new licensed binaries unless repository policy explicitly allows it.

## Database restore and connection

`app/Web.config` defines `cdas_conn` as a SQL Server connection string. Restore the `POLICE_LMS` database backup from `db/` into the target SQL Server instance, then update the deployment-specific connection string through a secure configuration mechanism.

Production guidance:

- Prefer Windows authentication or managed identity where possible.
- Enable SQL Server encryption with a trusted certificate.
- Do not commit production passwords or secrets.
- Validate that the application pool/Mono runtime identity has only required database permissions.

## Production readiness checks

Run the non-mutating readiness check before release:

```bash
./scripts/live_readiness_check.sh
```

The check verifies production-safe Web.config settings and a scoped first-party typo scan while excluding known generated phpMyAdmin package artifacts.

For a broader dry run:

```bash
./scripts/dryrun_full_project.sh
```

For a full maintenance pass:

```bash
./scripts/update_full_project.sh
```

Optional full-update flags:

- `--apply-duplicates`: remove duplicate backup/copy files only when confirmed safe.
- `--rebuild-installer`: regenerate packaged installer artifacts in `dist/`.

## Packaging

To generate repeatable installer artifacts:

```bash
./scripts/generate_installer.sh
```

Expected output includes a payload archive and generated installer in `dist/`. Treat `dist/` as generated release material; review diffs and provenance before publishing artifacts.

## Runtime files and permissions

Writable locations vary by deployment, but common requirements include:

- Upload directories for course materials, QA evidence, question images, ebooks, multimedia, and generated reports.
- `App_Data/security.log` for security telemetry if using the configured trace listener.
- Temporary directories used by Mono/ASP.NET and DevExpress controls.

Least-privilege recommendations:

- Runtime identity should not be local administrator/root.
- Grant write access only to required upload/log/temp locations.
- Deny execute permissions in upload directories.
- Back up uploaded files and SQL Server database together to preserve referential integrity.

## Deployment checklist

1. Pull reviewed release commit.
2. Verify no unreviewed local changes exist.
3. Restore/verify licensed DevExpress 16.2 assemblies.
4. Restore or migrate SQL Server database.
5. Configure production connection strings and SMTP through secure configuration.
6. Run `./scripts/check_devexpress_references.sh`.
7. Run `./scripts/live_readiness_check.sh`.
8. Build with installer or approved CI pipeline.
9. Smoke test login, course list/detail, upload, QA/report, ebook, and certificate flows.
10. Review `App_Data/security.log` and web server logs for errors/security events.
