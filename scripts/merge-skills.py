import os
import shutil
from pathlib import Path

SKILLS_DIR = Path("/home/zeazdev/zeaz-platform/.agents/skills")

MAPPINGS = {
    "zai-trader": [
        "trader-backtest", "trader-cloud-backtest", "trader-explain",
        "trader-portfolio", "trader-portfolio-cg", "trader-regime",
        "trader-risk", "trader-signal", "trader-train"
    ],
    "zai-seo-optimization": [
        "seo", "search-first"
    ],
    "zai-copywriting-ai": [
        "copywriting-ai", "storybrand-messaging", "made-to-stick", "brand-voice"
    ],
    "zai-sales-funnel": [
        "sales-funnel", "hundred-million-offers", "predictable-revenue", "lead-intelligence", "cro-methodology"
    ],
    "zai-content-strategy": [
        "content-strategy", "article-writing", "contagious", "brand"
    ],
    "zai-email-marketing": [
        "email-marketing", "email-ops"
    ],
    "zai-prompt-engineering": [
        "prompt-engineering", "prompt-optimizer"
    ],
    "zai-video-editing-ai": [
        "video-editing", "video-editing-ai", "fal-ai-media"
    ],
    "zai-canva-ai-design": [
        "canva-ai-design", "banner-design", "slides"
    ],
    "zai-analytics-data": [
        "analytics-data", "lean-analytics", "plankton-code-quality"
    ],
    "zai-social-media-growth": [
        "social-media-growth", "social-graph-ranker"
    ],
    "zai-scientific-research": [
        "scientific-db-pubmed-database", "scientific-db-uspto-database",
        "scientific-pkg-gget", "scientific-thinking-literature-review",
        "scientific-thinking-scholar-evaluation", "research-ops", "research-synthesize"
    ],
    "zai-cloudflare-platform": [
        "cloudflare", "cloudflare-email-service", "durable-objects", "wrangler", "workers-best-practices"
    ],
    "zai-agentdb": [
        "agentdb-advanced", "agentdb-learning", "agentdb-memory-patterns",
        "agentdb-optimization", "agentdb-query", "agentdb-vector-search",
        "reasoningbank-agentdb", "reasoningbank-intelligence"
    ],
    "zai-v3-core": [
        "v3-cli-modernization", "v3-core-implementation", "v3-ddd-architecture",
        "v3-integration-deep", "v3-mcp-optimization", "v3-memory-unification",
        "v3-performance-optimization", "v3-security-overhaul", "v3-swarm-coordination"
    ],
    "zai-vector-search": [
        "vector-cluster", "vector-embed", "vector-hyperbolic", "vector-search", "vector-setup"
    ],
    "zai-aif-core": [
        "aif", "aif-architecture", "aif-archive", "aif-best-practices", "aif-build-automation",
        "aif-ci", "aif-commit", "aif-distillation", "aif-dockerize", "aif-docs", "aif-evolve",
        "aif-explore", "aif-fix", "aif-grounded", "aif-implement", "aif-improve", "aif-loop",
        "aif-plan", "aif-qa", "aif-reference", "aif-review", "aif-roadmap", "aif-rules",
        "aif-rules-check", "aif-security-checklist", "aif-skill-generator", "aif-verify"
    ]
}

def merge_skills():
    merged_count = 0
    for master_skill, sub_skills in MAPPINGS.items():
        master_dir = SKILLS_DIR / master_skill
        master_dir.mkdir(parents=True, exist_ok=True)
        master_file = master_dir / "SKILL.md"
        
        # Initialize master file if it doesn't exist
        if not master_file.exists():
            master_file.write_text(f"---\nname: {master_skill}\ndescription: Master skill combining related sub-skills\n---\n\n# {master_skill}\n\n", encoding="utf-8")
        
        master_content = master_file.read_text(encoding="utf-8")
        
        for sub in sub_skills:
            sub_dir = SKILLS_DIR / sub
            sub_file = sub_dir / "SKILL.md"
            if sub_dir.exists() and sub_file.exists() and sub_dir != master_dir:
                try:
                    content = sub_file.read_text(encoding="utf-8")
                    # Clean up frontmatter from sub-skills to avoid breaking master frontmatter
                    if content.startswith("---"):
                        parts = content.split("---", 2)
                        if len(parts) >= 3:
                            content = parts[2].strip()
                            
                    master_content += f"\n\n## Sub-skill: {sub}\n\n{content}\n"
                    
                    # Delete the old sub-skill directory
                    shutil.rmtree(sub_dir)
                    merged_count += 1
                    print(f"Merged and removed: {sub} -> {master_skill}")
                except Exception as e:
                    print(f"Error merging {sub}: {e}")
                    
        # Write back the merged content
        master_file.write_text(master_content, encoding="utf-8")
        
    print(f"Total skills merged: {merged_count}")

if __name__ == "__main__":
    merge_skills()
