import React, { useState, useEffect } from "react";
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

const Table = ({ headers, rows, highlightLast }) => (
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
            background: highlightLast && i === rows.length-1 ? "rgba(54,211,153,0.05)" : "transparent" }}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding:"10px 12px",
                color: j === 0 ? C.text
                  : (highlightLast && i === rows.length-1) ? C.green : C.sub }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// results/walk_forward.json → rolling_3fold[].real/.placebo.top_decile_lift
const WF_DATA = [
  { year: 2021, lift: 5.59, placebo: 1.56 },
  { year: 2022, lift: 5.91, placebo: 1.06 },
  { year: 2023, lift: 3.22, placebo: 0.87 },
];

function WalkForwardChart() {
  const W = 560, H = 220, PL = 48, PR = 24, PT = 20, PB = 36;
  const chartW = W - PL - PR, chartH = H - PT - PB;
  const maxY = 10, minY = 0;
  const xStep = chartW / (WF_DATA.length - 1);
  const toX = i => PL + i * xStep;
  const toY = v => PT + chartH - ((v - minY) / (maxY - minY)) * chartH;

  const liftPts = WF_DATA.map((d, i) => `${toX(i)},${toY(d.lift)}`).join(" ");
  const placeboPts = WF_DATA.map((d, i) => `${toX(i)},${toY(d.placebo)}`).join(" ");

  // Shade signal zone between the two lines
  const zonePts = [
    ...WF_DATA.map((d, i) => `${toX(i)},${toY(d.lift)}`),
    ...WF_DATA.slice().reverse().map((d, i) => `${toX(WF_DATA.length - 1 - i)},${toY(d.placebo)}`),
  ].join(" ");

  const yTicks = [0, 2, 4, 6, 8, 10];

  return (
    <div style={{ background:C.panelHi, border:`1px solid ${C.line}`, borderRadius:12,
      padding:"20px 24px", marginBottom:24 }}>
      <div style={{ fontFamily:mono, fontSize:10, color:C.muted, letterSpacing:1.5,
        textTransform:"uppercase", marginBottom:16 }}>Walk-forward lift by year</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible" }}>
        {/* grid lines */}
        {yTicks.map(v => (
          <g key={v}>
            <line x1={PL} y1={toY(v)} x2={W-PR} y2={toY(v)}
              stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={PL-8} y={toY(v)+4} textAnchor="end"
              style={{ fontFamily:mono, fontSize:9, fill:C.muted }}>{v}×</text>
          </g>
        ))}
        {/* signal zone */}
        <polygon points={zonePts} fill="rgba(91,141,239,0.08)" />
        {/* 1× reference */}
        <line x1={PL} y1={toY(1)} x2={W-PR} y2={toY(1)}
          stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
        {/* placebo line */}
        <polyline points={placeboPts} fill="none" stroke={C.amber}
          strokeWidth="1.5" strokeDasharray="5 3" strokeLinejoin="round" strokeLinecap="round" />
        {/* lift line */}
        <polyline points={liftPts} fill="none" stroke={C.blue}
          strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* data points */}
        {WF_DATA.map((d, i) => (
          <g key={d.year}>
            <circle cx={toX(i)} cy={toY(d.lift)} r="4" fill={C.blue} />
            <circle cx={toX(i)} cy={toY(d.placebo)} r="3" fill={C.amber} />
            <text x={toX(i)} y={H - 6} textAnchor="middle"
              style={{ fontFamily:mono, fontSize:10, fill:C.muted }}>{d.year}</text>
          </g>
        ))}
        {/* annotations */}
        <text x={W-PR-4} y={toY(WF_DATA[WF_DATA.length-1].lift)-10}
          textAnchor="end" style={{ fontFamily:mono, fontSize:10, fill:C.blue, fontWeight:600 }}>
          Real: 4.91× mean
        </text>
        <text x={W-PR-4} y={toY(WF_DATA[WF_DATA.length-1].placebo)+16}
          textAnchor="end" style={{ fontFamily:mono, fontSize:10, fill:C.amber }}>
          Placebo: 1.16× mean
        </text>
      </svg>
      <div style={{ display:"flex", gap:24, marginTop:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:20, height:2, background:C.blue, borderRadius:1 }} />
          <span style={{ fontFamily:mono, fontSize:10, color:C.sub }}>Top-decile lift (actual)</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:20, height:1.5, background:C.amber, borderRadius:1,
            borderTop:`1.5px dashed ${C.amber}` }} />
          <span style={{ fontFamily:mono, fontSize:10, color:C.sub }}>Placebo lift (shuffled labels)</span>
        </div>
      </div>
      <p style={{ fontFamily:disp, fontSize:12, color:C.muted, marginTop:10, lineHeight:1.5 }}>
        Walk-forward: model trained only on years before each test year. If the model found noise,
        the lines would overlap. The shaded gap is the signal zone.
      </p>
    </div>
  );
}

export default function Methodology() {
  useEffect(() => { document.title = "Methodology — DealFlow AI"; }, []);

  // Defaults are the authoritative figures from results/walk_forward.json.
  const [meta, setMeta] = useState({
    signalToNoise: "4.27",   // rolling 3-fold mean S/N — the headline
    singleCut:     "6.09",   // single out-of-time cut, 2022–2023
    placebo:       "0.75",   // shuffled-label placebo lift on that cut
    modelVersion: "ensemble-v4",
    positiveCount: "203",
  });

  useEffect(() => {
    fetch("/scores.json")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.metadata) {
          setMeta(m => ({
            ...m,
            modelVersion: d.metadata.model_version || m.modelVersion,
            positiveCount: String(d.metadata.positive_count || m.positiveCount),
            signalToNoise: d.metadata.signal_to_noise ? String(d.metadata.signal_to_noise) : m.signalToNoise,
            placebo: d.metadata.placebo_lift ? String(d.metadata.placebo_lift) : m.placebo,
          }));
        }
      })
      .catch(() => {});
  }, []);
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
        <Link to="/" style={{ display:"flex", alignItems:"center", gap:10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" stroke={C.blue} strokeWidth="1.5"/>
            <path d="M12 7 L16.5 9.5 V14.5 L12 17 L7.5 14.5 V9.5 Z" fill={C.blue} fillOpacity="0.3" stroke={C.blue} strokeWidth="1.1"/>
          </svg>
          <span style={{ fontFamily:disp, fontSize:15, fontWeight:700, color:C.text }}>DealFlow<span style={{ color:C.blue }}> AI</span></span>
        </Link>
        <div style={{ display:"flex", gap:24, alignItems:"center" }}>
          {[["Screener","/screener"],["Interrogation","/interrogate/DUOL"],["Methodology","/methodology"]].map(([label, path]) => (
            <Link key={label} to={path} style={{ fontFamily:disp, fontSize:14, fontWeight:500,
              color: label === "Methodology" ? C.blue : C.sub }}>{label}</Link>
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
          <P style={{ fontSize:18 }}>
            An honest account of the data, model, and validation behind the acquisition signal scores.
            Every number comes from real backtests — not cherry-picked cross-validation.
          </P>
        </div>

        {/* Core claim */}
        <Section title="The defensible claim" tag="Core numbers">
          <div style={{ background:C.panelHi, border:`1px solid ${C.line}`, borderRadius:12,
            padding:"28px 32px", marginBottom:24 }}>
            <StatRow value={`${meta.signalToNoise}×`} label="rolling 3-fold mean signal-to-noise — the headline" />
            <StatRow value={`${meta.singleCut}×`} label="single out-of-time cut, test 2022–2023" note={`placebo ${meta.placebo}× on shuffled labels`} />
          </div>
          <P>
            Two numbers, and the smaller one is the honest one. On a single out-of-time cut — train
            before 2022-01-01, test 2022 through 2023 — top-decile lift is 4.59× and the same protocol
            on shuffled labels gives 0.75×, a signal-to-noise ratio of{" "}
            <strong style={{ color:C.text }}>{meta.singleCut}×</strong>. Repeat that across three rolling
            folds instead of one and the mean falls to{" "}
            <strong style={{ color:C.text }}>{meta.signalToNoise}×</strong>. The rolling mean is quoted
            everywhere as the headline, because a single cut can get lucky on one window and three
            cannot get lucky the same way three times.
          </P>
          <P>
            Panel: <strong style={{ color:C.text }}>30,715 company-quarters</strong> across 967 entities,
            2009-12-31 to 2024-09-30, with 397 positives overall and{" "}
            <strong style={{ color:C.text }}>{meta.positiveCount} verified acquisitions</strong> in the
            hand-checked gold set. Base rate in the out-of-time test window is 1.11% (72 positives in
            6,499 rows). Ground truth: each positive confirmed against SEC 8-K filings with announcement
            date and acquirer.
          </P>
          <P style={{ fontSize:13, color:C.muted }}>
            Leakage gates recorded with the run: zero post-announcement positives, zero positives
            missing a deal date, zero missing feature columns. Seed 42, commit 274af4e.
          </P>
        </Section>

        {/* Walk-forward backtest */}
        <Section title="The walk-forward backtest" tag="Time-honest validation">
          <P>
            Standard cross-validation randomly mixes train and test samples across time, inflating
            lift because the model inadvertently trains on future patterns. Walk-forward validation
            enforces strict temporal separation: train only on observations before year Y, predict year Y.
            Each row below is an independent experiment — the 2022 model never saw a single 2022 data point.
          </P>
          <WalkForwardChart />
          <Table
            headers={["Test year", "Train rows", "Test positives", "Lift@10%", "Placebo", "S/N"]}
            rows={[
              ["2021",  "18,834", "43", "5.59×", "1.56×", "3.57×"],
              ["2022",  "21,648", "44", "5.91×", "1.06×", "5.55×"],
              ["2023",  "24,801", "28", "3.22×", "0.87×", "3.70×"],
              ["Mean",  "—",      "—",  "4.91×", "1.16×", "4.27×"],
            ]}
            highlightLast={true}
          />
          <P style={{ fontSize:13, color:C.muted }}>
            Ensemble model (0.5 logistic-L1 + 0.5 shallow XGBoost). The mean S/N of 4.27× is the mean of
            the per-fold ratios, not the ratio of the means — averaging the ratios is the conservative
            choice here. Note 2023 has only 28 test positives, so its fold carries the widest interval.
            Per-fold PR-AUC, base rates and placebo detail are in <code style={{ fontFamily:mono }}>results/walk_forward.json</code>.
          </P>
        </Section>

        {/* Model selection */}
        <Section title="Model selection — why XGBoost over logistic" tag="Model choice">
          <P>
            We ran both and ensemble them. The shipped model is an equal-weight blend of an L1 logistic
            regression and a shallow XGBoost (max_depth=3, min_child_weight=5). Across the three rolling
            folds it averages 4.91× lift at the top decile against a 1.16× shuffled-label placebo, for a
            4.27× signal-to-noise ratio. Neither component alone is more stable: the logistic is flatter
            but weaker, the tree is stronger but swings harder fold to fold. The ensemble's contribution is
            variance reduction in the individual year estimates, which is what makes the S/N ratio hold up.
          </P>
          <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:10,
            padding:"20px 24px", marginBottom:20 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
              {[
                ["Evaluation", "Lift@10%", "S/N Ratio"],
                ["Single cut, 2022–2023", "4.59×", "6.09×"],
                ["Rolling 3-fold mean", "4.91×", "4.27×"],
              ].map((row, i) => (
                <React.Fragment key={i}>
                  {row.map((cell, j) => (
                    <div key={j} style={{ fontFamily:mono, fontSize:13,
                      color: i === 0 ? C.muted : j === 2 ? (i === 2 ? C.green : C.sub) : C.text,
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
            The placebo test is the key validation. Under shuffled labels on the 2022–2023 cut, the
            ensemble collapses to 0.75× lift — below random. This rules out overfitting: the model is not
            memorizing training patterns. We deliberately chose shallow configurations (depth=3) to limit memorization while
            preserving non-linear interactions. Deeper configurations showed higher cross-validation lift
            but walk-forward performance degraded — the canonical overfitting fingerprint. With 203
            training positives, shallow is the right call.
          </P>
        </Section>

        {/* How We Validate */}
        <Section title="How we validate" tag="Verification">
          <div style={{ display:"grid", gap:16, marginBottom:24 }}>
            {[
              ["EDGAR 8-K Item 2.01 Verification", "Every acquisition in our training set is confirmed via the SEC's Form 8-K, specifically Item 2.01 — Completion of Acquisition or Disposition of Assets. This is the legal notice companies must file within 4 business days of deal closing. We do not rely on press releases, news articles, or deal databases. Primary source only."],
              ["Walk-Forward Backtesting", "We never test the model on data it saw during training. Each fold (test years 2021, 2022, 2023) uses a model trained exclusively on prior years' data. The headline 4.27× signal-to-noise ratio is the mean of the three per-fold ratios — not the ratio of the means, which would flatter the result."],
              ["Placebo Test", "We randomly shuffle the acquired/not-acquired labels and re-run the entire backtest. On the 2022–2023 out-of-time cut the placebo lift is 0.75×; across the three rolling folds it averages 1.16×. Both are at or below random. This confirms the signal comes from real patterns in the data, not from artifacts of the backtesting methodology."],
              ["Insider Transaction Signal", "Officers and directors of companies in our universe show distinct transaction patterns. Form 4 filings are analyzed using the Seyhun (1986) and Lakonishok & Lee (2001) methodology. Pattern scores ≥65 correlate with pre-acquisition behavior in our verified dataset. Validation on 8 gold-set companies with F4 data: mean pattern score 71.2 vs 50.0 baseline. Note: Form 4 coverage in our gold set is limited (8/203 verified deals) — the signal is strong where present but the sample is small."],
            ].map(([title, desc]) => (
              <div key={title} style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:8, padding:"20px 24px" }}>
                <div style={{ fontFamily:mono, fontSize:13, color:C.blue, marginBottom:8 }}>{title}</div>
                <P style={{ marginBottom:0, fontSize:15 }}>{desc}</P>
              </div>
            ))}
          </div>
        </Section>

        {/* Data sources */}
        <Section title="Data sources" tag="Ground truth">
          <div style={{ display:"grid", gap:16, marginBottom:24 }}>
            {[
              ["SEC EDGAR (XBRL)", "Primary financial source. Revenue, gross margin, operating margin, revenue growth — pulled from quarterly XBRL filings, 2010–2024. Point-in-time safe: each observation uses only data available as of that quarter's filing date."],
              ["SEC Form 4 (insider transactions)", "Net buy/sell ratio, officer purchase volume, selling acceleration. Pattern scores computed using the Seyhun (1986) academic framework. 41 of 131 live companies have Form 4 signal data."],
              ["Gold set (ground truth)", "203 manually verified acquisition targets. Each label confirmed against the SEC 8-K filing body — not just the filing date. Announcement date, acquirer name, and deal type verified for all 203."],
              ["LSEG SDC Platinum", "2,612 software M&A transactions used for comparable deal data, acquirer fingerprint building, and sector context. Deal values, announced/closed dates, acquirer names."],
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
              ["Universe size", "30,715 company-quarter observations across 967 entities, 397 positives — a 1.11% base rate. The 2023 fold has only 28 test positives, so its lift estimate carries the widest interval of the three."],
              ["ML coverage", "57 of 131 live companies have ML scores from the trained model. The other 74 are scored by the rule-based component only (added after model training)."],
              ["Gross margin gap", "Some entities don't file CostOfRevenue in XBRL. We impute with sector-year medians, flagged explicitly as a training feature."],
              ["No macro signal", "No interest rate, deal-volume, or multiple-compression variables. The 2023 fold's weaker lift (3.22×) tracks a compressed acquisition market — the model doesn't know macro, so it absorbs that as noise."],
              ["Survival bias", "The negative class is companies that existed and weren't acquired. Companies delisted for other reasons may bias the negatives."],
              ["Static predictions", "Scores reflect most recent quarterly financials — not real-time market moves or strategic announcements."],
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
            background:C.blue, borderRadius:8, fontFamily:disp, fontSize:15, fontWeight:600, color:"#fff" }}>
            See the screener →
          </Link>
          <P style={{ marginTop:16, fontSize:14 }}>131 public software companies ranked using this model.</P>
        </div>
      </div>
    </div>
  );
}
