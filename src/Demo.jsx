import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import WaitlistModal from "./WaitlistModal.jsx";

const C = {
  bg:"#04060D", panel:"#0A0E1A", panelHi:"#0E1424",
  line:"rgba(255,255,255,0.08)", lineHi:"rgba(255,255,255,0.16)",
  text:"#F3F6FD", sub:"#9BA8C6", muted:"#5C6880",
  blue:"#5B8DEF", green:"#36D399",
};
const disp = "'Bricolage Grotesque', -apple-system, sans-serif";
const mono = "'IBM Plex Mono', ui-monospace, Menlo, monospace";

const FORMSPREE = "https://formspree.io/f/xpznkgpg";
const ROLES = ["Corp Dev / M&A", "Private Equity", "Venture Capital", "Investment Banking", "Independent Sponsor", "Other"];
const TIMES = ["Morning (9–12)", "Afternoon (12–5)", "Either works"];

export default function Demo() {
  useEffect(() => { document.title = "Book a Demo — DealFlow AI"; }, []);
  const [form, setForm] = useState({ name:"", email:"", company:"", role:"", time:"" });
  const [status, setStatus] = useState("idle");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.name) return;
    setStatus("submitting");
    try {
      const res = await fetch(FORMSPREE, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ ...form, subject: "Demo Request" }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text, fontFamily:disp }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        .df-input{width:100%;background:#0A0E1A;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:11px 14px;color:#F3F6FD;font-family:'IBM Plex Mono',monospace;font-size:14px;outline:none;box-sizing:border-box}
        .df-input:focus{border-color:#5B8DEF}
        select.df-input option{background:#0A0E1A}
        @media(max-width:640px){.demo-grid{grid-template-columns:1fr!important}}
      `}</style>

      <nav style={{ position:"sticky", top:0, zIndex:30, background:"rgba(4,6,13,0.92)",
        backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.line}`,
        padding:"0 32px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" stroke={C.blue} strokeWidth="1.5"/>
            <path d="M12 7 L16.5 9.5 V14.5 L12 17 L7.5 14.5 V9.5 Z" fill={C.blue} fillOpacity="0.3" stroke={C.blue} strokeWidth="1.1"/>
          </svg>
          <Link to="/" style={{ fontFamily:disp, fontWeight:700, fontSize:15 }}>DealFlow<span style={{ color:C.blue }}> AI</span></Link>
        </div>
        <div style={{ display:"flex", gap:20 }}>
          <Link to="/screener" style={{ fontFamily:mono, fontSize:13, color:C.sub }}>Screener</Link>
          <Link to="/pricing" style={{ fontFamily:mono, fontSize:13, color:C.sub }}>Pricing</Link>
        </div>
      </nav>

      <div style={{ maxWidth:640, margin:"0 auto", padding:"72px 32px 100px" }}>

        <div style={{ fontFamily:mono, fontSize:11, color:C.blue, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>
          Book a Demo
        </div>
        <h1 style={{ fontFamily:disp, fontSize:"clamp(28px,4vw,44px)", fontWeight:800, letterSpacing:"-0.03em", marginBottom:16 }}>
          See DealFlow AI<br/>in 20 minutes.
        </h1>
        <p style={{ fontFamily:disp, fontSize:16, color:C.sub, lineHeight:1.6, marginBottom:40 }}>
          We'll walk through the screener, explain the methodology, and show you your top acquisition targets. No slides, no pitch — just the product.
        </p>

        {status === "success" ? (
          <div style={{ background:C.panelHi, border:`1px solid rgba(54,211,153,0.3)`, borderRadius:14, padding:"40px 32px", textAlign:"center" }}>
            <div style={{ fontFamily:mono, fontSize:28, color:C.green, marginBottom:16 }}>✓</div>
            <h2 style={{ fontFamily:disp, fontSize:22, fontWeight:700, marginBottom:12 }}>We're on it.</h2>
            <p style={{ fontFamily:disp, fontSize:15, color:C.sub, lineHeight:1.6 }}>
              We'll be in touch within 24 hours to confirm your demo time.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div className="demo-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div>
                <label style={{ fontFamily:mono, fontSize:11, color:C.muted, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Name *</label>
                <input className="df-input" type="text" required value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label style={{ fontFamily:mono, fontSize:11, color:C.muted, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Email *</label>
                <input className="df-input" type="email" required value={form.email} onChange={e=>set("email",e.target.value)} placeholder="you@fund.com" />
              </div>
            </div>
            <div>
              <label style={{ fontFamily:mono, fontSize:11, color:C.muted, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Company</label>
              <input className="df-input" type="text" value={form.company} onChange={e=>set("company",e.target.value)} placeholder="Firm / fund name" />
            </div>
            <div>
              <label style={{ fontFamily:mono, fontSize:11, color:C.muted, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Role</label>
              <select className="df-input" value={form.role} onChange={e=>set("role",e.target.value)}>
                <option value="">Select role...</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontFamily:mono, fontSize:11, color:C.muted, letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:6 }}>Preferred time</label>
              <select className="df-input" value={form.time} onChange={e=>set("time",e.target.value)}>
                <option value="">Select preference...</option>
                {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {status === "error" && (
              <p style={{ fontFamily:mono, fontSize:12, color:"#F77272" }}>
                Something went wrong. Email <a href="mailto:ronakpatel0723@gmail.com" style={{ color:"#F77272" }}>ronakpatel0723@gmail.com</a> directly.
              </p>
            )}

            <button type="submit" disabled={status === "submitting"}
              style={{ background:C.blue, color:"#fff", border:"none", borderRadius:8,
                padding:"14px", fontFamily:disp, fontSize:15, fontWeight:600,
                cursor: status === "submitting" ? "wait" : "pointer",
                opacity: status === "submitting" ? 0.7 : 1 }}>
              {status === "submitting" ? "Sending…" : "Request Demo →"}
            </button>
          </form>
        )}

        <div style={{ marginTop:40, display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <Link to="/screener" style={{ fontFamily:mono, fontSize:13, color:C.muted }}>← Explore the screener first</Link>
          <span style={{ color:C.muted }}>·</span>
          <Link to="/methodology" style={{ fontFamily:mono, fontSize:13, color:C.muted }}>Read the methodology →</Link>
        </div>
      </div>
    </div>
  );
}
