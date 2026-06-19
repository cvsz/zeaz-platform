<!-- OMEGA_MASTER_ADVANCED_PROFESSIONAL_START -->

## Omega Master Advanced Professional Addons

When Omega addons are installed, follow these rules:

- Prefer repo-local commands and assets before global user-level assets.
- Do not activate duplicate global skills when an equivalent repo-local skill exists.
- Do not use interactive paste mode on headless SSH sessions where `DISPLAY` is not set.
- Do not write secrets, tokens, private keys, Terraform state, tfvars, or real credentials.
- Do not run deployment or destructive commands automatically.
- Stop before `git add`, commit, push, Terraform/OpenTofu apply/destroy, Wrangler deploy, or Cloudflare tunnel mutation unless the operator explicitly requests it.
- Use `/tmp/gemini-pack` only as a temporary fallback for generated files when the repository path is read-only.

Recommended local checks:

```bash
scripts/omega/omegactl status
scripts/omega/omegactl list
scripts/omega/omegactl doctor
```

<!-- OMEGA_MASTER_ADVANCED_PROFESSIONAL_END -->
