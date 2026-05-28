import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import WaitlistModal from "./WaitlistModal.jsx";

/* DealFlow AI — Landing. Dark cinematic, high-contrast.
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

export default function DealFlowLanding() {
  const [load, setLoad] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoad(true), 60); return () => clearTimeout(t); }, []);
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const hero = (i) => ({
    opacity: load ? 1 : 0,
    transform: load ? "none" : "translateY(20px)",
    transition: `opacity 0.9s cubic-bezier(0.22,1,0.36,1) ${i * 110}ms, transform 0.9s cubic-bezier(0.22,1,0.36,1) ${i * 110}ms`,
  });

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: sans, minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <ScrollProgress />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box}
        @keyframes breathe{0%,100%{opacity:0.7;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
        @keyframes scan{0%{transform:translateY(-100%)}100%{transform:translateY(2000%)}}
        .df-cta{transition:all 0.2s ease}
        .df-cta:hover{transform:translateY(-1px);box-shadow:0 8px 30px rgba(91,141,239,0.35)}
        .df-card{transition:all 0.3s cubic-bezier(0.22,1,0.36,1)}
        .df-card:hover{transform:translateY(-4px);border-color:rgba(91,141,239,0.4)!important;background:${C.panelHi}!important}
        ::selection{background:rgba(91,141,239,0.3)}
        a{color:inherit;text-decoration:none}`}</style>

      {/* atmosphere */}
      <div style={{ position: "absolute", top: "-30%", left: "50%", width: 1100, height: 800, transform: "translateX(-50%)", background: `radial-gradient(ellipse at center, ${C.glow1}, transparent 62%)`, animation: "breathe 9s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", top: "40%", right: "-10%", width: 700, height: 700, background: `radial-gradient(circle, ${C.glow2}, transparent 65%)`, pointerEvents: "none", zIndex: 0 }} />
      {/* grain */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", opacity: 0.035, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
      {/* fine grid */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.4, backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`, backgroundSize: "64px 64px", maskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, #000 40%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, #000 40%, transparent 75%)" }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* NAV */}
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 32px", maxWidth: 1200, margin: "0 auto", ...hero(0) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" stroke={C.blue} strokeWidth="1.5" /><path d="M12 7 L16.5 9.5 V14.5 L12 17 L7.5 14.5 V9.5 Z" fill={C.blue} fillOpacity="0.3" stroke={C.blue} strokeWidth="1.1" /></svg>
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: -0.2 }}>DealFlow<span style={{ color: C.blue }}> AI</span></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <Link to="/screener" style={{ fontSize: 14, color: C.sub }}>Product</Link>
            <Link to="/methodology" style={{ fontSize: 14, color: C.sub }}>Methodology</Link>
            <Link to="/pricing" style={{ fontSize: 14, color: C.sub }}>Pricing</Link>
            <button onClick={() => setWaitlistOpen(true)} className="df-cta" style={{ fontSize: 14, fontWeight: 600, background: C.text, color: C.bg, padding: "9px 16px", borderRadius: 8, cursor: "pointer", border: "none" }}>Request Access</button>
          </div>
        </nav>

        {/* HERO */}
        <header style={{ maxWidth: 1000, margin: "0 auto", padding: "70px 32px 40px", textAlign: "center" }}>
          <div style={{ ...hero(1), display: "inline-flex", alignItems: "center", gap: 8, fontFamily: mono, fontSize: 12, letterSpacing: 2, color: C.sub, textTransform: "uppercase", border: `1px solid ${C.line}`, borderRadius: 100, padding: "6px 14px", marginBottom: 30 }}>
            <span style={{ width: 6, height: 6, borderRadius: 6, background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
            Acquisition Intelligence
          </div>
          <h1 style={{ ...hero(2), fontFamily: disp, fontWeight: 700, fontSize: "clamp(44px, 7vw, 86px)", lineHeight: 0.98, letterSpacing: "-0.03em", margin: 0 }}>
            See the deal<br />before it's a deal.
          </h1>
          <p style={{ ...hero(3), fontSize: "clamp(16px, 2vw, 20px)", color: C.sub, maxWidth: 620, margin: "26px auto 0", lineHeight: 1.5 }}>
            DealFlow AI ranks the entire public software universe by acquisition likelihood — so you find the target before the banker's call, not after.
          </p>
          <div style={{ ...hero(4), display: "flex", gap: 14, justifyContent: "center", marginTop: 38, flexWrap: "wrap" }}>
            <button onClick={() => setWaitlistOpen(true)} className="df-cta" style={{ fontSize: 15, fontWeight: 600, background: C.blue, color: "#fff", padding: "13px 26px", borderRadius: 10, cursor: "pointer", border: "none" }}>Request Access</button>
            <Link to="/screener" className="df-cta" style={{ fontSize: 15, fontWeight: 500, color: C.text, padding: "13px 24px", borderRadius: 10, border: `1px solid ${C.lineHi}`, cursor: "pointer", textDecoration: "none" }}>See it live →</Link>
            <Link to="/methodology" className="df-cta" style={{ fontSize: 15, fontWeight: 500, color: C.sub, padding: "13px 24px", borderRadius: 10, border: `1px solid ${C.line}`, cursor: "pointer", textDecoration: "none" }}>Methodology →</Link>
          </div>

          {/* hero proof number */}
          <div style={{ ...hero(5), marginTop: 64, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 18 }}>
            <span style={{ fontFamily: mono, fontWeight: 600, fontSize: "clamp(64px, 11vw, 132px)", letterSpacing: "-0.04em", background: `linear-gradient(180deg, ${C.text}, ${C.blue})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>
              <CountUp to={6.31} decimals={2} suffix="×" />
            </span>
            <span style={{ textAlign: "left", maxWidth: 240 }}>
              <span style={{ fontFamily: mono, fontSize: 13, color: C.green, letterSpacing: 1 }}>TOP-DECILE LIFT</span>
              <p style={{ fontSize: 14, color: C.sub, margin: "6px 0 0", lineHeight: 1.45 }}>more acquisition targets than random — validated out-of-sample, 2020–2024.</p>
            </span>
          </div>
        </header>

        {/* PRODUCT PREVIEW */}
        <Reveal delay={100} style={{ maxWidth: 1080, margin: "40px auto 0", padding: "0 32px" }}>
          <div style={{ position: "relative", borderRadius: 14, border: `1px solid ${C.lineHi}`, background: C.panel, overflow: "hidden", boxShadow: "0 40px 120px rgba(0,0,0,0.6)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${C.blue}, transparent)`, opacity: 0.6 }} />
            {/* window chrome */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ width: 11, height: 11, borderRadius: 6, background: "#2a3550" }} />
              <span style={{ width: 11, height: 11, borderRadius: 6, background: "#2a3550" }} />
              <span style={{ width: 11, height: 11, borderRadius: 6, background: "#2a3550" }} />
              <span style={{ fontFamily: mono, fontSize: 11, color: C.muted, marginLeft: 12 }}>dealflow.ai/screener — updated {today}</span>
            </div>
            {/* mini header */}
            <div style={{ display: "grid", gridTemplateColumns: "36px 1.6fr 56px 110px 70px 86px", gap: 0, padding: "10px 20px", borderBottom: `1px solid ${C.line}`, background: C.panelHi }}>
              {["#", "Company", "Score", "", "Tier", "Revenue"].map((h, i) => <span key={i} style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: 1, color: C.muted, textTransform: "uppercase", textAlign: i === 5 ? "right" : "left" }}>{h}</span>)}
            </div>
            {[
              { r: 1, c: "DigitalOcean", t: "DOCN", s: 84, tier: "High", rev: "$780M", col: C.green },
              { r: 2, c: "BlackLine", t: "BL", s: 81, tier: "High", rev: "$640M", col: C.green },
              { r: 3, c: "PagerDuty", t: "PD", s: 78, tier: "High", rev: "$430M", col: C.green },
              { r: 4, c: "JFrog", t: "FROG", s: 76, tier: "High", rev: "$380M", col: C.green },
              { r: 5, c: "Amplitude", t: "AMPL", s: 72, tier: "Med", rev: "$290M", col: C.amber },
            ].map((row, i) => (
              <div key={row.t} style={{ display: "grid", gridTemplateColumns: "36px 1.6fr 56px 110px 70px 86px", gap: 0, alignItems: "center", padding: "12px 20px", borderBottom: i < 4 ? `1px solid ${C.line}` : "none", background: i % 2 ? "rgba(255,255,255,0.012)" : "transparent" }}>
                <span style={{ fontFamily: mono, fontSize: 12, color: C.muted }}>{String(row.r).padStart(2, "0")}</span>
                <div><span style={{ fontSize: 13.5, fontWeight: 600 }}>{row.c}</span> <span style={{ fontFamily: mono, fontSize: 11, color: C.sub }}>{row.t}</span></div>
                <span style={{ fontFamily: mono, fontSize: 15, fontWeight: 600, color: row.col }}>{row.s}</span>
                <div style={{ paddingRight: 18 }}><div style={{ height: 4, background: C.line, borderRadius: 3 }}><div style={{ height: "100%", width: `${row.s}%`, background: row.col, borderRadius: 3 }} /></div></div>
                <span style={{ fontFamily: sans, fontSize: 9.5, fontWeight: 600, color: row.col, border: `1px solid ${row.col}40`, borderRadius: 4, padding: "2px 6px", textTransform: "uppercase", textAlign: "center" }}>{row.tier}</span>
                <span style={{ fontFamily: mono, fontSize: 12.5, textAlign: "right" }}>{row.rev}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* PROOF STATS */}
        <section style={{ maxWidth: 1000, margin: "110px auto 0", padding: "0 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: C.line, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
            {[
              { n: 1166, d: 0, s: "", l: "Companies in the universe", sub: "survivorship-bias-free, incl. delisted" },
              { n: 100, d: 0, s: "", l: "Hand-verified acquisitions", sub: "every label checked against SEC filings" },
              { n: 1.00, d: 2, s: "×", l: "Placebo lift on shuffled labels", sub: "proof the signal is real, not leakage" },
            ].map((m, i) => (
              <Reveal key={m.l} delay={i * 90}>
                <div style={{ background: C.panel, padding: "34px 26px" }}>
                  <div style={{ fontFamily: mono, fontSize: 42, fontWeight: 600, letterSpacing: "-0.02em", color: C.text }}><CountUp to={m.n} decimals={m.d} suffix={m.s} /></div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 12 }}>{m.l}</div>
                  <div style={{ fontSize: 12.5, color: C.sub, marginTop: 5, lineHeight: 1.4 }}>{m.sub}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* WHAT IT DOES */}
        <section style={{ maxWidth: 1080, margin: "120px auto 0", padding: "0 32px" }}>
          <Reveal><div style={{ textAlign: "center", marginBottom: 50 }}>
            <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: 2, color: C.blue, textTransform: "uppercase" }}>How it works</div>
            <h2 style={{ fontFamily: disp, fontSize: "clamp(30px,4.5vw,48px)", fontWeight: 700, letterSpacing: "-0.02em", margin: "14px 0 0" }}>Prioritization, not prediction.</h2>
            <p style={{ fontSize: 16, color: C.sub, maxWidth: 560, margin: "16px auto 0", lineHeight: 1.55 }}>No tool predicts the future. DealFlow does something more useful — it tells you which companies to look at first, ranked by the financial signature that precedes an acquisition.</p>
          </div></Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[
              { i: "M", t: "Ingest the universe", d: "Every public software company that's filed with the SEC since 2010 — including the 500+ that were acquired and delisted. No survivorship bias." },
              { i: "Σ", t: "Score the signal", d: "A point-in-time model weighs revenue scale, margin quality, Rule of 40, and insider activity against a decade of verified acquisitions." },
              { i: "↗", t: "Rank what matters", d: "Sort your universe by likelihood. The top decile carries 6.31× the acquisition rate — your week's worth of targets, in seconds." },
            ].map((card, i) => (
              <Reveal key={card.t} delay={i * 90}>
                <div className="df-card" style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: "28px 24px", height: "100%" }}>
                  <div style={{ fontFamily: mono, fontSize: 20, color: C.blue, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: "rgba(91,141,239,0.1)", border: `1px solid rgba(91,141,239,0.25)` }}>{card.i}</div>
                  <h3 style={{ fontFamily: disp, fontSize: 19, fontWeight: 600, margin: "20px 0 10px" }}>{card.t}</h3>
                  <p style={{ fontSize: 14, color: C.sub, lineHeight: 1.6, margin: 0 }}>{card.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* METHODOLOGY / CREDIBILITY */}
        <section style={{ maxWidth: 980, margin: "130px auto 0", padding: "0 32px" }}>
          <Reveal>
            <div style={{ position: "relative", borderRadius: 18, border: `1px solid ${C.lineHi}`, background: `linear-gradient(180deg, ${C.panelHi}, ${C.panel})`, padding: "clamp(34px,5vw,60px)", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-40%", right: "-10%", width: 480, height: 480, background: `radial-gradient(circle, ${C.glow1}, transparent 65%)`, pointerEvents: "none" }} />
              <div style={{ position: "relative" }}>
                <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: 2, color: C.green, textTransform: "uppercase" }}>Why you can trust it</div>
                <h2 style={{ fontFamily: disp, fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, letterSpacing: "-0.02em", margin: "14px 0 0", maxWidth: 620 }}>Validated the way a quant would demand.</h2>
                <p style={{ fontSize: 16, color: C.sub, maxWidth: 600, margin: "18px 0 36px", lineHeight: 1.6 }}>
                  The model is trained only on the past and tested on deals it never saw. Each year from 2020 to 2023 was predicted by a model that knew nothing beyond the year before — a walk-forward backtest, the gold standard for time-series finance.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 540 }}>
                  <div style={{ borderLeft: `2px solid ${C.green}`, paddingLeft: 18 }}>
                    <div style={{ fontFamily: mono, fontSize: 34, fontWeight: 600, color: C.text }}><CountUp to={6.31} decimals={2} suffix="×" /></div>
                    <div style={{ fontSize: 13, color: C.sub, marginTop: 6 }}>real out-of-sample top-decile lift</div>
                  </div>
                  <div style={{ borderLeft: `2px solid ${C.muted}`, paddingLeft: 18 }}>
                    <div style={{ fontFamily: mono, fontSize: 34, fontWeight: 600, color: C.sub }}><CountUp to={1.00} decimals={2} suffix="×" /></div>
                    <div style={{ fontSize: 13, color: C.sub, marginTop: 6 }}>lift collapses on shuffled labels — no leakage</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* CLOSING CTA */}
        <section style={{ maxWidth: 760, margin: "130px auto 0", padding: "0 32px", textAlign: "center" }}>
          <Reveal>
            <h2 style={{ fontFamily: disp, fontSize: "clamp(34px,5.5vw,64px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.02, margin: 0 }}>
              The next deal is<br />already in the data.
            </h2>
            <p style={{ fontSize: 17, color: C.sub, margin: "22px auto 0", maxWidth: 480, lineHeight: 1.5 }}>Built for the corp-dev teams and funds priced out of a $20K terminal.</p>
            <div style={{ marginTop: 34, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => setWaitlistOpen(true)} className="df-cta" style={{ fontSize: 15, fontWeight: 600, background: C.blue, color: "#fff", padding: "14px 30px", borderRadius: 10, cursor: "pointer", border: "none" }}>Request Access</button>
              <Link to="/screener" className="df-cta" style={{ fontSize: 15, fontWeight: 500, color: C.text, padding: "14px 28px", borderRadius: 10, border: `1px solid ${C.lineHi}`, cursor: "pointer", textDecoration: "none" }}>Try the demo →</Link>
            </div>
            <div style={{ fontFamily: mono, fontSize: 12, color: C.muted, marginTop: 18 }}>from $149/mo · no terminal, no procurement</div>
          </Reveal>
        </section>

        {/* FOOTER */}
        <footer style={{ maxWidth: 1080, margin: "120px auto 0", padding: "32px", borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <span style={{ fontFamily: mono, fontSize: 12, color: C.muted }}>DealFlow AI · acquisition intelligence</span>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <a href="https://github.com/ronakpatel0723-lgtm/dealflow-ai" target="_blank" rel="noreferrer"
              style={{ fontFamily: mono, fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
              GitHub
            </a>
            <span style={{ fontFamily: mono, fontSize: 12, color: C.muted }}>
              built on SEC EDGAR · {new Date().getFullYear()}
              {typeof __GIT_SHA__ !== "undefined" && <span style={{ opacity: 0.5 }}> · {__GIT_SHA__}</span>}
            </span>
          </div>
        </footer>
      </div>
      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
    </div>
  );
}
