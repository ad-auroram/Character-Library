# PDF Export Deployment (Vercel + Upstash + Railway)

This guide sets up Milestone 5 PDF exports with:

- Next.js app on Vercel
- Redis queue on Upstash
- PDF worker on Railway
- Supabase for data + private storage

## What You Need

1. A Supabase project (already in use by this app)
2. An Upstash account (for Redis)
3. A Railway account (to run the worker)
4. A Vercel project (for the web app)

## 1) Create Upstash Redis

1. In Upstash, create a Redis database.
2. Copy the Redis connection string.
3. Save it as `REDIS_URL` for both the web app and worker.

Notes:

- Upstash usually provides a TLS URL (commonly `rediss://...`).
- Use the exact URL from Upstash.

## 2) Prepare Supabase Secrets

From your Supabase project settings, collect:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Important:

- `SUPABASE_SERVICE_ROLE_KEY` must only be set in server environments.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code or `NEXT_PUBLIC_*` vars.

## 3) Apply Database Migration

From the project root:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

This applies the `character_exports` table and private storage bucket migration.

## 4) Configure Vercel (Web App)

In Vercel project environment variables, set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `REDIS_URL`

Why `REDIS_URL` on Vercel:

- The app enqueues jobs from server actions.
- Queueing requires Redis access from the Next.js server runtime.

## 5) Configure Railway (Worker)

Create and configure a dedicated worker service in Railway:

1. In Railway, click **New Project** -> **Deploy from GitHub repo**.
2. Select this repository.
3. Open the new service, then set the **Root Directory** to `character library`.
4. In the service settings, set:
   - Build command: `npm ci`
   - Start command: `npm run worker:pdf`
5. In the service variables, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `REDIS_URL`
   - `NODE_ENV=production`
6. Deploy the service and open the logs.
7. Confirm you see the worker startup line:
   - `[pdf-worker] running and waiting for jobs...`

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `REDIS_URL`
- `NODE_ENV=production`

Start command (reference):

```bash
npm run worker:pdf
```

Railway service requirements:

- Keep at least 1 instance running so jobs process continuously.
- Ensure outbound network access to Upstash + Supabase.
- If Railway asks for HTTP port settings, none are required for this worker-only process.

## 6) Deploy Order

1. Push latest code.
2. Run Supabase migration (`db push`).
3. Deploy Vercel app.
4. Deploy Railway worker.
5. Trigger an export from an owner account and verify completion.

## 7) Verification Checklist

1. Owner can see the export section on the character page.
2. Non-owner cannot see export controls.
3. Export status transitions: queued -> processing -> completed.
4. Download link appears only when completed.
5. Generated PDF contains only:
   - Page 1: name, role, summary, notes, core stats
   - Page 2: spells grouped by level, cantrips first
6. No tags or images are present in the PDF.

## 8) 24-Hour Retention Behavior

Current behavior:

- Exports older than 24 hours are treated as expired during status checks.
- Expired files are removed from Supabase Storage.
- Expired export records are deleted.

This means cleanup is request-driven (when status is checked), not clock-driven.

## 9) Optional Hard Cleanup (Recommended)

For strict 24-hour lifecycle even if users never revisit the page, add a scheduled cleanup job (daily or hourly) that:

1. Finds `character_exports` older than 24h
2. Removes matching files from `character-exports` storage bucket
3. Deletes old rows from `character_exports`

You can host this on Railway cron, GitHub Actions cron, or Supabase scheduled functions.

## 10) Troubleshooting

### Jobs stay queued

- Verify Railway worker is running.
- Verify `REDIS_URL` in both Vercel and Railway.
- Check Railway logs for Redis connection errors.

### Jobs fail immediately

- Verify `SUPABASE_SERVICE_ROLE_KEY` on Railway.
- Check worker logs for missing env vars.
- Confirm migration was applied (`character_exports` table exists).

### No download link

- Confirm export status is `completed`.
- Check if export has expired (older than 24h).
- Confirm storage upload succeeded in worker logs.
