# Character Library

A full-stack Next.js app for managing fantasy RPG characters, public character pages, spell lists, bookmarks, AI-assisted summaries, and queued PDF exports.

## Project Purpose

Character Library is a character management app built for tracking party members, NPCs, and other campaign assets in one place. It supports authenticated private rosters, public character sharing, AI summary generation, and background PDF export jobs so character sheets can be published or downloaded without blocking the UI.

## Features

- Authenticated character management with protected routes
- Public character pages and a public-facing character showcase
- Character create/edit flows with stats, notes, tags, spells, and images
- AI-powered summary generation for character descriptions
- Bookmarking and character browsing tools
- Queued PDF export workflow with status tracking and downloadable files
- Server-side Supabase integration for auth, data, and storage
- TypeScript-first codebase with reusable hooks, utilities, and UI components
- Automated tests with Vitest

## Tech Stack

- **Framework**: Next.js 16 App Router
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS 4
- **Database/Auth/Storage**: Supabase
- **Background Jobs**: BullMQ + Upstash Redis
- **Worker Runtime**: Node.js worker process
- **AI**: OpenAI API for character summary generation
- **Testing**: Vitest, Testing Library, JSDOM

## Project Structure

```
├── app/
│   ├── (auth)/                # Sign in and sign up flows
│   ├── (protected)/           # Authenticated app routes
│   │   ├── dashboard/         # User dashboard
│   │   ├── profile/           # Profile settings
│   │   └── characters/        # Character list, create, edit, detail pages
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Landing page with featured public characters
├── components/
│   ├── auth/                  # Auth UI helpers
│   ├── characters/            # Character forms, summary tools, export UI
│   └── ui/                    # Shared inputs and buttons
├── hooks/                     # Auth hooks and route guards
├── lib/
│   └── supabase/              # Supabase client helpers
├── supabase/
│   ├── migrations/            # Database migrations
│   └── schemas/               # SQL schema definitions
├── types/                     # Shared TypeScript types
├── utils/                     # Formatting and validation helpers
├── workers/
│   └── pdf-export-worker.js    # PDF export worker
├── docs/
│   └── pdf-export-deployment.md
├── __tests__/                 # Vitest test suites
├── proxy.ts                   # Route protection and auth checks
└── scripts/
    └── setup.sh               # Local setup helper
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm 9+
- A Supabase project
- An OpenAI API key for summary generation
- Upstash Redis if you want PDF exports to run through the queue

### Quick Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create your environment file**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-4o-mini
   REDIS_URL=your_upstash_redis_url
   ```

3. **Apply Supabase migrations**
   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

4. **Start the app**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000)

### Local PDF Worker

If you want export jobs to process locally instead of on Railway:

```bash
npm run worker:pdf:local
```

For a production worker:

```bash
npm run worker:pdf
```

## Available Scripts

- `npm run dev` - Start the Next.js development server
- `npm run build` - Build the app for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run worker:pdf` - Start the PDF export worker
- `npm run worker:pdf:local` - Start the worker with `.env.local`
- `npm test` - Run Vitest
- `npm run test:watch` - Run Vitest in watch mode
- `npm run test:coverage` - Run Vitest with coverage

## Core Flows

### Character Management

Signed-in users can create and edit characters with:

- Name, role, summary, and notes
- Core stats
- Tags and spell lists
- Public visibility settings
- Images and bookmarks

### AI Summary Generation

The create and edit forms include a Generate button for the Summary field. The server action builds a prompt from the current character data and requests a short fantasy RPG summary from OpenAI. If generation fails, the app falls back to a local draft so the form still remains usable.

### PDF Exports

Owners can request a PDF export from the character page. Export requests are queued, processed by the worker, and tracked by status until a download link is available.

## Deployment

### Web App

The Next.js app is designed to deploy to Vercel.

Set these environment variables in your hosting provider:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `REDIS_URL` if you are using queued PDF exports

### PDF Worker

Use the worker deployment guide in [docs/pdf-export-deployment.md](docs/pdf-export-deployment.md) for the Upstash + Railway setup.

### Database Migrations

Apply migrations with:

```bash
npx supabase link --project-ref <your-production-project-ref>
npx supabase db push
```

## Environment Variables

Required for the app:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

Optional or feature-specific:

- `OPENAI_MODEL` - Overrides the default OpenAI model used for summaries
- `REDIS_URL` - Required for PDF export queueing and worker processing

Local example:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
REDIS_URL=rediss://...
```

## Testing

Run the test suite with:

```bash
npm test
```

If you want coverage:

```bash
npm run test:coverage
```

## Troubleshooting

### AI summary generation is blank

- Confirm `OPENAI_API_KEY` is set
- Try a different `OPENAI_MODEL` value such as `gpt-4o-mini`
- Check server logs for OpenAI response errors

### PDF exports stay queued

- Confirm `REDIS_URL` is set
- Make sure the PDF worker is running
- Check the worker logs for Supabase or Redis errors

### Supabase auth is not working

- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart the dev server after changing `.env.local`

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Upstash Redis Documentation](https://upstash.com/docs/redis)
