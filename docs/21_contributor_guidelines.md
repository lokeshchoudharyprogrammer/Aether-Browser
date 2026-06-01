# Contributor Guidelines and Developer Workflows

## 1. Coding Standards and Style Guides

To maintain consistency across our TypeScript and Rust modules, all contributions must pass our local linting and formatting validation suites:

- **TypeScript Formatting**: Prettier is configured to enforce semi-colons, single quotes, and a print width of 100 characters.
- **ESLint Configuration**: ESLint rules are strictly set to block unused imports, enforce proper hook dependencies in React, and block unsafe references.
- **TypeScript Strictness**: `tsconfig.json` requires:
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true,
      "noUnusedLocals": true
    }
  }
  ```

---

## 2. Testing Requirements & Coverage Thresholds

No pull request will be merged without passing automated test checks.

- **Unit Testing (Vitest)**: Used to test helper functions, state management, and main process service engines (e.g., adblocker matching). Minimum coverage target is **85%**.
- **E2E Testing (Playwright + Electron)**: Validates window creation, IPC message routes, database read/writes, and profile switching sequences.
- **Running Tests Locally**:
  ```bash
  npm run test:unit       # Execute unit tests
  npm run test:e2e        # Launch Playwright E2E runners
  npm run test:coverage   # Generate coverage reports
  ```

---

## 3. Git Branching and Conventional Commits

We structure code changes using a subset of the Conventional Commits specification.

- **Branching Naming Model**:
  - `feature/` - Add new functionality (e.g. `feature/vertical-tabs`).
  - `bugfix/` - Fix bugs (e.g. `bugfix/profile-key-leak`).
  - `docs/` - Edit manuals or diagrams.
  - `release/` - Prepare for release cycles.

- **Commit Message Schema**: `<type>(<scope>): <short description>`
  - `feat(adblock): compile easy-list to binary trie`
  - `fix(ipc): solve profile window lock freeze`
  - `docs(security): outline CSP changes`

---

## 4. Pull Request Submission Template

When submitting a Pull Request (PR), authors must populate the following checklist in the PR body:

```markdown
## Description

<!-- Provide a clear summary of the changes and the rationale behind them. -->

## Associated Issue

Closes #<!-- Issue Number -->

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)

## Checklist:

- [ ] My code follows the code style of this project (`npm run lint` passes).
- [ ] I have added unit or E2E tests that verify my additions.
- [ ] All new and existing tests passed (`npm run test` passes).
- [ ] I have updated the documentation accordingly.
```
