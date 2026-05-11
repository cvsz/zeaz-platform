# Workers rate limiting

This platform enforces distributed token bucket limits with two backends:
- KV backend for global, eventually-consistent throttling.
- Durable Object backend for strongly-consistent high-risk routes.

Quota classes include per-user, per-route, AI generation, publishing, and abuse throttle.
