#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path

import yaml


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate LiteLLM access policy.")
    parser.add_argument("--email", required=True, help="User email")
    parser.add_argument("--groups", required=True, help="Comma-separated group names")
    parser.add_argument(
        "--action",
        choices=("read", "draft", "publish"),
        default="read",
        help="Requested action",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    service_dir = Path(__file__).resolve().parent.parent
    policy_path = service_dir / "policies" / "access-policy.yaml"
    policy = yaml.safe_load(policy_path.read_text(encoding="utf-8"))

    groups = {item.strip() for item in args.groups.split(",") if item.strip()}
    allowed_domain = (policy.get("identity") or {}).get("default_allowed_email_domain", "")
    required_groups = set((policy.get("identity") or {}).get("required_groups") or [])
    authorization = policy.get("authorization") or {}

    if allowed_domain and not args.email.endswith(f"@{allowed_domain}"):
        print(json.dumps({"ok": False, "reason": "email_domain_not_allowed"}))
        return 1

    if not groups.intersection(required_groups):
        print(json.dumps({"ok": False, "reason": "missing_required_group"}))
        return 1

    if args.action == "publish":
        allowed_groups = set(authorization.get("publish_groups") or [])
    elif args.action == "draft":
        allowed_groups = set(authorization.get("draft_groups") or [])
    else:
        allowed_groups = required_groups

    allowed = bool(groups.intersection(allowed_groups))
    print(
        json.dumps(
            {
                "ok": allowed,
                "action": args.action,
                "email": args.email,
                "matched_groups": sorted(groups.intersection(allowed_groups)),
                "required_groups": sorted(allowed_groups),
            }
        )
    )
    return 0 if allowed else 1


if __name__ == "__main__":
    raise SystemExit(main())
