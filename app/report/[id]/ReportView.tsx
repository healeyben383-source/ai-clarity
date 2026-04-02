"use client";

// ── types ─────────────────────────────────────────────────────────────────────

type Report = {
  id: string;
  created_at: string;
  business: string;
  bottleneck: string;
  tasks: string;
  tools: string;
  report_output: string;
};

// ── scoring ───────────────────────────────────────────────────────────────────

function calcReadinessScore(r: Pick<Report, "business" | "bottleneck" | "tasks" | "tools">) {
  const text = [r.business, r.bottleneck, r.tasks, r.tools].join(" ").toLowerCase();
  let score = 30;
  const signals = [
    "manual","email","follow-up","follow up","document","reminder",
    "spreadsheet","copy","paste","data entry","invoice","report",
    "chase","chasing","pdf","form","upload","download",
  ];
  let signalHits = 0;
  for (const word of signals) if (text.includes(word)) { score += 8; signalHits++; }
  const toolCount = r.tools.split(/[,/&+]/).filter((t) => t.trim()).length;
  score += Math.min(toolCount * 5, 20);
  if (r.tasks.split(" ").length > 10) score += 10;
  score = Math.min(score, 100);

  const label =
    score >= 90 ? "Transformational Opportunity" :
    score >= 70 ? "Strong Opportunity" :
    score >= 40 ? "Moderate Opportunity" : "Low Leverage";

  const reason =
    signalHits >= 4 && toolCount >= 3
      ? "This report describes heavy manual work across multiple disconnected tools — a strong indicator of high automation potential."
      : signalHits >= 4
      ? "The inputs reference several manual, repetitive processes that are well-suited to AI automation."
      : toolCount >= 3
      ? "Multiple separate tools with little integration typically creates significant inefficiency AI can address."
      : r.tasks.split(" ").length > 10
      ? "The detail in the repetitive tasks description suggests meaningful volume of manual work that could be streamlined."
      : "There may be some automation opportunities, but the signals are limited.";

  return { score, label, reason };
}

// ── section parser ────────────────────────────────────────────────────────────

function parseSections(text: string) {
  const sections: Record<string, string> = {};
  const titles = [
    "Summary of Business Situation",
    "Key Bottlenecks",
    "AI Opportunity Areas",
    "Recommended Automations",
    "AI Readiness Score",
    "Priority Next Step",
    "Known Information",
    "Gaps / Missing Information",
  ];

  let currentTitle = "";

  for (const line of text.split("\n")) {
    const match = titles.find((t) => line.toLowerCase().includes(t.toLowerCase()));
    if (match) {
      currentTitle = match;
      sections[currentTitle] = "";
    } else if (currentTitle) {
      sections[currentTitle] += line + "\n";
    }
  }

  return sections;
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
  report: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)",
};

const FONT = { family: "'Inter', system-ui, -apple-system, sans-serif" };

// ── print styles ──────────────────────────────────────────────────────────────

const PRINT_STYLES = `
  @page {
    size: A4;
    margin: 1.4cm 2cm;
  }

  @media print {
    /* Hide screen-only UI */
    .no-print { display: none !important; }

    /* Show print-only elements */
    .print-only { display: block !important; }

    /* Page reset */
    html, body {
      background: #fff !important;
      color: #1a202c !important;
      font-size: 11pt !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Remove page-level wrapper styling */
    .report-page-bg {
      background: #fff !important;
      padding: 0 !important;
      min-height: unset !important;
    }

    /* Full-width content — no max-width, centered */
    .report-page-inner {
      max-width: 100% !important;
      width: 100% !important;
      padding: 0 !important;
      margin: 0 auto !important;
      box-sizing: border-box;
    }

    /* Flatten the report card container */
    .report-doc {
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      overflow: visible !important;
    }

    /* Print-only document header: bold rule beneath, generous separation */
    .print-only-header {
      display: flex !important;
      align-items: baseline;
      justify-content: space-between;
      padding-bottom: 10pt;
      margin-bottom: 24pt;
      border-bottom: 2pt solid #1a202c;
    }

    /* Cover strip: zero screen padding, clear bottom rule */
    .report-cover {
      padding: 0 0 16pt 0 !important;
      margin-bottom: 20pt !important;
      border-bottom: 1pt solid #cbd5e0 !important;
    }

    /* Body: no screen padding */
    .report-body {
      padding: 0 !important;
    }

    /* Prevent page breaks inside key blocks */
    .report-section {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .score-block {
      break-inside: avoid;
      page-break-inside: avoid;
      margin-bottom: 16pt;
    }

    .opp-item {
      break-inside: avoid;
      page-break-inside: avoid;
      margin-bottom: 8pt;
    }

    /* Consistent vertical rhythm between sections */
    .print-divider {
      margin: 16pt 0 !important;
    }
  }
`;

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

// ── score block ───────────────────────────────────────────────────────────────

function ScoreBlock({ score, label, reason }: { score: number; label: string; reason: string }) {
  const isStrong = label === "Transformational Opportunity" || label === "Strong Opportunity";
  const isMid = label === "Moderate Opportunity";
  const bg = isStrong ? COLOR.greenBg : isMid ? COLOR.amberBg : COLOR.redBg;
  const border = isStrong ? COLOR.greenBorder : isMid ? COLOR.amberBorder : COLOR.redBorder;
  const accent = isStrong ? COLOR.green : isMid ? COLOR.amber : COLOR.red;

  return (
    <div className="report-section score-block" style={{ padding: "24px 28px", borderRadius: 10, border: `1px solid ${border}`, backgroundColor: bg }}>
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


// ── main component ────────────────────────────────────────────────────────────

export default function ReportView({ report }: { report: Report }) {
  const scoreData = calcReadinessScore(report);

  const sections = parseSections(report.report_output);

  const businessLabel = report.business.trim().split(/\s+/).slice(0, 6).join(" ")
    + (report.business.trim().split(/\s+/).length > 6 ? "…" : "");

  const date = new Date(report.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      <style>{PRINT_STYLES}</style>

      <div className="report-page-bg" style={{ minHeight: "100vh", backgroundColor: COLOR.bg, fontFamily: FONT.family }}>
        <div className="report-page-inner" style={{ maxWidth: 720, margin: "0 auto", padding: "52px 24px 100px" }}>

          {/* App header */}
          <header className="no-print" style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: COLOR.blue, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(43,108,176,0.3)" }}>
                    <span style={{ color: "#fff", fontSize: 12, fontWeight: 800, letterSpacing: "0.02em" }}>AI</span>
                  </div>
                  <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.03em", color: COLOR.text }}>AI Clarity</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: COLOR.textFaint }}>
                  Prepared by{" "}
                  <span style={{ fontWeight: 600, color: COLOR.textSubtle }}>Your Name</span>
                  {" · "}
                  <span style={{ fontWeight: 600, color: COLOR.textSubtle }}>Your Consultancy</span>
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: "9px 18px",
                    fontSize: 13,
                    fontWeight: 600,
                    backgroundColor: COLOR.surface,
                    color: COLOR.textMuted,
                    border: `1px solid ${COLOR.borderStrong}`,
                    borderRadius: 7,
                    cursor: "pointer",
                    fontFamily: FONT.family,
                  }}
                >
                  Print / Save PDF
                </button>
                <p style={{ margin: 0, fontSize: 11, color: COLOR.textFaint, textAlign: "right" }}>
                  Tip: uncheck &ldquo;Headers and footers&rdquo; in print settings for a clean PDF
                </p>
              </div>
            </div>
          </header>

          {/* Report document */}
          <section className="report-doc" style={{ backgroundColor: COLOR.surface, border: `1px solid ${COLOR.border}`, borderRadius: 14, boxShadow: SHADOW.report, overflow: "hidden" }}>

            {/* Print-only document header (hidden on screen, shown in print via CSS) */}
            <div className="print-only print-only-header" style={{ display: "none" }}>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: COLOR.text }}>
                AI Clarity
              </span>
              <span style={{ fontSize: 10, color: COLOR.textSubtle, letterSpacing: "0.02em" }}>
                Prepared by Your Name · Your Consultancy
              </span>
            </div>

            {/* Cover strip */}
            <div className="report-cover" style={{ padding: "28px 36px 24px", borderBottom: `1px solid ${COLOR.divider}` }}>
              <Eyebrow>AI Opportunity Report</Eyebrow>
              <p style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: COLOR.text, letterSpacing: "-0.025em" }}>
                Your AI Opportunity Brief
              </p>
              <p style={{ margin: 0, fontSize: 13, color: COLOR.textSubtle }}>
                Prepared for: <span style={{ fontWeight: 600, color: COLOR.textMuted }}>{businessLabel}</span>
                {" · "}Generated {date}
              </p>
            </div>

            {/* Body */}
            <div className="report-body" style={{ padding: "32px 36px" }}>

              <ScoreBlock score={scoreData.score} label={scoreData.label} reason={scoreData.reason} />

              {Object.entries(sections).map(([title, content]) => (
                <div key={title} className="report-section" style={{ marginTop: 28, paddingTop: 28, borderTop: `1px solid ${COLOR.divider}` }}>
                  <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: COLOR.textFaint }}>
                    {title}
                  </p>
                  <p style={{ margin: 0, fontSize: 15, color: COLOR.textMuted, lineHeight: 1.85, whiteSpace: "pre-wrap" }}>
                    {content.trim()}
                  </p>
                </div>
              ))}

            </div>
          </section>
        </div>
      </div>
    </>
  );
}
