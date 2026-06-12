import re

def main():
    with open("app/chat.js", "r") as f:
        content = f.read()

    # 1. Fix rpc to store {resolve, reject} and wrap ws.send in try-catch
    # Search for:
    #   function rpc(method, params) {
    #     return new Promise((resolve, reject) => {
    #       if (!ws || !connected) return reject(new Error('Not connected'));
    #       const id = nextId();
    #       pendingCallbacks[id] = resolve;
    #       ws.send(JSON.stringify({ type: 'req', id, method, params }));
    #       setTimeout(() => {
    #         if (pendingCallbacks[id]) { delete pendingCallbacks[id]; reject(new Error('Timeout')); }
    #       }, 30000);
    #     });
    #   }

    rpc_pattern = re.compile(
        r'function rpc\(method, params\) \{(.*?)\s+return new Promise\(\(resolve, reject\) => \{.*?pendingCallbacks\[id\] = resolve;.*?ws\.send\(JSON\.stringify\(\{ type: \'req\', id, method, params \}\)\);.*?setTimeout\(\(\) => \{.*?pendingCallbacks\[id\]\] \? .*? reject\(new Error\(\'Timeout\'\)\) : null;.*?\}, 30000\);.*?\}\);',
        re.DOTALL
    )
    # Actually, the regex above is too hard to get right.
    # Let's use a more simple approach: find the function and replace its body.

    # I'll use a search for the start and end of the rpc function.
    rpc_start_idx = content.find("function rpc(method, params) {")
    if rpc_start_idx != -1:
        # Find the end of the function. It ends with '}' followed by '\n\n' or similar.
        # But it's easier to find the matching brace.
        
        # Let's find the end by counting braces.
        brace_count = 0
        end_idx = -1
        for idx in range(rpc_start_idx, len(content)):
            if content[idx] == '{':
                brace_count += 1
            elif content[idx] == '}':
                brace_count -= 1
                if brace_count == 0:
                    end_idx = idx + 1
                    break
        
        if end_idx != -1:
            # Replacement for rpc
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
            content = content[:rpc_start_idx] + new_rpc + content[end_idx:]

    # 2. Fix onmessage to call cb.resolve(msg)
    onmessage_pattern = re.compile(r'const cb = pendingCallbacks\[msg\.id\];\s+if \(cb\) \{ delete pendingCallbacks\[msg\.id\]; cb\(msg\); \}')
    content = onmessage_pattern.sub(r'const cb = pendingCallbacks[msg.id]; if (cb) { delete pendingCallbacks[msg.id]; cb.resolve(msg); }', content)

    # 3. Fix ws.onclose to reject all pending RPCs
    onclose_pattern = re.compile(r'ws\.onclose = \(evt\) => \{.*?\}\s*;', re.DOTALL)
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
    content = onclose_pattern.sub(new_onclose, content)

    # 4. Fix getSessionsListCached
    get_sessions_pattern = re.compile(r'\_sessionsListCache\.promise = rpc\(\'sessions\.list\', \{ limit: 100 \}\)\.then\(\(res\) => \{\s+\_sessionsListCache\.payload = res;\s+return res;\s+\}\)\.catch\(\(err\) => \{\s+\_sessionsListCache\.promise = null;\s+throw err;\s+\}\);', re.DOTALL)
    new_get_sessions = """    _sessionsListCache.promise = rpc('sessions.list', { limit: 100 }).then((res) => {
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
    content = get_sessions_pattern.sub(new_get_sessions, content)

    with open("app/chat.js", "w") as f:
        f.write(content)

if __name__ == "__main__":
    main()
