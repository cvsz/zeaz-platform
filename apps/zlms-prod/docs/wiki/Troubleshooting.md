# Troubleshooting

## Installer cannot find DevExpress assemblies

Run:

```bash
./scripts/check_devexpress_references.sh
```

Fixes:

- Place licensed DevExpress 16.2 DLLs under the expected `../../lms-library` path relative to `app/lms.csproj`.
- Or provide a licensed source to the installer:

```bash
DEVEXPRESS_SOURCE=/path/to/devexpress-folder-or-zip ./installer.sh --yes
```

## Mono/MSBuild/NuGet packages unavailable

The installer tolerates some unavailable packages on newer Ubuntu releases and can fall back to `xbuild` or bootstrap `nuget.exe`. If build still fails:

1. Review installer output for missing required packages.
2. Verify `mono-complete`, `unzip`, and `curl` are available.
3. Confirm NuGet restore completed.
4. Confirm DevExpress DLLs exist.
5. Run the build command manually from the failing step for full output.

## Readiness check fails on Web.config posture

Run:

```bash
./scripts/live_readiness_check.sh
```

Common causes:

- `debug="true"` accidentally reintroduced.
- `customErrors` disabled.
- `app/Web.Release.config` missing or changed.
- Secure headers/cookie settings changed during troubleshooting.

Do not weaken production settings to pass a local test. Use environment-specific transforms or local-only configuration overrides.

## Login fails

Check:

1. SQL Server is reachable from the runtime host.
2. `cdas_conn` points to the restored `POLICE_LMS` database.
3. The `Member` row is active.
4. Login rate limiter has not temporarily blocked repeated attempts.
5. `App_Data/security.log` contains `login.authenticate` events.
6. The app can write session cookies with `Secure` flag; HTTPS is required in production due to `requireSSL="true"`.

## Upload fails

Current upload validation rejects:

- Empty files.
- Files over 50 MB.
- Extensions outside the allow-list.
- Unsafe owner directory identifiers.
- Paths that resolve outside the intended root.

Check upload directory write permissions and application logs. If a new file type is required, add it to the centralized allow-list only after security review.

## Blank or missing static assets

Potential causes:

- Build/publish omitted legacy static/vendor directories.
- 404 handling redirects to `/assets/images/blank.png`.
- CSP blocks external or inline resources.
- Case-sensitive filesystem differences under Linux/Mono.

Use browser developer tools and server logs to identify the exact path. Avoid copying entire generated folders from production without review.

## Database restore issues

- Verify SQL Server version compatibility for `.bak`, `.mdf`, and `.ldf` files.
- Restore to a non-production test instance first.
- Ensure database owner and runtime login permissions are least privilege.
- Confirm encrypted connections trust the SQL Server certificate.
- Update environment-specific connection strings outside source control.

## Wiki publish authentication failure

If this command fails with an authentication prompt/error:

```bash
git clone https://github.com/cvsz/zlms-prod.wiki.git /tmp/zlms-prod.wiki
```

Publish from an authenticated workstation or CI job. The wiki source can still be reviewed in `docs/wiki/` before it is synchronized to GitHub Wiki.
