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

function MetricCard({ label, value, highlight }) {
  return (
    <div style={{ background:C.panelHi, border:`1px solid ${C.line}`, borderRadius:10, padding:"16px 20px" }}>
      <div style={{ fontFamily:mono, fontSize:9.5, color:C.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>{label}</div>
      <div style={{ fontFamily:mono, fontSize:20, fontWeight:700, color: highlight || C.text }}>{value}</div>
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

const MA_EV_REV_BENCHMARK = 4.5; // historical software M&A median EV/Revenue

function whyScoresHigh(company, allCompanies) {
  if (!company) return [];
  const sectorPeers = allCompanies.filter(c => c.sector === company.sector && c.ticker !== company.ticker);
  // Fall back to all companies if fewer than 5 sector peers
  const peers = sectorPeers.length >= 5 ? sectorPeers
    : allCompanies.filter(c => c.ticker !== company.ticker);

  const medGm   = median(peers.map(c => c.gm   ?? 0));
  const medR40  = median(peers.map(c => c.r40  ?? 0));
  const medGrow = median(peers.map(c => c.growth ?? 0));
  const medEv   = median(peers.filter(c => (c.evRev ?? 0) > 0).map(c => c.evRev));
  const peerLabel = sectorPeers.length >= 5 ? company.sector : "sector";

  const revM = company.revenue ?? 0;
  const inSweet = revM >= 200 && revM <= 2000;
  const revLabel = fmtRev(revM);

  const factors = [];

  // Gross margin: above peer median OR premium absolute (>75%)
  const gm = company.gm ?? 0;
  const gmDelta = gm - medGm;
  if (gmDelta > 1 || gm > 75) {
    const score = gmDelta > 1 ? gmDelta : (gm - 75) * 0.5;
    const detail = gmDelta > 1
      ? `${gmDelta.toFixed(1)}pp above ${peerLabel} median (${medGm.toFixed(1)}%)`
      : `premium SaaS economics — ${gm.toFixed(1)}% exceeds the 75% benchmark for efficient software`;
    factors.push({ score, label: "Margin quality", value: `${gm.toFixed(1)}% gross margin`, detail });
  }

  // Revenue scale sweet spot
  if (inSweet) {
    const sweetScore = 20 - Math.abs(revM - 750) / 100;
    factors.push({
      score: sweetScore,
      label: "Revenue scale",
      value: `${revLabel} ARR`,
      detail: `within the $200M–$2B range where acquirers most often transact`,
    });
  }

  // Rule of 40 above peers
  const r40Delta = (company.r40 ?? 0) - medR40;
  if (r40Delta > 5) {
    factors.push({
      score: r40Delta * 0.8,
      label: "Rule of 40",
      value: `${company.r40?.toFixed(1) ?? "—"} Rule of 40`,
      detail: `${r40Delta.toFixed(1)}pts above ${peerLabel} median (${medR40.toFixed(1)})`,
    });
  }

  // Compressed valuation: below sector median OR below software M&A benchmark
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

  // Revenue growth above peers
  const growDelta = (company.growth ?? 0) - medGrow;
  if (growDelta > 3) {
    factors.push({
      score: growDelta * 0.6,
      label: "Revenue growth",
      value: `${company.growth?.toFixed(1) ?? "—"}% YoY growth`,
      detail: `${growDelta.toFixed(1)}pp above ${company.sector} median (${medGrow.toFixed(1)}%)`,
    });
  }

  return factors
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export default function Company() {
  const { ticker } = useParams();
  const [company, setCompany]     = useState(null);
  const [allCompanies, setAll]    = useState([]);
  const [comps, setComps]         = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch("/scores.json")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.companies) {
          setAll(data.companies);
          const found = data.companies.find(c => c.ticker === ticker?.toUpperCase());
          setCompany(found || null);
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
    if (company) document.title = `${company.ticker} — DealFlow AI`;
  }, [company]);

  const subScoreLabels = { revenue:"Revenue", margins:"Margins", growth:"Growth", valuation:"Valuation" };

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

  const col = scoreColor(company.score);
  const tc  = tierColor(company.tier);
  const whyFactors = whyScoresHigh(company, allCompanies);
  const revDisplay = company.revenue >= 1000
    ? `$${(company.revenue/1000).toFixed(1)}B`
    : `$${company.revenue}M`;

  return (
    <div style={{ background:C.bg, color:C.text, minHeight:"100vh", fontFamily:disp }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
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
              textTransform:"uppercase", marginBottom:8 }}>{company.sector}</div>
            <h1 style={{ fontFamily:disp, fontSize:"clamp(32px,5vw,52px)", fontWeight:800,
              letterSpacing:"-0.03em", lineHeight:1 }}>{company.name}</h1>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:12 }}>
              <span style={{ fontFamily:mono, fontSize:16, color:C.sub }}>{company.ticker}</span>
              <span style={{ fontFamily:disp, fontSize:12, fontWeight:600, color:tc,
                border:`1px solid ${tc}40`, borderRadius:5, padding:"3px 10px",
                textTransform:"uppercase" }}>{company.tier} Tier</span>
            </div>
          </div>
          <ScoreRing score={company.score} size={110} />
        </div>

        {/* Score breakdown */}
        <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:14,
          padding:"28px 32px", marginBottom:24 }}>
          <div style={{ fontFamily:mono, fontSize:10, color:C.muted, letterSpacing:1.5,
            textTransform:"uppercase", marginBottom:20 }}>Score Breakdown</div>
          {company.scores && Object.entries(company.scores).map(([k, v]) => (
            <SubScoreBar key={k} label={subScoreLabels[k] || k} val={v} />
          ))}
        </div>

        {/* Key metrics grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
          <MetricCard label="Revenue (TTM)"    value={revDisplay} />
          <MetricCard label="Gross Margin"     value={`${company.gm?.toFixed(1) ?? "—"}%`}
            highlight={company.gm >= 70 ? C.green : undefined} />
          <MetricCard label="Operating Margin" value={`${company.r40 != null ? (company.r40 - (company.growth ?? 0)).toFixed(1) : "—"}%`} />
          <MetricCard label="Rule of 40"       value={company.r40?.toFixed(1) ?? "—"}
            highlight={company.r40 >= 40 ? C.green : company.r40 >= 20 ? C.amber : C.red} />
          <MetricCard label="Revenue Growth"   value={`${company.growth?.toFixed(1) ?? "—"}%`}
            highlight={company.growth >= 20 ? C.green : undefined} />
          <MetricCard label="EV / Revenue"     value={`${company.evRev?.toFixed(1) ?? "—"}×`}
            highlight={company.evRev <= 4 ? C.green : undefined} />
        </div>

        {/* AI Rationale */}
        <div style={{ background:"rgba(91,141,239,0.06)", border:`1px solid rgba(91,141,239,0.2)`,
          borderRadius:12, padding:"24px 28px", marginBottom:24 }}>
          <div style={{ fontFamily:mono, fontSize:10, color:C.blue, letterSpacing:1.5,
            textTransform:"uppercase", marginBottom:12 }}>AI Rationale</div>
          <p style={{ fontSize:15, color:C.sub, lineHeight:1.7 }}>{company.rationale}</p>
        </div>

        {/* Why it scores high */}
        {whyFactors.length > 0 && (
          <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:"28px 32px", marginBottom:32 }}>
            <div style={{ fontFamily:mono, fontSize:10, color:C.green, letterSpacing:1.5,
              textTransform:"uppercase", marginBottom:20 }}>Why it scores high</div>
            <div style={{ display:"grid", gap:14 }}>
              {whyFactors.map((f, i) => (
                <div key={i} style={{ display:"flex", gap:16, alignItems:"flex-start",
                  padding:"14px 16px", background:C.panelHi, borderRadius:10,
                  border:`1px solid ${C.line}` }}>
                  <span style={{ fontFamily:mono, fontSize:18, color:C.green, flexShrink:0 }}>
                    {["①","②","③"][i]}
                  </span>
                  <div>
                    <div style={{ fontFamily:disp, fontSize:14, fontWeight:600, marginBottom:4 }}>
                      {f.label} — <span style={{ color:C.green }}>{f.value}</span>
                    </div>
                    <div style={{ fontFamily:disp, fontSize:13, color:C.sub }}>{f.detail}</div>
                  </div>
                </div>
              ))}
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
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
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

        {/* Footer CTA */}
        <div style={{ display:"flex", gap:12 }}>
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
