# Character Library - Implementation To-Do (On Top of Starter)

This checklist assumes the current Supabase auth starter is already in place.

## 1) Project Setup and Environment

- [x] Configure project for hosted (remote) Supabase in development and production.
- [ ] Add and verify required environment variables locally and in Vercel:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (server-only, never public)
  - [ ] `OPENAI_API_KEY` (server-only)
  - [ ] `REDIS_URL` (or Redis connection fields)
- [x] Link Supabase CLI to hosted project and push migrations.

## 2) Data Model and Supabase Schema

- [x] Create migration(s) for `characters` table:
  - [x] `id` (uuid), `user_id` (owner), timestamps
  - [x] core fields: name, role, summary/description, notes, visibility (`public/private`)
  - [x] structured stats (either JSONB or explicit columns)
- [x] Create migration(s) for `tags` table.
- [x] Create migration(s) for `character_tags` join table.
- [x] Create migration(s) for `character_images` table (gallery metadata, ordering, URLs).
- [x] Create migration(s) for `bookmarks` table (`user_id`, `character_id`, unique constraint).
- [x] Create migration(s) for `character_spells` table (`character_id`, spell metadata from API, unique per character+spell index/id).
- [x] Add indexes for expected queries:
  - [x] owner + updated date
  - [x] visibility + updated date
  - [x] tag lookups via join table
  - [ ] text search columns (name/summary/notes)
- [x] Add/validate foreign keys with proper cascade behavior.

## 3) Row Level Security (RLS) and Access Rules

- [x] Enable RLS on all new domain tables.
- [x] Add policies so users can CRUD only their own characters/images.
- [x] Add read policy for public characters.
- [x] Add policies for bookmarks (users manage only their own bookmarks).
- [x] Add policies for tags/join table access consistent with character visibility.

## 4) Type Generation and Shared Types

- [ ] Regenerate Supabase database types after each schema change.
- [x] Add/extend TypeScript domain types for:
  - [x] Character DTO/form model
  - [x] Tag model
  - [x] Image model
  - [x] Bookmark model
  - [x] Spell model (API response + persisted character spell shape)
- [x] Keep client/server payload types aligned to avoid runtime shape mismatches.

## 5) Character CRUD (Core Feature)

- [x] Build create character page/form.
- [x] Build edit character page/form.
- [x] Build character details page.
- [x] Build character list page (owned + optionally public feed).
- [x] Implement server actions or API routes for create/update/delete.
- [x] Add validation for required fields and stats constraints.
- [x] Handle image URL/gallery management in create/edit flow.
- [x] Add visibility toggle (public/private).

## 6) Search and Filtering

- [x] Implement text search (name + summary + notes).
- [x] Implement filtering by tags.
- [x] Implement visibility-aware result logic (owner private + public browsing).
- [x] Add empty/loading/error states in search UI.

## 7) Bookmarks

- [x] Add bookmark/unbookmark actions for character cards/detail view.
- [x] Add bookmarks tab/section in profile page.
- [x] Show bookmarked character list with links and metadata.
- [x] Prevent duplicate bookmark entries.

## 8) Spell Integration (D&D 5e API)

- [x] Build a service module for D&D API spell search and spell detail calls.
- [ ] Add caching/throttling strategy for external spell requests.
- [x] Add character detail section for spells (below Notes).
- [x] Build spell search UI on character detail page (search input + results list).
- [x] Add action to attach selected spell(s) from API to the current character.
- [x] Store attached spell metadata for each character (name, level, school, range, casting time, description, API index/url).
- [x] Render attached spells as spell cards on the character detail page.
- [x] Add remove/unlink spell action from character.
- [x] Prevent duplicate spell attachments per character.
- [ ] Add robust fallback UX when spell API is unavailable (error state + retry/manual note).

## 9) AI Character Summary

- [ ] Create server endpoint/action that builds prompt from character fields.
- [ ] Integrate OpenAI API call from server only.
- [ ] Add token limit, timeout, and retry/error handling.
- [ ] Add safety validation/sanitization of generated output.
- [ ] Add UI action: generate summary in create/edit flow.
- [ ] Add save/overwrite/edit flow for generated summary.
- [ ] Add fallback UX when AI generation fails.

## 10) PDF Export with Background Worker

- [x] Set up Redis instance for queueing.
- [x] Add BullMQ queue producer in Next.js app.
- [x] Create separate worker process for PDF jobs.
- [x] Define job payload schema and validation.
- [x] Build one stable printable HTML/CSS template first.
- [x] Implement PDF renderer (Puppeteer or equivalent).
- [x] Store or stream generated PDF for download.
- [x] Add job status polling or loading/progress UI.
- [x] Add retry logic, dead-letter/failure handling, and logging.

## 11) UI/UX Integration

- [x] Update dashboard to show character workflow entry points.
- [x] Add navigation for library, create, bookmarks, profile.
- [x] Add friendly empty states and actionable errors.
- [ ] Keep accessibility basics in place (labels, keyboard flow, contrast).

## 12) Testing

- [ ] Add unit tests for validation and mapping logic.
- [ ] Add unit tests for search/filter query helpers.
- [ ] Add tests for AI prompt builder and response parser.
- [ ] Add tests for spell search + spell attachment flow (mock D&D API responses).
- [ ] Add integration tests for protected character CRUD paths.
- [ ] Add tests for bookmarks behavior and permissions.
- [ ] Add at least one end-to-end path for create -> view -> bookmark.

## 13) Deployment and Operations

- [ ] Configure Vercel env vars for all required keys.
- [ ] Ensure Supabase migration workflow is applied in production.
- [ ] Decide where worker runs in production (separate service/container).

## 14) Documentation

- [x] Document local vs remote Supabase workflows.
- [x] Document worker/PDF architecture and recovery steps.

## 15) Suggested Delivery Order (MVP First)

- [x] Milestone 1: Remote Supabase + schema + RLS + character CRUD.
- [x] Milestone 2: Search/filter + bookmarks.
- [ ] Milestone 3: Spell search + attach flow via D&D API (manual fallback retained).
- [ ] Milestone 4: AI summary generation (manual fallback retained).
- [x] Milestone 5: PDF worker pipeline + downloadable exports.
- [ ] Milestone 6: Hardening, tests, and deployment polish.

## 16) Partial Implementation Notes

- Spell integration is functionally live for search, pagination, class-based matching, attach/remove, and card rendering on character detail pages.
- Spell API requests currently use response revalidation caching, but explicit throttling/rate-limit controls are not yet implemented.
- Spell error handling currently shows user-facing error states, but a full fallback flow (retry strategy + manual entry alternative) is still pending.
- Milestone 3 is intentionally left open until caching/throttling and fallback UX are completed.
- Milestone 5 PDF exports are live with owner-only access, queueing, worker processing, storage-backed downloads, and 24-hour retention cleanup.
