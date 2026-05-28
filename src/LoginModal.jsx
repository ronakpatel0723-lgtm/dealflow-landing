import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext.jsx";

const C = {
  bg: "#04060D", panel: "#0A0E1A", panelHi: "#0E1424",
  line: "rgba(255,255,255,0.08)", lineHi: "rgba(255,255,255,0.16)",
  text: "#F3F6FD", sub: "#9BA8C6", muted: "#5C6880",
  blue: "#5B8DEF", green: "#36D399",
};
const disp = "'Bricolage Grotesque', -apple-system, sans-serif";
const mono = "'IBM Plex Mono', ui-monospace, Menlo, monospace";

const FORMSPREE = "https://formspree.io/f/xpznkgpg";

const TIERS = [
  { id: "free",    label: "Free",    price: "No cost",    desc: "Top 20 companies, public screener" },
  { id: "analyst", label: "Analyst", price: "$149/mo",    desc: "Full 100-company universe, CSV export" },
  { id: "team",    label: "Team",    price: "$499/mo",    desc: "Everything + thesis, API, webhooks" },
];

export default function LoginModal({ open, onClose }) {
  const { login } = useAuth();
  const [email, setEmail]   = useState("");
  const [tier, setTier]     = useState("analyst");
  const [status, setStatus] = useState("idle");
  const emailRef  = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setStatus("idle"); setEmail(""); setTier("analyst");
    setTimeout(() => emailRef.current?.focus(), 80);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleOverlay = (e) => { if (e.target === overlayRef.current) onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus("submitting");
    try {
      await fetch(FORMSPREE, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email, tier, subject: "Access Request - " + tier }),
      });
    } catch { /* fire and forget */ }
    login(email, tier);
    setStatus("success");
    setTimeout(() => onClose(), 1200);
  };

  if (!open) return null;

  return (
    <div ref={overlayRef} onClick={handleOverlay} style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(4,6,13,0.88)", backdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div role="dialog" aria-modal="true" aria-label="Access DealFlow AI" style={{
        background: C.panelHi, border: `1px solid ${C.lineHi}`, borderRadius: 16,
        padding: "40px", maxWidth: 480, width: "100%", position: "relative",
        boxShadow: "0 40px 120px rgba(0,0,0,0.7)",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16, background: "none",
          border: "none", color: C.muted, cursor: "pointer", fontSize: 20, lineHeight: 1,
        }}>×</button>

        {status === "success" ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontFamily: mono, fontSize: 28, color: C.green, marginBottom: 16 }}>✓</div>
            <h2 style={{ fontFamily: disp, fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 12px" }}>
              Access granted.
            </h2>
            <p style={{ fontFamily: disp, fontSize: 15, color: C.sub, lineHeight: 1.6 }}>
              Welcome to DealFlow AI — <strong style={{ color: C.text }}>{tier.charAt(0).toUpperCase() + tier.slice(1)} tier</strong>.
            </p>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: mono, fontSize: 11, color: C.blue, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
              Access DealFlow AI
            </div>
            <h2 style={{ fontFamily: disp, fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 28px" }}>
              Sign in or request access
            </h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontFamily: mono, fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Email *</label>
                <input
                  ref={emailRef}
                  type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@fund.com"
                  style={{ width: "100%", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: "11px 14px", color: C.text, fontFamily: mono, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => { e.target.style.borderColor = C.blue; }}
                  onBlur={(e)  => { e.target.style.borderColor = C.line; }}
                />
              </div>

              <div>
                <label style={{ fontFamily: mono, fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Plan</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {TIERS.map((t) => (
                    <label key={t.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      background: tier === t.id ? "rgba(91,141,239,0.1)" : C.panel,
                      border: `1px solid ${tier === t.id ? "rgba(91,141,239,0.4)" : C.line}`,
                      borderRadius: 8, padding: "12px 14px", cursor: "pointer",
                    }}>
                      <input
                        type="radio" name="tier"
                        value={t.id} checked={tier === t.id}
                        onChange={() => setTier(t.id)}
                        style={{ accentColor: C.blue }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: disp, fontSize: 14, fontWeight: 600, color: C.text }}>{t.label}</div>
                        <div style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>{t.desc}</div>
                      </div>
                      <span style={{ fontFamily: mono, fontSize: 12, color: tier === t.id ? C.blue : C.muted }}>{t.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                style={{
                  background: C.blue, color: "#fff", border: "none", borderRadius: 8,
                  padding: "13px", fontFamily: disp, fontSize: 15, fontWeight: 600,
                  cursor: status === "submitting" ? "wait" : "pointer",
                  opacity: status === "submitting" ? 0.7 : 1, marginTop: 4,
                }}
              >
                {status === "submitting" ? "Sending…" : "Request Access →"}
              </button>
            </form>

            <p style={{ fontFamily: mono, fontSize: 11, color: C.muted, marginTop: 16, lineHeight: 1.5 }}>
              We'll verify your subscription and follow up within 24 hours. In the meantime, you'll have preview access.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
