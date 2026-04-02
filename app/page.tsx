"use client";

import { useState } from "react";

// ── scoring ───────────────────────────────────────────────────────────────────

function calcReadinessScore(answers: {
  business: string;
  bottleneck: string;
  tasks: string;
  tools: string;
}): { score: number; label: string; reason: string } {
  const text = Object.values(answers).join(" ").toLowerCase();
  let score = 20;
  const signals = [
    "manual","email","follow-up","follow up","document","reminder",
    "spreadsheet","copy","paste","data entry","invoice","report",
    "chase","chasing","pdf","form","upload","download",
  ];
  let signalHits = 0;
  for (const word of signals) if (text.includes(word)) { score += 5; signalHits++; }
  const toolCount = answers.tools.split(/[,/&+]/).filter((t) => t.trim()).length;
  score += Math.min(toolCount * 3, 12);
  const taskWordCount = answers.tasks.split(" ").length;
  if (taskWordCount > 10) score += 6;
  const hardCap = signalHits >= 6 && toolCount >= 4 ? 95 : 88;
  score = Math.min(score, hardCap);

  const label =
    score >= 85 ? "Transformational Opportunity" :
    score >= 65 ? "Strong Opportunity" :
    score >= 45 ? "Moderate Opportunity" : "Low Leverage";

  const reason =
    signalHits >= 4 && toolCount >= 3
      ? "Your inputs describe heavy manual work across multiple disconnected tools — a strong indicator of high automation potential."
      : signalHits >= 4
      ? "Your answers reference several manual, repetitive processes that are well-suited to AI automation."
      : toolCount >= 3
      ? "You're using multiple separate tools with little integration, which typically creates significant inefficiency AI can address."
      : taskWordCount > 10
      ? "The detail in your repetitive tasks description suggests meaningful volume of manual work that could be streamlined."
      : "Based on your inputs, there may be some automation opportunities, but the signals are limited — consider expanding on your repetitive tasks.";

  return { score, label, reason };
}

// ── markdown cleanup ──────────────────────────────────────────────────────────

function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*\[(.+?)\]\*\*/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\[(.+?)\]/g, "$1")
    .trim();
}

// ── opportunity parser ────────────────────────────────────────────────────────

function parseOpportunities(body: string): Array<{ title: string; bullets: string[] }> {
  const lines = body.split("\n").filter((l) => l.trim());
  const result: Array<{ title: string; bullets: string[] }> = [];
  let current: { title: string; bullets: string[] } | null = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("-")) {
      current?.bullets.push(trimmed.slice(1).trim());
    } else {
      if (current) result.push(current);
      current = { title: trimmed, bullets: [] };
    }
  }
  if (current) result.push(current);
  return result;
}

// ── design tokens ─────────────────────────────────────────────────────────────

const COLOR = {
  bg: "#f0f2f5",
  surface: "#ffffff",
  border: "#e2e8f0",
  borderStrong: "#cbd5e0",
  divider: "#edf2f7",
  text: "#1a202c",
  textMuted: "#4a5568",
  textSubtle: "#718096",
  textFaint: "#a0aec0",
  blue: "#2b6cb0",
  green: "#276749",
  greenBg: "#f0faf4",
  greenBorder: "#9ae6b4",
  amber: "#92600a",
  amberBg: "#fffbea",
  amberBorder: "#f6e05e",
  amberAccent: "#d69e2e",
  red: "#9b2c2c",
  redBg: "#fff5f5",
  redBorder: "#fc8181",
};

const SHADOW = {
  form: "0 1px 3px rgba(0,0,0,0.06)",
  report: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)",
};

const FONT = { family: "'Inter', system-ui, -apple-system, sans-serif" };

// ── primitives ────────────────────────────────────────────────────────────────

function Eyebrow({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <p style={{
      margin: "0 0 10px",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: color ?? COLOR.textFaint,
    }}>
      {children}
    </p>
  );
}

function Divider() {
  return <div style={{ height: 1, backgroundColor: COLOR.divider, margin: "28px 0" }} />;
}

// ── score block (inline inside report doc) ────────────────────────────────────

function ScoreBlock({ score, label, reason }: { score: number; label: string; reason: string }) {
  const isStrong = label === "Transformational Opportunity" || label === "Strong Opportunity";
  const isMid = label === "Moderate Opportunity";
  const bg = isStrong ? COLOR.greenBg : isMid ? COLOR.amberBg : COLOR.redBg;
  const border = isStrong ? COLOR.greenBorder : isMid ? COLOR.amberBorder : COLOR.redBorder;
  const accent = isStrong ? COLOR.green : isMid ? COLOR.amber : COLOR.red;

  return (
    <div style={{
      padding: "24px 28px",
      borderRadius: 10,
      border: `1px solid ${border}`,
      backgroundColor: bg,
    }}>
      <Eyebrow>AI Readiness Score</Eyebrow>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
            <span style={{ fontSize: 48, fontWeight: 800, lineHeight: 1, color: accent }}>{score}</span>
            <span style={{ fontSize: 18, fontWeight: 400, color: COLOR.textFaint, paddingBottom: 7 }}>/ 100</span>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 13, fontWeight: 700, color: accent }}>{label}</p>
        </div>
        <div style={{ flex: 1, paddingLeft: 20, borderLeft: `1px solid ${border}` }}>
          <p style={{ margin: 0, fontSize: 14, color: COLOR.textMuted, lineHeight: 1.7 }}>{reason}</p>
        </div>
      </div>
    </div>
  );
}

// ── opportunity list ──────────────────────────────────────────────────────────

const BULLET_LABEL_COLOR: Record<string, string> = {
  "what changes": "#2b6cb0",
  "tools": "#276749",
  "impact": "#744210",
};

function OpportunityList({ body }: { body: string }) {
  const items = parseOpportunities(body);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          padding: "18px 20px",
          borderRadius: 8,
          backgroundColor: "#fafbfc",
          border: `1px solid ${COLOR.border}`,
        }}>
          <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: COLOR.text }}>
            {item.title}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {item.bullets.map((bullet, j) => {
              const colonIdx = bullet.indexOf(":");
              const hasLabel = colonIdx > 0 && colonIdx < 20;
              const bulletLabel = hasLabel ? bullet.slice(0, colonIdx).toLowerCase() : null;
              const bulletText = hasLabel ? bullet.slice(colonIdx + 1).trim() : bullet;
              const labelColor = bulletLabel ? (BULLET_LABEL_COLOR[bulletLabel] ?? COLOR.textMuted) : COLOR.textMuted;
              return (
                <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  {bulletLabel && (
                    <span style={{
                      flexShrink: 0,
                      minWidth: 80,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      color: labelColor,
                      paddingTop: 3,
                    }}>
                      {bulletLabel}
                    </span>
                  )}
                  <span style={{ fontSize: 14, color: COLOR.textMuted, lineHeight: 1.7 }}>{bulletText}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── report section (inside the doc) ──────────────────────────────────────────

function ReportSection({
  title,
  body,
  highlight,
}: {
  title: string;
  body: string;
  highlight?: "strong" | "soft";
}) {
  const isPriority = highlight === "strong";
  const isNext = highlight === "soft";
  const isOpportunities = title.toLowerCase().includes("opportunit");

  if (isPriority) {
    return (
      <div style={{
        padding: "24px 28px",
        borderRadius: 10,
        backgroundColor: COLOR.amberBg,
        border: `1px solid ${COLOR.amberBorder}`,
        borderLeftWidth: 4,
        borderLeftColor: COLOR.amberAccent,
      }}>
        <Eyebrow color="#b7791f">{title}</Eyebrow>
        <p style={{ margin: 0, fontSize: 16, color: COLOR.text, lineHeight: 1.85, fontWeight: 500 }}>
          {body}
        </p>
      </div>
    );
  }

  if (isNext) {
    return (
      <div style={{
        padding: "22px 26px",
        borderRadius: 10,
        backgroundColor: COLOR.greenBg,
        border: `1px solid ${COLOR.greenBorder}`,
      }}>
        <Eyebrow color={COLOR.green}>{title}</Eyebrow>
        <p style={{ margin: 0, fontSize: 15, color: COLOR.text, lineHeight: 1.8 }}>{body}</p>
      </div>
    );
  }

  return (
    <div>
      <Eyebrow>{title}</Eyebrow>
      {isOpportunities ? (
        <OpportunityList body={body} />
      ) : (
        <p style={{ margin: 0, fontSize: 15, color: COLOR.textMuted, lineHeight: 1.85 }}>{body}</p>
      )}
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [business, setBusiness] = useState("");
  const [bottleneck, setBottleneck] = useState("");
  const [tasks, setTasks] = useState("");
  const [tools, setTools] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [score, setScore] = useState<{ score: number; label: string; reason: string } | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  const hasReport = !!score;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setReply("");
    setError("");
    setScore(null);
    setReportId(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: { business, bottleneck, tasks, tools } }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      const calculatedScore = calcReadinessScore({ business, bottleneck, tasks, tools });
      setReply(data.reply);
      setScore(calculatedScore);
      setReportId(data.id ?? null);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const fields: { label: string; placeholder: string; value: string; onChange: (v: string) => void }[] = [
    { label: "Business description", placeholder: "What does the business do?", value: business, onChange: setBusiness },
    { label: "Biggest bottleneck", placeholder: "Where does time or effort get wasted most?", value: bottleneck, onChange: setBottleneck },
    { label: "Repetitive tasks", placeholder: "What manual or repetitive work happens regularly?", value: tasks, onChange: setTasks },
    { label: "Current tools / software", placeholder: "e.g. Xero, Gmail, Trello, spreadsheets…", value: tools, onChange: setTools },
  ];

  const sections = reply
    .split(/\n(?=## )/)
    .map((s) => {
      const [titleLine, ...rest] = s.split("\n");
      const title = cleanMarkdown(titleLine.replace(/^##\s*/, ""));
      const body = rest
        .filter((line) => line.trim() !== "---")
        .map(cleanMarkdown)
        .join("\n")
        .trim();
      return { title, body };
    })
    .filter(({ title, body }) => title && body);

  const prioritySection = sections.find((s) => s.title.toLowerCase().includes("priority"));

  // Derive a short business type label from the first few words of the business field
  const businessLabel = business.trim()
    ? business.trim().split(/\s+/).slice(0, 6).join(" ") + (business.trim().split(/\s+/).length > 6 ? "…" : "")
    : "your business";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLOR.bg, fontFamily: FONT.family }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "52px 24px 100px" }}>

        {/* ── App header ── */}
        <header style={{ marginBottom: hasReport ? 28 : 44 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              backgroundColor: COLOR.blue,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 6px rgba(43,108,176,0.3)",
            }}>
              <span style={{ color: "#fff", fontSize: 12, fontWeight: 800, letterSpacing: "0.02em" }}>AI</span>
            </div>
            <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.03em", color: COLOR.text }}>
              AI Clarity
            </span>
          </div>
          <p style={{ margin: "0 0 4px", fontSize: 13, color: COLOR.textSubtle }}>
            AI opportunity discovery · client intake report
          </p>
          <p style={{ margin: 0, fontSize: 12, color: COLOR.textFaint }}>
            Prepared by{" "}
            <span style={{ fontWeight: 600, color: COLOR.textSubtle }}>Your Name</span>
            {" · "}
            <span style={{ fontWeight: 600, color: COLOR.textSubtle }}>Your Consultancy</span>
          </p>
        </header>

        {/* ── Intake form ── */}
        {hasReport && !isEditing ? (
          /* Collapsed state — single row with Edit Inputs button */
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: COLOR.surface,
            border: `1px solid ${COLOR.border}`,
            borderRadius: 10,
            padding: "12px 20px",
            boxShadow: SHADOW.form,
            marginBottom: 28,
          }}>
            <p style={{ margin: 0, fontSize: 13, color: COLOR.textSubtle }}>
              <span style={{ fontWeight: 600, color: COLOR.textMuted }}>Inputs:</span>{" "}
              {business || "—"}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: "transparent",
                color: COLOR.blue,
                border: `1px solid ${COLOR.borderStrong}`,
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: FONT.family,
                whiteSpace: "nowrap",
                flexShrink: 0,
                marginLeft: 16,
              }}
            >
              Edit Inputs
            </button>
          </div>
        ) : (
          /* Expanded form */
          <section style={{
            backgroundColor: COLOR.surface,
            border: `1px solid ${COLOR.border}`,
            borderRadius: 12,
            padding: "28px 32px",
            boxShadow: SHADOW.form,
            marginBottom: 44,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: COLOR.text }}>
                Business Intake
              </p>
              {hasReport && (
                <button
                  onClick={() => setIsEditing(false)}
                  style={{
                    padding: "5px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    backgroundColor: "transparent",
                    color: COLOR.textSubtle,
                    border: `1px solid ${COLOR.border}`,
                    borderRadius: 6,
                    cursor: "pointer",
                    fontFamily: FONT.family,
                  }}
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 0 }}>
                {fields.map(({ label, placeholder, value, onChange }) => (
                  <div key={label} style={{ marginBottom: 16 }}>
                    <label style={{
                      display: "block",
                      marginBottom: 5,
                      fontSize: 12,
                      fontWeight: 600,
                      color: COLOR.textMuted,
                    }}>
                      {label}
                    </label>
                    <input
                      type="text"
                      value={value}
                      placeholder={placeholder}
                      onChange={(e) => onChange(e.target.value)}
                      disabled={loading}
                      style={{
                        width: "100%",
                        padding: "10px 13px",
                        fontSize: 14,
                        boxSizing: "border-box",
                        border: `1px solid ${COLOR.borderStrong}`,
                        borderRadius: 7,
                        outline: "none",
                        backgroundColor: loading ? COLOR.bg : "#fff",
                        color: COLOR.text,
                        fontFamily: FONT.family,
                      }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 8 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "10px 26px",
                    fontSize: 14,
                    fontWeight: 600,
                    backgroundColor: loading ? COLOR.textFaint : COLOR.blue,
                    color: "#fff",
                    border: "none",
                    borderRadius: 7,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: FONT.family,
                  }}
                >
                  {loading ? "Generating…" : hasReport ? "Regenerate Report" : "Generate Report"}
                </button>
              </div>
            </form>

            {error && <p style={{ margin: "12px 0 0", color: "#c53030", fontSize: 13 }}>{error}</p>}
          </section>
        )}

        {/* ── Report document ── */}
        {score && (
          <section style={{
            backgroundColor: COLOR.surface,
            border: `1px solid ${COLOR.border}`,
            borderRadius: 14,
            boxShadow: SHADOW.report,
            overflow: "hidden",
          }}>
            {/* Report cover strip */}
            <div style={{
              padding: "28px 36px 24px",
              borderBottom: `1px solid ${COLOR.divider}`,
            }}>
              <Eyebrow>AI Opportunity Report</Eyebrow>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <p style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: COLOR.text, letterSpacing: "-0.025em" }}>
                    Your AI Opportunity Brief
                  </p>
                  <p style={{ margin: 0, fontSize: 13, color: COLOR.textSubtle }}>
                    Prepared for: <span style={{ fontWeight: 600, color: COLOR.textMuted }}>{businessLabel}</span>
                    {" · "}Generated from your business intake responses
                  </p>
                </div>
                {reportId && (() => {
                  const url = `${window.location.origin}/report/${reportId}`;
                  const btnBase: React.CSSProperties = {
                    flexShrink: 0,
                    padding: "8px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 7,
                    cursor: "pointer",
                    fontFamily: FONT.family,
                    whiteSpace: "nowrap",
                    border: `1px solid ${COLOR.borderStrong}`,
                  };
                  return (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => window.open(url, "_blank")}
                        style={{ ...btnBase, backgroundColor: COLOR.blue, color: "#fff", border: "none" }}
                      >
                        View Report
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(url).then(() => {
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          });
                        }}
                        style={{
                          ...btnBase,
                          backgroundColor: copied ? COLOR.greenBg : COLOR.surface,
                          color: copied ? COLOR.green : COLOR.textMuted,
                          border: `1px solid ${copied ? COLOR.greenBorder : COLOR.borderStrong}`,
                        }}
                      >
                        {copied ? "Copied ✓" : "Copy Link"}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Report body */}
            <div style={{ padding: "32px 36px" }}>

              {/* Score block */}
              <ScoreBlock score={score.score} label={score.label} reason={score.reason} />

              {sections.map(({ title, body }, i) => {
                const isPriority = title.toLowerCase().includes("priority");
                return (
                  <div key={title}>
                    <Divider />
                    <ReportSection
                      title={title}
                      body={body}
                      highlight={isPriority ? "strong" : undefined}
                    />
                  </div>
                );
              })}

              {prioritySection && (() => {
                const firstSentence = prioritySection.body.split(/(?<=[.!?])\s+/)[0] ?? prioritySection.body;
                return (
                  <>
                    <div style={{ height: 1, backgroundColor: COLOR.divider, margin: "36px 0 32px" }} />
                    <ReportSection
                      title="Recommended Next Step"
                      body={`${firstSentence} Identify the right tool, assign an owner, and aim to have a working prototype or process in place within 1–2 weeks.`}
                      highlight="soft"
                    />
                  </>
                );
              })()}

            </div>
          </section>
        )}
      </div>
    </div>
  );
}
