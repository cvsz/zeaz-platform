import re

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
                    body_indent = len(match.group(1))
                else:
                    body_indent = 0
                
                # Find the end of the function block
                end_j = j
                while end_j < len(lines):
                    line = lines[end_j]
                    if line.strip():
                        match = re.match(r'^(\s*)', line)
                        current_indent = len(match.group(1))
                        if current_indent < body_indent:
                            break
                    end_j += 1
                
                # 1. Add the def line
                new_lines.append(lines[i])
                # 2. Add the single with _state_lock:
                new_lines.append("    with _state_lock:\n")
                
                # 3. Add the body lines, but strip any existing 'with _state_lock:' AND fix indentation
                for k in range(j, end_j):
                    line = lines[k]
                    # Check if the line is a 'with _state_lock:' line
                    if "with _state_lock:" in line:
                        continue
                    
                    if line.strip():
                        # Indent the line by 4 spaces relative to its original indentation
                        # But we must ensure it's at least 4 spaces.
                        # Actually, the new indentation level is 4 + original_indent.
                        match = re.match(r'^(\s*)', line)
                        original_indent = len(match.group(1))
                        new_lines.append(" " * (4 + original_indent) + line.lstrip())
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
