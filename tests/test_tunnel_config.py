from pathlib import Path

HOSTS = [
    "auth",
    "zveo",
    "studio",
    "analytics",
    "app",
    "pay",
    "treasury",
    "admin-wallet",
]


def test_tunnel_config_has_required_ingress_mappings_and_origin_hosts_contract():
    content = Path("tunnels/config.yaml").read_text()
    assert "required_env:" in content
    assert "- ORIGIN_HOSTS" in content
    assert "failover_origins_from: ORIGIN_HOSTS" in content
    for host in HOSTS:
        assert f"hostname: {host}.${{PRIMARY_DOMAIN}}" in content
        assert f"service_from_origin_hosts: {host}" in content


def test_tunnel_config_does_not_commit_token_or_secret():
    content = Path("tunnels/config.yaml").read_text()
    assert "TUNNEL_TOKEN" not in content
    assert "credentials-file:" not in content
    assert "tunnel_secret" not in content
