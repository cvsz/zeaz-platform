import re

def main():
    with open("app/chat.js", "r") as f:
        content = f.read()

    # 1. Fix rpc
    rpc_start_match = re.search(r'function rpc\(method, params\) \{', content)
    if rpc_start_match:
        start_idx = rpc_start_match.start()
        brace_count = 0
        rpc_end = -1
        for idx in range(start_idx, len(content)):
            if content[idx] == '{':
                brace_count += 1
            elif content[idx] == '}':
                brace_count -= 1
                if brace_count == 0:
                    rpc_end = idx + 1
                    break
        
        if rpc_end != -1:
            new_rpc = """  function rpc(method, params) {
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
            content = content[:start_idx] + new_rpc + content[rpc_end:]
            print(f"Fixed rpc at {start_idx}:{rpc_end}")

    # 2. Fix onmessage
    # cb(msg) -> cb.resolve(msg)
    content = content.replace("cb(msg);", "cb.resolve(msg);")
    print("Fixed onmessage cb")

    # 3. Fix onclose
    onclose_start_match = re.search(r'ws\.onclose = \(evt\) => \{', content)
    if onclose_start_match:
        start_idx = onclose_start_match.start()
        brace_count = 0
        onclose_end = -1
        for idx in range(start_idx, len(content)):
            if content[idx] == '{':
                brace_count += 1
            elif content[idx] == '}':
                brace_count -= 1
                if brace_count == 0:
                    onclose_end = idx + 1
                    break
        
        if onclose_end != -1:
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
            content = content[:start_idx] + new_onclose + content[onclose_end:]
            print(f"Fixed onclose at {start_idx}:{onclose_end}")

    # 4. Fix getSessionsListCached
    get_sessions_start_match = re.search(r'function getSessionsListCached\(maxAgeMs = 2500\) \{', content)
    if get_sessions_start_match:
        start_idx = get_sessions_start_match.start()
        brace_count = 0
        get_sessions_end = -1
        for idx in range(start_idx, len(content)):
            if content[idx] == '{':
                brace_count += 1
            elif content[idx] == '}':
                brace_count -= 1
                if brace_count == 0:
                    get_sessions_end = idx + 1
                    break
        
        if get_sessions_end != -1:
            # Find the if statement line
            if_idx = -1
            for idx in range(start_idx, get_sessions_end):
                if "if (_sessionsListCache.promise" in content[idx:idx+50]:
                    if_idx = idx
                    break
            
            if if_idx != -1:
                # Find the end of the if block to replace the whole thing
                # Actually, we want to replace from the if statement until the end of the function
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
                # Wait, the if statement is part of the function body.
                # We should replace from the if statement to the end of the function?
                # No, just from the if statement to the end of the catch block.
                
                # Let's find the end of the catch block.
                # It's the brace that closes the catch.
                # But the function ends after that.
                # The getSessionsListCached function ends after the catch block.
                # So get_sessions_end is already the end of the function.
                
                # We want to replace from if_idx to get_sessions_end? 
                # No, if_idx is the start of the IF line.
                # But get_sessions_end is the end of the FUNCTION.
                # So we should replace from if_idx to get_sessions_end.
                # BUT we also need to include the lines before the if statement (like _sessionsListCache.at = now).
                
                # Let's find the start of the code block after the function head.
                # It's after the function head and the potential comments/empty lines.
                
                # Let's find the first non-empty line after start_idx.
                body_start_idx = -1
                for idx in range(start_idx, get_sessions_end):
                    if content[idx].strip():
                        body_start_idx = idx
                        break
                
                if body_start_idx != -1:
                    content = content[:body_start_idx] + new_get_sessions + content[get_sessions_end:]
                    print(f"Fixed getSessionsListCached at {body_start_idx}:{get_sessions_end}")

    with open("app/chat.js", "w") as f:
        f.write(content)

if __name__ == "__main__":
    main()
