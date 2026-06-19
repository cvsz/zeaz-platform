import re

def main():
    with open("app/chat.js", "r") as f:
        lines = f.readlines()

    # 1. Fix rpc
    rpc_start = -1
    for i, line in enumerate(lines):
        if "function rpc(method, params) {" in line:
            rpc_start = i
            break
    if rpc_start != -1:
        # Find the end of the function by looking for the next line that is not indented
        rpc_end = -1
        for i in range(rpc_start + 1, len(lines)):
            if lines[i].strip() and not lines[i].startswith(' '):
                rpc_end = i
                break
        if rpc_end == -1:
            rpc_end = len(lines)
        
        new_rpc = [
            "  function rpc(method, params) {\n",
            "    return new Promise((resolve, reject) => {\n",
            "      if (!ws || !connected) return reject(new Error('Not connected'));\n",
            "      const id = nextId();\n",
            "      pendingCallbacks[id] = { resolve, reject };\n",
            "      try {\n",
            "        ws.send(JSON.stringify({ type: 'req', id, method, params }));\n",
            "      } catch (err) {\n",
            "        delete pendingCallbacks[id];\n",
            "        reject(new Error('Send failed: ' + err.message));\n",
            "      }\n",
            "      setTimeout(() => {\n",
            "        if (pendingCallbacks[id]) {\n",
            "          delete pendingCallbacks[id];\n",
            "          reject(new Error('Timeout'));\n",
            "        }\n",
            "      }, 30000);\n",
            "    });\n",
            "  }\n"
        ]
        lines[rpc_start:rpc_end] = new_rpc
        print(f"Fixed rpc at {rpc_start}:{rpc_end}")

    # 2. Fix onmessage cb
    for i in range(len(lines)):
        if "cb(msg);" in lines[i] and "pendingCallbacks[msg.id]" in lines[i-1]:
            lines[i] = lines[i].replace("cb(msg);", "cb.resolve(msg);")
            print(f"Fixed onmessage cb at {i}")
            break

    # 3. Fix onclose
    onclose_start = -1
    for i, line in enumerate(lines):
        if "ws.onclose =" in line:
            onclose_start = i
            break
    if onclose_start != -1:
        onclose_end = -1
        for i in range(onclose_start + 1, len(lines)):
            if lines[i].strip() and not lines[i].startswith(' '):
                onclose_end = i
                break
        if onclose_end == -1:
            onclose_end = len(lines)
        
        new_onclose = [
            "    ws.onclose = (evt) => {\n",
            "      connected = false;\n",
            "      ws = null;\n",
            "      for (const id in pendingCallbacks) {\n",
            "        if (pendingCallbacks[id].reject) pendingCallbacks[id].reject(new Error('WebSocket closed'));\n",
            "        delete pendingCallbacks[id];\n",
            "      }\n",
            "      chatWindows.forEach(w => w.setStatus(`Disconnected (${evt.code})`, 'disconnected'));\n",
            "      if (chatWindows.some(w => w.root.classList.contains('open') || w.currentRunId || w.streamingMsg)) setTimeout(connectGateway, 3000);\n",
            "    };\n"
        ]
        lines[onclose_start:onclose_end] = new_onclose
        print(f"Fixed onclose at {onclose_start}:{onclose_end}")

    # 4. Fix getSessionsListCached
    get_sessions_start = -1
    for i, line in enumerate(lines):
        if "function getSessionsListCached(maxAgeMs = 2500) {" in line:
            get_sessions_start = i
            break
    if get_sessions_start != -1:
        get_sessions_end = -1
        for i in range(get_sessions_start + 1, len(lines)):
            if lines[i].strip() and not lines[i].startswith(' '):
                get_sessions_end = i
                break
        if get_sessions_end == -1:
            get_sessions_end = len(lines)
        
        if_idx = -1
        for i in range(get_sessions_start, get_sessions_end):
            if "if (_sessionsListCache.promise" in lines[i]:
                if_idx = i
                break
        if if_idx != -1:
            new_get_sessions = [
                "    if (_sessionsListCache.promise && now - _sessionsListCache.at < maxAgeMs) return _sessionsListCache.promise;\n",
                "    _sessionsListCache.at = now;\n",
                "    _sessionsListCache.promise = rpc('sessions.list', { limit: 100 }).then((res) => {\n",
                "      if (res && res.ok === false) {\n",
                "        _sessionsListCache.promise = null;\n",
                "        throw new Error(res.error?.message || 'sessions.list failed');\n",
                "      }\n",
                "      _sessionsListCache.payload = res;\n",
                "      return res;\n",
                "    }).catch((err) => {\n",
                "      _sessionsListCache.promise = null;\n",
                "      throw err;\n",
                "    });\n"
            ]
            lines[if_idx:get_sessions_end] = new_get_sessions
            print(f"Fixed getSessionsListCached at {if_idx}:{get_sessions_end}")

    with open("app/chat.js", "w") as f:
        f.writelines(lines)

if __name__ == "__main__":
    main()
