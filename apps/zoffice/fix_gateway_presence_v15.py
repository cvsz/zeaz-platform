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
        line = lines[i]
        matched_func = None
        for func in target_funcs:
            if line.strip().startswith(f"def {func}("):
                matched_func = func
                break
        
        if matched_func:
            new_lines.append(line)
            # Add the new lock
            new_lines.append("    with _state_lock:\n")
            
            # Move to the next line
            i += 1
            
            # Now we are in the function body.
            # We need to skip any existing 'with _state_lock:' lines
            # and indent everything else.
            # The function ends when we hit a line with indentation <= the 'def' line indentation.
            
            # Get the indentation of the 'def' line
            def_indent_match = re.match(r'^(\s*)', line)
            def_indent = len(def_indent_match.group(1)) if def_indent_match else 0
            
            while i < len(lines):
                curr_line = lines[i]
                
                # Check if the function has ended
                if curr_line.strip() and not curr_line.startswith(' '):
                    # But wait, if it's a comment or something? 
                    # In Python, a function ends when indentation returns to 0 or less than the def.
                    # Actually, for top-level functions, def is at 0.
                    # So any non-empty line with 0 indentation ends the function.
                    # But if the function is inside a class, it might be different.
                    # Here they are all top-level.
                    if len(re.match(r'^(\s*)', curr_line).group(1)) <= def_indent:
                        break
                
                # If it's a 'with _state_lock:' line, skip it
                if re.match(r'^\s*with _state_lock:\s*$', curr_line):
                    i += 1
                    continue
                
                # Otherwise, indent it by 4 spaces
                new_lines.append("    " + curr_line)
                i += 1
            continue # i is already incremented
        else:
            new_lines.append(line)
            i += 1

    with open("app/gateway_presence.py", "w") as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    main()
