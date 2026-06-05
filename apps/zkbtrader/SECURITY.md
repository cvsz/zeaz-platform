# Security Policy

## Supported status

ZKBTrader is an early research scaffold. Treat every deployment as experimental until CI, tests, audit logging, and operational runbooks are complete.

## Secret handling

- Never commit exchange credentials, tokens, passphrases, private URLs, private keys, or local `.env` files.
- Use `.env.example` only for placeholders.
- Store real values in a local `.env` file or a proper secret manager.
- Rotate any credential that was ever pasted into chat, logs, screenshots, README files, commits, or issue comments.

## Exchange access policy

For development, use read-only exchange credentials where possible. Paper mode is the only supported execution mode in this scaffold.

## Reporting issues

Open a private security advisory or contact the repository owner directly. Do not publish exploitable details in public issues.

## Required checks

```bash
make lint
make typecheck
make test
make secret-scan
make audit
```
