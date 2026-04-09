# Supabase Starter

A full-stack Next.js 13+ application with Supabase authentication, protected routes, and a complete development setup.

## Project Purpose

This project is a production-ready starter kit for building authenticated Next.js apps on Supabase. It gives you a working baseline with auth flows, protected routes, profile persistence, migrations, and CI-friendly deployment patterns so you can focus on domain features instead of initial setup.

## Features

- ✅ **Authentication** - Sign up, sign in, and session management
- ✅ **Protected Routes** - Middleware-based route protection
- ✅ **User Profiles** - Automatic profile creation with database triggers
- ✅ **Row Level Security** - Secure database access with Supabase RLS
- ✅ **TypeScript** - Fully typed with custom hooks and utilities
- ✅ **TailwindCSS** - Modern styling
- ✅ **Database Migrations** - Version-controlled database schema
- ✅ **Testing Setup** - Ready for unit and integration tests

## Tech Stack

- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth
- **Styling**: TailwindCSS
- **ORM**: Supabase Client (@supabase/ssr)

## Project Structure

```
├── app/
│   ├── (auth)/              # Authentication pages (signin, signup)
│   ├── (protected)/         # Protected pages (dashboard, profile)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/                # Auth-specific components
│   └── ui/                  # Reusable UI components
├── hooks/                   # Custom React hooks (useAuth, etc.)
├── lib/
│   └── supabase/            # Supabase client utilities
├── types/                   # TypeScript type definitions
├── utils/                   # Utility functions
├── __tests__/               # Unit tests
├── supabase/
│   ├── migrations/          # SQL migration files
│   └── schemas/             # Declarative schema definitions
├── proxy.ts                 # Next.js proxy/middleware auth checks
└── scripts/
    └── setup.sh             # Setup script
```

## Getting Started

### Prerequisites

- Node.js 18+ (Node.js 20 LTS recommended)
- npm 9+
- Docker (required for local Supabase)
- Supabase CLI (optional if using `npx supabase`)

### Quick Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the setup script**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

The setup script installs dependencies, supports both remote and local Supabase, creates/updates `.env.local`, and can run migrations.

### Remote Supabase Quick Start (No Local Docker)

Use this flow if you want Supabase hosted in the cloud instead of running locally.

1. **Create a Supabase project** in the Supabase dashboard.

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set environment variables in `.env.local`**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```

4. **Link CLI to your hosted project**
   ```bash
   npx supabase link --project-ref your-project-ref
   ```

5. **Push local migrations to hosted Supabase**
   ```bash
   npx supabase db push
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

### Manual Setup

If you prefer manual setup or are using a remote Supabase project:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env.local` file with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Link to your Supabase project**
   ```bash
   npx supabase link --project-ref your-project-ref
   ```

4. **Apply migrations**
   ```bash
   npx supabase db push
   ```

5. **Start development**
   ```bash
   npm run dev
   ```

## Using This Starter For New Projects

1. **Create your new repository** from this starter (GitHub template or clone/copy).
2. **Rename the app** in `package.json` and update branding/content in `app/`.
3. **Create a new Supabase project** (or run local Supabase for development).
4. **Set environment variables** in `.env.local` and deployment platform settings.
5. **Add your domain schema** as new SQL files under `supabase/migrations/`.
6. **Keep auth and profile primitives** (`lib/supabase`, `hooks/useAuth`, protected routes) and build your feature modules on top.
7. **Deploy app + run migrations** using the production migration workflow below.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests (after setting up Jest/Vitest)

## Supabase Commands

- `npx supabase start` - Start local Supabase (Docker)
- `npx supabase stop` - Stop local Supabase
- `npx supabase status` - Check local Supabase status
- `npx supabase db reset` - Reset local database and apply migrations
- `npx supabase link --project-ref <project-ref>` - Link CLI to hosted project
- `npx supabase db push` - Push migrations to linked hosted project
- `npx supabase db diff` - Generate migration from schema changes
- `npx supabase migration new <name>` - Create new migration

## Database Schema

The application includes a `profiles` table that is automatically populated when users sign up:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Row Level Security (RLS) policies ensure users can only access their own data.

Schema source files:

- `supabase/migrations/20260224000000_create_profiles.sql`
- `supabase/schemas/profiles.sql`

## Authentication Flow

1. **Sign Up**: Creates user in `auth.users` and triggers profile creation
2. **Sign In**: Establishes session with secure cookies
3. **Protected Routes**: Middleware checks authentication before allowing access
4. **Sign Out**: Clears session and redirects to signin

## Custom Hooks

- `useAuth()` - Access current user and session state
- `useRequireAuth()` - Protect client-side routes

## Testing

Unit tests are located in the `__tests__` directory. To set up testing:

```bash
# Install Vitest (recommended)
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

For server-side operations outside this starter's defaults, you may also configure:

- `SUPABASE_SERVICE_ROLE_KEY` (never expose as `NEXT_PUBLIC_*`)

### Database Migrations in Production

```bash
npx supabase link --project-ref your-production-ref
npx supabase db push
```

Or use the included GitHub Actions workflow for automated migrations.

### GitHub Actions: Automatic DB Migrations

This repository includes:

- `.github/workflows/db-migrations.yml`

The workflow runs when:

- You push to `main` and files under `supabase/migrations/**` changed
- You manually trigger it from the Actions tab (`workflow_dispatch`)

Add these repository secrets before using it:

- `SUPABASE_ACCESS_TOKEN` - Personal access token from Supabase
- `SUPABASE_PROJECT_REF` - Your production Supabase project reference
- `SUPABASE_DB_PASSWORD` - Database password for the target project

After adding secrets, push a migration to `main` or run the workflow manually.

Validation tips:

- Ensure `.github/workflows/db-migrations.yml` exists in your default branch.
- Verify your migration files are in `supabase/migrations/`.
- Confirm secrets are set in repository settings before first run.

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

Optional server-only variables (for admin/server tasks only):

- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (never expose as `NEXT_PUBLIC_*`)

Local example:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```


## Troubleshooting

### `NetworkError when attempting to fetch resource` during sign-in

- Verify `.env.local` uses the correct project URL:
   `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`
- Restart the dev server after changing `.env.local`.
- Confirm Supabase is running: `npx supabase status`.

### `napi-postinstall: Permission denied` during `npm install`

- Clean and reinstall dependencies:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

### Setup script cannot extract credentials automatically

- Run `npx supabase status` and copy values manually into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` from **Project URL**
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` from **Publishable**

### Local Supabase already running

- This is usually safe. Check status with:
   ```bash
   npx supabase status
   ```
- Restart if needed:
   ```bash
   npx supabase stop
   npx supabase start
   ```


## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
