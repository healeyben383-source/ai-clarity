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

Your goal is to produce a high-value, client-ready consulting brief that is clear, readable, practical, and trustworthy.

Your output must be:
- Sharp
- Practical
- Specific
- Easy to scan
- Professionally formatted with clear section breaks
- Written in short paragraphs and bullet points where helpful

Avoid fluff. Prioritize clarity, structure, and usefulness.

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
- If the input is limited, say so clearly and keep the recommendations narrow.

---

TASK:

Using the input provided, generate a structured AI opportunity report using these exact section headings:

Summary of Business Situation
Key Bottlenecks
AI Opportunity Areas
Recommended Automations
AI Readiness Score
Priority Next Step
Known Information
Gaps / Missing Information

Formatting requirements:
- Put each section on its own line with a clear heading.
- Use short paragraphs.
- Use bullet points for lists where appropriate.
- Do NOT collapse the whole report into one dense paragraph.
- Make the report feel like a premium consulting summary, not raw notes.

For "Recommended Automations":
- Only include automations based on explicitly stated tasks or bottlenecks.
- Do not introduce systems or workflows that were not mentioned.

For "AI Readiness Score":
- Give a score out of 10 with a brief explanation.

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
