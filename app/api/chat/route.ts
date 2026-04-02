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

IMPORTANT RULES:
- Only use information explicitly provided in the input.
- Do NOT assume tools, systems, staff, or processes unless clearly stated.
- If something is missing, state it briefly instead of filling gaps.
- Keep recommendations grounded only in stated bottlenecks or tasks.
- Do not weaken recommendations due to uncertainty — stay grounded, but still provide clear, actionable guidance.
- If tools are mentioned, they must be common, obvious extensions of the stated workflow (not invented systems).

Keep the entire response under 300–400 words.

Structure EXACTLY like this:

---

## Executive Summary
Write 2–3 sentences describing the business.

Then clearly state the SINGLE biggest inefficiency or missed opportunity in one sharp sentence.
---

## Key Bottleneck
Explain WHY this bottleneck exists (not just what it is) in 1–2 sentences.

---

## Priority Recommendation
In 1–2 sentences, state the single highest-impact action the business should take first and why.

---
## Top 3 Opportunities

For each:

**[Opportunity Name]**
- What changes: (1 sentence)
- Tools: (short list)
- Impact: (quantify time saved or efficiency gain as specifically as possible)

---

## Expected Outcome
Summarise the combined impact in 1–2 sentences (time saved, efficiency, scale).

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
