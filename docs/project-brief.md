# Project brief — AI Clarity

The stable statement of *why this project exists and what it is for*. Hand-curated,
updated rarely. This is the "what we agreed to build" anchor. Pair with
`finish-brief.md` (the standard it must reach), `current-state.md` (fast-moving
snapshot), and `project-memory.md` (long-lived context).

## Identity

- Name: AI Clarity
- Slug: ai-clarity
- Type: existing
- Dev port: 3001
- Path: D:\dev\ai-clarity

## The job

*(Inferred from the code — confirm with a human.)* A public lead-gen / pre-discovery tool:
a prospect answers four questions (business, biggest bottleneck, repetitive tasks, current
tools) and AI Clarity generates a sharp, structured "pre-discovery brief" with a shareable
report link — so a prospective client immediately sees where AI/automation value is.

## Intended user

*(Inferred; confirm the public-vs-gated intent — see `risks.md`.)*

- Audience: prospective AutomationBeast clients (public), plus Ben using the generated brief.
- Where/when used: a public web link; desktop or phone.

## In scope

The bounded list of what this build covers (from the implemented code).

- Four-question intake (`app/page.tsx`).
- Brief generation via OpenAI `gpt-5` (`app/api/chat/route.ts`).
- Persistence of each report to Supabase (`reports` table) + a shareable `/report/[id]` view.

## Out of scope

What this project is deliberately NOT — the scope ceiling. *(Inferred.)*

- A full consulting platform, account system, or multi-step workflow tool.
- A replacement for a real discovery conversation — the brief is a starting point.

## Definition of done

The plain-English bar for "this is finished for its purpose". *(Light — confirm with a human.)*

- A prospect can submit the four answers, receive an accurate, well-structured brief, and
  share the report — **with the public endpoint hardened** (rate limit + input caps) and
  **Supabase RLS verified** (see `risks.md` / `next-actions.md`).

## Links

- Finish standard: `finish-brief.md`
- Current snapshot: `current-state.md`
- Long-lived context: `project-memory.md`
- Decisions / risks / next: `decisions.md`, `risks.md`, `next-actions.md`
