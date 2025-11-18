# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Undocx is a **Google Docs-like realtime collaborative rich text editor** built with Next.js 16 (App Router), Lexical.dev, Supabase Realtime, and shadcn UI. The application provides a fully-featured document editing experience with real-time collaboration, advanced formatting, tables, images, and comments. The project includes two editor implementations: a basic markdown editor at `/editor-md` and a full-featured collaborative rich text editor at `/editor` with real-time synchronization powered by Supabase.

## Development Commands

### Running the Application

```bash
npm run dev          # Start Next.js development server on http://localhost:3000
npm run build        # Build production bundle
npm start            # Start production server
npm run lint         # Run ESLint
```

### Supabase Local Development

```bash
npm run supabase     # Access Supabase CLI
```

**Important Supabase Ports (Local Development):**

- API: `http://127.0.0.1:54321`
- Studio: `http://127.0.0.1:54323`
- Database: `localhost:54322`
- Inbucket (Email testing): `http://127.0.0.1:54324`

Environment variables required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`

## Architecture

### Tech Stack

- **Frontend Framework**: Next.js 16 (App Router) with React
- **Rich Text Editor**: Lexical.dev - Extensible text editor framework
- **UI Components**: shadcn UI (Radix UI primitives + Tailwind CSS)
- **Backend & Realtime**: Supabase (Authentication, Realtime Database, Storage)
- **Styling**: Tailwind CSS with CSS variables for theming
- **TypeScript**: Full type safety across the application

### Authentication & Middleware

The app uses a custom middleware pattern with Supabase SSR:

1. **Middleware Proxy Pattern**: Instead of a traditional `middleware.ts`, this project uses `proxy.ts` with the same export config. The middleware refreshes Supabase sessions and redirects unauthenticated users to `/auth/login`.

2. **Supabase Client Patterns**:
   - **Server Components**: Use `lib/supabase/server.ts` - creates a new client per request (required for Fluid compute)
   - **Client Components**: Use `lib/supabase/client.ts`
   - **Middleware**: Uses inline `createServerClient` in `lib/supabase/middleware.ts`

**CRITICAL**: When working with Supabase server client:

- Never store the client in a global variable
- Always create a new client within each function
- Do not run code between `createServerClient` and `supabase.auth.getClaims()` as this can cause random logouts

### Editor Architecture (Lexical)

The rich text editor (`/editor`) is built with a plugin-based architecture using Lexical. **All Lexical editor-related components are organized under `components/editor/`** in a structured, modular way.

**Core Editor Wrapper:**

- `components/blocks/editor-x/editor.tsx` - Main editor wrapper (LexicalComposer)
- `components/blocks/editor-x/editor-header.tsx` - Editor header with document actions
- `components/blocks/editor-x/plugins.tsx` - Plugin orchestration and layout
- `components/blocks/editor-x/nodes.ts` - Custom node registrations

**Editor Directory Structure (`components/editor/`):**

```
components/editor/
├── context/              # Shared state management
│   └── toolbar-context.tsx    - ToolbarContext for plugin communication
├── editor-hooks/         # Custom React hooks
│   ├── use-debounce.ts        - Debouncing utility
│   ├── use-modal.tsx          - Modal state management
│   └── use-update-toolbar.ts  - Toolbar state updates
├── editor-ui/            # Reusable UI components
│   ├── code-button.tsx        - Code language selector
│   ├── color-picker.tsx       - Color selection UI
│   ├── content-editable.tsx   - Editable content wrapper
│   ├── image-component.tsx    - Image display component
│   └── image-resizer.tsx      - Image resize handles
├── nodes/                # Custom Lexical nodes
│   └── image-node.tsx         - Image node implementation
├── plugins/              # Lexical plugins (core functionality)
│   ├── toolbar/              - Top toolbar plugins
│   │   ├── toolbar-plugin.tsx              - Main toolbar container
│   │   ├── block-format-toolbar-plugin.tsx - Block type dropdown
│   │   ├── font-format-toolbar-plugin.tsx  - Bold, italic, etc.
│   │   ├── font-family-toolbar-plugin.tsx  - Font selection
│   │   ├── font-size-toolbar-plugin.tsx    - Font size picker
│   │   ├── font-color-toolbar-plugin.tsx   - Text color
│   │   ├── font-background-toolbar-plugin.tsx - Highlight color
│   │   ├── element-format-toolbar-plugin.tsx  - Alignment
│   │   ├── link-toolbar-plugin.tsx         - Link insertion
│   │   ├── image-toolbar-plugin.tsx        - Image insertion
│   │   ├── table-toolbar-plugin.tsx        - Table insertion
│   │   ├── horizontal-rule-toolbar-plugin.tsx - HR insertion
│   │   ├── code-language-toolbar-plugin.tsx   - Code block language
│   │   ├── block-insert-plugin.tsx         - Insert dropdown
│   │   └── history-toolbar-plugin.tsx      - Undo/redo
│   ├── picker/               - Slash command menu items
│   │   ├── component-picker-option.tsx     - Base picker option
│   │   ├── paragraph-picker-plugin.tsx     - Convert to paragraph
│   │   ├── heading-picker-plugin.tsx       - Insert headings
│   │   ├── bulleted-list-picker-plugin.tsx - Bulleted lists
│   │   ├── numbered-list-picker-plugin.tsx - Numbered lists
│   │   ├── check-list-picker-plugin.tsx    - Todo/check lists
│   │   ├── quote-picker-plugin.tsx         - Block quotes
│   │   ├── code-picker-plugin.tsx          - Code blocks
│   │   ├── table-picker-plugin.tsx         - Tables
│   │   ├── image-picker-plugin.tsx         - Images
│   │   ├── divider-picker-plugin.tsx       - Horizontal rules
│   │   ├── columns-layout-picker-plugin.tsx - Column layouts
│   │   ├── alignment-picker-plugin.tsx     - Text alignment
│   │   └── embeds-picker-plugin.tsx        - Embeds (YouTube, etc.)
│   ├── actions/              - Editor actions and utilities
│   │   ├── actions-plugin.tsx             - Action handlers
│   │   ├── counter-character-plugin.tsx   - Character counter
│   │   └── markdown-toggle-plugin.tsx     - Markdown mode toggle
│   ├── sidebar/              - Sidebar plugins (TOC, Comments)
│   ├── auto-link-plugin.tsx              - Automatic link detection
│   ├── code-action-menu-plugin.tsx       - Code block actions
│   ├── code-highlight-plugin.tsx         - Syntax highlighting
│   ├── component-picker-menu-plugin.tsx  - Slash command menu
│   ├── draggable-block-plugin.tsx        - Drag & drop blocks
│   ├── floating-link-editor-plugin.tsx   - Link edit popover
│   ├── floating-text-format-plugin.tsx   - Text selection toolbar
│   ├── images-plugin.tsx                 - Image handling
│   ├── link-plugin.tsx                   - Link functionality
│   ├── list-max-indent-level-plugin.tsx  - List indent limits
│   └── table-plugin.tsx                  - Table functionality
├── shared/               # Shared utilities
│   ├── can-use-dom.ts         - DOM availability check
│   └── invariant.ts           - Runtime assertions
├── themes/               # Editor styling
│   ├── editor-theme.css       - Theme styles
│   └── editor-theme.ts        - Theme configuration
├── transformers/         # Markdown transformers
│   ├── markdown-hr-transformer.ts     - Horizontal rule transform
│   ├── markdown-image-transformer.ts  - Image markdown transform
│   └── markdown-table-transformer.ts  - Table markdown transform
└── utils/                # Utility functions
    ├── get-dom-range-rect.ts                        - DOM range calculations
    ├── get-selected-node.ts                         - Selection utilities
    ├── set-floating-elem-position.ts                - Floating UI positioning
    ├── set-floating-elem-position-for-link-editor.ts - Link editor positioning
    └── url.ts                                        - URL validation/sanitization
```

**Plugin Categories:**

1. **Toolbar Plugins** - Top toolbar actions for formatting, history, and insert operations
2. **Picker Plugins** - Slash command menu items (triggered by typing `/`)
3. **Floating Plugins** - Context-aware UI (link editor, text selection toolbar, code actions)
4. **Core Functionality Plugins** - Auto-linking, draggable blocks, markdown shortcuts, images, tables
5. **Sidebar Plugins** - Table of Contents and Comments (under development)

**Editor Context:**

- `ToolbarContext` (in `components/editor/context/toolbar-context.tsx`) provides shared state across toolbar plugins
- `EditorContext` (in `components/editor/context/editor-context.tsx`) provides document and user data to all editor components
  - Provides: `document` (Tables<'documents'>) and `user` (User from Supabase)
  - Usage: Wrap editor components with `<EditorProvider document={document} user={user}>`
  - Hook: `useEditorContext()` - Access document and user data from any child component
- Plugins communicate via Lexical commands and the shared context

**Layout Structure:**
The editor uses a Google Docs-inspired three-pane layout with sidebars:

- Left sidebar: Table of Contents (TocSidebar) for document navigation
- Center: Editor content (SidebarInset) with real-time collaborative editing
- Right sidebar: Comments (CommentSidebar) for threaded discussions

**Realtime Collaboration:**

- Built on Supabase Realtime for synchronized document editing
- Multiple users can edit the same document simultaneously
- Real-time cursor presence and selection tracking
- Collaborative commenting system

**Markdown Support:**

- Custom transformers in `components/editor/transformers/*` for horizontal rules, images, and tables
- Uses `@lexical/markdown` for standard markdown shortcuts

### UI Components

Built with Radix UI primitives and styled with Tailwind CSS. All UI components are in `components/ui/*` following the shadcn/ui pattern.

**Key utilities:**

- `lib/utils.ts` - Contains `cn()` utility for className merging
- `lib/compose-refs.ts` - React ref composition helper

**Toast Notifications:**

- Uses `sonner` for toast notifications
- `<Toaster />` component is added in `app/layout.tsx`
- Usage: `import { toast } from "sonner"` then call `toast.success()`, `toast.error()`, `toast.info()`, etc.

### Route Structure

```
/                    - Landing page
/auth/login          - Login page
/auth/sign-up        - Registration
/auth/forgot-password - Password reset
/auth/update-password - Password update
/editor              - Full-featured Lexical editor
/editor-md           - Markdown editor variant
```

**Authentication Flow:**

- Unauthenticated users accessing protected routes are redirected to `/auth/login`
- Auth routes (`/auth/*`) and `/login` are accessible without authentication
- Middleware handles session refresh on every request

### TypeScript Configuration

- Path alias: `@/*` maps to project root
- Target: ES2017
- Strict mode enabled
- JSX: react-jsx (new transform)

## Development Guidelines

### Adding New Editor Plugins

1. **Toolbar Plugins**: Create in `components/editor/plugins/toolbar/` and add to the toolbar section in `plugins.tsx`
2. **Slash Commands**: Create in `components/editor/plugins/picker/` and register in the `ComponentPickerMenuPlugin` baseOptions array
3. **Custom Nodes**: Register in `components/blocks/editor-x/nodes.ts`

### Database Schema

The project uses Supabase PostgreSQL with the following tables:

**documents** table:

- `id` (uuid, primary key) - Auto-generated document ID
- `user_id` (uuid, foreign key to auth.users) - Owner of the document
- `title` (text) - Document title (default: 'Untitled Document')
- `content` (jsonb) - Lexical editor state in JSON format
- `created_at` (timestamptz) - Creation timestamp
- `updated_at` (timestamptz) - Last update timestamp (auto-updated via trigger)

**Row Level Security (RLS):**

- Users can only view, insert, update, and delete their own documents
- RLS policies enforce `auth.uid() = user_id` for all operations

**Indexes:**

- `documents_user_id_idx` - Fast queries by user
- `documents_created_at_idx` - Fast sorting by creation date

**Triggers:**

- `set_updated_at` - Automatically updates `updated_at` on document changes

**Migration:** `supabase/migrations/20251116061119_documents.sql`

**comments** table:

- `id` (uuid, primary key) - Auto-generated comment ID
- `document_id` (uuid, foreign key to documents) - Parent document
- `user_id` (uuid, foreign key to auth.users) - Comment author
- `parent_comment_id` (uuid, nullable, foreign key to comments) - Parent comment for replies (single-level nesting only)
- `content` (text) - Comment text content
- `quote_text` (text, nullable) - Quoted text from document
- `position` (jsonb, nullable) - Position metadata for inline comments
- `is_resolved` (boolean) - Resolution status (default: false)
- `created_at` (timestamptz) - Creation timestamp
- `updated_at` (timestamptz) - Last update timestamp (auto-updated via trigger)

**Single-Level Nesting Constraint:**

- Comments can have replies (parent_comment_id IS NOT NULL)
- Replies CANNOT have replies (enforced by database constraint)
- This prevents deeply nested comment threads

**Row Level Security (RLS):**

- Users can only view comments on documents they own
- Users can create comments on their own documents
- Users can update/delete their own comments
- Resolving comments is handled by the update policy

**Indexes:**

- `comments_document_id_idx` - Fast queries by document
- `comments_user_id_idx` - Fast queries by user
- `comments_parent_comment_id_idx` - Fast queries for replies
- `comments_created_at_idx` - Fast sorting by creation date
- `comments_is_resolved_idx` - Fast filtering of unresolved comments

**Triggers:**

- `set_comments_updated_at` - Automatically updates `updated_at` on comment changes

**Migration:** `supabase/migrations/20251116085638_comments.sql`

### Interacting with the Database

**IMPORTANT:** Always use the Supabase client directly without service layers. **Do NOT create separate service classes or API abstraction layers.** This keeps the codebase simple and maintainable.

When working with the database from client components, use the Supabase client. **No try-catch needed** - just check the error response:

```typescript
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const { error } = await supabase
  .from("documents")
  .update({ title: "New Title" })
  .eq("id", documentId);

if (error) {
  console.error("Failed to update:", error);
  toast.error("Failed to save");
} else {
  toast.success("Saved successfully");
}
```

**Example:** The `DocumentTitlePlugin` (`components/editor/plugins/menubar/document-title-plugin.tsx`) implements real-time title editing:

- Click title to edit
- Press Enter or blur to save to Supabase
- Press Escape to cancel
- Shows "(saving...)" indicator during updates
- Uses `toast` from sonner for success/error notifications
- Reverts to original title on error

### Working with Comments

The commenting system follows Lexical patterns with direct Supabase integration - **no abstraction layers, no complex state management**.

**Architecture:**

- Direct database queries from React components
- Simple React state (`useState`) for UI
- Lexical `MarkNode` for highlighting commented text
- No service classes or store abstractions

**Comment Features:**

- ✅ Inline comments on selected text (creates thread with quote)
- ✅ Single-level nesting (comment → replies, enforced by database)
- ✅ Reply to comments
- ✅ Delete comments and threads
- ✅ Resolve threads (marks as resolved in database)
- ✅ Auto-reload after mutations

**Key Files:**

- `components/editor/commenting/comments.ts` - Simple type definitions (just uses `Tables<"comments">` directly)
- `components/editor/plugins/comment-plugin.tsx` - Handles inline comment creation with MarkNodes (150 lines)
- `components/editor/plugins/sidebar/comment-sidebar.tsx` - UI and all database logic (520 lines)

**Simple Pattern Example:**

```typescript
// Load comments
const { data } = await supabase
  .from("comments")
  .select("*")
  .eq("document_id", documentId)
  .eq("is_resolved", false);

setComments(data || []);

// Add reply
const { error } = await supabase.from("comments").insert({
  document_id: documentId,
  content: "Reply text",
  parent_comment_id: threadId,
});

loadComments(); // Reload to show new reply

// Resolve thread and all replies
await supabase
  .from("comments")
  .update({ is_resolved: true })
  .or(`id.eq.${threadId},parent_comment_id.eq.${threadId}`);
```

**How It Works:**

1. User selects text → `CommentPlugin` shows input modal
2. User types comment → Saves to database with `crypto.randomUUID()`
3. On success → Wraps selection in Lexical `MarkNode` with comment ID
4. `CommentSidebar` loads all comments → Organizes into threads client-side
5. All mutations (reply/delete/resolve) → Direct Supabase calls → Reload list

**No Complex Abstractions:**

- ❌ No CommentStore class
- ❌ No type converters
- ❌ No event emitters or subscriptions
- ✅ Just React components + Supabase client

### Adding Database Migrations

To create a new migration:

```bash
npm run supabase -- migration new <migration_name>
```

### Working with Authentication

When creating new protected routes, the middleware will automatically handle redirects. To check auth status in a component:

```typescript
// Server Component
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
const {
  data: { user },
} = await supabase.auth.getUser();
```

### Styling Conventions

- Uses Tailwind CSS with CSS variables for theming
- Custom spacing via CSS variables (e.g., `h-(--header-height)`)
- Dark mode support via `next-themes`
- Follow existing patterns in `components/ui/*` for consistency

## Known Patterns

### Lexical State Management

Editor state can be provided in two ways:

- `editorState` - Lexical EditorState object
- `editorSerializedState` - Serialized JSON for persistence

Use `onSerializedChange` callback to capture editor state for saving.

### Modal Pattern

The editor uses a custom hook pattern for modals:

```typescript
const [modal, showModal] = useEditorModal();
```

This is used in `ToolbarContext` for image uploads and other modal interactions.
