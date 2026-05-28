import React, { useState, useEffect, useRef } from "react";

const C = {
  bg: "#04060D", panel: "#0A0E1A", panelHi: "#0E1424",
  line: "rgba(255,255,255,0.08)", lineHi: "rgba(255,255,255,0.16)",
  text: "#F3F6FD", sub: "#9BA8C6", muted: "#5C6880",
  blue: "#5B8DEF", green: "#36D399",
};
const disp = "'Bricolage Grotesque', -apple-system, sans-serif";
const mono = "'IBM Plex Mono', ui-monospace, Menlo, monospace";

const FORMSPREE = "https://formspree.io/f/xpznkgpg";

export default function WaitlistModal({ open, onClose, tier = "" }) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const emailRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setStatus("idle");
    setEmail(""); setCompany(""); setRole("");
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
      const res = await fetch(FORMSPREE, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email, company, role, tier }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (!open) return null;

  return (
    <div ref={overlayRef} onClick={handleOverlay} style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(4,6,13,0.82)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div role="dialog" aria-modal="true" aria-label="Request access" style={{
        background: C.panelHi, border: `1px solid ${C.lineHi}`, borderRadius: 16,
        padding: "40px", maxWidth: 460, width: "100%", position: "relative",
        boxShadow: "0 40px 120px rgba(0,0,0,0.7)",
      }}>
        {/* close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16, background: "none",
          border: "none", color: C.muted, cursor: "pointer", fontSize: 20, lineHeight: 1,
        }}>×</button>

        {status === "success" ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontFamily: mono, fontSize: 28, color: C.green, marginBottom: 16 }}>✓</div>
            <h2 style={{ fontFamily: disp, fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 12px" }}>
              You're on the list.
            </h2>
            <p style={{ fontFamily: disp, fontSize: 15, color: C.sub, lineHeight: 1.6 }}>
              We'll be in touch at <strong style={{ color: C.text }}>{email}</strong>.
            </p>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: mono, fontSize: 11, color: C.blue, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
              {tier ? `${tier} plan` : "Early access"}
            </div>
            <h2 style={{ fontFamily: disp, fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 8px" }}>
              Request access
            </h2>
            <p style={{ fontFamily: disp, fontSize: 14, color: C.sub, margin: "0 0 28px", lineHeight: 1.55 }}>
              DealFlow AI is in private beta. Drop your email and we'll reach out within 24 hours.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontFamily: mono, fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Email *</label>
                <input
                  ref={emailRef}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@fund.com"
                  style={{
                    width: "100%", background: C.panel, border: `1px solid ${C.line}`,
                    borderRadius: 8, padding: "11px 14px", color: C.text,
                    fontFamily: mono, fontSize: 14, outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = C.blue; }}
                  onBlur={(e) => { e.target.style.borderColor = C.line; }}
                />
              </div>
              <div>
                <label style={{ fontFamily: mono, fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Capital"
                  style={{
                    width: "100%", background: C.panel, border: `1px solid ${C.line}`,
                    borderRadius: 8, padding: "11px 14px", color: C.text,
                    fontFamily: mono, fontSize: 14, outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = C.blue; }}
                  onBlur={(e) => { e.target.style.borderColor = C.line; }}
                />
              </div>
              <div>
                <label style={{ fontFamily: mono, fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Corp Dev, PE Associate, ..."
                  style={{
                    width: "100%", background: C.panel, border: `1px solid ${C.line}`,
                    borderRadius: 8, padding: "11px 14px", color: C.text,
                    fontFamily: mono, fontSize: 14, outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = C.blue; }}
                  onBlur={(e) => { e.target.style.borderColor = C.line; }}
                />
              </div>

              {status === "error" && (
                <p style={{ fontFamily: mono, fontSize: 12, color: "#F77272", margin: 0 }}>
                  Something went wrong. Email <a href="mailto:ronak@dealflow.ai" style={{ color: "#F77272" }}>ronak@dealflow.ai</a> directly.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                style={{
                  background: C.blue, color: "#fff", border: "none", borderRadius: 8,
                  padding: "13px", fontFamily: disp, fontSize: 15, fontWeight: 600,
                  cursor: status === "submitting" ? "wait" : "pointer",
                  opacity: status === "submitting" ? 0.7 : 1,
                  marginTop: 6,
                }}
              >
                {status === "submitting" ? "Sending…" : "Request Access →"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
