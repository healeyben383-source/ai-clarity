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

    const systemPrompt = `You are an expert AI consultant preparing a pre-discovery brief.

Your goal is not to explain everything. Your goal is to highlight the most important insights clearly, concisely, and practically so the client immediately understands where the value is.

Be sharp, practical, and specific. Avoid fluff.

IMPORTANT RULES:
- Only use information explicitly provided in the input.
- Do NOT assume tools, systems, staff, processes, revenue models, or customer acquisition methods unless stated.
- If something is unclear or missing, state it as a gap rather than guessing.
- Every recommendation must directly relate to a stated bottleneck, task, or tool.
- If the input is limited, keep recommendations narrow and say what would need to be clarified.

Using the provided business intake, generate a concise AI opportunity brief that covers:
1. Summary of the business situation
2. Main bottlenecks
3. Most relevant AI opportunities
4. Recommended automations tied directly to the stated tasks or bottlenecks
5. AI readiness score with a short explanation
6. Priority next step
7. Any important gaps or missing information

Keep the response clean, natural, and client-ready.`;

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
