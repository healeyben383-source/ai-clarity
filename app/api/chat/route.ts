import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "../../../lib/supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { answers } = await req.json();

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Invalid answers." }, { status: 400 });
    }

    const { business, bottleneck, tasks, tools } = answers;

    const content = `You are an expert AI consultant preparing a pre-discovery brief.

Your goal is NOT to explain everything.

Your goal is to highlight the most important insights clearly and concisely so the client immediately understands where value is.

Be sharp, practical, and specific. Avoid fluff.

- Write like a senior consultant delivering clear, confident recommendations.
- Be specific and decisive — avoid vague or generic language.
- Where appropriate, structure insights into clear sub-points (e.g. WHAT CHANGES, TOOLS, IMPACT) to improve clarity.
- Prioritize high-leverage recommendations over obvious operational fixes.
- When a clear pattern exists (e.g. repeated manual work, fragmented tools), confidently recommend a stronger, more integrated solution.
- Lead with the operational issue or insight — do not open sections by restating the business type or summarising what the client already knows.
- Avoid over-procedural detail: do not list micro-steps, file names, column names, or low-level setup mechanics unless essential. Focus on workflow change and business outcome.
- Vary sentence structure naturally. Do not begin multiple sentences in a row with command verbs (Create, Build, Set up). Each opportunity should feel independently framed, not generated from the same template.
- Executive Summary must begin directly with the core operational issue or constraint. Do not include any business description or recap as the opening sentence.
- When describing changes, prefer outcome-oriented phrasing over setup detail; avoid specifying file names, column lists, or low-level implementation unless essential.

IMPORTANT RULES:
- Only use information explicitly provided in the input.
- Do NOT assume tools, systems, staff, or processes unless clearly stated.
- If something is missing, state it briefly instead of filling gaps.
- Keep recommendations grounded only in stated bottlenecks or tasks.
- Do not weaken recommendations due to uncertainty — stay grounded, but still provide clear, actionable guidance.
- If tools are mentioned, they must be common, obvious extensions of the stated workflow (not invented systems).
- Being grounded does not mean being overly cautious — make clear recommendations when patterns are obvious.
- Prefer solutions that significantly reduce complexity or eliminate entire categories of manual work.

RECOMMENDATIONS MUST BE CONCRETE AND IMPLEMENTATION-READY:
- Prefer naming specific tools only if they are already mentioned or clearly implied by the input.
- If tools are not explicitly provided, default to the simplest viable approach using the tools listed (e.g. Outlook, Excel, Google Drive).
- Avoid generic phrases like "implement a system" or "leverage AI".
- Instead describe: what is created, where it lives, how it runs, and what triggers it.
- Every recommendation should feel like it could be executed tomorrow by the business owner.
- Do not repeat the same tool or concept more than once within a section — if it's already established, move on.
- Prefer tight, natural phrasing a human consultant would use. Cut filler.

Keep the entire response under 300–400 words.

Structure EXACTLY like this:

---

## Executive Summary
Open with the most diagnostic observation about this business — not a recap of what they do, but what the inputs reveal about where value is being lost. End with the single sharpest implication for the business.

---

## Key Bottleneck
Write a clear diagnosis of the root cause — not a description of the symptom. One or two sentences, written as if you have seen this pattern before and know exactly why it happens.

---

## Priority Recommendation
Name the one action that resolves the highest-leverage constraint. Be direct about what it unlocks — not just what it is. Avoid "consider" or "look into" — state a clear position.

---
## Top 3 Opportunities

For each:

**[Opportunity Name]**
- What changes: (1 sentence)
- Tools: (short list)
- Impact: (quantify time saved or efficiency gain as specifically as possible)

Frame each opportunity independently — different angle, different framing. Do not open all three the same way.

---

## Expected Outcome
One commercially grounded closing statement. Do not restate the three opportunities — synthesise what changes for the business overall if these are acted on.

---

Business Inputs:
Business: ${business}
Biggest Bottleneck: ${bottleneck}
Repetitive Tasks: ${tasks}
Current Tools: ${tools}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content }],
    });

    const reply = completion.choices[0]?.message?.content ?? "";

    const { data: saved, error: saveError } = await supabase
      .from("reports")
      .insert({ business, bottleneck, tasks, tools, report_output: reply })
      .select("id")
      .single();

    if (saveError || !saved) {
      console.error("Failed to save report:", saveError);
      return NextResponse.json({ error: "Failed to save report." }, { status: 500 });
    }

    return NextResponse.json({ reply, id: saved.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
