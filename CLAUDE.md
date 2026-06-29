@AGENTS.md

# AI Clarity

Project memory for Claude Code sessions in this repository.

## Project

- Name: AI Clarity
- Slug: ai-clarity
- Type: Existing project (swept)
- Dev port: 3001
- Path: C:\Users\HN2nds\dev\ai-clarity

## Working style

- Make the smallest correct change. No speculative refactors.
- Prefer editing existing files over creating new ones.
- Read before you write. Search before you read. Ask before you guess.
- Do not commit, push, deploy, or stage files unless the user explicitly asks.
- Do not run `git add .` or `git add -A`. Stage specific paths.
- If you spot a problem outside the task, mention it; do not fix it.

## Default build rhythm

1. Confirm the task in one sentence in your own words.
2. Read the files you expect to change.
3. Propose a short plan: files to touch, what to add or remove.
4. Implement with targeted edits.
5. Hand off to the tester or auditor.
6. Write a final report.

## Useful commands

Run from the project root.

```
npm run dev -- -p 3001
npm run build
npm run lint
```

Add project-specific commands here as they appear.

## Final report required

Every task ends with a final report. Sections:

1. Files changed
2. What was done
3. What was not done and why
4. Risks
5. Exact next command to run

Keep each section tight. The report is the handover.


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
