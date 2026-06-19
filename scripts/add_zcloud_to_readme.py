from pathlib import Path

path = Path("/home/zeazdev/zeaz-platform/README.md")
text = path.read_text()

old = (
    "| zoffice | `apps/zoffice` | Python static server + OpenClaw/Hermes adapters | AI office dashboard | Updated app README |\n"
    "| zsp-aitool | `apps/zsp-aitool` | Next.js + Prisma + Vitest | AI tool SaaS / dashboard app | README generated if missing |"
)
new = (
    "| zoffice | `apps/zoffice` | Python static server + OpenClaw/Hermes adapters | AI office dashboard | Updated app README |\n"
    "| zcloud | `apps/zcloud` | Next.js / TypeScript | CloudPanel v2 docs-native release shell | New app README |\n"
    "| zsp-aitool | `apps/zsp-aitool` | Next.js + Prisma + Vitest | AI tool SaaS / dashboard app | README generated if missing |"
)
if old not in text:
    raise SystemExit("table block not found")
text = text.replace(old, new, 1)

old = "apps/zoffice/README.md\napps/zsp-aitool/README.md"
new = "apps/zoffice/README.md\napps/zcloud/README.md\napps/zsp-aitool/README.md"
if old not in text:
    raise SystemExit("README index block not found")
text = text.replace(old, new, 1)

path.write_text(text)
