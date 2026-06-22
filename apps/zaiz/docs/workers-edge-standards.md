# ZeaZ Platform — Workers, Edge, and AI Gateway Standards

This document defines the security and operational standards for Workers, Edge middleware, and AI Gateway integration.

## 1. Core Security Standards
- **JWT Verification:** All requests requiring authentication must have JWTs validated at the edge.
- **Rate Limiting:** Must be implemented at the edge (middleware or Workers) for all API routes.
- **Error Shapes:** All public API errors must follow the standard JSON shape:
  ```json
  {
    "ok": false,
    "error": {
      "code": "RATE_LIMITED|UNAUTHORIZED|FORBIDDEN|BAD_REQUEST|INTERNAL_ERROR",
      "message": "safe public message",
      "request_id": "..."
    }
  }
  ```
- **Security Headers:** Enforce strict security headers (CSP, HSTS) on all edge responses.

## 2. AI Gateway Configuration
- AI Gateway must be used for all AI provider integrations to ensure observability, rate limiting, and abuse protection.
- Secrets for AI providers must NOT be hardcoded; use environment variables or managed secret stores.

## 3. Validation
- Use `scripts/validate-workers.sh` to ensure edge configuration adheres to these standards before deployment.
