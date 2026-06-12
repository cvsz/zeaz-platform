import re

def main():
    with open("app/chat.js", "r") as f:
        lines = f.readlines()

    # 1. Fix rpc (1586)
    # Replace the whole function
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
    
    # We need to find where rpc ends.
    rpc_start = 1586 - 1 # 0-indexed
    brace_count = 0
    rpc_end = -1
    for idx in range(rpc_start, len(lines)):
        if '{' in lines[idx]:
            brace_count += 1
        if '}' in lines[idx]:
            brace_count -= 1
            if brace_count == 0:
                rpc_end = idx + 1
                break
    
    if rpc_end != -1:
        lines[rpc_start:rpc_end] = new_rpc

    # 2. Fix onmessage (1537)
    # Replace cb(msg) with cb.resolve(msg)
    for idx in range(1537-1, len(lines)):
        if "cb(msg);" in lines[idx]:
            lines[idx] = lines[idx].replace("cb(msg);", "cb.resolve(msg);")
            break

    # 3. Fix onclose (1548)
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
    
    # Find onclose start
    onclose_start = -1
    for idx in range(1548-1, len(lines)):
        if "ws.onclose =" in lines[idx]:
            onclose_start = idx
            break
    
    if onclose_start != -1:
        # Find end of onclose
        brace_count = 0
        onclose_end = -1
        for idx in range(onclose_start, len(lines)):
            if '{' in lines[idx]:
                brace_count += 1
            if '}' in lines[idx]:
                brace_count -= 1
                if brace_count == 0:
                    onclose_end = idx + 1
                    break
        if onclose_end != -1:
            lines[onclose_start:onclose_end] = new_onclose

    # 4. Fix getSessionsListCached (1598)
    # Replace the .then part.
    # The line is: _sessionsListCache.promise = rpc('sessions.list', { limit: 100 }).then((res) => {
    
    for idx in range(1598-1, len(lines)):
        if "rpc('sessions.list'" in lines[idx]:
            # We want to replace from this line until the end of the .catch block
            # For simplicity, let's just replace the whole block starting from the assignment
            
            # Find the end of the block (the closing brace of the .catch)
            brace_count = 0
            get_sessions_end = -1
            for k in range(idx, len(lines)):
                if '{' in lines[k]:
                    brace_count += 1
                if '}' in lines[k]:
                    brace_count -= 1
                    if brace_count == 0:
                        get_sessions_end = k + 1
                        break
            
            if get_sessions_end != -1:
                new_get_sessions = [
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
                # Wait, I should be careful with the preceding lines.
                # The line before is: const now = Date.now();
                # And the line before that is: if (_sessionsListCache.promise && now - _sessionsListCache.at < maxAgeMs) return _sessionsListCache.promise;
                # So I should replace from the if statement.
                
                # Let's find the if statement line.
                if_idx = idx
                while if_idx > 0 and "if (_sessionsListCache.promise" not in lines[if_idx-1]:
                    if_idx -= 1
                
                lines[if_idx:get_sessions_end] = new_get_sessions

    with open("app/chat.js", "w") as f:
        f.writelines(lines)

if __name__ == "__main__":
    main()
