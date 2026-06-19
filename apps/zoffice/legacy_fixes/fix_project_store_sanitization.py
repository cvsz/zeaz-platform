import re

def sanitize_id(id_str):
    if not id_str:
        return ""
    # Keep only alphanumeric, hyphens, and underscores
    return re.sub(r"[^a-zA-Z0-9\-_]", "", id_str)

def main():
    with open("app/project_store.py", "r") as f:
        content = f.read()

    # 1. Add sanitize_id function
    new_sanitize_func = """def _sanitize_id(id_str: str) -> str:
    \"\"\"Remove any characters that are not alphanumeric, hyphens, or underscores.\"\"\"
    if not id_str:
        return ""
    return re.sub(r"[^a-zA-Z0-9\\-_]", "", id_str)

"""
    if "_sanitize_id" not in content:
        content = new_sanitize_func + content
        print("Added _sanitize_id function")

    # 2. Update delete_project to use sanitized IDs
    # In delete_project, we use project_id in os.path.join.
    # We should also check it against meta.get("id") with the sanitized version? 
    # No, meta.get("id") is what it is. 
    # But the os.path.join calls should use sanitized versions.

    # Actually, let's just sanitize the input project_id at the beginning of delete_project.
    
    # Wait, if we sanitize project_id, it might not match the original id in the file.
    # For example, if project_id is "my_project!", sanitized is "my_project".
    # If the file has "my_project!", it won't match.
    
    # Better: Use the sanitized version ONLY for filesystem operations.
    # The comparison with meta.get("id") should use the ORIGINAL project_id.

    # Let's find the start of delete_project.
    
    # current delete_project starts at line 190.
    # Let's use a more robust approach.

    # I'll replace the body of delete_project.
    
    old_delete_project_body = """    def delete_project(self, project_id: str) -> bool:
        with self.lock:
            deleted = False
            self._migrate_legacy_if_needed()
            for entry in os.listdir(self.projects_dir):
                project_dir = os.path.join(self.projects_dir, entry)
                project_md = os.path.join(project_dir, "project.md")
                if not os.path.isfile(project_md):
                    continue
                meta, _ = _parse_frontmatter(open(project_md, encoding="utf-8").read())
                if meta.get("id") == project_id:
                    shutil.rmtree(project_dir, ignore_errors=True)
                    deleted = True
                    break

            legacy = {"projects": [], "templates": []}
            if os.path.isfile(self.legacy_json):
                try:
                    with open(self.legacy_json, "r", encoding="utf-8") as f:
                        legacy = json.load(f)
                except Exception:
                    legacy = {"projects": [], "templates": []}

            before_projects = len(legacy.get("projects", []))
            before_templates = len(legacy.get("templates", []))
            legacy["projects"] = [p for p in legacy.get("projects", []) if p.get("id") != project_id]
            legacy["templates"] = [t for t in legacy.get("templates", []) if t.get("id") != project_id]
            if len(legacy["projects"]) != before_projects or len(legacy["templates"]) != before_templates:
                _atomic_write(self.legacy_json, json.dumps(legacy, ensure_ascii=False, indent=2) + "\n")
                deleted = True

            task_dir = os.path.join(self.status_dir, "project-tasks", project_id)
            if os.path.isdir(task_dir):
                shutil.rmtree(task_dir, ignore_errors=True)
                deleted = True

            md_dir = os.path.join(self.projects_dir, _slugify(project_id, fallback=project_id))
            if os.path.isdir(md_dir):
                shutil.rmtree(md_dir, ignore_errors=True)

            return deleted"""

    # This is too risky. I will just use regex to find the function and replace its content.
    
    pattern = r"def delete_project\(self, project_id: str\) -> bool:\n(.*?)(?=\n\n|\ndef)"
    # Wait, the above regex is not quite right for multiline.
    
    # Let's just replace the whole function.
    
    new_delete_project = """    def delete_project(self, project_id: str) -> bool:
        with self.lock:
            deleted = False
            self._migrate_legacy_if_needed()
            
            # Use sanitized ID for filesystem operations to prevent path traversal
            safe_id = _sanitize_id(project_id)
            
            # 1. Find and remove the project directory
            for entry in os.listdir(self.projects_dir):
                project_dir = os.path.join(self.projects_dir, entry)
                project_md = os.path.join(project_dir, "project.md")
                if not os.path.isfile(project_md):
                    continue
                try:
                    with open(project_md, "r", encoding="utf-8") as f:
                        meta, _ = _parse_frontmatter(f.read())
                except Exception:
                    continue
                if meta.get("id") == project_id:
                    shutil.rmtree(project_dir, ignore_errors=True)
                    deleted = True
                    break
            
            if not deleted:
                # 2. Maybe it was a legacy project?
                if os.path.isfile(self.legacy_json):
                    try:
                        with open(self.legacy_json, "r", encoding="utf-8") as f:
                            legacy = json.load(f)
                        before_projects = len(legacy.get("projects", []))
                        before_templates = len(legacy.get("templates", []))
                        legacy["projects"] = [p for p in legacy.get("projects", []) if p.get("id") != project_id]
                        legacy["templates"] = [t for t in legacy.get("templates", []) if t.get("id") != project_id]
                        if len(legacy["projects"]) != before_projects or len(legacy["templates"]) != before_templates:
                            _atomic_write(self.legacy_json, json.dumps(legacy, ensure_ascii=False, indent=2) + "\\n")
                            deleted = True
                    except Exception:
                        pass

            if deleted:
                # 3. Now that we've confirmed the project existed, it's safe to remove its tasks
                task_dir = os.path.join(self.status_dir, "project-tasks", safe_id)
                if os.path.isdir(task_dir):
                    shutil.rmtree(task_dir, ignore_errors=True)

            md_dir = os.path.join(self.projects_dir, _slugify(project_id, fallback=project_id))
            if os.path.isdir(md_dir):
                shutil.rmtree(md_dir, ignore_errors=True)

            return deleted"""

    # I'll use a simpler replacement by looking for the start and end of the function.
    # Since I don't know the exact line numbers, I'll search for the function signature.

    # Actually, let's just use a more targeted replacement for the task_dir part.
    
    # The current code:
    #            task_dir = os.path.join(self.status_dir, "project-tasks", project_id)
    #            if os.path.isdir(task_dir):
    #                shutil.rmtree(task_dir, ignore_errors=True)
    #                deleted = True

    # We want to change it to use safe_id.

    # BUT we also need to define safe_id.
    
    # Let's try a different approach. I will use `sed` or similar via bash to be more precise.
    # Or just use the `edit` tool.

    # I will use the `edit` tool to:
    # 1. Add `_sanitize_id` function at the top.
    # 2. Replace the `task_dir` line in `delete_project`.

    pass

if __name__ == "__main__":
    main()
