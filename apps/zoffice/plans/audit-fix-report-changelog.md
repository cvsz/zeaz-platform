# Blueprint: Deep-Dive Audit, Bug Fix, and Documentation

**Objective**: Conduct a deep-dive repository audit, identify and fix bugs, generate a comprehensive review report, and create a formal changelog.

## Overview
This plan executes a full-lifecycle engineering cycle: from discovery and analysis to implementation, verification, and formal documentation.

---

## Step 1: Automated & Static Analysis (Model: Default)
**Goal**: Identify low-hanging fruit, linting errors, and obvious anti-patterns.

### Tasks
- [ ] Scan for TODOs, FIXMEs, and hacky code in the entire repo.
- [ ] Run Python linters (e.g., \`ruff\`, \`flake8\`, \`pylint\`) if available in the environment.
- [ ] Run JavaScript linters (e.g., \`eslint\`) if available.
- [ ] Check for security vulnerabilities (hardcoded secrets, unsafe input handling) using \`grep\`.

### Verification
- [ ] List of all identified "warning" sites.
- [ ] Zero new linting errors introduced in subsequent steps.

**Exit Criteria**: A compiled list of candidate bug areas is ready for detailed analysis.

---

## Step 2: Backend Deep-Dive (Model: Strongest)
**Goal**: Audit Python modules for concurrency, state management, and security.

### Tasks
- [ ] **Audit \`app/server.py\`**: Check for threading/asyncio issues, RPC promise leaks, and error handling completeness.
- [ ] **Audit \`app/gateway_presence.py\`**: Verify thread-safe access to \`_state\`, \`_manual_overrides\`, and correct lifecycle state transitions.
- [ ] **Audit \`app/project_store.py\`**: Inspect file I/O, path traversal protection (e.g., \`_sanitize_id\`), and JSON serialization robustness.

### Verification
- [ ] Bug list with severity (Low/Med/High) and file:line references.

**Exit Criteria**: All backend logical flaws are identified and documented.

---

## Step 3: Frontend Deep-Dive (Model: Strongest)
**Goal**: Audit JS modules for DOM stability, event leaks, and XSS.

### Tasks
- [ ] **Audit \`app/chat.js\`**: Check WebSocket connection stability, RPC promise management, and XSS mitigation (escaping HTML).
- [ ] **Audit \`app/game.js\`**: Verify Canvas lifecycle (null checks), event listener cleanup, and collision/animation math stability.
- [ ] **Audit \`app/projects.js\`**: Inspect DOM rebuilding patterns, state synchronization, and error reporting.

### Verification
- [ ] Bug list with severity (Low/Med/High) and file:line references.

**Exit Criteria**: All frontend logical flaws are identified and documented.

--- 

## Step 4: Implementation & Fixes (Model: Strongest)
**Goal**: Systematically fix identified issues.

### Tasks
- [ ] Apply fixes for High-severity bugs first.
- [ ] Apply fixes for Medium/Low-severity bugs.
- [ ] Ensure each fix follows existing code style and patterns.

### Verification
- [ ] Manual verification of each fix (e.g., via \`curl\` or visual check).
- [ ] No regression in existing functionality.

**Exit Criteria**: All identified bugs are resolved.

--- 

## Step 5: Regression Testing & Verification (Model: Default)
**Goal**: Ensure the system is stable and the fixes are correct.

### Tasks
- [ ] Run all existing tests in \`tests/\`.
- [ ] Run lint and typecheck commands (e.g., \`npm run lint\`, \`ruff\`) to ensure compliance.
- [ ] Perform a smoke test of the main application loop (\`make start\`).

### Verification
- [ ] All tests pass.
- [ ] No linting/type errors.

**Exit Criteria**: The codebase is verified as stable and compliant.

--- 

## Step 6: Reporting & Changelog (Model: Default)
**Goal**: Formalize the results of the operation.

### Tasks
- [ ] **Generate \`AUDIT_REPORT.md\`**: A detailed summary of findings (what was found, why it was a bug, and how it was fixed).
- [ ] **Generate \`CHANGELOG.md\`**: A concise, user-facing summary of changes, categorized by type (Bug Fix, Improvement, etc.).

### Verification
- [ ] Report and Changelog are accurate and follow project style.

**Exit Criteria**: Task completed.
