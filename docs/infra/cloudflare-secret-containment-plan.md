# Cloudflare Secret Containment Plan

## Findings

| File | Status |
|---|---|
| `infra/cloudflare/creds.json` | Exists on disk, gitignored, **never committed to git history** |
| `infra/cloudflare/creds.json` content | Base64-encoded cloudflared tunnel credentials (account, tunnel ID, secret key) |

### Severity Assessment

**High** — The credential file exists on disk and could be leaked through:

- Accidental `git add -f` or `git add .` if `.gitignore` is bypassed
- Backup archives
- CI artifact uploads that include the file
- Direct copy to shared volumes or containers
- Operator error during git operations with `--force`

### Actual Risk Status

`infra/cloudflare/creds.json` was **never committed** to git history. `.gitignore` already covers it. The primary risk is local disk exposure, not git history exposure.

---

## Safe Containment Steps (Already Performed)

- [x] `.gitignore` in `infra/cloudflare/` already excludes `creds.json`
- [x] `.gitignore` excludes `*.pem`, `*.key`, `*credentials.json`, `*secret*`, `*token*`, `*.auth`
- [x] Verified `git ls-files --cached` confirms no secret files are tracked
- [x] Verified `git log --all -- **/creds*` confirms no credential commit history
- [x] Added `infra/cloudflare/examples/creds.example.json` with placeholder values

---

## Manual Rotation Checklist (Operator Required)

These steps require access to the Cloudflare dashboard or cloudflared CLI:

```bash
# 1. List all tunnels
cloudflared tunnel list

# 2. Identify the tunnel that uses the exposed credential
#    Match tunnel ID from creds.json against the list

# 3. Get tunnel info
cloudflared tunnel info <TUNNEL_ID_OR_NAME>

# 4. Create new credential (this invalidates the old one)
cloudflared tunnel token <TUNNEL_ID_OR_NAME> > /etc/cloudflared/credentials-new.json

# 5. Restart cloudflared to pick up the new credential
systemctl restart cloudflared

# 6. Verify tunnel is running
systemctl status cloudflared
cloudflared tunnel list

# 7. Remove old credential file (optional, after confirming new one works)
rm /etc/cloudflared/creds.json
```

### Post-Rotation Verification

```bash
# Tunnel shows as active
cloudflared tunnel info <TUNNEL_ID_OR_NAME>

# DNS resolves through the tunnel
dig +short app.zeaz.dev CNAME

# Service responds
curl -sI https://app.zeaz.dev
```

---

## Do Not Commit These Files

```text
infra/cloudflare/creds.json
infra/cloudflare/**/creds.json
**/creds.json
**/*credentials.json
**/*.pem
**/*.key
**/*.tfvars
**/*.tfvars.json
**/.env
**/.env.*
**/*.auth
**/*token*
**/*secret*
```

---

## Recommended Runtime Credential Storage Paths

| Storage Method | Recommendation | Notes |
|---|---|---|
| `/etc/cloudflared/*.json` | **Recommended** | Default cloudflared path, root-only, outside repo |
| SOPS/age encrypted | **Recommended** | Encrypt `.sops.json` in repo, decrypt at runtime |
| GitHub Actions secrets | **For CI** | Inject via `wrangler secret` or `gh secret set` |
| HashiCorp Vault | **For scale** | Dynamic secrets, auto-rotation |
| Docker secrets | **For compose** | Mount as `/run/secrets/` |

**Never**: store in `.env`, `wrangler.toml`, `terraform.tfvars`, or any tracked git file.

---

## Rollback Plan

If a rotation breaks the tunnel:

```bash
# 1. Restore old credential (if not yet deleted)
cp /etc/cloudflared/creds.json.bak /etc/cloudflared/creds.json

# 2. Restart cloudflared
systemctl restart cloudflared

# 3. Verify
systemctl status cloudflared

# 4. Debug
journalctl -u cloudflared --since "5 minutes ago" | tail -20
```

---

## Verification Commands (Do Not Print Secrets)

```bash
# Verify no credential files are tracked by git
git ls-files --cached | grep -E 'creds|credentials|\.key|\.pem|\.tfvars|secret' || echo "PASS: no secret files tracked"

# Verify .gitignore protects credential files
git check-ignore infra/cloudflare/creds.json

# Check for secret-like files in git index
infra/cloudflare/scripts/check-secret-leaks.sh --strict
```
