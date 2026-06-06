#!/usr/bin/env python3
import os
import shutil
import json
import yaml

def enable_skills(source_dirs, dest_dir):
    os.makedirs(dest_dir, exist_ok=True)
    count = 0
    seen_skills = set()
    
    for src_dir in source_dirs:
        if not os.path.exists(src_dir):
            continue
            
        for item in os.listdir(src_dir):
            source_path = os.path.join(src_dir, item)
            if os.path.isdir(source_path):
                # Check if it has a SKILL.md file
                skill_md_path = os.path.join(source_path, "SKILL.md")
                if os.path.exists(skill_md_path):
                    dest_path = os.path.join(dest_dir, item)
                    # Avoid duplicate copies if already processed from a higher priority source
                    if item in seen_skills:
                        continue
                        
                    if os.path.exists(dest_path):
                        shutil.rmtree(dest_path)
                    shutil.copytree(source_path, dest_path)
                    seen_skills.add(item)
                    count += 1
                    print(f"Enabled skill: {item} -> {dest_path}")
                    
    print(f"Successfully enabled {count} skills in {dest_dir}.")

def enable_agents(source_dirs, dest_dir):
    os.makedirs(dest_dir, exist_ok=True)
    count = 0
    seen_agents = set()
    
    for src_dir in source_dirs:
        if not os.path.exists(src_dir):
            continue
            
        for filename in os.listdir(src_dir):
            if not filename.endswith(".md") or filename == "SKILL.md" or filename == "README.md":
                continue
                
            filepath = os.path.join(src_dir, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
                
            if content.startswith("---"):
                end_idx = content.find("---", 3)
                if end_idx != -1:
                    frontmatter = content[3:end_idx].strip()
                    instructions = content[end_idx+3:].strip()
                    try:
                        metadata = yaml.safe_load(frontmatter)
                    except Exception as e:
                        print(f"Error parsing metadata for {filename}: {e}")
                        continue
                    
                    # Ensure it is actually an agent profile by checking for characteristic frontmatter keys
                    # e.g., name, model, description, tools
                    if not isinstance(metadata, dict) or not ("name" in metadata or "model" in metadata or "tools" in metadata):
                        continue
                        
                    name = metadata.get("name", filename.replace(".md", ""))
                    description = metadata.get("description", "")
                    
                    if name in seen_agents:
                        continue
                        
                    agent_dir = os.path.join(dest_dir, name)
                    os.makedirs(agent_dir, exist_ok=True)
                    
                    agent_json = {
                        "name": name,
                        "description": description,
                        "instructions": instructions
                    }
                    
                    out_path = os.path.join(agent_dir, "agent.json")
                    with open(out_path, "w", encoding="utf-8") as out_f:
                        json.dump(agent_json, out_f, indent=2)
                        
                    seen_agents.add(name)
                    count += 1
                    print(f"Enabled agent: {name} -> {out_path}")
                    
    print(f"Successfully enabled {count} agents in {dest_dir}.")

if __name__ == "__main__":
    # 1. Enable skills and agents in zeaz-platform
    print("--- Enabling zeaz-platform skills and agents ---")
    platform_skill_sources = [
        "/home/zeazdev/zeaz-platform/.agent/skills",
        "/home/zeazdev/zeaz-platform/.agent/.agents/skills"
    ]
    platform_skill_dest = "/home/zeazdev/zeaz-platform/.agents/skills"
    enable_skills(platform_skill_sources, platform_skill_dest)
    
    platform_agent_sources = [
        "/home/zeazdev/zeaz-platform/.agent/skills", # Agent profiles are mixed in the skills folder here
    ]
    platform_agent_dest = "/home/zeazdev/zeaz-platform/.agents/agents"
    enable_agents(platform_agent_sources, platform_agent_dest)
    
    # 2. Enable skills and agents in zdash
    print("\n--- Enabling zdash skills and agents ---")
    zdash_skill_sources = [
        "/home/zeazdev/zdash/.agent/skills",
        "/home/zeazdev/zdash/.agent/.agents/skills"
    ]
    zdash_skill_dest = "/home/zeazdev/zdash/.agents/skills"
    enable_skills(zdash_skill_sources, zdash_skill_dest)

    zdash_agent_sources = [
        "/home/zeazdev/zdash/.agent/agents",
        "/home/zeazdev/zdash/.agent/skills"
    ]
    zdash_agent_dest = "/home/zeazdev/zdash/.agents/agents"
    enable_agents(zdash_agent_sources, zdash_agent_dest)

    # 3. Enable skills and agents in zAcademy
    print("\n--- Enabling zAcademy skills and agents ---")
    zacademy_skill_sources = [
        "/home/zeazdev/zeaz-platform/apps/zAcademy/.agent/skills"
    ]
    zacademy_skill_dest = "/home/zeazdev/zeaz-platform/apps/zAcademy/.agents/skills"
    enable_skills(zacademy_skill_sources, zacademy_skill_dest)

    zacademy_agent_sources = [
        "/home/zeazdev/zeaz-platform/apps/zAcademy/.agent/skills"
    ]
    zacademy_agent_dest = "/home/zeazdev/zeaz-platform/apps/zAcademy/.agents/agents"
    enable_agents(zacademy_agent_sources, zacademy_agent_dest)
