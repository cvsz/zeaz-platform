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
            # Check if it already has the lock
            already_has_lock = False
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines) and "with _state_lock:" in lines[j]:
                already_has_lock = True

            if already_has_lock:
                new_lines.append(lines[i])
                i += 1
                continue

            # It needs a lock.
            new_lines.append(lines[i])
            new_lines.append("    with _state_lock:\n")
            
            # Find the end of the function
            # The body starts at i+1
            # The function ends when we hit a line that is not indented and not empty
            # and is not a comment (well, even comments should be indented if they are in the body)
            # Actually, in Python, a function ends when the indentation level returns to 0.
            
            j = i + 1
            # Skip empty lines/comments after def
            while j < len(lines) and (not lines[j].strip()):
                j += 1
            
            if j < len(lines):
                # Find the indentation of the first line of the body
                match = re.match(r'^(\s*)', lines[j])
                if match:
                    body_indent = len(match.group(1))
                else:
                    body_indent = 0
                
                # Find the end of the function block
                # A function block ends when we find a line with indentation < body_indent
                # AND that line is not empty.
                end_j = j
                while end_j < len(lines):
                    line = lines[end_j]
                    if line.strip():
                        match = re.match(r'^(\s*)', line)
                        current_indent = len(match.group(1))
                        if current_indent < body_indent:
                            break
                    end_j += 1
                
                # Indent the body
                for k in range(j, end_j):
                    line = lines[k]
                    if line.strip():
                        # Add 4 spaces to the existing indentation
                        # We'll use the existing indentation and prepend 4 spaces.
                        new_lines.append("    " + line)
                    else:
                        new_lines.append(line)
                i = end_j
            else:
                i += 1
        else:
            new_lines.append(lines[i])
            i += 1

    with open("app/gateway_presence.py", "w") as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    main()
