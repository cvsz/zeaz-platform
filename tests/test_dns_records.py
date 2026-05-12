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


def test_dns_records_uses_primary_domain_suffix_template_and_cname_model():
    content = Path("dns/records.yaml").read_text()
    assert "primary_domain: zeaz.dev" in content
    assert "required_env:" in content
    assert "- PRIMARY_DOMAIN" in content
    assert "target_from: tunnel_endpoint" in content
    for host in HOSTS:
        assert f"fqdn: {host}.${{PRIMARY_DOMAIN}}" in content


def test_dns_records_avoid_hardcoded_ip_targets():
    content = Path("dns/records.yaml").read_text().lower()
    assert "type: a" not in content
    assert "type: aaaa" not in content
