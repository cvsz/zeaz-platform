import re

def main():
    with open("app/chat.js", "r") as f:
        content = f.read()

    # 1. Fix rpc
    def rpc_repl(match):
        return """  function rpc(method, params) {
    return new Promise((resolve, reject) => {
      if (!ws || !connected) return reject(new Error('Not connected'));
      const id = nextId();
      pendingCallbacks[id] = { resolve, reject };
      try {
        ws.send(JSON.stringify({ type: 'req', id, method, params }));
      } catch (err) {
        delete pendingCallbacks[id];
        reject(new Error('Send failed: ' + err.message));
      }
      setTimeout(() => {
        if (pendingCallbacks[id]) {
          delete pendingCallbacks[id];
          reject(new Error('Timeout'));
        }
      }, 30000);
    });
  }"""

    # We need to match the whole function.
    # Let's find the start and end.
    rpc_start_match = re.search(r'function rpc\(method, params\) \{', content)
    if rpc_start_match:
        start = rpc_start_match.start()
        brace_count = 0
        end = -1
        for i in range(start, len(content)):
            if content[i] == '{': brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    end = i + 1
                    break
        if end != -1:
            content = content[:start] + rpc_repl(None) + content[end:]
            print(f"Replaced rpc at {start}:{end}")

    # 2. Fix onmessage
    # Replace cb(msg); with cb.resolve(msg);
    content = content.replace("cb(msg);", "cb.resolve(msg);")
    print("Fixed onmessage cb")

    # 3. Fix onclose
    onclose_start_match = re.search(r'ws\.onclose = \(evt\) => \{', content)
    if onclose_start_match:
        start = onclose_start_match.start()
        brace_count = 0
        end = -1
        for i in range(start, len(content)):
            if content[i] == '{': brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    end = i + 1
                    break
        if end != -1:
            new_onclose = """    ws.onclose = (evt) => {
      connected = false;
      ws = null;
      for (const id in pendingCallbacks) {
        if (pendingCallbacks[id].reject) pendingCallbacks[id].reject(new Error('WebSocket closed'));
        delete pendingCallbacks[id];
      }
      chatWindows.forEach(w => w.setStatus(`Disconnected (${evt.code})`, 'disconnected'));
      if (chatWindows.some(w => w.root.classList.contains('open') || w.currentRunId || w.streamingMsg)) setTimeout(connectGateway, 3000);
    };"""
            content = content[:start] + new_onclose + content[end:]
            print(f"Fixed onclose at {start}:{end}")

    # 4. Fix getSessionsListCached
    get_sessions_start_match = re.search(r'function getSessionsListCached\(maxAgeMs = 2500\) \{', content)
    if get_sessions_start_match:
        start = get_sessions_start_match.start()
        brace_count = 0
        end = -1
        for i in range(start, len(content)):
            if content[i] == '{': brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    end = i + 1
                    break
        if end != -1:
            # Find the if statement
            if_idx = -1
            for i in range(start, end):
                if "if (_sessionsListCache.promise" in content[i:i+50]:
                    if_idx = i
                    break
            if if_idx != -1:
                new_get_sessions = """    if (_sessionsListCache.promise && now - _sessionsListCache.at < maxAgeMs) return _sessionsListCache.promise;
    _sessionsListCache.at = now;
    _sessionsListCache.promise = rpc('sessions.list', { limit: 100 }).then((res) => {
      if (res && res.ok === false) {
        _sessionsListCache.promise = null;
        throw new Error(res.error?.message || 'sessions.list failed');
      }
      _sessionsListCache.payload = res;
      return res;
    }).catch((err) => {
      _sessionsListCache.promise = null;
      throw err;
    });"""
                content = content[:if_idx] + new_get_sessions + content[end:]
                print(f"Fixed getSessionsListCached at {if_idx}:{end}")

    with open("app/chat.js", "w") as f:
        f.write(content)

if __name__ == "__main__":
    main()
