import os
from pathlib import Path
import re

SKILLS_DIR = Path("/home/zeazdev/zeaz-platform/.agents/skills")

RENAME_MAP = {
    "zai-agents-pack": "zai-agents",
    "zai-ai-automation": "zai-automation",
    "zai-ai-fundamentals": "zai-ai",
    "zai-analytics-data": "zai-analytics",
    "zai-canva-ai-design": "zai-canva",
    "zai-content-strategy": "zai-content",
    "zai-copywriting-ai": "zai-copy",
    "zai-email-marketing": "zai-email",
    "zai-prompt-engineering": "zai-prompt",
    "zai-sales-funnel": "zai-sales",
    "zai-seo-optimization": "zai-seo",
    "zai-social-media-growth": "zai-social",
    "zai-ui-ux-design": "zai-ui-ux",
    "zai-video-editing-ai": "zai-video",
    "zai-cloudflare-platform": "zai-cloudflare",
    "zai-scientific-research": "zai-research",
    "zai-vector-search": "zai-vector",
    "zai-aif-core": "zai-aif",
    "zai-v3-core": "zai-v3",
}

def rename_skills():
    renamed_count = 0
    for old_name, new_name in RENAME_MAP.items():
        old_dir = SKILLS_DIR / old_name
        new_dir = SKILLS_DIR / new_name
        
        if old_dir.exists() and not new_dir.exists():
            # Rename the directory
            old_dir.rename(new_dir)
            
            # Update the frontmatter inside SKILL.md
            skill_file = new_dir / "SKILL.md"
            if skill_file.exists():
                content = skill_file.read_text(encoding="utf-8")
                # Update the name in YAML frontmatter
                content = re.sub(rf"^name:\s*{old_name}\s*$", f"name: {new_name}", content, flags=re.MULTILINE)
                # Update the markdown title
                content = re.sub(rf"^#\s*{old_name}\s*$", f"# {new_name}", content, flags=re.MULTILINE)
                skill_file.write_text(content, encoding="utf-8")
                
            print(f"Renamed: {old_name} -> {new_name}")
            renamed_count += 1
            
    print(f"Total skills renamed: {renamed_count}")

if __name__ == "__main__":
    rename_skills()
