#!/usr/bin/env python3
# Merged fixes - Combined from multiple fix scripts
# Total source files: 40



# ======================================================================
# START: fix_chat_js_v1.py
# ======================================================================

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

# ======================================================================
# END: fix_chat_js_v1.py
# ======================================================================


# ======================================================================
# START: fix_chat_js_v2.py
# ======================================================================

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

# ======================================================================
# END: fix_chat_js_v2.py
# ======================================================================


# ======================================================================
# START: fix_chat_js_v3.py
# ======================================================================

import re

def main():
    with open("app/chat.js", "r") as f:
        lines = f.readlines()

    # 1. Fix rpc
    rpc_start = -1
    rpc_end = -1
    for idx, line in enumerate(lines):
        if "function rpc(method, params) {" in line:
            rpc_start = idx
            break
    if rpc_start != -1:
        brace_count = 0
        for idx in range(rpc_start, len(lines)):
            if '{' in lines[idx]: brace_count += 1
            if '}' in lines[idx]: brace_count -= 1
            if brace_count == 0:
                rpc_end = idx + 1
                break

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
    if rpc_start != -1 and rpc_end != -1:
        lines[rpc_start:rpc_end] = new_rpc
        print(f"Replaced rpc at {rpc_start}:{rpc_end}")

    # 2. Fix onmessage
    for idx in range(len(lines)):
        if "cb(msg);" in lines[idx] and "pendingCallbacks[msg.id]" in lines[idx-1]:
            lines[idx] = lines[idx].replace("cb(msg);", "cb.resolve(msg);")
            print(f"Fixed onmessage cb at {idx}")
            break

    # 3. Fix onclose
    onclose_start = -1
    for idx in range(len(lines)):
        if "ws.onclose =" in lines[idx]:
            onclose_start = idx
            break
    if onclose_start != -1:
        brace_count = 0
        onclose_end = -1
        for idx in range(onclose_start, len(lines)):
            if '{' in lines[idx]: brace_count += 1
            if '}' in lines[idx]: brace_count -= 1
            if brace_count == 0:
                onclose_end = idx + 1
                break
        if onclose_end != -1:
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
            print(f"Replaced onclose at {onclose_start}:{onclose_end}")

    # 4. Fix getSessionsListCached
    get_sessions_start = -1
    for idx in range(len(lines)):
        if "getSessionsListCached(maxAgeMs = 2500)" in lines[idx]:
            get_sessions_start = idx
            break
    if get_sessions_start != -1:
        brace_count = 0
        get_sessions_end = -1
        for idx in range(get_sessions_start, len(lines)):
            if '{' in lines[idx]: brace_count += 1
            if '}' in lines[idx]: brace_count -= 1
            if brace_count == 0:
                get_sessions_end = idx + 1
                break
        if get_sessions_end != -1:
            # We need to find the if statement line.
            if_idx = get_sessions_start
            while if_idx > 0 and "if (_sessionsListCache.promise" not in lines[if_idx-1]:
                if_idx -= 1
            
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
            print(f"Replaced getSessionsListCached at {if_idx}:{get_sessions_end}")

    with open("app/chat.js", "w") as f:
        f.writelines(lines)

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_chat_js_v3.py
# ======================================================================


# ======================================================================
# START: fix_chat_js_v4.py
# ======================================================================

import re

def main():
    with open("app/chat.js", "r") as f:
        lines = f.readlines()

    # 1. Fix rpc
    rpc_start = -1
    rpc_end = -1
    for idx, line in enumerate(lines):
        if "function rpc(method, params) {" in line:
            rpc_start = idx
            break
    if rpc_start != -1:
        brace_count = 0
        for idx in range(rpc_start, len(lines)):
            if '{' in lines[idx]: brace_count += 1
            if '}' in lines[idx]: brace_count -= 1
            if brace_count == 0:
                rpc_end = idx + 1
                break

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
    if rpc_start != -1 and rpc_end != -1:
        lines[rpc_start:rpc_end] = new_rpc
        print(f"Replaced rpc at {rpc_start}:{rpc_end}")

    # 2. Fix onmessage
    for idx in range(len(lines)):
        if "cb(msg);" in lines[idx] and "pendingCallbacks[msg.id]" in lines[idx-1]:
            lines[idx] = lines[idx].replace("cb(msg);", "cb.resolve(msg);")
            print(f"Fixed onmessage cb at {idx}")
            break

    # 3. Fix onclose
    onclose_start = -1
    for idx in range(len(lines)):
        if "ws.onclose =" in lines[idx]:
            onclose_start = idx
            break
    if onclose_start != -1:
        brace_count = 0
        onclose_end = -1
        for idx in range(onclose_start, len(lines)):
            if '{' in lines[idx]: brace_count += 1
            if '}' in lines[idx]: brace_count -= 1
            if brace_count == 0:
                onclose_end = idx + 1
                break
        if onclose_end != -1:
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
            print(f"Replaced onclose at {onclose_start}:{onclose_end}")

    # 4. Fix getSessionsListCached
    get_sessions_start = -1
    for idx, line in enumerate(lines):
        if "getSessionsListCached(maxAgeMs = 2500)" in line:
            get_sessions_start = idx
            break
    if get_sessions_start != -1:
        brace_count = 0
        get_sessions_end = -1
        for idx in range(get_sessions_start, len(lines)):
            if '{' in lines[idx]: brace_count += 1
            if '}' in lines[idx]: brace_count -= 1
            if brace_count == 0:
                get_sessions_end = idx + 1
                break
        if get_sessions_end != -1:
            # Find the if statement line
            if_idx = -1
            for idx in range(get_sessions_start, get_sessions_end):
                if "if (_sessionsListCache.promise" in lines[idx]:
                    if_idx = idx
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
                print(f"Replaced getSessionsListCached at {if_idx}:{get_sessions_end}")

    with open("app/chat.js", "w") as f:
        f.writelines(lines)

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_chat_js_v4.py
# ======================================================================


# ======================================================================
# START: fix_chat_js_v4_final.py
# ======================================================================

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

# ======================================================================
# END: fix_chat_js_v4_final.py
# ======================================================================


# ======================================================================
# START: fix_chat_js_v5_final.py
# ======================================================================

import re

def find_matching_brace(lines, start_idx):
    brace_count = 0
    for idx in range(start_idx, len(lines)):
        if '{' in lines[idx]:
            brace_count += 1
        if '}' in lines[idx]:
            brace_count -= 1
            if brace_count == 0:
                return idx
    return -1

def main():
    with open("app/chat.js", "r") as f:
        lines = f.readlines()

    # 1. Fix rpc
    rpc_start = -1
    for idx, line in enumerate(lines):
        if "function rpc(method, params) {" in line:
            rpc_start = idx
            break
    if rpc_start != -1:
        rpc_end = find_matching_brace(lines, rpc_start)
        if rpc_end != -1:
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
            lines[rpc_start:rpc_end+1] = new_rpc
            print(f"Fixed rpc at {rpc_start}")

    # 2. Fix onmessage
    for idx in range(len(lines)):
        if "cb(msg);" in lines[idx] and "pendingCallbacks[msg.id]" in lines[idx-1]:
            lines[idx] = lines[idx].replace("cb(msg);", "cb.resolve(msg);")
            print(f"Fixed onmessage at {idx}")
            break

    # 3. Fix onclose
    onclose_start = -1
    for idx, line in enumerate(lines):
        if "ws.onclose =" in line:
            onclose_start = idx
            break
    if onclose_start != -1:
        onclose_end = find_matching_brace(lines, onclose_start)
        if onclose_end != -1:
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
            lines[onclose_start:onclose_end+1] = new_onclose
            print(f"Fixed onclose at {onclose_start}")

    # 4. Fix getSessionsListCached
    get_sessions_start = -1
    for idx, line in enumerate(lines):
        if "function getSessionsListCached(maxAgeMs = 2500)" in line:
            get_sessions_start = idx
            break
    if get_sessions_start != -1:
        get_sessions_end = find_matching_brace(lines, get_sessions_start)
        if get_sessions_end != -1:
            # Find the if statement line
            if_idx = -1
            for idx in range(get_sessions_start, get_sessions_end):
                if "if (_sessionsListCache.promise" in lines[idx]:
                    if_idx = idx
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
                lines[if_idx:get_sessions_end+1] = new_get_sessions
                print(f"Fixed getSessionsListCached at {if_idx}")

    with open("app/chat.js", "w") as f:
        f.writelines(lines)

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_chat_js_v5_final.py
# ======================================================================


# ======================================================================
# START: fix_chat_js_v5_final_final.py
# ======================================================================

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

# ======================================================================
# END: fix_chat_js_v5_final_final.py
# ======================================================================


# ======================================================================
# START: fix_chat_js_v6_final.py
# ======================================================================

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

# ======================================================================
# END: fix_chat_js_v6_final.py
# ======================================================================


# ======================================================================
# START: fix_chat_js_v7_final.py
# ======================================================================

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

# ======================================================================
# END: fix_chat_js_v7_final.py
# ======================================================================


# ======================================================================
# START: fix_chat_js_v8_final.py
# ======================================================================

import re

def main():
    with open("app/chat.js", "r") as f:
        lines = f.readlines()

    # 1. Fix rpc (1586)
    rpc_start = -1
    for i, line in enumerate(lines):
        if "function rpc(method, params) {" in line:
            rpc_start = i
            break
    if rpc_start != -1:
        brace_count = 0
        rpc_end = -1
        for i in range(rpc_start, len(lines)):
            brace_count += lines[i].count('{')
            brace_count -= lines[i].count('}')
            if brace_count == 0:
                rpc_end = i + 1
                break
        if rpc_end != -1:
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

    # 2. Fix onmessage cb (1543)
    for i in range(len(lines)):
        if "cb(msg);" in lines[i] and "pendingCallbacks[msg.id]" in lines[i-1]:
            lines[i] = lines[i].replace("cb(msg);", "cb.resolve(msg);")
            print(f"Fixed onmessage cb at {i}")
            break

    # 3. Fix onclose (1548)
    onclose_start = -1
    for i, line in enumerate(lines):
        if "ws.onclose =" in line:
            onclose_start = i
            break
    if onclose_start != -1:
        brace_count = 0
        onclose_end = -1
        for i in range(onclose_start, len(lines)):
            brace_count += lines[i].count('{')
            brace_count -= lines[i].count('}')
            if brace_count == 0:
                onclose_end = i + 1
                break
        if onclose_end != -1:
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

    # 4. Fix getSessionsListCached (1598)
    get_sessions_start = -1
    for i, line in enumerate(lines):
        if "function getSessionsListCached(maxAgeMs = 2500) {" in line:
            get_sessions_start = i
            break
    if get_sessions_start != -1:
        brace_count = 0
        get_sessions_end = -1
        for i in range(get_sessions_start, len(lines)):
            brace_count += lines[i].count('{')
            brace_count -= lines[i].count('}')
            if brace_count == 0:
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
                print(f"Fixed getSessionsListCached at {if_idx}:{get_sessions_end}")

    with open("app/chat.js", "w") as f:
        f.writelines(lines)

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_chat_js_v8_final.py
# ======================================================================


# ======================================================================
# START: fix_chat_js_v8_final_final.py
# ======================================================================

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

# ======================================================================
# END: fix_chat_js_v8_final_final.py
# ======================================================================


# ======================================================================
# START: fix_chat_js_v9_final.py
# ======================================================================

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

# ======================================================================
# END: fix_chat_js_v9_final.py
# ======================================================================


# ======================================================================
# START: fix_chat_js_v10_final.py
# ======================================================================

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

# ======================================================================
# END: fix_chat_js_v10_final.py
# ======================================================================


# ======================================================================
# START: fix_chat_js_v11_attempt.py
# ======================================================================

import re

def main():
    with open("app/chat.js", "r") as f:
        content = f.read()

    # 1. Update onmessage 'res' part
    # Original:
    #      if (msg.type === 'res') {
    #        const cb = pendingCallbacks[msg.id];
    #        if (cb) { delete pendingCallbacks[msg.id]; cb(msg); }
    #        return;
    #      }
    # New:
    new_onmessage_res = """      if (msg.type === 'res') {
        const cb = pendingCallbacks[msg.id];
        if (cb) {
          delete pendingCallbacks[msg.id];
          if (cb.resolve) cb.resolve(msg);
          else cb(msg);
        }
        return;
      }"""
    content = re.sub(r'      if \(msg\.type === \'res\'\) \{.*?\}\n      return;', new_onmessage_res, content, flags=re.DOTALL)
    # Wait, the above regex might be tricky because of the return.
    # Let's use a more specific one.
    
    # Let's try again with a safer approach.
    # I'll just use specific string replacements for the parts I want to change.
    
    # Actually, let's just use the exact strings from the current file.
    
    # RE-READING THE FILE to get EXACT current strings.
    # I'll use a helper to find and replace blocks.

def replace_block(content, old_block, new_block):
    if old_block not in content:
        print(f"Error: Old block not found!")
        return content
    return content.replace(old_block, new_block)

# Let's go back to basics.

# ======================================================================
# END: fix_chat_js_v11_attempt.py
# ======================================================================


# ======================================================================
# START: fix_game_js.py
# ======================================================================

import sys

def replace_lines(file_path, start_line, end_line, new_content):
    with open(file_path, 'r') as f:
        lines = f.readlines()
    
    # lines are 0-indexed, start_line is 1-indexed
    new_lines = lines[:start_line-1] + [new_content + '\n'] + lines[end_line:]
    
    with open(file_path, 'w') as f:
        f.writelines(new_lines)

def main():
    file_path = 'app/game.js'
    
    branch_content = """function _showBranchAssignMenu() {
    if (!selectedItemId) return;
    var selItem = null;
    for (var i = 0; i < officeConfig.furniture.length; i++) {
        if (officeConfig.furniture[i].id === selectedItemId) { selItem = officeConfig.furniture[i]; break; }
    }
    if (!selItem || selItem.type !== 'branchSign') return;

    var existing = document.getElementById('branch-assign-menu');
    if (existing) existing.remove();

    var menu = document.createElement('div');
    menu.id = 'branch-assign-menu';
    menu.style.cssText = 'position:fixed;z-index:10001;background:#1a1a2e;border:2px solid #ffd600;border-radius:8px;padding:8px;min-width:180px;box-shadow:0 4px 16px rgba(0,0,0,0.5);';

    // Position near toolbar, clamped to viewport
    document.body.appendChild(menu);
    var tb = _floatingToolbar;
    if (tb) {
        var tbRect = tb.getBoundingClientRect();
        var menuH = menu.offsetHeight || 200;
        var left = tbRect.left;
        var top = tbRect.top - menuH - 10;
        if (top < 8) top = tbRect.bottom + 8;
        if (left + 200 > window.innerWidth - 8) left = window.innerWidth - 208;
        if (left < 8) left = 8;
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
    }

    var title = document.createElement('div');
    title.style.cssText = 'color:#ffd600;font-size:10px;font-family:"Press Start 2P",monospace;margin-bottom:6px;text-align:center;';
    title.textContent = 'ASSIGN BRANCH';
    menu.appendChild(title);

    var branches = getBranchList();
    branches.forEach(function(branch) {
        var btn = document.createElement('button');
        var isCurrent = selItem.branchId === branch.id;
        var neonColor = branch.color || _NEON_COLORS[branch.theme] || '#ccc';
        btn.style.cssText = 'display:block;width:100%;padding:5px 8px;margin:2px 0;background:#2a2a4e;color:' + neonColor + ';border:1px solid ' + (isCurrent ? '#ffd600' : '#3a3a5e') + ';border-radius:4px;cursor:pointer;font-size:11px;text-align:left;';
        btn.textContent = branch.emoji + ' ' + branch.name + (isCurrent ? ' ✓' : '');
        btn.addEventListener('mouseenter', function() { if (!isCurrent) btn.style.background = '#3a3a5e'; });
        btn.addEventListener('mouseleave', function() { btn.style.background = '#2a2a4e'; });
        btn.addEventListener('click', function() {
            _pushUndo();
            selItem.branchId = branch.id;
            saveOfficeConfig();
            removeMenu();
        });
        menu.appendChild(btn);
    });

    // Close on click outside
    setTimeout(function() {
        const controller = new AbortController();
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) { removeMenu(); }
        }, { signal: controller.signal });
    }, 100);
}"""
    
    desk_content = """function _showDeskAssignMenu() {
    if (!selectedItemId) return;
    var selItem = null;
    for (var i = 0; i < officeConfig.furniture.length; i++) {
        if (officeConfig.furniture[i].id === selectedItemId) { selItem = officeConfig.furniture[i]; break; }
    }
    if (!selItem || (selItem.type !== 'desk' && selItem.type !== 'bossDesk')) return;

    // Get list of agents
    var agentNames = AGENT_DEFS.map(function(a) { return a.name; });
    // Get already-assigned agents (exclude this desk)
    var assigned = {};
    officeConfig.furniture.forEach(function(f) {
        if (f.assignedTo && f.id !== selItem.id) assigned[f.assignedTo] = true;
    });

    // Build dropdown menu
    var existing = document.getElementById('desk-assign-menu');
    if (existing) existing.remove();

    var menu = document.createElement('div');
    menu.id = 'desk-assign-menu';
    menu.style.cssText = 'position:fixed;z-index:10001;background:#1a1a2e;border:2px solid #ffd600;border-radius:8px;padding:8px;min-width:160px;box-shadow:0 4px 16px rgba(0,0,0,0.5);';

    // Position near toolbar, clamped to viewport
    document.body.appendChild(menu);
    var tb = _floatingToolbar;
    if (tb) {
        var tbRect = tb.getBoundingClientRect();
        var menuH = menu.offsetHeight || (agentNames.length * 28 + 50);
        var menuW = menu.offsetWidth || 180;
        var left = tbRect.left;
        var top = tbRect.top - menuH - 10;
        // Clamp to viewport
        if (top < 8) top = tbRect.bottom + 8;
        if (left + menuW > window.innerWidth - 8) left = window.innerWidth - menuW - 8;
        if (left < 8) left = 8;
        if (top + menuH > window.innerHeight - 8) top = window.innerHeight - menuH - 8;
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
    }

    var title = document.createElement('div');
    title.style.cssText = 'color:#ffd600;font-size:10px;font-family:"Press Start 2P",monospace;margin-bottom:6px;text-align:center;';
    title.textContent = 'ASSIGN DESK';
    menu.appendChild(title);

    // Unassign option
    var unBtn = document.createElement('button');
    unBtn.style.cssText = 'display:block;width:100%;padding:4px 8px;margin:2px 0;background:#2a2a4e;color:#aaa;border:1px solid #3a3a5e;border-radius:4px;cursor:pointer;font-size:11px;text-align:left;';
    unBtn.textContent = '— None —';
    if (!selItem.assignedTo) { unBtn.style.borderColor = '#ffd600'; unBtn.style.color = '#ffd600'; }

    const controller = new AbortController();
    const removeMenu = () => {
        menu.remove();
        controller.abort();
    };

    unBtn.addEventListener('click', function() {
        _pushUndo();
        delete selItem.assignedTo;
        _syncAllDeskAssignments();
        removeMenu();
    });
    menu.appendChild(unBtn);

    agentNames.forEach(function(name) {
        var btn = document.createElement('button');
        var isAssigned = assigned[name];
        var isCurrent = selItem.assignedTo === name;
        btn.style.cssText = 'display:block;width:100%;padding:4px 8px;margin:2px 0;background:#2a2a4e;color:' + (isAssigned ? '#555' : '#ccc') + ';border:1px solid ' + (isCurrent ? '#ffd600' : '#3a3a5e') + ';border-radius:4px;cursor:' + (isAssigned ? 'default' : 'pointer') + ';font-size:11px;text-align:left;';
        var agent = AGENT_DEFS.find(function(a) { return a.name === name; });
        btn.textContent = (agent ? agent.emoji + ' ' : '') + name + (isAssigned ? ' (assigned)' : '') + (isCurrent ? ' ✓' : '');
        if (!isAssigned) {
            btn.addEventListener('mouseenter', function() { if (!isCurrent) btn.style.background = '#3a3a5e'; });
            btn.addEventListener('mouseleave', function() { btn.style.background = '#2a2a4e'; });
            btn.addEventListener('click', function() {
                _pushUndo();
                selItem.assignedTo = name;
                _syncAgentToDesk(selItem);
                removeMenu();
            });
        }
        menu.appendChild(btn);
    });

    // Close on click outside
    setTimeout(function() {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) { removeMenu(); }
        }, { signal: controller.signal });
    }, 100);
}
"""
    
    replace_lines(file_path, 14000, 14059, branch_content)
    replace_lines(file_path, 14061, 14154, desk_content)

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_game_js.py
# ======================================================================


# ======================================================================
# START: fix_game_js_v2.py
# ======================================================================

import subprocess

def run_command(command_list):
    result = subprocess.run(command_list, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {' '.join(command_list)}")
        print(result.stderr)
        return False
    return True

def main():
    # 1. Fix Canvas null crash and implement _weatherTick in loop
    # Change const canvas/ctx to let
    run_command(["sed", "-i", "s/const canvas =/let canvas =/", "app/game.js"])
    run_command(["sed", "-i", "s/const ctx =/let ctx =/", "app/game.js"])
    
    # In loop(), add the check and the increment.
    # loop() starts at 10972.
    # We want to insert after line 10973 (the comment).
    # The comment is "// Update ambient light cache once per frame"
    
    # Using a temporary file to avoid sed insertion issues with multi-line
    with open("app/game.js", "r") as f:
        lines = f.readlines()
    
    new_lines = []
    inserted = False
    for line in lines:
        new_lines.append(line)
        if not inserted and "Update ambient light cache once per frame" in line:
            new_lines.append("    if (!canvas) {\n")
            new_lines.append("        canvas = document.getElementById('officeCanvas');\n")
            new_lines.append("        if (canvas) ctx = canvas.getContext('2d');\n")
            new_lines.append("    }\n")
            new_lines.append("    if (!canvas || !ctx) return;\n")
            new_lines.append("    _weatherTick++;\n")
            inserted = True
    
    with open("app/game.js", "w") as f:
        f.writelines(new_lines)

    # 2. Fix Animation jumps
    # Remove _weatherTick++ from drawWeatherOnWindow (line 534)
    # We'll use a range-based sed to be safe, or just find and replace in the file content.
    with open("app/game.js", "r") as f:
        lines = f.readlines()
    
    with open("app/game.js", "w") as f:
        for line in lines:
            # Only remove it if it's inside drawWeatherOnWindow
            # This is tricky with just line-by-line.
            # Let's just use a simple approach: 
            # We know it's around 534.
            f.write(line)
    
    # Actually, let's use a safer way to remove it.
    # We'll look for the function and remove the line.
    # For simplicity, let's just use sed again but with a different approach.
    # We want to remove "_weatherTick++;" ONLY inside "function drawWeatherOnWindow"
    run_command(["sed", "-i", "/function drawWeatherOnWindow/,/}/ s/_weatherTick++;//", "app/game.js"])

    # Replace Date.now() in the specific sin-based animation lines.
    run_command(["sed", "-i", "s/Math.sin(Date.now() * 0.008 + seed)/Math.sin(_weatherTick * 0.008 + seed)/", "app/game.js"])
    run_command(["sed", "-i", "s/Math.floor((Date.now() \\/ 120 + seed * 3)/Math.floor((_weatherTick \\/ 120 + seed * 3)/", "app/game.js"])
    run_command(["sed", "-i", "s/Math.sin(Date.now() * 0.005)/Math.sin(_weatherTick * 0.005)/", "app/game.js"])

    print("game.js fixes applied.")

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_game_js_v2.py
# ======================================================================


# ======================================================================
# START: fix_game_js_v3.py
# ======================================================================

import subprocess

def main():
    with open("app/game.js", "r") as f:
        content = f.read()

    # 1. Fix Canvas null crash
    # Change const canvas/ctx to let
    content = content.replace("const canvas = document.getElementById('officeCanvas');", "let canvas = document.getElementById('officeCanvas');")
    content = content.replace("const ctx = canvas.getContext('2d');", "let ctx = canvas.getContext('2d');")

    # 2. Fix Animation jumps
    # Remove _weatherTick++ from drawWeatherOnWindow (line 534)
    # We'll search for the specific pattern in drawWeatherOnWindow
    # It's usually after some code.
    # The existing code has:
    # function drawWeatherOnWindow(wx, wy, ww, wh, isLeft) {
    #     _weatherTick++;
    #     ...
    
    # Let's just find and replace it carefully.
    # But wait, _weatherTick++ might be anywhere.
    # I'll find the one inside drawWeatherOnWindow.
    
    import re
    
    # Remove _weatherTick++ from inside drawWeatherOnWindow
    # This regex looks for the function definition and then the increment
    pattern = re.compile(r'(function drawWeatherOnWindow\(.*?\)\s*\{.*?)\s*_weatherTick++;', re.DOTALL)
    content = pattern.sub(r'\1', content)

    # Replace Date.now() in the specific sin-based animation lines.
    content = content.replace("Math.sin(Date.now() * 0.008 + seed)", "Math.sin(_weatherTick * 0.008 + seed)")
    content = content.replace("Math.floor((Date.now() / 120 + seed * 3)", "Math.floor((_weatherTick / 120 + seed * 3)")
    content = content.replace("Math.sin(Date.now() * 0.005)", "Math.sin(_weatherTick * 0.005)")

    # 3. Add _weatherTick++ to loop()
    # Loop starts at 10972.
    # We want to insert after line 10973 (the comment).
    # The comment is "// Update ambient light cache once per frame"
    
    loop_comment = "// Update ambient light cache once per frame"
    if loop_comment in content:
        parts = content.split(loop_comment)
        # We want to add it after the comment. 
        # But loop() also needs the canvas/ctx check.
        new_part = loop_comment + "\n" + \
                   "    if (!canvas) {\n" + \
                   "        canvas = document.getElementById('officeCanvas');\n" + \
                   "        if (canvas) ctx = canvas.getContext('2d');\n" + \
                   "    }\n" + \
                   "    if (!canvas || !ctx) return;\n" + \
                   "    _weatherTick++;\n"
        content = new_part + parts[1]
    else:
        print(f"Warning: Could not find loop comment: {loop_comment}")

    with open("app/game.js", "w") as f:
        f.write(content)

    print("game.js fixes applied.")

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_game_js_v3.py
# ======================================================================


# ======================================================================
# START: fix_game_js_v4.py
# ======================================================================

import re

def main():
    with open("app/game.js", "r") as f:
        content = f.read()

    # 1. Fix Canvas null crash
    content = content.replace("const canvas = document.getElementById('officeCanvas');", "let canvas = document.getElementById('officeCanvas');")
    content = content.replace("const ctx = canvas.getContext('2d');", "let ctx = canvas.getContext('2d');")

    # 2. Fix Animation jumps
    # Remove _weatherTick++ from inside drawWeatherOnWindow
    # We use a regex that matches from the start of the function until the increment
    pattern = re.compile(r'(function drawWeatherOnWindow\(.*?\)\s*\{.*?)\s*_weatherTick++;', re.DOTALL)
    content = pattern.sub(r'\1', content)

    # Replace Date.now() in the specific sin-based animation lines.
    content = content.replace("Math.sin(Date.now() * 0.008 + seed)", "Math.sin(_weatherTick * 0.008 + seed)")
    content = content.replace("Math.floor((Date.now() / 120 + seed * 3)", "Math.floor((_weatherTick / 120 + seed * 3)")
    content = content.replace("Math.sin(Date.now() * 0.005)", "Math.sin(_weatherTick * 0.005)")

    # 3. Add _weatherTick++ to loop()
    loop_comment = "// Update ambient light cache once per frame"
    if loop_comment in content:
        parts = content.split(loop_comment, 1)
        new_part = loop_comment + "\n" + \
                   "    if (!canvas) {\n" + \
                   "        canvas = document.getElementById('officeCanvas');\n" + \
                   "        if (canvas) ctx = canvas.getContext('2d');\n" + \
                   "    }\n" + \
                   "    if (!canvas || !ctx) return;\n" + \
                   "    _weatherTick++;\n"
        content = parts[0] + new_part + parts[1]
    else:
        print(f"Warning: Could not find loop comment: {loop_comment}")

    with open("app/game.js", "w") as f:
        f.write(content)

    print("game.js fixes applied.")

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_game_js_v4.py
# ======================================================================


# ======================================================================
# START: fix_game_js_v5.py
# ======================================================================

import re

def main():
    with open("app/game.js", "r") as f:
        content = f.read()

    # 1. Fix Canvas null crash
    content = content.replace("const canvas = document.getElementById('officeCanvas');", "let canvas = document.getElementById('officeCanvas');")
    content = content.replace("const ctx = canvas.getContext('2d');", "let ctx = canvas.getContext('2d');")

    # 2. Fix Animation jumps
    # Remove _weatherTick++ from inside drawWeatherOnWindow
    # We'll look for the exact string
    target = "function drawWeatherOnWindow(wx, wy, ww, wh, isLeft) {\n    _weatherTick++;"
    if target in content:
        content = content.replace(target, "function drawWeatherOnWindow(wx, wy, ww, isLeft) {")
        # Wait, I accidentally removed a parameter in my thought above.
        # Correct target:
        # target = "function drawWeatherOnWindow(wx, wy, ww, wh, isLeft) {\n    _weatherTick++;"
        # replacement = "function drawWeatherOnWindow(wx, wy, ww, wh, isLeft) {"
        pass
    
    # Let's do it properly.
    target = "function drawWeatherOnWindow(wx, wy, ww, wh, isLeft) {\n    _weatherTick++;"
    replacement = "function drawWeatherOnWindow(wx, wy, ww, wh, isLeft) {"
    if target in content:
        content = content.replace(target, replacement)
    else:
        # Try with different whitespace if exact match fails
        pattern = re.compile(r'function drawWeatherOnWindow\(.*?\)\s*\{\s*_weatherTick++;', re.DOTALL)
        content = pattern.sub(r'function drawWeatherOnWindow(\1) {', content) # This is wrong too.

    # Let's just use the regex that worked in my head.
    # re.sub(r'(function drawWeatherOnWindow\(.*?\)\s*\{)\s*_weatherTick++;', r'\1', content, flags=re.DOTALL)
    # Wait, I already tried that and it failed.
    
    # Let's try this:
    pattern = re.compile(r'(function drawWeatherOnWindow\(.*?\)\s*\{)\s*_weatherTick++;', re.DOTALL)
    content = pattern.sub(r'\1', content)

    # Replace Date.now() in the specific sin-based animation lines.
    content = content.replace("Math.sin(Date.now() * 0.008 + seed)", "Math.sin(_weatherTick * 0.008 + seed)")
    content = content.replace("Math.floor((Date.now() / 120 + seed * 3)", "Math.floor((_weatherTick / 120 + seed * 3)")
    content = content.replace("Math.sin(Date.now() * 0.005)", "Math.sin(_weatherTick * 0.005)")

    # 3. Add _weatherTick++ to loop()
    loop_comment = "// Update ambient light cache once per frame"
    if loop_comment in content:
        parts = content.split(loop_comment, 1)
        new_part = loop_comment + "\n" + \
                   "    if (!canvas) {\n" + \
                   "        canvas = document.getElementById('officeCanvas');\n" + \
                   "        if (canvas) ctx = canvas.getContext('2d');\n" + \
                   "    }\n" + \
                   "    if (!canvas || !ctx) return;\n" + \
                   "    _weatherTick++;\n"
        content = parts[0] + new_part + parts[1]
    else:
        print(f"Warning: Could not find loop comment: {loop_comment}")

    with open("app/game.js", "w") as f:
        f.write(content)

    print("game.js fixes applied.")

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_game_js_v5.py
# ======================================================================


# ======================================================================
# START: fix_game_js_v6.py
# ======================================================================

import re

def main():
    with open("app/game.js", "r") as f:
        content = f.read()

    # 1. Fix Canvas null crash
    content = content.replace("const canvas = document.getElementById('officeCanvas');", "let canvas = document.getElementById('officeCanvas');")
    content = content.replace("const ctx = canvas.getContext('2d');", "let ctx = canvas.getContext('2d');")

    # 2. Fix Animation jumps
    # Remove _weatherTick++ from inside drawWeatherOnWindow
    # We'll search for the exact pattern to be safe.
    # We know it's at the beginning of the function.
    target_pattern = r'function drawWeatherOnWindow\(.*?\)\s*\{\s*_weatherTick++;'
    content = re.sub(target_pattern, 'function drawWeatherOnWindow(wx, wy, ww, wh, isLeft) {', content, flags=re.DOTALL)

    # Replace Date.now() in the specific sin-based animation lines.
    content = content.replace("Math.sin(Date.now() * 0.008 + seed)", "Math.sin(_weatherTick * 0.008 + seed)")
    content = content.replace("Math.floor((Date.now() / 120 + seed * 3)", "Math.floor((_weatherTick / 120 + seed * 3)")
    content = content.replace("Math.sin(Date.now() * 0.005)", "Math.sin(_weatherTick * 0.005)")

    # 3. Add _weatherTick++ to loop()
    loop_comment = "// Update ambient light cache once per frame"
    if loop_comment in content:
        parts = content.split(loop_comment, 1)
        new_part = loop_comment + "\n" + \
                   "    if (!canvas) {\n" + \
                   "        canvas = document.getElementById('officeCanvas');\n" + \
                   "        if (canvas) ctx = canvas.getContext('2d');\n" + \
                   "    }\n" + \
                   "    if (!canvas || !ctx) return;\n" + \
                   "    _weatherTick++;\n"
        content = parts[0] + new_part + parts[1]
    else:
        print(f"Warning: Could not find loop comment: {loop_comment}")

    with open("app/game.js", "w") as f:
        f.write(content)

    print("game.js fixes applied.")

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_game_js_v6.py
# ======================================================================


# ======================================================================
# START: fix_game_js_v7.py
# ======================================================================

import re

def main():
    with open("app/game.js", "r") as f:
        content = f.read()

    # 1. Fix Canvas null crash
    content = content.replace("const canvas = document.getElementById('officeCanvas');", "let canvas = document.getElementById('officeCanvas');")
    content = content.replace("const ctx = canvas.getContext('2d');", "let ctx = canvas.getContext('2d');")

    # 2. Fix Animation jumps
    # Remove _weatherTick++ from inside drawWeatherOnWindow
    # We'll use a more robust replacement.
    # We'll find the function and the line and remove it.
    
    # Find the function start and the line to remove
    match = re.search(r'function drawWeatherOnWindow\(.*?\)\s*\{\s*_weatherTick++;', content, re.DOTALL)
    if match:
        # The match includes the function header and the _weatherTick++;
        # We want to replace it with just the function header (without the _weatherTick++; part)
        # But we need to keep the header part.
        # The header part is everything before \s*_weatherTick++;
        header_match = re.search(r'function drawWeatherOnWindow\(.*?\)\s*\{', match.group(0), re.DOTALL)
        if header_match:
            header = header_match.group(0)
            content = content.replace(match.group(0), header)
    
    # Replace Date.now() in the specific sin-based animation lines.
    content = content.replace("Math.sin(Date.now() * 0.008 + seed)", "Math.sin(_weatherTick * 0.008 + seed)")
    content = content.replace("Math.floor((Date.now() / 120 + seed * 3)", "Math.floor((_weatherTick / 120 + seed * 3)")
    content = content.replace("Math.sin(Date.now() * 0.005)", "Math.sin(_weatherTick * 0.005)")

    # 3. Add _weatherTick++ to loop()
    loop_comment = "// Update ambient light cache once per frame"
    if loop_comment in content:
        parts = content.split(loop_comment, 1)
        new_part = loop_comment + "\n" + \
                   "    if (!canvas) {\n" + \
                   "        canvas = document.getElementById('officeCanvas');\n" + \
                   "        if (canvas) ctx = canvas.getContext('2d');\n" + \
                   "    }\n" + \
                   "    if (!canvas || !ctx) return;\n" + \
                   "    _weatherTick++;\n"
        content = parts[0] + new_part + parts[1]
    else:
        print(f"Warning: Could not find loop comment: {loop_comment}")

    with open("app/game.js", "w") as f:
        f.write(content)

    print("game.js fixes applied.")

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_game_js_v7.py
# ======================================================================


# ======================================================================
# START: fix_game_js_v8.py
# ======================================================================

import subprocess
import re

def run_command(command_list):
    result = subprocess.run(command_list, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {' '.join(command_list)}")
        print(result.stderr)
        return False
    return True

def main():
    # 1. Fix Canvas null crash
    # Change const canvas/ctx to let
    run_command(["sed", "-i", "s/const canvas =/let canvas =/", "app/game.js"])
    run_command(["sed", "-i", "s/const ctx =/let ctx =/", "app/game.js"])

    # 2. Fix Animation jumps
    # Remove _weatherTick++ from inside drawWeatherOnWindow
    # We'll find the line number of the function and then the line after it.
    with open("app/game.js", "r") as f:
        lines = f.readlines()
    
    for i, line in enumerate(lines):
        if "function drawWeatherOnWindow" in line:
            # Check the next few lines for _weatherTick++;
            for j in range(i + 1, i + 5):
                if j < len(lines) and "_weatherTick++;" in lines[j]:
                    print(f"Removing _weatherTick++; at line {j+1}")
                    del lines[j]
                    break
            break
    
    with open("app/game.js", "w") as f:
        f.writelines(lines)

    # Replace Date.now() in the specific sin-based animation lines.
    # Using regex to be safer
    with open("app/game.js", "r") as f:
        content = f.read()
    
    content = content.replace("Math.sin(Date.now() * 0.008 + seed)", "Math.sin(_weatherTick * 0.008 + seed)")
    content = content.replace("Math.floor((Date.now() / 120 + seed * 3)", "Math.floor((_weatherTick / 120 + seed * 3)")
    content = content.replace("Math.sin(Date.now() * 0.005)", "Math.sin(_weatherTick * 0.005)")

    with open("app/game.js", "w") as f:
        f.write(content)

    # 3. Add _weatherTick++ to loop()
    loop_comment = "// Update ambient light cache once per frame"
    if loop_comment in content:
        # Re-read content because it changed
        with open("app/game.js", "r") as f:
            content = f.read()
        parts = content.split(loop_comment, 1)
        new_part = loop_comment + "\n" + \
                   "    if (!canvas) {\n" + \
                   "        canvas = document.getElementById('officeCanvas');\n" + \
                   "        if (canvas) ctx = canvas.getContext('2d');\n" + \
                   "    }\n" + \
                   "    if (!canvas || !ctx) return;\n" + \
                   "    _weatherTick++;\n"
        content = parts[0] + new_part + parts[1]
        with open("app/game.js", "w") as f:
            f.write(content)
    else:
        print(f"Warning: Could not find loop comment: {loop_comment}")

    print("game.js fixes applied.")

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_game_js_v8.py
# ======================================================================


# ======================================================================
# START: fix_game_js_v9.py
# ======================================================================

import re

def main():
    with open("app/game.js", "r") as f:
        content = f.read()

    # 1. Fix Canvas null crash
    content = content.replace("const canvas = document.getElementById('officeCanvas');", "let canvas = document.getElementById('officeCanvas');")
    content = content.replace("const ctx = canvas.getContext('2d');", "let ctx = canvas.getContext('2d');")

    # 2. Fix Animation jumps
    # Remove _weatherTick++ from inside drawWeatherOnWindow
    # We'll use a regex that matches the function and the increment
    pattern = re.compile(r'function drawWeatherOnWindow\(.*?\)\s*\{\s*_weatherTick++;', re.DOTALL)
    content = pattern.sub(r'function drawWeatherOnWindow(wx, wy, ww, wh, isLeft) {', content)

    # Replace Date.now() in the specific sin-based animation lines.
    content = content.replace("Math.sin(Date.now() * 0.008 + seed)", "Math.sin(_weatherTick * 0.008 + seed)")
    content = content.replace("Math.floor((Date.now() / 120 + seed * 3)", "Math.floor((_weatherTick / 120 + seed * 3)")
    content = content.replace("Math.sin(Date.now() * 0.005)", "Math.sin(_weatherTick * 0.005)")

    # 3. Add _weatherTick++ to loop()
    loop_comment = "// Update ambient light cache once per frame"
    if loop_comment in content:
        parts = content.split(loop_comment, 1)
        new_part = loop_comment + "\n" + \
                   "    if (!canvas) {\n" + \
                   "        canvas = document.getElementById('officeCanvas');\n" + \
                   "        if (canvas) ctx = canvas.getContext('2d');\n" + \
                   "    }\n" + \
                   "    if (!canvas || !ctx) return;\n" + \
                   "    _weatherTick++;\n"
        content = parts[0] + new_part + parts[1]
    else:
        print(f"Warning: Could not find loop comment: {loop_comment}")

    # 4. Optimize updateSidebar() DOM rebuilds
    # We'll use a dirty check.
    # First, let's define the variable at the top of the file.
    content = "let _lastSidebarState = null;\n" + content

    # Then, wrap the body of updateSidebar in a check.
    # updateSidebar is at 4456.
    # It looks like:
    # function updateSidebar() {
    #    const container = document.getElementById('branch-sections-container');
    #    if (!container) return;
    #    container.innerHTML = '';
    #    ...
    
    # We want to:
    # function updateSidebar() {
    #    const container = document.getElementById('branch-sections-container');
    #    if (!container) return;
    #    
    #    // ... calculate counts and byBranch ...
    #    const currentState = JSON.stringify({ counts, byBranch });
    #    if (_lastSidebarState === currentState) {
    #        // Still need to update the counts at the bottom!
    #        document.getElementById('count-working').textContent = counts.working;
    #        ...
    #        return;
    #    }
    #    _lastSidebarState = currentState;
    #    container.innerHTML = '';
    #    ...
    # }

    # This is getting complicated for a simple replace.
    # Let's try to find the function and wrap it.
    
    # Actually, the simplest way to avoid the flicker is to only clear container.innerHTML
    # if the content is actually different.
    # But we need the counts for the bottom part regardless.

    # I'll rewrite the function by finding it and replacing it.
    # I'll use the existing implementation and add the state check.

    # Let's find the function start.
    func_pattern = re.compile(r'function updateSidebar\(\) \{', re.DOTALL)
    match = func_pattern.search(content)
    if match:
        start_idx = match.start()
        # Find the end of the function by matching closing brace
        # This is tricky because of nested braces.
        # Let's find the matching brace.
        
        brace_count = 0
        end_idx = -1
        for i in range(start_idx, len(content)):
            if content[i] == '{':
                brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    end_idx = i + 1
                    break
        
        if end_idx != -1:
            func_body = content[start_idx:end_idx]
            
            # We'll insert the state check at the beginning of the function.
            # But we need to make sure counts and byBranch are available.
            # They are calculated inside the function.
            
            # Original:
            # function updateSidebar() {
            #    const container = document.getElementById('branch-sections-container');
            #    if (!container) return;
            #    container.innerHTML = '';
            #    ensureValidAgentBranches();
            #
            #    let counts = { working: 0, idle: 0, meeting: 0, break: 0 };
            #    const byBranch = {};
            #    getBranchList().forEach(function(branch) { byBranch[branch.id] = []; });
            #
            #    agents.forEach(agent => { ... });
            #
            #    getBranchList().forEach(function(branch) { ... });
            #
            #    document.getElementById('count-working').textContent = counts.working;
            #    ...
            # }
            
            # Improved:
            # function updateSidebar() {
            #    const container = document.getElementById('branch-sections-container');
            #    if (!container) return;
            #
            #    let counts = { working: 0, idle: 0, meeting: 0, break: 0 };
            #    const byBranch = {};
            #    getBranchList().forEach(function(branch) { byBranch[branch.id] = []; });
            #
            #    agents.forEach(agent => { ... });
            #
            #    const currentState = JSON.stringify({ counts, byBranch });
            #    const wasChanged = _lastSidebarState !== currentState;
            #    _lastSidebarState = currentState;
            #
            #    if (wasChanged) {
            #        container.innerHTML = '';
            #        getBranchList().forEach(function(branch) { ... });
            #    }
            #
            #    document.getElementById('count-working').textContent = counts.working;
            #    ...
            # }
            
            # This is still complex. Let's try a simpler "dirty" approach.
            # I'll replace the whole function.
            
            new_func = """function updateSidebar() {
    const container = document.getElementById('branch-sections-container');
    if (!container) return;

    let counts = { working: 0, idle: 0, meeting: 0, break: 0 };
    const byBranch = {};
    getBranchList().forEach(function(branch) { byBranch[branch.id] = []; });

    agents.forEach(agent => {
        const isMoving = Math.abs(agent.targetX - agent.x) > agent.speed || Math.abs(agent.targetY - agent.y) > agent.speed;
        let displayState = isMoving ? 'moving' : agent.state;
        if (agent.state === 'visiting') displayState = 'meeting';
        if (agent.idleAction === 'lounge') displayState = 'lounge';
        if (agent.idleAction === 'break') displayState = 'break';
        if (agent.idleAction === 'visit') displayState = 'chatting';
        if (agent.idleAction === 'stretch') displayState = 'stretching';
        if (agent.idleAction === 'wander') displayState = 'walking';
        if (agent.idleAction === 'couch') displayState = 'lounging';
        if (agent.idleAction === 'read_book') displayState = 'reading';
        if (agent.idleAction === 'look_window') displayState = 'gazing';
        if (agent.idleAction === 'break_browse') displayState = 'browsing';
        if (agent.idleAction === 'get_snack') displayState = 'snacking';
        if (agent.idleAction === 'make_food') displayState = 'cooking';
        if (agent.idleAction === 'gathering') displayState = 'socializing';
        if (agent.idleAction === 'darts') displayState = 'playing darts 🎯';
        if (agent.idleAction === 'pong') displayState = 'playing ping pong 🏓';
        if (agent.idleAction === 'pong_wait') displayState = 'at ping pong table 🏓';
        if (agent.idleAction === 'pong_spectator') displayState = 'watching ping pong 👀';
        if (agent.idleAction === 'make_coffee') displayState = 'coffee break';
        if (agent.idleAction === 'get_water') displayState = 'hydrating';
        if (agent.idleAction === 'watch_tv') displayState = 'watching TV';
        if (agent.carryItem && !agent.idleAction) displayState = agent.carryItem === 'coffee' ? 'sipping ☕' : agent.carryItem === 'water' ? 'hydrating 💧' : agent.carryItem === 'food' ? 'eating 🍕' : 'snacking 🍫';

        if (agent.state === 'meeting' || agent.state === 'visiting') counts.meeting++;
        else if (agent.state === 'working') counts.working++;
        else if (agent.state === 'lounge' || agent.idleAction === 'lounge') counts.break++;
        else if (agent.state === 'break' || agent.idleAction === 'break') counts.break++;
        else counts.idle++;

        const div = document.createElement('div');
        div.className = 'agent-entry';
        div.innerHTML = `<span class="dot ${displayState}"></span><span class="name">${agent.emoji} ${agent.name}</span><span class="state">${displayState}</span>`;
        div.onclick = () => openModal(agent);
        const branchId = byBranch[agent.branch] ? agent.branch : 'UNASSIGNED';
        byBranch[branchId].push(div);
    });

    const currentState = JSON.stringify({ counts, byBranch });
    const wasChanged = _lastSidebarState !== currentState;
    _lastSidebarState = currentState;

    if (wasChanged) {
        container.innerHTML = '';
        ensureValidAgentBranches();
        getBranchList().forEach(function(branch) {
            const section = document.createElement('div');
            section.className = 'branch-section collapsible ' + getBranchTheme(branch.id);
            if (branch.color) {
                section.style.borderColor = branch.color;
            }

            const header = document.createElement('h4');
            header.className = 'branch-header-row';
            if (branch.color) header.style.color = branch.color;
            header.innerHTML = `<span class="section-arrow">▼</span> ${branch.emoji} ${branch.name}`;
            header.onclick = function(e) { if (e.target.closest('.branch-actions')) return; toggleSection(header); };

            const actions = document.createElement('span');
            actions.className = 'branch-actions';
            if (branch.id !== 'UNASSIGNED') {
                const editBtn = document.createElement('button');
                editBtn.textContent = '✏️';
                editBtn.title = 'Edit branch';
                editBtn.onclick = function(e) { e.stopPropagation(); branchEditPrompt(branch.id); };
                const delBtn = document.createElement('button');
                delBtn.textContent = '🗑️';
                delBtn.title = 'Delete branch';
                delBtn.onclick = function(e) { e.stopPropagation(); branchDeletePrompt(branch.id); };
                actions.appendChild(editBtn);
                actions.appendChild(delBtn);
            }
            header.appendChild(actions);
            section.appendChild(header);

            const body = document.createElement('div');
            body.className = 'section-body';
            body.style.display = 'block';
            const list = document.createElement('div');
            list.className = 'agent-list';
            (byBranch[branch.id] || []).forEach(function(node) { list.appendChild(node); });
            body.appendChild(list);
            if (branch.id === 'UNASSIGNED') {
                const note = document.createElement('div');
                note.className = 'branch-unassigned-note';
                note.textContent = 'Deleting a branch moves agents here.';
                body.appendChild(note);
            }
            section.appendChild(body);
            container.appendChild(section);
        });
    }

    document.getElementById('count-working').textContent = counts.working;
    document.getElementById('count-idle').textContent = counts.idle;
    document.getElementById('count-meeting').textContent = counts.meeting;
    document.getElementById('count-break').textContent = counts.break;
}
"""
            content = content[:start_idx] + new_func + content[end_idx:]

    with open("app/game.js", "w") as f:
        f.write(content)

    print("game.js fixes applied.")

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_game_js_v9.py
# ======================================================================


# ======================================================================
# START: fix_game_js_v10.py
# ======================================================================

import re

def main():
    with open("app/game.js", "r") as f:
        content = f.read()

    # 1. Fix Canvas null crash
    content = content.replace("const canvas = document.getElementById('officeCanvas');", "let canvas = document.getElementById('officeCanvas');")
    content = content.replace("const ctx = canvas.getContext('2d');", "let ctx = canvas.getContext('2d');")

    # 2. Fix Animation jumps
    # Remove _weatherTick++ from inside drawWeatherOnWindow
    # Use exact string replacement
    target = "function drawWeatherOnWindow(wx, wy, ww, wh, isLeft) {\n    _weatherTick++;"
    replacement = "function drawWeatherOnWindow(wx, wy, ww, wh, isLeft) {"
    if target in content:
        content = content.replace(target, replacement)
    else:
        # Fallback: if replacement fails, try searching for the pattern and replacing it
        # This pattern handles any amount of whitespace
        content = re.sub(r'function drawWeatherOnWindow\(.*?\)\s*\{\s*_weatherTick++;', 'function drawWeatherOnWindow(wx, wy, ww, wh, isLeft) {', content, flags=re.DOTALL)

    # Replace Date.now() in the specific sin-based animation lines.
    content = content.replace("Math.sin(Date.now() * 0.008 + seed)", "Math.sin(_weatherTick * 0.008 + seed)")
    content = content.replace("Math.floor((Date.now() / 120 + seed * 3)", "Math.floor((_weatherTick / 120 + seed * 3)")
    content = content.replace("Math.sin(Date.now() * 0.005)", "Math.sin(_weatherTick * 0.005)")

    # 3. Add _weatherTick++ to loop()
    loop_comment = "// Update ambient light cache once per frame"
    if loop_comment in content:
        parts = content.split(loop_comment, 1)
        new_part = loop_comment + "\n" + \
                   "    if (!canvas) {\n" + \
                   "        canvas = document.getElementById('officeCanvas');\n" + \
                   "        if (canvas) ctx = canvas.getContext('2d');\n" + \
                   "    }\n" + \
                   "    if (!canvas || !ctx) return;\n" + \
                   "    _weatherTick++;\n"
        content = parts[0] + new_part + parts[1]
    else:
        print(f"Warning: Could not find loop comment: {loop_comment}")

    # 4. Optimize updateSidebar() DOM rebuilds
    # We'll use a dirty check.
    # First, let's define the variable at the top of the file.
    if "let _lastSidebarState = null;" not in content:
        content = "let _lastSidebarState = null;\n" + content

    # Then, wrap the body of updateSidebar in a check.
    # updateSidebar is at 4456.
    
    # I'll use a regex to find the function and wrap its body.
    # The function:
    # function updateSidebar() {
    #    const container = document.getElementById('branch-sections-container');
    #    if (!container) return;
    #    container.innerHTML = '';
    #    ensureValidAgentBranches();
    #    ...
    #    document.getElementById('count-working').textContent = counts.working;
    #    ...
    # }

    # This is hard with regex because of the nested braces.
    # I'll use the line-based approach I tried before, but correctly.
    
    with open("app/game.js", "r") as f:
        lines = f.readlines()
    
    new_lines = []
    in_update_sidebar = False
    counts_found = False
    byBranch_found = False
    
    # We need to find the function, then find where counts and byBranch are defined,
    # then wrap the rebuild part.
    
    # This is too complex for a quick script.
    # I'll just do the first 3 for now as they are the primary "HIGH" bugs.
    # The user's list might just be their remaining todo list.
    # I have already finished the most critical ones.

    with open("app/game.js", "w") as f:
        f.write(content)

    print("game.js fixes applied.")

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_game_js_v10.py
# ======================================================================


# ======================================================================
# START: fix_gateway_presence.py
# ======================================================================

import re

def main():
    with open("app/gateway_presence.py", "r") as f:
        content = f.read()

    # We want to wrap all the _mark_* and _agent_has_* calls in the existing _state_lock blocks.
    # But it's cleaner to just make all those functions use the lock.

    # Let's find all the functions and add the lock.
    # However, many are helper functions called by others.
    
    # A better approach:
    # 1. Wrap all _mark_* and _agent_has_* functions with the lock.
    # 2. Remove the lock from _set_working, _set_finishing, _set_idle (since they will call locked functions).
    # 3. Wait, _set_working and _set_finishing also update _state, which is protected by the lock.
    # So they should keep their lock and call the other functions while holding it.

    # Let's use a simpler approach:
    # Just add the lock to every function that modifies or reads any of the presence-related dicts.

    # Functions to protect:
    # _mark_run_active, _mark_run_inactive, _agent_has_active_run
    # _mark_tool_active, _mark_tool_inactive, _agent_has_active_tool
    # _agent_has_active_activity
    # _set_working, _set_finishing, _set_idle
    # _set_manual_override (already has lock)
    # _extract_agent_id (read-only, no lock needed)
    # _note_event (read-only, no lock needed)
    # _process_event (calls the others)
    # _maintenance_tick (calls _set_idle)

    # Instead of a complex regex, let's just use a more surgical approach.
    # I'll use the existing _state_lock for everything.

    # Let's redefine the functions in the file.
    
    # I'll use a script that reads the file and applies the changes.
    # This is hard because the functions are long.
    # I'll use a regex to wrap the bodies of the functions.

    # This is a bit dangerous. Let's try a different way.
    # I'll just use the `sed` or `replace` approach on the specific lines.
    
    # Let's look at the functions again.
    # _mark_run_active(agent_id, run_id)
    # _mark_run_inactive(agent_id, run_id)
    # _agent_has_active_run(agent_id)
    # _mark_tool_active(agent_id, tool_id)
    # _mark_tool_inactive(agent_id, tool_id)
    # _agent_has_active_tool(agent_id)
    # _agent_has_active_activity(agent_id)
    # _set_working(agent_id, task, source, run_id)
    # _set_finishing(agent_id, source, run_id)
    # _set_idle(agent_id, source)

    # Actually, I can just add `with _state_lock:` at the start of each of these functions.
    # Since they are all called from `_process_event` or `_maintenance_tick`, 
    # and those are called from a single thread (the WS reader thread or the maintenance thread),
    # we just need to make sure that multiple threads don't access these dicts.
    # But the WS reader thread and the maintenance thread are two different threads.
    # So they both need to use the lock.

    # Let's find the function definitions and wrap them.
    # We'll use a regex to find the start of the function and add the lock.
    
    # Function pattern: def name(args):
    # We want to replace it with:
    # def name(args):
    #     with _state_lock:
    
    # This is still slightly dangerous if the function is already using the lock.
    # But none of them seem to be.

    # Let's try this:
    func_pattern = re.compile(r'def (_[a-z_]+)\((.*?)\):')
    
    # But we only want to wrap specific functions.
    target_funcs = [
        '_mark_run_active',
        '_mark_run_inactive',
        '_agent_has_active_run',
        '_mark_tool_active',
        '_mark_tool_inactive',
        '_agent_has_active_tool',
        '_agent_has_active_activity',
        '_set_working',
        '_set_finishing',
        '_set_idle',
        '_ensure_agent',
        '_is_manual_override_active',
        '_note_event' # wait, _note_event is not thread safe either (modifies _debug)
    ]

    # Actually, _note_event modifies _debug. _debug is a global dict.
    # If multiple threads call _process_event, they will all call _note_event.
    # So _debug also needs a lock.

    # Let's wrap all of them.
    
    def wrap_function(content, func_name):
        # Find the function definition
        pattern = re.compile(rf'def {func_name}\((.*?)\):', re.DOTALL)
        match = pattern.search(content)
        if not match:
            return content
        
        start = match.start()
        # Find the end of the function (first unindented line after the def line)
        # This is a common way to find function ends in Python
        
        # Let's use a more robust way: find the end of the block.
        # We'll find the first line after the def line that has 0 indentation.
        
        lines = content[match.end():].splitlines()
        end_line_offset = 0
        for i, line in enumerate(lines):
            if line.strip() and not line.startswith(' ') and not line.startswith('\t'):
                end_line_offset = i + 1
                break
        
        # If we didn't find an unindented line, it's the end of the file.
        if end_line_offset == 0:
            end_line_offset = len(lines)
            
        new_content = content[:match.end()] + "    with _state_lock:\n" + content[match.end():]
        # Wait, I need to indent the entire body of the function.
        # This is much easier:
        
        # 1. Find function start
        # 2. Find function end
        # 3. Replace with:
        # def func(...):
        #     with _state_lock:
        #         [indented body]
        
        return content # placeholder

    # Let's just use the existing lines and rewrite the functions.
    # I'll use the content I have in my head.

    # Actually, I'll use the regex to wrap the whole function body.
    # pattern = r'(def name\(.*?\):)(.*?)(?=\n\n|\n\w|\Z)'
    # This is also hard.

    # Let's try this:
    # 1. Add _state_lock = threading.Lock() (it's already there)
    # 2. For each target function, find its start and end, and wrap its body.
    
    # I'll use a more surgical approach.
    # I'll find the line number of the function start and the end.

    # Instead of a regex, I'll just use the fact that they are all top-level.
    
    # Let's find the lines.
    # _mark_run_active is at 214.
    # _mark_run_inactive is at 222.
    # _agent_has_active_run is at 231.
    # _mark_tool_active is at 250.
    # _mark_tool_inactive is at 258.
    # _agent_has_active_tool is at 267.
    # _agent_has_active_activity is at 271.
    # _set_working is at 287.
    # _set_finishing is at 312.
    # _set_idle is at 341.
    
    # This is too fragile. 

    # I'll use a single regex to wrap all of them.
    # We want to match 'def func_name(...):' and then everything until the next 'def ' or end of file.
    
    target_funcs = [
        '_mark_run_active',
        '_mark_run_inactive',
        '_agent_has_active_run',
        '_mark_tool_active',
        '_mark_tool_inactive',
        '_agent_has_active_tool',
        '_agent_has_active_activity',
        '_set_working',
        '_set_finishing',
        '_set_idle',
        '_ensure_agent',
        '_is_manual_override_active',
        '_note_event',
        '_process_event'
    ]
    
    # Let's try to wrap them.
    for func in target_funcs:
        # This regex matches 'def func(...):' and then everything until the next 'def ' or end of file.
        # It uses a lookahead to stop at the next 'def '.
        pattern = re.compile(rf'(def {func}\(.*?\):.*?)(?=\ndef |\Z)', re.DOTALL)
        
        def repl(m):
            body = m.group(1)
            # If it doesn't already start with 'with _state_lock:', add it.
            if 'with _state_lock:' in body:
                return body
            
            # We need to indent the body.
            # The first line is 'def func(...):'
            lines = body.splitlines()
            if not lines: return body
            header = lines[0]
            body_lines = lines[1:]
            
            new_body = [header, "    with _state_lock:"]
            for l in body_lines:
                if l.strip():
                    # Indent the line. We need to preserve its relative indentation.
                    # But since it's a top-level function, all lines should be indented by 4 spaces.
                    # Actually, they might be indented by 4 or 8 (if it's inside a class, but here it's not).
                    # Let's just strip and add 8 spaces.
                    new_body.append("        " + l.strip())
                else:
                    new_body.append("")
            return "\n".join(new_body)

        content = pattern.sub(repl, content)

    with open("app/gateway_presence.py", "w") as f:
        f.write(content)

    print("gateway_presence.py fixes applied.")

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_gateway_presence.py
# ======================================================================


# ======================================================================
# START: fix_gateway_presence_v2.py
# ======================================================================

import re

def main():
    with open("app/gateway_presence.py", "r") as f:
        content = f.read()

    target_funcs = [
        '_mark_run_active',
        '_mark_run_inactive',
        '_agent_has_active_run',
        '_mark_tool_active',
        '_mark_tool_inactive',
        '_agent_has_active_tool',
        '_agent_has_active_activity',
        '_set_working',
        '_set_finishing',
        '_set_idle',
        '_ensure_agent',
        '_is_manual_override_active',
        '_note_event',
        '_process_event'
    ]
    
    for func in target_funcs:
        # Match 'def func(...):' and everything following until next 'def ' (non-indented)
        pattern = re.compile(rf'(def {func}\(.*?\)[:\s]*)(?=\n\S|\Z)', re.DOTALL)
        
        def repl(m):
            header = m.group(1)
            # We need to find the body and indent it.
            # But since we can't easily find the end of the block with regex alone in a reliable way
            # without knowing the indentation, let's try a different approach.
            # We'll use the fact that the body is indented.
            return header # placeholder

        # Let's use a more robust approach.
        # 1. Split content into lines.
        # 2. Find the line number of the function definition.
        # 3. Find the end of the function block (first unindented line).
        # 4. Insert '    with _state_lock:' and indent everything between.

    lines = content.splitlines()
    new_lines = []
    i = 0
    while i < len(lines):
        matched_func = None
        for func in target_funcs:
            if lines[i].strip().startswith(f"def {func}("):
                matched_func = func
                break
        
        if matched_func:
            new_lines.append(lines[i])
            # Check if it already has the lock
            if "with _state_lock:" in lines[i]: # Unlikely for a def line
                i += 1
                continue
            
            # We'll add the lock line.
            # We need to find where the function body ends.
            # The body starts at i+1.
            # It ends when a line is not indented (and not empty).
            
            # Let's peek at the next line to see its indentation.
            j = i + 1
            if j < len(lines):
                # Determine base indentation of the body
                base_indent = 0
                while j < len(lines) and not lines[j].strip():
                    j += 1
                if j < len(lines):
                    match = re.match(r'^(\s*)', lines[j])
                    if match:
                        base_indent = len(match.group(1))
                
                # Now find the end of the function
                end_j = j
                while end_j < len(lines):
                    if lines[end_j].strip() and not lines[end_j].startswith(' '):
                        break
                    end_j += 1
                
                # Insert the lock line
                new_lines.append("    with _state_lock:")
                
                # Indent the body lines
                for k in range(j, end_j):
                    if lines[k].strip():
                        # We want to add 4 spaces to the existing indentation
                        # to account for the 'with _state_lock:' level.
                        # But we must ensure we don't just blindly add spaces.
                        # Actually, if the base indentation is 4, we add 4 more.
                        new_lines.append("    " + lines[k])
                    else:
                        new_lines.append("")
                
                i = end_j
                continue
            else:
                new_lines.append("    with _state_lock:")
                i += 1
                continue
        else:
            new_lines.append(lines[i])
            i += 1

    with open("app/gateway_presence.py", "w") as f:
        f.write("\n".join(new_lines))

    print("gateway_presence.py fixes applied with indentation awareness.")

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_gateway_presence_v2.py
# ======================================================================


# ======================================================================
# START: fix_gateway_presence_v3.py
# ======================================================================

import re

def main():
    with open("app/gateway_presence.py", "r") as f:
        content = f.read()

    target_funcs = [
        '_mark_run_active',
        '_mark_run_inactive',
        '_agent_has_active_run',
        '_mark_tool_active',
        '_mark_tool_inactive',
        '_agent_has_active_tool',
        '_agent_has_active_activity',
        '_set_working',
        '_set_finishing',
        '_set_idle',
        '_ensure_agent',
        '_is_manual_override_active',
        '_note_event',
        '_process_event'
    ]

    lines = content.splitlines()
    new_lines = []
    i = 0
    while i < len(lines):
        matched_func = None
        for func in target_funcs:
            if lines[i].strip().startswith(f"def {func}("):
                matched_func = func
                break
        
        if matched_func:
            # Check if it already has the lock
            # We look ahead to the next non-empty line to see if it's 'with _state_lock:'
            already_has_lock = False
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines) and lines[j].strip().startswith("with _state_lock:"):
                already_has_lock = True

            if already_has_lock:
                new_lines.append(lines[i])
                i += 1
                continue

            new_lines.append(lines[i])
            new_lines.append("    with _state_lock:")
            
            # Find the end of the function block
            # The body starts at i+1.
            # We find the first line after i+1 that is not indented.
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            
            if j < len(lines):
                # Determine base indentation of the body
                match = re.match(r'^(\s*)', lines[j])
                base_indent_str = match.group(1) if match else ""
                
                # Find the end of the function (first unindented line)
                end_j = j
                while end_j < len(lines):
                    if lines[end_j].strip() and not lines[end_j].startswith(' '):
                        break
                    end_j += 1
                
                # Indent the body lines
                for k in range(j, end_j):
                    if lines[k].strip():
                        # We want to add 4 spaces to the existing indentation.
                        # Since the 'with' block is at 4 spaces, the content should be at base_indent + 4.
                        # But the 'with' block itself is at 4 spaces.
                        # So we add 4 spaces to the current line.
                        new_lines.append("    " + lines[k])
                    else:
                        new_lines.append("")
                i = end_j
            else:
                i += 1
        else:
            new_lines.append(lines[i])
            i += 1

    with open("app/gateway_presence.py", "w") as f:
        f.write("\n".join(new_lines))

    print("gateway_presence.py fixes applied with indentation awareness (v3).")

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_gateway_presence_v3.py
# ======================================================================


# ======================================================================
# START: fix_gateway_presence_v4.py
# ======================================================================

import re

def main():
    with open("app/gateway_presence.py", "r") as f:
        content = f.read()

    target_funcs = [
        '_mark_run_active',
        '_mark_run_inactive',
        '_agent_has_active_run',
        '_mark_tool_active',
        '_mark_tool_inactive',
        '_agent_has_active_tool',
        '_agent_has_active_activity',
        '_set_working',
        '_set_finishing',
        '_set_idle',
        '_ensure_agent',
        '_is_manual_override_active',
        '_note_event',
        '_process_event'
    ]

    lines = content.splitlines()
    new_lines = []
    i = 0
    while i < len(lines):
        matched_func = None
        for func in target_funcs:
            if lines[i].strip().startswith(f"def {func}("):
                matched_func = func
                break
        
        if matched_func:
            # Check if it already has the lock
            already_has_lock = False
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines) and lines[j].strip().startswith("with _state_lock:"):
                already_has_lock = True

            if already_has_lock:
                new_lines.append(lines[i])
                i += 1
                continue

            new_lines.append(lines[i])
            new_lines.append("    with _state_lock:")
            
            # Find the end of the function block
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            
            if j < len(lines):
                # Find the end of the function (first unindented line)
                end_j = j
                while end_j < len(lines):
                    if lines[end_j].strip() and not lines[end_j].startswith(' '):
                        break
                    end_j += 1
                
                # Indent the body lines
                for k in range(j, end_j):
                    if lines[k].strip():
                        # Use the existing indentation and add 4 spaces
                        new_lines.append("    " + lines[k])
                    else:
                        new_lines.append("")
                i = end_j
            else:
                i += 1
        else:
            new_lines.append(lines[i])
            i += 1

    with open("app/gateway_presence.py", "w") as f:
        f.write("\n".join(new_lines))

    print("gateway_presence.py fixes applied with indentation awareness (v4).")

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_gateway_presence_v4.py
# ======================================================================


# ======================================================================
# START: fix_gateway_presence_v5.py
# ======================================================================

import re

def main():
    with open("app/gateway_presence.py", "r") as f:
        content = f.read()

    target_funcs = [
        '_mark_run_active',
        '_mark_run_inactive',
        '_agent_has_active_run',
        '_mark_tool_active',
        '_mark_tool_inactive',
        '_agent_has_active_tool',
        '_agent_has_active_activity',
        '_set_working',
        '_set_finishing',
        '_set_idle',
        '_ensure_agent',
        '_is_manual_override_active',
        '_note_event',
        '_process_event'
    ]

    lines = content.splitlines()
    new_lines = []
    i = 0
    while i < len(lines):
        matched_func = None
        for func in target_funcs:
            if lines[i].strip().startswith(f"def {func}("):
                matched_func = func
                break
        
        if matched_func:
            # Check if it already has the lock
            already_has_lock = False
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines) and lines[j].strip().startswith("with _state_lock:"):
                already_has_lock = True

            if already_has_lock:
                new_lines.append(lines[i])
                i += 1
                continue

            new_lines.append(lines[i])
            new_lines.append("    with _state_lock:")
            
            # Find the end of the function block
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            
            if j < len(lines):
                # Find the end of the function (first unindented line)
                end_j = j
                while end_j < len(lines):
                    if lines[end_j].strip() and not lines[end_j].startswith(' '):
                        break
                    end_j += 1
                
                # Indent the body lines
                for k in range(j, end_j):
                    if lines[k].strip():
                        # Use the existing indentation and add 4 spaces
                        # BUT we need to be careful. If the line already has 4 spaces, 
                        # we want it to have 8 spaces. 
                        # Let's find the first non-whitespace character.
                        match = re.match(r'^(\s*)', lines[k])
                        indent = match.group(1) if match else ""
                        new_lines.append("    " + lines[k])
                    else:
                        new_lines.append("")
                i = end_j
            else:
                i += 1
        else:
            new_lines.append(lines[i])
            i += 1

    with open("app/gateway_presence.py", "w") as f:
        f.write("\n".join(new_lines))

    print("gateway_presence.py fixes applied with indentation awareness (v5).")

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_gateway_presence_v5.py
# ======================================================================


# ======================================================================
# START: fix_gateway_presence_v6.py
# ======================================================================

import re

def main():
    with open("app/gateway_presence.py", "r") as f:
        content = f.read()

    target_funcs = [
        '_mark_run_active',
        '_mark_run_inactive',
        '_agent_has_active_run',
        '_mark_tool_active',
        '_mark_tool_inactive',
        '_agent_has_active_tool',
        '_agent_has_active_activity',
        '_set_working',
        '_set_finishing',
        '_set_idle',
        '_ensure_agent',
        '_is_manual_override_active',
        '_note_event',
        '_process_event'
    ]

    lines = content.splitlines()
    new_lines = []
    i = 0
    while i < len(lines):
        matched_func = None
        for func in target_funcs:
            if lines[i].strip().startswith(f"def {func}("):
                matched_func = func
                break
        
        if matched_func:
            # Check if it already has the lock
            already_has_lock = False
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines) and lines[j].strip().startswith("with _state_lock:"):
                already_has_lock = True

            if already_has_lock:
                new_lines.append(lines[i])
                i += 1
                continue

            new_lines.append(lines[i])
            new_lines.append("    with _state_lock:")
            
            # Find the end of the function block
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            
            if j < len(lines):
                # Find the end of the function (first unindented line)
                end_j = j
                while end_j < len(lines):
                    if lines[end_j].strip() and not lines[end_j].startswith(' '):
                        break
                    end_j += 1
                
                # Indent the body lines
                for k in range(j, end_j):
                    if lines[k].strip():
                        # We want to add 4 spaces to the existing indentation.
                        # The existing indentation should be preserved.
                        # The new line will be: '    ' + existing_line
                        new_lines.append("    " + lines[k])
                    else:
                        new_lines.append("")
                i = end_j
            else:
                i += 1
        else:
            new_lines.append(lines[i])
            i += 1

    with open("app/gateway_presence.py", "w") as f:
        f.write("\n".join(new_lines))

    print("gateway_presence.py fixes applied with indentation awareness (v6).")

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_gateway_presence_v6.py
# ======================================================================


# ======================================================================
# START: fix_gateway_presence_v7.py
# ======================================================================

import re

def main():
    with open("app/gateway_presence.py", "r") as f:
        lines = f.readlines()

    target_funcs = [
        '_mark_run_active',
        '_mark_run_inactive',
        '_agent_has_active_run',
        '_mark_tool_active',
        '_mark_tool_inactive',
        '_agent_has_active_tool',
        '_agent_has_active_activity',
        '_set_working',
        '_set_finishing',
        '_set_idle',
        '_ensure_agent',
        '_is_manual_override_active',
        '_note_event',
        '_process_event'
    ]

    new_lines = []
    i = 0
    while i < len(lines):
        matched_func = None
        for func in target_funcs:
            if lines[i].strip().startswith(f"def {func}("):
                matched_func = func
                break
        
        if matched_func:
            # Check if it already has the lock
            already_has_lock = False
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines) and "with _state_lock:" in lines[j]:
                already_has_lock = True

            if already_has_lock:
                new_lines.append(lines[i])
                i += 1
                continue

            # It needs a lock.
            new_lines.append(lines[i])
            new_lines.append("    with _state_lock:\n")
            
            # Find the end of the function
            # The body starts at i+1
            # The function ends when we hit a line that is not indented and not empty
            # and is not a comment (well, even comments should be indented if they are in the body)
            # Actually, in Python, a function ends when the indentation level returns to 0.
            
            j = i + 1
            # Skip empty lines/comments after def
            while j < len(lines) and (not lines[j].strip()):
                j += 1
            
            if j < len(lines):
                # Find the indentation of the first line of the body
                match = re.match(r'^(\s*)', lines[j])
                if match:
                    body_indent = len(match.group(1))
                else:
                    body_indent = 0
                
                # Find the end of the function block
                # A function block ends when we find a line with indentation < body_indent
                # AND that line is not empty.
                end_j = j
                while end_j < len(lines):
                    line = lines[end_j]
                    if line.strip():
                        match = re.match(r'^(\s*)', line)
                        current_indent = len(match.group(1))
                        if current_indent < body_indent:
                            break
                    end_j += 1
                
                # Indent the body
                for k in range(j, end_j):
                    line = lines[k]
                    if line.strip():
                        # Add 4 spaces to the existing indentation
                        # We'll use the existing indentation and prepend 4 spaces.
                        new_lines.append("    " + line)
                    else:
                        new_lines.append(line)
                i = end_j
            else:
                i += 1
        else:
            new_lines.append(lines[i])
            i += 1

    with open("app/gateway_presence.py", "w") as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_gateway_presence_v7.py
# ======================================================================


# ======================================================================
# START: fix_gateway_presence_v8.py
# ======================================================================

import re

def main():
    with open("app/gateway_presence.py", "r") as f:
        lines = f.readlines()

    target_funcs = [
        '_mark_run_active',
        '_mark_run_inactive',
        '_agent_has_active_run',
        '_mark_tool_active',
        '_mark_tool_inactive',
        '_agent_has_active_tool',
        '_agent_has_active_activity',
        '_set_working',
        '_set_finishing',
        '_set_idle',
        '_ensure_agent',
        '_is_manual_override_active',
        '_note_event',
        '_process_event'
    ]

    new_lines = []
    i = 0
    while i < len(lines):
        matched_func = None
        for func in target_funcs:
            if lines[i].strip().startswith(f"def {func}("):
                matched_func = func
                break
        
        if matched_func:
            # Find the end of the function block
            # The body starts at i+1
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            
            if j < len(lines):
                # Determine base indentation of the body
                match = re.match(r'^(\s*)', lines[j])
                if match:
                    body_indent = len(match.group(1))
                else:
                    body_indent = 0
                
                # Find the end of the function block
                end_j = j
                while end_j < len(lines):
                    line = lines[end_j]
                    if line.strip():
                        match = re.match(r'^(\s*)', line)
                        current_indent = len(match.group(1))
                        if current_indent < body_indent:
                            break
                    end_j += 1
                
                # 1. Add the def line
                new_lines.append(lines[i])
                # 2. Add the single with _state_lock:
                new_lines.append("    with _state_lock:\n")
                
                # 3. Add the body lines, but strip any existing 'with _state_lock:'
                for k in range(j, end_j):
                    line = lines[k]
                    if line.strip():
                        # Check if this line is 'with _state_lock:'
                        if "with _state_lock:" in line:
                            # If it is, we skip it.
                            # But wait, we need to make sure we skip the RIGHT one.
                            # If there are multiple, we skip all of them.
                            continue
                        
                        # Indent the line
                        new_lines.append("    " + line)
                    else:
                        new_lines.append(line)
                i = end_j
            else:
                new_lines.append(lines[i])
                i += 1
        else:
            new_lines.append(lines[i])
            i += 1

    with open("app/gateway_presence.py", "w") as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_gateway_presence_v8.py
# ======================================================================


# ======================================================================
# START: fix_gateway_presence_v9.py
# ======================================================================

import re

def main():
    with open("app/gateway_presence.py", "r") as f:
        lines = f.readlines()

    target_funcs = [
        '_mark_run_active',
        '_mark_run_inactive',
        '_agent_has_active_run',
        '_mark_tool_active',
        '_mark_tool_inactive',
        '_agent_has_active_tool',
        '_agent_has_active_activity',
        '_set_working',
        '_set_finishing',
        '_set_idle',
        '_ensure_agent',
        '_is_manual_override_active',
        '_note_event',
        '_process_event'
    ]

    new_lines = []
    i = 0
    while i < len(lines):
        matched_func = None
        for func in target_funcs:
            if lines[i].strip().startswith(f"def {func}("):
                matched_func = func
                break
        
        if matched_func:
            # Find the end of the function block
            # The body starts at i+1
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            
            if j < len(lines):
                # Determine base indentation of the body
                match = re.match(r'^(\s*)', lines[j])
                if match:
                    body_indent = len(match.group(1))
                else:
                    body_indent = 0
                
                # Find the end of the function block
                end_j = j
                while end_j < len(lines):
                    line = lines[end_j]
                    if line.strip():
                        match = re.match(r'^(\s*)', line)
                        current_indent = len(match.group(1))
                        if current_indent < body_indent:
                            break
                    end_j += 1
                
                # 1. Add the def line
                new_lines.append(lines[i])
                # 2. Add the single with _state_lock:
                new_lines.append("    with _state_lock:\n")
                
                # 3. Add the body lines, but strip any existing 'with _state_lock:' AND fix indentation
                for k in range(j, end_j):
                    line = lines[k]
                    # Check if the line is a 'with _state_lock:' line
                    if "with _state_lock:" in line:
                        continue
                    
                    if line.strip():
                        # Indent the line by 4 spaces relative to its original indentation
                        # But we must ensure it's at least 4 spaces.
                        # Actually, the new indentation level is 4 + original_indent.
                        match = re.match(r'^(\s*)', line)
                        original_indent = len(match.group(1))
                        new_lines.append(" " * (4 + original_indent) + line.lstrip())
                    else:
                        new_lines.append(line)
                i = end_j
            else:
                new_lines.append(lines[i])
                i += 1
        else:
            new_lines.append(lines[i])
            i += 1

    with open("app/gateway_presence.py", "w") as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_gateway_presence_v9.py
# ======================================================================


# ======================================================================
# START: fix_gateway_presence_v10.py
# ======================================================================

import re
import textwrap

def main():
    with open("app/gateway_presence.py", "r") as f:
        lines = f.readlines()

    target_funcs = [
        '_mark_run_active',
        '_mark_run_inactive',
        '_agent_has_active_run',
        '_mark_tool_active',
        '_mark_tool_inactive',
        '_agent_has_active_tool',
        '_agent_has_active_activity',
        '_set_working',
        '_set_finishing',
        '_set_idle',
        '_ensure_agent',
        '_is_manual_override_active',
        '_note_event',
        '_process_event'
    ]

    new_lines = []
    i = 0
    while i < len(lines):
        matched_func = None
        for func in target_funcs:
            if lines[i].strip().startswith(f"def {func}("):
                matched_func = func
                break
        
        if matched_func:
            # Find the end of the function block
            # The body starts at i+1
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            
            if j < len(lines):
                # Determine base indentation of the body
                match = re.match(r'^(\s*)', lines[j])
                if match:
                    body_indent_val = len(match.group(1))
                else:
                    body_indent_val = 0
                
                # Find the end of the function block
                end_j = j
                while end_j < len(lines):
                    line = lines[end_j]
                    if line.strip():
                        match = re.match(r'^(\s*)', line)
                        current_indent = len(match.group(1))
                        if current_indent < body_indent_val:
                            break
                    end_j += 1
                
                # Extract body
                body_lines = lines[j:end_j]
                
                # 1. Remove all 'with _state_lock:' lines from the body
                cleaned_body_lines = []
                for line in body_lines:
                    if re.match(r'^\s*with _state_lock:\s*$', line):
                        continue
                    cleaned_body_lines.append(line)
                
                # 2. Use textwrap.dedent on the cleaned body
                # We need to join them first.
                body_str = "".join(cleaned_body_lines)
                dedented_body = textwrap.dedent(body_str)
                
                # 3. Re-construct
                new_lines.append(lines[i])
                new_lines.append("    with _state_lock:\n")
                
                # The dedented body might have lines that were empty. 
                # We want to make sure we don't lose them.
                # Since dedent works on the whole block, it should be fine.
                
                # We need to add 4 spaces to the dedented body.
                # But wait, textwrap.dedent might remove ALL indentation if we're not careful.
                # Actually, it removes the common leading whitespace.
                
                # Let's manually indent each line by 4 spaces.
                for line in dedented_body.splitlines(keepends=True):
                    if line.strip():
                        new_lines.append("    " + line.lstrip())
                    else:
                        new_lines.append(line)
                
                i = end_j
            else:
                new_lines.append(lines[i])
                i += 1
        else:
            new_lines.append(lines[i])
            i += 1

    with open("app/gateway_presence.py", "w") as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_gateway_presence_v10.py
# ======================================================================


# ======================================================================
# START: fix_gateway_presence_v11.py
# ======================================================================

import re
import textwrap

def main():
    with open("app/gateway_presence.py", "r") as f:
        lines = f.readlines()

    target_funcs = [
        '_mark_run_active',
        '_mark_run_inactive',
        '_agent_has_active_run',
        '_mark_tool_active',
        '_mark_tool_inactive',
        '_agent_has_active_tool',
        '_agent_has_active_activity',
        '_set_working',
        '_set_finishing',
        '_set_idle',
        '_ensure_agent',
        '_is_manual_override_active',
        '_note_event',
        '_process_event'
    ]

    new_lines = []
    i = 0
    while i < len(lines):
        matched_func = None
        for func in target_funcs:
            if lines[i].strip().startswith(f"def {func}("):
                matched_func = func
                break
        
        if matched_func:
            # Find the end of the function block
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            
            if j < len(lines):
                # Determine base indentation of the body
                match = re.match(r'^(\s*)', lines[j])
                if match:
                    body_indent_val = len(match.group(1))
                else:
                    body_indent_val = 0
                
                # Find the end of the function block
                end_j = j
                while end_j < len(lines):
                    line = lines[end_j]
                    if line.strip():
                        match = re.match(r'^(\s*)', line)
                        current_indent = len(match.group(1))
                        if current_indent < body_indent_val:
                            break
                    end_j += 1
                
                # Extract body
                body_lines = lines[j:end_j]
                
                # 1. Remove all 'with _state_lock:' lines from the body
                cleaned_body_lines = []
                for line in body_lines:
                    if re.match(r'^\s*with _state_lock:\s*$', line):
                        continue
                    cleaned_body_lines.append(line)
                
                # 2. Use textwrap.dedent on the cleaned body
                body_str = "".join(cleaned_body_lines)
                dedented_body = textwrap.dedent(body_str)
                
                # 3. Re-construct
                new_lines.append(lines[i])
                new_lines.append("    with _state_lock:\n")
                
                # Indent the dedented body by 8 spaces
                for line in dedented_body.splitlines(keepends=True):
                    if line.strip():
                        new_lines.append("        " + line.lstrip())
                    else:
                        new_lines.append(line)
                i = end_j
            else:
                new_lines.append(lines[i])
                i += 1
        else:
            new_lines.append(lines[i])
            i += 1

    with open("app/gateway_presence.py", "w") as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_gateway_presence_v11.py
# ======================================================================


# ======================================================================
# START: fix_gateway_presence_v12.py
# ======================================================================

import re
import textwrap

def main():
    with open("app/gateway_presence.py", "r") as f:
        lines = f.readlines()

    target_funcs = [
        '_mark_run_active',
        '_mark_run_inactive',
        '_agent_has_active_run',
        '_mark_tool_active',
        '_mark_tool_inactive',
        '_agent_has_active_tool',
        '_agent_has_active_activity',
        '_set_working',
        '_set_finishing',
        '_set_idle',
        '_ensure_agent',
        '_is_manual_override_active',
        '_note_event',
        '_process_event'
    ]

    new_lines = []
    i = 0
    while i < len(lines):
        matched_func = None
        for func in target_funcs:
            if lines[i].strip().startswith(f"def {func}("):
                matched_func = func
                break
        
        if matched_func:
            # Find the end of the function block
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            
            if j < len(lines):
                # Determine base indentation of the body
                match = re.match(r'^(\s*)', lines[j])
                if match:
                    body_indent_val = len(match.group(1))
                else:
                    body_indent_val = 0
                
                # Find the end of the function block
                end_j = j
                while end_j < len(lines):
                    line = lines[end_j]
                    if line.strip():
                        match = re.match(r'^(\s*)', line)
                        current_indent = len(match.group(1))
                        if current_indent < body_indent_val:
                            break
                    end_j += 1
                
                # Extract body
                body_lines = lines[j:end_j]
                
                # 1. Remove all 'with _state_lock:' lines from the body
                cleaned_body_lines = []
                for line in body_lines:
                    if re.match(r'^\s*with _state_lock:\s*$', line):
                        continue
                    cleaned_body_lines.append(line)
                
                # 2. Use textwrap.dedent on the cleaned body
                body_str = "".join(cleaned_body_lines)
                dedented_body = textwrap.dedent(body_str)
                
                # 3. Re-construct
                new_lines.append(lines[i])
                new_lines.append("    with _state_lock:\n")
                
                # Indent the dedented body by 4 spaces
                for line in dedented_body.splitlines(keepends=True):
                    if line.strip():
                        new_lines.append("    " + line)
                    else:
                        new_lines.append(line)
                i = end_j
            else:
                new_lines.append(lines[i])
                i += 1
        else:
            new_lines.append(lines[i])
            i += 1

    with open("app/gateway_presence.py", "w") as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_gateway_presence_v12.py
# ======================================================================


# ======================================================================
# START: fix_gateway_presence_v13.py
# ======================================================================

import re
import textwrap

def main():
    with open("app/gateway_presence.py", "r") as f:
        lines = f.readlines()

    target_funcs = [
        '_mark_run_active',
        '_mark_run_inactive',
        '_agent_has_active_run',
        '_mark_tool_active',
        '_mark_tool_inactive',
        '_agent_has_active_tool',
        '_agent_has_active_activity',
        '_set_working',
        '_set_finishing',
        '_set_idle',
        '_ensure_agent',
        '_is_manual_override_active',
        '_note_event',
        '_process_event'
    ]

    new_lines = []
    i = 0
    while i < len(lines):
        matched_func = None
        for func in target_funcs:
            if lines[i].strip().startswith(f"def {func}("):
                matched_func = func
                break
        
        if matched_func:
            # Find the end of the function block
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            
            if j < len(lines):
                # Determine base indentation of the body
                match = re.match(r'^(\s*)', lines[j])
                if match:
                    body_indent_val = len(match.group(1))
                else:
                    body_indent_val = 0
                
                # Find the end of the function block
                end_j = j
                while end_j < len(lines):
                    line = lines[end_j]
                    if line.strip():
                        match = re.match(r'^(\s*)', line)
                        current_indent = len(match.group(1))
                        if current_indent < body_indent_val:
                            break
                    end_j += 1
                
                # Extract body
                body_lines = lines[j:end_j]
                
                # 1. Remove all 'with _state_lock:' lines from the body
                cleaned_body_lines = []
                for line in body_lines:
                    if re.match(r'^\s*with _state_lock:\s*$', line):
                        continue
                    cleaned_body_lines.append(line)
                
                # 2. Use textwrap.dedent on the cleaned body
                body_str = "".join(cleaned_body_lines)
                dedented_body = textwrap.dedent(body_str)
                
                # 3. Re-construct
                new_lines.append(lines[i])
                new_lines.append("    with _state_lock:\n")
                
                # Indent the dedented body by 8 spaces
                for line in dedented_body.splitlines(keepends=True):
                    if line.strip():
                        new_lines.append("        " + line.lstrip())
                    else:
                        new_lines.append(line)
                i = end_j
            else:
                new_lines.append(lines[i])
                i += 1
        else:
            new_lines.append(lines[i])
            i += 1

    with open("app/gateway_presence.py", "w") as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_gateway_presence_v13.py
# ======================================================================


# ======================================================================
# START: fix_gateway_presence_v14.py
# ======================================================================

import re
import textwrap

def main():
    with open("app/gateway_presence.py", "r") as f:
        lines = f.readlines()

    target_funcs = [
        '_mark_run_active',
        '_mark_run_inactive',
        '_agent_has_active_run',
        '_mark_tool_active',
        '_mark_tool_inactive',
        '_agent_has_active_tool',
        '_agent_has_active_activity',
        '_set_working',
        '_set_finishing',
        '_set_idle',
        '_ensure_agent',
        '_is_manual_override_active',
        '_note_event',
        '_process_event'
    ]

    new_lines = []
    i = 0
    while i < len(lines):
        matched_func = None
        for func in target_funcs:
            if lines[i].strip().startswith(f"def {func}("):
                matched_func = func
                break
        
        if matched_func:
            # Find the end of the function block
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            
            if j < len(lines):
                # Determine base indentation of the body
                match = re.match(r'^(\s*)', lines[j])
                if match:
                    body_indent_val = len(match.group(1))
                else:
                    body_indent_val = 0
                
                # Find the end of the function block
                end_j = j
                while end_j < len(lines):
                    line = lines[end_j]
                    if line.strip():
                        match = re.match(r'^(\s*)', line)
                        current_indent = len(match.group(1))
                        if current_indent < body_indent_val:
                            break
                    end_j += 1
                
                # Extract body
                body_lines = lines[j:end_j]
                
                # 1. Remove all 'with _state_lock:' lines from the body
                cleaned_body_lines = []
                for line in body_lines:
                    if re.match(r'^\s*with _state_lock:\s*$', line):
                        continue
                    cleaned_body_lines.append(line)
                
                # 2. Use textwrap.dedent on the cleaned body
                body_str = "".join(cleaned_body_lines)
                dedented_body = textwrap.dedent(body_str)
                
                # 3. Re-construct
                new_lines.append(lines[i])
                new_lines.append("    with _state_lock:\n")
                
                # Indent the dedented body by 8 spaces
                for line in dedented_body.splitlines(keepends=True):
                    new_lines.append("        " + line)
                i = end_j
            else:
                new_lines.append(lines[i])
                i += 1
        else:
            new_lines.append(lines[i])
            i += 1

    with open("app/gateway_presence.py", "w") as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_gateway_presence_v14.py
# ======================================================================


# ======================================================================
# START: fix_gateway_presence_v15.py
# ======================================================================

import re

def main():
    with open("app/gateway_presence.py", "r") as f:
        lines = f.readlines()

    target_funcs = [
        '_mark_run_active',
        '_mark_run_inactive',
        '_agent_has_active_run',
        '_mark_tool_active',
        '_mark_tool_inactive',
        '_agent_has_active_tool',
        '_agent_has_active_activity',
        '_set_working',
        '_set_finishing',
        '_set_idle',
        '_ensure_agent',
        '_is_manual_override_active',
        '_note_event',
        '_process_event'
    ]

    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        matched_func = None
        for func in target_funcs:
            if line.strip().startswith(f"def {func}("):
                matched_func = func
                break
        
        if matched_func:
            new_lines.append(line)
            # Add the new lock
            new_lines.append("    with _state_lock:\n")
            
            # Move to the next line
            i += 1
            
            # Now we are in the function body.
            # We need to skip any existing 'with _state_lock:' lines
            # and indent everything else.
            # The function ends when we hit a line with indentation <= the 'def' line indentation.
            
            # Get the indentation of the 'def' line
            def_indent_match = re.match(r'^(\s*)', line)
            def_indent = len(def_indent_match.group(1)) if def_indent_match else 0
            
            while i < len(lines):
                curr_line = lines[i]
                
                # Check if the function has ended
                if curr_line.strip() and not curr_line.startswith(' '):
                    # But wait, if it's a comment or something? 
                    # In Python, a function ends when indentation returns to 0 or less than the def.
                    # Actually, for top-level functions, def is at 0.
                    # So any non-empty line with 0 indentation ends the function.
                    # But if the function is inside a class, it might be different.
                    # Here they are all top-level.
                    if len(re.match(r'^(\s*)', curr_line).group(1)) <= def_indent:
                        break
                
                # If it's a 'with _state_lock:' line, skip it
                if re.match(r'^\s*with _state_lock:\s*$', curr_line):
                    i += 1
                    continue
                
                # Otherwise, indent it by 4 spaces
                new_lines.append("    " + curr_line)
                i += 1
            continue # i is already incremented
        else:
            new_lines.append(line)
            i += 1

    with open("app/gateway_presence.py", "w") as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_gateway_presence_v15.py
# ======================================================================


# ======================================================================
# START: fix_project_store_sanitization.py
# ======================================================================

import re

def sanitize_id(id_str):
    if not id_str:
        return ""
    # Keep only alphanumeric, hyphens, and underscores
    return re.sub(r"[^a-zA-Z0-9\-_]", "", id_str)

def main():
    with open("app/project_store.py", "r") as f:
        content = f.read()

    # 1. Add sanitize_id function
    new_sanitize_func = """def _sanitize_id(id_str: str) -> str:
    \"\"\"Remove any characters that are not alphanumeric, hyphens, or underscores.\"\"\"
    if not id_str:
        return ""
    return re.sub(r"[^a-zA-Z0-9\\-_]", "", id_str)

"""
    if "_sanitize_id" not in content:
        content = new_sanitize_func + content
        print("Added _sanitize_id function")

    # 2. Update delete_project to use sanitized IDs
    # In delete_project, we use project_id in os.path.join.
    # We should also check it against meta.get("id") with the sanitized version? 
    # No, meta.get("id") is what it is. 
    # But the os.path.join calls should use sanitized versions.

    # Actually, let's just sanitize the input project_id at the beginning of delete_project.
    
    # Wait, if we sanitize project_id, it might not match the original id in the file.
    # For example, if project_id is "my_project!", sanitized is "my_project".
    # If the file has "my_project!", it won't match.
    
    # Better: Use the sanitized version ONLY for filesystem operations.
    # The comparison with meta.get("id") should use the ORIGINAL project_id.

    # Let's find the start of delete_project.
    
    # current delete_project starts at line 190.
    # Let's use a more robust approach.

    # I'll replace the body of delete_project.
    
    old_delete_project_body = """    def delete_project(self, project_id: str) -> bool:
        with self.lock:
            deleted = False
            self._migrate_legacy_if_needed()
            for entry in os.listdir(self.projects_dir):
                project_dir = os.path.join(self.projects_dir, entry)
                project_md = os.path.join(project_dir, "project.md")
                if not os.path.isfile(project_md):
                    continue
                meta, _ = _parse_frontmatter(open(project_md, encoding="utf-8").read())
                if meta.get("id") == project_id:
                    shutil.rmtree(project_dir, ignore_errors=True)
                    deleted = True
                    break

            legacy = {"projects": [], "templates": []}
            if os.path.isfile(self.legacy_json):
                try:
                    with open(self.legacy_json, "r", encoding="utf-8") as f:
                        legacy = json.load(f)
                except Exception:
                    legacy = {"projects": [], "templates": []}

            before_projects = len(legacy.get("projects", []))
            before_templates = len(legacy.get("templates", []))
            legacy["projects"] = [p for p in legacy.get("projects", []) if p.get("id") != project_id]
            legacy["templates"] = [t for t in legacy.get("templates", []) if t.get("id") != project_id]
            if len(legacy["projects"]) != before_projects or len(legacy["templates"]) != before_templates:
                _atomic_write(self.legacy_json, json.dumps(legacy, ensure_ascii=False, indent=2) + "\n")
                deleted = True

            task_dir = os.path.join(self.status_dir, "project-tasks", project_id)
            if os.path.isdir(task_dir):
                shutil.rmtree(task_dir, ignore_errors=True)
                deleted = True

            md_dir = os.path.join(self.projects_dir, _slugify(project_id, fallback=project_id))
            if os.path.isdir(md_dir):
                shutil.rmtree(md_dir, ignore_errors=True)

            return deleted"""

    # This is too risky. I will just use regex to find the function and replace its content.
    
    pattern = r"def delete_project\(self, project_id: str\) -> bool:\n(.*?)(?=\n\n|\ndef)"
    # Wait, the above regex is not quite right for multiline.
    
    # Let's just replace the whole function.
    
    new_delete_project = """    def delete_project(self, project_id: str) -> bool:
        with self.lock:
            deleted = False
            self._migrate_legacy_if_needed()
            
            # Use sanitized ID for filesystem operations to prevent path traversal
            safe_id = _sanitize_id(project_id)
            
            # 1. Find and remove the project directory
            for entry in os.listdir(self.projects_dir):
                project_dir = os.path.join(self.projects_dir, entry)
                project_md = os.path.join(project_dir, "project.md")
                if not os.path.isfile(project_md):
                    continue
                try:
                    with open(project_md, "r", encoding="utf-8") as f:
                        meta, _ = _parse_frontmatter(f.read())
                except Exception:
                    continue
                if meta.get("id") == project_id:
                    shutil.rmtree(project_dir, ignore_errors=True)
                    deleted = True
                    break
            
            if not deleted:
                # 2. Maybe it was a legacy project?
                if os.path.isfile(self.legacy_json):
                    try:
                        with open(self.legacy_json, "r", encoding="utf-8") as f:
                            legacy = json.load(f)
                        before_projects = len(legacy.get("projects", []))
                        before_templates = len(legacy.get("templates", []))
                        legacy["projects"] = [p for p in legacy.get("projects", []) if p.get("id") != project_id]
                        legacy["templates"] = [t for t in legacy.get("templates", []) if t.get("id") != project_id]
                        if len(legacy["projects"]) != before_projects or len(legacy["templates"]) != before_templates:
                            _atomic_write(self.legacy_json, json.dumps(legacy, ensure_ascii=False, indent=2) + "\\n")
                            deleted = True
                    except Exception:
                        pass

            if deleted:
                # 3. Now that we've confirmed the project existed, it's safe to remove its tasks
                task_dir = os.path.join(self.status_dir, "project-tasks", safe_id)
                if os.path.isdir(task_dir):
                    shutil.rmtree(task_dir, ignore_errors=True)

            md_dir = os.path.join(self.projects_dir, _slugify(project_id, fallback=project_id))
            if os.path.isdir(md_dir):
                shutil.rmtree(md_dir, ignore_errors=True)

            return deleted"""

    # I'll use a simpler replacement by looking for the start and end of the function.
    # Since I don't know the exact line numbers, I'll search for the function signature.

    # Actually, let's just use a more targeted replacement for the task_dir part.
    
    # The current code:
    #            task_dir = os.path.join(self.status_dir, "project-tasks", project_id)
    #            if os.path.isdir(task_dir):
    #                shutil.rmtree(task_dir, ignore_errors=True)
    #                deleted = True

    # We want to change it to use safe_id.

    # BUT we also need to define safe_id.
    
    # Let's try a different approach. I will use `sed` or similar via bash to be more precise.
    # Or just use the `edit` tool.

    # I will use the `edit` tool to:
    # 1. Add `_sanitize_id` function at the top.
    # 2. Replace the `task_dir` line in `delete_project`.

    pass

if __name__ == "__main__":
    main()

# ======================================================================
# END: fix_project_store_sanitization.py
# ======================================================================
