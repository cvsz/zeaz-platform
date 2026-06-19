import os
from pathlib import Path

SKILLS_DIR = Path("/home/zeazdev/zeaz-platform/.agents/skills")

ADDON_SKILLS = {
    "zai-security": {
        "description": "Master skill for DevSecOps, Zero Trust, WAF, and AgentShield",
        "content": "## ZAI Security & Zero Trust\nFocuses on securing the ZeaZ platform using Cloudflare Zero Trust, API Shield, WAF rules, and DevSecOps best practices. Ensures all secrets, credentials, and CI/CD pipelines meet the strict no-hardcode policies."
    },
    "zai-ops": {
        "description": "Master skill for SRE, GitOps, Terraform, and OpenTofu",
        "content": "## ZAI Operations & SRE\nHandles GitOps workflows, Infrastructure as Code (Terraform & OpenTofu), Observability (Prometheus/Grafana/Loki), and Disaster Recovery. Responsible for keeping the platform running predictably and safely."
    },
    "zai-fintech": {
        "description": "Master skill for Financial Platforms, Crypto, and Treasuries",
        "content": "## ZAI Fintech & Web3\nGoverns the development of `pay.zeaz.dev`, `treasury.zeaz.dev`, and `zwallet`. Enforces strict fintech security, WebAuthn MFA policies, step-up authentication, and crypto logic guardrails."
    },
    "zai-mobile": {
        "description": "Master skill for Mobile App Development (Flutter, React Native, HarmonyOS)",
        "content": "## ZAI Mobile Development\nProvides architectural patterns and build resolvers for creating seamless cross-platform mobile experiences for the ZeaZ ecosystem, focusing on clean architecture and responsive fluid UI."
    }
}

def add_skills():
    added_count = 0
    for skill_name, data in ADDON_SKILLS.items():
        skill_dir = SKILLS_DIR / skill_name
        skill_dir.mkdir(parents=True, exist_ok=True)
        skill_file = skill_dir / "SKILL.md"
        
        if not skill_file.exists():
            frontmatter = f"---\nname: {skill_name}\ndescription: {data['description']}\n---\n\n# {skill_name}\n\n{data['content']}\n"
            skill_file.write_text(frontmatter, encoding="utf-8")
            print(f"Added new addon skill: {skill_name}")
            added_count += 1
        else:
            print(f"Skill already exists: {skill_name}")
            
    print(f"Total addon skills created: {added_count}")

if __name__ == "__main__":
    add_skills()
