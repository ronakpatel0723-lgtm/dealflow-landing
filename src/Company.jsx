import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import WaitlistModal from "./WaitlistModal.jsx";

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
  };
}

export default function Company() {
  const { ticker } = useParams();
  const [company, setCompany]     = useState(null);
  const [allCompanies, setAll]    = useState([]);
  const [comps, setComps]         = useState([]);
  const [sectorContext, setSectorContext] = useState({});
  const [loading, setLoading]     = useState(true);
  const [thesisModal, setThesisModal] = useState(false);
  const [thesis, setThesis]         = useState(null);
  const [thesisLoading, setThesisLoading] = useState(false);

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
        }
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
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
          marginBottom:40, flexWrap:"wrap", gap:24 }}>
          <div>
            <div style={{ fontFamily:mono, fontSize:11, color:C.muted, letterSpacing:2,
              textTransform:"uppercase", marginBottom:8 }}>{sectorLabel}</div>
            <h1 style={{ fontFamily:disp, fontSize:"clamp(28px,5vw,52px)", fontWeight:800,
              letterSpacing:"-0.03em", lineHeight:1 }}>{company.name}</h1>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:12, flexWrap:"wrap" }}>
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
          <ScoreRing score={company.score} size={110} />
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

        {/* AI Rationale */}
        <div style={{ background:"rgba(91,141,239,0.06)", border:`1px solid rgba(91,141,239,0.2)`,
          borderRadius:12, padding:"24px 28px", marginBottom:24 }}>
          <div style={{ fontFamily:mono, fontSize:10, color:C.blue, letterSpacing:1.5,
            textTransform:"uppercase", marginBottom:12 }}>AI Rationale</div>
          <p style={{ fontSize:15, color:C.sub, lineHeight:1.7 }}>{company.rationale}</p>
        </div>

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
                {thesis.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('**') && !l.startsWith('---')).map((para, i) => (
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
                Deep-dive acquisition thesis available to Team plan subscribers — sector positioning,
                likely acquirers, deal structure analysis, and full probability driver breakdown.
              </p>
              <button onClick={() => setThesisModal(true)} style={{
                fontFamily:disp, fontSize:13, fontWeight:600, color:C.blue,
                background:"rgba(91,141,239,0.1)", border:`1px solid rgba(91,141,239,0.25)`,
                borderRadius:8, padding:"10px 20px", cursor:"pointer",
              }}>
                Get Access →
              </button>
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

      <WaitlistModal open={thesisModal} onClose={() => setThesisModal(false)} tier="Team" />
    </div>
  );
}
