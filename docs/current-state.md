# Current state — AI Clarity

Fast-moving snapshot for AI Clarity (dev port 3001). Update at the end of
every working session, or whenever something material changes. Pair with
`project-memory.md` for stable context.

Do not paste secrets, tokens, or API keys into this file.

## Last updated

2026-06-29 by Claude (Dev Centre docs-refresh maintenance pass — current-state filled
from code; audit findings captured; no source changed)

## Status

**Active, public-facing MVP** lead-gen / pre-discovery tool. (Note: `package.json`
`name` is `chat-app`, but the project is AI Clarity.) Backed by **real** services —
OpenAI and Supabase Postgres — not mock data. It has known security/quality follow-ups
(see `risks.md` / `next-actions.md`); these are **documented, not yet fixed**.

## What it does

A prospect answers four questions (business, biggest bottleneck, repetitive tasks,
current tools); the app generates a sharp, structured "pre-discovery brief" and gives
them a shareable report link.

## What works

Verified by reading the implemented code (not a live smoke test this pass).

- **Intake → brief flow** (`app/page.tsx`, ~24KB) — collects the four answers.
- **Generation endpoint** (`app/api/chat/route.ts`) — `POST` validates `answers` is an
  object, builds a detailed consultant prompt, calls **OpenAI `gpt-5`**
  (`chat.completions`), and returns the brief.
- **Persistence** — each report is inserted into the Supabase **`reports`** table
  (`business, bottleneck, tasks, tools, report_output`) and an `id` returned.
- **Shareable report** (`app/report/[id]/page.tsx` + `ReportView.tsx`, ~19KB) — renders
  a saved report by id.
- **Supabase client** (`lib/supabase.ts`) — created from `NEXT_PUBLIC_SUPABASE_URL` +
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon key, used client- and server-side).

## What is incomplete / not verified

- **No authentication** on the app or the `/api/chat` endpoint — it is public.
- **No rate limiting and no input-length caps** on `/api/chat` — every POST triggers a
  `gpt-5` call (see risks).
- **Supabase RLS is unverified from the code** — the app uses the anon key; whether
  Row Level Security on `reports` actually restricts read/insert is not confirmed here.
- **No `lint` script** — `package.json` only has `dev`, `build`, `start`.
- `project-memory.md` is a near-empty template and lists a **stale path**
  (`C:\Users\HN2nds\dev\ai-clarity`); the real path is `D:\dev\ai-clarity`.

## Known risks

Captured in detail in `risks.md` (created this pass). Headlines: public uncapped
OpenAI endpoint (cost/abuse), unverified Supabase RLS on stored client business data,
no lint, and client-data-handling/consent gaps.

## Open questions

- Is RLS enabled and correct on the Supabase `reports` table? (Confirm in the Supabase
  dashboard — outside this docs pass.)
- Is AI Clarity intended to stay fully public, or move behind a gate / captcha?

## Where to resume

Decide whether to address the public-endpoint hardening first (rate limit + input caps
on `app/api/chat/route.ts`) — see `next-actions.md`. This pass is docs-only; nothing
was fixed.

## Recent shipped changes

Newest first. Trim to the last five entries.

- 2026-06-29 — docs-only: filled current-state from code; added `risks.md` +
  `next-actions.md` capturing the known audit findings (no code changed).
- (earlier, `f11dd23`) — report tone refinement (issue-first executive summary).
