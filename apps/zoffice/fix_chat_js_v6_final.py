import re

def main():
    with open("app/chat.js", "r") as f:
        content = f.read()

    # 1. Fix rpc
    def rpc_callback(match):
        start = match.start()
        brace_count = 0
        end = -1
        for i in range(start, len(content)):
            if content[i] == '{': brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    end = i + 1
                    break
        if end == -1: return match.group(0)
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

    content = re.sub(r'function rpc\(method, params\) \{', rpc_callback, content, count=1)

    # 2. Fix onmessage cb
    content = content.replace("cb(msg);", "cb.resolve(msg);")

    # 3. Fix onclose
    def onclose_callback(match):
        start = match.start()
        brace_count = 0
        end = -1
        for i in range(start, len(content)):
            if content[i] == '{': brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    end = i + 1
                    break
        if end == -1: return match.group(0)
        return """    ws.onclose = (evt) => {
      connected = false;
      ws = null;
      for (const id in pendingCallbacks) {
        if (pendingCallbacks[id].reject) pendingCallbacks[id].reject(new Error('WebSocket closed'));
        delete pendingCallbacks[id];
      }
      chatWindows.forEach(w => w.setStatus(`Disconnected (${evt.code})`, 'disconnected'));
      if (chatWindows.some(w => w.root.classList.contains('open') || w.currentRunId || w.streamingMsg)) setTimeout(connectGateway, 3000);
    };"""

    content = re.sub(r'ws\.onclose = \(evt\) => \{', onclose_callback, content, count=1)

    # 4. Fix getSessionsListCached
    def get_sessions_callback(match):
        start = match.start()
        brace_count = 0
        end = -1
        for i in range(start, len(content)):
            if content[i] == '{': brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    end = i + 1
                    break
        if end == -1: return match.group(0)
        
        # Find the if statement
        if_idx = -1
        for i in range(start, end):
            if "if (_sessionsListCache.promise" in content[i:i+50]:
                if_idx = i
                break
        
        if if_idx == -1: return match.group(0)
        
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
        return content[:if_idx] + new_get_sessions + content[end:]

    # Wait, re.sub won't work well here because I'm returning a large chunk of the file.
    # I'll use the index-based replacement.
    
    # Let's find the function again.
    get_sessions_match = re.search(r'function getSessionsListCached\(maxAgeMs = 2500\) \{', content)
    if get_sessions_match:
        start = get_sessions_match.start()
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
