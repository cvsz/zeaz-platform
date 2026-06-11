# Contributing to ZeaZ Platform

Thank you for your interest in contributing to the ZeaZ Platform! This document outlines the process for proposing changes, submitting issues, and building local components.

By contributing to this repository, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md) and [Security Policy](SECURITY.md).

---

## Getting Started

### 1. Fork and Clone
1. Fork this repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/zeaz-platform.git
   cd zeaz-platform
   ```
3. Set up the upstream remote:
   ```bash
   git remote add upstream https://github.com/cvsz/zeaz-platform.git
   ```

### 2. Branch Naming
Create a branch for your work. We use descriptive branch prefixes:
- `feature/` for new features (e.g., `feature/ztrader-ui-update`)
- `bugfix/` for bug fixes (e.g., `bugfix/zlms-port-conflict`)
- `docs/` for documentation improvements (e.g., `docs/add-contributing-guide`)
- `security/` for security-related patches (e.g., `security/hickory-dns-hardening`)

---

## Commit Message Guidelines

We use conventional commit messages to keep our git history clean and readable:
- **Format:** `<type>(<scope>): <short description>`
- **Types:**
  - `feat`: A new feature
  - `fix`: A bug fix
  - `docs`: Documentation updates
  - `style`: Code formatting changes (missing semi-colons, etc.)
  - `refactor`: Code changes that neither fix bugs nor add features
  - `test`: Adding or updating tests
  - `chore`: Infrastructure updates, package managers, build processes
- **Example:** `feat(zcloud): integrate CloudPanel v2 catalog updates`

---

## Local Development and Code Quality

### 1. Verification and Linting
Before submitting changes, make sure all tests pass and there are no compilation errors:
- Review the `Makefile` in the root directory for target commands.
- Run typecheck and linting on affected applications in `apps/*`.
- Run compiler checks:
  ```bash
  make build-all-stacks
  ```

### 2. Security Expectations
- **Secrets Management:** Double check that no sensitive tokens, API keys, passwords, or live configuration files are staged for commit. Use `.env.example` templates to document new variables.
- **Commit Signing:** Commits pushed to the upstream repository must be GPG signed.

### 3. Documentation Requirements
- If you modify application behavior under `apps/<app_name>`, you **must** update the corresponding application's `README.md`.
- Ensure all public functions, environment variables, and custom build scripts are properly documented.

---

## Pull Request Process

1. **Keep Pull Requests Focused:** A pull request should do one thing. If you want to fix multiple unrelated issues, submit multiple PRs.
2. **Rebase regularly:** Before submitting your PR, rebase it on the upstream `main` branch to resolve conflicts:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
3. **Submit the PR:** Push to your fork and create a Pull Request on GitHub. Use the provided [PR template](.github/PULL_REQUEST_TEMPLATE.md) to describe your changes.
4. **Code Review:** A maintainer will review your PR. Address feedback by updating your branch and pushing updates.
5. **Merge:** Once approved, your changes will be merged into the `main` branch.

---

## Issue Triage and Labels

We use labels to categorize and track issues:
- `bug`: Something isn't working as expected.
- `enhancement`: New feature or request.
- `documentation`: Improvements or additions to docs.
- `security`: Security audit, scanner alert, or hardening task.
- `good first issue`: Ideal for new contributors.
- `wontfix`: Work that is out of scope or will not be merged.
