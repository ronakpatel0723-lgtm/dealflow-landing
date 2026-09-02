import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/* DealFlow AI — research artifact landing.
   Every figure on this page is read from results/*.json in the source repo.
   Display: Bricolage Grotesque · Numerals: IBM Plex Mono */

const C = {
  bg: "#04060D",
  glow1: "rgba(79,124,255,0.18)",
  glow2: "rgba(54,211,153,0.10)",
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
const sans = "'Bricolage Grotesque', -apple-system, sans-serif";

const REPO = "https://github.com/ronakpatel0723-lgtm/dealflow-ai";

function useInView(opts = { threshold: 0.18 }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); ob.disconnect(); }
    }, opts);
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return [ref, seen];
}

function Reveal({ children, delay = 0, y = 24, style }) {
  const [ref, seen] = useInView();
  return (
    <div ref={ref} style={{
      opacity: seen ? 1 : 0,
      transform: seen ? "none" : `translateY(${y}px)`,
      transition: `opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      ...style,
    }}>{children}</div>
  );
}

function CountUp({ to, decimals = 0, suffix = "", duration = 1400 }) {
  const [ref, seen] = useInView();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!seen) return;
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen, to]);
  return <span ref={ref}>{val.toFixed(decimals)}{suffix}</span>;
}

function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const max = el.scrollHeight - el.clientHeight;
      setPct(max > 0 ? (scrolled / max) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, zIndex: 1000, height: 2, width: `${pct}%`, background: "#5B8DEF", transition: "width 0.05s linear", pointerEvents: "none" }} />
  );
}

function tierColor(t) {
  if (t === "High") return C.green;
  if (t === "Medium") return C.amber;
  return C.muted;
}

export default function DealFlowLanding() {
  const [load, setLoad] = useState(false);
  const [top, setTop] = useState([]);
  const [meta, setMeta] = useState(null);

  useEffect(() => { document.title = "DealFlow AI — M&A Screening Research Artifact"; }, []);
  useEffect(() => { const t = setTimeout(() => setLoad(true), 60); return () => clearTimeout(t); }, []);
  useEffect(() => {
    fetch("/scores.json")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        setMeta(d.metadata || null);
        const rows = [...(d.companies || [])]
          .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
          .slice(0, 6);
        setTop(rows);
      })
      .catch(() => {});
  }, []);

  const hero = (i) => ({
    opacity: load ? 1 : 0,
    transform: load ? "none" : "translateY(20px)",
    transition: `opacity 0.9s cubic-bezier(0.22,1,0.36,1) ${i * 110}ms, transform 0.9s cubic-bezier(0.22,1,0.36,1) ${i * 110}ms`,
  });

  const asOf = meta?.last_updated ? new Date(meta.last_updated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: sans, minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <ScrollProgress />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box}
        @keyframes breathe{0%,100%{opacity:0.7;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
        .df-cta{transition:all 0.2s ease}
        .df-cta:hover{transform:translateY(-1px);box-shadow:0 8px 30px rgba(91,141,239,0.35)}
        @media(max-width:480px){header{padding:48px 20px 28px!important}.df-eyebrow span:last-child{display:none}}
        .df-card{transition:all 0.3s cubic-bezier(0.22,1,0.36,1)}
        .df-card:hover{transform:translateY(-4px);border-color:rgba(91,141,239,0.4)!important;background:${C.panelHi}!important}
        .df-nav a{transition:color 0.15s ease}
        .df-nav a:hover{color:${C.text}}
        ::selection{background:rgba(91,141,239,0.3)}
        a{color:inherit;text-decoration:none}
        .df-two{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        @media(max-width:720px){.df-two{grid-template-columns:1fr}}`}</style>

      {/* atmosphere */}
      <div style={{ position: "absolute", top: "-30%", left: "50%", width: 1100, height: 800, transform: "translateX(-50%)", background: `radial-gradient(ellipse at center, ${C.glow1}, transparent 62%)`, animation: "breathe 9s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", top: "40%", right: "-10%", width: 700, height: 700, background: `radial-gradient(circle, ${C.glow2}, transparent 65%)`, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", opacity: 0.035, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.4, backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`, backgroundSize: "64px 64px", maskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, #000 40%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, #000 40%, transparent 75%)" }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* NAV */}
        <nav className="df-nav" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 32px", maxWidth: 1200, margin: "0 auto", gap: 16, flexWrap: "wrap", ...hero(0) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" stroke={C.blue} strokeWidth="1.5" /><path d="M12 7 L16.5 9.5 V14.5 L12 17 L7.5 14.5 V9.5 Z" fill={C.blue} fillOpacity="0.3" stroke={C.blue} strokeWidth="1.1" /></svg>
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: -0.2 }}>DealFlow<span style={{ color: C.blue }}> AI</span></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <Link to="/screener" style={{ fontSize: 14, color: C.sub }}>Screener</Link>
            <Link to="/interrogate/DUOL" style={{ fontSize: 14, color: C.sub }}>Interrogation</Link>
            <Link to="/methodology" style={{ fontSize: 14, color: C.sub }}>Methodology</Link>
            <Link to="/monitor" style={{ fontSize: 14, color: C.sub }}>Pipeline</Link>
            <a href={REPO} target="_blank" rel="noreferrer" style={{ fontSize: 14, color: C.sub }}>Source ↗</a>
          </div>
        </nav>

        {/* HERO */}
        <header style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 32px 36px", textAlign: "center" }}>
          <div style={{ ...hero(1), display: "inline-flex", alignItems: "center", gap: 8, fontFamily: mono, fontSize: 12, letterSpacing: 2, color: C.sub, textTransform: "uppercase", border: `1px solid ${C.line}`, borderRadius: 100, padding: "6px 14px", marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: 6, background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
            Research artifact · not a product
          </div>

          <h1 style={{ ...hero(2), fontFamily: disp, fontWeight: 700, fontSize: "clamp(38px, 6vw, 72px)", lineHeight: 1.0, letterSpacing: "-0.03em", margin: 0 }}>
            An M&amp;A screening model,<br />and the evidence it works.
          </h1>

          <p style={{ ...hero(3), fontSize: "clamp(16px, 2vw, 19px)", color: C.sub, maxWidth: 680, margin: "26px auto 0", lineHeight: 1.6 }}>
            DealFlow AI ranks public software, cyber, fintech and healthtech companies by acquisition
            likelihood, then defends the resulting LBO under challenge. Everything below runs on
            precomputed output from a validated run — nothing is computed on demand, so nothing can
            break while you read it.
          </p>

          <div style={{ ...hero(4), display: "flex", gap: 12, justifyContent: "center", marginTop: 34, flexWrap: "wrap" }}>
            <Link to="/screener" className="df-cta" style={{ fontSize: 15, fontWeight: 600, background: C.blue, color: "#fff", padding: "13px 26px", borderRadius: 10, border: "none" }}>Open the screener →</Link>
            <Link to="/interrogate/DUOL" className="df-cta" style={{ fontSize: 15, fontWeight: 600, color: C.text, padding: "13px 24px", borderRadius: 10, border: `1px solid ${C.lineHi}` }}>See a model defend itself →</Link>
            <Link to="/methodology" className="df-cta" style={{ fontSize: 15, fontWeight: 500, color: C.sub, padding: "13px 24px", borderRadius: 10, border: `1px solid ${C.line}` }}>Read the validation →</Link>
          </div>

          <div style={{ ...hero(5), marginTop: 24, fontFamily: mono, fontSize: 12, color: C.muted, letterSpacing: 0.3 }}>
            SEC EDGAR XBRL · 203-positive verified gold set · 463 passing tests · scores as of {asOf}
          </div>
        </header>

        {/* WHAT IT DOES */}
        <section style={{ maxWidth: 980, margin: "70px auto 0", padding: "0 32px" }}>
          <Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
              {[
                {
                  k: "What it does",
                  b: "Scores 131 public SaaS, cybersecurity, fintech and healthtech companies on acquisition attractiveness using explicit M&A logic — Rule of 40, gross margin, revenue scale, EV/Revenue — and produces a tiered ranking with a written rationale for every name. A separate ML layer estimates acquisition probability from a verified deal set.",
                },
                {
                  k: "Where the data comes from",
                  b: "Financials are pulled from SEC EDGAR XBRL filings directly; market data from yfinance. Acquisition labels come from a full-pagination EDGAR 8-K scrape (2010–2024) hand-verified against press releases and cross-checked against LSEG SDC Platinum, yielding 203 confirmed positives.",
                },
                {
                  k: "How it was validated",
                  b: "Point-in-time features, a strict out-of-time split (train before 2022-01-01, test 2022–2023), rolling walk-forward folds, and shuffled-label placebo controls on every headline number. Probabilities are Platt-recalibrated on a 2021 validation slice before anything downstream consumes them.",
                },
              ].map((row, i) => (
                <div key={row.k} style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 24, padding: "22px 0", borderTop: `1px solid ${C.line}` }} className="df-row">
                  <div style={{ fontFamily: mono, fontSize: 11.5, letterSpacing: 1.4, color: C.blue, textTransform: "uppercase", paddingTop: 3 }}>{row.k}</div>
                  <div style={{ fontSize: 15.5, color: C.sub, lineHeight: 1.7 }}>{row.b}</div>
                </div>
              ))}
            </div>
          </Reveal>
          <style>{`@media(max-width:640px){.df-row{grid-template-columns:1fr!important;gap:8px!important}}`}</style>
        </section>

        {/* RESULTS */}
        <section style={{ maxWidth: 1000, margin: "80px auto 0", padding: "0 32px" }}>
          <Reveal><div style={{ fontFamily: mono, fontSize: 12, letterSpacing: 2, color: C.green, textTransform: "uppercase", marginBottom: 20 }}>Results — out-of-time, 2022–2023</div></Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: C.line, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }} className="df-stats">
            {[
              { n: 4.27, d: 2, s: "×", l: "Signal-to-noise", sub: "rolling 3-fold mean — the safer headline" },
              { n: 6.09, d: 2, s: "×", l: "Single-cut S/N", sub: "strongest defensible window" },
              { n: 76.4, d: 1, s: "%", l: "Acquisitions captured", sub: "at the production screening threshold" },
              { n: 0.75, d: 2, s: "×", l: "Placebo lift", sub: "shuffled labels collapse the signal" },
            ].map((m, i) => (
              <Reveal key={m.l} delay={i * 80}>
                <div style={{ background: C.panel, padding: "30px 22px", height: "100%" }}>
                  <div style={{ fontFamily: mono, fontSize: 36, fontWeight: 600, letterSpacing: "-0.02em", color: i === 3 ? C.sub : C.text }}><CountUp to={m.n} decimals={m.d} suffix={m.s} /></div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 12 }}>{m.l}</div>
                  <div style={{ fontSize: 12.5, color: C.sub, marginTop: 5, lineHeight: 1.45 }}>{m.sub}</div>
                </div>
              </Reveal>
            ))}
          </div>
          <style>{`@media(max-width:820px){.df-stats{grid-template-columns:repeat(2,1fr)!important}}`}</style>
          <Reveal>
            <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.7, marginTop: 18, fontFamily: mono }}>
              In-sample anchor 4.03× · PR-AUC 0.048 against a 1.11% base rate · 30,715 company-quarters,
              967 entities, 6,499 test rows · calibration cuts Brier 73% and ECE 96% · seed 42, per-fold
              metrics in <code style={{ color: C.sub }}>results/</code>.
            </p>
          </Reveal>
        </section>

        {/* LIVE OUTPUT PREVIEW */}
        <section style={{ maxWidth: 1000, margin: "90px auto 0", padding: "0 32px" }}>
          <Reveal>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: 2, color: C.blue, textTransform: "uppercase" }}>Top of the current ranking</div>
              <Link to="/screener" style={{ fontFamily: mono, fontSize: 12.5, color: C.sub }}>all {meta?.total_count || 131} companies →</Link>
            </div>
            <div style={{ position: "relative", borderRadius: 14, border: `1px solid ${C.lineHi}`, background: C.panel, overflow: "hidden", boxShadow: "0 40px 120px rgba(0,0,0,0.6)" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${C.blue}, transparent)`, opacity: 0.6 }} />
              <div style={{ display: "grid", gridTemplateColumns: "36px 1.6fr 56px 110px 76px 92px", gap: 0, padding: "11px 20px", borderBottom: `1px solid ${C.line}`, background: C.panelHi }}>
                {["#", "Company", "Score", "", "Tier", "Revenue"].map((h, i) => <span key={i} style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: 1, color: C.muted, textTransform: "uppercase", textAlign: i === 5 ? "right" : "left" }}>{h}</span>)}
              </div>
              {top.length === 0 && (
                <div style={{ padding: "34px 20px", fontFamily: mono, fontSize: 12.5, color: C.muted }}>Loading scores…</div>
              )}
              {top.map((row, i) => {
                const col = tierColor(row.tier);
                const score = Math.round(row.total_score || 0);
                return (
                  <Link key={row.ticker} to={`/company/${row.ticker}`} style={{ display: "grid", gridTemplateColumns: "36px 1.6fr 56px 110px 76px 92px", gap: 0, alignItems: "center", padding: "12px 20px", borderBottom: i < top.length - 1 ? `1px solid ${C.line}` : "none", background: i % 2 ? "rgba(255,255,255,0.012)" : "transparent" }}>
                    <span style={{ fontFamily: mono, fontSize: 12, color: C.muted }}>{String(i + 1).padStart(2, "0")}</span>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 10 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{row.company}</span>{" "}
                      <span style={{ fontFamily: mono, fontSize: 11, color: C.sub }}>{row.ticker}</span>
                    </div>
                    <span style={{ fontFamily: mono, fontSize: 15, fontWeight: 600, color: col }}>{score}</span>
                    <div style={{ paddingRight: 18 }}><div style={{ height: 4, background: C.line, borderRadius: 3 }}><div style={{ height: "100%", width: `${Math.min(100, score)}%`, background: col, borderRadius: 3 }} /></div></div>
                    <span style={{ fontFamily: sans, fontSize: 9.5, fontWeight: 600, color: col, border: `1px solid ${col}40`, borderRadius: 4, padding: "2px 6px", textTransform: "uppercase", textAlign: "center" }}>{row.tier}</span>
                    <span style={{ fontFamily: mono, fontSize: 12.5, textAlign: "right" }}>{row.revenue_M ? `$${Math.round(row.revenue_M)}M` : "—"}</span>
                  </Link>
                );
              })}
            </div>
            <p style={{ fontFamily: mono, fontSize: 11.5, color: C.muted, marginTop: 12 }}>
              Rule-based attractiveness score. Click any row for the full deep dive — comps, DCF, LBO, and the generated thesis.
            </p>
          </Reveal>
        </section>

        {/* PIPELINE */}
        <section style={{ maxWidth: 1080, margin: "110px auto 0", padding: "0 32px" }}>
          <Reveal><div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: 2, color: C.blue, textTransform: "uppercase" }}>How it works</div>
            <h2 style={{ fontFamily: disp, fontSize: "clamp(28px,4.5vw,44px)", fontWeight: 700, letterSpacing: "-0.02em", margin: "14px 0 0" }}>Prioritization, not prediction.</h2>
            <p style={{ fontSize: 16, color: C.sub, maxWidth: 580, margin: "16px auto 0", lineHeight: 1.6 }}>
              The model does not forecast deals. It reorders a universe so the names worth reading first
              come first — and then it has to survive being argued with.
            </p>
          </div></Reveal>
          <style>{`.df-how-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}@media(max-width:900px){.df-how-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.df-how-grid{grid-template-columns:1fr}}`}</style>
          <div className="df-how-grid">
            {[
              { color: C.blue, step: "01", t: "Ingest", d: "Revenue, margins and growth pulled straight from SEC EDGAR XBRL filings. Acquisition labels from a 2010–2024 8-K scrape, hand-verified." },
              { color: C.green, step: "02", t: "Score", d: "Rule-based attractiveness across 131 names, plus a logistic-L1 + XGBoost ensemble trained on the 203-positive gold set." },
              { color: C.amber, step: "03", t: "Model", d: "Comparable company analysis, DCF with WACC/TGR sensitivity, and an LBO with a full debt schedule, IRR and MOIC." },
              { color: C.red, step: "04", t: "Interrogate", d: "Every model input is a typed assumption with provenance. Challenge one and the system defends with evidence or revises and re-propagates." },
            ].map((card, i) => (
              <Reveal key={card.t} delay={i * 120}>
                <div className="df-card" style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: "24px 22px", height: "100%" }}>
                  <span style={{ fontFamily: mono, fontSize: 11, color: card.color, letterSpacing: 2, opacity: 0.8 }}>STEP {card.step}</span>
                  <h3 style={{ fontFamily: disp, fontSize: 19, fontWeight: 700, margin: "14px 0 10px", color: C.text }}>{card.t}</h3>
                  <p style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.65, margin: 0 }}>{card.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* LIMITATIONS */}
        <section style={{ maxWidth: 980, margin: "110px auto 0", padding: "0 32px" }}>
          <Reveal>
            <div style={{ borderRadius: 18, border: `1px solid ${C.lineHi}`, background: `linear-gradient(180deg, ${C.panelHi}, ${C.panel})`, padding: "clamp(30px,4.5vw,52px)" }}>
              <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: 2, color: C.amber, textTransform: "uppercase" }}>What it does not do</div>
              <h2 style={{ fontFamily: disp, fontSize: "clamp(26px,3.6vw,38px)", fontWeight: 700, letterSpacing: "-0.02em", margin: "14px 0 22px", maxWidth: 620 }}>The limitations are part of the result.</h2>
              <div className="df-two">
                {[
                  ["It is a screening tool, not a forecaster.", "It ranks acquisition likelihood. It says nothing about price, returns, or deal terms."],
                  ["It does not generalize outside its universe.", "Trained on US software and software-adjacent names. Applying it elsewhere is unsupported."],
                  ["The split is not entity-aware.", "39% of out-of-time positive entities also appear as positives in training. That is why 4.27× rolling is the headline and not 6.09×."],
                  ["Raw probabilities are unsafe to consume.", "The uncalibrated ensemble is badly miscalibrated at this base rate. A Platt scaler ships alongside it for that reason."],
                ].map(([h, b]) => (
                  <div key={h} style={{ borderLeft: `2px solid ${C.line}`, paddingLeft: 16, marginBottom: 4 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: C.text, lineHeight: 1.4 }}>{h}</div>
                    <div style={{ fontSize: 13.5, color: C.sub, marginTop: 7, lineHeight: 1.6 }}>{b}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13.5, color: C.muted, marginTop: 26, lineHeight: 1.7, borderTop: `1px solid ${C.line}`, paddingTop: 20 }}>
                An earlier version of this project trained on a contaminated dataset — gaming, crypto and
                telecom names misclassified as SaaS acquisitions — and reported a meaningless 92.7%. That
                output was quarantined and the data-integrity gates in the repo exist because of it. The
                failure log is checked in alongside the results.
              </p>
            </div>
          </Reveal>
        </section>

        {/* READ NEXT */}
        <section style={{ maxWidth: 980, margin: "100px auto 0", padding: "0 32px" }}>
          <Reveal>
            <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: 2, color: C.blue, textTransform: "uppercase", marginBottom: 20 }}>Read next</div>
            <div className="df-two">
              {[
                { to: "/methodology", t: "Methodology & validation", d: "The gold set, the splits, the placebo controls, and every gate the model had to clear." },
                { to: "/interrogate/DUOL", t: "Interrogation transcript", d: "A recorded LBO defending its own exit multiple and growth rate against two challenges." },
                { to: "/screener", t: "Full screener", d: "All 131 companies, filterable, sortable, exportable as CSV." },
                { to: "/monitor", t: "Pipeline health", d: "Data-quality checks and tier movement from the latest run." },
              ].map(card => (
                <Link key={card.to} to={card.to} className="df-card" style={{ display: "block", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: "22px 22px" }}>
                  <div style={{ fontFamily: disp, fontSize: 17, fontWeight: 700, color: C.text }}>{card.t}</div>
                  <div style={{ fontSize: 13.5, color: C.sub, marginTop: 8, lineHeight: 1.6 }}>{card.d}</div>
                </Link>
              ))}
            </div>
          </Reveal>
        </section>

        {/* FOOTER */}
        <footer style={{ maxWidth: 1080, margin: "100px auto 0", padding: "32px", borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <span style={{ fontFamily: mono, fontSize: 12, color: C.muted }}>DealFlow AI · a research artifact by Ronak Patel</span>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <Link to="/api-docs" style={{ fontFamily: mono, fontSize: 12, color: C.muted }}>API</Link>
            <a href={REPO} target="_blank" rel="noreferrer"
              style={{ fontFamily: mono, fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
              Source
            </a>
            <span style={{ fontFamily: mono, fontSize: 12, color: C.muted }}>
              built on SEC EDGAR · {new Date().getFullYear()}
              {typeof __GIT_SHA__ !== "undefined" && <span style={{ opacity: 0.5 }}> · {__GIT_SHA__}</span>}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
