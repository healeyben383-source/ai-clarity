# Risks — AI Clarity

Known risks, sharp edges, and things that could bite later. Hand-curated. Review
at the end of each working session and before any handover or demo.

Do not paste secrets, tokens, or API keys into this file.

> These risks were **captured from a read-only audit / docs pass on 2026-06-29 — they
> are documented, not fixed.** Fixing them is deliberately out of scope for that pass.

## Open risks

Highest impact first.

| Risk | Impact | Likelihood | Mitigation / next step |
| --- | --- | --- | --- |
| **Public, uncapped OpenAI endpoint** — `app/api/chat/route.ts` has no auth, no rate limiting, and no input-length cap; every POST calls `gpt-5`. | High | Med–High | Anyone who finds the endpoint can run unlimited paid generations / inflate cost / abuse it. Add rate limiting (per IP/session) + max input length + basic abuse protection (captcha or token). See `next-actions.md`. |
| **Unverified Supabase RLS on `reports`** — app uses the `NEXT_PUBLIC` anon key for inserts and report reads; client business inputs + AI output are stored there. | High | Unknown | If RLS is off or permissive, reports may be world-readable / enumerable by `id`. Verify RLS policy in Supabase; restrict select/insert appropriately. (Verification is outside the docs pass.) |
| **Client-data handling / consent** — prospect business details are sent to OpenAI and persisted in Supabase with no visible consent/privacy notice or retention policy. | Med | Med | Add a privacy/consent line on the intake form; define retention; confirm OpenAI data-use terms are acceptable for client data. |
| **No lint / quality gate** — `package.json` has only `dev`/`build`/`start`; no `lint`. | Med | High | Add ESLint + a `lint` script so regressions and unsafe patterns are caught. |
| **Model pinned to `gpt-5`** — no fallback or cost guardrail if the model is unavailable or pricing changes. | Low–Med | Low | Consider a configurable model + a cost/usage guardrail. |
| **Stale `project-memory.md`** — empty domain section and a wrong path (`C:\Users\HN2nds\...`). | Low | High | Curate `project-memory.md` (real path is `D:\dev\ai-clarity`). |

## Trust / safety watch

Anything touching private data, approvals, payments, messages, or public-facing
automation. AI Clarity is **public-facing and stores third-party business data**, so:

- The public `/api/chat` endpoint and the Supabase `reports` table are the two
  trust-critical surfaces — consider a `trust-critical-workflow` review + a ShipGuard
  scan before any wider promotion.
- AI output is a consultant *brief* generated from limited inputs — keep it framed as
  a starting point, not a guaranteed plan.

## Resolved / accepted

Newest first. One line each: what it was and how it was closed or why it was accepted.

-
