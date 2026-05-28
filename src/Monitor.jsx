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

function Chip({ label, value, ok }) {
  const color = ok === true ? C.green : ok === false ? C.red : C.amber;
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"10px 16px", background:C.panelHi, border:`1px solid ${C.line}`, borderRadius:8, marginBottom:8 }}>
      <span style={{ fontFamily:disp, fontSize:13, color:C.sub }}>{label}</span>
      <span style={{ fontFamily:mono, fontSize:13, color, fontWeight:600 }}>{value}</span>
    </div>
  );
}

export default function Monitor() {
  useEffect(() => { document.title = "Monitor — DealFlow AI [internal]"; }, []);

  const [meta, setMeta] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [changes, setChanges] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch("/scores.json")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setMeta(data.metadata || {});
        setCompanies(data.companies || []);
      })
      .catch(() => {});

    fetch("/score_changes.json")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setChanges(data); })
      .catch(() => {});

    fetch("/score_history.csv")
      .then(r => r.ok ? r.text() : null)
      .then(text => {
        if (!text) return;
        const rows = text.trim().split("\n").slice(1).map(r => r.split(","));
        setHistory(rows.slice(-10).reverse());
      })
      .catch(() => {});
  }, []);

  const tiers = companies.reduce((acc, c) => {
    acc[c.tier] = (acc[c.tier] || 0) + 1;
    return acc;
  }, {});

  const requiredFields = ["ticker", "company", "tier", "total_score", "gross_margin", "rule_of_40"];
  const fieldCoverage = requiredFields.map(f => ({
    field: f,
    count: companies.filter(c => c[f] != null).length,
    ok: companies.length === 0 || companies.filter(c => c[f] != null).length / companies.length >= 0.9,
  }));

  const topMovers = changes?.tier_changes?.slice(0, 5) || [];

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
      `}</style>

      <nav style={{ position:"sticky", top:0, zIndex:50, background:"rgba(4,6,13,0.92)",
        backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.line}`,
        padding:"0 24px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" stroke={C.blue} strokeWidth="1.5"/>
            <path d="M12 7 L16.5 9.5 V14.5 L12 17 L7.5 14.5 V9.5 Z" fill={C.blue} fillOpacity="0.3" stroke={C.blue} strokeWidth="1.1"/>
          </svg>
          <span style={{ fontFamily:disp, fontSize:14, fontWeight:700 }}>DealFlow<span style={{ color:C.blue }}> AI</span></span>
          <span style={{ fontFamily:mono, fontSize:10, color:C.amber, background:"rgba(245,194,75,0.1)",
            border:`1px solid rgba(245,194,75,0.3)`, borderRadius:4, padding:"2px 8px", marginLeft:8 }}>
            INTERNAL
          </span>
        </div>
        <Link to="/screener" style={{ fontFamily:mono, fontSize:12, color:C.muted }}>← Screener</Link>
      </nav>

      <div style={{ maxWidth:800, margin:"0 auto", padding:"48px 24px 100px" }}>
        <div style={{ fontFamily:mono, fontSize:11, color:C.amber, letterSpacing:2,
          textTransform:"uppercase", marginBottom:12 }}>Internal Dashboard · /monitor</div>
        <h1 style={{ fontFamily:disp, fontSize:28, fontWeight:800, letterSpacing:"-0.02em", marginBottom:40 }}>
          Model & Data Health
        </h1>

        {/* Model info */}
        <div style={{ fontFamily:mono, fontSize:10, color:C.muted, letterSpacing:1.5,
          textTransform:"uppercase", marginBottom:12 }}>Model</div>
        <div style={{ marginBottom:32 }}>
          <Chip label="Model version" value={meta?.model_version || "—"} ok={!!meta?.model_version} />
          <Chip label="Training positives" value={meta?.positive_count ? String(meta.positive_count) : "—"} ok={meta?.positive_count >= 100} />
          <Chip label="Last model trained" value={meta?.last_model_trained ? new Date(meta.last_model_trained).toLocaleString() : "—"} ok={!!meta?.last_model_trained} />
          <Chip label="Last data updated" value={meta?.last_updated ? new Date(meta.last_updated).toLocaleString() : "—"} ok={!!meta?.last_updated} />
          <Chip label="Score methodology" value={meta?.score_methodology || "—"} ok={null} />
        </div>

        {/* Company counts */}
        <div style={{ fontFamily:mono, fontSize:10, color:C.muted, letterSpacing:1.5,
          textTransform:"uppercase", marginBottom:12 }}>Universe</div>
        <div style={{ marginBottom:32 }}>
          <Chip label="Total companies" value={String(companies.length)} ok={companies.length >= 65} />
          <Chip label="High tier" value={String(tiers.High || 0)} ok={(tiers.High || 0) >= 5} />
          <Chip label="Medium tier" value={String(tiers.Medium || 0)} ok={true} />
          <Chip label="Low tier" value={String(tiers.Low || 0)} ok={true} />
        </div>

        {/* Field coverage */}
        <div style={{ fontFamily:mono, fontSize:10, color:C.muted, letterSpacing:1.5,
          textTransform:"uppercase", marginBottom:12 }}>Field Coverage (≥90% = green)</div>
        <div style={{ marginBottom:32 }}>
          {fieldCoverage.map(f => (
            <Chip key={f.field} label={f.field}
              value={companies.length > 0 ? `${f.count}/${companies.length} (${Math.round(f.count/companies.length*100)}%)` : "—"}
              ok={f.ok} />
          ))}
        </div>

        {/* Top movers */}
        {topMovers.length > 0 && (
          <>
            <div style={{ fontFamily:mono, fontSize:10, color:C.muted, letterSpacing:1.5,
              textTransform:"uppercase", marginBottom:12 }}>Tier Changes (Latest Run)</div>
            <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:10,
              overflow:"hidden", marginBottom:32 }}>
              {topMovers.map((c, i) => (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr auto auto auto",
                  gap:12, alignItems:"center", padding:"12px 20px",
                  borderBottom: i < topMovers.length - 1 ? `1px solid ${C.line}` : "none" }}>
                  <span style={{ fontFamily:mono, fontSize:13 }}>{c.ticker || c.company}</span>
                  <span style={{ fontFamily:mono, fontSize:11, color:C.red }}>{c.from_tier}</span>
                  <span style={{ fontFamily:mono, fontSize:10, color:C.muted }}>→</span>
                  <span style={{ fontFamily:mono, fontSize:11, color:C.green }}>{c.to_tier}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Score history */}
        {history.length > 0 && (
          <>
            <div style={{ fontFamily:mono, fontSize:10, color:C.muted, letterSpacing:1.5,
              textTransform:"uppercase", marginBottom:12 }}>Score History (last 10 runs)</div>
            <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:10,
              overflow:"hidden", marginBottom:32 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", padding:"8px 20px",
                borderBottom:`1px solid ${C.line}`, background:C.panelHi }}>
                {["Date", "Ticker", "Score"].map(h => (
                  <span key={h} style={{ fontFamily:mono, fontSize:9.5, color:C.muted,
                    textTransform:"uppercase", letterSpacing:1 }}>{h}</span>
                ))}
              </div>
              {history.map((row, i) => (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
                  padding:"10px 20px", borderBottom: i < history.length - 1 ? `1px solid ${C.line}` : "none" }}>
                  {row.slice(0, 3).map((cell, j) => (
                    <span key={j} style={{ fontFamily:mono, fontSize:12, color: j === 2 ? C.green : C.sub }}>{cell}</span>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}

        {!meta && (
          <p style={{ fontFamily:mono, fontSize:13, color:C.muted }}>Loading scores.json…</p>
        )}
      </div>
    </div>
  );
}
