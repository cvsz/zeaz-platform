#!/usr/bin/env python3
from __future__ import annotations

import argparse
import fnmatch
import json
import os
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any


def repo_root() -> Path:
    result = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    if result.returncode == 0 and result.stdout.strip():
        return Path(result.stdout.strip())
    return Path.cwd()


ROOT = repo_root()
DEFAULT_CONFIG = ROOT / "configs/repos/cvsz-apps-merge-map.json"


@dataclass(frozen=True)
class CommandResult:
    returncode: int
    stdout: str
    stderr: str


def run(cmd: list[str], cwd: Path = ROOT) -> CommandResult:
    result = subprocess.run(
        cmd,
        cwd=str(cwd),
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    return CommandResult(result.returncode, result.stdout.strip(), result.stderr.strip())


def git_lines(args: list[str]) -> list[str]:
    result = run(["git", *args])
    if result.returncode != 0 or not result.stdout:
        return []
    return result.stdout.splitlines()


def safe_rel(path: Path) -> str:
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def load_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise SystemExit(f"ERROR: missing config {safe_rel(path)}") from None
    except json.JSONDecodeError as exc:
        raise SystemExit(f"ERROR: invalid JSON in {safe_rel(path)}: {exc}") from None


def first_ignore_reason(path: Path) -> str:
    rel = safe_rel(path)
    result = run(["git", "check-ignore", "-v", "--no-index", "--", rel])
    if result.returncode == 0:
        return result.stdout.splitlines()[0]
    if path.is_dir():
        result = run(["git", "check-ignore", "-v", "--no-index", "--", f"{rel}/"])
        if result.returncode == 0:
            return result.stdout.splitlines()[0]
    return ""


def parse_import_source(path: Path) -> dict[str, str]:
    source = path / "IMPORT_SOURCE.md"
    parsed: dict[str, str] = {}
    if not source.exists():
        return parsed
    for line in source.read_text(encoding="utf-8", errors="replace").splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        normalized = key.strip().lower().replace(" ", "_")
        parsed[normalized] = value.strip()
    return parsed


def matches_any(name: str, patterns: list[str]) -> bool:
    return any(fnmatch.fnmatch(name, pattern) for pattern in patterns)


def find_forbidden_files(target: Path, exclude_dirs: set[str], exclude_files: list[str]) -> list[str]:
    found: list[str] = []
    if not target.exists():
        return found
    for current, dirs, files in os.walk(target):
        dirs[:] = [d for d in dirs if d not in exclude_dirs and d != ".git"]
        current_path = Path(current)
        for filename in files:
            if matches_any(filename, exclude_files):
                found.append(safe_rel(current_path / filename))
    return sorted(found)


def find_generated_dirs(target: Path, exclude_dirs: set[str]) -> list[str]:
    found: list[str] = []
    if not target.exists():
        return found
    for current, dirs, _files in os.walk(target):
        current_path = Path(current)
        pruned: list[str] = []
        for dirname in dirs:
            if dirname in exclude_dirs and dirname != ".git":
                found.append(safe_rel(current_path / dirname))
            else:
                pruned.append(dirname)
        dirs[:] = pruned
    return sorted(found)


def nested_git_info(target: Path) -> dict[str, str]:
    if not (target / ".git").exists():
        return {"origin": "", "branch": "", "head": "", "status": ""}
    return {
        "origin": run(["git", "-C", str(target), "remote", "get-url", "origin"]).stdout,
        "branch": run(["git", "-C", str(target), "branch", "--show-current"]).stdout,
        "head": run(["git", "-C", str(target), "rev-parse", "HEAD"]).stdout,
        "status": run(["git", "-C", str(target), "status", "--short"]).stdout,
    }


def remote_check(repo: str, enabled: bool) -> str:
    if not enabled:
        return "skipped"
    result = run(["git", "ls-remote", "--heads", repo])
    return "reachable" if result.returncode == 0 else "unreachable"


def app_info(app: dict[str, Any], config: dict[str, Any], *, check_remote: bool) -> dict[str, Any]:
    target = ROOT / app["target_path"]
    mode = app.get("mode", "")
    rel = app["target_path"]
    nested = nested_git_info(target)
    import_source = parse_import_source(target)
    root_tracked_files = git_lines(["ls-files", "--", rel])
    root_status = git_lines(["status", "--short", "--untracked-files=all", "--", rel])
    ignore_reason = first_ignore_reason(target)
    exclude_dirs = set(config.get("exclude_dirs", []))
    exclude_files = list(config.get("exclude_files", []))
    forbidden_local_files = find_forbidden_files(target, exclude_dirs, exclude_files)
    generated_dirs = find_generated_dirs(target, exclude_dirs)

    actions: list[str] = []
    blockers: list[str] = []
    warnings: list[str] = []

    if not target.exists():
        blockers.append("target path is missing")

    if mode == "already-integrated":
        if app.get("app_id") not in config.get("protected_apps", []):
            warnings.append("already-integrated app is not listed in protected_apps")
        if nested["head"]:
            blockers.append("already-integrated app still contains nested .git")
        if target.exists() and not root_tracked_files:
            blockers.append("already-integrated app has no root-tracked files")
    elif mode == "adopt-local":
        if nested["head"]:
            actions.append("guarded apply will write IMPORT_SOURCE.md and remove nested .git")
            if nested["status"]:
                blockers.append("nested repo has uncommitted changes; resolve before removing .git")
        elif target.exists() and not import_source:
            blockers.append("missing IMPORT_SOURCE.md after nested .git removal")
        if target.exists() and ignore_reason:
            blockers.append("root gitignore currently ignores app path; guarded apply must remove broad app ignore before manual staging")
        if target.exists() and not root_tracked_files:
            actions.append("operator must review and stage safe app files manually after apply")
    else:
        blockers.append(f"unsupported app mode: {mode or '<empty>'}")

    if forbidden_local_files:
        warnings.append("local forbidden runtime files are present and must remain ignored")
    if generated_dirs:
        warnings.append("local dependency/cache/build directories are present and must remain ignored")
    if root_status:
        warnings.append("root git status has changes under app path")
    if nested["origin"] and nested["origin"] != app.get("repo"):
        warnings.append(f"nested origin differs from map: {nested['origin']}")

    return {
        **app,
        "exists": target.exists(),
        "root_tracked_file_count": len(root_tracked_files),
        "root_status": root_status,
        "root_ignore_reason": ignore_reason,
        "nested_git": bool(nested["head"]),
        "nested_origin": nested["origin"],
        "nested_branch": nested["branch"],
        "nested_head": nested["head"],
        "nested_status": nested["status"].splitlines() if nested["status"] else [],
        "import_source_exists": bool(import_source),
        "import_source": import_source,
        "remote_check": remote_check(app.get("repo", ""), check_remote),
        "forbidden_local_files": forbidden_local_files,
        "generated_dirs": generated_dirs,
        "actions": actions,
        "blockers": blockers,
        "warnings": warnings,
    }


def unmapped_app_dirs(config: dict[str, Any]) -> list[str]:
    apps_dir = ROOT / config.get("apps_dir", "apps")
    if not apps_dir.exists():
        return []
    mapped = {app["app_id"] for app in config.get("apps", [])}
    internal = set(config.get("internal_apps", []))
    dirs = [p.name for p in apps_dir.iterdir() if p.is_dir()]
    return sorted(name for name in dirs if name not in mapped and name not in internal)


def build_plan(config: dict[str, Any], *, check_remote: bool) -> dict[str, Any]:
    apps = [app_info(app, config, check_remote=check_remote) for app in config.get("apps", [])]
    plan_blockers = []
    unmapped = unmapped_app_dirs(config)
    if unmapped:
        plan_blockers.append(f"unmapped apps directories: {', '.join(unmapped)}")
    return {
        "phase": config.get("phase"),
        "operator_repo": config.get("operator_repo"),
        "apps_dir": config.get("apps_dir"),
        "internal_apps": config.get("internal_apps", []),
        "protected_apps": config.get("protected_apps", []),
        "critical_deep_dive_apps": config.get("critical_deep_dive_apps", []),
        "remote_check": "enabled" if check_remote else "skipped",
        "unmapped_app_dirs": unmapped,
        "plan_blockers": plan_blockers,
        "apps": apps,
        "blocker_count": len(plan_blockers) + sum(len(app["blockers"]) for app in apps),
        "warning_count": sum(len(app["warnings"]) for app in apps),
    }


def render_markdown(plan: dict[str, Any]) -> str:
    lines = [
        "# cvsz Apps Merge Plan",
        "",
        "Generated by `scripts/apps/plan-cvsz-apps-merge.py`.",
        "",
        "This is an offline plan by default. Remote repository checks are skipped unless `--remote-check` is passed.",
        "",
        "## Summary",
        "",
        f"- Operator repo: `{plan['operator_repo']}`",
        f"- Apps dir: `{plan['apps_dir']}`",
        f"- Internal root apps excluded by default: `{', '.join(plan['internal_apps'])}`",
        f"- Protected apps: `{', '.join(plan['protected_apps'])}`",
        f"- Critical deep-dive apps: `{', '.join(plan['critical_deep_dive_apps'])}`",
        f"- Blockers: `{plan['blocker_count']}`",
        f"- Warnings: `{plan['warning_count']}`",
        "",
        "## App Matrix",
        "",
        "| App | Priority | Mode | Exists | Nested Git | Tracked Files | Import Source | Remote | Blockers | Warnings |",
        "| --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- |",
    ]
    for app in plan["apps"]:
        lines.append(
            "| {app_id} | {priority} | {mode} | {exists} | {nested_git} | {tracked} | {import_source} | {remote} | {blockers} | {warnings} |".format(
                app_id=app["app_id"],
                priority=app.get("priority", "-"),
                mode=app.get("mode", "-"),
                exists=str(app["exists"]),
                nested_git=str(app["nested_git"]),
                tracked=app["root_tracked_file_count"],
                import_source=str(app["import_source_exists"]),
                remote=app["remote_check"],
                blockers="<br>".join(app["blockers"]) or "-",
                warnings="<br>".join(app["warnings"]) or "-",
            )
        )
    if plan["plan_blockers"]:
        lines.extend(["", "## Plan-Level Blockers", ""])
        lines.extend(f"- {blocker}" for blocker in plan["plan_blockers"])
    lines.extend(
        [
            "",
            "## Recommended Order",
            "",
            "1. Keep `apps/zdash` stable and protected.",
            "2. Review the P1 deep-dive report for `apps/ABTPi18n` and `apps/zkbtrader`.",
            "3. Run guarded apply only with `APPLY=true CONFIRM_CVSZ_APPS_MERGE=yes`.",
            "4. Review root `.gitignore`, each app `IMPORT_SOURCE.md`, and app-local `.gitignore` guardrails.",
            "5. Manually stage safe source files only. Do not stage secrets, state, dependencies, caches, reports, or build outputs.",
            "",
            "## App Details",
            "",
        ]
    )
    for app in plan["apps"]:
        lines.extend(
            [
                f"### {app['app_id']}",
                "",
                f"- Path: `{app['target_path']}`",
                f"- Source repo: `{app.get('repo', '')}`",
                f"- Nested origin: `{app['nested_origin'] or '-'}`",
                f"- Nested branch: `{app['nested_branch'] or '-'}`",
                f"- Nested HEAD: `{app['nested_head'] or '-'}`",
                f"- Root ignore reason: `{app['root_ignore_reason'] or '-'}`",
            ]
        )
        if app["actions"]:
            lines.append("- Actions:")
            lines.extend(f"  - {action}" for action in app["actions"])
        if app["blockers"]:
            lines.append("- Blockers:")
            lines.extend(f"  - {blocker}" for blocker in app["blockers"])
        if app["warnings"]:
            lines.append("- Warnings:")
            lines.extend(f"  - {warning}" for warning in app["warnings"])
        if app["forbidden_local_files"]:
            lines.append("- Local forbidden files detected:")
            lines.extend(f"  - `{path}`" for path in app["forbidden_local_files"][:40])
            if len(app["forbidden_local_files"]) > 40:
                lines.append(f"  - ... {len(app['forbidden_local_files']) - 40} more")
        if app["generated_dirs"]:
            lines.append("- Local generated/dependency/cache dirs detected:")
            lines.extend(f"  - `{path}`" for path in app["generated_dirs"][:40])
            if len(app["generated_dirs"]) > 40:
                lines.append(f"  - ... {len(app['generated_dirs']) - 40} more")
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Plan safe local adoption of cvsz apps into zeaz-platform.")
    parser.add_argument("--config", default=str(DEFAULT_CONFIG), help="Path to cvsz apps merge map JSON.")
    parser.add_argument("--report-out", default="", help="Markdown report output path.")
    parser.add_argument("--json-out", default="", help="JSON report output path.")
    parser.add_argument("--remote-check", action="store_true", help="Opt-in read-only git ls-remote checks.")
    parser.add_argument("--strict", action="store_true", help="Exit non-zero when blockers are present.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    config_path = (ROOT / args.config).resolve() if not Path(args.config).is_absolute() else Path(args.config)
    config = load_json(config_path)
    report_dir = ROOT / config.get("report_dir", "reports/cvsz-apps-merge")
    report_out = Path(args.report_out) if args.report_out else report_dir / "cvsz-apps-merge-plan.md"
    json_out = Path(args.json_out) if args.json_out else report_dir / "cvsz-apps-merge-plan.json"
    if not report_out.is_absolute():
        report_out = ROOT / report_out
    if not json_out.is_absolute():
        json_out = ROOT / json_out

    plan = build_plan(config, check_remote=args.remote_check)
    report_out.parent.mkdir(parents=True, exist_ok=True)
    json_out.parent.mkdir(parents=True, exist_ok=True)
    report_out.write_text(render_markdown(plan), encoding="utf-8")
    json_out.write_text(json.dumps(plan, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    print(f"PASS: wrote {safe_rel(report_out)}")
    print(f"PASS: wrote {safe_rel(json_out)}")
    if plan["blocker_count"]:
        print(f"WARN: {plan['blocker_count']} blocker(s) require review before safe manual staging")
    if plan["warning_count"]:
        print(f"WARN: {plan['warning_count']} warning(s) require operator review")
    return 1 if args.strict and plan["blocker_count"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
