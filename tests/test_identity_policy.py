from pathlib import Path


def test_identity_provider_templates_present_and_safe():
    content = Path("zero-trust/identity-providers.yaml").read_text()
    assert "zeazdev-ai-saml" in content
    assert "zeazdev-finance-saml" in content
    assert "IDENTITY_PROVIDER_TYPE=oidc" in content
    assert "key_storage: external_only" in content
    assert "metadata_url: ${IDENTITY_PROVIDER_METADATA_URL}" in content


def test_fintech_access_apps_require_webauthn_and_short_ttl():
    content = Path("zero-trust/policies.yaml").read_text()
    for app_key in ["app", "pay", "treasury", "admin-wallet"]:
        assert f"- app_key: {app_key}" in content
    assert content.count("session_ttl: 4h") >= 4
    assert "require: [mfa, webauthn, valid_service_token]" in content
    assert "require: [mfa, webauthn, valid_service_token, step_up_auth]" in content
