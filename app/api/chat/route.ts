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

    const systemPrompt = `You are an AI business consultant generating structured AI opportunity reports.

Your goal is to produce a high-value, client-ready consulting brief.

Your output must be:
- Sharp
- Practical
- Specific
- Concise (300–400 words maximum)
- Focused only on the most important insights

Avoid fluff. Prioritize clarity and impact.

---

IMPORTANT RULES:

- Only use information explicitly provided in the input.
- Do NOT assume tools, systems, staff, or processes unless stated.
- If something is unclear or missing, state it as a gap rather than guessing.
- Do NOT invent:
  - software/tools
  - team size
  - workflows
  - revenue models
  - customer acquisition methods

- Every recommendation MUST directly relate to a stated bottleneck or task.

---

TASK:

Using the input provided, generate a structured AI opportunity report with the following sections:

1. Summary of Business Situation
2. Key Bottlenecks
3. AI Opportunity Areas
4. Recommended Automations (only based on explicitly stated tasks or bottlenecks)
5. AI Readiness Score (with explanation)
6. Priority Next Step
7. Known Information
8. Gaps / Missing Information

---

Always base your output strictly on the provided input.`;

    const content = `Business: ${business}
Biggest Bottleneck: ${bottleneck}
Repetitive Tasks: ${tasks}
Current Tools: ${tools}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content }],
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
