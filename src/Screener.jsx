import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

/* ── DealFlow AI — Screener Page ────────────────────────────────────────────
   Same visual language as App.jsx: Bricolage Grotesque, IBM Plex Mono,
   dark navy (#04060D), blue accent (#5B8DEF), grain + glow atmosphere.

   DATA: Swap the SAMPLE_COMPANIES array below for real data once
         the backend serves a /scores.json endpoint. Each object needs:
         { rank, name, ticker, sector, score, tier, revenue, gm, r40,
           evRev, growth, scores:{revenue,margins,growth,valuation},
           rationale, spark:[7 numbers] }
   ─────────────────────────────────────────────────────────────────────── */

// ─── Colour tokens (match App.jsx C object exactly) ─────────────────────────
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

// ─── Sample data (replace with scores.json import) ──────────────────────────
const SAMPLE_COMPANIES = [
  { rank:1,  name:"Qualys",               ticker:"QLYS",  sector:"Cybersecurity",   score:80, tier:"High",   revenue:478,  gm:82.8, r40:43.3, evRev:5.9,  growth:11.5, scores:{revenue:78,margins:88,growth:62,valuation:71}, rationale:"Strong margin profile with compressed EV/Revenue. Acquisition pattern matches Palo Alto Networks' tuck-in strategy for pure-play security platforms. 82% gross margin signals high recurring-revenue quality.",           spark:[74,76,76,78,77,79,80] },
  { rank:2,  name:"Clearwater Analytics",  ticker:"CWAN",  sector:"Fintech",         score:78, tier:"High",   revenue:402,  gm:77.4, r40:60.8, evRev:6.2,  growth:25.1, scores:{revenue:72,margins:81,growth:89,valuation:68}, rationale:"Rare combination of >60 Rule of 40 at sub-$500M revenue. Fintech infrastructure targets frequently attract PE sponsors at 6–9× EV/Revenue. Strong growth acceleration in institutional segment.",          spark:[71,73,74,75,75,77,78] },
  { rank:3,  name:"Duolingo",              ticker:"DUOL",  sector:"Consumer SaaS",   score:73, tier:"High",   revenue:531,  gm:72.1, r40:45.2, evRev:7.8,  growth:38.7, scores:{revenue:68,margins:74,growth:91,valuation:55}, rationale:"Accelerating growth with improving margin trajectory. Consumer learning platform with defensible content moat. Strategic fit for enterprise L&D vendors (SAP SuccessFactors, Workday Learning).",               spark:[65,67,68,70,70,72,73] },
  { rank:4,  name:"Hims & Hers Health",    ticker:"HIMS",  sector:"Healthcare Tech", score:72, tier:"High",   revenue:872,  gm:73.8, r40:55.9, evRev:2.4,  growth:59.0, scores:{revenue:80,margins:76,growth:95,valuation:82}, rationale:"Deeply discounted EV/Revenue at hypergrowth trajectory. Healthcare acquirers (CVS, UnitedHealth, Teladoc) have shown appetite for DTC health platforms at materially higher multiples.",               spark:[61,63,64,67,68,70,72] },
  { rank:5,  name:"Semrush",               ticker:"SEMR",  sector:"SaaS",            score:69, tier:"Medium", revenue:380,  gm:80.5, r40:32.4, evRev:3.5,  growth:22.4, scores:{revenue:65,margins:85,growth:71,valuation:77}, rationale:"Best-in-class gross margins for revenue scale. MarTech consolidation wave favors SEO and analytics platforms. Natural bolt-on for Salesforce, HubSpot, or Salesforce Marketing Cloud.",                      spark:[65,65,66,67,67,68,69] },
  { rank:6,  name:"Cloudflare",            ticker:"NET",   sector:"Cybersecurity",   score:67, tier:"Medium", revenue:1625, gm:77.9, r40:31.8, evRev:14.2, growth:28.2, scores:{revenue:90,margins:82,growth:80,valuation:28}, rationale:"Premium valuation limits near-term probability, but strategic SASE/zero-trust position makes it a long-run target as multiple compression continues. Network effects create durable moat.",                     spark:[66,66,67,67,67,67,67] },
  { rank:7,  name:"DigitalOcean",          ticker:"DOCN",  sector:"Cloud Infra",     score:65, tier:"Medium", revenue:785,  gm:62.4, r40:24.1, evRev:3.8,  growth:12.8, scores:{revenue:75,margins:64,growth:55,valuation:74}, rationale:"Developer cloud with attractive valuation. Hyperscalers have shown appetite for SMB-focused infrastructure. Recent profitability improvement strengthens acquiree profile.",                              spark:[62,62,63,64,64,65,65] },
  { rank:8,  name:"BlackLine",             ticker:"BL",    sector:"Fintech",         score:63, tier:"Medium", revenue:649,  gm:75.2, r40:22.6, evRev:5.1,  growth:11.4, scores:{revenue:72,margins:78,growth:50,valuation:60}, rationale:"Finance automation with deep ERP integrations. SAP's acquisition of Concur is the template; BlackLine's Oracle and SAP adjacency increases strategic fit probability materially.",                        spark:[60,61,62,62,63,63,63] },
  { rank:9,  name:"PagerDuty",             ticker:"PD",    sector:"SaaS",            score:61, tier:"Medium", revenue:444,  gm:82.1, r40:17.3, evRev:3.9,  growth:10.2, scores:{revenue:63,margins:87,growth:44,valuation:73}, rationale:"Exceptional margins with decelerating growth — the classic pre-acquisition profile. AIOps consolidation favors standalone operations platforms. ServiceNow or Cisco are natural strategic fits.",              spark:[59,60,60,61,61,61,61] },
  { rank:10, name:"JFrog",                 ticker:"FROG",  sector:"DevTools",        score:59, tier:"Medium", revenue:416,  gm:79.2, r40:20.5, evRev:4.7,  growth:18.8, scores:{revenue:62,margins:83,growth:60,valuation:65}, rationale:"DevSecOps platform with sticky enterprise contracts and strong developer NPS. GitHub/Microsoft and GitLab acquisition activity signals appetite for developer toolchain assets.",                       spark:[55,56,57,58,59,59,59] },
  { rank:11, name:"Amplitude",             ticker:"AMPL",  sector:"SaaS",            score:54, tier:"Medium", revenue:321,  gm:68.1, r40:8.2,  evRev:2.8,  growth:13.5, scores:{revenue:55,margins:70,growth:46,valuation:80}, rationale:"Product analytics at historically low EV/Revenue. Declining valuation premium increases acquisition probability window. Mixpanel/Heap consolidation is a precursor signal.",                            spark:[54,54,54,54,54,54,54] },
  { rank:12, name:"Braze",                 ticker:"BRZE",  sector:"MarTech",         score:49, tier:"Low",    revenue:471,  gm:67.8, r40:6.1,  evRev:5.8,  growth:22.4, scores:{revenue:64,margins:68,growth:71,valuation:52}, rationale:"Customer engagement at scale. Marketing cloud consolidation (Salesforce, Adobe) creates acquisition pathways, but current valuation premium limits near-term probability.",                          spark:[48,49,48,49,49,49,49] },
  { rank:13, name:"Weave Communications",  ticker:"WEAV",  sector:"Healthcare Tech", score:46, tier:"Low",    revenue:182,  gm:69.4, r40:-1.2, evRev:2.1,  growth:18.8, scores:{revenue:42,margins:70,growth:60,valuation:84}, rationale:"SMB healthcare communications with attractive price point but sub-threshold revenue scale. Below typical strategic acquisition threshold; more likely PE take-private than strategic.",                     spark:[45,46,45,46,46,46,46] },
  { rank:14, name:"Nuvei",                 ticker:"NVEI",  sector:"Fintech",         score:44, tier:"Low",    revenue:1142, gm:60.3, r40:12.1, evRev:2.9,  growth:14.2, scores:{revenue:85,margins:61,growth:52,valuation:75}, rationale:"Payments infrastructure at significant EV/Revenue discount. Acquirees in payments consolidation (Visa, Mastercard, FIS) typically target vertical-specific processors at 4–6× revenue.",             spark:[43,44,43,44,44,44,44] },
  { rank:15, name:"Vimeo",                 ticker:"VMEO",  sector:"SaaS",            score:38, tier:"Low",    revenue:427,  gm:75.8, r40:-9.3, evRev:0.9,  growth:2.1,  scores:{revenue:60,margins:79,growth:22,valuation:90}, rationale:"Margin profile and valuation are attractive, but near-zero growth and profitability gap reduce strategic urgency. Potential PE take-private target at current EV/Revenue below 1×.",                  spark:[40,39,39,38,38,38,38] },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function tierColor(t) {
  if (t === "High")   return C.green;
  if (t === "Medium") return C.amber;
  return C.red;
}
function scoreColor(s) {
  if (s >= 70) return C.green;
  if (s >= 50) return C.amber;
  return C.red;
}

// ─── Sparkline ───────────────────────────────────────────────────────────────
function Sparkline({ data }) {
  const W = 50, H = 16;
  const min = Math.min(...data), max = Math.max(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * W},${H - ((v - min) / rng) * (H - 2) - 1}`
  ).join(" ");
  const col = data[data.length - 1] >= data[0] ? C.green : C.red;
  return (
    <svg width={W} height={H} style={{ display: "block", flexShrink: 0 }}>
      <polyline points={pts} fill="none" stroke={col} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ─── Score Ring ──────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 80 }) {
  const r = 30, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const col = scoreColor(score);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth="6"
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: "stroke-dasharray 0.8s ease" }} />
      <text x={cx} y={cy + 6} textAnchor="middle"
        style={{ fontFamily: mono, fontSize: 17, fontWeight: 600, fill: col }}>{score}</text>
    </svg>
  );
}

// ─── Sub-score bar ────────────────────────────────────────────────────────────
function SubBar({ label, val }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontFamily: mono, fontSize: 10, color: C.sub, letterSpacing: 0.5 }}>{label.toUpperCase()}</span>
        <span style={{ fontFamily: mono, fontSize: 10, color: C.text }}>{val}</span>
      </div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
        <div style={{ height: "100%", width: `${val}%`, background: scoreColor(val), borderRadius: 2, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

// ─── Detail Panel (slide-in from right) ──────────────────────────────────────
function DetailPanel({ company, onClose }) {
  const col = scoreColor(company.score);
  return (
    <>
      {/* backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(4,6,13,0.7)", zIndex: 40, backdropFilter: "blur(4px)" }} />
      {/* panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, height: "100vh", width: "clamp(340px, 38vw, 480px)",
        background: C.panel, borderLeft: `1px solid ${C.lineHi}`, zIndex: 50,
        overflowY: "auto", animation: "slideIn 0.28s cubic-bezier(0.22,1,0.36,1)"
      }}>
        <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        {/* header */}
        <div style={{ padding: "20px 24px 18px", borderBottom: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{company.sector}</div>
            <div style={{ fontFamily: disp, fontSize: 20, fontWeight: 700 }}>{company.name}</div>
            <div style={{ fontFamily: mono, fontSize: 13, color: C.sub, marginTop: 2 }}>{company.ticker}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 20, cursor: "pointer", lineHeight: 1, padding: "4px 0 0 8px" }}>×</button>
        </div>

        <div style={{ padding: "22px 24px" }}>
          {/* score ring + tier */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
            <ScoreRing score={company.score} size={90} />
            <div>
              <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, letterSpacing: 1, marginBottom: 6 }}>ATTRACTIVENESS SCORE</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${tierColor(company.tier)}40`, borderRadius: 6, padding: "4px 10px" }}>
                <span style={{ width: 6, height: 6, borderRadius: 6, background: tierColor(company.tier) }} />
                <span style={{ fontFamily: disp, fontSize: 13, fontWeight: 600, color: tierColor(company.tier) }}>{company.tier} Tier</span>
              </div>
              <div style={{ fontFamily: mono, fontSize: 12, color: C.sub, marginTop: 8 }}>#{company.rank} in universe</div>
            </div>
          </div>

          {/* sub-scores */}
          <div style={{ background: C.panelHi, borderRadius: 10, border: `1px solid ${C.line}`, padding: "16px 18px", marginBottom: 20 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>Score Breakdown</div>
            {Object.entries(company.scores).map(([k, v]) => <SubBar key={k} label={k} val={v} />)}
          </div>

          {/* key metrics grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { l: "Revenue",     v: `$${company.revenue >= 1000 ? (company.revenue/1000).toFixed(1)+"B" : company.revenue+"M"}` },
              { l: "Gross Margin",v: `${company.gm}%` },
              { l: "Rule of 40",  v: company.r40.toFixed(1) },
              { l: "EV / Revenue",v: `${company.evRev}×` },
              { l: "YoY Growth",  v: `${company.growth}%` },
              { l: "Sector",      v: company.sector },
            ].map(({ l, v }) => (
              <div key={l} style={{ background: C.panelHi, borderRadius: 8, border: `1px solid ${C.line}`, padding: "12px 14px" }}>
                <div style={{ fontFamily: mono, fontSize: 9.5, color: C.muted, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 5 }}>{l}</div>
                <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* AI rationale */}
          <div style={{ background: "rgba(91,141,239,0.06)", border: `1px solid rgba(91,141,239,0.2)`, borderRadius: 10, padding: "16px 18px", marginBottom: 22 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.blue, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>AI Rationale</div>
            <p style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.65, margin: 0 }}>{company.rationale}</p>
          </div>

          {/* action buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ flex: 1, background: C.blue, color: "#fff", border: "none", borderRadius: 8, padding: "11px", fontFamily: disp, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
              + Add to Watchlist
            </button>
            <button style={{ flex: 1, background: "none", color: C.text, border: `1px solid ${C.lineHi}`, borderRadius: 8, padding: "11px", fontFamily: disp, fontSize: 13.5, fontWeight: 500, cursor: "pointer" }}>
              Export Row
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Animated row reveal (IntersectionObserver, 30ms stagger, cap at row 12) ──
function RowReveal({ rowIndex, style, className, onClick, children }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  const delay = Math.min(rowIndex, 11) * 30;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); ob.disconnect(); }
    }, { threshold: 0.05 });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} onClick={onClick} style={{
      ...style,
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : "translateY(8px)",
      transition: `opacity 0.35s ease ${delay}ms, transform 0.35s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ─── Main Screener ────────────────────────────────────────────────────────────
export default function Screener() {
  const [companies, setCompanies] = useState(SAMPLE_COMPANIES);
  const [loading,   setLoading]   = useState(true);
  const [query,    setQuery]    = useState("");
  const [tier,     setTier]     = useState("All");
  const [sector,   setSector]   = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch("/scores.json")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.companies?.length) setCompanies(data.companies);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sectors = ["All", ...Array.from(new Set(companies.map(c => c.sector))).sort()];
  const tiers   = ["All", "High", "Medium", "Low"];

  const filtered = useMemo(() => companies.filter(c => {
    const q = query.toLowerCase();
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.ticker.toLowerCase().includes(q);
    const matchT = tier   === "All" || c.tier   === tier;
    const matchS = sector === "All" || c.sector === sector;
    return matchQ && matchT && matchS;
  }), [query, tier, sector]);

  const highCount = companies.filter(c => c.tier === "High").length;
  const avgScore  = Math.round(companies.reduce((s, c) => s + c.score, 0) / Math.max(companies.length, 1));

  const selC = selected !== null ? companies.find(c => c.rank === selected) : null;

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: disp, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .df-row{cursor:pointer;transition:background 0.15s}
        .df-row:hover{background:rgba(91,141,239,0.07)!important}
        .df-sel{background:rgba(91,141,239,0.11)!important;border-left:2px solid ${C.blue}!important}
        .df-inp{outline:none;background:transparent}
        .df-inp::placeholder{color:${C.muted}}
        select{appearance:none;-webkit-appearance:none}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${C.line};border-radius:2px}
        ::selection{background:rgba(91,141,239,0.3)}
        a{color:inherit;text-decoration:none}
      `}</style>

      {/* grain overlay */}
      <div style={{ position:"fixed", inset:0, zIndex:1, pointerEvents:"none", opacity:0.03,
        backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

      <div style={{ position:"relative", zIndex:2 }}>

        {/* ── NAV ─────────────────────────────────────────────────────────── */}
        <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 32px", height:56, borderBottom:`1px solid ${C.line}`, background:"rgba(4,6,13,0.92)", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:30 }}>
          {/* left: logo + nav links */}
          <div style={{ display:"flex", alignItems:"center", gap:32 }}>
            <Link to="/" style={{ display:"flex", alignItems:"center", gap:8 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" stroke={C.blue} strokeWidth="1.5"/>
                <path d="M12 7 L16.5 9.5 V14.5 L12 17 L7.5 14.5 V9.5 Z" fill={C.blue} fillOpacity="0.3" stroke={C.blue} strokeWidth="1.1"/>
              </svg>
              <span style={{ fontWeight:700, fontSize:15, letterSpacing:-0.2 }}>DealFlow<span style={{ color:C.blue }}> AI</span></span>
            </Link>
            <div style={{ display:"flex", gap:6 }}>
              {[
                { label:"Dashboard",  to:"/" },
                { label:"Screener",   to:"/screener", active:true },
                { label:"Companies",  to:"/screener" },
                { label:"Watchlist",  to:"/screener" },
                { label:"Reports",    to:"/screener" },
              ].map(({ label, to, active }) => (
                <Link key={label} to={to} style={{ fontFamily:disp, fontSize:13, fontWeight: active ? 600 : 400,
                  color: active ? C.text : C.sub, padding:"6px 12px", borderRadius:7,
                  background: active ? "rgba(255,255,255,0.08)" : "none",
                  borderBottom: active ? `2px solid ${C.blue}` : "2px solid transparent" }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
          {/* right: export */}
          <button style={{ display:"flex", alignItems:"center", gap:7, fontFamily:disp, fontSize:13, fontWeight:600,
            background:"none", color:C.text, border:`1px solid ${C.lineHi}`, borderRadius:8,
            padding:"7px 14px", cursor:"pointer" }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v9M4 8l4 4 4-4M2 14h12" stroke={C.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export CSV
          </button>
        </nav>

        {/* ── PAGE HEADER ──────────────────────────────────────────────────── */}
        <div style={{ padding:"32px 32px 0", maxWidth:1300, margin:"0 auto" }}>
          <div style={{ marginBottom:24 }}>
            <h1 style={{ fontFamily:disp, fontSize:28, fontWeight:700, letterSpacing:"-0.02em" }}>Acquisition Screener</h1>
            <p style={{ fontSize:14, color:C.sub, marginTop:6, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontFamily:mono, color:C.green, fontSize:12 }}>● LIVE</span>
              Public SaaS universe ranked by acquisition attractiveness ·
              <span style={{ fontFamily:mono, color:C.amber }}> 3.05× walk-forward lift, 2020–2023</span>
            </p>
          </div>

          {/* ── METRIC CARDS ──────────────────────────────────────────────── */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
            {[
              { label:"Companies Tracked", value: String(companies.length), mono:true, sub: loading ? "loading…" : "across 4 verticals" },
              { label:"High Tier",         value:String(highCount), mono:true, sub:"acquisition-ready", col:C.green },
              { label:"Avg Score",         value:String(avgScore),  mono:true, sub:"universe mean" },
              { label:"Data Updated",      value:"Weekly",    mono:false, sub:"via SEC EDGAR" },
            ].map(({ label, value, mono: isMono, sub, col }) => (
              <div key={label} style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:12, padding:"18px 20px" }}>
                <div style={{ fontFamily:mono, fontSize:10, color:C.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>{label}</div>
                <div style={{ fontFamily:isMono ? mono : disp, fontSize:26, fontWeight:isMono ? 600 : 700, color:col || C.text, letterSpacing:isMono ? "-0.02em" : "-0.01em" }}>{value}</div>
                <div style={{ fontSize:12, color:C.muted, marginTop:5 }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* ── FILTER BAR ───────────────────────────────────────────────── */}
          <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:16, flexWrap:"wrap" }}>
            {/* search */}
            <div style={{ display:"flex", alignItems:"center", gap:8, flex:"1 1 220px", background:C.panel, border:`1px solid ${C.lineHi}`, borderRadius:9, padding:"9px 14px" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke={C.muted} strokeWidth="1.5"/>
                <path d="M11 11l3 3" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input className="df-inp" placeholder="Search company or ticker…"
                value={query} onChange={e => setQuery(e.target.value)}
                style={{ border:"none", outline:"none", background:"transparent", color:C.text, fontFamily:disp, fontSize:13.5, width:"100%" }} />
            </div>
            {/* tier */}
            <div style={{ position:"relative" }}>
              <select value={tier} onChange={e => setTier(e.target.value)} style={{
                background:C.panel, border:`1px solid ${C.lineHi}`, borderRadius:9, padding:"9px 34px 9px 14px",
                color:C.text, fontFamily:disp, fontSize:13.5, cursor:"pointer" }}>
                {tiers.map(t => <option key={t} value={t}>{t === "All" ? "All Tiers" : `${t} Tier`}</option>)}
              </select>
              <svg style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 5l3 3 3-3" stroke={C.muted} strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            {/* sector */}
            <div style={{ position:"relative" }}>
              <select value={sector} onChange={e => setSector(e.target.value)} style={{
                background:C.panel, border:`1px solid ${C.lineHi}`, borderRadius:9, padding:"9px 34px 9px 14px",
                color:C.text, fontFamily:disp, fontSize:13.5, cursor:"pointer" }}>
                {sectors.map(s => <option key={s} value={s}>{s === "All" ? "All Sectors" : s}</option>)}
              </select>
              <svg style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 5l3 3 3-3" stroke={C.muted} strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ fontFamily:mono, fontSize:12, color:C.muted, marginLeft:"auto" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* ── TABLE ────────────────────────────────────────────────────── */}
          <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, overflow:"hidden", marginBottom:40 }}>
            {/* header row */}
            <div style={{ display:"grid", gridTemplateColumns:"44px 1.8fr 60px 120px 70px 90px 72px 72px 56px", gap:0,
              padding:"10px 20px", borderBottom:`1px solid ${C.lineHi}`, background:C.panelHi }}>
              {["#","Company","Score","","Tier","Revenue","GM%","R40","7d"].map((h, i) => (
                <span key={i} style={{ fontFamily:mono, fontSize:9.5, letterSpacing:1, color:C.muted,
                  textTransform:"uppercase", textAlign: i >= 5 ? "right" : "left" }}>{h}</span>
              ))}
            </div>

            {filtered.length === 0 && (
              <div style={{ padding:"48px 24px", textAlign:"center", color:C.muted, fontSize:14 }}>
                No companies match your filters.
              </div>
            )}

            {filtered.map((c, i) => {
              const col = scoreColor(c.score);
              const tc  = tierColor(c.tier);
              const isSelected = selected === c.rank;
              return (
                <RowReveal key={c.ticker} rowIndex={i}
                  className={`df-row${isSelected ? " df-sel" : ""}`}
                  onClick={() => setSelected(isSelected ? null : c.rank)}
                  style={{ display:"grid", gridTemplateColumns:"44px 1.8fr 60px 120px 70px 90px 72px 72px 56px", gap:0,
                    alignItems:"center", padding:"13px 20px",
                    borderBottom: i < filtered.length - 1 ? `1px solid ${C.line}` : "none",
                    background: i % 2 ? "rgba(255,255,255,0.010)" : "transparent",
                    borderLeft: isSelected ? `2px solid ${C.blue}` : "2px solid transparent" }}>
                  <span style={{ fontFamily:mono, fontSize:11.5, color:C.muted }}>{String(c.rank).padStart(2,"0")}</span>
                  <div style={{ paddingRight:12 }}>
                    <span style={{ fontSize:14, fontWeight:600 }}>{c.name} </span>
                    <span style={{ fontFamily:mono, fontSize:11, color:C.sub }}>{c.ticker}</span>
                    <div style={{ fontFamily:mono, fontSize:10, color:C.muted, marginTop:2 }}>{c.sector}</div>
                  </div>
                  <span style={{ fontFamily:mono, fontSize:16, fontWeight:700, color:col }}>{c.score}</span>
                  <div style={{ paddingRight:16 }}>
                    <div style={{ height:3, background:"rgba(255,255,255,0.07)", borderRadius:2 }}>
                      <div style={{ height:"100%", width:`${c.score}%`, background:col, borderRadius:2 }}/>
                    </div>
                  </div>
                  <span style={{ fontFamily:disp, fontSize:10, fontWeight:600, color:tc,
                    border:`1px solid ${tc}38`, borderRadius:4, padding:"2px 7px", textTransform:"uppercase",
                    whiteSpace:"nowrap" }}>{c.tier}</span>
                  <span style={{ fontFamily:mono, fontSize:12.5, textAlign:"right" }}>
                    ${c.revenue >= 1000 ? (c.revenue/1000).toFixed(1)+"B" : c.revenue+"M"}
                  </span>
                  <span style={{ fontFamily:mono, fontSize:12.5, textAlign:"right", color: c.gm >= 75 ? C.green : C.sub }}>
                    {c.gm}%
                  </span>
                  <span style={{ fontFamily:mono, fontSize:12.5, textAlign:"right", color: c.r40 >= 40 ? C.green : c.r40 >= 20 ? C.amber : c.r40 < 0 ? C.red : C.sub }}>
                    {c.r40 > 0 ? "+" : ""}{c.r40.toFixed(1)}
                  </span>
                  <div style={{ display:"flex", justifyContent:"flex-end" }}>
                    <Sparkline data={c.spark} />
                  </div>
                </RowReveal>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── DETAIL PANEL ─────────────────────────────────────────────────── */}
      {selC && <DetailPanel company={selC} onClose={() => setSelected(null)} />}
    </div>
  );
}
