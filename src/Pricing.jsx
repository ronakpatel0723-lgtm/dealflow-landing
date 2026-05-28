import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import WaitlistModal from "./WaitlistModal.jsx";

const C = {
  bg: "#04060D", panel: "#0A0E1A", panelHi: "#0E1424",
  line: "rgba(255,255,255,0.08)", lineHi: "rgba(255,255,255,0.16)",
  text: "#F3F6FD", sub: "#9BA8C6", muted: "#5C6880",
  blue: "#5B8DEF", green: "#36D399", amber: "#F5C24B",
};
const disp = "'Bricolage Grotesque', -apple-system, sans-serif";
const mono = "'IBM Plex Mono', ui-monospace, Menlo, monospace";

const TIERS = [
  {
    name: "Analyst",
    price: "$149",
    period: "/mo",
    tag: "For solo practitioners",
    features: [
      "Full 100-company universe ranked",
      "ML acquisition score + SHAP breakdown",
      "AI acquisition rationale per company",
      "Historical comparable transactions",
      "Weekly score refresh",
      "CSV export",
    ],
    cta: "Request Access",
    highlight: false,
  },
  {
    name: "Team",
    price: "$499",
    period: "/mo",
    tag: "Most popular",
    features: [
      "Everything in Analyst",
      "Full acquisition thesis (top 20 companies)",
      "REST API access",
      "Webhook tier-change alerts",
      "Score history + trend sparklines",
      "5 seats",
    ],
    cta: "Request Access",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    tag: "For funds & corp dev teams",
    features: [
      "Everything in Team",
      "Custom universe (any public software co.)",
      "CRM / workflow integrations",
      "White-label option",
      "Dedicated onboarding",
    ],
    cta: "Talk to us",
    highlight: false,
  },
];

const COMPARISON = [
  { feature:"Company screener",        free:"Top 20", analyst:"All 100", team:"All 100" },
  { feature:"Score rankings",          free:"✓", analyst:"✓", team:"✓" },
  { feature:"Company deep-dives",      free:"✓", analyst:"✓", team:"✓" },
  { feature:"AI acquisition rationale",free:"✓", analyst:"✓", team:"✓" },
  { feature:"SHAP factor breakdown",   free:"—", analyst:"✓", team:"✓" },
  { feature:"Historical comparables",  free:"—", analyst:"✓", team:"✓" },
  { feature:"CSV export",              free:"—", analyst:"✓", team:"✓" },
  { feature:"Acquisition thesis",      free:"—", analyst:"Preview", team:"Full" },
  { feature:"Score history + trends",  free:"—", analyst:"—", team:"✓" },
  { feature:"REST API access",         free:"—", analyst:"—", team:"✓" },
  { feature:"Webhook alerts",          free:"—", analyst:"—", team:"✓" },
  { feature:"Custom universe",         free:"—", analyst:"—", team:"Enterprise" },
];

export default function Pricing() {
  useEffect(() => { document.title = "Pricing — DealFlow AI"; }, []);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState("");

  const openModal = (tierName) => {
    setSelectedTier(tierName);
    setWaitlistOpen(true);
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        .df-tier-btn{transition:all 0.2s ease}
        .df-tier-btn:hover{transform:translateY(-1px);box-shadow:0 8px 28px rgba(91,141,239,0.3)}
        @media(max-width:700px){.df-tier-grid{grid-template-columns:1fr!important}}
      `}</style>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(4,6,13,0.92)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.line}`, padding: "0 24px",
        height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" stroke={C.blue} strokeWidth="1.5" />
            <path d="M12 7 L16.5 9.5 V14.5 L12 17 L7.5 14.5 V9.5 Z" fill={C.blue} fillOpacity="0.3" stroke={C.blue} strokeWidth="1.1" />
          </svg>
          <span style={{ fontFamily: disp, fontSize: 15, fontWeight: 700, color: C.text }}>
            DealFlow<span style={{ color: C.blue }}> AI</span>
          </span>
        </Link>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {[["Screener", "/screener"], ["Methodology", "/methodology"], ["Pricing", "/pricing"]].map(([label, path]) => (
            <Link key={label} to={path} style={{
              fontFamily: disp, fontSize: 14, fontWeight: 500,
              color: label === "Pricing" ? C.blue : C.sub,
            }}>{label}</Link>
          ))}
          <button
            onClick={() => openModal("")}
            style={{
              fontFamily: disp, fontSize: 14, fontWeight: 600,
              background: C.text, color: C.bg, padding: "8px 16px",
              borderRadius: 8, border: "none", cursor: "pointer",
            }}
          >Request Access</button>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "72px 24px 120px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.blue, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
            PRICING
          </div>
          <h1 style={{ fontFamily: disp, fontSize: "clamp(32px,5vw,52px)", fontWeight: 800, lineHeight: 1.05, color: C.text, letterSpacing: "-0.02em", marginBottom: 16 }}>
            Built for practitioners,<br />not Bloomberg terminals.
          </h1>
          <p style={{ fontFamily: disp, fontSize: 17, color: C.sub, maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
            DealFlow AI is in private beta. Prices reflect early-access rates — locked in for the life of your subscription.
          </p>
        </div>

        {/* Tier cards */}
        <div className="df-tier-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, alignItems: "start" }}>
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              style={{
                background: tier.highlight ? C.panelHi : C.panel,
                border: `1px solid ${tier.highlight ? C.blue + "60" : C.line}`,
                borderRadius: 14,
                padding: "32px 28px",
                position: "relative",
                boxShadow: tier.highlight ? `0 0 0 1px ${C.blue}30, 0 24px 64px rgba(91,141,239,0.12)` : "none",
              }}
            >
              {tier.highlight && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  fontFamily: mono, fontSize: 10, color: C.bg, background: C.blue,
                  padding: "3px 12px", borderRadius: 100, letterSpacing: 1.5, textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}>Most popular</div>
              )}

              <div style={{ fontFamily: mono, fontSize: 11, color: C.sub, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>
                {tier.tag}
              </div>

              <div style={{ fontFamily: disp, fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                {tier.name}
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 28 }}>
                <span style={{ fontFamily: mono, fontSize: 38, fontWeight: 600, color: tier.highlight ? C.blue : C.text, letterSpacing: "-0.02em" }}>
                  {tier.price}
                </span>
                {tier.period && (
                  <span style={{ fontFamily: mono, fontSize: 14, color: C.muted }}>{tier.period}</span>
                )}
              </div>

              <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 24, marginBottom: 28 }}>
                {tier.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontFamily: mono, fontSize: 13, color: C.green, marginTop: 1, flexShrink: 0 }}>✓</span>
                    <span style={{ fontFamily: disp, fontSize: 14, color: C.sub, lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => openModal(tier.name)}
                className="df-tier-btn"
                style={{
                  width: "100%", padding: "13px",
                  background: tier.highlight ? C.blue : "transparent",
                  color: tier.highlight ? "#fff" : C.text,
                  border: `1px solid ${tier.highlight ? C.blue : C.lineHi}`,
                  borderRadius: 8, fontFamily: disp, fontSize: 15, fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {tier.cta} →
              </button>
            </div>
          ))}
        </div>

        {/* Trust line */}
        <div style={{ textAlign: "center", marginTop: 52 }}>
          <p style={{ fontFamily: mono, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
            No contracts · Cancel anytime · Early-access pricing locked at signup
          </p>
        </div>

        {/* Comparison table */}
        <div style={{ marginTop: 80 }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.blue, letterSpacing: 2, textTransform: "uppercase", marginBottom: 24, textAlign: "center" }}>
            Feature Comparison
          </div>
          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr", padding: "12px 20px", background: C.panelHi, borderBottom: `1px solid ${C.line}` }}>
              {["Feature", "Free", "Analyst", "Team"].map((h, i) => (
                <span key={h} style={{ fontFamily: mono, fontSize: 10, color: i > 0 ? C.blue : C.muted, letterSpacing: 1, textTransform: "uppercase", textAlign: i > 0 ? "center" : "left" }}>{h}</span>
              ))}
            </div>
            {COMPARISON.map((row, i) => (
              <div key={row.feature} style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr", padding: "11px 20px", borderBottom: i < COMPARISON.length - 1 ? `1px solid ${C.line}` : "none", background: i % 2 ? "rgba(255,255,255,0.012)" : "transparent" }}>
                <span style={{ fontFamily: disp, fontSize: 13, color: C.sub }}>{row.feature}</span>
                {[row.free, row.analyst, row.team].map((v, j) => (
                  <span key={j} style={{ fontFamily: mono, fontSize: 12, textAlign: "center", color: v === "✓" || v === "Full" ? C.green : v === "Preview" || v === "Top 20" || v === "All 100" ? C.amber : v === "Enterprise" ? C.blue : C.muted }}>
                    {v}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div style={{ marginTop: 80 }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.blue, letterSpacing: 2, textTransform: "uppercase", marginBottom: 24, textAlign: "center" }}>
            Validated against institutional data
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[
              { icon: "📋", title: "SEC EDGAR verified", desc: "Every deal confirmed via 8-K Item 2.01 filing — announcement date, acquirer, deal type." },
              { icon: "🏦", title: "LSEG SDC corroborated", desc: "58.6% of our gold set independently confirmed against LSEG SDC Platinum, the industry benchmark." },
              { icon: "📊", title: "Walk-forward validated", desc: "Model trained only on the past, tested on deals it never saw. Gold standard for time-series finance." },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "20px 20px" }}>
                <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
                <div style={{ fontFamily: disp, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}>{title}</div>
                <div style={{ fontFamily: disp, fontSize: 13, color: C.muted, lineHeight: 1.55 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 80 }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.blue, letterSpacing: 2, textTransform: "uppercase", marginBottom: 32, textAlign: "center" }}>
            FAQ
          </div>
          <div style={{ display: "grid", gap: 0, maxWidth: 680, margin: "0 auto" }}>
            {[
              ["How is this different from PitchBook or CapIQ?", "PitchBook tells you who got acquired. DealFlow tells you who's next — ranked by the same financial signature that preceded 169 historical deals."],
              ["What's your accuracy?", "We don't predict individual acquisitions. We rank. The top 10% of our ranking contains 5.22× more acquisition targets than random selection — validated on 4 years of out-of-sample data."],
              ["Can I try before I buy?", "Yes. Free tier gives you the top 20 ranked companies, company profiles, and the methodology. No credit card required."],
              ["How fresh is the data?", "Scores update weekly. New 8-K filings are monitored daily. Financial data refreshes when new 10-Ks and 10-Qs are filed."],
            ].map(([q, a]) => (
              <div key={q} style={{ padding: "20px 0", borderBottom: `1px solid ${C.line}` }}>
                <div style={{ fontFamily: disp, fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 8 }}>{q}</div>
                <div style={{ fontFamily: disp, fontSize: 14, color: C.sub, lineHeight: 1.6 }}>{a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA footer */}
        <div style={{ textAlign: "center", paddingTop: 64 }}>
          <p style={{ fontFamily: disp, fontSize: 15, color: C.sub, marginBottom: 20 }}>
            Questions? Email <a href="mailto:ronak@dealflow.ai" style={{ color: C.blue }}>ronak@dealflow.ai</a>
          </p>
          <Link to="/methodology" style={{
            fontFamily: mono, fontSize: 12, color: C.muted, letterSpacing: 1,
          }}>Read the methodology →</Link>
        </div>
      </div>

      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} tier={selectedTier} />
    </div>
  );
}
