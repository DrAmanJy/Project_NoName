# noname

A monorepo powered by **pnpm** and **Turborepo** with TypeScript strict mode throughout.

## Applications

| App | Tech | Description |
|---|---|---|
| `apps/api` | Express + TypeScript | Backend API server |
| `apps/web` | Next.js + Tailwind CSS | Web application with SEO |
| `apps/mobile` | Expo + React Native | iOS & Android mobile app |

## Shared Packages

| Package | Description |
|---|---|
| `packages/contracts` | Zod schemas, TypeScript types, shared constants |
| `packages/api-client` | Typed API client using native `fetch()` |
| `packages/config` | Shared TypeScript, ESLint, Prettier configs |

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 11+

### Install

```bash
pnpm install
```

### Development

```bash
# Run all apps in development
pnpm dev

# Run a specific app
pnpm --filter api dev
pnpm --filter web dev
pnpm --filter mobile dev
```

### Build

```bash
pnpm build
```

### Lint & Type Check

```bash
pnpm lint
pnpm typecheck
```

### Format

```bash
pnpm format
pnpm format:check
```

## Project Structure

```text
├── apps/
│   ├── api/          # Express backend
│   ├── web/          # Next.js web app
│   └── mobile/       # Expo mobile app
│
├── packages/
│   ├── contracts/    # Shared schemas & types
│   ├── api-client/   # Typed fetch client
│   └── config/       # Shared configs
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.json
```
