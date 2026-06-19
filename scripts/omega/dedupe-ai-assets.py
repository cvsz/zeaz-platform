#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import sys
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Iterable

BLOCKED_DIRS = {
    ".git",
    "node_modules",
    ".next",
    "dist",
    "build",
    "coverage",
    ".turbo",
    ".cache",
    ".pytest_cache",
    "__pycache__",
    ".venv",
    "venv",
    ".pnpm-store",
    ".npm",
    ".yarn",
    ".ssh",
    ".gnupg",
    ".kube",
    ".terraform",
    ".wrangler",
    ".cloudflared",
}

SENSITIVE_NAMES = {
    ".env",
    "creds.json",
    "credentials.json",
    "token.json",
    "id_rsa",
    "id_ed25519",
}

SENSITIVE_SUFFIXES = {
    ".pem",
    ".key",
    ".p12",
    ".pfx",
    ".tfstate",
    ".tfvars",
}

PLUGIN_MARKERS = {
    "plugin.json",
    "plugin.yaml",
    "plugin.yml",
    "plugin.toml",
}

EXTENSION_MARKERS = {
    "extension.json",
    "extension.yaml",
    "extension.yml",
    "manifest.json",
    "manifest.yaml",
    "manifest.yml",
}

INSTALLER_RE = re.compile(
    r"(^|[-_.])(ai|agent|agents|skill|skills|plugin|plugins|extension|extensions|omega|gemini|codex|antigravity|installer|install)([-_.]|$)",
    re.I,
)

SCRIPT_SUFFIXES = {
    ".sh",
    ".bash",
    ".py",
    ".js",
    ".mjs",
    ".cjs",
    ".ts",
    ".toml",
    ".md",
}


@dataclass
class Asset:
    asset_type: str
    marker: str
    path: str
    sha256: str
    size_bytes: int
    file_count: int
    keep: bool = False
    action: str = "report"


def is_sensitive_file(path: Path) -> bool:
    name = path.name
    if name in SENSITIVE_NAMES:
        return True
    if name.startswith(".env."):
        return True
    if any(name.endswith(s) for s in SENSITIVE_SUFFIXES):
        return True
    parts = set(path.parts)
    if {"secret", "secrets", "credential", "credentials", "token", "tokens"} & parts:
        return True
    return False


def should_skip_dir(path: Path) -> bool:
    return path.name in BLOCKED_DIRS


def file_sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def hash_dir(root: Path) -> tuple[str, int, int]:
    h = hashlib.sha256()
    size = 0
    count = 0

    files: list[Path] = []
    for dirpath, dirnames, filenames in os.walk(root):
        d = Path(dirpath)
        dirnames[:] = [x for x in dirnames if x not in BLOCKED_DIRS]

        for name in filenames:
            p = d / name
            if is_sensitive_file(p):
                continue
            if not p.is_file():
                continue
            files.append(p)

    for p in sorted(files, key=lambda x: str(x.relative_to(root))):
        rel = str(p.relative_to(root)).replace("\\", "/")
        digest = file_sha(p)
        st = p.stat()
        size += st.st_size
        count += 1
        h.update(rel.encode("utf-8", "replace"))
        h.update(b"\0")
        h.update(digest.encode())
        h.update(b"\0")

    return h.hexdigest(), size, count


def is_inside(path: Path, root: Path) -> bool:
    try:
        path.resolve().relative_to(root.resolve())
        return True
    except ValueError:
        return False


def asset_root_for_marker(marker: Path, asset_type: str) -> Path:
    if asset_type == "ai-installer":
        return marker
    return marker.parent


def detect_marker(path: Path) -> tuple[str, str] | None:
    name = path.name

    if name == "agent.json":
        return "agent", name

    if name == "SKILL.md":
        return "skill", name

    if name in PLUGIN_MARKERS:
        return "plugin", name

    if name in EXTENSION_MARKERS:
        lowered = str(path).lower()
        if any(x in lowered for x in ["/extension", "/extensions", "/plugin", "/plugins", "/mcp", "/tools"]):
            return "extension", name

    if path.suffix in SCRIPT_SUFFIXES:
        lowered = name.lower()
        if "install" in lowered or "installer" in lowered:
            if INSTALLER_RE.search(lowered):
                return "ai-installer", name

    return None


def walk_assets(source: Path) -> list[tuple[str, str, Path]]:
    found: list[tuple[str, str, Path]] = []

    for dirpath, dirnames, filenames in os.walk(source):
        d = Path(dirpath)

        dirnames[:] = [
            x for x in dirnames
            if x not in BLOCKED_DIRS and not x.startswith(".Trash")
        ]

        for name in filenames:
            p = d / name
            if is_sensitive_file(p):
                continue

            detected = detect_marker(p)
            if detected:
                asset_type, marker = detected
                root = asset_root_for_marker(p, asset_type)
                found.append((asset_type, marker, root))

    # de-duplicate same asset root/type
    seen: set[tuple[str, str]] = set()
    unique: list[tuple[str, str, Path]] = []
    for asset_type, marker, root in found:
        key = (asset_type, str(root.resolve()))
        if key in seen:
            continue
        seen.add(key)
        unique.append((asset_type, marker, root))

    return unique


def build_asset(asset_type: str, marker: str, root: Path) -> Asset | None:
    try:
        if root.is_file():
            sha = file_sha(root)
            size = root.stat().st_size
            count = 1
        elif root.is_dir():
            sha, size, count = hash_dir(root)
        else:
            return None
    except PermissionError:
        return None
    except OSError:
        return None

    return Asset(
        asset_type=asset_type,
        marker=marker,
        path=str(root),
        sha256=sha,
        size_bytes=size,
        file_count=count,
    )


def canonical_sort_key(asset: Asset, keep_root: Path) -> tuple[int, int, int, str]:
    p = Path(asset.path)
    keep_priority = 0 if is_inside(p, keep_root) else 1
    zeaz_priority = 0 if "zeaz-platform" in p.parts else 1
    depth = len(p.parts)
    return (keep_priority, zeaz_priority, depth, str(p))


def safe_quarantine_path(path: Path, source: Path, quarantine: Path) -> Path:
    try:
        rel = path.resolve().relative_to(source.resolve())
    except ValueError:
        rel = Path(str(path).lstrip("/"))

    dest = quarantine / rel
    if dest.exists():
        suffix = hashlib.sha256(str(path).encode()).hexdigest()[:8]
        dest = dest.with_name(dest.name + f".dup-{suffix}")
    return dest


def write_reports(out_dir: Path, assets: list[Asset], duplicate_groups: dict[str, list[Asset]]) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)

    all_json = [asdict(a) for a in assets]
    dup_json = {
        sha: [asdict(a) for a in group]
        for sha, group in duplicate_groups.items()
    }

    (out_dir / "assets.json").write_text(json.dumps(all_json, indent=2, ensure_ascii=False), encoding="utf-8")
    (out_dir / "duplicates.json").write_text(json.dumps(dup_json, indent=2, ensure_ascii=False), encoding="utf-8")

    lines = []
    lines.append("# AI Assets Duplicate Report")
    lines.append("")
    lines.append(f"- Generated: `{datetime.now().isoformat(timespec='seconds')}`")
    lines.append(f"- Total assets: `{len(assets)}`")
    lines.append(f"- Duplicate SHA groups: `{len(duplicate_groups)}`")
    lines.append("")
    lines.append("## Duplicate Groups")
    lines.append("")

    if not duplicate_groups:
        lines.append("No duplicates found.")
    else:
        for i, (sha, group) in enumerate(sorted(duplicate_groups.items()), 1):
            lines.append(f"### Group {i}")
            lines.append("")
            lines.append(f"- SHA: `{sha}`")
            lines.append(f"- Type: `{group[0].asset_type}`")
            lines.append(f"- Count: `{len(group)}`")
            lines.append("")
            lines.append("| Keep | Action | Path | Size | Files | Marker |")
            lines.append("|---|---|---|---:|---:|---|")
            for a in group:
                keep = "yes" if a.keep else ""
                lines.append(
                    f"| {keep} | `{a.action}` | `{a.path}` | {a.size_bytes} | {a.file_count} | `{a.marker}` |"
                )
            lines.append("")

    (out_dir / "duplicates.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Find and clean duplicate AI assets by SHA-256.")
    parser.add_argument("--source", default="/home/zeazdev", help="Source root to scan.")
    parser.add_argument("--keep-root", default="/home/zeazdev/zeaz-platform", help="Preferred canonical root.")
    parser.add_argument("--out", default="", help="Report output dir.")
    parser.add_argument("--apply", action="store_true", help="Move duplicates to quarantine.")
    parser.add_argument("--quarantine", default="", help="Quarantine directory.")
    parser.add_argument("--include-installers", action="store_true", help="Include AI installer scripts.")
    args = parser.parse_args()

    source = Path(args.source).resolve()
    keep_root = Path(args.keep_root).resolve()

    if not source.exists():
        print(f"ERROR: source not found: {source}", file=sys.stderr)
        return 1

    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    out_dir = Path(args.out) if args.out else keep_root / "reports" / "omega" / f"ai-dedupe-{ts}"
    quarantine = Path(args.quarantine) if args.quarantine else Path("/home/zeazdev") / f"ai-assets-duplicate-quarantine-{ts}"

    print(f"Source:      {source}")
    print(f"Keep root:   {keep_root}")
    print(f"Out:         {out_dir}")
    print(f"Apply:       {args.apply}")
    print(f"Quarantine:  {quarantine}")
    print("")

    markers = walk_assets(source)

    assets: list[Asset] = []
    for asset_type, marker, root in markers:
        if asset_type == "ai-installer" and not args.include_installers:
            continue
        asset = build_asset(asset_type, marker, root)
        if asset:
            assets.append(asset)

    groups: dict[tuple[str, str], list[Asset]] = {}
    for asset in assets:
        groups.setdefault((asset.asset_type, asset.sha256), []).append(asset)

    duplicate_groups: dict[str, list[Asset]] = {}

    for (asset_type, sha), group in groups.items():
        if len(group) < 2:
            continue

        group.sort(key=lambda a: canonical_sort_key(a, keep_root))
        group[0].keep = True
        group[0].action = "keep"

        for dup in group[1:]:
            dup.action = "quarantine" if args.apply else "duplicate-report-only"

        duplicate_groups[f"{asset_type}:{sha}"] = group

    if args.apply:
        quarantine.mkdir(parents=True, exist_ok=True)

        for group in duplicate_groups.values():
            for asset in group:
                if asset.keep:
                    continue

                src = Path(asset.path)
                if not src.exists():
                    asset.action = "missing"
                    continue

                dst = safe_quarantine_path(src, source, quarantine)
                dst.parent.mkdir(parents=True, exist_ok=True)

                print(f"MOVE duplicate: {src} -> {dst}")
                shutil.move(str(src), str(dst))
                asset.action = f"moved:{dst}"

    write_reports(out_dir, assets, duplicate_groups)

    print("")
    print("Report files:")
    print(f"  {out_dir / 'assets.json'}")
    print(f"  {out_dir / 'duplicates.json'}")
    print(f"  {out_dir / 'duplicates.md'}")
    print("")

    total_dups = sum(len(g) - 1 for g in duplicate_groups.values())
    print(f"Assets scanned: {len(assets)}")
    print(f"Duplicate groups: {len(duplicate_groups)}")
    print(f"Duplicate items: {total_dups}")

    if not args.apply:
        print("")
        print("Dry-run only. To quarantine duplicates:")
        print(f"  python3 {Path(sys.argv[0])} --source {source} --keep-root {keep_root} --include-installers --apply")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
