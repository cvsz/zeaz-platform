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


def test_dns_records_contains_all_domains_and_tunnel_model():
    content = Path("dns/records.yaml").read_text()
    assert "primary_domain: zeaz.dev" in content
    assert "target_from: tunnel_endpoint" in content
    for domain in DOMAINS:
        assert f"fqdn: {domain}" in content


def test_dns_records_avoid_hardcoded_ip_targets():
    content = Path("dns/records.yaml").read_text().lower()
    assert "type: a" not in content
    assert "type: aaaa" not in content
