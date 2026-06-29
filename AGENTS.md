# Agents

This project uses specialized agents to keep work organized when collaborating with AI assistants.

- Project: AI Clarity
- Slug: ai-clarity
- Type: Existing project (swept)
- Port: 3001
- Path: C:\Users\HN2nds\dev\ai-clarity

## Roster

- `builder` — implements features and code changes
- `auditor` — reviews code for correctness, security, and quality
- `tester` — writes and runs tests for the change being shipped
- `handover-writer` — writes a short handover note when context is large or a session ends mid-task
- `product-ux-reviewer` — reviews the product from a UX and copy perspective

Agent definitions live in `.claude/agents/`.

## Working agreement

- Make targeted changes only. No drive-by refactors.
- Prefer editing existing files over creating new ones.
- Do not commit, push, deploy, or stage files unless the user explicitly asks.
- Do not run `git add .` or `git add -A`. Stage specific paths.
- Hand off between agents instead of one agent doing everything.
- Every task ends with a final report.


## Reusable Dev Centre prompt library

Reusable Dev Centre prompt library:
D:\dev\prompt-library

When Ben asks for a build, audit, fix, debug, handover, UI review,
Supabase/RLS review, or deployment-prep workflow, use the relevant
prompt pattern from the prompt library.

For major work passes, final reports should include:

- Files changed
- What was built or reviewed
- Commands run
- Validation result
- Manual test steps
- Risks / unfinished items
- Recommended next Claude prompt
