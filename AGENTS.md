# Monorepo Development Rules

## 1. Project Overview

This is a pnpm + Turborepo monorepo containing:

```text
apps/
├── api/       # Node.js + Express backend
├── web/       # Next.js web application
└── mobile/    # Expo + React Native application

packages/
├── contracts/ # Shared schemas, types and API contracts
├── api-client/# Shared API client
└── config/    # Shared development configuration
```

The project has two developers:

* Developer 1: primarily responsible for the Next.js web application.
* Developer 2: responsible for backend, mobile, shared packages, infrastructure, and overall architecture.

The web developer must be able to work independently without modifying backend or mobile architecture unnecessarily.

---

# 2. Golden Rule

Before changing code, determine which application or package the change belongs to.

Use this rule:

```text
Only used by one application
        ↓
Keep it inside that application.

Used by multiple applications
        ↓
Consider packages/.

Platform-independent business contract
        ↓
packages/contracts

Reusable API communication
        ↓
packages/api-client

Shared development configuration
        ↓
packages/config
```

Do NOT move code into `packages/` just because it looks reusable.

Only create shared code when there is a real or clearly planned cross-application need.

---

# 3. Application Ownership

## `apps/web`

The web developer primarily works here.

Web-specific code must remain inside:

```text
apps/web/
```

Examples:

```text
React components
Next.js pages
Next.js layouts
SEO metadata
Server Components
Client Components
Web-specific hooks
Web-specific UI
Web-specific form components
Web-specific styles
```

Do not move these into `packages/`.

---

## `apps/api`

Backend-specific code belongs here.

Examples:

```text
Express routes
controllers
MongoDB models
Mongoose queries
authentication implementation
authorization
database services
R2 services
backend middleware
background jobs
backend business logic
```

Do not import backend implementation into the web or mobile applications.

---

## `apps/mobile`

Mobile-specific code belongs here.

Examples:

```text
React Native components
Expo Router
mobile navigation
camera/video picker
SecureStore
push notifications
mobile-specific hooks
mobile-specific UI
```

Do not move React Native UI into `packages/`.

Do not share React DOM components with React Native.

---

# 4. When to Use `packages/`

The `packages/` directory is for code that can safely be shared between applications.

### Good examples

```text
packages/contracts/
```

```ts
export const VideoStatusSchema = z.enum([
  "UPLOADING",
  "PROCESSING",
  "UNDER_REVIEW",
  "SELECTED",
  "REJECTED",
  "PAID",
]);
```

This can be used by:

```text
API
Web
Mobile
```

Therefore it belongs in `packages/contracts`.

Other examples:

```text
User types
Video types
Earning types
API request schemas
API response schemas
shared enums
pagination schemas
common validation schemas
```

---

# 5. Do NOT Put Everything in `packages/`

Do NOT create shared packages for every reusable function.

For example, this:

```text
packages/utils/
```

should NOT be created just because two files happen to use the same helper.

First ask:

> Is this genuinely shared application-level code?

If the answer is no, keep it local.

Avoid creating:

```text
packages/web-ui/
packages/mobile-ui/
packages/helpers/
packages/common/
packages/utils/
packages/services/
```

unless there is a clear architectural reason.

---

# 6. Dependency Direction

The dependency graph should remain:

```text
                    packages/contracts
                           ▲
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             │             │             │
            API           WEB          MOBILE
             │             │             │
             │             │             │
             └─────────────┴─────────────┘
                           │
                    packages/api-client
```

More specifically:

```text
apps/api
  └── @repo/contracts

apps/web
  ├── @repo/contracts
  └── @repo/api-client

apps/mobile
  ├── @repo/contracts
  └── @repo/api-client
```

Never create these dependencies:

```text
web → mobile
mobile → web
api → web
api → mobile
```

An application must never import source files directly from another application.

Bad:

```ts
import { Something } from "../../mobile/src/...";
```

Bad:

```ts
import { Something } from "../api/src/...";
```

---

# 7. Shared Contracts Are the Source of Truth

If the API, web, and mobile need to agree on something, define it in:

```text
packages/contracts
```

For example:

```text
VideoStatus
UserRole
UploadStatus
PaymentStatus
API request schemas
API response schemas
```

Do not redefine the same type independently.

Bad:

```text
apps/api/src/types/video.ts
apps/web/src/types/video.ts
apps/mobile/src/types/video.ts
```

if all three represent the same API concept.

Instead:

```text
packages/contracts/src/videos.ts
```

Then import it.

---

# 8. Zod Rules

Use Zod for shared validation contracts.

Example:

```ts
export const CreateVideoSchema = z.object({
  country: z.string().min(2),
  ...
});
```

Infer the TypeScript type:

```ts
export type CreateVideoInput = z.infer<typeof CreateVideoSchema>;
```

Do not create separate TypeScript interfaces when the type can safely be inferred from the Zod schema.

Avoid:

```ts
interface CreateVideoInput {
  ...
}

const CreateVideoSchema = z.object({
  ...
});
```

unless there is a specific reason they must differ.

---

# 9. Backend Validation

The backend is the final authority for security and data validation.

Never trust:

```text
Web
Mobile
Client-provided values
```

The API must validate all incoming data.

Shared Zod schemas can be used by the API, but backend authorization and security checks must remain inside:

```text
apps/api
```

---

# 10. Web Developer Rules

The web developer should normally modify only:

```text
apps/web
```

and, when necessary:

```text
packages/contracts
packages/api-client
```

Before modifying:

```text
apps/api
apps/mobile
```

discuss the change with the backend/mobile owner.

If a web feature requires a new API endpoint:

1. Do not implement the endpoint yourself unless explicitly assigned.
2. Define the required API contract.
3. Coordinate with the backend owner.
4. Add shared schemas/types to `packages/contracts` when appropriate.
5. Consume the API through `packages/api-client`.

---

# 11. API Client Rule

Web and mobile should communicate with the backend through:

```text
@repo/api-client
```

Do not create separate incompatible API implementations.

Do not duplicate API types.

Example:

```ts
import { videosApi } from "@repo/api-client";
```

The API client should use native `fetch()`.

Do not introduce Axios unless explicitly approved.

---

# 12. UI Sharing Rule

Do not attempt to share UI components between Next.js and React Native.

This is allowed:

```text
packages/contracts
packages/api-client
```

This is NOT allowed:

```text
packages/components/Button.tsx
```

if it attempts to be both:

```text
React DOM
React Native
```

Web UI belongs to:

```text
apps/web/components
```

Mobile UI belongs to:

```text
apps/mobile/components
```

---

# 13. Adding a New Dependency

Before installing a package, ask:

1. Do we actually need it?
2. Is the functionality already available?
3. Is there a smaller alternative?
4. Does it significantly increase the mobile bundle?
5. Does it introduce unnecessary platform-specific dependencies?
6. Does it belong at the workspace level or application level?

Do not install packages just because an AI coding assistant recommends them.

Never install:

```text
Redux
Axios
large UI frameworks
large video-processing libraries
```

without explicit architectural approval.

---

# 14. Mobile Size Requirement

The mobile application is intended to remain lightweight.

Target:

```text
< 50 MB
```

Avoid adding:

* large native libraries
* unnecessary fonts
* large images
* bundled videos
* FFmpeg
* unnecessary animation libraries
* large UI frameworks

Before adding a dependency to `apps/mobile`, consider its impact on:

```text
APK/AAB
iOS build
startup time
memory
native dependencies
```

---

# 15. Video Upload Architecture

Videos must NOT normally pass through the Express API server.

The intended architecture is:

```text
Mobile/Web
     │
     │ request upload URL
     ▼
Express API
     │
     │ presigned URL
     ▼
Client
     │
     │ direct upload
     ▼
Cloudflare R2
```

Do not implement:

```text
Client
   ↓
Express
   ↓
R2
```

for large video uploads unless explicitly required.

---

# 16. Authentication

Authentication implementation belongs to:

```text
apps/api
```

Client applications should consume authentication through the API contract.

Do not duplicate authentication logic between web and mobile.

Web and mobile may have different token storage mechanisms because they are different platforms.

For example:

```text
Web
→ secure HTTP-only cookies where appropriate

Mobile
→ Expo SecureStore
```

The authentication protocol remains defined by the backend.

---

# 17. Environment Variables

Never commit secrets.

Use:

```text
.env.example
```

for documenting required variables.

Never commit:

```text
.env
.env.local
production secrets
API keys
private keys
database credentials
R2 credentials
JWT secrets
```

If a variable is required by multiple applications, document it clearly, but do not automatically expose backend secrets to web/mobile.

---

# 18. Git Rules

Keep commits focused.

Good:

```text
feat(web): add video history page
fix(api): validate video upload status
feat(mobile): add video picker
feat(contracts): add video status schema
```

Avoid:

```text
update stuff
fix things
changes
AI changes
```

Do not mix unrelated changes in one commit.

---

# 19. Pull Request Rules

Before opening a PR:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Fix all errors.

A PR should explain:

```text
What changed?
Why was it changed?
Which apps/packages changed?
Are there API contract changes?
Are there database changes?
```

If the change affects:

```text
packages/contracts
```

clearly mention it in the PR.

---

# 20. AI Coding Assistant Rules

AI coding assistants must follow the existing architecture.

Before making changes:

1. Inspect the relevant application.
2. Read the nearest `AGENTS.md`.
3. Inspect existing patterns.
4. Reuse existing utilities.
5. Check whether a shared contract already exists.
6. Do not create duplicate types.
7. Do not install dependencies without a reason.
8. Do not move code between applications without justification.
9. Do not refactor unrelated code.
10. Do not modify architecture simply because another pattern is more popular.

### Important

The AI must **not assume that a new package, framework, library, abstraction, or architecture is required**.

Prefer the existing project patterns.

If the requested feature conflicts with the architecture, explain the conflict before making a large architectural change.

---

# 21. No Unrequested Refactoring

When implementing a feature:

```text
Change only what is necessary.
```

Do not simultaneously:

* rename unrelated files
* rewrite existing modules
* change database architecture
* replace libraries
* change authentication
* change API conventions
* restructure the monorepo

unless explicitly requested.

---

# 22. TypeScript Rules

Use strict TypeScript.

Never use:

```ts
any
```

Prefer:

```ts
unknown
```

with proper narrowing when the type is genuinely unknown.

Do not silence errors using:

```ts
// @ts-ignore
// @ts-expect-error
```

unless there is a documented and unavoidable reason.

Avoid excessive type assertions:

```ts
value as SomeType
```

Prefer runtime validation and proper typing.

---

# 23. Performance Rules

Do not optimize prematurely, but avoid obvious performance problems.

### Web

Prefer:

```text
Server Components
server-side data fetching
streaming where useful
lazy loading
small client components
```

Avoid making entire pages client-side unnecessarily.

### API

Avoid:

```text
N+1 database queries
unnecessary database calls
large API responses
loading entire collections unnecessarily
```

Use pagination for potentially large collections.

### Mobile

Avoid:

```text
large dependencies
large bundled assets
unnecessary re-renders
loading entire video lists
```

Use pagination and lazy loading.

---

# 24. File Upload Rules

Never store uploaded videos inside:

```text
apps/api/uploads/
apps/web/public/videos/
apps/mobile/assets/
```

Videos belong in object storage.

The backend stores metadata and references.

The client receives appropriate upload/download URLs.

---

# 25. Database Rules

Database models and database access belong exclusively to:

```text
apps/api
```

Never access MongoDB directly from:

```text
apps/web
apps/mobile
packages/
```

The architecture must remain:

```text
Web/Mobile
      ↓
     API
      ↓
   MongoDB
```

---

# 26. Strict AI Compliance Rules

AI coding assistants MUST strictly follow these rules without exception:

### 1. Structural Integrity
Do NOT create files, folders, or packages outside the established monorepo structure. You must work within the exact boundaries of the existing applications and packages. Never invent new structural paradigms.

### 2. Strict ESLint and TypeScript Adherence
- **Never bypass errors:** Fix the actual underlying code error rather than suppressing it.
- **Never modify configuration to bypass errors:** Do NOT change `eslint.config.mjs`, `tsconfig.json`, or any other configuration file simply to make a lint or type error go away.
- **No ignore comments:** NEVER use `// @ts-ignore`, `// @ts-expect-error`, `// eslint-disable-next-line`, or `/* eslint-disable */` to bypass errors. 

### 3. Zod Schemas and Shared Types
ALL Zod schemas and their inferred or reusable TypeScript types MUST be placed in `packages/contracts`. Do not duplicate schemas or types within individual applications (`apps/web`, `apps/api`, `apps/mobile`). Always import them from `@repo/contracts`.

---

# 27. Final Rule

When unsure where code belongs, use this decision:

```text
Is it UI?
    ↓
Application

Is it platform-specific?
    ↓
Application

Is it backend-only?
    ↓
apps/api

Is it Next.js-only?
    ↓
apps/web

Is it React Native/Expo-only?
    ↓
apps/mobile

Is it a shared API contract?
    ↓
packages/contracts

Is it shared API communication?
    ↓
packages/api-client

Is it shared development configuration?
    ↓
packages/config
```

**Keep the monorepo simple.**

The goal is not to maximize code sharing.

The goal is to share the **right things** while keeping each application independent and easy to develop.
