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
        "SOPS_AGE_KEY": "age-key-placeholder-for-tests-only",
        "SECRET_ROTATION_INTERVAL": "30d",
        "CLOUDFLARE_PLAN_TIER": "Pro",
        "COST_LOCK": "true",
        "ALLOW_PAID_CLOUDFLARE_FEATURES": "false",
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


def test_free_local_backend_does_not_require_remote_state_names():
    env = base_env()
    env["CLOUDFLARE_PLAN_TIER"] = "Free"
    env["TERRAFORM_BACKEND_TYPE"] = "local"
    env["TERRAFORM_STATE_BUCKET"] = ""
    env["TERRAFORM_LOCK_TABLE"] = ""
    assert validate(env) == []


def test_free_plan_paid_override_warns():
    env = base_env()
    env["CLOUDFLARE_PLAN_TIER"] = "Free"
    env["COST_LOCK"] = "true"
    env["ALLOW_WORKERS_DEPLOY"] = "true"
    result = validate_with_warnings(env)
    assert any("ALLOW_WORKERS_DEPLOY" in warning for warning in result.warnings)


def test_legacy_cloudflare_aliases_are_accepted():
    env = base_env()
    env["CLOUDFLARE_ACCOUNT_ID"] = env.pop("CF_ACCOUNT_ID")
    env["CLOUDFLARE_ZONE_ID"] = env.pop("CF_ZONE_ID")
    env["CLOUDFLARE_DNS_TOKEN"] = env.pop("CF_DNS_TOKEN")
    assert validate(env) == []
