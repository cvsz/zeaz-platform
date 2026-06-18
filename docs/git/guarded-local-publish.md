# Guarded Local Publish

Use `scripts/git/review-and-publish-local-changes.sh` when you want to scan local changes, stage only safe files, commit, and push.

This is safer than `git add .` because it blocks sensitive paths and common credential patterns before staging anything.

## Safety Model

The script:

- Runs as dry-run by default.
- Requires `--apply` to stage/commit/push.
- Does not run `git add .`.
- Stages explicit reviewed file paths only.
- Blocks `.env`, `.env.*`, `.npmrc`, `.pypirc`, `.netrc`.
- Blocks `.ssh/`, `.gnupg/`, `.kube/`, `.terraform/`, `.wrangler/`.
- Blocks `secrets/`, `secret/`, `credentials/`, `token/`, `tokens/` paths.
- Blocks `*.tfstate`, `*.tfvars`, `*.pem`, `*.key`, `*.p12`, `*.pfx`.
- Blocks files matching common credential content patterns.
- Blocks files larger than 20 MiB unless `--allow-large` is passed.
- Refuses to publish when the branch is behind upstream.
- Uses `make gpg-finalize` when available.
- Never force-pushes.

## Preview tracked changes only

```bash
cd /home/zeazdev/zeaz-platform
bash scripts/git/review-and-publish-local-changes.sh \
  --message "chore: publish reviewed local changes"
```

## Preview tracked + untracked changes

```bash
bash scripts/git/review-and-publish-local-changes.sh \
  --include-untracked \
  --message "chore: publish reviewed local changes"
```

## Apply tracked changes only

```bash
bash scripts/git/review-and-publish-local-changes.sh \
  --apply \
  --message "chore: publish reviewed local changes"
```

## Apply tracked + untracked changes

```bash
bash scripts/git/review-and-publish-local-changes.sh \
  --apply \
  --include-untracked \
  --message "chore: publish reviewed local changes"
```

## Publish a specific branch

```bash
bash scripts/git/review-and-publish-local-changes.sh \
  --apply \
  --branch feat/example \
  --message "feat: publish reviewed example changes"
```

## Reports

The script writes reports under `.git/local-change-review-YYYYMMDD-HHMMSS/` by default:

- `all-candidates.txt`
- `safe-files.txt`
- `blocked-paths.txt`
- `blocked-content.txt`
- `blocked-large-files.txt`
- `staged-files.txt` when applied

## If blocked files are found

Do not bypass the scan. Handle the files deliberately:

```bash
# Keep local but do not commit
git restore --staged -- path/to/file 2>/dev/null || true

# Add safe ignore rule, then re-run the scan
printf '\n# local sensitive files\nsecrets/\n.env\n.env.*\n' >> .gitignore
```

If a sensitive value was already committed previously, rotate the credential at the provider before continuing.

## Recommended flow

```bash
cd /home/zeazdev/zeaz-platform

git status -sb
bash scripts/git/review-and-publish-local-changes.sh --include-untracked --message "chore: publish reviewed local changes"
bash scripts/git/review-and-publish-local-changes.sh --apply --include-untracked --message "chore: publish reviewed local changes"
```
