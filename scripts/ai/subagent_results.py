#!/usr/bin/env python3
"""Store and retrieve sub-agent result payloads in the local repository."""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_STORE = ROOT / "artifacts" / "subagents" / "results"


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def slugify(value: str) -> str:
    value = re.sub(r"[^A-Za-z0-9._-]+", "-", value.strip())
    return value.strip("-") or "unknown-agent"


def ensure_store(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def load_summary(args: argparse.Namespace) -> str:
    if args.summary:
        return args.summary.strip()
    if args.summary_file:
        return Path(args.summary_file).read_text(encoding="utf-8").strip()
    if args.summary_stdin:
        return sys.stdin.read().strip()
    raise SystemExit("summary is required: use --summary, --summary-file, or --summary-stdin")


def load_details(args: argparse.Namespace) -> str:
    if args.details:
        return args.details.strip()
    if args.details_file:
        return Path(args.details_file).read_text(encoding="utf-8").strip()
    return ""


def list_records(store: Path) -> list[Path]:
    if not store.exists():
        return []
    return sorted(store.glob("*.json"), reverse=True)


def read_record(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_record(store: Path, payload: dict[str, Any]) -> Path:
    ensure_store(store)
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    filename = f"{ts}-{slugify(payload['agent_id'])}.json"
    target = store / filename
    target.write_text(json.dumps(payload, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
    return target


def cmd_submit(args: argparse.Namespace) -> int:
    summary = load_summary(args)
    details = load_details(args)
    payload = {
        "agent_id": args.agent_id,
        "nickname": args.nickname or "",
        "agent_name": args.agent_name or "",
        "status": args.status,
        "role": args.role or "",
        "source": args.source,
        "created_at": utc_now(),
        "summary": summary,
        "details": details,
        "artifacts": args.artifact or [],
        "metadata": json.loads(args.metadata) if args.metadata else {},
    }
    target = write_record(Path(args.store), payload)
    if args.json:
        print(json.dumps({"ok": True, "path": str(target), "agent_id": args.agent_id}))
    else:
        print(f"saved sub-agent result: {target}")
    return 0


def match_record(record: dict[str, Any], args: argparse.Namespace) -> bool:
    if args.agent_id and record.get("agent_id") != args.agent_id:
        return False
    if args.nickname and record.get("nickname") != args.nickname:
        return False
    if args.status and record.get("status") != args.status:
        return False
    return True


def cmd_list(args: argparse.Namespace) -> int:
    records = [read_record(path) for path in list_records(Path(args.store))]
    filtered = [record for record in records if match_record(record, args)]
    if args.limit:
        filtered = filtered[: args.limit]

    if args.json:
        print(json.dumps(filtered, indent=2, ensure_ascii=True))
        return 0

    if not filtered:
        print("no sub-agent results found")
        return 0

    for record in filtered:
        nickname = f" ({record['nickname']})" if record.get("nickname") else ""
        print(
            f"{record['created_at']}  {record['agent_id']}{nickname}  "
            f"status={record['status']}  role={record.get('role','')}"
        )
        print(f"  summary: {record['summary']}")
        if record.get("artifacts"):
            print(f"  artifacts: {', '.join(record['artifacts'])}")
    return 0


def cmd_get(args: argparse.Namespace) -> int:
    for path in list_records(Path(args.store)):
        record = read_record(path)
        if match_record(record, args):
            if args.json:
                print(json.dumps(record, indent=2, ensure_ascii=True))
            else:
                nickname = f" ({record['nickname']})" if record.get("nickname") else ""
                print(f"agent_id: {record['agent_id']}{nickname}")
                print(f"status: {record['status']}")
                print(f"role: {record.get('role', '')}")
                print(f"source: {record['source']}")
                print(f"created_at: {record['created_at']}")
                print("")
                print("summary:")
                print(record["summary"])
                if record.get("details"):
                    print("")
                    print("details:")
                    print(record["details"])
                if record.get("artifacts"):
                    print("")
                    print("artifacts:")
                    for artifact in record["artifacts"]:
                        print(f"- {artifact}")
            return 0

    print("sub-agent result not found", file=sys.stderr)
    return 1


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Store and retrieve sub-agent result payloads.")
    parser.add_argument("--store", default=str(DEFAULT_STORE), help="Directory used for result JSON records.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    submit = subparsers.add_parser("submit", help="Store a new sub-agent result.")
    submit.add_argument("--agent-id", required=True)
    submit.add_argument("--nickname")
    submit.add_argument("--agent-name")
    submit.add_argument("--role")
    submit.add_argument("--status", default="completed")
    submit.add_argument("--source", default="manual")
    submit.add_argument("--summary")
    submit.add_argument("--summary-file")
    submit.add_argument("--summary-stdin", action="store_true")
    submit.add_argument("--details")
    submit.add_argument("--details-file")
    submit.add_argument("--artifact", action="append")
    submit.add_argument("--metadata", help="JSON object string")
    submit.add_argument("--json", action="store_true")
    submit.set_defaults(func=cmd_submit)

    list_cmd = subparsers.add_parser("list", help="List stored sub-agent results.")
    list_cmd.add_argument("--agent-id")
    list_cmd.add_argument("--nickname")
    list_cmd.add_argument("--status")
    list_cmd.add_argument("--limit", type=int, default=20)
    list_cmd.add_argument("--json", action="store_true")
    list_cmd.set_defaults(func=cmd_list)

    get_cmd = subparsers.add_parser("get", help="Get the latest stored result for an agent.")
    get_cmd.add_argument("--agent-id")
    get_cmd.add_argument("--nickname")
    get_cmd.add_argument("--status")
    get_cmd.add_argument("--json", action="store_true")
    get_cmd.set_defaults(func=cmd_get)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
