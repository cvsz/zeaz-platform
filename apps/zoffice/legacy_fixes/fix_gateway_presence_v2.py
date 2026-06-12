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
    
    for func in target_funcs:
        # Match 'def func(...):' and everything following until next 'def ' (non-indented)
        pattern = re.compile(rf'(def {func}\(.*?\)[:\s]*)(?=\n\S|\Z)', re.DOTALL)
        
        def repl(m):
            header = m.group(1)
            # We need to find the body and indent it.
            # But since we can't easily find the end of the block with regex alone in a reliable way
            # without knowing the indentation, let's try a different approach.
            # We'll use the fact that the body is indented.
            return header # placeholder

        # Let's use a more robust approach.
        # 1. Split content into lines.
        # 2. Find the line number of the function definition.
        # 3. Find the end of the function block (first unindented line).
        # 4. Insert '    with _state_lock:' and indent everything between.

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
            new_lines.append(lines[i])
            # Check if it already has the lock
            if "with _state_lock:" in lines[i]: # Unlikely for a def line
                i += 1
                continue
            
            # We'll add the lock line.
            # We need to find where the function body ends.
            # The body starts at i+1.
            # It ends when a line is not indented (and not empty).
            
            # Let's peek at the next line to see its indentation.
            j = i + 1
            if j < len(lines):
                # Determine base indentation of the body
                base_indent = 0
                while j < len(lines) and not lines[j].strip():
                    j += 1
                if j < len(lines):
                    match = re.match(r'^(\s*)', lines[j])
                    if match:
                        base_indent = len(match.group(1))
                
                # Now find the end of the function
                end_j = j
                while end_j < len(lines):
                    if lines[end_j].strip() and not lines[end_j].startswith(' '):
                        break
                    end_j += 1
                
                # Insert the lock line
                new_lines.append("    with _state_lock:")
                
                # Indent the body lines
                for k in range(j, end_j):
                    if lines[k].strip():
                        # We want to add 4 spaces to the existing indentation
                        # to account for the 'with _state_lock:' level.
                        # But we must ensure we don't just blindly add spaces.
                        # Actually, if the base indentation is 4, we add 4 more.
                        new_lines.append("    " + lines[k])
                    else:
                        new_lines.append("")
                
                i = end_j
                continue
            else:
                new_lines.append("    with _state_lock:")
                i += 1
                continue
        else:
            new_lines.append(lines[i])
            i += 1

    with open("app/gateway_presence.py", "w") as f:
        f.write("\n".join(new_lines))

    print("gateway_presence.py fixes applied with indentation awareness.")

if __name__ == "__main__":
    main()
