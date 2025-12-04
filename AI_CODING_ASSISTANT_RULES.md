# AI Coding Assistant Rules for `advanced-quiz`

## Project Structure & Framework

- **Monorepo Architecture**: This is a Turborepo monorepo with `pnpm` as the package manager; always run commands from the root using `turbo` or navigate to specific `apps/` directories.
- **Apps Structure**: Contains three apps: `apps/api` (Go/Gin backend), `apps/web` (Next.js frontend), and `apps/docs` (documentation).
- **Shared Packages**: Shared configurations live in `packages/` (eslint-config, typescript-config, ui); prefer extending these rather than creating app‑specific configs.

### Go Backend (`apps/api`)

- **Clean Architecture**: Follow the layered structure: `domain/entities`, `domain/repositories`, `usecases`, `delivery/http`, `infrastructure`, `di` for dependency injection.
- **Gin Framework**: Use Gin for HTTP handlers; use `gin.H{}` for JSON responses and always include `errorMessage` field in responses.
- **Repository Pattern**: Define interfaces in `domain/repositories/` and implementations in `infrastructure/repositories/`.
- **Dependency Injection**: Use `uber-go/dig` container; register all dependencies in `di/container.go`.
- **DTOs**: Define request/response DTOs in `delivery/http/dto/` for handler input/output validation.
- **Naming**: Use PascalCase for exported types and methods; use descriptive names like `CollectionHandler`, `GetMyCollections`.
- **Auth Middleware**: Use Clerk integration via `middleware/clerk.go`; extract user ID with `middleware.GetUserIDFromContext`.
- **ORM**: Use GORM with PostgreSQL; define entity structs with proper GORM tags in `domain/entities/`.
- **Error Handling**: Return errors from usecases; handlers should translate errors to appropriate HTTP status codes.

### Next.js Frontend (`apps/web`)

- **Framework Version**: Uses Next.js 16 with React 19 and React Server Components (`rsc: true` in `components.json`).
- **TypeScript Strict Mode**: Strict mode is enabled; always provide proper types for props, state, and function returns.
- **Path Aliases**: Use `@/` alias for imports (e.g., `@/components/ui/button`, `@/lib/utils`, `@/features/`).
- **Component Organization**: Place feature‑specific components in `features/[feature]/components/`; shared UI components in `components/ui/`.
- **ShadCN/UI**: Use ShadCN (new‑york style, neutral base color) for UI components; install via `shadcn` CLI.
- **Styling**: Use Tailwind CSS v4 with CSS variables for theming; use `cn()` utility from `@/lib/utils` for conditional classes.
- **Client Components**: Mark client components with `"use client"` directive; prefer server components where possible.
- **Form Handling**: Use `react-hook-form` with `zod` schemas for validation; define schemas in `features/[feature]/schemas.ts`.
- **Data Fetching**: Use `swr` for client‑side data fetching and caching.
- **Icons**: Use `lucide-react` for icons; follow naming pattern like `BookOpenIcon`, `PencilIcon`.
- **Theming**: Use `next-themes` with ThemeProvider; support light/dark/system modes.
- **Auth**: Use `@clerk/nextjs` for authentication; wrap app in ClerkProvider.
- **Typography**: Use Geist font family (Geist Sans and Geist Mono).

### Code Style Patterns

- **React Components**: Use function components with explicit prop interfaces; destructure props in function signature.
- **State Management**: Use React hooks (`useState`, `useEffect`); avoid unnecessary state by computing values.
- **Naming Conventions**: Use PascalCase for components and types; camelCase for functions and variables; kebab-case for file names.
- **Export Pattern**: Use named exports for components; default exports only for pages.
- **Dialog Pattern**: Create separate dialog components (e.g., `EditCollectionDialog`, `DeleteCollectionDialog`) with controlled open state.

### Development Workflow

- **Dev Server**: Run `pnpm dev` from root to start all apps; API runs on `:3005`, web on `:3000`.
- **Hot Reload**: Go backend uses `air` for hot reloading; Next.js has built‑in HMR.
- **Environment Variables**: Store in `.env` files; use `NEXT_PUBLIC_` prefix for client‑exposed vars.
- **API URL**: Backend API base URL is configured via `NEXT_PUBLIC_API_BASE_URL` env var.

---
