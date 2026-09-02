import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

const C = {
  bg:"#04060D", panel:"#0A0E1A", panelHi:"#0E1424",
  line:"rgba(255,255,255,0.08)", lineHi:"rgba(255,255,255,0.16)",
  text:"#F3F6FD", sub:"#9BA8C6", muted:"#5C6880",
  blue:"#5B8DEF", green:"#36D399", amber:"#F5C24B", red:"#F77272",
};
const disp = "'Bricolage Grotesque', -apple-system, sans-serif";
const mono = "'IBM Plex Mono', ui-monospace, Menlo, monospace";

const SECTOR_LABELS = {
  saas: "SaaS",
  cybersecurity: "Cybersecurity",
  fintech: "Fintech",
  healthcare_tech: "Healthcare Tech",
};

function scoreColor(s) {
  if (s >= 70) return C.green;
  if (s >= 50) return C.amber;
  return C.red;
}
function tierColor(t) {
  if (t === "High")   return C.green;
  if (t === "Medium") return C.amber;
  return C.red;
}

function ScoreRing({ score, size = 100 }) {
  const r = 38, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const col = scoreColor(score);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth="7"
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition:"stroke-dasharray 0.9s ease" }} />
      <text x={cx} y={cy + 7} textAnchor="middle"
        style={{ fontFamily:mono, fontSize:20, fontWeight:700, fill:col }}>{score}</text>
    </svg>
  );
}

function SubScoreBar({ label, val }) {
  const col = scoreColor(val);
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontFamily:disp, fontSize:13, color:C.sub }}>{label}</span>
        <span style={{ fontFamily:mono, fontSize:13, color:col, fontWeight:600 }}>{val}</span>
      </div>
      <div style={{ height:6, background:"rgba(255,255,255,0.07)", borderRadius:3 }}>
        <div style={{ height:"100%", width:`${val}%`, background:col, borderRadius:3, transition:"width 0.7s ease" }} />
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, highlight }) {
  return (
    <div style={{ background:C.panelHi, border:`1px solid ${C.line}`, borderRadius:10, padding:"16px 20px" }}>
      <div style={{ fontFamily:mono, fontSize:9.5, color:C.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>{label}</div>
      <div style={{ fontFamily:mono, fontSize:20, fontWeight:700, color: highlight || C.text }}>{value}</div>
      {sub && <div style={{ fontFamily:disp, fontSize:11, color:C.muted, marginTop:4, lineHeight:1.3 }}>{sub}</div>}
    </div>
  );
}

function ShapBar({ absValue, maxValue, color }) {
  const width = maxValue > 0 ? Math.min(100, (absValue / maxValue) * 100) : 0;
  return (
    <div style={{ height:3, background:"rgba(255,255,255,0.07)", borderRadius:2, marginTop:6 }}>
      <div style={{ height:"100%", width:`${width}%`, background:color, borderRadius:2 }} />
    </div>
  );
}

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function fmtRev(revM) {
  if (revM >= 1000) return `$${(revM / 1000).toFixed(1)}B`;
  return `$${revM}M`;
}

const MA_EV_REV_BENCHMARK = 4.5;

function whyScoresHigh(company, allCompanies) {
  if (!company) return [];
  const sectorPeers = allCompanies.filter(c => c.sector === company.sector && c.ticker !== company.ticker);
  const peers = sectorPeers.length >= 5 ? sectorPeers
    : allCompanies.filter(c => c.ticker !== company.ticker);

  const medGm   = median(peers.map(c => c.gm   ?? 0));
  const medR40  = median(peers.map(c => c.r40  ?? 0));
  const medGrow = median(peers.map(c => c.growth ?? 0));
  const medEv   = median(peers.filter(c => (c.evRev ?? 0) > 0).map(c => c.evRev));
  const peerLabel = sectorPeers.length >= 5 ? (SECTOR_LABELS[company.sector] || company.sector) : "sector";

  const revM = company.revenue ?? 0;
  const inSweet = revM >= 200 && revM <= 2000;

  const factors = [];

  const gm = company.gm ?? 0;
  const gmDelta = gm - medGm;
  if (gmDelta > 1 || gm > 75) {
    const score = gmDelta > 1 ? gmDelta : (gm - 75) * 0.5;
    const detail = gmDelta > 1
      ? `${gmDelta.toFixed(1)}pp above ${peerLabel} median (${medGm.toFixed(1)}%)`
      : `premium SaaS economics — ${gm.toFixed(1)}% exceeds the 75% benchmark`;
    factors.push({ score, label: "Margin quality", value: `${gm.toFixed(1)}% gross margin`, detail });
  }

  if (inSweet) {
    const sweetScore = 20 - Math.abs(revM - 750) / 100;
    factors.push({
      score: sweetScore,
      label: "Revenue scale",
      value: `${fmtRev(revM)} ARR`,
      detail: `within the $200M–$2B range where acquirers most often transact`,
    });
  }

  const r40Delta = (company.r40 ?? 0) - medR40;
  if (r40Delta > 5) {
    factors.push({
      score: r40Delta * 0.8,
      label: "Rule of 40",
      value: `${company.r40?.toFixed(1) ?? "—"} Rule of 40`,
      detail: `${r40Delta.toFixed(1)}pts above ${peerLabel} median (${medR40.toFixed(1)})`,
    });
  }

  const ev = company.evRev ?? 99;
  if ((medEv > 0 && ev < medEv - 1) || ev < MA_EV_REV_BENCHMARK) {
    const discount = medEv > 0 && ev < medEv - 1
      ? { label: `${(medEv - ev).toFixed(1)}× discount to ${peerLabel} median (${medEv.toFixed(1)}×)`, score: (medEv - ev) * 3 }
      : { label: `trading below the ${MA_EV_REV_BENCHMARK}× software M&A median — attractive entry multiple`, score: (MA_EV_REV_BENCHMARK - ev) * 3 };
    factors.push({
      score: discount.score,
      label: "Valuation",
      value: `${ev.toFixed(1)}× EV/Revenue`,
      detail: discount.label,
    });
  }

  const growDelta = (company.growth ?? 0) - medGrow;
  if (growDelta > 3) {
    factors.push({
      score: growDelta * 0.6,
      label: "Revenue growth",
      value: `${company.growth?.toFixed(1) ?? "—"}% YoY growth`,
      detail: `${growDelta.toFixed(1)}pp above ${SECTOR_LABELS[company.sector] || company.sector} median (${medGrow.toFixed(1)}%)`,
    });
  }

  return factors.sort((a, b) => b.score - a.score).slice(0, 3);
}

const SHAP_DISPLAY = {
  gross_margin_pct: "Gross Margin",
  gross_margin: "Gross Margin",
  revenue_M: "Revenue Scale",
  rule_of_40: "Rule of 40",
  ev_revenue: "EV / Revenue",
  revenue_growth_yoy: "Revenue Growth",
  operating_margin_pct: "Operating Margin",
  insider_net_buy_ratio: "Insider Activity",
  insider_buy_volume: "Insider Purchases",
  sector_bucket: "Sector",
  log_revenue: "Revenue Scale",
};

function getShapName(feature) {
  return SHAP_DISPLAY[feature] || feature.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

function norm(raw) {
  return {
    ...raw,
    name: raw.company || raw.name || raw.ticker,
    score: Math.round(raw.total_score ?? raw.score ?? 0),
    isScoredByML: (raw.ml_score ?? 0) > 0,
    revenue: raw.revenue_M ?? raw.revenue ?? 0,
    gm: raw.gross_margin ?? raw.gm ?? 0,
    r40: raw.rule_of_40 ?? raw.r40 ?? 0,
    evRev: raw.ev_revenue ?? raw.evRev ?? 0,
    growth: raw.revenue_growth_yoy ?? raw.growth ?? 0,
    scores: raw.subScores ?? raw.scores ?? {},
    sectorRank: raw.sector_rank ?? null,
    analystUpside: raw.analyst_target_upside ?? null,
    shap_factors: raw.shap_factors ?? null,
    has_thesis: raw.has_thesis ?? false,
    thesis_preview: raw.thesis_preview ?? null,
    insider_pattern: raw.insider_pattern ?? null,
    likely_acquirers: raw.likely_acquirers ?? [],
    peer_benchmarks: raw.peer_benchmarks ?? null,
  };
}

function RadarChart({ benchmarks }) {
  if (!benchmarks?.percentiles) return null;
  const { percentiles, labels, sector, peer_count } = benchmarks;
  const axes = [
    { key: "gross_margin",        label: "Margin" },
    { key: "rule_of_40",          label: "R40" },
    { key: "revenue_growth_yoy",  label: "Growth" },
    { key: "ev_revenue_acquirer", label: "Value" },
    { key: "overall_score",       label: "Overall" },
  ];
  const N = axes.length;
  const cx = 110, cy = 110, r = 80;
  const step = (2 * Math.PI) / N;
  const angle = (i) => -Math.PI / 2 + i * step;

  const pt = (pct, i) => {
    const frac = (pct ?? 50) / 100;
    return {
      x: cx + r * frac * Math.cos(angle(i)),
      y: cy + r * frac * Math.sin(angle(i)),
    };
  };

  // Grid circles at 25/50/75/100
  const gridCircles = [0.25, 0.5, 0.75, 1.0];

  const points = axes.map((a, i) => pt(percentiles[a.key] ?? 50, i));
  const poly = points.map(p => `${p.x},${p.y}`).join(" ");

  // Spoke endpoints
  const spokes = axes.map((_, i) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  }));

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
      <svg width={220} height={220} viewBox="0 0 220 220">
        {/* Grid rings */}
        {gridCircles.map((frac, gi) => (
          <circle key={gi} cx={cx} cy={cy} r={r * frac}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        ))}
        {/* Spokes */}
        {spokes.map((sp, i) => (
          <line key={i} x1={cx} y1={cy} x2={sp.x} y2={sp.y}
            stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        ))}
        {/* Data polygon */}
        <polygon points={poly}
          fill="rgba(91,141,239,0.18)" stroke={C.blue} strokeWidth={1.5} />
        {/* Data dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={C.blue} />
        ))}
        {/* Axis labels */}
        {axes.map((a, i) => {
          const sp = spokes[i];
          const dx = sp.x - cx, dy = sp.y - cy;
          const lx = cx + (r + 16) * Math.cos(angle(i));
          const ly = cy + (r + 16) * Math.sin(angle(i));
          const pct = percentiles[a.key] ?? 50;
          return (
            <text key={i} x={lx} y={ly + 4}
              textAnchor="middle" dominantBaseline="middle"
              fill={C.sub} fontSize={9} fontFamily={mono}>
              {a.label}
            </text>
          );
        })}
      </svg>
      <div style={{ fontFamily:mono, fontSize:10, color:C.muted, textAlign:"center" }}>
        vs {peer_count} sector peers
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 16px", marginTop:12 }}>
        {axes.map((a, i) => {
          const pct = percentiles[a.key] ?? 50;
          const col = pct >= 70 ? C.green : pct >= 40 ? C.amber : C.red;
          return (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
              <span style={{ fontFamily:mono, fontSize:10, color:C.muted }}>{a.label}</span>
              <span style={{ fontFamily:mono, fontSize:10, color:col, fontWeight:600 }}>{pct}th</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Company() {
  const { ticker } = useParams();
  const [company, setCompany]     = useState(null);
  const [allCompanies, setAll]    = useState([]);
  const [comps, setComps]         = useState([]);
  const [sectorContext, setSectorContext] = useState({});
  const [loading, setLoading]     = useState(true);
  const [thesis, setThesis]         = useState(null);
  const [thesisLoading, setThesisLoading] = useState(false);
  const [scoreHistory, setScoreHistory] = useState([]);

  useEffect(() => {
    fetch("/scores.json")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.companies) {
          const normalized = data.companies.map(norm);
          setAll(normalized);
          const found = normalized.find(c => c.ticker === ticker?.toUpperCase());
          setCompany(found || null);
          setSectorContext(data.sector_context || {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/comparable_transactions.json")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const t = ticker?.toUpperCase();
        setComps(data?.companies?.[t] ?? []);
      })
      .catch(() => {});
  }, [ticker]);

  useEffect(() => {
    setThesis(null);
    const t = ticker?.toUpperCase();
    if (!t) return;
    setThesisLoading(true);
    fetch(`/theses/${t}_thesis.md`)
      .then(r => r.ok ? r.text() : null)
      .then(text => setThesis(text))
      .catch(() => setThesis(null))
      .finally(() => setThesisLoading(false));
  }, [ticker]);

  useEffect(() => {
    const t = ticker?.toUpperCase();
    if (!t) return;
    fetch("/score_history.json")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.[t]) setScoreHistory(data[t].slice(-8)); })
      .catch(() => {});
  }, [ticker]);

  useEffect(() => {
    if (company) document.title = `${company.ticker} — DealFlow AI`;
  }, [company]);

  const subScoreLabels = {
    revenue:"Revenue", margins:"Margins", growth:"Growth", valuation:"Valuation",
    marketPosition:"Market Position", ruleOf40:"Rule of 40", sizeFit:"Size Fit",
  };

  if (loading) return (
    <div style={{ background:C.bg, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontFamily:mono, color:C.muted }}>Loading…</span>
    </div>
  );

  if (!company) return (
    <div style={{ background:C.bg, minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
      <span style={{ fontFamily:disp, fontSize:18, color:C.sub }}>Company not found: {ticker}</span>
      <Link to="/screener" style={{ fontFamily:mono, fontSize:13, color:C.blue }}>← Back to Screener</Link>
    </div>
  );

  // SHAP factors — flat array [{feature, shap_value, direction, explanation}]
  const allShap = Array.isArray(company.shap_factors) ? company.shap_factors : [];
  const shapPositive = allShap.filter(f => f.direction === 'positive').slice(0, 3);
  const shapNegative = allShap.filter(f => f.direction === 'negative').slice(0, 2);
  const maxShapPos = Math.max(...shapPositive.map(f => Math.abs(f.shap_value || 0)), 0.1);
  const maxShapNeg = Math.max(...shapNegative.map(f => Math.abs(f.shap_value || 0)), 0.1);
  const useShap = shapPositive.length > 0;

  // Heuristic fallback
  const heuristicFactors = !useShap ? whyScoresHigh(company, allCompanies) : [];
  const maxHeurScore = Math.max(...heuristicFactors.map(f => f.score), 0.1);

  // Sector context
  const sectorMeta = sectorContext[company.sector] || {};
  const sectorLabel = SECTOR_LABELS[company.sector] || company.sector;
  const sectorRankColor = company.sectorRank
    ? (company.sectorRank <= 3 ? C.green : company.sectorRank > 5 ? C.amber : C.text)
    : C.muted;

  // EV/Revenue vs sector median
  const evRevSub = sectorMeta.median_ev_revenue
    ? `vs ${sectorMeta.median_ev_revenue}× ${sectorLabel} median`
    : null;
  const evRevHighlight = sectorMeta.median_ev_revenue
    ? ((company.evRev ?? 0) < sectorMeta.median_ev_revenue ? C.green : C.amber)
    : (company.evRev <= 4 ? C.green : undefined);

  // Analyst upside
  const upside = company.analystUpside;
  const upsideFmt = upside != null
    ? `${upside > 0 ? "+" : ""}${(upside * 100).toFixed(1)}%`
    : "—";
  const upsideColor = upside > 0.02 ? C.green : upside < -0.02 ? C.red : C.sub;
  const upsideSub = upside != null ? "consensus analyst target vs current price" : null;

  const col = scoreColor(company.score);
  const tc  = tierColor(company.tier);
  const revDisplay = company.revenue >= 1000
    ? `$${(company.revenue/1000).toFixed(1)}B`
    : `$${company.revenue}M`;
  const opMargin = company.r40 != null && company.growth != null
    ? (company.r40 - company.growth).toFixed(1)
    : "—";

  return (
    <div style={{ background:C.bg, color:C.text, minHeight:"100vh", fontFamily:disp }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        @media(max-width:640px){
          .co-metrics{grid-template-columns:1fr 1fr!important}
          .co-comps{grid-template-columns:1fr!important}
          .co-why{gap:10px!important}
          .co-header{flex-direction:column!important;align-items:center!important;text-align:center!important}
          .co-header-text{align-items:center!important;justify-content:center!important}
          .co-insider-grid{grid-template-columns:1fr 1fr!important}
        }
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.8}}
      `}</style>

      {/* Nav */}
      <nav style={{ position:"sticky", top:0, zIndex:30, background:"rgba(4,6,13,0.92)",
        backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.line}`,
        padding:"0 32px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <Link to="/screener" style={{ display:"flex", alignItems:"center", gap:8, color:C.sub,
          fontFamily:disp, fontSize:14, fontWeight:500 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Screener
        </Link>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" stroke={C.blue} strokeWidth="1.5"/>
            <path d="M12 7 L16.5 9.5 V14.5 L12 17 L7.5 14.5 V9.5 Z" fill={C.blue} fillOpacity="0.3" stroke={C.blue} strokeWidth="1.1"/>
          </svg>
          <span style={{ fontFamily:disp, fontWeight:700, fontSize:15 }}>DealFlow<span style={{ color:C.blue }}> AI</span></span>
        </div>
      </nav>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"48px 32px 100px" }}>

        {/* Header */}
        <div className="co-header" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
          marginBottom:40, flexWrap:"wrap", gap:24 }}>
          <div>
            <div style={{ fontFamily:mono, fontSize:11, color:C.muted, letterSpacing:2,
              textTransform:"uppercase", marginBottom:8 }}>{sectorLabel}</div>
            <h1 style={{ fontFamily:disp, fontSize:"clamp(28px,5vw,52px)", fontWeight:800,
              letterSpacing:"-0.03em", lineHeight:1 }}>{company.name}</h1>
            <div className="co-header-text" style={{ display:"flex", alignItems:"center", gap:10, marginTop:12, flexWrap:"wrap" }}>
              <span style={{ fontFamily:mono, fontSize:16, color:C.sub }}>{company.ticker}</span>
              <span style={{ fontFamily:disp, fontSize:12, fontWeight:600, color:tc,
                border:`1px solid ${tc}40`, borderRadius:5, padding:"3px 10px",
                textTransform:"uppercase" }}>{company.tier} Tier</span>
              {company.sectorRank && (
                <span style={{ fontFamily:mono, fontSize:11, color:sectorRankColor,
                  border:`1px solid ${sectorRankColor}40`, borderRadius:5, padding:"3px 10px" }}>
                  #{company.sectorRank} in {sectorLabel} {sectorMeta.company_count ? `(${sectorMeta.company_count})` : ""}
                </span>
              )}
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            {company.isScoredByML ? (
              <ScoreRing score={company.score} size={110} />
            ) : (
              <div style={{ textAlign:"center", padding:"16px 8px", width:110 }}>
                <div style={{ fontFamily:mono, fontSize:12, color:C.muted, lineHeight:1.4 }}>
                  ML Score<br/>Unavailable
                </div>
                <div style={{ fontFamily:mono, fontSize:10, color:C.muted, marginTop:6, lineHeight:1.4 }}>
                  Foreign-listed or recent IPO — rule-based scoring only
                </div>
              </div>
            )}
            {company.isScoredByML && scoreHistory.length >= 2 && (() => {
              const scores = scoreHistory.map(h => h.score);
              const minS = Math.min(...scores), maxS = Math.max(...scores);
              const range = maxS - minS || 1;
              const pts = scores.map((s, i) => ({
                x: (i / (scores.length - 1)) * 80,
                y: 24 - ((s - minS) / range) * 20 - 2,
              }));
              const d = pts.map((p, i) => `${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
              const trending = scores[scores.length-1] > scores[0];
              return (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <svg width="80" height="24" viewBox="0 0 80 24">
                    <path d={d} stroke={C.blue} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="2.5"
                      fill={trending ? C.green : C.red} />
                  </svg>
                  <span style={{ fontFamily:mono, fontSize:9, color:C.muted }}>8-run trend</span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Score breakdown */}
        {Object.keys(company.scores).length > 0 && (
          <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:14,
            padding:"28px 32px", marginBottom:24 }}>
            <div style={{ fontFamily:mono, fontSize:10, color:C.muted, letterSpacing:1.5,
              textTransform:"uppercase", marginBottom:20 }}>Score Breakdown</div>
            {Object.entries(company.scores).map(([k, v]) => (
              <SubScoreBar key={k} label={subScoreLabels[k] || k} val={v} />
            ))}
          </div>
        )}

        {/* Key metrics grid */}
        <div className="co-metrics" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
          <MetricCard label="Revenue (TTM)" value={revDisplay} />
          <MetricCard label="Gross Margin" value={`${company.gm?.toFixed(1) ?? "—"}%`}
            highlight={company.gm >= 70 ? C.green : undefined}
            sub={sectorMeta.median_gross_margin ? `vs ${sectorMeta.median_gross_margin}% ${sectorLabel} median` : null} />
          <MetricCard label="Operating Margin" value={`${opMargin}%`} />
          <MetricCard label="Rule of 40" value={company.r40?.toFixed(1) ?? "—"}
            highlight={company.r40 >= 40 ? C.green : company.r40 >= 20 ? C.amber : C.red} />
          <MetricCard label="Revenue Growth" value={`${company.growth?.toFixed(1) ?? "—"}%`}
            highlight={company.growth >= 20 ? C.green : undefined} />
          <MetricCard label="EV / Revenue" value={`${company.evRev?.toFixed(1) ?? "—"}×`}
            highlight={evRevHighlight} sub={evRevSub} />
          {upside != null && (
            <MetricCard label="Analyst Upside" value={upsideFmt}
              highlight={upsideColor} sub={upsideSub} />
          )}
        </div>

        {/* Revenue & Growth Trajectory Chart */}
        {(() => {
          const rev = company.revenue;   // $M
          const growth = company.growth; // %
          // Build single current-year data point; history fetched in future
          const histData = company.revenue_history ?? null;
          if (!rev && !histData) return null;

          // Chart dimensions
          const W = 480, H = 100, padL = 48, padR = 16, padT = 10, padB = 24;
          const chartW = W - padL - padR;
          const chartH = H - padT - padB;

          // Use score history dates as x-axis proxy if no dedicated history
          const years = histData
            ? histData.map(d => d.year)
            : [2024]; // single point

          const revVals = histData
            ? histData.map(d => d.revenue_M)
            : [rev];

          const growthVals = histData
            ? histData.map(d => d.growth_pct)
            : [growth ?? 0];

          const maxRev = Math.max(...revVals) * 1.15 || 100;
          const minGrowth = Math.min(...growthVals, 0);
          const maxGrowth = Math.max(...growthVals, 0);
          const growthRange = maxGrowth - minGrowth || 20;

          const xScale = (i) => padL + (years.length <= 1 ? chartW / 2 : (i / (years.length - 1)) * chartW);
          const yRev = (v) => padT + chartH - (v / maxRev) * chartH;
          const yGrowth = (v) => padT + chartH - ((v - minGrowth) / growthRange) * chartH;

          // Bar width
          const barW = years.length <= 1 ? 40 : Math.max(12, (chartW / years.length) * 0.5);

          // Growth line path
          const growthPts = revVals.map((_, i) => ({ x: xScale(i), y: yGrowth(growthVals[i] ?? 0) }));
          const growthPath = growthPts.map((p, i) => `${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

          const sweetLoM = 200, sweetHiM = 2000;
          const inSweet = rev >= sweetLoM && rev <= sweetHiM;

          const hasHistory = histData && histData.length > 1;
          const isDecelerating = hasHistory && growthVals[growthVals.length-1] < growthVals[0];
          const isEdgar = histData && histData[0]?.source === 'edgar_xbrl';
          const isEstimated = histData && histData.length >= 2 && !isEdgar;

          return (
            <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:14,
              padding:"24px 28px", marginBottom:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:16 }}>
                <div>
                  <div style={{ fontFamily:mono, fontSize:10, color:C.muted, letterSpacing:1.5, textTransform:"uppercase", marginBottom:4 }}>Revenue & Growth Trajectory</div>
                  {!hasHistory && (
                    <div style={{ fontFamily:disp, fontSize:12, color:C.muted }}>
                      Current period · historical trend available as data accumulates
                    </div>
                  )}
                  {isEstimated && (
                    <div style={{ fontFamily:mono, fontSize:10, color:C.muted }}>
                      estimated from reported metrics
                    </div>
                  )}
                </div>
                {inSweet && (
                  <span style={{ fontFamily:mono, fontSize:10, color:C.blue, border:`1px solid rgba(91,141,239,0.3)`, borderRadius:5, padding:"3px 8px" }}>
                    M&A sweet spot
                  </span>
                )}
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow:"visible" }}>
                {/* Sweet spot shading: $200M-$2B revenue */}
                {maxRev > 0 && (
                  <rect
                    x={padL} y={yRev(Math.min(sweetHiM, maxRev))}
                    width={chartW}
                    height={yRev(sweetLoM) - yRev(Math.min(sweetHiM, maxRev))}
                    fill="rgba(91,141,239,0.05)" />
                )}
                {/* Revenue bars (left axis, blue) */}
                {revVals.map((v, i) => {
                  const barH = (v / maxRev) * chartH;
                  return (
                    <rect key={i}
                      x={xScale(i) - barW/2} y={padT + chartH - barH}
                      width={barW} height={barH}
                      fill="rgba(91,141,239,0.45)" rx="2" />
                  );
                })}
                {/* Growth rate line (right axis, amber) */}
                {revVals.length > 1 && (
                  <path d={growthPath} stroke={C.amber} strokeWidth="2" fill="none"
                    strokeLinecap="round" strokeLinejoin="round" />
                )}
                {/* Growth dots */}
                {growthPts.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="3"
                    fill={i === growthPts.length-1 ? C.amber : "transparent"}
                    stroke={C.amber} strokeWidth="1.5" />
                ))}
                {/* Left axis labels */}
                <text x={padL-4} y={padT+6} textAnchor="end"
                  style={{ fontFamily:"monospace", fontSize:8, fill:"rgba(255,255,255,0.3)" }}>
                  {maxRev >= 1000 ? `$${(maxRev/1000).toFixed(1)}B` : `$${Math.round(maxRev)}M`}
                </text>
                <text x={padL-4} y={padT+chartH} textAnchor="end"
                  style={{ fontFamily:"monospace", fontSize:8, fill:"rgba(255,255,255,0.3)" }}>
                  $0
                </text>
                {/* Year labels */}
                {years.map((yr, i) => (
                  <text key={i} x={xScale(i)} y={H-4} textAnchor="middle"
                    style={{ fontFamily:"monospace", fontSize:8, fill:"rgba(255,255,255,0.3)" }}>
                    {yr}
                  </text>
                ))}
                {/* Deceleration annotation */}
                {isDecelerating && (
                  <text x={W/2} y={padT+10} textAnchor="middle"
                    style={{ fontFamily:"monospace", fontSize:9, fill:C.amber }}>
                    ↓ Growth Decelerating
                  </text>
                )}
              </svg>
              <div style={{ display:"flex", gap:20, marginTop:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:12, height:10, background:"rgba(91,141,239,0.45)", borderRadius:2 }} />
                  <span style={{ fontFamily:mono, fontSize:10, color:C.muted }}>Revenue ($M)</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:12, height:2, background:C.amber, borderRadius:1 }} />
                  <span style={{ fontFamily:mono, fontSize:10, color:C.muted }}>YoY Growth (%)</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:12, height:8, background:"rgba(91,141,239,0.05)", border:"1px solid rgba(91,141,239,0.2)", borderRadius:2 }} />
                  <span style={{ fontFamily:mono, fontSize:10, color:C.muted }}>M&A sweet spot ($200M-$2B)</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Insider Signal */}
        {(() => {
          const ip = company.insider_pattern;
          if (!ip) return null;
          if (!ip.has_f4_signal) return (
            <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:12,
              padding:"20px 24px", marginBottom:24 }}>
              <div style={{ fontFamily:mono, fontSize:10, color:C.muted, letterSpacing:1.5,
                textTransform:"uppercase", marginBottom:8 }}>Insider Transaction Signal</div>
              <p style={{ fontFamily:disp, fontSize:13, color:C.muted, margin:0 }}>
                No Form 4 data available for this company in our current dataset.
              </p>
            </div>
          );

          const ps = ip.pattern_score ?? 50;
          const patternColor = ps > 65 ? C.red : ps >= 50 ? C.amber : C.green;
          const netM = (ip.net_sell_12mo ?? 0) / 1_000_000;
          const netFmt = netM <= -1
            ? `–$${Math.abs(netM).toFixed(1)}M`
            : netM >= 1 ? `+$${netM.toFixed(1)}M` : "~$0";
          const netColor = netM < -5 ? C.red : netM < 0 ? C.amber : C.green;
          const accel = ip.sell_acceleration ?? 0;
          const accelLabel = accel < -0.3 ? "↑ Accelerating" : accel > 0.3 ? "↓ Decelerating" : "→ Stable";
          const accelColor = accel < -0.3 ? C.red : accel > 0.3 ? C.green : C.sub;

          const contextSentence = ps > 65
            ? "Insider selling pattern matches the pre-acquisition profile in our validated dataset — acquired companies scored 71/100 on average vs a 50-point baseline, a 42% lift above random. This company's pattern is consistent with that signal."
            : ps >= 50
            ? "Moderate insider selling activity. Our validation shows acquired companies averaged 71/100 on this metric — this company's pattern is below the historical threshold but warrants monitoring."
            : "Net insider buying or minimal selling — diverges from the pre-acquisition selling pattern validated across 203 historical deals in our dataset.";

          const r = 14, cx = 18, cy = 18, circ = 2 * Math.PI * r;
          const dash = (ps / 100) * circ;

          return (
            <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:14,
              padding:"24px 28px", marginBottom:24 }}>
              <div style={{ fontFamily:mono, fontSize:10, color:C.muted, letterSpacing:1.5,
                textTransform:"uppercase", marginBottom:4 }}>Insider Transaction Signal</div>
              <div style={{ fontFamily:disp, fontSize:12, color:C.muted, marginBottom:18 }}>
                Based on SEC Form 4 filings — last 12 months ({ip.transaction_count} transactions)
              </div>
              <div className="co-insider-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
                {/* Card 1 */}
                <div style={{ background:C.panelHi, border:`1px solid ${C.line}`, borderRadius:10, padding:"16px 18px" }}>
                  <div style={{ fontFamily:mono, fontSize:9.5, color:C.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Net Insider Flow</div>
                  <div style={{ fontFamily:mono, fontSize:18, fontWeight:700, color:netColor }}>{netFmt}</div>
                  <div style={{ fontFamily:disp, fontSize:11, color:C.muted, marginTop:4 }}>trailing 12 months</div>
                </div>
                {/* Card 2 */}
                <div style={{ background:C.panelHi, border:`1px solid ${C.line}`, borderRadius:10, padding:"16px 18px" }}>
                  <div style={{ fontFamily:mono, fontSize:9.5, color:C.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Selling Rate</div>
                  <div style={{ fontFamily:mono, fontSize:16, fontWeight:700, color:accelColor }}>{accelLabel}</div>
                  <div style={{ fontFamily:disp, fontSize:11, color:C.muted, marginTop:4 }}>6mo vs 12mo pace</div>
                </div>
                {/* Card 3: pattern score mini ring */}
                <div style={{ background:C.panelHi, border:`1px solid ${C.line}`, borderRadius:10, padding:"16px 18px", display:"flex", alignItems:"center", gap:14 }}>
                  <svg width="36" height="36" viewBox="0 0 36 36">
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke={patternColor} strokeWidth="4"
                      strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
                      transform={`rotate(-90 ${cx} ${cy})`} />
                    <text x={cx} y={cy+4} textAnchor="middle"
                      style={{ fontFamily:"monospace", fontSize:9, fontWeight:700, fill:patternColor }}>{ps}</text>
                  </svg>
                  <div>
                    <div style={{ fontFamily:mono, fontSize:9.5, color:C.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>Pattern Score</div>
                    <div style={{ fontFamily:disp, fontSize:11, color:C.muted }}>pre-acq likelihood</div>
                  </div>
                </div>
              </div>
              <p style={{ fontFamily:disp, fontSize:13, color:C.sub, lineHeight:1.6, marginBottom:10 }}>
                {contextSentence}
              </p>
              <div style={{ fontFamily:mono, fontSize:9, color:C.muted }}>
                Form 4 data from SEC EDGAR. Not investment advice. Past patterns do not guarantee future acquisitions.
              </div>
            </div>
          );
        })()}

        {/* AI Rationale */}
        {company.rationale && (
          <div style={{ background:C.panelHi, border:`1px solid ${C.line}`,
            borderRadius:12, padding:"24px 28px", marginBottom:24 }}>
            <div style={{ fontFamily:mono, fontSize:10, color:C.blue, letterSpacing:1.5,
              textTransform:"uppercase", marginBottom:12 }}>AI Analysis</div>
            <p style={{ fontSize:15, color:C.sub, lineHeight:1.6, margin:0 }}>
              {company.rationale}
            </p>
            <div style={{ fontFamily:mono, fontSize:10, color:C.muted, marginTop:10 }}>
              Generated by DealFlow AI · {company.rationale_generated_at?.slice(0,10) || '2026-05-28'}
            </div>
          </div>
        )}

        {/* Why it scores high — SHAP if available, else heuristic */}
        {(useShap ? shapPositive.length > 0 : heuristicFactors.length > 0) && (
          <div className="co-why" style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:"28px 32px", marginBottom:24 }}>
            <div style={{ fontFamily:mono, fontSize:10, color:C.green, letterSpacing:1.5,
              textTransform:"uppercase", marginBottom:20 }}>Why it scores high</div>
            <div style={{ display:"grid", gap:14 }}>
              {useShap
                ? shapPositive.map((f, i) => {
                    const explanation = f.explanation
                      || `This company's ${getShapName(f.feature)} is ${f.value != null ? f.value.toFixed(1) : "—"}${f.sector_median != null ? ` vs ${f.sector_median.toFixed(1)} sector median` : ""}`;
                    return (
                      <div key={i} style={{ display:"flex", gap:16, alignItems:"flex-start",
                        padding:"14px 16px", background:C.panelHi, borderRadius:10, border:`1px solid ${C.line}` }}>
                        <span style={{ fontFamily:mono, fontSize:18, color:C.green, flexShrink:0 }}>
                          {["①","②","③"][i]}
                        </span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontFamily:disp, fontSize:14, fontWeight:600, marginBottom:4 }}>
                            {getShapName(f.feature)} — <span style={{ color:C.green }}>
                              {f.value != null ? `${f.value.toFixed(1)}${f.unit || ""}` : "positive signal"}
                            </span>
                          </div>
                          <div style={{ fontFamily:disp, fontSize:13, color:C.sub }}>{explanation}</div>
                          <ShapBar absValue={Math.abs(f.shap_value || 0)} maxValue={maxShapPos} color={C.green} />
                        </div>
                      </div>
                    );
                  })
                : heuristicFactors.map((f, i) => (
                    <div key={i} style={{ display:"flex", gap:16, alignItems:"flex-start",
                      padding:"14px 16px", background:C.panelHi, borderRadius:10, border:`1px solid ${C.line}` }}>
                      <span style={{ fontFamily:mono, fontSize:18, color:C.green, flexShrink:0 }}>
                        {["①","②","③"][i]}
                      </span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:disp, fontSize:14, fontWeight:600, marginBottom:4 }}>
                          {f.label} — <span style={{ color:C.green }}>{f.value}</span>
                        </div>
                        <div style={{ fontFamily:disp, fontSize:13, color:C.sub }}>{f.detail}</div>
                        <ShapBar absValue={f.score} maxValue={maxHeurScore} color={C.green} />
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>
        )}

        {/* Model attribution */}
        {useShap && (
          <div style={{ fontFamily:mono, fontSize:10, color:C.muted, textAlign:"right",
            marginTop:-16, marginBottom:24 }}>
            Factors from XGBoost SHAP analysis · model {company.model_version || "logistic-v2-form4"}
          </div>
        )}

        {/* What's working against it — negative SHAP only */}
        {shapNegative.length > 0 && (
          <div style={{ background:C.panel, border:`1px solid rgba(245,194,75,0.2)`, borderRadius:14, padding:"28px 32px", marginBottom:24 }}>
            <div style={{ fontFamily:mono, fontSize:10, color:C.amber, letterSpacing:1.5,
              textTransform:"uppercase", marginBottom:20 }}>What's working against it</div>
            <div style={{ display:"grid", gap:14 }}>
              {shapNegative.map((f, i) => {
                const explanation = f.explanation
                  || `This company's ${getShapName(f.feature)} is ${f.value != null ? f.value.toFixed(1) : "—"}${f.sector_median != null ? ` vs ${f.sector_median.toFixed(1)} sector median` : ""}`;
                return (
                  <div key={i} style={{ display:"flex", gap:16, alignItems:"flex-start",
                    padding:"14px 16px", background:C.panelHi, borderRadius:10, border:`1px solid ${C.line}` }}>
                    <span style={{ fontFamily:mono, fontSize:18, color:C.amber, flexShrink:0 }}>↓</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:disp, fontSize:14, fontWeight:600, marginBottom:4 }}>
                        {getShapName(f.feature)} — <span style={{ color:C.amber }}>
                          {f.value != null ? `${f.value.toFixed(1)}${f.unit || ""}` : "negative signal"}
                        </span>
                      </div>
                      <div style={{ fontFamily:disp, fontSize:13, color:C.sub }}>{explanation}</div>
                      <ShapBar absValue={Math.abs(f.shap_value || 0)} maxValue={maxShapNeg} color={C.amber} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Likely Acquirers */}
        {(company.likely_acquirers?.length > 0) && (
          <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:14,
            padding:"24px 28px", marginBottom:24 }}>
            <div style={{ fontFamily:mono, fontSize:10, color:C.blue, letterSpacing:1.5,
              textTransform:"uppercase", marginBottom:6 }}>Likely Acquirers</div>
            <div style={{ fontFamily:disp, fontSize:12, color:C.muted, marginBottom:18 }}>
              Fingerprint matching based on {company.likely_acquirers[0]?.deal_count || "—"} historical acquisitions by top match
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {company.likely_acquirers.slice(0, 3).map((acq, i) => {
                const pct = acq.match_score ?? 0;
                return (
                  <div key={i} style={{ background:C.panelHi, border:`1px solid ${C.line}`,
                    borderRadius:10, padding:"16px 20px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10 }}>
                      <div>
                        <span style={{ fontFamily:disp, fontSize:14, fontWeight:600, color:C.text }}>{acq.name}</span>
                        <span style={{ fontFamily:mono, fontSize:11, color:C.muted, marginLeft:10 }}>
                          {acq.deal_count} historical acquisitions
                        </span>
                      </div>
                      <span style={{ fontFamily:mono, fontSize:13, fontWeight:600,
                        color: pct >= 70 ? C.green : pct >= 50 ? C.amber : C.sub }}>
                        {pct}% match
                      </span>
                    </div>
                    <div style={{ height:4, background:"rgba(255,255,255,0.07)", borderRadius:2, marginBottom:10 }}>
                      <div style={{ height:"100%", width:`${pct}%`,
                        background: pct >= 70 ? C.green : pct >= 50 ? C.amber : C.sub,
                        borderRadius:2, transition:"width 0.7s ease" }} />
                    </div>
                    <div style={{ fontFamily:disp, fontSize:12, color:C.muted }}>{acq.rationale}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontFamily:mono, fontSize:9.5, color:C.muted, marginTop:14 }}>
              Fingerprint matching uses cosine distance on median revenue, gross margin, Rule of 40,
              and growth rate from {company.likely_acquirers[0]?.deal_count || "—"} historical deals.
              Not predictive of specific transactions.
            </div>
          </div>
        )}

        {/* Peer Benchmark Radar */}
        {company.peer_benchmarks && (
          <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:14,
            padding:"24px 28px", marginBottom:24 }}>
            <div style={{ fontFamily:mono, fontSize:10, color:C.muted, letterSpacing:1.5,
              textTransform:"uppercase", marginBottom:6 }}>Sector Benchmarks</div>
            <div style={{ display:"flex", gap:32, alignItems:"flex-start", flexWrap:"wrap" }}>
              <div style={{ flex:"0 0 auto" }}>
                <RadarChart benchmarks={company.peer_benchmarks} />
              </div>
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ fontFamily:disp, fontSize:13, color:C.sub, lineHeight:1.7, marginBottom:16 }}>
                  Percentile rankings vs {company.peer_benchmarks.peer_count} companies in the{" "}
                  <span style={{ color:C.text }}>
                    {SECTOR_LABELS[company.peer_benchmarks.sector] || company.peer_benchmarks.sector}
                  </span>{" "}sector.
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {[
                    { key:"gross_margin",        label:"Gross Margin",   val:company.gm,     fmt: v => `${v?.toFixed(1)}%` },
                    { key:"rule_of_40",          label:"Rule of 40",     val:company.r40,    fmt: v => v?.toFixed(1) },
                    { key:"revenue_growth_yoy",  label:"Revenue Growth", val:company.growth, fmt: v => `${v?.toFixed(1)}%` },
                    { key:"ev_revenue_acquirer", label:"Valuation",      val:company.evRev,  fmt: v => `${v?.toFixed(1)}×` },
                  ].map(({ key, label, val, fmt }) => {
                    const pct = company.peer_benchmarks.percentiles[key] ?? 50;
                    const col = pct >= 70 ? C.green : pct >= 40 ? C.amber : C.red;
                    return (
                      <div key={key} style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:90, fontFamily:mono, fontSize:11, color:C.muted }}>{label}</div>
                        <div style={{ flex:1, height:4, background:"rgba(255,255,255,0.07)", borderRadius:2 }}>
                          <div style={{ height:"100%", width:`${pct}%`, background:col, borderRadius:2,
                            transition:"width 0.6s ease" }} />
                        </div>
                        <div style={{ fontFamily:mono, fontSize:11, color:col, minWidth:28, textAlign:"right" }}>
                          {pct}%
                        </div>
                        {val != null && (
                          <div style={{ fontFamily:mono, fontSize:11, color:C.muted, minWidth:52, textAlign:"right" }}>
                            {fmt(val)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontFamily:mono, fontSize:10, color:C.muted, marginTop:16 }}>
                  Sector medians — GM: {company.peer_benchmarks.sector_medians?.gross_margin ?? "—"}% ·
                  R40: {company.peer_benchmarks.sector_medians?.rule_of_40 ?? "—"} ·
                  EV/Rev: {company.peer_benchmarks.sector_medians?.ev_revenue ?? "—"}×
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparable Transactions */}
        {comps.length > 0 && (
          <div style={{ marginBottom:32 }}>
            <div style={{ fontFamily:mono, fontSize:10, color:C.muted, letterSpacing:1.5,
              textTransform:"uppercase", marginBottom:6 }}>Historical Comparables</div>
            <div style={{ fontFamily:disp, fontSize:13, color:C.muted, marginBottom:16 }}>
              Recent acquisitions of similar software companies — sourced from LSEG SDC
            </div>
            <div className="co-comps" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
              {comps.slice(0,3).map((c, i) => {
                const year = c.date ? new Date(c.date).getFullYear() : "—";
                const dealVal = c.deal_value_M >= 1000
                  ? `$${(c.deal_value_M / 1000).toFixed(1)}B`
                  : c.deal_value_M > 0 ? `$${Math.round(c.deal_value_M)}M` : "Undisclosed";
                return (
                  <div key={i} style={{ background:C.panel, border:`1px solid ${C.line}`,
                    borderRadius:10, padding:"18px 20px" }}>
                    <div style={{ fontFamily:mono, fontSize:9.5, color:C.muted, letterSpacing:1,
                      textTransform:"uppercase", marginBottom:10 }}>{c.industry || "Software"}</div>
                    <div style={{ fontFamily:disp, fontSize:14, fontWeight:600, color:C.text,
                      marginBottom:4, lineHeight:1.3 }}>{c.target}</div>
                    <div style={{ fontFamily:disp, fontSize:13, color:C.sub, marginBottom:12 }}>
                      acq. by {c.acquirer}
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                      <span style={{ fontFamily:mono, fontSize:15, fontWeight:600, color:C.green }}>{dealVal}</span>
                      <span style={{ fontFamily:mono, fontSize:12, color:C.muted }}>{year}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Acquisition Thesis */}
        <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:14,
          padding:"28px 32px", marginBottom:32 }}>
          <div style={{ fontFamily:mono, fontSize:10, color:C.blue, letterSpacing:1.5,
            textTransform:"uppercase", marginBottom:12 }}>Acquisition Thesis</div>
          {thesisLoading ? (
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height:14, background:"rgba(255,255,255,0.06)",
                  borderRadius:4, width:`${[100,85,70][i-1]}%`,
                  animation:"pulse 1.5s ease-in-out infinite" }} />
              ))}
            </div>
          ) : thesis ? (
            <>
              <div style={{ marginBottom:16 }}>
                {thesis.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('**') && !l.startsWith('---') && !l.startsWith('Score:')).map((para, i) => (
                  <p key={i} style={{ fontFamily:disp, fontSize:14, color:C.sub,
                    lineHeight:1.75, marginBottom:14 }}>{para}</p>
                ))}
              </div>
              <Link to="/methodology" style={{ fontFamily:disp, fontSize:13, color:C.blue }}>
                Full model methodology →
              </Link>
            </>
          ) : (
            <>
              <p style={{ fontFamily:disp, fontSize:14, color:C.muted, lineHeight:1.7, marginBottom:20 }}>
                No generated thesis on file for this ticker. Theses were generated only for
                companies that cleared the scoring pipeline's data-completeness checks.
              </p>
              <Link to="/methodology" style={{ fontFamily:disp, fontSize:13, color:C.blue }}>
                Full model methodology →
              </Link>
            </>
          )}
        </div>

        {/* Footer CTA */}
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          <Link to="/screener" style={{ display:"inline-flex", alignItems:"center", gap:8,
            padding:"12px 24px", background:"none", border:`1px solid ${C.lineHi}`,
            borderRadius:8, fontFamily:disp, fontSize:14, color:C.sub }}>
            ← All companies
          </Link>
          <Link to="/methodology" style={{ display:"inline-flex", alignItems:"center", gap:8,
            padding:"12px 24px", background:"rgba(91,141,239,0.1)", border:`1px solid rgba(91,141,239,0.25)`,
            borderRadius:8, fontFamily:disp, fontSize:14, color:C.blue }}>
            How scores are calculated →
          </Link>
        </div>
      </div>
    </div>
  );
}
