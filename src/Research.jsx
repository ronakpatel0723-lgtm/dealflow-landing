import React, { useEffect } from "react";
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
  <div style={{
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

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
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
          {[["Screener", "/screener"], ["Methodology", "/methodology"], ["Pricing", "/pricing"], ["Research", "/research"]].map(([label, path]) => (
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
            6.31× signal-to-noise: what it means and why it matters
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
            observations before year Y, predict year Y, never allow future data to bleed into training. Each row in the
            table below is an independent experiment — the 2022 model never saw a single 2022 data point. This is
            the same validation discipline used in quantitative finance, and it produces a meaningfully harder test
            than standard cross-validation, which can inadvertently mix train and test across time.
          </P>

          <PullQuote>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 480 }}>
              <div>
                <div style={{ fontFamily: mono, fontSize: 32, fontWeight: 600, color: C.green }}>6.31×</div>
                <div style={{ fontFamily: disp, fontSize: 13, color: C.sub, marginTop: 4 }}>real top-decile lift — model trained on past, tested on future</div>
              </div>
              <div>
                <div style={{ fontFamily: mono, fontSize: 32, fontWeight: 600, color: C.muted }}>1.00×</div>
                <div style={{ fontFamily: disp, fontSize: 13, color: C.sub, marginTop: 4 }}>placebo lift on shuffled labels — collapses to random</div>
              </div>
            </div>
          </PullQuote>

          <P>
            The placebo test is the critical validation. Take the same model, same features, same walk-forward
            protocol — but randomly shuffle the acquisition labels. If the signal were a data artifact, lift would
            persist even on shuffled labels. It doesn't: placebo lift across all five test years averages 1.00×,
            indistinguishable from random selection. The ratio of real lift to placebo lift (6.31 / 1.00 = 6.31×)
            is the signal-to-noise ratio. That number is the honest measure of how much information the model
            contains beyond noise.
          </P>
        </section>

        {/* ── SECTION 2: The Data ── */}
        <section style={{ borderTop: `1px solid ${C.line}`, paddingTop: 48, marginBottom: 56 }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.blue, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>
            Section 2 · The Data
          </div>
          <h2 style={{ fontFamily: disp, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 24 }}>
            130 verified acquisitions, independently confirmed
          </h2>

          <StatStrip stats={[
            { value: "130", label: "verified acquisitions" },
            { value: "27,949", label: "panel rows" },
            { value: "877", label: "unique companies" },
            { value: "15 yrs", label: "2009–2024" },
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
            DealFlow AI's panel includes <strong style={{ color: C.text }}>877 unique companies</strong> across
            15 years, including all companies that were acquired and delisted during that period. The result is a
            training set where the acquisition base rate (0.945% per company-year) reflects the true historical
            rate, not a rate suppressed by survivorship. When the model scores a company highly, it has learned
            that pattern from a dataset that includes the full consequence of that pattern — including the companies
            that were taken private precisely because of it.
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
