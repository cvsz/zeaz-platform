import sys

with open('/home/zeazdev/zeaz-platform/apps/zoffice/app/gateway_presence.py', 'r') as f:
    content = f.read()

fixed = """def _note_event(event_type):
    with _state_lock:
        _debug["lastEventAt"] = int(time.time())
        counts = _debug.setdefault("events", {})
        counts[event_type] = counts.get(event_type, 0) + 1


def _is_manual_override_active(agent_id, now=None):
    with _state_lock:
        now = now or time.time()
        override = _manual_overrides.get(agent_id)
        if override and override["expires"] > now:
            return True
        if override and override["expires"] <= now:
            del _manual_overrides[agent_id]
        if agent_id in _state and _state[agent_id].get("source") == "manual":
            _state[agent_id]["source"] = "manual-expired"
        return False


def _ensure_agent(agent_id, source="discovered"):
    with _state_lock:
        if not agent_id:
            return
        if agent_id not in _state:
            _state[agent_id] = {"state": "idle", "task": "", "updated": 0, "source": source}


def _mark_run_active(agent_id, run_id):
    with _state_lock:
        if not agent_id or not run_id:
            return
        _run_agents[run_id] = agent_id
        _active_runs_by_agent.setdefault(agent_id, set()).add(run_id)
        _active_run_last_seen[run_id] = time.time()


def _mark_run_inactive(agent_id, run_id):
    with _state_lock:
        if not agent_id or not run_id:
            return
        _active_run_last_seen.pop(run_id, None)
        runs = _active_runs_by_agent.get(agent_id)
        if runs:
            runs.discard(run_id)
            if not runs:
                _active_runs_by_agent.pop(agent_id, None)


def _agent_has_active_run(agent_id):
    with _state_lock:
        runs = _active_runs_by_agent.get(agent_id)
        if not runs:
            return False

        now = time.time()
        stale = {
            run_id
            for run_id in runs
            if now - _active_run_last_seen.get(run_id, 0) > ACTIVE_RUN_STALE_SEC
        }

        if stale:
            runs.difference_update(stale)
            for run_id in stale:
                _active_run_last_seen.pop(run_id, None)

        if not runs:
            _active_runs_by_agent.pop(agent_id, None)
            return False

        return True


def _mark_tool_active(agent_id, tool_id):
    with _state_lock:
        if not agent_id or not tool_id:
            return
        tid = str(tool_id)
        _active_tools_by_agent.setdefault(agent_id, set()).add(tid)
        _active_tool_last_seen[tid] = time.time()


def _mark_tool_inactive(agent_id, tool_id):
    with _state_lock:
        if not agent_id or not tool_id:
            return
        tid = str(tool_id)
        _active_tool_last_seen.pop(tid, None)
        tools = _active_tools_by_agent.get(agent_id)
        if tools:
            tools.discard(tid)
            if not tools:
                _active_tools_by_agent.pop(agent_id, None)


def _agent_has_active_tool(agent_id):
    with _state_lock:
        tools = _active_tools_by_agent.get(agent_id)
        if not tools:
            return False
        now = time.time()
        stale = {tool_id for tool_id in tools if now - _active_tool_last_seen.get(tool_id, 0) > ACTIVE_TOOL_STALE_SEC}
        if stale:
            tools.difference_update(stale)
            for tool_id in stale:
                _active_tool_last_seen.pop(tool_id, None)
        if not tools:
            _active_tools_by_agent.pop(agent_id, None)
            return False
        return True


def _agent_has_active_activity(agent_id):
    with _state_lock:
        return _agent_has_active_run(agent_id) or _agent_has_active_tool(agent_id)


def _set_working(agent_id, task="Working", source="gateway-event", run_id=None):
    with _state_lock:
        if not agent_id or _is_manual_override_active(agent_id):
            return
        now = time.time()
        _ensure_agent(agent_id)
        _last_event_at[agent_id] = now
        _last_event_task[agent_id] = task or "Working"
        _finish_idle_at.pop(agent_id, None)
        if run_id:
            _mark_run_active(agent_id, run_id)
        _state[agent_id].update({
            "state": "working",
            "task": task or "Working",
            "updated": int(now),
            "source": source,
            **({"runId": run_id} if run_id else {})
        })


def _set_finishing(agent_id, source="gateway-lifecycle", run_id=None):
    with _state_lock:
        if not agent_id or _is_manual_override_active(agent_id):
            return
        now = time.time()
        _ensure_agent(agent_id)
        if run_id:
            _mark_run_inactive(agent_id, run_id)
            if _agent_has_active_activity(agent_id):
                _set_working(agent_id, _last_event_task.get(agent_id) or "Working", source, None)
                return
        _last_event_at[agent_id] = now
        _finish_idle_at[agent_id] = now + FINISHING_GRACE_SEC
        current_task = _state.get(agent_id, {}).get("task") or _last_event_task.get(agent_id, "")
        _state[agent_id].update({
            "state": "finishing",
            "task": current_task,
            "updated": int(now),
            "source": source,
            **({"runId": run_id} if run_id else {})
        })


def _set_idle(agent_id, source="gateway-idle"):
    with _state_lock:
        if not agent_id or _is_manual_override_active(agent_id) or _agent_has_active_activity(agent_id):
            return
        now = time.time()
        _ensure_agent(agent_id)
        _finish_idle_at.pop(agent_id, None)
        _state[agent_id].update({
            "state": "idle",
            "task": "",
            "updated": int(now),
            "source": source
        })"""

import re

# We will replace from def _note_event to the end of _set_idle
pattern1 = r'def _note_event\(event_type\):.*?def _format_tool_task'
content = re.sub(pattern1, fixed + '\n\n\ndef _format_tool_task', content, flags=re.DOTALL)

fixed_process_event = """def _process_event(event_type, payload):
    with _state_lock:
        \"\"\"Process a gateway event and update presence state.
        
        Supports current OpenClaw event frames:
        - agent: {runId, stream, sessionKey, data:{...}}
        - session.tool/session.message/sessions.changed: session-scoped events
        - presence: gateway/client/node presence, used only as a liveness signal
        \"\"\"
        if not isinstance(payload, dict):
            return
        _note_event(event_type)
        
        session_key = payload.get("sessionKey") or payload.get("key") or ""
        agent_id = _extract_agent_id(session_key)
        run_id = payload.get("runId") or payload.get("id")
        if run_id and not agent_id:
            agent_id = _run_agents.get(run_id)
        
        # Some payloads nest useful fields under data.
        data = payload.get("data") if isinstance(payload.get("data"), dict) else {}
        if not agent_id:
            agent_id = _extract_agent_id(data.get("sessionKey") or data.get("key") or "")
        if run_id and agent_id:
            _run_agents[run_id] = agent_id
        
        if event_type == "agent":
            stream = str(payload.get("stream") or data.get("stream") or payload.get("type") or "")
            phase = str(data.get("phase") or payload.get("phase") or "")
            
            if stream == "lifecycle" or phase:
                if phase in ("start", "accepted", "running"):
                    _set_working(agent_id, "Working", "agent-lifecycle", run_id)
                elif phase in ("end", "done", "final", "complete", "completed", "error", "aborted", "cancelled", "canceled", "failed"):
                    _set_finishing(agent_id, "agent-lifecycle", run_id)
                else:
                    _set_working(agent_id, "Working", "agent-lifecycle", run_id)
                return
            
            if stream in ("tool", "tool_start", "command_output", "approval", "plan", "patch", "item"):
                name, args = _read_tool_name_and_args(data or payload)
                task = _format_tool_task(name, args)
                if task is None:
                    return
                tool_id = _read_tool_id(payload, data)
                if phase in ("result", "end", "done", "error", "aborted", "cancelled", "canceled", "failed"):
                    _mark_tool_inactive(agent_id, tool_id)
                    if _agent_has_active_activity(agent_id):
                        _set_working(agent_id, _last_event_task.get(agent_id) or task, f"agent-{stream}", run_id)
                    else:
                        _set_finishing(agent_id, f"agent-{stream}", None)
                else:
                    if tool_id:
                        _mark_tool_active(agent_id, tool_id)
                    _set_working(agent_id, task, f"agent-{stream}", run_id)
                return
            
            # Any other agent stream means the run is alive.
            _set_working(agent_id, "Working", f"agent-{stream or 'event'}", run_id)
            return
        
        if event_type == "session.tool":
            name, args = _read_tool_name_and_args(payload)
            task = _format_tool_task(name, args)
            if task is None:
                return
            phase = str(payload.get("phase") or data.get("phase") or payload.get("status") or "")
            tool_id = _read_tool_id(payload, data)
            if phase in ("result", "end", "done", "error", "aborted", "cancelled", "canceled", "failed"):
                _mark_tool_inactive(agent_id, tool_id)
                if _agent_has_active_activity(agent_id):
                    _set_working(agent_id, _last_event_task.get(agent_id) or task, "session-tool", run_id)
                else:
                    _set_finishing(agent_id, "session-tool", None)
            else:
                if tool_id:
                    _mark_tool_active(agent_id, tool_id)
                _set_working(agent_id, task, "session-tool", run_id)
            return
        
        if event_type == "session.message":
            role = payload.get("role") or data.get("role")
            if role == "assistant":
                # Assistant messages can appear between tool calls/stream phases. Do not
                # let them flip an actively running agent out of working state.
                if not _agent_has_active_activity(agent_id):
                    _set_finishing(agent_id, "session-message", run_id)
            elif role == "user":
                _set_working(agent_id, "Responding", "session-message", run_id)
            return
        
        if event_type == "sessions.changed":
            reason = str(payload.get("reason") or "")
            if reason in ("run-started", "run_started", "created", "send", "message"):
                _set_working(agent_id, "Active", "sessions-changed", run_id)
            return
        
        if event_type == "chat":
            state_val = str(payload.get("state", ""))
            if state_val in ("delta", "streaming"):
                _set_working(agent_id, "Responding...", "chat", run_id)
            elif state_val in ("final", "done"):
                _set_finishing(agent_id, "chat", run_id)"""

pattern2 = r'def _process_event\(event_type, payload\):.*?def _process_sessions_list'
content = re.sub(pattern2, fixed_process_event + '\n\n\ndef _process_sessions_list', content, flags=re.DOTALL)

with open('/home/zeazdev/zeaz-platform/apps/zoffice/app/gateway_presence.py', 'w') as f:
    f.write(content)

print("Done")
