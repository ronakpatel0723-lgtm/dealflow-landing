import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";

// Backend URL — Vite injects VITE_INTERROGATION_API_URL at build time.
// Defaults to localhost for `npm run dev` against `uvicorn interrogation.api.app:app`.
const API_URL =
  import.meta.env.VITE_INTERROGATION_API_URL || "http://localhost:8000";

// Match the rest of the site's visual language.
const C = {
  bg: "#04060D",
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

const RECOMMENDATION_COLOR = {
  proceed: C.green,
  conditional: C.amber,
  pass: C.red,
};

const VERDICT_COLOR = {
  defended: C.blue,
  revised: C.amber,
  compromise: C.green,
};

function fmtMoney(n) {
  if (n == null || Number.isNaN(n)) return "—";
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}
function fmtMultiple(n) {
  return n == null || Number.isNaN(n) ? "—" : `${n.toFixed(2)}x`;
}
function fmtPct(n, decimals = 1) {
  return n == null || Number.isNaN(n) ? "—" : `${(n * 100).toFixed(decimals)}%`;
}
function fmtAssumption(value) {
  // Heuristic: rates as %, multiples as x, raw counts otherwise.
  if (value == null || Number.isNaN(value)) return "—";
  if (Math.abs(value) < 1.5) return fmtPct(value, 2);
  if (Math.abs(value) >= 1e6) return fmtMoney(value);
  return `${value.toFixed(1)}x`;
}

function Header({ ticker, sector }) {
  return (
    <header
      style={{
        borderBottom: `1px solid ${C.line}`,
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <Link
          to="/"
          style={{
            fontFamily: mono,
            fontSize: 12,
            color: C.muted,
            textDecoration: "none",
            letterSpacing: 1,
          }}
        >
          ← DEALFLOW AI
        </Link>
        <h1
          style={{
            fontFamily: disp,
            fontSize: 28,
            fontWeight: 700,
            color: C.text,
            margin: "6px 0 0 0",
          }}
        >
          Interrogating {ticker}
        </h1>
        <div
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: C.muted,
            marginTop: 4,
            letterSpacing: 0.5,
          }}
        >
          sector · {sector || "loading"}
        </div>
      </div>
      <Link
        to={`/company/${ticker}`}
        style={{
          fontFamily: disp,
          fontSize: 13,
          color: C.sub,
          textDecoration: "none",
          border: `1px solid ${C.line}`,
          borderRadius: 6,
          padding: "8px 14px",
        }}
      >
        See screener view →
      </Link>
    </header>
  );
}

function MetricCard({ label, value, highlight }) {
  return (
    <div
      style={{
        background: C.panelHi,
        border: `1px solid ${C.line}`,
        borderRadius: 10,
        padding: "16px 18px",
        minWidth: 140,
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 9.5,
          color: C.muted,
          letterSpacing: 1,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: mono,
          fontSize: 22,
          fontWeight: 700,
          color: highlight || C.text,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Summary({ summary }) {
  if (!summary) return null;
  const recColor = RECOMMENDATION_COLOR[summary.recommendation] || C.muted;
  return (
    <section
      style={{
        background: C.panel,
        border: `1px solid ${C.line}`,
        borderRadius: 12,
        padding: 24,
        margin: "24px 32px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: C.muted,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Deterministic recommendation
        </div>
        <div
          style={{
            fontFamily: disp,
            fontSize: 18,
            fontWeight: 700,
            color: recColor,
            letterSpacing: 1,
            textTransform: "uppercase",
            border: `1px solid ${recColor}`,
            borderRadius: 4,
            padding: "2px 10px",
          }}
        >
          {summary.recommendation}
        </div>
        {summary.n_overrides_applied > 0 && (
          <div
            style={{
              fontFamily: mono,
              fontSize: 11,
              color: C.amber,
              marginLeft: "auto",
            }}
          >
            {summary.n_overrides_applied} override
            {summary.n_overrides_applied !== 1 ? "s" : ""} applied
          </div>
        )}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
        }}
      >
        <MetricCard label="MOIC" value={fmtMultiple(summary.moic)} highlight={C.green} />
        <MetricCard label="IRR" value={fmtPct(summary.irr)} highlight={C.green} />
        <MetricCard label="Entry EV" value={fmtMoney(summary.entry_ev)} />
        <MetricCard label="Sponsor equity" value={fmtMoney(summary.sponsor_equity)} />
        <MetricCard label="Total debt" value={fmtMoney(summary.total_debt)} />
        <MetricCard label="Exit EV" value={fmtMoney(summary.exit_ev)} />
        <MetricCard label="Exit equity" value={fmtMoney(summary.exit_equity)} />
      </div>
    </section>
  );
}

function AssumptionList({ assumptions, selected, onSelect }) {
  if (!assumptions || assumptions.length === 0) return null;
  // Filter to only assumption nodes (not computations); easier to interrogate.
  const inputAssumptions = assumptions.filter((n) => n.kind === "assumption");
  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.line}`,
        borderRadius: 12,
        padding: 20,
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 11,
          color: C.muted,
          letterSpacing: 1,
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        Assumptions ({inputAssumptions.length}) — click to challenge
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {inputAssumptions.map((n) => {
          const isSelected = selected === n.id;
          return (
            <button
              key={n.id}
              onClick={() => onSelect(n.id)}
              style={{
                background: isSelected ? C.panelHi : "transparent",
                border: `1px solid ${isSelected ? C.blue : "transparent"}`,
                borderRadius: 6,
                padding: "10px 12px",
                cursor: "pointer",
                color: C.text,
                fontFamily: mono,
                fontSize: 13,
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "all 120ms ease",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = C.panelHi;
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ color: C.sub }}>{n.id}</span>
              <span style={{ color: C.text, fontWeight: 600 }}>
                {fmtAssumption(n.value)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChallengePanel({ ticker, assumptionId, currentValue, onResult }) {
  const [proposedValue, setProposedValue] = useState("");
  const [rationale, setRationale] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Reset form when assumption changes.
  useEffect(() => {
    setProposedValue("");
    setRationale("");
    setError(null);
  }, [assumptionId]);

  const handleSubmit = async () => {
    if (proposedValue === "" || rationale.trim() === "") {
      setError("Both proposed value and rationale are required.");
      return;
    }
    const value = parseFloat(proposedValue);
    if (Number.isNaN(value)) {
      setError(`Proposed value "${proposedValue}" is not a number.`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const resp = await fetch(`${API_URL}/deals/${ticker}/challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assumption_id: assumptionId,
          proposed_value: value,
          proposed_rationale: rationale,
          user_id: "interrogate-ui",
        }),
      });
      if (!resp.ok) {
        const body = await resp.text();
        throw new Error(`${resp.status}: ${body}`);
      }
      const data = await resp.json();
      onResult(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (!assumptionId) {
    return (
      <div
        style={{
          background: C.panel,
          border: `1px solid ${C.line}`,
          borderRadius: 12,
          padding: 24,
          color: C.muted,
          fontFamily: disp,
          fontSize: 14,
        }}
      >
        Select an assumption on the left to challenge it.
      </div>
    );
  }

  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.line}`,
        borderRadius: 12,
        padding: 24,
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 11,
          color: C.muted,
          letterSpacing: 1,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Challenge
      </div>
      <div
        style={{
          fontFamily: disp,
          fontSize: 18,
          fontWeight: 600,
          color: C.text,
          marginBottom: 4,
        }}
      >
        {assumptionId}
      </div>
      <div
        style={{
          fontFamily: mono,
          fontSize: 13,
          color: C.sub,
          marginBottom: 18,
        }}
      >
        current value:{" "}
        <span style={{ color: C.text, fontWeight: 600 }}>
          {fmtAssumption(currentValue)}
        </span>{" "}
        ({currentValue?.toFixed(4) ?? "—"} raw)
      </div>

      <label
        style={{
          fontFamily: mono,
          fontSize: 11,
          color: C.muted,
          letterSpacing: 0.5,
          display: "block",
          marginBottom: 6,
        }}
      >
        PROPOSED VALUE
      </label>
      <input
        type="text"
        value={proposedValue}
        onChange={(e) => setProposedValue(e.target.value)}
        placeholder="e.g. 0.08 (for 8%) or 10.5 (for 10.5x)"
        style={{
          width: "100%",
          background: C.panelHi,
          border: `1px solid ${C.line}`,
          borderRadius: 6,
          padding: "10px 12px",
          color: C.text,
          fontFamily: mono,
          fontSize: 14,
          marginBottom: 16,
        }}
      />

      <label
        style={{
          fontFamily: mono,
          fontSize: 11,
          color: C.muted,
          letterSpacing: 0.5,
          display: "block",
          marginBottom: 6,
        }}
      >
        RATIONALE
      </label>
      <textarea
        value={rationale}
        onChange={(e) => setRationale(e.target.value)}
        placeholder="e.g. SaaS multiples have compressed materially; 10x is closer to public-market median for slower-growth peers"
        rows={3}
        style={{
          width: "100%",
          background: C.panelHi,
          border: `1px solid ${C.line}`,
          borderRadius: 6,
          padding: "10px 12px",
          color: C.text,
          fontFamily: disp,
          fontSize: 14,
          marginBottom: 16,
          resize: "vertical",
        }}
      />

      {error && (
        <div
          style={{
            fontFamily: mono,
            fontSize: 12,
            color: C.red,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          background: submitting ? C.muted : C.blue,
          border: "none",
          borderRadius: 6,
          padding: "10px 18px",
          color: C.text,
          fontFamily: disp,
          fontSize: 14,
          fontWeight: 600,
          cursor: submitting ? "wait" : "pointer",
          letterSpacing: 0.3,
        }}
      >
        {submitting ? "Asking Claude…" : "Defend or revise"}
      </button>
    </div>
  );
}

function VerdictPanel({ result }) {
  if (!result) return null;
  const verdictColor = VERDICT_COLOR[result.verdict] || C.muted;
  const movedFrom = result.current_value;
  const movedTo = result.accepted_value;
  const moved = Math.abs(movedFrom - movedTo) > 1e-9;
  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${verdictColor}`,
        borderRadius: 12,
        padding: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontFamily: disp,
            fontSize: 16,
            fontWeight: 700,
            color: verdictColor,
            letterSpacing: 1,
            textTransform: "uppercase",
            border: `1px solid ${verdictColor}`,
            borderRadius: 4,
            padding: "2px 10px",
          }}
        >
          {result.verdict}
        </div>
        <div style={{ fontFamily: mono, fontSize: 12, color: C.sub }}>
          confidence {Math.round(result.confidence * 100)}%
        </div>
      </div>

      <div
        style={{
          fontFamily: disp,
          fontSize: 15,
          color: C.text,
          lineHeight: 1.5,
          marginBottom: 14,
        }}
      >
        {result.system_reasoning}
      </div>

      {result.evidence && result.evidence.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 10,
              color: C.muted,
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Evidence
          </div>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {result.evidence.map((e, i) => (
              <li
                key={i}
                style={{
                  fontFamily: disp,
                  fontSize: 13,
                  color: C.sub,
                  marginBottom: 4,
                  lineHeight: 1.4,
                }}
              >
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 24,
          fontFamily: mono,
          fontSize: 13,
          marginBottom: 16,
        }}
      >
        <div>
          <span style={{ color: C.muted }}>current → </span>
          <span style={{ color: C.text, fontWeight: 600 }}>
            {fmtAssumption(movedFrom)}
          </span>
        </div>
        <div>
          <span style={{ color: C.muted }}>proposed → </span>
          <span style={{ color: C.text, fontWeight: 600 }}>
            {fmtAssumption(result.proposed_value)}
          </span>
        </div>
        <div>
          <span style={{ color: C.muted }}>accepted → </span>
          <span
            style={{
              color: moved ? C.amber : C.green,
              fontWeight: 600,
            }}
          >
            {fmtAssumption(movedTo)}
          </span>
        </div>
      </div>

      {moved && result.impacted_nodes && result.impacted_nodes.length > 0 && (
        <div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 10,
              color: C.muted,
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Impact on headline metrics
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {result.impacted_nodes.map((n) => (
              <div
                key={n.id}
                style={{
                  fontFamily: mono,
                  fontSize: 12,
                  color: C.sub,
                }}
              >
                <span style={{ color: C.muted }}>{n.id}:</span>{" "}
                <span style={{ color: C.text }}>
                  {n.id === "irr"
                    ? `${fmtPct(n.before)} → ${fmtPct(n.after)}`
                    : `${fmtMultiple(n.before)} → ${fmtMultiple(n.after)}`}
                </span>{" "}
                <span style={{ color: n.abs_change > 0 ? C.green : C.red }}>
                  ({n.pct_change > 0 ? "+" : ""}
                  {(n.pct_change * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Interrogate() {
  const { ticker } = useParams();
  const [summary, setSummary] = useState(null);
  const [assumptions, setAssumptions] = useState(null);
  const [selected, setSelected] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [error, setError] = useState(null);

  const loadDeal = useCallback(async () => {
    try {
      setError(null);
      const [sumResp, assumpResp] = await Promise.all([
        fetch(`${API_URL}/deals/${ticker}/summary`),
        fetch(`${API_URL}/deals/${ticker}/assumptions`),
      ]);
      if (!sumResp.ok) throw new Error(`/summary returned ${sumResp.status}`);
      if (!assumpResp.ok)
        throw new Error(`/assumptions returned ${assumpResp.status}`);
      setSummary(await sumResp.json());
      const data = await assumpResp.json();
      setAssumptions(data.nodes);
    } catch (e) {
      setError(
        `Backend at ${API_URL} unreachable: ${e.message}. ` +
          `Run "uvicorn interrogation.api.app:app --reload --port 8000" in the dealflow-ai repo to start it.`,
      );
    }
  }, [ticker]);

  useEffect(() => {
    loadDeal();
  }, [loadDeal]);

  const handleVerdict = (data) => {
    setVerdict(data);
    // Reload summary + assumptions so headline metrics reflect any accepted change.
    loadDeal();
  };

  const selectedNode = assumptions?.find((n) => n.id === selected);

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        fontFamily: disp,
        color: C.text,
      }}
    >
      <Header ticker={ticker} sector={summary?.sector} />

      {error && (
        <div
          style={{
            margin: "24px 32px",
            background: C.panel,
            border: `1px solid ${C.red}`,
            borderRadius: 12,
            padding: 24,
            color: C.red,
            fontFamily: mono,
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {error}
        </div>
      )}

      <Summary summary={summary} />

      <section
        style={{
          margin: "0 32px 48px 32px",
          display: "grid",
          gridTemplateColumns: "minmax(280px, 360px) 1fr",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        <AssumptionList
          assumptions={assumptions}
          selected={selected}
          onSelect={setSelected}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ChallengePanel
            ticker={ticker}
            assumptionId={selected}
            currentValue={selectedNode?.value}
            onResult={handleVerdict}
          />
          <VerdictPanel result={verdict} />
        </div>
      </section>
    </div>
  );
}
