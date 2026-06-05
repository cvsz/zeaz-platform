# Changelog

## [1.0.0] - 2026-06-04
### Added
- Refactored core modules into a production-ready structure (`/src/core`, `/src/utils`, `/src/cli`).
- Implemented robust `pydantic-settings` configuration management with secrets masking.
- Created `StickerGenerator` with dynamic template mapping (`.json` layouts), auto text resizing, and watermark support.
- Developed a fully asynchronous `LineAPI` using `httpx`, containing an internal `asyncio.Queue` worker to gracefully handle LINE rate limits.
- Upgraded `GoogleSheetsAPI` with exponential backoff retries, dual-auth support (ADC or JSON), and batch update efficiency.
- Added a fast, Jinja-based Web Dashboard on port `8007` to monitor pending tasks, tail logs in real-time, and upload new `.png` templates via HTTP Basic Auth.
- Exported system metrics using Prometheus (`stickers_generated_total`, `line_send_success`, `sheets_errors`).
- Embedded `loguru` with native rotation (10MB) and a `LineAdminHandler` sink to instantly push `CRITICAL` errors to `ADMIN_LINE_GROUP_ID`.
- Packaged full Docker orchestration including a multi-stage `Dockerfile`, `docker-compose.yml`, health checks, and `systemd` deployment scripts for VPS.
- Integrated `.github/workflows/deploy.yml` for automated CI/CD image builds and deployments to Docker Hub.
- Wrote full `pytest` suite mocking all network API interactions and verifying configurations.
- Added `Makefile` for streamlined command execution.
