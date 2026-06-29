# Decisions — AI Clarity

A running log of load-bearing decisions and the reasoning behind them. Append new
entries at the top. Keep the *why*, not just the *what*, so a future session does
not re-litigate a settled choice.

Do not paste secrets, tokens, or API keys into this file.

## How to use

One entry per decision. Keep each to a few lines. Mark a decision as Superseded
rather than deleting it, so the history stays honest.

## Log

Newest first. *(Reconstructed from the code during a 2026-06-29 docs-structure pass —
decisions visible in the implementation, not necessarily the original framing. The security
implications of these are tracked in `risks.md` / `next-actions.md`.)*

### Reports persisted to Supabase via the anon key

- Decision: each generated brief is inserted into a Supabase `reports` table; the client is
  created from `NEXT_PUBLIC_SUPABASE_URL` + anon key (`lib/supabase.ts`).
- Why: simple persistence + shareable `/report/[id]` links without a custom backend.
- Risk/follow-up: **RLS on `reports` is unverified** — see `risks.md`. Status: Active.

### Public, unauthenticated generation endpoint

- Decision: `app/api/chat/route.ts` is public (no auth) and validates only that `answers`
  is an object.
- Why: lets a prospect use it from a public link with zero friction.
- Risk/follow-up: **no rate limiting / no input caps** on a paid `gpt-5` call — see
  `risks.md` / `next-actions.md`. Status: Active (hardening pending).

### Model pinned to `gpt-5`

- Decision: the generation call uses `model: "gpt-5"`.
- Why: best brief quality at build time.
- Alternatives: a configurable/cheaper model — deferred. Status: Active.
