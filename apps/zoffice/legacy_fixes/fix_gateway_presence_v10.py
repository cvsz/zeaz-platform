import re
import textwrap

def main():
    with open("app/gateway_presence.py", "r") as f:
        lines = f.readlines()

    target_funcs = [
        '_mark_run_active',
        '_mark_run_inactive',
        '_agent_has_active_run',
        '_mark_tool_active',
        '_mark_tool_inactive',
        '_agent_has_active_tool',
        '_agent_has_active_activity',
        '_set_working',
        '_set_finishing',
        '_set_idle',
        '_ensure_agent',
        '_is_manual_override_active',
        '_note_event',
        '_process_event'
    ]

    new_lines = []
    i = 0
    while i < len(lines):
        matched_func = None
        for func in target_funcs:
            if lines[i].strip().startswith(f"def {func}("):
                matched_func = func
                break
        
        if matched_func:
            # Find the end of the function block
            # The body starts at i+1
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            
            if j < len(lines):
                # Determine base indentation of the body
                match = re.match(r'^(\s*)', lines[j])
                if match:
                    body_indent_val = len(match.group(1))
                else:
                    body_indent_val = 0
                
                # Find the end of the function block
                end_j = j
                while end_j < len(lines):
                    line = lines[end_j]
                    if line.strip():
                        match = re.match(r'^(\s*)', line)
                        current_indent = len(match.group(1))
                        if current_indent < body_indent_val:
                            break
                    end_j += 1
                
                # Extract body
                body_lines = lines[j:end_j]
                
                # 1. Remove all 'with _state_lock:' lines from the body
                cleaned_body_lines = []
                for line in body_lines:
                    if re.match(r'^\s*with _state_lock:\s*$', line):
                        continue
                    cleaned_body_lines.append(line)
                
                # 2. Use textwrap.dedent on the cleaned body
                # We need to join them first.
                body_str = "".join(cleaned_body_lines)
                dedented_body = textwrap.dedent(body_str)
                
                # 3. Re-construct
                new_lines.append(lines[i])
                new_lines.append("    with _state_lock:\n")
                
                # The dedented body might have lines that were empty. 
                # We want to make sure we don't lose them.
                # Since dedent works on the whole block, it should be fine.
                
                # We need to add 4 spaces to the dedented body.
                # But wait, textwrap.dedent might remove ALL indentation if we're not careful.
                # Actually, it removes the common leading whitespace.
                
                # Let's manually indent each line by 4 spaces.
                for line in dedented_body.splitlines(keepends=True):
                    if line.strip():
                        new_lines.append("    " + line.lstrip())
                    else:
                        new_lines.append(line)
                
                i = end_j
            else:
                new_lines.append(lines[i])
                i += 1
        else:
            new_lines.append(lines[i])
            i += 1

    with open("app/gateway_presence.py", "w") as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    main()
