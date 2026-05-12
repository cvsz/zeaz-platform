#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, os, re
from urllib.parse import urlparse

REQ=["CF_ACCOUNT_ID","CF_ZONE_ID","CF_API_TOKEN","CF_DNS_TOKEN","CF_WORKERS_TOKEN","CF_ZT_TOKEN","CF_WAF_TOKEN","CF_TUNNEL_TOKEN","CF_R2_TOKEN","IDENTITY_PROVIDER_TYPE","IDENTITY_PROVIDER_VENDOR","IDENTITY_PROVIDER_METADATA_URL","ENVIRONMENT","REGION","PRIMARY_DOMAIN","ORIGIN_INFRA_TYPE","ORIGIN_HOSTS","TERRAFORM_BACKEND_TYPE","TERRAFORM_STATE_BUCKET","TERRAFORM_LOCK_TABLE","SOPS_AGE_KEY","SECRET_ROTATION_INTERVAL","CLOUDFLARE_PLAN_TIER"]
HEX32=re.compile(r"^[a-fA-F0-9]{32}$")
DAYS=re.compile(r"^[1-9][0-9]*$")


def parse_origin_hosts(value:str)->bool:
    value=value.strip()
    if value.startswith("["):
        try:
            arr=json.loads(value)
            return isinstance(arr,list) and all(isinstance(x,str) and x.strip() for x in arr)
        except Exception:
            return False
    return all(x.strip() for x in value.split(","))


def validate(env:dict[str,str])->list[str]:
    errs=[]
    for k in REQ:
        if not env.get(k): errs.append(f"{k}: missing")
    if env.get("CF_ACCOUNT_ID") and not HEX32.match(env["CF_ACCOUNT_ID"]): errs.append("CF_ACCOUNT_ID: must be 32-char hex")
    if env.get("CF_ZONE_ID") and not HEX32.match(env["CF_ZONE_ID"]): errs.append("CF_ZONE_ID: must be 32-char hex")
    if env.get("ENVIRONMENT") not in {"dev","staging","prod"}: errs.append("ENVIRONMENT: must be dev|staging|prod")
    if env.get("CLOUDFLARE_PLAN_TIER") not in {"Free","Pro","Business","Enterprise"}: errs.append("CLOUDFLARE_PLAN_TIER: invalid")
    if env.get("IDENTITY_PROVIDER_TYPE") not in {"saml","oidc"}: errs.append("IDENTITY_PROVIDER_TYPE: must be saml|oidc")
    if env.get("IDENTITY_PROVIDER_METADATA_URL"):
        u=urlparse(env["IDENTITY_PROVIDER_METADATA_URL"])
        if u.scheme not in {"http","https"} or not u.netloc: errs.append("IDENTITY_PROVIDER_METADATA_URL: invalid URL")
    if env.get("ORIGIN_HOSTS") and not parse_origin_hosts(env["ORIGIN_HOSTS"]): errs.append("ORIGIN_HOSTS: invalid list")
    if env.get("SECRET_ROTATION_INTERVAL") and not DAYS.match(env["SECRET_ROTATION_INTERVAL"]): errs.append("SECRET_ROTATION_INTERVAL: must be integer days, e.g. 30")
    return errs


def main()->int:
    ap=argparse.ArgumentParser()
    ap.add_argument("--json",action="store_true")
    ap.add_argument("--strict",action="store_true")
    args=ap.parse_args()
    errs=validate(dict(os.environ))
    out={"ok": not errs, "errors": errs}
    if args.json:
        print(json.dumps(out))
    else:
        if errs:
            for e in errs: print(f"ERROR: {e}")
        else:
            print("Environment validation passed")
    return 1 if errs and args.strict else 0 if not errs else 1

if __name__=="__main__":
    raise SystemExit(main())
