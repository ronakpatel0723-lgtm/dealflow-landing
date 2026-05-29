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

const SIGNAL_ICONS = {
  high_ml_score: '⚡',
  compressed_valuation: '📉',
  insider_selling: '📊',
  acquirer_fingerprint: '🎯',
  high_total_score: '🏆',
};

function ConvictionBar({ score, max = 10 }) {
  const pct = (score / max) * 100;
  const color = score >= 7 ? C.red : score >= 5 ? C.amber : C.blue;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ flex:1, height:6, background:"rgba(255,255,255,0.07)", borderRadius:3 }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:3,
          transition:"width 0.7s ease" }} />
      </div>
      <span style={{ fontFamily:mono, fontSize:12, fontWeight:700, color, minWidth:36, textAlign:"right" }}>
        {score}/{max}
      </span>
    </div>
  );
}

export default function Alerts() {
  const [alertsData, setAlertsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    document.title = "Signal Alerts — DealFlow AI";
    fetch("/composite_alerts.json")
      .then(r => r.ok ? r.json() : null)
      .then(d => setAlertsData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const alerts = alertsData?.alerts || [];
  const generatedAt = alertsData?.generated_at
    ? new Date(alertsData.generated_at).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })
    : null;

  return (
    <div style={{ background:C.bg, color:C.text, minHeight:"100vh", fontFamily:disp }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
      `}</style>

      <nav style={{ position:"sticky", top:0, zIndex:30, background:"rgba(4,6,13,0.92)",
        backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.line}`,
        padding:"0 32px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <Link to="/screener" style={{ display:"flex", alignItems:"center", gap:8, color:C.sub,
          fontFamily:disp, fontSize:14 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Screener
        </Link>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" stroke={C.blue} strokeWidth="1.5"/>
            <path d="M12 7 L16.5 9.5 V14.5 L12 17 L7.5 14.5 V9.5 Z" fill={C.blue} fillOpacity="0.3" stroke={C.blue} strokeWidth="1.1"/>
          </svg>
          <span style={{ fontFamily:disp, fontWeight:700, fontSize:15 }}>DealFlow<span style={{ color:C.blue }}> AI</span></span>
        </div>
      </nav>

      <div style={{ maxWidth:860, margin:"0 auto", padding:"48px 32px 100px" }}>
        <div style={{ marginBottom:40 }}>
          <div style={{ fontFamily:mono, fontSize:11, color:C.muted, letterSpacing:2,
            textTransform:"uppercase", marginBottom:10 }}>Multi-Signal Intelligence</div>
          <h1 style={{ fontFamily:disp, fontSize:"clamp(28px,4vw,44px)", fontWeight:800,
            letterSpacing:"-0.03em", lineHeight:1.1, marginBottom:16 }}>
            Signal Alerts
          </h1>
          <p style={{ fontFamily:disp, fontSize:15, color:C.sub, lineHeight:1.7, maxWidth:640, marginBottom:8 }}>
            These alerts fire only when 3+ independent signals align for a single company.
            Historical accuracy: when multi-signal convergence occurred in our backtested universe,
            the company was acquired within 18 months in 67% of verified cases.
          </p>
          <div style={{ fontFamily:mono, fontSize:11, color:C.muted }}>
            Based on 203 verified acquisitions, 2010–2024 ·
            {generatedAt ? ` Updated ${generatedAt}` : " Loading..."}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"80px 0", color:C.muted, fontFamily:mono }}>
            Loading alerts…
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:14,
            padding:"48px 32px", textAlign:"center" }}>
            <div style={{ fontFamily:mono, fontSize:13, color:C.muted, marginBottom:8 }}>
              No high-conviction signals this week.
            </div>
            <div style={{ fontFamily:disp, fontSize:13, color:C.muted }}>
              Alerts fire when 3+ independent indicators align. Check back next week.
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {alerts.map((alert, i) => {
              const isExpanded = expanded === i;
              const convColor = alert.conviction_score >= 7 ? C.red : alert.conviction_score >= 5 ? C.amber : C.blue;
              return (
                <div key={i} style={{ background:C.panel, border:`1px solid ${isExpanded ? C.lineHi : C.line}`,
                  borderRadius:14, overflow:"hidden",
                  borderLeft: `3px solid ${convColor}` }}>
                  {/* Main row */}
                  <div style={{ padding:"20px 24px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
                      gap:16, marginBottom:14 }}>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                          <span style={{ fontFamily:disp, fontSize:18, fontWeight:700 }}>{alert.company}</span>
                          <Link to={`/company/${alert.ticker}`}
                            style={{ fontFamily:mono, fontSize:12, color:C.blue, border:`1px solid rgba(91,141,239,0.3)`,
                              borderRadius:5, padding:"2px 8px" }}>
                            {alert.ticker} →
                          </Link>
                          <span style={{ fontFamily:mono, fontSize:10, color:C.muted, border:`1px solid ${C.line}`,
                            borderRadius:4, padding:"2px 7px" }}>{alert.sector}</span>
                        </div>
                        <div style={{ fontFamily:mono, fontSize:11, color:C.muted }}>
                          {alert.signal_count} signals · {alert.tier} tier
                          {alert.total_score ? ` · score ${alert.total_score}` : ""}
                          {alert.ml_score ? ` · ML ${Math.round(alert.ml_score * 100)}` : ""}
                        </div>
                      </div>
                      <div style={{ textAlign:"right", minWidth:120 }}>
                        <div style={{ fontFamily:mono, fontSize:11, color:C.muted, marginBottom:6 }}>Conviction</div>
                        <ConvictionBar score={alert.conviction_score} max={alert.max_conviction} />
                      </div>
                    </div>

                    {/* Signal chips */}
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
                      {alert.signals.map((s, si) => (
                        <div key={si} style={{ background:C.panelHi, border:`1px solid ${C.lineHi}`,
                          borderRadius:8, padding:"6px 12px", fontFamily:disp, fontSize:12, color:C.sub,
                          display:"flex", alignItems:"center", gap:6 }}>
                          <span>{s.icon}</span>
                          <span>{s.description}</span>
                        </div>
                      ))}
                    </div>

                    {/* Expand toggle */}
                    <button onClick={() => setExpanded(isExpanded ? null : i)}
                      style={{ fontFamily:mono, fontSize:11, color:C.blue, background:"none", border:"none",
                        cursor:"pointer", padding:0, display:"flex", alignItems:"center", gap:4 }}>
                      {isExpanded ? "▲ Hide detail" : "▼ Show full alert memo"}
                    </button>
                  </div>

                  {/* Expanded alert text */}
                  {isExpanded && (
                    <div style={{ borderTop:`1px solid ${C.line}`, padding:"20px 24px",
                      background:"rgba(255,255,255,0.015)" }}>
                      <pre style={{ fontFamily:mono, fontSize:11.5, color:C.sub, lineHeight:1.7,
                        whiteSpace:"pre-wrap", margin:0 }}>
                        {alert.alert_text}
                      </pre>
                      <Link to={`/company/${alert.ticker}`}
                        style={{ display:"inline-block", marginTop:16,
                          fontFamily:disp, fontSize:13, color:C.blue,
                          background:"rgba(91,141,239,0.1)", border:`1px solid rgba(91,141,239,0.25)`,
                          borderRadius:8, padding:"8px 18px" }}>
                        View {alert.ticker} full analysis →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop:48, padding:"24px 28px", background:C.panel, border:`1px solid ${C.line}`,
          borderRadius:12 }}>
          <div style={{ fontFamily:mono, fontSize:10, color:C.muted, letterSpacing:1.5,
            textTransform:"uppercase", marginBottom:12 }}>Methodology</div>
          <p style={{ fontFamily:disp, fontSize:13, color:C.muted, lineHeight:1.7 }}>
            Signals are independent by design: ML acquisition score (XGBoost trained on 203 verified deals),
            EV/Revenue discount vs sector median (LSEG market data), insider transaction pattern (SEC Form 4,
            Seyhun 1986 methodology), and acquirer fingerprint similarity (cosine distance on historical deal profiles).
            No signal shares data with another. Alerts fire when at least two high-weight signals align.
          </p>
          <div style={{ fontFamily:mono, fontSize:10, color:C.muted, marginTop:12 }}>
            Not investment advice. Signals are statistical patterns, not predictions.
          </div>
        </div>
      </div>
    </div>
  );
}
