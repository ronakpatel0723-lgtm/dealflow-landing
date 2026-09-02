import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const C = {
  bg: "#04060D", panel: "#0A0E1A", panelHi: "#0E1424",
  line: "rgba(255,255,255,0.08)", lineHi: "rgba(255,255,255,0.16)",
  text: "#F3F6FD", sub: "#9BA8C6", muted: "#5C6880",
  blue: "#5B8DEF", green: "#36D399", amber: "#F5C24B",
};
const disp = "'Bricolage Grotesque', -apple-system, sans-serif";
const mono = "'IBM Plex Mono', ui-monospace, Menlo, monospace";

const P = ({ children, style = {} }) => (
  <p style={{ fontFamily: disp, fontSize: 16, lineHeight: 1.8, color: C.sub, marginBottom: 20, ...style }}>
    {children}
  </p>
);

const PullQuote = ({ children }) => (
  <div style={{
    borderLeft: `3px solid ${C.blue}`, paddingLeft: 24, margin: "32px 0",
    fontFamily: mono, fontSize: 14, color: C.text, lineHeight: 1.6,
  }}>
    {children}
  </div>
);

const StatStrip = ({ stats }) => (
  <div className="df-stat-strip" style={{
    display: "flex", gap: 0, background: C.panel,
    border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden", margin: "28px 0",
  }}>
    {stats.map((s, i) => (
      <div key={i} style={{
        flex: 1, padding: "18px 20px",
        borderRight: i < stats.length - 1 ? `1px solid ${C.line}` : "none",
      }}>
        <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 600, color: C.text }}>{s.value}</div>
        <div style={{ fontFamily: disp, fontSize: 12, color: C.muted, marginTop: 4 }}>{s.label}</div>
      </div>
    ))}
  </div>
);

export default function Research() {
  useEffect(() => { document.title = "Research — DealFlow AI"; }, []);

  const [topTargets, setTopTargets] = useState([]);
  const [topPick, setTopPick] = useState("VRNS");

  useEffect(() => {
    fetch("/scores.json")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.companies) {
          const high = data.companies
            .filter(c => c.tier === "High")
            .sort((a, b) => (b.total_score ?? 0) - (a.total_score ?? 0))
            .slice(0, 5)
            .map(c => ({
              ticker: c.ticker,
              name: c.company || c.ticker,
              score: Math.round(c.total_score ?? 0),
              topFactor: c.shap_factors?.top_positive?.[0]?.display
                || (c.subScores ? Object.entries(c.subScores).sort((a,b)=>b[1]-a[1])[0]?.[0] : null)
                || c.rationale?.split(".")[0]?.slice(0, 50)
                || "—",
              thesis_preview: c.thesis_preview || null,
              has_thesis: c.has_thesis || false,
            }));
          setTopTargets(high);
          if (high.length > 0) setTopPick(high[0].ticker);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        @media(max-width:540px){.df-stat-strip{flex-wrap:wrap!important}.df-stat-strip>div{flex:1 1 40%!important;border-right:none!important;border-bottom:1px solid rgba(255,255,255,0.08)}}
      `}</style>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50, background: "rgba(4,6,13,0.92)",
        backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.line}`,
        padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" stroke={C.blue} strokeWidth="1.5" />
            <path d="M12 7 L16.5 9.5 V14.5 L12 17 L7.5 14.5 V9.5 Z" fill={C.blue} fillOpacity="0.3" stroke={C.blue} strokeWidth="1.1" />
          </svg>
          <span style={{ fontFamily: disp, fontSize: 15, fontWeight: 700 }}>
            DealFlow<span style={{ color: C.blue }}> AI</span>
          </span>
        </Link>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {[["Screener", "/screener"], ["Methodology", "/methodology"], ["Interrogation", "/interrogate/DUOL"], ["Research", "/research"]].map(([label, path]) => (
            <Link key={label} to={path} style={{
              fontFamily: disp, fontSize: 14, fontWeight: 500,
              color: label === "Research" ? C.blue : C.sub,
            }}>{label}</Link>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "72px 24px 120px" }}>

        {/* Page header */}
        <div style={{ marginBottom: 72 }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.blue, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
            Research
          </div>
          <h1 style={{ fontFamily: disp, fontSize: "clamp(30px,5vw,44px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 20 }}>
            The thinking behind the signal.
          </h1>
          <P style={{ fontSize: 18, color: C.sub }}>
            A transparent account of how DealFlow AI was built, what it measures, and why the numbers are defensible.
          </P>
        </div>

        {/* ── SECTION 1: The Signal ── */}
        <section style={{ borderTop: `1px solid ${C.line}`, paddingTop: 48, marginBottom: 56 }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.blue, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>
            Section 1 · The Signal
          </div>
          <h2 style={{ fontFamily: disp, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 24 }}>
            4.27× signal-to-noise: what it means and why it matters
          </h2>

          <P>
            DealFlow AI is not a prediction engine. No tool predicts when a board will accept an offer. What it does is
            more tractable: it identifies the <strong style={{ color: C.text }}>financial signature that precedes
            acquisitions</strong> — revenue scale, margin quality, Rule of 40, insider activity — and ranks companies
            by how strongly they exhibit that signature. The top decile is where deals tend to cluster. The
            bottom decile is where they almost never happen. The model is a prioritization tool, not a forecast.
          </P>

          <P>
            The core result is a <strong style={{ color: C.text }}>walk-forward backtest</strong>: train only on
            observations before year Y, predict year Y, never allow future data to bleed into training. Each fold is an
            independent experiment — the 2022 model never saw a single 2022 data point. This is
            the same validation discipline used in quantitative finance, and it produces a meaningfully harder test
            than standard cross-validation, which can inadvertently mix train and test across time.
          </P>

          <PullQuote>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 480 }}>
              <div>
                <div style={{ fontFamily: mono, fontSize: 32, fontWeight: 600, color: C.green }}>4.27×</div>
                <div style={{ fontFamily: disp, fontSize: 13, color: C.sub, marginTop: 4 }}>rolling 3-fold mean signal-to-noise (lift 4.91× / placebo 1.16×)</div>
              </div>
              <div>
                <div style={{ fontFamily: mono, fontSize: 32, fontWeight: 600, color: C.muted }}>0.75×</div>
                <div style={{ fontFamily: disp, fontSize: 13, color: C.sub, marginTop: 4 }}>placebo lift on the 2022–2023 cut — below random</div>
              </div>
            </div>
          </PullQuote>

          <P>
            Two numbers are reported and the smaller one is the honest one. A single out-of-time cut on 2022–2023
            gives 4.59× lift against a 0.75× shuffled-label placebo — a 6.09× ratio. But one cut is one draw, and
            quoting it alone would be cherry-picking the best window. Rolling the protocol across three folds
            (test years 2021, 2022, 2023) gives 4.91× mean lift against 1.16× mean placebo, and averaging the
            per-fold ratios rather than taking the ratio of the means gives <strong style={{ color: C.text }}>4.27×</strong>.
            That is the headline figure, and it is deliberately the more conservative of the two.
          </P>

          <P>
            The placebo test is what makes either number meaningful. Take the same model, same features, same
            walk-forward protocol — but randomly shuffle the acquisition labels. If the signal were an artifact of
            the backtesting machinery, lift would persist under shuffling. It doesn't: placebo lift lands at or
            below 1.0× in every fold. The ratio of real lift to placebo lift is the honest measure of how much
            information the model carries beyond noise. Per-fold lift, placebo, PR-AUC and base rates are in{" "}
            <code style={{ fontFamily: mono, fontSize: 13 }}>results/walk_forward.json</code>.
          </P>
        </section>

        {/* ── SECTION 2: The Data ── */}
        <section style={{ borderTop: `1px solid ${C.line}`, paddingTop: 48, marginBottom: 56 }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.blue, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>
            Section 2 · The Data
          </div>
          <h2 style={{ fontFamily: disp, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 24 }}>
            203 verified acquisitions, independently confirmed
          </h2>

          <StatStrip stats={[
            { value: "203", label: "verified acquisitions" },
            { value: "30,715", label: "panel rows" },
            { value: "131", label: "live companies" },
            { value: "15 yrs", label: "2010–2024" },
          ]} />

          <P>
            Every acquisition in the training set was confirmed against the SEC EDGAR 8-K filing body — specifically
            Item 2.01 (Completion of Acquisition) or Item 1.01 (Entry into a Material Definitive Agreement). The
            announcement date was parsed from the filing text, not the filing date. These differ by days to weeks,
            and getting the date wrong by even one quarter can corrupt a point-in-time feature. Each label was
            cross-referenced against LSEG SDC Platinum to confirm acquirer name and deal type. Mergers-of-equals,
            SPACs, going-private recaps, and management buyouts were excluded — only strategic acquisitions by
            operating companies remained.
          </P>

          <P>
            The contamination cleaning process removed five categories of false positives discovered during
            development: gaming companies (Zynga, Take-Two) with M&A activity that was not software-on-software;
            crypto-adjacent names (Riot Platforms); direction errors where a company was the acquirer, not the
            target (Veritone); SPAC mergers (AvePoint, WM Technology); and government IT contractors (CSRA, KEYW).
            Each category was caught because a domain expert would immediately recognize it as wrong — building that
            checklist before training was the most important data quality step in the project.
          </P>
        </section>

        {/* ── SECTION 3: The Universe ── */}
        <section style={{ borderTop: `1px solid ${C.line}`, paddingTop: 48, marginBottom: 56 }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.blue, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>
            Section 3 · The Universe
          </div>
          <h2 style={{ fontFamily: disp, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 24 }}>
            Every public software company. Not just the ones that survived.
          </h2>

          <P>
            Survivorship bias is the most dangerous artifact in M&A prediction. If your training set only contains
            companies that are still public today, you have implicitly excluded every company that was acquired —
            the exact positive class you are trying to predict. A model trained on survivors will undercount
            acquisition likelihood, because the best targets have already been absorbed. The base rate in a
            survivor-only dataset is artificially low, and the model learns to discount exactly the features
            that make companies attractive to acquirers.
          </P>
          <P>
            DealFlow AI's panel includes <strong style={{ color: C.text }}>967 unique entities</strong> across
            15 years, including all companies that were acquired and delisted during that period. The result is a
            training set where the acquisition base rate (1.11% per company-quarter) reflects the true historical
            rate, not a rate suppressed by survivorship. When the model scores a company highly, it has learned
            that pattern from a dataset that includes the full consequence of that pattern — including the companies
            that were taken private precisely because of it.
          </P>
        </section>

        {/* ── SECTION 4: Current High-Conviction Targets ── */}
        {topTargets.length > 0 && (
          <section style={{ borderTop: `1px solid ${C.line}`, paddingTop: 48, marginBottom: 56 }}>
            <div style={{ fontFamily: mono, fontSize: 11, color: C.blue, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>
              Section 4 · Current Rankings
            </div>
            <h2 style={{ fontFamily: disp, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 24 }}>
              High-conviction targets — live
            </h2>
            <P>
              The five companies currently ranked highest by the model. Scores reflect the most recent quarterly
              XBRL data. Updated weekly.
            </P>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
              {topTargets.map((t, i) => (
                <Link key={t.ticker} to={`/company/${t.ticker}`} style={{
                  display: "grid", gridTemplateColumns: "32px 1fr auto auto",
                  alignItems: "center", gap: 16, padding: "16px 24px",
                  borderBottom: i < topTargets.length - 1 ? `1px solid ${C.line}` : "none",
                  textDecoration: "none",
                  transition: "background 0.15s",
                }} onMouseEnter={e => e.currentTarget.style.background = C.panelHi}
                   onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <span style={{ fontFamily: disp, fontSize: 15, fontWeight: 600 }}>{t.name}</span>
                    <span style={{ fontFamily: mono, fontSize: 11, color: C.sub, marginLeft: 8 }}>{t.ticker}</span>
                    <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginTop: 2 }}>Top signal: {t.topFactor}</div>
                    {t.thesis_preview && (
                      <div style={{ fontFamily: mono, fontSize: 11, color: C.sub, marginTop: 6, maxWidth: 520, lineHeight: 1.5 }}>
                        {t.thesis_preview}
                        {t.has_thesis && <span style={{ color: C.blue, marginLeft: 6 }}>Read full thesis →</span>}
                      </div>
                    )}
                  </div>
                  <span style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: C.green }}>{t.score}</span>
                  <span style={{ fontFamily: mono, fontSize: 10, color: C.blue }}>→</span>
                </Link>
              ))}
            </div>
            <P style={{ fontSize: 13, color: C.muted }}>
              Click any row to see the full company profile with SHAP factor breakdown.
            </P>
          </section>
        )}

        {/* ── SECTION 5: Why This Matters for Corp Dev ── */}
        <section style={{ borderTop: `1px solid ${C.line}`, paddingTop: 48, marginBottom: 56 }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.blue, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>
            Section 5 · For Corp Dev
          </div>
          <h2 style={{ fontFamily: disp, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 24 }}>
            What a corp dev team would actually do with this
          </h2>
          <P>
            The practical unit of value is analyst hours, not predictions. A corp dev team can only diligence a
            handful of names per quarter, and the cost of the screening step is that most of the names reviewed
            turn out to be nothing. Lift at the top decile is a direct measure of how much that cost falls.
          </P>
          <P>
            At 4.91× mean lift, reviewing the top decile of the ranking historically surfaced roughly{" "}
            <strong style={{ color: C.text }}>5× more eventual acquisitions than reviewing the same number of
            companies at random</strong> from the same universe. Against a 1.11% base rate that is still a
            low absolute hit rate — most top-decile names are not acquired. The claim is relative, not absolute:
            the ranking reorders the queue, it does not tell you the answer.
          </P>
          <P>
            So this is a prioritization filter, not a forecast. The question isn't
            whether <strong style={{ color: C.text }}>{topPick}</strong> will be acquired — it's whether it belongs
            in the first ten names an analyst opens rather than the last ten. That is a narrower claim than
            "predicts M&A," and it's the one the validation actually supports.
          </P>
        </section>

        {/* CTA */}
        <div style={{ textAlign: "center", paddingTop: 16 }}>
          <Link to="/methodology" style={{
            display: "inline-block", padding: "14px 32px", background: C.blue,
            borderRadius: 8, fontFamily: disp, fontSize: 15, fontWeight: 600, color: "#fff",
          }}>
            Full methodology with backtest tables →
          </Link>
          <p style={{ fontFamily: mono, fontSize: 12, color: C.muted, marginTop: 14 }}>
            or <Link to="/screener" style={{ color: C.sub }}>see the live screener →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
