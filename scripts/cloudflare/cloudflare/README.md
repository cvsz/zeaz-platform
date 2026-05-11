# Cloudflare API Token Generator

Generates one scoped Cloudflare API token per service.

## Required ENV

```bash
export CF_EMAIL="admin@zeaz.dev"
export CF_GLOBAL_API_KEY="YOUR_GLOBAL_API_KEY"
```

## Dependencies

```bash
sudo apt-get update && sudo apt-get install -y jq curl
```

## Usage

```bash
bash scripts/cloudflare/gen-token.sh <type>
```

| Type      | Token Name            | Scope         |
| --------- | --------------------- | ------------- |
| `dns`     | zeaz-dns-token        | Zone          |
| `workers` | zeaz-workers-token    | Account       |
| `zt`      | zeaz-zt-token         | Account       |
| `waf`     | zeaz-waf-token        | Zone          |
| `tunnel`  | zeaz-tunnel-token     | Account       |
| `r2`      | zeaz-r2-token         | Account       |

## Expected Output

```text
=========================================
TOKEN TYPE
=========================================
dns

=========================================
TOKEN
=========================================
v1.0-xxxxxxxxxxxxxxxx

=========================================
EXPORT
=========================================
export CF_DNS_TOKEN="v1.0-xxxxxxxxxxxxxxxx"
```

## Security

**NEVER commit secrets.** Add to `.gitignore`:

```
secrets/
*.env
*.tfvars
```

## Production Strategy

| Area                   | Strategy         |
| ---------------------- | ---------------- |
| Initial Token Creation | Manual preferred |
| Validation             | Automated        |
| Rotation Metadata      | Automated        |
| GitHub Sync            | Automated        |
| Terraform Injection    | Automated        |

> Cloudflare intentionally restricts fully automated privileged token
> issuance in many org configurations.
