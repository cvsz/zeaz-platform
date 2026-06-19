    if (_sessionsListCache.promise && now - _sessionsListCache.at < maxAgeMs) return _sessionsListCache.promise;
    if (_sessionsListCache.promise && now - _sessionsListCache.at < maxAgeMs) return _sessionsListCache.promise;
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
    });
    return _sessionsListCache.promise;
  }
  function rpc(method, params) {
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
  }
  function getSessionsListCached(maxAgeMs = 2500) {
    const now = Date.now();
    if (_sessionsListCache.promise && now - _sessionsListCache.at < maxAgeMs) return _sessionsListCache.promise;
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
    });
    return _sessionsListCache.promise;
  }
  function rpc(method, params) {
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
  }
    ws.onclose = (evt) => {
      connected = false;
      ws = null;
      for (const id in pendingCallbacks) {
        if (pendingCallbacks[id].reject) pendingCallbacks[id].reject(new Error('WebSocket closed'));
        delete pendingCallbacks[id];
      }
      chatWindows.forEach(w => w.setStatus(`Disconnected (${evt.code})`, 'disconnected'));
      if (chatWindows.some(w => w.root.classList.contains('open') || w.currentRunId || w.streamingMsg)) setTimeout(connectGateway, 3000);
    };
  function getSessionsListCached(maxAgeMs = 2500) {
    const now = Date.now();
    if (_sessionsListCache.promise && now - _sessionsListCache.at < maxAgeMs) return _sessionsListCache.promise;
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
    });
    return _sessionsListCache.promise;
  }
  function rpc(method, params) {
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
  }
    ws.onclose = (evt) => {
      connected = false;
      ws = null;
      for (const id in pendingCallbacks) {
        if (pendingCallbacks[id].reject) pendingCallbacks[id].reject(new Error('WebSocket closed'));
        delete pendingCallbacks[id];
      }
      chatWindows.forEach(w => w.setStatus(`Disconnected (${evt.code})`, 'disconnected'));
      if (chatWindows.some(w => w.root.classList.contains('open') || w.currentRunId || w.streamingMsg)) setTimeout(connectGateway, 3000);
    };
      if (msg.type === 'res') {
        const cb = pendingCallbacks[msg.id];
        if (cb) { delete pendingCallbacks[msg.id]; cb.resolve(msg); }
        return;
      }
