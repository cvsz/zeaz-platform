from python.cfstack_validate_env import validate, validate_with_warnings


def base_env():
    return {
        "CF_ACCOUNT_ID": "a" * 32,
        "CF_ZONE_ID": "b" * 32,
        "CLOUDFLARE_API_TOKEN": "tok" * 20,
        "CF_DNS_TOKEN": "tok" * 20,
        "CF_WORKERS_TOKEN": "tok" * 20,
        "CF_ZT_TOKEN": "tok" * 20,
        "CF_WAF_TOKEN": "tok" * 20,
        "CF_TUNNEL_TOKEN": "tok" * 20,
        "CF_R2_TOKEN": "tok" * 20,
        "IDENTITY_PROVIDER_TYPE": "saml",
        "IDENTITY_PROVIDER_VENDOR": "okta",
        "IDENTITY_PROVIDER_METADATA_URL": "https://idp.example.com/metadata",
        "ENVIRONMENT": "dev",
        "REGION": "us-east-1",
        "PRIMARY_DOMAIN": "zeaz.dev",
        "ORIGIN_INFRA_TYPE": "self-hosted",
        "ORIGIN_HOSTS": "app.internal,pay.internal",
        "TERRAFORM_BACKEND_TYPE": "s3",
        "TERRAFORM_STATE_BUCKET": "state-bucket",
        "TERRAFORM_LOCK_TABLE": "locks",
        "SOPS_AGE_KEY": "AGE-SECRET-KEY-1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "SECRET_ROTATION_INTERVAL": "30d",
        "CLOUDFLARE_PLAN_TIER": "Pro",
    }


def test_valid_env_has_no_errors():
    assert validate(base_env()) == []


def test_invalid_environment_fails():
    env = base_env()
    env["ENVIRONMENT"] = "production"
    assert any("ENVIRONMENT" in e for e in validate(env))


def test_origin_hosts_json_supported():
    env = base_env()
    env["ORIGIN_HOSTS"] = '["app.internal","pay.internal"]'
    assert validate(env) == []


def test_origin_hosts_invalid_fails():
    env = base_env()
    env["ORIGIN_HOSTS"] = '["app.internal", 10]'
    assert any("ORIGIN_HOSTS" in e for e in validate(env))


def test_missing_required_var_fails():
    env = base_env()
    env.pop("CF_ZONE_ID")
    assert any("CF_ZONE_ID" in e for e in validate(env))


def test_invalid_plan_tier_fails():
    env = base_env()
    env["CLOUDFLARE_PLAN_TIER"] = "Starter"
    assert any("CLOUDFLARE_PLAN_TIER" in e for e in validate(env))


def test_invalid_metadata_url_fails():
    env = base_env()
    env["IDENTITY_PROVIDER_METADATA_URL"] = "http://idp.local/metadata"
    assert any("IDENTITY_PROVIDER_METADATA_URL" in e for e in validate(env))


def test_duration_must_be_positive_duration():
    env = base_env()
    env["SECRET_ROTATION_INTERVAL"] = "0d"
    assert any("SECRET_ROTATION_INTERVAL" in e for e in validate(env))


def test_short_token_warns():
    env = base_env()
    env["CLOUDFLARE_API_TOKEN"] = "short"
    result = validate_with_warnings(env)
    assert any("CLOUDFLARE_API_TOKEN" in w for w in result.warnings)
