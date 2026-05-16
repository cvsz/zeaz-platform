```markdown
# zeaz-platform Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `zeaz-platform` TypeScript codebase. It covers file naming, import/export styles, commit message conventions, and testing patterns. While no specific framework or automated workflows were detected, this guide will help you contribute code that aligns with the project's established practices.

## Coding Conventions

### File Naming
- **Pattern:** PascalCase for all files.
- **Example:**  
  `UserProfile.ts`, `OrderManager.test.ts`

### Import Style
- **Pattern:** Relative imports are used throughout the codebase.
- **Example:**
  ```typescript
  import { UserProfile } from './UserProfile';
  ```

### Export Style
- **Pattern:** Named exports are preferred.
- **Example:**
  ```typescript
  // In UserProfile.ts
  export function getUserProfile() { ... }
  ```

### Commit Message Conventions
- **Pattern:** Conventional commits with clear prefixes.
- **Common Prefixes:** `docs`, `chore`
- **Example:**
  ```
  docs: update README with new setup instructions
  chore: remove unused dependencies
  ```

## Workflows

### Commit Changes
**Trigger:** When committing code or documentation changes  
**Command:** `/commit`

1. Stage your changes using `git add`.
2. Write a commit message using the conventional commit format:
   - Use a prefix like `docs` or `chore`.
   - Keep the message concise (average 44 characters).
3. Commit your changes:
   ```bash
   git commit -m "docs: update API documentation"
   ```

### Add a New Module
**Trigger:** When adding a new feature or module  
**Command:** `/add-module`

1. Create a new file using PascalCase (e.g., `NewFeature.ts`).
2. Use relative imports to include dependencies.
3. Export your functions or classes using named exports.
   ```typescript
   export function newFeature() { ... }
   ```
4. If applicable, create a corresponding test file (e.g., `NewFeature.test.ts`).

## Testing Patterns

- **Test File Pattern:** Test files are named with the `.test.` infix (e.g., `UserManager.test.ts`).
- **Testing Framework:** Not explicitly detected; follow standard TypeScript testing practices.
- **Example Test File:**
  ```typescript
  // UserManager.test.ts
  import { getUserManager } from './UserManager';

  describe('getUserManager', () => {
    it('should return a valid manager', () => {
      // test implementation
    });
  });
  ```

## Commands
| Command        | Purpose                                      |
|----------------|----------------------------------------------|
| /commit        | Commit changes using conventional commits     |
| /add-module    | Add a new module following code conventions  |
```
