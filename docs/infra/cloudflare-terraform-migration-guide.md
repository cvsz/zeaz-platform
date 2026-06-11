# Cloudflare DNS Terraform Consolidation Guide (Phase 8)

This guide provides the exact steps for operators to execute the DNS Terraform consolidation planned in Phase 5.

## 1. Apply `terraform/cloudflare-apps` (TA)

The `apps.auto.tfvars.json` has been updated to include all missing records from `terraform/cloudflare` (TC), `terraform/zdash` (TZ), and the live tunnel.

**Important**: Because the DNS records already exist in Cloudflare (created by TC and TZ), Terraform might fail with `Record already exists`.

To resolve this, you must import the existing records into the `cloudflare-apps` state:

```bash
cd terraform/cloudflare-apps

# Example import command format:
# terraform import 'module.apps["<hostname>"].cloudflare_record.app_cname[0]' <zone_id>/<record_id>

# Run a plan to see which records fail to create
terraform plan

# If you prefer to simply recreate them (safe for CNAMEs if downtime is acceptable):
# Delete them manually in the Cloudflare Dashboard, then run:
terraform apply
```

## 2. Destroy Legacy Modules (TC and TZ)

Once `terraform/cloudflare-apps` successfully manages all records, the old modules must release their state.

Since the source files have been removed from the repository in this PR, you must do this BEFORE pulling the `main` branch with these changes, OR checkout the previous commit locally to run the destroy.

```bash
# Checkout the commit before consolidation
git checkout HEAD~1

# Destroy TZ
cd terraform/zdash
terraform destroy

# Destroy TC
cd ../cloudflare
terraform destroy
```

**Alternative (State Removal):**
If you don't want to destroy the records (because TA is now managing them), you can simply remove them from the state so Terraform stops tracking them:

```bash
cd terraform/zdash
terraform state rm cloudflare_dns_record.zdash

cd ../cloudflare
terraform state rm cloudflare_record.ingress_records
```

## 3. Verify Live Tunnel

After Terraform is fully consolidated into `cloudflare-apps`, run the validation scripts to ensure no drift remains:

```bash
cd ../../infra/cloudflare/scripts
./scan-dns-ownership.sh --strict
./validate-cloudflare-config.sh
```
