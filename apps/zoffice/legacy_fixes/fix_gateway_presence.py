import re

def main():
    with open("app/gateway_presence.py", "r") as f:
        content = f.read()

    # We want to wrap all the _mark_* and _agent_has_* calls in the existing _state_lock blocks.
    # But it's cleaner to just make all those functions use the lock.

    # Let's find all the functions and add the lock.
    # However, many are helper functions called by others.
    
    # A better approach:
    # 1. Wrap all _mark_* and _agent_has_* functions with the lock.
    # 2. Remove the lock from _set_working, _set_finishing, _set_idle (since they will call locked functions).
    # 3. Wait, _set_working and _set_finishing also update _state, which is protected by the lock.
    # So they should keep their lock and call the other functions while holding it.

    # Let's use a simpler approach:
    # Just add the lock to every function that modifies or reads any of the presence-related dicts.

    # Functions to protect:
    # _mark_run_active, _mark_run_inactive, _agent_has_active_run
    # _mark_tool_active, _mark_tool_inactive, _agent_has_active_tool
    # _agent_has_active_activity
    # _set_working, _set_finishing, _set_idle
    # _set_manual_override (already has lock)
    # _extract_agent_id (read-only, no lock needed)
    # _note_event (read-only, no lock needed)
    # _process_event (calls the others)
    # _maintenance_tick (calls _set_idle)

    # Instead of a complex regex, let's just use a more surgical approach.
    # I'll use the existing _state_lock for everything.

    # Let's redefine the functions in the file.
    
    # I'll use a script that reads the file and applies the changes.
    # This is hard because the functions are long.
    # I'll use a regex to wrap the bodies of the functions.

    # This is a bit dangerous. Let's try a different way.
    # I'll just use the `sed` or `replace` approach on the specific lines.
    
    # Let's look at the functions again.
    # _mark_run_active(agent_id, run_id)
    # _mark_run_inactive(agent_id, run_id)
    # _agent_has_active_run(agent_id)
    # _mark_tool_active(agent_id, tool_id)
    # _mark_tool_inactive(agent_id, tool_id)
    # _agent_has_active_tool(agent_id)
    # _agent_has_active_activity(agent_id)
    # _set_working(agent_id, task, source, run_id)
    # _set_finishing(agent_id, source, run_id)
    # _set_idle(agent_id, source)

    # Actually, I can just add `with _state_lock:` at the start of each of these functions.
    # Since they are all called from `_process_event` or `_maintenance_tick`, 
    # and those are called from a single thread (the WS reader thread or the maintenance thread),
    # we just need to make sure that multiple threads don't access these dicts.
    # But the WS reader thread and the maintenance thread are two different threads.
    # So they both need to use the lock.

    # Let's find the function definitions and wrap them.
    # We'll use a regex to find the start of the function and add the lock.
    
    # Function pattern: def name(args):
    # We want to replace it with:
    # def name(args):
    #     with _state_lock:
    
    # This is still slightly dangerous if the function is already using the lock.
    # But none of them seem to be.

    # Let's try this:
    func_pattern = re.compile(r'def (_[a-z_]+)\((.*?)\):')
    
    # But we only want to wrap specific functions.
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
        '_note_event' # wait, _note_event is not thread safe either (modifies _debug)
    ]

    # Actually, _note_event modifies _debug. _debug is a global dict.
    # If multiple threads call _process_event, they will all call _note_event.
    # So _debug also needs a lock.

    # Let's wrap all of them.
    
    def wrap_function(content, func_name):
        # Find the function definition
        pattern = re.compile(rf'def {func_name}\((.*?)\):', re.DOTALL)
        match = pattern.search(content)
        if not match:
            return content
        
        start = match.start()
        # Find the end of the function (first unindented line after the def line)
        # This is a common way to find function ends in Python
        
        # Let's use a more robust way: find the end of the block.
        # We'll find the first line after the def line that has 0 indentation.
        
        lines = content[match.end():].splitlines()
        end_line_offset = 0
        for i, line in enumerate(lines):
            if line.strip() and not line.startswith(' ') and not line.startswith('\t'):
                end_line_offset = i + 1
                break
        
        # If we didn't find an unindented line, it's the end of the file.
        if end_line_offset == 0:
            end_line_offset = len(lines)
            
        new_content = content[:match.end()] + "    with _state_lock:\n" + content[match.end():]
        # Wait, I need to indent the entire body of the function.
        # This is much easier:
        
        # 1. Find function start
        # 2. Find function end
        # 3. Replace with:
        # def func(...):
        #     with _state_lock:
        #         [indented body]
        
        return content # placeholder

    # Let's just use the existing lines and rewrite the functions.
    # I'll use the content I have in my head.

    # Actually, I'll use the regex to wrap the whole function body.
    # pattern = r'(def name\(.*?\):)(.*?)(?=\n\n|\n\w|\Z)'
    # This is also hard.

    # Let's try this:
    # 1. Add _state_lock = threading.Lock() (it's already there)
    # 2. For each target function, find its start and end, and wrap its body.
    
    # I'll use a more surgical approach.
    # I'll find the line number of the function start and the end.

    # Instead of a regex, I'll just use the fact that they are all top-level.
    
    # Let's find the lines.
    # _mark_run_active is at 214.
    # _mark_run_inactive is at 222.
    # _agent_has_active_run is at 231.
    # _mark_tool_active is at 250.
    # _mark_tool_inactive is at 258.
    # _agent_has_active_tool is at 267.
    # _agent_has_active_activity is at 271.
    # _set_working is at 287.
    # _set_finishing is at 312.
    # _set_idle is at 341.
    
    # This is too fragile. 

    # I'll use a single regex to wrap all of them.
    # We want to match 'def func_name(...):' and then everything until the next 'def ' or end of file.
    
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
    
    # Let's try to wrap them.
    for func in target_funcs:
        # This regex matches 'def func(...):' and then everything until the next 'def ' or end of file.
        # It uses a lookahead to stop at the next 'def '.
        pattern = re.compile(rf'(def {func}\(.*?\):.*?)(?=\ndef |\Z)', re.DOTALL)
        
        def repl(m):
            body = m.group(1)
            # If it doesn't already start with 'with _state_lock:', add it.
            if 'with _state_lock:' in body:
                return body
            
            # We need to indent the body.
            # The first line is 'def func(...):'
            lines = body.splitlines()
            if not lines: return body
            header = lines[0]
            body_lines = lines[1:]
            
            new_body = [header, "    with _state_lock:"]
            for l in body_lines:
                if l.strip():
                    # Indent the line. We need to preserve its relative indentation.
                    # But since it's a top-level function, all lines should be indented by 4 spaces.
                    # Actually, they might be indented by 4 or 8 (if it's inside a class, but here it's not).
                    # Let's just strip and add 8 spaces.
                    new_body.append("        " + l.strip())
                else:
                    new_body.append("")
            return "\n".join(new_body)

        content = pattern.sub(repl, content)

    with open("app/gateway_presence.py", "w") as f:
        f.write(content)

    print("gateway_presence.py fixes applied.")

if __name__ == "__main__":
    main()
