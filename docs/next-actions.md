# Next actions — AI Clarity

Practical, safe next steps. Newest priorities first. Keep each item concrete.

> Captured during a docs-only pass on 2026-06-29 from a read-only audit. **None of
> these have been done** — they are the recommended follow-ups, not a changelog.

## Security / hardening (do first — public-facing)

1. **Rate-limit + cap `app/api/chat/route.ts`.** Add per-IP/session rate limiting,
   a maximum request body / per-field length, and basic abuse protection (captcha or a
   short-lived token). Today the endpoint is public and uncapped, calling `gpt-5` on
   every POST.
2. **Verify Supabase RLS on `reports`.** Confirm Row Level Security is enabled and the
   policies actually restrict who can read/insert. Reports hold third-party business
   inputs + AI output and are read by `id` at `/report/[id]`. (Check in the Supabase
   dashboard — not part of the docs pass.)
3. **Add a consent / privacy note** to the intake form and define a retention policy
   for stored reports.

## Quality

4. **Add ESLint + a `lint` script** to `package.json` (currently only
   `dev`/`build`/`start`). Then wire it into the normal validate step.

## Housekeeping

5. **Curate `project-memory.md`** — fill the domain/audience/job sections and fix the
   stale path (`C:\Users\HN2nds\dev\ai-clarity` → `D:\dev\ai-clarity`).
6. Consider renaming the `package.json` `name` (`chat-app`) to match the project, if
   safe to do so.

## Notes

- This is a docs file only. Do not treat any item as done until it is actually
  implemented and validated in the app.
