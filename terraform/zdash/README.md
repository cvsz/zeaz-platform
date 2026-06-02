# zDash Cloudflare Terraform

Terraform-managed DNS records for integrated zDash under `apps/zdash`.

Managed hostnames:

- `zdash.zeaz.dev`
- `api-zdash.zeaz.dev`
- `release.zeaz.dev`

Rules:

- Use scoped `CLOUDFLARE_API_TOKEN`.
- Do not use Global API Key.
- Do not commit `.env`, `.env.cloudflare`, `.tfvars`, `.terraform/`, or Terraform state.
- Import existing DNS records before apply.
- Apply requires explicit Makefile guards.
