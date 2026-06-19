#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ASSIGN_RE = re.compile(r"^([A-Za-z_][A-Za-z0-9_]*)=(.*)$")
SECRET_HINT_RE = re.compile(r"(TOKEN|SECRET|KEY|PASSWORD)", re.I)
DEFAULT_FILES = [Path(".env.example")]
OPTIONAL_EMPTY_DROP = {
    "CLOUDFLARE_AUDIT_TOKEN",
    "CLOUDFLARE_AI_GATEWAY_TOKEN",
}


def is_secret_key(key: str) -> bool:
    return bool(SECRET_HINT_RE.search(key))


def mask_value(key: str, value: str) -> str:
    if not is_secret_key(key):
        return value
    if not value:
        return ""
    return "<redacted>"


def suggested_assignment(key: str, value: str) -> str:
    if is_secret_key(key) and value:
        return f"{key}=<redacted>"
    return f"{key}={value}"


def validate_file(path: Path, *, skip_missing: bool = False) -> tuple[list[str], bool]:
    errors: list[str] = []
    if not path.exists():
        if skip_missing:
            return errors, False
        return [f"{path}: missing file; pass --skip-missing to ignore absent local env files"], False

    seen: dict[str, int] = {}
    for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        match = ASSIGN_RE.match(line)
        if not match:
            continue

        key, raw_value = match.group(1), match.group(2)
        value = raw_value.strip()

        if key in seen:
            errors.append(f"{path}:{lineno}: duplicate env key {key}; first seen line {seen[key]}")
        else:
            seen[key] = lineno

        if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
            unquoted = value[1:-1]
            display = mask_value(key, value)
            suggestion = suggested_assignment(key, unquoted)
            errors.append(f"{path}:{lineno}: quoted env value for {key}: {display}; use {suggestion}")

        if key in OPTIONAL_EMPTY_DROP and value in {"", '""', "''"}:
            errors.append(
                f"{path}:{lineno}: optional empty {key} should be omitted; "
                "run make env-normalize-local"
            )

    return errors, True


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate generated env file formatting.")
    parser.add_argument("--skip-missing", action="store_true", help="Ignore missing files, useful for local .env checks.")
    parser.add_argument("files", nargs="*", type=Path, default=DEFAULT_FILES)
    args = parser.parse_args()

    errors: list[str] = []
    checked_paths: list[Path] = []
    skipped_paths: list[Path] = []
    for path in args.files:
        file_errors, checked = validate_file(path, skip_missing=args.skip_missing)
        errors.extend(file_errors)
        if checked:
            checked_paths.append(path)
        elif args.skip_missing:
            skipped_paths.append(path)

    if errors:
        print("Env formatting validation failed:", file=sys.stderr)
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    checked = ", ".join(str(p) for p in checked_paths) or "<none>"
    print(f"Env formatting validation passed: {checked}")
    if skipped_paths:
        skipped = ", ".join(str(p) for p in skipped_paths)
        print(f"Env formatting validation skipped missing files: {skipped}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
