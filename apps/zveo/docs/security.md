# API Security Hardening

- Protected API routes require Bearer authentication and RBAC authorization via `authenticateAndAuthorize`.
- Tenant isolation is enforced on tenant-bound routes (campaigns, workflows, exports, publish targets).
- Token-bucket rate limiting is applied at the HTTP boundary before route execution.
- All error responses follow a standard shape:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "principal tenant does not match campaign tenant",
    "retryable": false
  },
  "correlationId": "uuid"
}
```

- Logs and error surfaces use secret redaction for Authorization headers, provider keys, Meta tokens, and OpenAI keys.
