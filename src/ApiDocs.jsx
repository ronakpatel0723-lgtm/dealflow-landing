import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import LoginModal from "./LoginModal.jsx";

const C = {
  bg:"#04060D", panel:"#0A0E1A", panelHi:"#0E1424",
  line:"rgba(255,255,255,0.08)", lineHi:"rgba(255,255,255,0.16)",
  text:"#F3F6FD", sub:"#9BA8C6", muted:"#5C6880",
  blue:"#5B8DEF", green:"#36D399", amber:"#F5C24B",
};
const disp = "'Bricolage Grotesque', -apple-system, sans-serif";
const mono = "'IBM Plex Mono', ui-monospace, Menlo, monospace";

const BASE = "https://dealflow-landing-six.vercel.app";

const ENDPOINTS = [
  {
    method:"GET", path:"/api/companies",
    desc:"List all companies with scores, tiers, and financial metrics.",
    params:[{name:"tier", desc:"Filter by tier: High | Medium | Low"},{name:"sector",desc:"Filter by sector slug"}],
    curl:`curl "${BASE}/api/companies?tier=High"`,
    example:`{"total":10,"companies":[{"ticker":"DOCS","total_score":81.4,"tier":"High",...}]}`,
  },
  {
    method:"GET", path:"/api/companies/:ticker",
    desc:"Single company detail with all fields including SHAP factors and AI rationale.",
    params:[{name:":ticker",desc:"Company ticker symbol (e.g. VRNS, DOCS)"}],
    curl:`curl "${BASE}/api/companies/VRNS"`,
    example:`{"ticker":"VRNS","company":"Varonis Systems","total_score":64.0,"tier":"Medium","rationale":"..."}`,
  },
  {
    method:"GET", path:"/api/changes",
    desc:"Tier changes since last pipeline run — useful for webhook alert systems.",
    params:[],
    curl:`curl "${BASE}/api/changes"`,
    example:`{"tier_changes":[{"ticker":"QLYS","from_tier":"High","to_tier":"Medium","score":78.2}]}`,
  },
  {
    method:"GET", path:"/api/health",
    desc:"Model metadata: version, last trained, score distribution.",
    params:[],
    curl:`curl "${BASE}/api/health"`,
    example:`{"model_version":"ensemble-v4-203pos-10feat","positive_count":203,"total_count":131,"tiers":{"High":27,"Medium":39,"Low":65}}`,
  },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),1500); }}
      style={{ fontFamily:mono, fontSize:11, color: copied ? C.green : C.muted,
        background:"none", border:`1px solid ${copied ? C.green : C.line}`, borderRadius:4,
        padding:"2px 8px", cursor:"pointer", transition:"all 0.2s" }}>
      {copied ? "✓ copied" : "copy"}
    </button>
  );
}

function TryIt() {
  const [ticker, setTicker] = useState("VRNS");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const tryApi = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/companies/${ticker.toUpperCase()}`);
      const d = await r.json();
      setResult(JSON.stringify(d, null, 2));
    } catch (e) {
      setResult(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background:C.panelHi, border:`1px solid ${C.lineHi}`, borderRadius:12, padding:"28px 32px" }}>
      <div style={{ fontFamily:mono, fontSize:10, color:C.blue, letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>
        Try It Live
      </div>
      <p style={{ fontFamily:disp, fontSize:14, color:C.sub, marginBottom:20 }}>
        Enter a ticker and see the live API response:
      </p>
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <input
          value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="VRNS"
          style={{ fontFamily:mono, fontSize:14, background:C.panel, border:`1px solid ${C.line}`,
            borderRadius:8, padding:"10px 14px", color:C.text, outline:"none", width:120 }}
          onFocus={(e) => { e.target.style.borderColor = C.blue; }}
          onBlur={(e)  => { e.target.style.borderColor = C.line; }}
        />
        <button onClick={tryApi} disabled={loading}
          style={{ fontFamily:disp, fontSize:14, fontWeight:600, background:C.blue, color:"#fff",
            border:"none", borderRadius:8, padding:"10px 20px", cursor:"pointer",
            opacity: loading ? 0.7 : 1 }}>
          {loading ? "Loading…" : "Try it →"}
        </button>
      </div>
      {result && (
        <pre style={{ fontFamily:mono, fontSize:11.5, color:C.sub, background:C.panel,
          border:`1px solid ${C.line}`, borderRadius:8, padding:"16px 18px", overflow:"auto",
          maxHeight:300, lineHeight:1.5 }}>
          {result}
        </pre>
      )}
    </div>
  );
}

export default function ApiDocs() {
  const { isLoggedIn, userTier } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div style={{ background:C.bg, color:C.text, minHeight:"100vh", fontFamily:disp }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
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
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <Link to="/screener" style={{ fontFamily:mono, fontSize:13, color:C.sub }}>Screener</Link>
          <Link to="/methodology" style={{ fontFamily:mono, fontSize:13, color:C.sub }}>Methodology</Link>
          {!isLoggedIn && (
            <button onClick={() => setLoginOpen(true)}
              style={{ fontFamily:mono, fontSize:13, color:C.blue, background:"none", border:`1px solid rgba(91,141,239,0.3)`, borderRadius:6, padding:"6px 14px", cursor:"pointer" }}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      <div style={{ maxWidth:860, margin:"0 auto", padding:"56px 32px 100px" }}>

        {/* Header */}
        <div style={{ fontFamily:mono, fontSize:11, color:C.blue, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>
          REST API
        </div>
        <h1 style={{ fontFamily:disp, fontSize:"clamp(28px,4vw,44px)", fontWeight:800, letterSpacing:"-0.03em", marginBottom:16 }}>
          API Reference
        </h1>

        {/* Section 1: Overview */}
        <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:12, padding:"24px 28px", marginBottom:24 }}>
          <p style={{ fontFamily:disp, fontSize:15, color:C.sub, lineHeight:1.65 }}>
            DealFlow AI provides a REST API for programmatic access to acquisition signal data.
            All endpoints return JSON. Base URL: <code style={{ fontFamily:mono, color:C.blue }}>https://dealflow-landing-six.vercel.app</code>.
            Rate limit: 100 requests/hour.
          </p>
        </div>

        {/* Section 2: Authentication */}
        <div style={{ fontFamily:mono, fontSize:10, color:C.muted, letterSpacing:1.5, textTransform:"uppercase", marginBottom:12 }}>
          Authentication
        </div>
        <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:12, padding:"24px 28px", marginBottom:32 }}>
          <p style={{ fontFamily:disp, fontSize:15, color:C.sub, lineHeight:1.65, marginBottom:12 }}>
            Include your API key in the Authorization header:
          </p>
          <pre style={{ fontFamily:mono, fontSize:13, color:C.text, background:C.panelHi,
            border:`1px solid ${C.line}`, borderRadius:8, padding:"12px 16px" }}>
{`Authorization: Bearer YOUR_API_KEY`}
          </pre>
          <p style={{ fontFamily:disp, fontSize:13, color:C.muted, marginTop:12 }}>
            API keys available on Team and Enterprise plans. The current API is unauthenticated for demo purposes.
          </p>
        </div>

        {/* Section 3: Endpoints */}
        <div style={{ fontFamily:mono, fontSize:10, color:C.muted, letterSpacing:1.5, textTransform:"uppercase", marginBottom:12 }}>
          Endpoints
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:32 }}>
          {ENDPOINTS.map((ep, idx) => (
            <EndpointCard key={idx} ep={ep} />
          ))}
        </div>

        {/* Section 4: Webhooks */}
        <div style={{ fontFamily:mono, fontSize:10, color:C.muted, letterSpacing:1.5, textTransform:"uppercase", marginBottom:12 }}>
          Webhook Alerts
        </div>
        <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:12, padding:"24px 28px", marginBottom:32 }}>
          <p style={{ fontFamily:disp, fontSize:15, color:C.sub, lineHeight:1.65, marginBottom:12 }}>
            Configure a webhook URL to receive real-time tier change alerts:
          </p>
          <pre style={{ fontFamily:mono, fontSize:13, color:C.sub, background:C.panelHi,
            border:`1px solid ${C.line}`, borderRadius:8, padding:"12px 16px" }}>
{`POST https://your-endpoint.com/webhook
{
  "event": "tier_change",
  "ticker": "QLYS",
  "company": "Qualys",
  "from_tier": "High",
  "to_tier": "Medium",
  "score": 78.2
}`}
          </pre>
          <p style={{ fontFamily:disp, fontSize:13, color:C.muted, marginTop:12 }}>
            Webhooks available on Team plan. Configure at{" "}
            <Link to="/pricing" style={{ color:C.blue }}>dealflow-landing-six.vercel.app/pricing</Link>.
          </p>
        </div>

        {/* Try It */}
        <TryIt />

      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}

function EndpointCard({ ep }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:12, overflow:"hidden" }}>
      <div style={{ padding:"20px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10, flexWrap:"wrap" }}>
          <span style={{ fontFamily:mono, fontSize:11, fontWeight:700, color:"#fff",
            background:"rgba(54,211,153,0.2)", border:"1px solid rgba(54,211,153,0.4)",
            borderRadius:4, padding:"2px 8px" }}>GET</span>
          <code style={{ fontFamily:mono, fontSize:14, color:C.blue }}>{ep.path}</code>
          <CopyButton text={ep.curl} />
        </div>
        <p style={{ fontFamily:disp, fontSize:14, color:C.sub, lineHeight:1.5 }}>{ep.desc}</p>
        {ep.params.length > 0 && (
          <div style={{ marginTop:12, display:"flex", flexWrap:"wrap", gap:8 }}>
            {ep.params.map(p => (
              <span key={p.name} style={{ fontFamily:mono, fontSize:11, color:C.muted,
                background:C.panelHi, border:`1px solid ${C.line}`, borderRadius:4, padding:"2px 8px" }}>
                {p.name}: <span style={{ color:C.sub }}>{p.desc}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <div style={{ borderTop:`1px solid ${C.line}`, padding:"12px 24px", background:C.panelHi }}>
        <code style={{ fontFamily:mono, fontSize:12, color:C.muted }}>{ep.curl}</code>
      </div>
      <div style={{ borderTop:`1px solid ${C.line}`, padding:"8px 24px" }}>
        <button onClick={() => setExpanded(v=>!v)}
          style={{ fontFamily:mono, fontSize:11, color:C.muted, background:"none", border:"none", cursor:"pointer" }}>
          {expanded ? "▲ hide response" : "▼ example response"}
        </button>
        {expanded && (
          <pre style={{ fontFamily:mono, fontSize:11.5, color:C.sub, marginTop:8,
            background:C.panelHi, border:`1px solid ${C.line}`, borderRadius:6,
            padding:"12px 14px", overflow:"auto" }}>
            {ep.example}
          </pre>
        )}
      </div>
    </div>
  );
}
