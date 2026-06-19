import re

def main():
    with open("app/chat.js", "r") as f:
        lines = f.readlines()

    # 1. getSessionsListCached (1610-1627)
    # The lines are 1610 to 1627. In 0-indexed, it's 1609 to 1626.
    new_get_sessions = [
        "  function getSessionsListCached(maxAgeMs = 2500) {\n",
        "    const now = Date.now();\n",
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
        "    });\n",
        "    return _sessionsListCache.promise;\n",
        "  }\n"
    ]
    lines[1609:1627] = new_get_sessions
    print("Fixed getSessionsListCached")

    # 2. rpc (1588-1606)
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
    lines[1587:1606] = new_rpc
    print("Fixed rpc")

    # 3. onclose (1548-1557)
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
    lines[1547:1557] = new_onclose
    print("Fixed onclose")

    # 4. onmessage (1541-1545)
    new_onmessage_part = [
        "      if (msg.type === 'res') {\n",
        "        const cb = pendingCallbacks[msg.id];\n",
        "        if (cb) { delete pendingCallbacks[msg.id]; cb.resolve(msg); }\n",
        "        return;\n",
        "      }\n"
    ]
    lines[1540:1545] = new_onmessage_part
    print("Fixed onmessage cb")

    with open("app/chat.js", "w") as f:
        f.writelines(lines)

if __name__ == "__main__":
    main()
