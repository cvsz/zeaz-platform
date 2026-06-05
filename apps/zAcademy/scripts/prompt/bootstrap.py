from pathlib import Path

PROMPTS = [
    "codex/system.md",
    "backend/service-generator.md",
    "backend/repository-pattern.md",
    "frontend/nextjs-page.md",
    "architecture/service-design.md",
    "infra/kubernetes.md",
    "infra/terraform.md",
    "automation/workflow.md",
    "ai/rag-platform.md",
    "academy/course-generator.md",
    "governance/security-review.md",
]

for item in PROMPTS:
    path = Path("prompts") / item
    path.parent.mkdir(parents=True, exist_ok=True)

    if not path.exists():
        path.touch()

print("prompt bootstrap done")
