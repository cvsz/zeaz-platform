from pathlib import Path


def test_identity_provider_templates_present_and_safe():
    content = Path("zero-trust/identity-providers.yaml").read_text()
    assert "zeazdev-ai-saml" in content
    assert "zeazdev-finance-saml" in content
    assert "IDENTITY_PROVIDER_TYPE=oidc" in content
    assert "key_storage: external_only" in content
    assert "metadata_url: ${IDENTITY_PROVIDER_METADATA_URL}" in content
