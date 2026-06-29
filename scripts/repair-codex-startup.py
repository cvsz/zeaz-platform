#!/usr/bin/env python3
from pathlib import Path
import argparse
import datetime
import os
import re
import sys

HOME = Path.home()
CONFIG = HOME / ".codex" / "config.toml"

SKILLS = [
    (
        HOME / ".codex/plugins/cache/openai-curated-remote/heygen/2.2.4/skills/heygen-video/SKILL.md",
        "Create and manage HeyGen video generation workflows, including video setup, assets, and rendering guidance."
    ),
    (
        HOME / ".codex/plugins/cache/openai-curated-remote/heygen/2.2.4/skills/heygen-avatar/SKILL.md",
        "Create and manage HeyGen avatar workflows, including avatar selection, setup, and usage guidance."
    ),
]

TIMEOUTS = {
    "codex_apps": 120,
    "context7": 120,
}

def stamp():
    return datetime.datetime.now(datetime.UTC).strftime("%Y%m%dT%H%M%SZ")

def backup(path):
    dst = path.with_name(path.name + ".bak." + stamp())
    dst.write_bytes(path.read_bytes())
    return dst

def is_writable(path):
    return path.exists() and os.access(path, os.W_OK) and os.access(path.parent, os.W_OK)

def patch_skill(path, desc, dry):
    if not path.exists():
        print("SKIP missing skill:", path)
        return False

    text = path.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()
    out = []
    i = 0
    changed = False

    while i < len(lines):
        line = lines[i]
        if re.match(r"^\s*description\s*:", line):
            indent = line[:len(line) - len(line.lstrip())]
            out.append(indent + 'description: "' + desc + '"')
            changed = True
            i += 1
            while i < len(lines) and (not lines[i].strip() or lines[i].startswith(" ") or lines[i].startswith("\t")):
                i += 1
            continue
        out.append(line)
        i += 1

    if not changed:
        print("WARN no description field:", path)
        return False

    new_text = "\n".join(out) + "\n"
    if new_text == text:
        print("OK skill unchanged:", path)
        return False

    if not is_writable(path):
        print("SKIP read-only skill:", path)
        return False

    print("PATCH skill:", path)
    if not dry:
        b = backup(path)
        path.write_text(new_text, encoding="utf-8", newline="\n")
        print("  backup:", b)
    return True

def find_section(lines, name):
    header = "[mcp_servers." + name + "]"
    start = None
    for i, line in enumerate(lines):
        if line.strip() == header:
            start = i
            break
    if start is None:
        return None

    end = len(lines)
    for j in range(start + 1, len(lines)):
        s = lines[j].strip()
        if s.startswith("[") and s.endswith("]"):
            end = j
            break
    return start, end

def patch_timeout(config, name, timeout, dry):
    if not config.exists():
        print("SKIP missing config:", config)
        return False

    text = config.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()
    sec = find_section(lines, name)
    if sec is None:
        print("SKIP no section: [mcp_servers." + name + "]")
        return False

    start, end = sec
    desired = "startup_timeout_sec = " + str(timeout)
    changed = False

    for i in range(start + 1, end):
        if re.match(r"^\s*startup_timeout_sec\s*=", lines[i]):
            if lines[i].strip() != desired:
                lines[i] = desired
                changed = True
            break
    else:
        lines.insert(start + 1, desired)
        changed = True

    if not changed:
        print("OK timeout unchanged:", name)
        return False

    if not is_writable(config):
        print("SKIP read-only config:", config)
        return False

    print("PATCH timeout:", name, timeout)
    if not dry:
        b = backup(config)
        config.write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")
        print("  backup:", b)
    return True

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--config", default=str(CONFIG))
    args = ap.parse_args()

    config = Path(args.config).expanduser()
    changed = False

    print("Codex startup repair")
    print("dry_run =", args.dry_run)
    print("config =", config)
    print("")

    for path, desc in SKILLS:
        changed = patch_skill(path, desc, args.dry_run) or changed

    print("")

    for name, timeout in TIMEOUTS.items():
        changed = patch_timeout(config, name, timeout, args.dry_run) or changed

    print("")
    if args.dry_run:
        print("Dry-run complete.")
    elif changed:
        print("Patch complete.")
    else:
        print("No changes applied.")

    print("")
    print("MCP status note:")
    print("cloudflare MCP endpoints are configured as remote URLs in ~/.codex/config.toml")
    print("and codex reports Auth = Unsupported for these endpoints, so mcp login is not used.")
    print("")
    print("Test:")
    print("codex")

if __name__ == "__main__":
    main()
