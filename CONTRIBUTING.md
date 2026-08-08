# Contributing Guidelines

These rules apply to every developer and every AI coding assistant working in this repository.

The goal is to keep the monorepo stable, prevent conflicting changes, and make every change easy to review.

---

## 1. Branching & Pull Requests

### Never Push Directly to Protected Branches

Never push directly to:

```text
main
dev
```

All changes must be made on a feature or fix branch.

Examples:

```text
feature/web-video-list
feature/web-login
fix/web-video-status
fix/api-upload
chore/update-dependencies
```

Create your branch from the latest `dev` branch unless otherwise instructed.

```bash
git checkout dev
git pull
git checkout -b feature/your-feature
```

### Pull Requests Are Required

Every change must be submitted through a Pull Request.

Do not merge your own PR unless explicitly allowed by the project owner.

A PR should:

* Have a clear title.
* Explain what was changed.
* Explain why it was changed.
* Identify affected apps/packages.
* Mention any API or contract changes.
* Pass all required checks.

---

## 2. Work Within Your Assigned Area

Each developer should primarily work within their assigned application or package.

Current ownership:

```text
Web Developer
└── apps/web

Project Owner
├── apps/api
├── apps/mobile
├── packages/
└── infrastructure / architecture
```

The web developer may modify:

```text
apps/web
packages/contracts
packages/api-client
```

when required for a web feature.

However, changes to:

```text
apps/api
apps/mobile
```

should not be made unless explicitly assigned or coordinated with the project owner.

### Do Not Modify Another Application Just to Make Your Feature Work

If your feature requires a backend change:

1. Explain what API change is required.
2. Coordinate with the backend owner.
3. Define/update the shared contract if necessary.
4. Let the backend owner implement the backend change unless assigned otherwise.

Do not independently modify unrelated applications.

---

# 3. Shared Packages

The `packages/` directory contains code intended to be shared between applications.

Use:

```text
packages/contracts
```

for shared:

* Zod schemas
* API request/response types
* shared enums
* shared validation contracts
* shared domain types

Use:

```text
packages/api-client
```

for:

* shared API communication
* typed API functions
* request/response handling

Use:

```text
packages/config
```

for:

* TypeScript configuration
* ESLint configuration
* Prettier configuration
* other shared development configuration

### Do Not Put Application-Specific Code in `packages/`

For example, do not move a web-only component into `packages/` simply because it is reusable.

Keep:

```text
Web UI
→ apps/web

Mobile UI
→ apps/mobile

Backend logic
→ apps/api
```

Only share code when there is a real cross-application requirement.

---

# 4. Do Not Create Duplicate Types

If a type or validation schema is shared by multiple applications, check:

```text
packages/contracts
```

before creating a new one.

Do not create duplicate definitions such as:

```text
apps/api/src/types/video.ts
apps/web/src/types/video.ts
apps/mobile/src/types/video.ts
```

when they represent the same API/domain concept.

Instead, create the shared contract once:

```text
packages/contracts/src/videos.ts
```

and import it where required.

---

# 5. API Changes Require Coordination

API changes affect multiple applications.

Before changing:

```text
API endpoints
request bodies
response structures
authentication
authorization
error formats
pagination
shared enums
```

check whether the change affects:

```text
web
mobile
packages/contracts
packages/api-client
```

If it does, coordinate the change before implementation.

Do not silently change an existing API contract.

Breaking API changes require explicit approval.

---

# 6. Commit Rules

### Keep Commits Focused

Each commit should represent one logical change.

Good:

```text
feat(web): add video history page
feat(contracts): add video status schema
fix(web): handle rejected video status
chore: update dependencies
```

Avoid:

```text
update stuff
fix things
changes
final
AI changes
```

### Do Not Create Artificial Commit History

Do not create multiple meaningless commits simply to increase the number of commits.

Use multiple commits when they represent meaningful stages of work.

For example:

```text
feat(web): add video page structure
feat(web): add video API integration
fix(web): handle loading state
test(web): add video page tests
```

is preferable to one huge commit.

---

# 7. Pull Request Scope

A PR should solve one clear problem or feature.

Avoid mixing unrelated work.

Do not submit a PR containing:

```text
new feature
dependency upgrades
unrelated refactoring
formatting entire project
renaming unrelated files
architecture changes
```

unless those changes are directly required.

### Keep PRs Reviewable

Prefer several small PRs over one very large PR.

A reviewer should be able to understand:

```text
What changed?
Why?
What could break?
How was it tested?
```

without reviewing thousands of unrelated lines.

---

# 8. AI Coding Assistant Rules

AI coding tools are allowed and encouraged, but the developer is responsible for all generated code.

Before asking an AI coding assistant to modify the repository, it must:

1. Read `AGENTS.md`.
2. Read the relevant project documentation.
3. Inspect existing code patterns.
4. Check whether an existing utility or component can be reused.
5. Check `packages/contracts` before creating shared types.
6. Check `packages/api-client` before creating API communication code.

### AI Must Not

The AI must not independently:

* change the monorepo architecture
* introduce a new framework
* replace an existing library
* install unnecessary dependencies
* create new shared packages without justification
* duplicate shared types
* modify another application unnecessarily
* change API contracts without coordination
* refactor unrelated code
* delete existing functionality
* modify authentication/security architecture

If an architectural change appears necessary, stop and ask for approval.

### Developer Responsibility

AI-generated code must be reviewed by the developer before committing.

Do not commit code that you do not understand.

---

# 9. Adding Dependencies

Before installing a new dependency, verify:

1. The functionality is actually required.
2. The repository does not already provide the functionality.
3. The package is actively maintained.
4. The package does not introduce unnecessary complexity.
5. The package is appropriate for the target application.
6. The package does not unnecessarily increase the mobile application size.

Do not add a dependency simply because an AI assistant recommends it.

For significant dependencies, discuss them before adding them.

---

# 10. No Unrequested Refactoring

When implementing a feature, modify only what is necessary.

Do not use a feature request as an excuse to:

* rewrite existing modules
* rename unrelated files
* restructure the monorepo
* replace libraries
* change authentication
* change database architecture
* change API conventions
* reformat unrelated files

If refactoring is genuinely required, explain why it is necessary in the PR.

---

# 11. Pre-Push Verification

Before pushing a branch or opening a Pull Request, run the complete verification suite from the repository root:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Also run all applicable tests.

At minimum, verify:

### TypeScript

```bash
pnpm typecheck
```

There must be no TypeScript errors.

### Lint

```bash
pnpm lint
```

There must be no new ESLint errors.

### Build

```bash
pnpm build
```

All affected applications/packages must build successfully.

### Tests

Run all tests relevant to the changes.

If tests fail, do not open a PR claiming the change is ready.

---

# 12. Do Not Hide Errors

Do not bypass verification using:

```text
@ts-ignore
eslint-disable
any
empty catch blocks
ignored build errors
```

unless there is a documented and approved reason.

Never modify configuration simply to make a failing check pass.

Fix the underlying problem.

---

# 13. PR Checklist

Before opening a PR, verify:

```text
[ ] Branch is based on the correct branch
[ ] No direct push to main/dev
[ ] Changes are within the assigned scope
[ ] No unrelated refactoring
[ ] No unnecessary dependencies
[ ] Shared code is in the correct package
[ ] No duplicate shared types
[ ] API changes are coordinated
[ ] pnpm typecheck passes
[ ] pnpm lint passes
[ ] pnpm build passes
[ ] Applicable tests pass
[ ] Developer has reviewed all AI-generated code
[ ] PR description explains the change
```

---

# 14. Protected Branches

The following branches represent shared project state:

```text
main
dev
```

Treat them as protected branches.

### `dev`

Contains the latest integrated development work.

Feature branches should normally be created from `dev`.

### `main`

Contains production-ready code.

Only reviewed and approved changes should reach `main`.

---

# 15. Emergency Changes

If an urgent production fix is required, follow the project's emergency process rather than bypassing review.

Do not use an emergency situation as a reason to permanently ignore the branching and PR rules.

---

# 16. General Principle

When making a change, always prefer:

```text
Small change
    ↓
Existing pattern
    ↓
Existing dependency
    ↓
Existing package
    ↓
Shared package only when genuinely required
```

Avoid:

```text
New dependency
    ↓
New abstraction
    ↓
New package
    ↓
Large refactor
```

The repository should remain **simple, predictable, maintainable, and easy for another developer to understand**.
