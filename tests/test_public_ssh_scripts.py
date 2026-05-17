import os
import stat
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = ROOT / "ops" / "bin"
SSH_SCRIPTS = [
    SCRIPT_DIR / "zeaz-ssh-origin-setup",
    SCRIPT_DIR / "zeaz-ssh-origin-health",
    SCRIPT_DIR / "zeaz-cloudflare-ssh-route",
    SCRIPT_DIR / "zeaz-ssh-public-health",
]


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def test_public_ssh_scripts_exist_are_executable_and_have_safe_bash_preamble():
    for script in SSH_SCRIPTS:
        mode = script.stat().st_mode
        content = read(script)
        assert content.startswith("#!/usr/bin/env bash\nset -euo pipefail\n")
        assert mode & stat.S_IXUSR, f"{script} must be executable"
        subprocess.run(["bash", "-n", str(script)], check=True)


def test_origin_setup_preserves_port_22_and_validates_before_restart():
    content = read(SCRIPT_DIR / "zeaz-ssh-origin-setup")
    assert "Port ${PORT}" in content
    assert "PermitRootLogin no" in content
    assert "PubkeyAuthentication yes" in content
    assert "PasswordAuthentication no" in content
    assert "KbdInteractiveAuthentication no" in content
    assert "X11Forwarding no" in content
    assert "sshd -t -f" in content
    assert "cp -p \"${SSHD_CONFIG}\" \"${backup}\"" in content
    assert "Port 22" not in content
    assert "rm -rf" not in content


def test_cloudflare_route_script_has_manual_mode_and_preserves_ingress():
    content = read(SCRIPT_DIR / "zeaz-cloudflare-ssh-route")
    assert "CF_API_TOKEN CF_ACCOUNT_ID CF_TUNNEL_ID" in content
    assert "Manual Cloudflare Zero Trust dashboard steps" in content
    assert "ssh.zeaz.dev" in content
    assert "ssh://127.0.0.1:22022" in content
    assert "$preserved + [{hostname: $hostname, service: $service}] + $catchall" in content
    assert "Authorization: Bearer ${CF_API_TOKEN}" in content
    assert "token was not printed" in content


def test_cloudflare_route_manual_mode_does_not_require_credentials_or_mutate_api():
    env = os.environ.copy()
    for key in ("CF_API_TOKEN", "CF_ACCOUNT_ID", "CF_TUNNEL_ID"):
        env.pop(key, None)
    result = subprocess.run(
        [str(SCRIPT_DIR / "zeaz-cloudflare-ssh-route")],
        check=True,
        env=env,
        text=True,
        capture_output=True,
    )
    assert "[SKIP] Cloudflare API environment not fully configured" in result.stdout
    assert "[WARN] Missing API environment variables: CF_API_TOKEN,CF_ACCOUNT_ID,CF_TUNNEL_ID" in result.stdout
    assert "ssh.zeaz.dev" in result.stdout
    assert "127.0.0.1:22022" in result.stdout


def test_public_ssh_docs_include_client_and_troubleshooting_steps():
    content = read(ROOT / "docs" / "public-ssh.md")
    assert "ssh.zeaz.dev -> ssh://127.0.0.1:22022" in content
    assert "Host zeaz-platform" in content
    assert "ProxyCommand cloudflared access ssh --hostname %h" in content
    assert "ssh zeaz-platform" in content
    assert "cloudflared status" in content
    assert "systemctl status ssh" in content
    assert "ss -ltn" in content
