#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path

import yaml


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate LiteLLM quota policy.")
    parser.add_argument("--tier", required=True, help="Tenant tier")
    parser.add_argument("--metric", required=True, help="Metric key in the selected tier")
    parser.add_argument("--usage", required=True, type=float, help="Current usage")
    parser.add_argument("--quantity", type=float, default=1.0, help="Requested increment")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    service_dir = Path(__file__).resolve().parent.parent
    policy_path = service_dir / "policies" / "quota-policy.yaml"
    policy = yaml.safe_load(policy_path.read_text(encoding="utf-8"))
    tiers = policy.get("tiers") or {}
    tier = tiers.get(args.tier)
    if tier is None:
        print(json.dumps({"ok": False, "reason": "unknown_tier"}))
        return 1

    limit = tier.get(args.metric)
    if limit is None:
        print(json.dumps({"ok": False, "reason": "unknown_metric"}))
        return 1

    projected = args.usage + args.quantity
    allowed = projected <= float(limit)
    print(
        json.dumps(
            {
                "ok": allowed,
                "tier": args.tier,
                "metric": args.metric,
                "limit": limit,
                "usage": args.usage,
                "quantity": args.quantity,
                "projected_usage": projected,
                "warning_threshold_ratio": (policy.get("enforcement") or {}).get("warning_threshold_ratio", 0.8),
            }
        )
    )
    return 0 if allowed else 1


if __name__ == "__main__":
    raise SystemExit(main())
