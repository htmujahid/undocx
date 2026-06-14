# Undocx

Undocx is a collaborative, AI-powered document workspace. Teams create workspaces, write and organize rich Markdown documents ("artifacts"), and use an AI assistant to generate content, ask questions, and edit sections in place. Artifacts can be shared with members, organized into folders and collections, and published as read-only public links.

## Demo

<!-- Theme-aware: the dark video is used in dark mode, the light video in light mode. -->

<video width="100%" controls muted playsinline>
  <source media="(prefers-color-scheme: dark)" src="public/undocx-dark.mp4" type="video/mp4">
  <source src="public/undocx-light.mp4" type="video/mp4">
</video>

## Features

- **Workspaces & collaboration** — invite members by email with editor/viewer roles; per-artifact access control on top of workspace roles.
- **AI assistant** — generate new documents, ask Q&A grounded in your content, and insert or replace sections. Relevant artifacts are pulled in automatically via semantic (vector) search.
- **Rich editor** — Lexical-based editor with Markdown, tables, code syntax highlighting, callouts, footnotes, MathML, and inline SVG.
- **Organization** — folders, collections (tags), favorites, and an archive.
- **Sharing** — token-based email invitations and public read-only views at `/share/[artifactId]`.
- **Notifications** — activity tracking across workspaces and artifacts.
- **Auth** — email/password, Google OAuth, two-factor (TOTP), email verification, and password reset.

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling/UI:** Tailwind CSS 4, shadcn/ui, Lucide icons
- **Editor:** Lexical
- **Database:** PostgreSQL (with the `pgvector` extension) via Drizzle ORM
- **Auth:** better-auth
- **AI:** Vercel AI SDK with OpenAI (`gpt-4o-mini` for generation, `text-embedding-3-small` for embeddings)
- **Email:** Nodemailer (SMTP)
- **Data fetching:** TanStack Query
- **Package manager:** pnpm

## Getting started

### Prerequisites

- Node.js
- pnpm
- Docker (for the local Postgres + mail services)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy the example file and fill in the secrets:

```bash
cp example.env .env
```

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (matches the docker-compose Postgres service by default). |
| `BETTER_AUTH_URL` | Base URL of the app, used for auth callbacks (e.g. `http://localhost:3000`). |
| `BETTER_AUTH_SECRET` | Secret used to sign auth tokens. **Required** — generate a random value. |
| `TRUSTED_ORIGINS` | Optional comma-separated list of extra trusted origins (`BETTER_AUTH_URL` is always trusted). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials for social sign-in. |
| `OPENAI_API_KEY` | OpenAI API key for AI features. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | SMTP settings (default to the Mailpit service below). |

### 3. Start local services

This brings up PostgreSQL (with `pgvector`) and [Mailpit](https://mailpit.axllent.org/) for catching outgoing email:

```bash
docker compose up -d
```

- Postgres is exposed on `localhost:5432`.
- Mailpit's web UI is at [http://localhost:8025](http://localhost:8025) (SMTP on port `1025`).

### 4. Set up the database

Push the Drizzle schema to your database:

```bash
pnpm db:push
```

### 5. Run the dev server

```bash
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js dev server. |
| `pnpm build` | Build for production. |
| `pnpm start` | Start the production server. |
| `pnpm lint` | Run ESLint. |
| `pnpm format` | Format `.ts`/`.tsx` files with Prettier. |
| `pnpm typecheck` | Type-check with `tsc --noEmit`. |
| `pnpm ba:generate` | Regenerate the better-auth Drizzle schema (`lib/db/schema/auth-schema.ts`). |
| `pnpm db:generate` | Generate Drizzle migration files. |
| `pnpm db:migrate` | Apply migrations. |
| `pnpm db:push` | Push the schema directly to the database (recommended for local dev). |
| `pnpm db:studio` | Open Drizzle Studio to inspect the database. |

## Project structure

```
app/
  (marketing)/        Public landing, about, privacy, terms
  (auth)/             Sign-in / sign-up / sign-out
  (app)/              Protected app (workspaces, account, chat)
  api/                API routes
    assistant/        AI: generate, ask, insert, replace
    workspaces/       Artifacts, members, folders, collections, invitations
    auth/[...all]/    better-auth endpoints
  share/[artifactId]/ Public read-only artifact view
  invite/[token]/     Invitation acceptance
components/           UI (shadcn/ui), workspace, marketing, auth, account
lib/
  auth.ts             better-auth server instance
  ai/                 Prompts, embeddings, chunking, usage limits
  db/                 Drizzle client, schema/, queries/
  mail/               Nodemailer transport and email templates
  data/               TanStack Query definitions
drizzle/              Migrations and schema snapshots
docker-compose.yml    Local Postgres (pgvector) + Mailpit
```

## AI assistant

The assistant is backed by OpenAI through the Vercel AI SDK. Documents are chunked by heading, embedded with `text-embedding-3-small`, and stored as vectors so the assistant can ground its responses in relevant artifacts. Daily per-user usage limits are enforced.

| Route | Purpose |
| --- | --- |
| `POST /api/assistant` | Generate a new document (`{ title, content }`). |
| `POST /api/assistant/ask` | Q&A about an artifact (streaming response). |
| `POST /api/assistant/insert` | Insert content between sections. |
| `POST /api/assistant/replace` | Replace a section. |

## Adding UI components

This project uses [shadcn/ui](https://ui.shadcn.com/). To add a component:

```bash
npx shadcn@latest add button
```

Components are placed in the `components/ui` directory and imported like:

```tsx
import { Button } from "@/components/ui/button";
```
