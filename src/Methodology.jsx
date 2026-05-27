import React from "react";
import { Link } from "react-router-dom";

const C = {
  bg:"#04060D", panel:"#0A0E1A", panelHi:"#0E1424",
  line:"rgba(255,255,255,0.08)", lineHi:"rgba(255,255,255,0.16)",
  text:"#F3F6FD", sub:"#9BA8C6", muted:"#5C6880",
  blue:"#5B8DEF", green:"#36D399", amber:"#F5C24B", red:"#F77272",
};
const disp = "'Bricolage Grotesque', -apple-system, sans-serif";
const mono = "'IBM Plex Mono', ui-monospace, Menlo, monospace";

const Section = ({ title, tag, children }) => (
  <section style={{ borderTop:`1px solid ${C.line}`, paddingTop:48, marginBottom:52 }}>
    {tag && <div style={{ fontFamily:mono, fontSize:11, color:C.blue, letterSpacing:2,
      textTransform:"uppercase", marginBottom:12 }}>{tag}</div>}
    <h2 style={{ fontFamily:disp, fontSize:22, fontWeight:700, color:C.text, marginBottom:20 }}>
      {title}
    </h2>
    {children}
  </section>
);

const P = ({ children, style={} }) => (
  <p style={{ fontFamily:disp, fontSize:16, lineHeight:1.75, color:C.sub, marginBottom:16, ...style }}>
    {children}
  </p>
);

const StatRow = ({ value, label, note }) => (
  <div style={{ display:"flex", alignItems:"baseline", gap:14, marginBottom:14 }}>
    <span style={{ fontFamily:mono, fontSize:26, fontWeight:700, color:C.green }}>{value}</span>
    <span style={{ fontFamily:disp, fontSize:15, color:C.text }}>{label}</span>
    {note && <span style={{ fontFamily:mono, fontSize:12, color:C.muted, marginLeft:"auto" }}>{note}</span>}
  </div>
);

const Table = ({ headers, rows, highlight }) => (
  <div style={{ overflowX:"auto", marginBottom:24 }}>
    <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:mono, fontSize:13 }}>
      <thead>
        <tr>{headers.map(h => (
          <th key={h} style={{ textAlign:"left", padding:"8px 12px", color:C.muted,
            borderBottom:`1px solid ${C.line}`, fontWeight:500 }}>{h}</th>
        ))}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ borderBottom:`1px solid ${C.line}`,
            background: highlight && i === rows.length - 1 ? "rgba(54,211,153,0.05)" : "transparent" }}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding:"10px 12px",
                color: j === 0 ? C.text : j === row.length - 1 && highlight ? C.green : C.sub }}>
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
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
      `}</style>

      {/* Nav */}
      <nav style={{ position:"sticky", top:0, zIndex:50, background:"rgba(4,6,13,0.92)",
        backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.line}`,
        padding:"0 24px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <Link to="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" stroke={C.blue} strokeWidth="1.5"/>
            <path d="M12 7 L16.5 9.5 V14.5 L12 17 L7.5 14.5 V9.5 Z" fill={C.blue} fillOpacity="0.3" stroke={C.blue} strokeWidth="1.1"/>
          </svg>
          <span style={{ fontFamily:disp, fontSize:15, fontWeight:700, color:C.text }}>DealFlow<span style={{ color:C.blue }}> AI</span></span>
        </Link>
        <div style={{ display:"flex", gap:24, alignItems:"center" }}>
          {[["Screener","/screener"],["Methodology","/methodology"]].map(([label, path]) => (
            <Link key={label} to={path} style={{ fontFamily:disp, fontSize:14, fontWeight:500,
              color: label === "Methodology" ? C.blue : C.sub }}>
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth:760, margin:"0 auto", padding:"72px 24px 120px" }}>

        {/* Header */}
        <div style={{ marginBottom:64 }}>
          <div style={{ fontFamily:mono, fontSize:11, color:C.blue, letterSpacing:2,
            textTransform:"uppercase", marginBottom:16 }}>METHODOLOGY</div>
          <h1 style={{ fontFamily:disp, fontSize:"clamp(32px,5vw,44px)", fontWeight:800,
            lineHeight:1.1, color:C.text, marginBottom:20, letterSpacing:"-0.02em" }}>
            How DealFlow AI works
          </h1>
          <P style={{ fontSize:18, color:C.sub }}>
            An honest account of the data, model, and validation behind the acquisition signal scores.
            Every number below comes from real backtests — not cherry-picked cross-validation.
          </P>
        </div>

        {/* The core claim */}
        <Section title="The defensible claim" tag="The core number">
          <div style={{ background:C.panelHi, border:`1px solid ${C.line}`, borderRadius:12,
            padding:"28px 32px", marginBottom:24 }}>
            <StatRow value="3.08×" label="mean top-decile lift, walk-forward 2020–2024" />
            <StatRow value="0.97×" label="placebo lift on shuffled labels" note="signal/noise: 3.17×" />
          </div>
          <P>
            The top 10% of companies ranked by DealFlow AI were acquired at 3.08× the rate of a random
            selection — tested on years the model never trained on. A placebo test with shuffled labels
            collapses lift to 0.97×, confirming the signal is real and not a data artifact.
          </P>
          <P>
            Training set: <strong style={{ color:C.text }}>264 verified acquisitions</strong> across{" "}
            <strong style={{ color:C.text }}>27,949 company-year observations</strong> (0.945% base rate).
            Ground truth: <strong style={{ color:C.text }}>100 hand-verified acquisition events</strong>{" "}
            cross-referenced against SEC 8-K filings, each with a confirmed announcement date and acquirer.
          </P>
        </Section>

        {/* Walk-forward backtest explained */}
        <Section title="The walk-forward backtest explained" tag="Time-honest validation">
          <P>
            Standard cross-validation randomly mixes train and test samples across time. This inflates
            lift because the model inadvertently trains on future patterns. Walk-forward validation
            enforces strict temporal separation: train only on observations before year Y, predict Y.
          </P>
          <P>
            Each row in the table below is an independent experiment. The model in 2021 never saw a
            single data point from 2021 — it was trained entirely on 2009–2020 observations.
          </P>
          <Table
            headers={["Test year", "Train rows", "Train positives", "Test positives", "Lift@10%"]}
            rows={[
              ["2020", "14,426", "165", "15", "2.00×"],
              ["2021", "16,902", "180", "26", "4.24×"],
              ["2022", "19,519", "206", "32", "3.44×"],
              ["2023", "22,444", "238", "22", "3.18×"],
              ["2024 *", "25,556", "260", "4", "2.50×"],
              ["Mean (all)", "—", "—", "—", "3.08×"],
            ]}
            highlight={true}
          />
          <P style={{ fontSize:13, color:C.muted }}>
            * 2024 has only 4 test positives — high variance, included in mean for conservatism.
            Excluding 2024, mean lift is 3.22×.
          </P>
          <P>
            The placebo test runs the identical procedure with randomly shuffled acquisition labels.
            Real lift (3.08×) vs. placebo lift (0.97×) = signal/noise ratio of 3.17×. This rules out
            overfitting, data leakage, and lucky class imbalance.
          </P>
        </Section>

        {/* Why not XGBoost */}
        <Section title="Why not XGBoost?" tag="Model choice rationale">
          <P>
            We ran the experiment. XGBoost hit 4.5× cross-validation lift vs. 3.9× for logistic
            regression — a result any ML paper would highlight. But walk-forward performance told a
            different story:
          </P>
          <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:10,
            padding:"20px 24px", marginBottom:20 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:4 }}>
              {[
                ["Model", "CV Lift", "Walk-Forward Lift"],
                ["Logistic (L1)", "3.93×", "3.08×"],
                ["XGBoost", "4.50×", "2.82×"],
              ].map((row, i) => (
                <React.Fragment key={i}>
                  {row.map((cell, j) => (
                    <div key={j} style={{ fontFamily:mono, fontSize:13,
                      color: i === 0 ? C.muted : j === 2 ? (i === 1 ? C.green : C.red) : C.text,
                      fontWeight: i === 0 || j === 0 ? 500 : 400,
                      borderBottom: i === 0 ? `1px solid ${C.line}` : "none",
                      paddingBottom: i === 0 ? 8 : 0 }}>
                      {cell}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
          <P>
            XGBoost degraded 37% from CV to walk-forward. Logistic degraded 22%. With only 264
            positives in the training set, gradient boosting memorizes noise — it finds patterns that
            look real in-sample but don't generalize to future years.
          </P>
          <P>
            The second reason is interpretability. A logistic model's coefficients are readable: a
            corp dev analyst can audit exactly which financial metrics drive each score, and push
            back if something looks wrong. A gradient-boosted forest with 500 trees cannot be audited
            the same way. For a product selling to finance professionals, that auditability matters.
          </P>
          <P>
            When the training set reaches ~500 verified acquisitions, we'll revisit gradient boosting.
            Until then, the interpretable model with honest walk-forward metrics is the right call.
          </P>
        </Section>

        {/* Data sources */}
        <Section title="Data sources" tag="Ground truth">
          <div style={{ display:"grid", gap:16, marginBottom:24 }}>
            {[
              ["SEC EDGAR (XBRL)", "Primary financial source. Revenue, gross margin, operating margin, revenue growth — all pulled from quarterly XBRL filings, 2009–2024. Point-in-time safe: each observation uses only data available as of that quarter's filing date."],
              ["SEC Form 4 (insider transactions)", "Net buy/sell ratio, officer purchase volume across trailing 90-day and 180-day windows. Covers 19.5% of the panel after a full entity breadth pass across 893 companies."],
              ["Gold set (ground truth)", "100 manually verified acquisition targets. Each label was confirmed against the SEC 8-K filing body — not just the filing date. Announcement date, acquirer name, and deal type verified for all 100."],
            ].map(([title, desc]) => (
              <div key={title} style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:8, padding:"20px 24px" }}>
                <div style={{ fontFamily:mono, fontSize:13, color:C.blue, marginBottom:8 }}>{title}</div>
                <P style={{ marginBottom:0, fontSize:15 }}>{desc}</P>
              </div>
            ))}
          </div>
        </Section>

        {/* Honest limitations */}
        <Section title="Honest limitations" tag="What we don't claim">
          <div style={{ display:"grid", gap:0 }}>
            {[
              ["Universe size", "27,949 company-year observations, 264 positives. 2024 test set has 4 positives — the 2.50× lift number carries high variance."],
              ["Gross margin gap", "36% of entities don't file CostOfRevenue in XBRL. We impute using sector-year medians, flagged explicitly as a training feature."],
              ["No macro signal", "No interest rate, deal-volume, or multiple-compression variables. The model's 2022 lift (3.44×) held despite a compressed market — but that may not repeat."],
              ["Survival bias", "The negative class is companies that existed and weren't acquired. Companies that delisted for other reasons may bias the negatives slightly."],
              ["Static predictions", "Scores reflect the most recent quarterly financials — not real-time market moves, management changes, or strategic announcements."],
            ].map(([label, desc]) => (
              <div key={label} style={{ display:"grid", gridTemplateColumns:"160px 1fr", gap:16,
                padding:"16px 0", borderBottom:`1px solid ${C.line}` }}>
                <span style={{ fontFamily:mono, fontSize:13, color:C.amber, paddingTop:2 }}>{label}</span>
                <P style={{ marginBottom:0, fontSize:15 }}>{desc}</P>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <div style={{ textAlign:"center", paddingTop:32 }}>
          <Link to="/screener" style={{ display:"inline-block", padding:"14px 32px",
            background:C.blue, borderRadius:8, fontFamily:disp, fontSize:15,
            fontWeight:600, color:"#fff" }}>
            See the screener →
          </Link>
          <P style={{ marginTop:16, fontSize:14 }}>
            65 public SaaS companies ranked using this model.
          </P>
        </div>

      </div>
    </div>
  );
}
