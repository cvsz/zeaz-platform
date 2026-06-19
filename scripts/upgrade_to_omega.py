import os

OMEGA_TEMPLATE = """name: {name}
description: {description}
---
# {title} - Master Omega Advanced Professional

## Objective
- Achieve production-grade outcomes for {name} within the ZeaZ Platform ecosystem.

## Procedural Workflow
1. **Audit**: Assess existing assets/requirements for {name}.
2. **Strategy**: Apply the Omega standard workflow for this domain.
3. **Execution**: Generate/Implement using professional-grade tools and prompts.
4. **Verification**: Validate against platform quality standards.

## Best Practices & Rules
- Maintain consistency with the Omega design tokens and architectural standards.
- Use structured, incremental improvements.
- Always prioritize lean execution and token efficiency.

## Pro-Level Resources
- Refer to `.ai-factory/PLAN.md` for project-specific roadmap linkage.
- Use `zai-cli` (ai-factory) for automated task execution.
"""

skills = {
    "ai-fundamentals": {"title": "AI Fundamentals", "description": "พื้นฐาน AI ที่ต้องรู้สำหรับระบบ ZeaZ"},
    "prompt-engineering": {"title": "Prompt Engineering", "description": "เขียน prompt ระดับมือโปรสำหรับ Agentic Workflow"},
    "content-strategy": {"title": "Content Strategy", "description": "วางแผนกลยุทธ์คอนเทนต์ระดับมืออาชีพ"},
    "canva-ai-design": {"title": "Canva + AI Design", "description": "ออกแบบกราฟิกขั้นสูงด้วย AI และ Canva"},
    "video-editing-ai": {"title": "Video Editing AI", "description": "ตัดต่อวิดีโอระดับมืออาชีพด้วย AI"},
    "copywriting-ai": {"title": "Copywriting AI", "description": "เขียนคำโฆษณาที่เน้นการแปลงผล (Conversion)"},
    "social-media-growth": {"title": "Social Media Growth", "description": "ปั้นเพจให้โตด้วยระบบวิเคราะห์ข้อมูล"},
    "analytics-data": {"title": "Analytics & Data", "description": "วิเคราะห์ข้อมูลเชิงลึกสำหรับตัดสินใจ"},
    "ai-automation": {"title": "AI Automation", "description": "สร้างระบบอัตโนมัติด้วย Agentic Workflow"}
}

for slug, info in skills.items():
    path = os.path.join(".agents", "skills", slug, "SKILL.md")
    if os.path.exists(path):
        with open(path, "w") as f:
            f.write(OMEGA_TEMPLATE.format(name=slug, description=info["description"], title=info["title"]))
