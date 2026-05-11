from pathlib import Path


def test_fintech_access_security_floor():
    content = Path("policies/fintech-access.yaml").read_text()
    assert "mfa: required" in content
    assert "webauthn: required" in content
    assert "session_ttl_max_hours: 4" in content
    assert "enabled_when_plan: Enterprise" in content


def test_fintech_jwt_validation_required():
    content = Path("policies/fintech-jwt.yaml").read_text()
    assert "required: true" in content
    assert "require_claims: [sub, exp, iat, iss, aud, scope]" in content
