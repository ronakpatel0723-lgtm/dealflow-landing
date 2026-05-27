import React from "react";
import { Link } from "react-router-dom";

const C = {
  bg: "#04060D", panel: "#0A0E1A", panelHi: "#0E1424",
  line: "rgba(255,255,255,0.08)", lineHi: "rgba(255,255,255,0.16)",
  text: "#F3F6FD", sub: "#9BA8C6", muted: "#5C6880",
  blue: "#5B8DEF", green: "#36D399", amber: "#F5C24B", red: "#F77272"
};
const disp = "'Bricolage Grotesque', -apple-system, sans-serif";
const mono = "'IBM Plex Mono', ui-monospace, Menlo, monospace";

const Section = ({ title, children }) => (
  <section style={{ borderTop: `1px solid ${C.line}`, paddingTop: 48, marginBottom: 48 }}>
    <h2 style={{ fontFamily: disp, fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 20 }}>
      {title}
    </h2>
    {children}
  </section>
);

const P = ({ children, style = {} }) => (
  <p style={{ fontFamily: disp, fontSize: 16, lineHeight: 1.75, color: C.sub, marginBottom: 16, ...style }}>
    {children}
  </p>
);

const StatRow = ({ label, value, note }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 12 }}>
    <span style={{ fontFamily: mono, fontSize: 24, fontWeight: 700, color: C.green }}>{value}</span>
    <span style={{ fontFamily: disp, fontSize: 15, color: C.text }}>{label}</span>
    {note && <span style={{ fontFamily: disp, fontSize: 13, color: C.muted, marginLeft: "auto" }}>{note}</span>}
  </div>
);

const Table = ({ headers, rows }) => (
  <div style={{ overflowX: "auto", marginBottom: 24 }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: mono, fontSize: 13 }}>
      <thead>
        <tr>
          {headers.map(h => (
            <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: C.muted, borderBottom: `1px solid ${C.line}`, fontWeight: 500 }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: `1px solid ${C.line}` }}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: "10px 12px", color: j === 0 ? C.text : C.sub }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function Methodology() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(4,6,13,0.92)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.line}`,
        padding: "0 24px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke={C.blue} strokeWidth="1.5" />
            <polygon points="14,6 22,10.5 22,17.5 14,22 6,17.5 6,10.5" fill={C.blue} opacity="0.15" />
            <text x="14" y="17" textAnchor="middle" fill={C.blue} fontSize="9" fontFamily={mono} fontWeight="700">D</text>
          </svg>
          <span style={{ fontFamily: disp, fontSize: 16, fontWeight: 700, color: C.text }}>DealFlow AI</span>
        </Link>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {[["Dashboard", "/"], ["Screener", "/screener"], ["Methodology", "/methodology"]].map(([label, path]) => (
            <Link key={label} to={path} style={{
              fontFamily: disp, fontSize: 14, fontWeight: 500,
              color: label === "Methodology" ? C.blue : C.sub,
              textDecoration: "none"
            }}>{label}</Link>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "72px 24px 120px" }}>
        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.blue, letterSpacing: 2, marginBottom: 16 }}>
            METHODOLOGY
          </div>
          <h1 style={{ fontFamily: disp, fontSize: 40, fontWeight: 800, lineHeight: 1.1, color: C.text, marginBottom: 20 }}>
            How DealFlow AI works
          </h1>
          <P style={{ fontSize: 18, color: C.sub }}>
            An honest account of the data, model, and validation behind the acquisition signal scores.
            We document limitations alongside strengths because anyone in finance will ask.
          </P>
        </div>

        {/* The core claim */}
        <Section title="The defensible claim">
          <div style={{ background: C.panelHi, border: `1px solid ${C.line}`, borderRadius: 12, padding: "28px 32px", marginBottom: 24 }}>
            <StatRow label="mean top-decile lift, walk-forward 2020–2024" value="3.05×" />
            <StatRow label="placebo test (shuffled labels)" value="0.86×" note="confirms signal is real" />
          </div>
          <P>
            The top 10% of companies ranked by DealFlow AI's model were acquired at 3.05× the rate of a random 10% sample, measured on held-out years the model never trained on. A placebo test with shuffled labels collapses lift to 0.86×, confirming the signal isn't a data artifact.
          </P>
          <P>
            The number we use publicly (3.05×) is the mean across five test years (2020–2024), excluding the 2024 result which has only 4 test positives and high variance. The full walk-forward table is below.
          </P>
        </Section>

        {/* Walk-forward backtest */}
        <Section title="Walk-forward backtest">
          <P>
            Standard cross-validation randomly mixes train and test observations across time. This inflates lift because the model trains on future patterns. Walk-forward validation enforces strict temporal separation: train on all observations before year Y, predict year Y only.
          </P>
          <Table
            headers={["Test year", "Train rows", "Test positives", "PR-AUC", "Lift@10%"]}
            rows={[
              ["2020", "14,600", "15", "0.014", "3.34×"],
              ["2021", "17,112", "26", "0.049", "4.24×"],
              ["2022", "19,770", "32", "0.031", "1.88×"],
              ["2023", "22,750", "22", "0.018", "2.73×"],
              ["2024*", "25,924", "4", "0.007", "5.00×"],
              ["Mean (2020–2023)", "—", "—", "0.028", "3.05×"],
            ]}
          />
          <P style={{ fontSize: 13, color: C.muted }}>
            * 2024 has 4 test positives — lift number is high variance and excluded from the headline mean.
          </P>
          <P>
            The cross-validation baseline is 3.93× lift. The walk-forward number (3.05×) is 22% lower — expected, honest, and what we report.
          </P>
        </Section>

        {/* Data sources */}
        <Section title="Data sources">
          <P>Three primary sources:</P>
          <div style={{ display: "grid", gap: 16, marginBottom: 24 }}>
            {[
              ["EDGAR XBRL", "SEC financial filings (2009–2024). Revenue, gross margin, operating margin, revenue growth computed from quarterly filings. Point-in-time safe: each observation uses only data available as of that quarter's filing date."],
              ["SEC Form 4", "Insider transaction filings. Net buy/sell ratio, officer purchase volume, trailing 90/180-day windows. Covers 19.5% of panel entities post-breadth pass."],
              ["Gold set (ground truth)", "100 verified acquisition targets, manually confirmed against 8-K filings and public announcements. Each positive has announcement date, acquirer name, and deal type verified."],
            ].map(([title, desc]) => (
              <div key={title} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: "20px 24px" }}>
                <div style={{ fontFamily: mono, fontSize: 13, color: C.blue, marginBottom: 8 }}>{title}</div>
                <P style={{ marginBottom: 0 }}>{desc}</P>
              </div>
            ))}
          </div>
        </Section>

        {/* Model */}
        <Section title="The model">
          <P>
            Logistic regression with L1 regularization (C=0.1, liblinear solver). Deliberately simple — a banker can read the coefficients, a quant PM can audit the backtest, and a data scientist can reproduce it.
          </P>
          <P>
            Feature set (10 variables): revenue (log-capped), gross margin %, operating margin %, revenue growth %, Rule of 40 score, EV/revenue multiple, gross margin imputation flag, Form 4 net buy ratio, Form 4 officer purchase volume, Form 4 buy/sell count ratio.
          </P>
          <P>
            We report PR-AUC as the primary metric, not accuracy or ROC-AUC. At 0.93% base rate (264 acquisitions in 28,365 company-year observations), a model that predicts "never acquired" hits 99.07% accuracy. PR-AUC measures performance where it matters: among the top-ranked candidates.
          </P>
          <div style={{ background: C.panelHi, border: `1px solid ${C.line}`, borderRadius: 8, padding: "20px 24px", marginBottom: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {[
                ["ROC-AUC (CV)", "0.800"],
                ["PR-AUC (CV)", "0.029"],
                ["PR-AUC random", "0.008"],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontFamily: mono, fontSize: 20, fontWeight: 700, color: C.green }}>{val}</div>
                  <div style={{ fontFamily: disp, fontSize: 12, color: C.muted, marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Honest limitations */}
        <Section title="Honest limitations">
          <P>We document these because pretending they don't exist is worse than saying them:</P>
          <div style={{ display: "grid", gap: 12 }}>
            {[
              ["Universe size", "28,365 company-year observations, 264 positives (0.93% base rate). 2024 test set has 4 positives — statistical noise at that scale."],
              ["Gross margin gap", "36% of entities don't file CostOfRevenue in XBRL. We impute using sector-year medians with an explicit flag. This is not a pipeline bug — it's the XBRL filing reality for micro-cap SaaS."],
              ["Linear model only", "Logistic L1 is interpretable and auditable. Gradient boosting shows higher CV lift but similar walk-forward performance. We chose the simpler model until the universe grows."],
              ["No macro signal", "The model has no macro variables — rates, M&A volume, sector multiples. 2022 lift (1.88×) reflects a compressed deal environment the model couldn't anticipate."],
              ["Survival bias", "The negative class is companies that existed in the panel but weren't acquired. Companies that went bankrupt or delisted for other reasons before acquisition may bias negatives."],
            ].map(([label, desc]) => (
              <div key={label} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 16, padding: "16px 0", borderBottom: `1px solid ${C.line}` }}>
                <span style={{ fontFamily: mono, fontSize: 13, color: C.amber, paddingTop: 2 }}>{label}</span>
                <P style={{ marginBottom: 0, fontSize: 15 }}>{desc}</P>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <div style={{ textAlign: "center", paddingTop: 32 }}>
          <Link to="/screener" style={{
            display: "inline-block", padding: "14px 32px",
            background: C.blue, borderRadius: 8,
            fontFamily: disp, fontSize: 15, fontWeight: 600, color: "#fff",
            textDecoration: "none"
          }}>
            See the screener →
          </Link>
          <P style={{ marginTop: 16, fontSize: 14 }}>
            The live screener ranks 16 public SaaS companies using the same model.
          </P>
        </div>
      </div>
    </div>
  );
}
