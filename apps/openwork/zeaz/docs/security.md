# ZEAZ Omega Security

## Security Architecture

### Threat Model

| Threat | Vector | Mitigation |
|--------|--------|------------|
| LLM API key leakage | Environment, logs | Keys loaded from env, never logged |
| MCP privilege escalation | Tool invocation | Provider isolation, rate limiting |
| Agent prompt injection | User input | Input validation in AgentContext |
| Memory data exposure | Query API | Tag-based access, TTL expiration |
| Workflow manipulation | Execution params | Step validation, timeout enforcement |

## API Key Management

ZEAZ uses environment variables for all API keys. Keys are:
- Loaded at startup from `process.env`
- Never logged or exposed in error messages
- Validated via health check endpoints
- Automatically detected per provider

```typescript
// Provider config - keys never serialized
export const providerConfig: LLMProvider = {
  id: 'claude',
  apiKeyEnv: 'ANTHROPIC_API_KEY', // env var name only
  // key is loaded at runtime
}
```

## LLM Provider Security

### Fallback Safety
- Provider health is tracked per-instance
- Degraded providers are skipped during routing
- Error rate tracking prevents cascading failures

### Cost Protection
- `maxCost` parameter caps per-request spending
- Token budgeting prevents runaway requests
- Default to lowest-cost provider when budget is constrained

## MCP Provider Security

### Tool Access Control
- All tool invocations are logged with full audit trail
- Rate limiting prevents abuse (`maxPerMinute`)
- Provider isolation prevents cross-provider contamination

### Input Validation
- All tool arguments validated against `inputSchema`
- Schema-based type checking prevents injection

## Runtime Security

### Python Runtime Bridge
- RuntimeAdapter uses exec with sanitized module paths
- All Python calls have 30s timeout
- Runtime is read-only by default

### Policy Engine Integration
```
agent action → PolicyEngine.validate() → allowed/disallowed
```
- Mutations are sandboxed
- Destructive actions blocked by default
- All actions logged in Action Journal

## Data Protection

| Data Type | Storage | Protection |
|-----------|---------|------------|
| Agent memory | In-memory Map | Process-isolated |
| Session state | Optional Redis | Network-isolated |
| LLM conversations | Not persisted | Ephemeral |
| MCP invocations | In-memory ring buffer | Max 1000 entries |
| API keys | Environment | Runtime memory only |

## Security Audit Checklist

- [ ] All API keys use environment variables
- [ ] No secrets committed to repository
- [ ] LLM providers validate health before routing
- [ ] MCP tools have rate limiting
- [ ] Agent inputs are validated
- [ ] Python runtime calls are sandboxed
- [ ] Memory TTL prevents stale data accumulation
- [ ] Workflow steps have timeouts
- [ ] Docker containers run as non-root
- [ ] Health endpoints don't leak sensitive data
