"use client";
import React, { useState } from 'react';

export function ApiTerminal() {
  const [endpoint, setEndpoint] = useState('/api/runtime/cloudflare/health');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runCurl = async () => {
    setLoading(true);
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult(`Error: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card-static space-y-4">
      <h3 className="h3">API Inspector</h3>
      <div className="flex gap-2">
        <input 
          value={endpoint} 
          onChange={(e) => setEndpoint(e.target.value)}
          className="input-field font-mono flex-1"
        />
        <button onClick={runCurl} disabled={loading} className="btn-base btn-primary">
          {loading ? 'Running...' : 'Run'}
        </button>
      </div>
      {result && (
        <pre className="mt-4 max-h-60 overflow-auto rounded-[var(--radius-md)] bg-black/50 p-4 font-mono text-xs text-emerald-300">
          {result}
        </pre>
      )}
    </div>
  );
}
