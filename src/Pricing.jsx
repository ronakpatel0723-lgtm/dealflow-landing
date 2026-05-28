import React, { useState } from "react";
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
      "65 public SaaS companies ranked",
      "Full ML acquisition score + sub-scores",
      "Company detail pages with rationale",
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
      "300+ company universe",
      "Form 4 insider signal layer",
      "Score-change email alerts",
      "5 seats",
      "Slack integration",
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
      "API access",
      "CRM / workflow integrations",
      "White-label option",
      "Dedicated onboarding",
    ],
    cta: "Talk to us",
    highlight: false,
  },
];

export default function Pricing() {
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, alignItems: "start" }}>
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

        {/* FAQ */}
        <div style={{ marginTop: 80 }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.blue, letterSpacing: 2, textTransform: "uppercase", marginBottom: 32, textAlign: "center" }}>
            FAQ
          </div>
          <div style={{ display: "grid", gap: 0, maxWidth: 680, margin: "0 auto" }}>
            {[
              ["What does 'private beta' mean?", "We're onboarding users manually to ensure quality. You'll hear from us within 24 hours of requesting access."],
              ["How is DealFlow AI different from CapIQ or Refinitiv?", "DealFlow AI doesn't sell raw data — it sells a ranked signal. The acquisition likelihood score is the product. No terminal license required."],
              ["How often are scores updated?", "Weekly on the Analyst plan. Real-time score-change alerts on Team and above."],
              ["What's the methodology behind the score?", "Walk-forward XGBoost model trained on 27,949 company-year observations, 264 verified acquisitions. See the full breakdown on our Methodology page."],
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
