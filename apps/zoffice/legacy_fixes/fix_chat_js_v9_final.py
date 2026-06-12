import re

def main():
    with open("app/chat.js", "r") as f:
        lines = f.readlines()

    # 1. getSessionsListCached (1598-1615)
    get_sessions_new = [
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
    lines[1597:1615] = get_sessions_new
    print("Fixed getSessionsListCached")

    # 2. rpc (1586-1604)
    rpc_new = [
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
    lines[1585:1604] = rpc_new
    print("Fixed rpc")

    # 3. onclose (1548-1555)
    onclose_new = [
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
    lines[1547:1555] = onclose_new
    print("Fixed onclose")

    # 4. onmessage (1543)
    for i in range(len(lines)):
        if "cb(msg);" in lines[i] and "pendingCallbacks[msg.id]" in lines[i-1]:
            lines[i] = lines[i].replace("cb(msg);", "cb.resolve(msg);")
            print(f"Fixed onmessage cb at {i}")
            break

    with open("app/chat.js", "w") as f:
        f.writelines(lines)

if __name__ == "__main__":
    main()
