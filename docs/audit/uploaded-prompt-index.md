# Uploaded Prompt Index

This file records that an uploaded ZEAZ META OS planning prompt was reviewed and converted into a repository-safe planning track.

Applied target document:

- `docs/prompt/meta-os-rebalance-readme.md`

Repository safety rules preserved:

- validate before changes
- keep Free/no-cost mode by default
- use `CLOUDFLARE_*` environment names
- do not commit local environment files or generated state
- do not print sensitive values
- do not push automatically

Validation baseline:

```bash
make env-normalize-local
make env-format-validate-local
make validate
```
