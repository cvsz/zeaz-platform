import re

def main():
    with open("app/chat.js", "r") as f:
        lines = f.readlines()

    # 1. Fix rpc (1590-1608)
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
    # Replace lines 1590 to 1608 (1-indexed, so 1589:1608)
    lines[1589:1608] = new_rpc
    print("Fixed rpc")

    # 2. Fix onmessage (1543)
    # Wait, the line is 1543.
    for i in range(len(lines)):
        if "cb(msg);" in lines[i] and "pendingCallbacks[msg.id]" in lines[i-1]:
            lines[i] = lines[i].replace("cb(msg);", "cb.resolve(msg);")
            print(f"Fixed onmessage cb at {i}")
            break

    # 3. Fix onclose (1548-1557)
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
    # Find onclose again because indices might have shifted
    onclose_start = -1
    for i, line in enumerate(lines):
        if "ws.onclose =" in line:
            onclose_start = i
            break
    if onclose_start != -1:
        # Find end by brace counting
        bc = 0
        onclose_end = -1
        for i in range(onclose_start, len(lines)):
            bc += lines[i].count('{')
            bc -= lines[i].count('}')
            if bc == 0:
                onclose_end = i + 1
                break
        if onclose_end != -1:
            lines[onclose_start:onclose_end] = new_onclose
            print(f"Fixed onclose at {onclose_start}")

    # 4. Fix getSessionsListCached (1610-1627)
    # Find it again
    get_sessions_start = -1
    for i, line in enumerate(lines):
        if "function getSessionsListCached(maxAgeMs = 2500) {" in line:
            get_sessions_start = i
            break
    if get_sessions_start != -1:
        bc = 0
        get_sessions_end = -1
        for i in range(get_sessions_start, len(lines)):
            bc += lines[i].count('{')
            bc -= lines[i].count('}')
            if bc == 0:
                get_sessions_end = i + 1
                break
        if get_sessions_end != -1:
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
                print(f"Fixed getSessionsListCached at {if_idx}")

    with open("app/chat.js", "w") as f:
        f.writelines(lines)

if __name__ == "__main__":
    main()
