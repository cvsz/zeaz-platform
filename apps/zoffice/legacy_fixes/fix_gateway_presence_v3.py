import re

def main():
    with open("app/gateway_presence.py", "r") as f:
        content = f.read()

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

    lines = content.splitlines()
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
            # We look ahead to the next non-empty line to see if it's 'with _state_lock:'
            already_has_lock = False
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines) and lines[j].strip().startswith("with _state_lock:"):
                already_has_lock = True

            if already_has_lock:
                new_lines.append(lines[i])
                i += 1
                continue

            new_lines.append(lines[i])
            new_lines.append("    with _state_lock:")
            
            # Find the end of the function block
            # The body starts at i+1.
            # We find the first line after i+1 that is not indented.
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            
            if j < len(lines):
                # Determine base indentation of the body
                match = re.match(r'^(\s*)', lines[j])
                base_indent_str = match.group(1) if match else ""
                
                # Find the end of the function (first unindented line)
                end_j = j
                while end_j < len(lines):
                    if lines[end_j].strip() and not lines[end_j].startswith(' '):
                        break
                    end_j += 1
                
                # Indent the body lines
                for k in range(j, end_j):
                    if lines[k].strip():
                        # We want to add 4 spaces to the existing indentation.
                        # Since the 'with' block is at 4 spaces, the content should be at base_indent + 4.
                        # But the 'with' block itself is at 4 spaces.
                        # So we add 4 spaces to the current line.
                        new_lines.append("    " + lines[k])
                    else:
                        new_lines.append("")
                i = end_j
            else:
                i += 1
        else:
            new_lines.append(lines[i])
            i += 1

    with open("app/gateway_presence.py", "w") as f:
        f.write("\n".join(new_lines))

    print("gateway_presence.py fixes applied with indentation awareness (v3).")

if __name__ == "__main__":
    main()
