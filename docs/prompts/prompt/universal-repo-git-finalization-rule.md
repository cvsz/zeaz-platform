# Universal Repo Rule — Mandatory Git Finalization

This rule applies to Codex, agent, and automation prompts that modify `cvsz/zeaz-platform`.

After completing any requested implementation, validation, fixes, documentation, scripts, Makefile updates, Terraform updates, Cloudflare updates, runtime updates, frontend updates, backend updates, or test execution, the task is not complete until the intended changes are committed and pushed successfully.

## Mandatory final steps

1. Run validation first:

   ```bash
   make validate || true
   make ci || true
   make lint || true
   make secret-scan || true
   make zaiz-validate || true
   ```

2. Inspect repository state:

   ```bash
   git status --short
   ```

3. Stage all intended changes:

   ```bash
   git add .
   ```

4. Commit using GPG loopback only:

   ```bash
   bash gpg-loopback.sh commit -m "DETAIL_COMMIT_MESSAGE_HERE"
   ```

5. Push to GitHub:

   ```bash
   git push origin main
   ```

6. Verify clean state:

   ```bash
   git status --short
   ```

## Strict rules

- Do not use plain `git commit` for final implementation commits.
- Do not skip `bash gpg-loopback.sh`.
- Do not claim success before the GitHub push completes.
- Do not commit real secrets.
- Do not commit `.env` files unless explicitly allowed by repo policy.
- Do not ignore gitleaks failures.
- Do not hide validation failures.
- Do not report background or queued work as final success.
- Final responses must state the real push result.

## Required final response fields

Every final implementation response must include:

- commit message used
- whether push succeeded
- validation summary
- files changed summary
- remaining warnings
- exact next commands

## Branch safety note

Use a feature branch for large changes unless the owner explicitly requests direct `main` updates. If a feature branch is used, push with:

```bash
git push -u origin <branch-name>
```

If direct `main` updates are explicitly required, use:

```bash
git push origin main
```
