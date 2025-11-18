# Undocx

A Google Docs-like **realtime collaborative rich text editor** built with Next.js, Lexical.dev, Supabase, and shadcn UI.

## Features

- **Real-time Collaboration**: Multiple users can edit documents simultaneously with Supabase Realtime
- **Rich Text Editing**: Powered by Lexical.dev with support for:
  - Advanced text formatting (bold, italic, underline, strikethrough, code)
  - Headings, lists, quotes, and code blocks
  - Tables with full editing capabilities
  - Image uploads and inline images
  - Hyperlinks and auto-linking
  - Drag-and-drop blocks
  - Markdown shortcuts
- **Collaborative Features**:
  - Real-time cursor presence
  - Threaded comments sidebar
  - Table of Contents navigation
- **Modern UI**: Built with shadcn UI components and Tailwind CSS
- **Authentication**: Secure user authentication via Supabase Auth
- **Dark Mode**: Full theme support

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TypeScript
- **Editor**: [Lexical.dev](https://lexical.dev) - Extensible text editor framework
- **UI Components**: [shadcn UI](https://ui.shadcn.com) (Radix UI + Tailwind CSS)
- **Backend**: [Supabase](https://supabase.com) (Auth, Realtime DB, Storage)
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (for production) or local Supabase setup

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd undocx
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key
```

For **local development** with Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_local_anon_key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Supabase Local Development (Optional)

To run Supabase locally:

```bash
npm run supabase start
```

**Local Supabase Ports:**

- API: `http://127.0.0.1:54321`
- Studio: `http://127.0.0.1:54323`
- Database: `localhost:54322`
- Inbucket (Email testing): `http://127.0.0.1:54324`

## Available Scripts

```bash
npm run dev          # Start Next.js development server
npm run build        # Build production bundle
npm start            # Start production server
npm run lint         # Run ESLint
npm run supabase     # Access Supabase CLI
```

## Project Structure

```
/app                          # Next.js App Router pages
  /auth                       # Authentication pages (login, signup, etc.)
  /editor                     # Full-featured rich text editor
  /editor-md                  # Markdown editor variant
/components
  /blocks/editor-x            # Main editor components
  /editor                     # Editor plugins and utilities
    /plugins                  # Lexical plugins (toolbar, pickers, floating UI)
    /themes                   # Editor styling
    /transformers             # Markdown transformers
  /ui                         # shadcn UI components
/lib
  /supabase                   # Supabase client utilities
/supabase                     # Supabase configuration and migrations
```

## Key Routes

- `/` - Landing page
- `/auth/login` - User login
- `/auth/sign-up` - User registration
- `/editor` - Full-featured collaborative editor
- `/editor-md` - Markdown editor variant

## Development

### Adding Editor Features

The editor is built with a plugin-based architecture. To add new features:

1. **Toolbar Actions**: Add to `components/editor/plugins/toolbar/`
2. **Slash Commands**: Add to `components/editor/plugins/picker/`
3. **Custom Nodes**: Register in `components/blocks/editor-x/nodes.ts`

See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Add your license here]

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Lexical Documentation](https://lexical.dev/docs/intro)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn UI Documentation](https://ui.shadcn.com)
