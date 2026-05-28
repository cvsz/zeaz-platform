#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import re
from dataclasses import dataclass
from typing import Dict, List
from urllib.parse import urlparse

REQUIRED_VARS = [
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_ZONE_ID",
    "CLOUDFLARE_API_TOKEN",
    "CLOUDFLARE_DNS_TOKEN",
    "CLOUDFLARE_WORKERS_TOKEN",
    "CLOUDFLARE_ZT_TOKEN",
    "CLOUDFLARE_WAF_TOKEN",
    "CLOUDFLARE_TUNNEL_TOKEN",
    "CLOUDFLARE_R2_TOKEN",
    "IDENTITY_PROVIDER_TYPE",
    "IDENTITY_PROVIDER_VENDOR",
    "IDENTITY_PROVIDER_METADATA_URL",
    "ENVIRONMENT",
    "REGION",
    "PRIMARY_DOMAIN",
    "ORIGIN_INFRA_TYPE",
    "ORIGIN_HOSTS",
    "TERRAFORM_BACKEND_TYPE",
    "SOPS_AGE_KEY",
    "SECRET_ROTATION_INTERVAL",
    "CLOUDFLARE_PLAN_TIER",
]
S3_BACKEND_REQUIRED_VARS = ["TERRAFORM_STATE_BUCKET", "TERRAFORM_LOCK_TABLE"]
TOKEN_VARS = [
    "CLOUDFLARE_API_TOKEN",
    "CLOUDFLARE_DNS_TOKEN",
    "CLOUDFLARE_WORKERS_TOKEN",
    "CLOUDFLARE_ZT_TOKEN",
    "CLOUDFLARE_WAF_TOKEN",
    "CLOUDFLARE_TUNNEL_TOKEN",
    "CLOUDFLARE_R2_TOKEN",
    "CLOUDFLARE_AUDIT_TOKEN",
    "CLOUDFLARE_AI_GATEWAY_TOKEN",
]
ALIASES = {
    "CLOUDFLARE_ACCOUNT_ID": ["CLOUDFLARE_ACCOUNT_ID"],
    "CLOUDFLARE_ZONE_ID": ["CLOUDFLARE_ZONE_ID"],
    "CLOUDFLARE_BOOTSTRAP_TOKEN": ["CLOUDFLARE_BOOTSTRAP_TOKEN"],
    "CLOUDFLARE_DNS_TOKEN": ["CLOUDFLARE_DNS_TOKEN"],
    "CLOUDFLARE_WORKERS_TOKEN": ["CLOUDFLARE_WORKERS_TOKEN"],
    "CLOUDFLARE_ZT_TOKEN": ["CLOUDFLARE_ZT_TOKEN"],
    "CLOUDFLARE_WAF_TOKEN": ["CLOUDFLARE_WAF_TOKEN"],
    "CLOUDFLARE_TUNNEL_TOKEN": ["CLOUDFLARE_TUNNEL_TOKEN"],
    "CLOUDFLARE_R2_TOKEN": ["CLOUDFLARE_R2_TOKEN"],
    "CLOUDFLARE_AUDIT_TOKEN": ["CLOUDFLARE_AUDIT_TOKEN"],
    "CLOUDFLARE_AI_GATEWAY_TOKEN": ["CLOUDFLARE_AI_GATEWAY_TOKEN"],
    "CLOUDFLARE_AI_GATEWAY_SLUG": ["CLOUDFLARE_AI_GATEWAY_SLUG"],
}
HEX_ID_RE = re.compile(r"^[a-f0-9]{32}$", re.IGNORECASE)
HOSTNAME_RE = re.compile(r"^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*$")
DURATION_RE = re.compile(r"^(?P<value>[1-9][0-9]*)(?P<unit>[smhdw]?)$", re.IGNORECASE)
PLAN_TIERS = {"free", "pro", "business", "enterprise"}
PLAN_TIER_DISPLAY = "Free, Pro, Business, Enterprise"
ENVIRONMENTS = {"dev", "staging", "prod"}
IDP_TYPES = {"saml", "oidc"}
BACKEND_TYPES = {"local", "s3"}
ORIGIN_INFRA_TYPES = {"vm", "kubernetes", "serverless", "hybrid", "self-hosted"}
BOOL_TEXT = {"true", "false"}
PAID_OVERRIDE_FLAGS = [
    "ALLOW_PAID_CLOUDFLARE_FEATURES",
    "ALLOW_R2_WRITE",
    "ALLOW_WORKERS_DEPLOY",
    "ALLOW_LOAD_BALANCING",
    "ALLOW_ADVANCED_WAF",
    "ALLOW_LOGPUSH",
]


@dataclass(frozen=True)
class ValidationResult:
    ok: bool
    errors: List[str]
    warnings: List[str]


def _normalise_aliases(env: Dict[str, str]) -> Dict[str, str]:
    normalized = dict(env)
    for canonical, aliases in ALIASES.items():
        if normalized.get(canonical, "").strip():
            continue
        for alias in aliases:
            value = normalized.get(alias, "").strip()
            if value:
                normalized[canonical] = value
                break
    return normalized


def _is_valid_url(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme == "https" and bool(parsed.netloc)


def _parse_origin_hosts(value: str) -> bool:
    candidate = value.strip()
    if not candidate:
        return False

    hosts: List[str]
    if candidate.startswith("["):
        try:
            parsed = json.loads(candidate)
        except json.JSONDecodeError:
            return False
        if not isinstance(parsed, list) or not parsed:
            return False
        if not all(isinstance(item, str) for item in parsed):
            return False
        hosts = [item.strip() for item in parsed]
    else:
        hosts = [item.strip() for item in candidate.split(",")]

    return all(host and HOSTNAME_RE.match(host) for host in hosts)


def validate(env: Dict[str, str]) -> List[str]:
    return validate_with_warnings(env).errors


def validate_with_warnings(env: Dict[str, str]) -> ValidationResult:
    env = _normalise_aliases(env)
    errors: List[str] = []
    warnings: List[str] = []

    for name in REQUIRED_VARS:
        if not env.get(name, "").strip():
            errors.append(f"{name}: missing")

    backend_type = env.get("TERRAFORM_BACKEND_TYPE", "").strip().lower()
    if backend_type and backend_type not in BACKEND_TYPES:
        errors.append("TERRAFORM_BACKEND_TYPE: must be local or s3")
    if backend_type == "s3":
        for name in S3_BACKEND_REQUIRED_VARS:
            if not env.get(name, "").strip():
                errors.append(f"{name}: missing for s3 backend")

    for id_key in ("CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_ZONE_ID"):
        value = env.get(id_key, "").strip()
        if value and not HEX_ID_RE.fullmatch(value):
            errors.append(f"{id_key}: must be a 32-character hexadecimal string")

    for token_key in TOKEN_VARS:
        value = env.get(token_key, "")
        if value and len(value.strip()) < 20:
            warnings.append(f"{token_key}: token length is unexpectedly short")

    environment = env.get("ENVIRONMENT", "").strip().lower()
    if environment and environment not in ENVIRONMENTS:
        errors.append("ENVIRONMENT: must be one of dev, staging, prod")

    plan = env.get("CLOUDFLARE_PLAN_TIER", "").strip().lower()
    if plan and plan not in PLAN_TIERS:
        errors.append(f"CLOUDFLARE_PLAN_TIER: must be one of {PLAN_TIER_DISPLAY}")

    cost_lock = env.get("COST_LOCK", "true").strip().lower()
    if cost_lock and cost_lock not in BOOL_TEXT:
        errors.append("COST_LOCK: must be true or false")
    if plan == "free" and cost_lock == "false":
        warnings.append("COST_LOCK=false while CLOUDFLARE_PLAN_TIER=Free")
    if plan == "free" and cost_lock != "false":
        for flag in PAID_OVERRIDE_FLAGS:
            value = env.get(flag, "false").strip().lower()
            if value and value not in BOOL_TEXT:
                errors.append(f"{flag}: must be true or false")
            if value == "true":
                warnings.append(f"{flag}=true while Free plan cost lock is active")

    idp_type = env.get("IDENTITY_PROVIDER_TYPE", "").strip().lower()
    if idp_type and idp_type not in IDP_TYPES:
        errors.append("IDENTITY_PROVIDER_TYPE: must be saml or oidc")

    metadata_url = env.get("IDENTITY_PROVIDER_METADATA_URL", "")
    if metadata_url and not _is_valid_url(metadata_url):
        errors.append("IDENTITY_PROVIDER_METADATA_URL: must be a valid https URL")

    origin_type = env.get("ORIGIN_INFRA_TYPE", "").strip().lower()
    if origin_type and origin_type not in ORIGIN_INFRA_TYPES:
        errors.append("ORIGIN_INFRA_TYPE: must be vm, kubernetes, serverless, hybrid, or self-hosted")

    origin_hosts = env.get("ORIGIN_HOSTS", "")
    if origin_hosts and not _parse_origin_hosts(origin_hosts):
        errors.append("ORIGIN_HOSTS: must be a comma-separated hostname list or JSON string array")

    secret_rotation_interval = env.get("SECRET_ROTATION_INTERVAL", "")
    if secret_rotation_interval:
        m = DURATION_RE.fullmatch(secret_rotation_interval.strip())
        if not m:
            errors.append("SECRET_ROTATION_INTERVAL: must be a positive duration, e.g. 30d, 12h, or 45")

    return ValidationResult(ok=not errors, errors=errors, warnings=warnings)


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Validate Cloudflare platform runtime environment")
    parser.add_argument("--json", action="store_true", help="Emit JSON output")
    parser.add_argument("--strict", action="store_true", help="Treat warnings as failures")
    return parser


def main() -> int:
    parser = _build_parser()
    args = parser.parse_args()
    result = validate_with_warnings(dict(os.environ))

    if args.json:
        print(json.dumps({"ok": result.ok and (not args.strict or not result.warnings), "errors": result.errors, "warnings": result.warnings}))
    else:
        if result.errors:
            for error in result.errors:
                print(f"ERROR: {error}")
        if result.warnings:
            for warning in result.warnings:
                print(f"WARN: {warning}")
        if result.ok and not result.warnings:
            print("Environment validation passed")

    if result.errors:
        return 1
    if args.strict and result.warnings:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())