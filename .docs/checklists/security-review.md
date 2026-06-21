# Checklist: Security & Hardening Review (Phase 05)

This checklist verifies the cryptographic boundaries and token configurations.

- [ ] All inputs validated against specific boundary schema (Zod/Pydantic).
- [ ] Secret scanners executed; zero production-grade secrets committed.
- [ ] WAF abuse controls, bot block limits, and CORS parameters hardened.
- [ ] Dedicated tokens category separated (DNS, ZT, WAF, Tunnel, etc.).
- [ ] Session TTL limits enforced <= 4 hours for financial domain actions.
