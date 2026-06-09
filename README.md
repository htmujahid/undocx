# Renderical

Renderical is an intelligent content generation and knowledge management platform. Unlike conventional AI tools that return a wall of text, Renderical adapts its response layout to the nature of your content — choosing the most fitting format automatically. Everything you generate can then be organized, tagged, edited with AI, and managed in a structured knowledge base.

---

## What Makes It Different

Most AI assistants return a wall of text (or sometimes an image). Renderical treats every piece of content as a structured document with the most fitting layout for that content type. It then gives you a knowledge base to store, organize, and refine everything you generate.

| Conventional AI | Renderical |
|---|---|
| Text or image only | Adaptive output formats |
| No organization | Folders, tags, collections |
| Static responses | AI-assisted inline editing |
| One-shot generation | Iterative refinement via selection |
| Ephemeral chat history | Persistent knowledge base |

---

## Core Features

### Adaptive Content Formats

The AI selects the most suitable layout for your query automatically — no prompting required. Format support is being expanded continuously.

### Knowledge Organization

- **Folder structure** — Nest content in a hierarchical folder tree
- **Tags** — Add multiple tags for cross-cutting categorization
- **Collections** — Group related content across folders
- **Search** — Full-text search across all your generated content
- **Favorites** — Pin frequently accessed content

### AI-Assisted Editing

- **Selection editing** — Highlight any portion of generated content, then prompt the AI to rewrite, expand, simplify, translate, or transform just that section
- **Format conversion** — Convert existing content to a different layout (e.g. text → table → mind map)
- **Iterative refinement** — Keep the context of a piece and continue generating or improving it
- **Version history** — Track changes to your content over time

### Learning Tools

- Auto-generate flashcard decks from any content
- Create quizzes and self-assessments from notes
- Summarize long content into key points
- Build structured study guides from raw material

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [TanStack Start](https://tanstack.com/start) (React SSR) |
| **Routing** | [TanStack Router](https://tanstack.com/router) (file-based) |
| **Data Fetching** | [TanStack Query](https://tanstack.com/query) |
| **Forms** | [TanStack Form](https://tanstack.com/form) + [Zod](https://zod.dev) |
| **Auth** | [Better Auth](https://www.better-auth.com) |
| **Database** | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team) |
| **UI Components** | [Base UI](https://base-ui.com) + [shadcn/ui](https://ui.shadcn.com) pattern |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski) |
| **Build Tool** | [Vite](https://vitejs.dev) |
| **Language** | TypeScript |

---

## Getting Started

### Prerequisites

- **Node.js** v20 or later
- **pnpm** v9 or later
- **PostgreSQL** database (local or hosted)

### Installation

```bash
# Clone the repository
git clone https://github.com/htmujahid/renderical.git
cd renderical

# Install dependencies
pnpm install
```

### Environment Setup

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

```env
# PostgreSQL connection string
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>

# Better Auth configuration
BETTER_AUTH_SECRET=your-secret-key-at-least-32-characters
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth — https://console.cloud.google.com/
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

**Google OAuth setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add `http://localhost:3000/api/auth/callback/google` to Authorized redirect URIs
4. Copy the Client ID and Client Secret into your `.env`

### Database Setup

Push the schema to your database:

```bash
pnpm db:push
```

Or use migration files:

```bash
pnpm db:generate
pnpm db:migrate
```

### Development

```bash
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
renderical/
├── src/
│   ├── components/
│   │   ├── auth/                    # Auth form components
│   │   │   ├── sign-in-form.tsx
│   │   │   ├── sign-up-form.tsx
│   │   │   ├── forgot-password-form.tsx
│   │   │   └── reset-password-form.tsx
│   │   └── ui/                      # Base UI component library (54 components)
│   ├── db/
│   │   ├── index.ts                 # Drizzle client
│   │   └── schema/
│   │       └── auth.ts              # Auth schema (user, session, account, verification)
│   ├── hooks/
│   │   └── use-mobile.ts
│   ├── lib/
│   │   ├── auth.ts                  # Better Auth server config
│   │   ├── auth-client.ts           # Better Auth client
│   │   └── utils.ts                 # cn() utility (clsx + tailwind-merge)
│   ├── routes/
│   │   ├── __root.tsx               # Root layout (HTML shell, fonts, devtools)
│   │   ├── index.tsx                # Home page  (/)
│   │   ├── auth/
│   │   │   ├── route.tsx            # Auth layout (split panel — brand + form)
│   │   │   ├── sign-in.tsx          # /auth/sign-in
│   │   │   ├── sign-up.tsx          # /auth/sign-up
│   │   │   ├── forgot-password.tsx  # /auth/forgot-password
│   │   │   └── reset-password.tsx   # /auth/reset-password?token=...
│   │   └── api/
│   │       └── auth/
│   │           └── $.ts             # Better Auth API handler (/api/auth/*)
│   ├── router.tsx                   # Router + QueryClient factory
│   ├── routeTree.gen.ts             # Auto-generated route tree (do not edit)
│   └── styles.css                   # Global styles + Tailwind v4 theme tokens
├── drizzle.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Available Scripts

```bash
pnpm dev              # Start development server on port 3000
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm typecheck        # TypeScript type checking
pnpm lint             # ESLint
pnpm format           # Prettier (formats all .ts/.tsx/.js/.jsx)

pnpm db:push          # Push schema to DB (no migration files)
pnpm db:generate      # Generate Drizzle migration files
pnpm db:migrate       # Run pending migrations
pnpm db:studio        # Open Drizzle Studio (database GUI)

pnpm ba:generate      # Regenerate Better Auth schema
```

---

## Authentication Flows

| Route | Description |
|---|---|
| `/auth/sign-in` | Email + password sign in, or Continue with Google |
| `/auth/sign-up` | New account registration, or Sign up with Google |
| `/auth/forgot-password` | Request a password reset email |
| `/auth/reset-password?token=` | Set a new password via reset token |
| `/api/auth/callback/google` | Google OAuth callback (handled by Better Auth) |
| `/api/auth/*` | Better Auth API handler (internal) |

All auth forms use **TanStack Form** with **Zod v4** schema validation and real-time field-level error display. Google OAuth uses `signIn.social({ provider: 'google' })` from the Better Auth React client.

---

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org)
4. Push and open a Pull Request

---

## License

MIT © [htmujahid](https://github.com/htmujahid)
