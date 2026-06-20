# Terraform Provider Signing Automation

This pack fixes the "script หลุด" problem by shipping real files instead of a giant nested heredoc installer.

## What it creates

- RSA 4096 GPG key for Terraform provider signing
- Public key export for Terraform Registry
- GitHub Actions secrets setup
- Local signing verification
- GoReleaser config for signed provider releases
- GitHub Actions release workflow

## Important

Terraform Registry provider signing should use **RSA 4096**, not default ECC keys.

Never commit `.secrets/`, private keys, or passphrases.

## Install into your provider repo

From your Terraform provider repo root:

```bash
unzip terraform-provider-signing-automation.zip
rsync -a terraform-provider-signing-automation/ ./
chmod +x scripts/*.sh install-to-current-repo.sh
```

Or, if you extracted somewhere else:

```bash
bash install-to-current-repo.sh /path/to/your/terraform-provider-repo
```

## 1. Generate RSA GPG key

```bash
GPG_NAME="ZeaZDev Terraform Provider Signing" \
GPG_EMAIL="security@zeaz.dev" \
GPG_PASSPHRASE="CHANGE_ME_STRONG_SECRET" \
bash scripts/bootstrap-rsa-gpg-key.sh
```

Outputs:

```text
.secrets/terraform-provider-public.gpg
.secrets/terraform-provider-private.gpg
.secrets/GPG_KEY_ID.txt
.secrets/GPG_FINGERPRINT.txt
```

## 2. Upload public key to Terraform Registry

Upload:

```text
.secrets/terraform-provider-public.gpg
```

to:

```text
Terraform Registry -> User Settings -> Signing Keys
```

## 3. Test signing locally

```bash
GPG_KEY_ID="$(cat .secrets/GPG_KEY_ID.txt)" \
GPG_PASSPHRASE="CHANGE_ME_STRONG_SECRET" \
bash scripts/sign-test.sh
```

## 4. Upload GitHub Actions secrets

Requires `gh auth login`.

```bash
GPG_PRIVATE_KEY_PATH=".secrets/terraform-provider-private.gpg" \
GPG_PASSPHRASE="CHANGE_ME_STRONG_SECRET" \
bash scripts/setup-github-secrets.sh
```

Creates GitHub secrets:

```text
GPG_PRIVATE_KEY
GPG_KEY_ID
PASSPHRASE
```

## 5. Edit provider name

Update `.goreleaser.yml`:

```yaml
project_name: terraform-provider-zeaz
release:
  github:
    owner: cvsz
    name: terraform-provider-zeaz
```

Change to your actual GitHub repository.

## 6. Release

```bash
git add .
git commit -m "chore: add terraform provider signing automation"
git tag v0.1.0
git push origin main
git push origin v0.1.0
```

GitHub Actions will build, checksum, sign, and publish the release.
