#!/usr/bin/env python3
"""Generate a searchable catalog for repo-local Codex skills."""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import yaml


REPO_ROOT = Path(__file__).resolve().parents[3]
SKILLS_DIR = REPO_ROOT / ".agents" / "skills"
OUTPUT_PATH = REPO_ROOT / "docs" / "codex" / "skills-catalog.md"


@dataclass(frozen=True)
class Skill:
    name: str
    description: str
    path: Path
    category: str


CATEGORY_LABELS = {
    "repo-specific": "Repo-Specific",
    "agent-orchestration": "Agent Orchestration",
    "ai-factory": "AIF Workflow",
    "quality-security": "Quality And Security",
    "frontend-browser": "Frontend And Browser",
    "gitops-automation": "GitOps And Automation",
    "research-content": "Research And Content",
    "stack-specific": "Stack-Specific",
    "general": "General Methods",
}

CATEGORY_NOTES = {
    "repo-specific": "Start here for repository-scoped work in `zeaz-platform`.",
    "agent-orchestration": "Multi-agent coordination, planning, and execution helpers.",
    "ai-factory": "The AIF workflow family for implementation, review, validation, and docs.",
    "quality-security": "Testing, verification, audits, and security-focused checks.",
    "frontend-browser": "Frontend implementation, browser workflows, design direction, and UI polish.",
    "gitops-automation": "GitHub, workflow, CI/CD, and ECC automation guidance.",
    "research-content": "Research, market analysis, content generation, and publishing workflows.",
    "stack-specific": "Framework and language-specific implementation patterns.",
    "general": "General-purpose engineering, architecture, product, and strategy skills.",
}

RECOMMENDED_SKILLS = [
    "zeaz-platform",
    "coding-standards",
    "security-review",
    "backend-patterns",
    "api-design",
    "verification-loop",
    "tdd-workflow",
    "e2e-testing",
    "frontend-patterns",
    "deep-research",
    "github-workflow-automation",
]


def split_frontmatter(skill_path: Path) -> tuple[dict[str, str], str]:
    text = skill_path.read_text(encoding="utf-8")
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}, text

    closing_index = None
    for index, line in enumerate(lines[1:], start=1):
        if line.strip() == "---":
            closing_index = index
            break

    if closing_index is None:
        return {}, text

    frontmatter_text = "\n".join(lines[1:closing_index]).strip()
    body = "\n".join(lines[closing_index + 1 :]).strip()
    try:
        metadata = yaml.safe_load(frontmatter_text) or {}
    except yaml.YAMLError:
        metadata = {}
    if not isinstance(metadata, dict):
        metadata = {}
    return metadata, body


def fallback_description(body: str) -> str:
    for line in body.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        return stripped
    return "No description provided."


def classify_skill(name: str) -> str:
    if name == "zeaz-platform":
        return "repo-specific"
    if name == "agent-scan":
        return "quality-security"
    if name.startswith(("agent-", "agentdb-")):
        return "agent-orchestration"
    if name.startswith("aif"):
        return "ai-factory"
    if name.startswith(
        (
            "security-",
            "verification-",
            "tdd-",
            "eval-",
            "e2e-",
            "test-",
            "safety-",
            "production-audit",
            "quality-",
        )
    ):
        return "quality-security"
    if name.startswith(
        (
            "frontend-",
            "react-",
            "ui-",
            "browser",
            "design",
            "motion-",
            "web-typography",
            "microinteractions",
            "ux-",
            "liquid-glass-design",
            "slides",
            "video-editing",
        )
    ):
        return "frontend-browser"
    if name.startswith(("github-", "workflow-", "configure-ecc", "dmux-")):
        return "gitops-automation"
    if name.startswith(
        (
            "deep-research",
            "exa-search",
            "research-",
            "market-",
            "investor-",
            "lead-",
            "dossier-",
            "documentation-lookup",
            "article-writing",
            "content-",
            "brand-",
            "x-api",
            "crosspost",
        )
    ):
        return "research-content"
    if name.startswith(
        (
            "python-",
            "django-",
            "fastapi-",
            "golang-",
            "springboot-",
            "kotlin-",
            "laravel-",
            "nestjs-",
            "rust-",
            "dotnet-",
            "quarkus-",
            "android-",
            "swift",
            "cpp-",
            "csharp-",
            "dart-",
            "perl-",
            "mysql-",
            "postgres-",
            "jpa-",
            "prisma-",
            "clickhouse-",
            "nodejs-",
        )
    ):
        return "stack-specific"
    return "general"


def load_skills() -> list[Skill]:
    skills: list[Skill] = []
    for path in sorted(SKILLS_DIR.iterdir()):
        skill_md = path / "SKILL.md"
        if not path.is_dir() or not skill_md.exists():
            continue
        metadata, body = split_frontmatter(skill_md)
        description = str(metadata.get("description", "")).strip()
        if description in {"", ">", "|"}:
            description = fallback_description(body)
        skills.append(
            Skill(
                name=path.name,
                description=description,
                path=skill_md.relative_to(REPO_ROOT),
                category=classify_skill(path.name),
            )
        )
    return skills


def render_summary(skills: list[Skill]) -> list[str]:
    counts = Counter(skill.category for skill in skills)
    lines = [
        "## Quick Start",
        "",
        "1. Start repository work with `zeaz-platform` unless a narrower skill is clearly better.",
        "2. Mention one or more skill names directly in the request, for example `use security-review + verification-loop`.",
        "3. Combine implementation skills with validation skills instead of using one skill in isolation.",
        "4. External mutations such as push, publish, merge, or third-party changes still require explicit approval.",
        "",
        "## Recommended Defaults",
        "",
    ]

    for name in RECOMMENDED_SKILLS:
        lines.append(f"- `{name}`")

    lines.extend(
        [
            "",
            "## Category Summary",
            "",
            "| Category | Count | Notes |",
            "| --- | ---: | --- |",
        ]
    )

    for category, label in CATEGORY_LABELS.items():
        lines.append(f"| {label} | {counts.get(category, 0)} | {CATEGORY_NOTES[category]} |")

    return lines


def render_group(category: str, skills: list[Skill]) -> list[str]:
    label = CATEGORY_LABELS[category]
    lines = [
        f"## {label}",
        "",
        CATEGORY_NOTES[category],
        "",
        "| Skill | Description | Path |",
        "| --- | --- | --- |",
    ]
    for skill in sorted((item for item in skills if item.category == category), key=lambda item: item.name):
        lines.append(
            f"| `{skill.name}` | {skill.description} | [`{skill.path}`](../../{skill.path.as_posix()}) |"
        )
    return lines


def build_catalog(skills: list[Skill]) -> str:
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%SZ")
    lines = [
        "# Zeaz Platform Skills Catalog",
        "",
        f"Generated from repo-local skills under `.agents/skills` on `{generated_at}`.",
        "",
        f"Total skills: **{len(skills)}**",
        "",
        "This catalog is intended for search and discovery. Skill behavior remains governed by `AGENTS.md` and each skill's `SKILL.md`.",
        "",
    ]
    lines.extend(render_summary(skills))

    for category in CATEGORY_LABELS:
        lines.extend(["", *render_group(category, skills)])

    return "\n".join(lines) + "\n"


def main() -> None:
    skills = load_skills()
    OUTPUT_PATH.write_text(build_catalog(skills), encoding="utf-8")
    print(f"Wrote {len(skills)} skills to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
