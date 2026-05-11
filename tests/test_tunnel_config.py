from pathlib import Path

DOMAINS = [
    "auth.zeaz.dev",
    "zveo.zeaz.dev",
    "studio.zeaz.dev",
    "analytics.zeaz.dev",
    "app.zeaz.dev",
    "pay.zeaz.dev",
    "treasury.zeaz.dev",
    "admin-wallet.zeaz.dev",
]


def test_tunnel_config_has_all_required_ingress_mappings():
    content = Path("tunnels/config.yaml").read_text()
    assert "healthchecks:" in content
    assert "failover_origins:" in content
    for domain in DOMAINS:
        assert f"hostname: {domain}" in content


def test_tunnel_config_does_not_commit_token_or_secret():
    content = Path("tunnels/config.yaml").read_text()
    assert "TUNNEL_TOKEN" not in content
    assert "credentials-file:" not in content
    assert "tunnel_secret" not in content
