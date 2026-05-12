from python.cfstack_validate_env import validate


def base_env():
    return {
        "CF_ACCOUNT_ID": "a" * 32,
        "CF_ZONE_ID": "b" * 32,
        "CF_API_TOKEN": "tok1",
        "CF_DNS_TOKEN": "tok2",
        "CF_WORKERS_TOKEN": "tok3",
        "CF_ZT_TOKEN": "tok4",
        "CF_WAF_TOKEN": "tok5",
        "CF_TUNNEL_TOKEN": "tok6",
        "CF_R2_TOKEN": "tok7",
        "IDENTITY_PROVIDER_TYPE": "saml",
        "IDENTITY_PROVIDER_VENDOR": "okta",
        "IDENTITY_PROVIDER_METADATA_URL": "https://idp.example.com/metadata",
        "ENVIRONMENT": "dev",
        "REGION": "us-east-1",
        "PRIMARY_DOMAIN": "zeaz.dev",
        "ORIGIN_INFRA_TYPE": "self-hosted",
        "ORIGIN_HOSTS": "host1,host2",
        "TERRAFORM_BACKEND_TYPE": "s3",
        "TERRAFORM_STATE_BUCKET": "state-bucket",
        "TERRAFORM_LOCK_TABLE": "locks",
        "SOPS_AGE_KEY": "AGE-SECRET-KEY-1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "SECRET_ROTATION_INTERVAL": "30",
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
    env["IDENTITY_PROVIDER_METADATA_URL"] = "idp.local/metadata"
    assert any("IDENTITY_PROVIDER_METADATA_URL" in e for e in validate(env))
