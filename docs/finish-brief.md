# Finish brief — AI Clarity

The upstream statement of *finish intent* — the standard this project must reach
for its intended use. The **Finish Profile Reviewer** reads this file: if it is
filled in, the reviewer compares the project against it; if left blank, the
reviewer infers intent from context and states its confidence.

Fill in what you know. Leave a field blank rather than inventing an answer.
Field list mirrors `D:\dev\prompt-library\finish-profiles\README.md`.

## Finish Brief

*(Lightly seeded from code on 2026-06-29; security items mirror `risks.md`.)*

- **Project type** — existing public Next.js app (OpenAI + Supabase).
- **Intended user** — prospective clients (public), plus Ben *(inferred; confirm)*.
- **Primary finish profile** — `trust-critical-workflow` *(public endpoint + stored
  third-party business data make this the safest primary; confirm)*.
- **Secondary finish profile** — `founder-demo-mvp` / `public-marketing-site`.
- **Public / client-facing / internal / mobile / trust-critical** — public, client-facing,
  trust-critical.
- **Tone** — sharp, confident, consultant-grade; no fluff.
- **What this must feel like** — a fast, credible "here's where your value is" brief.
- **What this must not become** — an open, abusable AI endpoint, or a store of unprotected
  client business data.
- **Known trust/safety concerns** — **public uncapped `/api/chat` (no rate limit / input
  caps)** and **unverified Supabase RLS** on stored client inputs; no consent/retention
  notice. See `risks.md` / `next-actions.md`.
- **No-scope-creep notes** — keep to the four-question intake → brief → shareable report;
  no account system or full consulting platform.
- **Facts that must not be invented** — the brief must stay grounded in the prospect's
  stated inputs (the prompt already enforces this); never fabricate tools/numbers.
- **Confidence** — Medium (purpose clear from code; audience/public-vs-gated intent unconfirmed).

## Notes

- `no-scope-creep-pass.md` is always applied by the reviewer, regardless of the
  profiles chosen above.
- The reviewer's core rule: this changes the quality bar, not the product scope.
