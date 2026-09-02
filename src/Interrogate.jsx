import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

/* ── DealFlow AI — Interrogation (recorded replay) ───────────────────────────
   Reads static snapshots from /interrogation/{TICKER}.json. Those snapshots
   were produced by rebuilding each deal's typed-assumption DAG in-process and
   replaying the recorded challenge overrides through it, so every MOIC/IRR
   shown here is a mechanical consequence of the override — not narration.

   There is deliberately no live backend call here. This page is a research
   artifact: it serves precomputed results, so it is fast, cannot break, and
   exposes no compute or paid-API surface.
   ─────────────────────────────────────────────────────────────────────── */

const C = {
  bg: "#04060D",
  panel: "#0A0E1A",
  panelHi: "#0E1424",
  line: "rgba(255,255,255,0.08)",
  lineHi: "rgba(255,255,255,0.16)",
  text: "#F3F6FD",
  sub: "#9BA8C6",
  muted: "#5C6880",
  blue: "#5B8DEF",
  green: "#36D399",
  amber: "#F5C24B",
  red: "#F77272",
};
const disp = "'Bricolage Grotesque', -apple-system, sans-serif";
const mono = "'IBM Plex Mono', ui-monospace, Menlo, monospace";

const RECOMMENDATION_COLOR = { proceed: C.green, conditional: C.amber, pass: C.red };
const VERDICT_COLOR = { defended: C.blue, revised: C.amber, compromise: C.green };

const ASSUMPTION_LABELS = {
  entry_ebitda: "Entry EBITDA",
  entry_ev_ebitda: "Entry EV/EBITDA",
  exit_ev_ebitda: "Exit EV/EBITDA",
  debt_ebitda_multiple: "Debt / EBITDA",
  interest_rate: "Interest rate",
  ebitda_growth: "EBITDA growth",
  fcf_conversion: "FCF conversion",
  mandatory_amort_pct: "Mandatory amort.",
  hold_period: "Hold period",
};

const MULTIPLE_KEYS = new Set([
  "entry_ev_ebitda", "exit_ev_ebitda", "debt_ebitda_multiple",
]);
const PCT_KEYS = new Set([
  "interest_rate", "ebitda_growth", "fcf_conversion", "mandatory_amort_pct",
]);

function fmtMoney(n) {
  if (n == null || Number.isNaN(n)) return "—";
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${Number(n).toLocaleString()}`;
}
const fmtMultiple = (n) => (n == null || Number.isNaN(n) ? "—" : `${n.toFixed(2)}x`);
const fmtPct = (n, d = 1) => (n == null || Number.isNaN(n) ? "—" : `${(n * 100).toFixed(d)}%`);

function fmtInput(key, value) {
  if (value == null || Number.isNaN(value)) return "—";
  if (MULTIPLE_KEYS.has(key)) return `${value.toFixed(1)}x`;
  if (PCT_KEYS.has(key)) return fmtPct(value, 1);
  if (key === "hold_period") return `${value} yrs`;
  if (Math.abs(value) >= 1e6) return fmtMoney(value);
  return String(value);
}

// ── Chrome ───────────────────────────────────────────────────────────────────

function Nav({ ticker }) {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 30, background: "rgba(4,6,13,0.92)",
      backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.line}`,
      padding: "0 32px", height: 56, display: "flex", alignItems: "center",
      justifyContent: "space-between",
    }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" stroke={C.blue} strokeWidth="1.5" />
          <path d="M12 7 L16.5 9.5 V14.5 L12 17 L7.5 14.5 V9.5 Z" fill={C.blue} fillOpacity="0.3" stroke={C.blue} strokeWidth="1.1" />
        </svg>
        <span style={{ fontFamily: disp, fontWeight: 700, fontSize: 15, color: C.text }}>
          DealFlow<span style={{ color: C.blue }}> AI</span>
        </span>
      </Link>
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <Link to="/screener" style={{ fontFamily: disp, fontSize: 14, color: C.sub }}>Screener</Link>
        <Link to="/methodology" style={{ fontFamily: disp, fontSize: 14, color: C.sub }}>Methodology</Link>
        {ticker && (
          <Link to={`/company/${ticker}`} style={{ fontFamily: disp, fontSize: 14, color: C.sub }}>
            {ticker} profile
          </Link>
        )}
      </div>
    </nav>
  );
}

function DealTabs({ deals, active }) {
  if (!deals.length) return null;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
      {deals.map((d) => {
        const on = d.ticker === active;
        return (
          <Link key={d.ticker} to={`/interrogate/${d.ticker}`} style={{
            fontFamily: disp, fontSize: 13, fontWeight: on ? 600 : 400,
            color: on ? C.text : C.sub,
            background: on ? "rgba(91,141,239,0.12)" : "transparent",
            border: `1px solid ${on ? "rgba(91,141,239,0.35)" : C.line}`,
            borderRadius: 8, padding: "8px 14px",
          }}>
            {d.ticker}
            <span style={{ fontFamily: mono, fontSize: 11, color: C.muted, marginLeft: 8 }}>
              {d.sector}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function MetricCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: C.panelHi, border: `1px solid ${C.line}`, borderRadius: 10,
      padding: "16px 18px", flex: "1 1 150px", minWidth: 150,
    }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 600, color: color || C.text, marginTop: 6 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

function SectionLabel({ children, note }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: C.blue, letterSpacing: 1.6, textTransform: "uppercase" }}>
        {children}
      </div>
      {note && (
        <div style={{ fontFamily: disp, fontSize: 13, color: C.muted, marginTop: 6, lineHeight: 1.6 }}>
          {note}
        </div>
      )}
    </div>
  );
}

// ── Challenge ────────────────────────────────────────────────────────────────

function ImpactTable({ recomputed }) {
  if (!recomputed?.before || !recomputed?.after) return null;
  const { before, after } = recomputed;
  const rows = [
    {
      metric: "MOIC",
      before: fmtMultiple(before.moic),
      after: fmtMultiple(after.moic),
      delta: `${after.moic - before.moic >= 0 ? "+" : ""}${(after.moic - before.moic).toFixed(2)}x`,
      worse: after.moic < before.moic,
    },
    {
      metric: "IRR",
      before: fmtPct(before.irr),
      after: fmtPct(after.irr),
      delta: `${after.irr - before.irr >= 0 ? "+" : ""}${((after.irr - before.irr) * 100).toFixed(1)}pp`,
      worse: after.irr < before.irr,
    },
    {
      metric: "Exit equity",
      before: fmtMoney(before.exit_equity),
      after: fmtMoney(after.exit_equity),
      delta: `${after.exit_equity - before.exit_equity >= 0 ? "+" : ""}${((after.exit_equity - before.exit_equity) / 1e9).toFixed(2)}B`,
      worse: after.exit_equity < before.exit_equity,
    },
  ];
  return (
    <div style={{ marginTop: 16, border: `1px solid ${C.line}`, borderRadius: 8, overflow: "hidden" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: 8,
        padding: "8px 14px", background: "rgba(255,255,255,0.03)",
        fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase",
      }}>
        <span>Metric</span><span>Before</span><span>After</span><span>Δ</span>
      </div>
      {rows.map((r, i) => (
        <div key={r.metric} style={{
          display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: 8,
          padding: "10px 14px", alignItems: "center",
          borderTop: i === 0 ? "none" : `1px solid ${C.line}`,
        }}>
          <span style={{ fontFamily: disp, fontSize: 13, color: C.sub }}>{r.metric}</span>
          <span style={{ fontFamily: mono, fontSize: 13, color: C.muted }}>{r.before}</span>
          <span style={{ fontFamily: mono, fontSize: 13, color: C.text }}>{r.after}</span>
          <span style={{ fontFamily: mono, fontSize: 13, color: r.worse ? C.red : C.green }}>{r.delta}</span>
        </div>
      ))}
    </div>
  );
}

function Challenge({ ch, index }) {
  const [open, setOpen] = useState(index === 0);
  const vcolor = VERDICT_COLOR[(ch.verdict || "").toLowerCase()] || C.sub;
  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12,
      padding: "22px 24px", marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: 1.4, textTransform: "uppercase" }}>
          {ch.label} · {ch.topic}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontFamily: mono, fontSize: 10, fontWeight: 600, color: vcolor,
            border: `1px solid ${vcolor}44`, borderRadius: 4, padding: "3px 9px",
            textTransform: "uppercase", letterSpacing: 0.8,
          }}>
            {ch.verdict}
          </span>
          {ch.confidence != null && (
            <span style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>
              conf {Math.round(ch.confidence * 100)}%
            </span>
          )}
        </div>
      </div>

      <blockquote style={{
        margin: "16px 0 0", padding: "12px 16px", borderLeft: `2px solid ${C.lineHi}`,
        background: "rgba(255,255,255,0.02)", fontFamily: disp, fontSize: 14.5,
        color: C.text, lineHeight: 1.65,
      }}>
        {ch.question}
      </blockquote>

      {ch.reasoning && (
        <p style={{ fontFamily: disp, fontSize: 14, color: C.sub, lineHeight: 1.75, marginTop: 16 }}>
          {ch.reasoning}
        </p>
      )}

      {ch.outcome && (
        <div style={{
          fontFamily: mono, fontSize: 12, color: C.text, marginTop: 14,
          background: "rgba(91,141,239,0.08)", border: "1px solid rgba(91,141,239,0.22)",
          borderRadius: 8, padding: "10px 14px",
        }}>
          {ch.outcome}
        </div>
      )}

      <ImpactTable recomputed={ch.recomputed} />

      {ch.recomputed?.assumption_id && (
        <div style={{ fontFamily: mono, fontSize: 10.5, color: C.muted, marginTop: 10 }}>
          Override applied to <span style={{ color: C.blue }}>{ch.recomputed.assumption_id}</span>
          {" = "}{fmtInput(ch.recomputed.assumption_id, ch.recomputed.new_value)}, then re-propagated
          through the DAG. Figures above are recomputed, not restated.
        </div>
      )}

      {ch.evidence?.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <button onClick={() => setOpen((o) => !o)} style={{
            fontFamily: mono, fontSize: 11, color: C.blue, background: "none",
            border: "none", cursor: "pointer", padding: 0, letterSpacing: 0.5,
          }}>
            {open ? "− hide" : "+ show"} evidence ({ch.evidence.length})
          </button>
          {open && (
            <ul style={{ margin: "12px 0 0", paddingLeft: 18 }}>
              {ch.evidence.map((e, i) => (
                <li key={i} style={{ fontFamily: disp, fontSize: 13, color: C.sub, lineHeight: 1.7, marginBottom: 8 }}>
                  {e}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Interrogate() {
  const { ticker: routeTicker } = useParams();
  const [index, setIndex] = useState([]);
  const [deal, setDeal] = useState(null);
  const [status, setStatus] = useState("loading");

  const ticker = (routeTicker || "DUOL").toUpperCase();

  useEffect(() => {
    document.title = `Interrogating ${ticker} — DealFlow AI`;
  }, [ticker]);

  useEffect(() => {
    fetch("/interrogation/index.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setIndex(d?.deals || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let live = true;
    setStatus("loading");
    fetch(`/interrogation/${ticker}.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("not found"))))
      .then((d) => {
        if (!live) return;
        setDeal(d);
        setStatus("ready");
      })
      .catch(() => {
        if (!live) return;
        setDeal(null);
        setStatus("missing");
      });
    return () => { live = false; };
  }, [ticker]);

  const base = deal?.base_case;
  const final = deal?.final_case;
  const rcolor = RECOMMENDATION_COLOR[(deal?.recommendation || "").toLowerCase()] || C.sub;

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: disp }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
      `}</style>

      <Nav ticker={status === "ready" ? ticker : null} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 120px" }}>

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 18,
          fontFamily: mono, fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase",
          color: C.amber, border: "1px solid rgba(245,194,75,0.28)",
          background: "rgba(245,194,75,0.07)", borderRadius: 999, padding: "5px 12px",
        }}>
          Recorded run · replayed from the model, not live
        </div>

        <h1 style={{ fontFamily: disp, fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
          Interrogating {deal?.company || ticker}
        </h1>
        <p style={{ fontFamily: disp, fontSize: 15.5, color: C.sub, lineHeight: 1.75, maxWidth: 680, marginBottom: 28 }}>
          An LBO is built as a typed-assumption DAG, a thesis is written where every
          quantitative claim is bound to an assumption node and provenance-checked against
          the live value, and then the thesis is challenged. Each accepted challenge is
          re-propagated through the graph, so the returns below the challenge are the
          arithmetic consequence of the override.
        </p>

        <DealTabs deals={index} active={ticker} />

        {status === "loading" && (
          <div style={{ fontFamily: mono, fontSize: 13, color: C.muted, padding: "40px 0" }}>
            Loading snapshot…
          </div>
        )}

        {status === "missing" && (
          <div style={{
            background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12,
            padding: "28px 32px",
          }}>
            <p style={{ fontFamily: disp, fontSize: 15, color: C.sub, lineHeight: 1.7, marginBottom: 14 }}>
              No recorded interrogation for <strong style={{ color: C.text }}>{ticker}</strong>.
              Interrogation runs were recorded for a small set of canonical deals; the
              screener covers all 131 companies.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {index.map((d) => (
                <Link key={d.ticker} to={`/interrogate/${d.ticker}`} style={{
                  fontFamily: mono, fontSize: 12, color: C.blue,
                  border: "1px solid rgba(91,141,239,0.28)", borderRadius: 6, padding: "7px 12px",
                }}>
                  {d.ticker} →
                </Link>
              ))}
            </div>
          </div>
        )}

        {status === "ready" && deal && (
          <>
            {/* Base case */}
            <SectionLabel note="The starting model, built from canonical inputs and cross-validated against the legacy pricing script to within 1%.">
              Base case
            </SectionLabel>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
              <MetricCard label="MOIC" value={fmtMultiple(base?.moic)} color={C.green} />
              <MetricCard label="IRR" value={fmtPct(base?.irr)} color={C.green} />
              <MetricCard label="Entry EV" value={fmtMoney(base?.entry_ev)} sub={`${deal.inputs?.entry_ev_ebitda?.toFixed(1)}x EBITDA`} />
              <MetricCard label="Exit EV" value={fmtMoney(base?.exit_ev)} sub={`${deal.inputs?.exit_ev_ebitda?.toFixed(1)}x EBITDA`} />
            </div>

            <div style={{
              background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12,
              padding: "18px 22px", marginBottom: 40,
            }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 12 }}>
                Assumption nodes · {deal.node_count} in graph
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 }}>
                {Object.entries(deal.inputs || {}).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: disp, fontSize: 12.5, color: C.muted }}>
                      {ASSUMPTION_LABELS[k] || k}
                    </span>
                    <span style={{ fontFamily: mono, fontSize: 12.5, color: C.text }}>
                      {fmtInput(k, v)}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: mono, fontSize: 10.5, color: C.muted, marginTop: 14, lineHeight: 1.6 }}>
                {deal.node_count} nodes · {deal.edges?.length || 0} edges. Downstream nodes
                (per-year debt schedule, returns engine) are computed, not stored — changing
                any assumption above invalidates and recomputes everything reachable from it.
              </div>
            </div>

            {/* Thesis */}
            <SectionLabel note="Generated against the model state. Each cited claim carries the assumption id it was checked against.">
              Investment thesis
            </SectionLabel>
            <div style={{
              background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12,
              padding: "24px 28px", marginBottom: 40,
            }}>
              {deal.recommendation && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase" }}>
                    Recommendation
                  </span>
                  <span style={{
                    fontFamily: mono, fontSize: 11, fontWeight: 600, color: rcolor,
                    border: `1px solid ${rcolor}44`, borderRadius: 4, padding: "3px 10px",
                    letterSpacing: 0.8,
                  }}>
                    {deal.recommendation}
                  </span>
                </div>
              )}
              {deal.verdict_line && (
                <blockquote style={{
                  borderLeft: `2px solid ${C.blue}`, paddingLeft: 16, marginBottom: 24,
                  fontFamily: disp, fontSize: 15, color: C.text, lineHeight: 1.7,
                }}>
                  {deal.verdict_line}
                </blockquote>
              )}
              {(deal.thesis_sections || []).map((s, i) => (
                <div key={i} style={{ marginBottom: i === deal.thesis_sections.length - 1 ? 0 : 26 }}>
                  <div style={{ fontFamily: disp, fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10 }}>
                    {s.title}
                  </div>
                  {(s.paragraphs || []).map((p, j) => (
                    <p key={j} style={{ fontFamily: disp, fontSize: 14, color: C.sub, lineHeight: 1.8, marginBottom: 12 }}>
                      {p}
                    </p>
                  ))}
                  {s.cited_claims?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                      {s.cited_claims.map((c, j) => (
                        <span key={j} title={c.phrase} style={{
                          fontFamily: mono, fontSize: 10, color: C.muted,
                          border: `1px solid ${C.line}`, borderRadius: 4, padding: "3px 8px",
                        }}>
                          {c.assumption_id} = {c.value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Challenges */}
            <SectionLabel note="Each challenge was evaluated against the model's own derivation. The verdict is the system's, not capitulation — one of defended, revised, or compromise.">
              Interrogation transcript
            </SectionLabel>
            {(deal.challenges || []).map((ch, i) => (
              <Challenge key={i} ch={ch} index={i} />
            ))}

            {/* Cumulative */}
            {final && base && (
              <div style={{
                background: C.panelHi, border: `1px solid ${C.lineHi}`, borderRadius: 12,
                padding: "24px 28px", marginTop: 24,
              }}>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 16 }}>
                  After all {deal.challenges?.length || 0} challenges
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <MetricCard label="MOIC" value={fmtMultiple(final.moic)}
                    sub={`from ${fmtMultiple(base.moic)}`}
                    color={final.moic < base.moic ? C.amber : C.green} />
                  <MetricCard label="IRR" value={fmtPct(final.irr)}
                    sub={`from ${fmtPct(base.irr)}`}
                    color={final.irr < base.irr ? C.amber : C.green} />
                  <MetricCard label="Exit EV" value={fmtMoney(final.exit_ev)}
                    sub={`from ${fmtMoney(base.exit_ev)}`} />
                  <MetricCard label="Exit EBITDA" value={fmtMoney(final.exit_ebitda)}
                    sub={`from ${fmtMoney(base.exit_ebitda)}`} />
                </div>
                <p style={{ fontFamily: disp, fontSize: 13.5, color: C.sub, lineHeight: 1.75, marginTop: 18 }}>
                  Two pushbacks a real IC would make take this deal from{" "}
                  {fmtMultiple(base.moic)} / {fmtPct(base.irr)} to{" "}
                  {fmtMultiple(final.moic)} / {fmtPct(final.irr)}. Neither number was written
                  by hand — both fall out of re-propagating the accepted overrides through the graph.
                </p>
              </div>
            )}

            {/* Provenance */}
            <div style={{
              marginTop: 32, paddingTop: 20, borderTop: `1px solid ${C.line}`,
              fontFamily: mono, fontSize: 10.5, color: C.muted, lineHeight: 1.8,
            }}>
              Original run {deal.generated_at} · snapshot exported {deal.exported_at} ·
              served as a static file, no backend call. Every assumption version, change and
              challenge verdict is persisted in the project's DuckDB audit trail and exposed
              by the FastAPI service when it is run locally.
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
              <Link to="/screener" style={{
                padding: "12px 24px", border: `1px solid ${C.lineHi}`, borderRadius: 8,
                fontFamily: disp, fontSize: 14, color: C.sub,
              }}>
                ← Screener
              </Link>
              <Link to="/methodology" style={{
                padding: "12px 24px", background: "rgba(91,141,239,0.1)",
                border: "1px solid rgba(91,141,239,0.25)", borderRadius: 8,
                fontFamily: disp, fontSize: 14, color: C.blue,
              }}>
                How the model was validated →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
