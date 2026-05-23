/*
 * WizardScenarioPage — Scenario framing page for the dbt-wizard demo.
 *
 * Route: /wizard-scenario
 *
 * Shows the VP Connected Vehicle Ops question, T-minus countdown to the
 * Reliability Review, 4-tile KPI grid, upstream-model panel, state-of-world
 * detail, 6-step build path, and a CTA to launch the Live Build.
 *
 * Ported from Healthcare-EPIC-Snowflake-Demo/ClarityScenarioPage.tsx — Pinnacle Motors flavour.
 */

import React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wizardDataUrl } from '../components/wizardTypes';

interface UpstreamModel {
  model: string;
  layer: string;
  grain: string;
  description: string;
}

interface ScenarioData {
  company: string;
  request_id: string;
  requested_by: string;
  timezone_label: string;
  question: string;
  metric_label: string;
  metric_code: string;
  sop_meeting_label: string;
  fleet_line: string;
  service_line: string;
  at_risk: string;
  target_schema: string;
  target_model: string;
  target_grain: string;
  prior_crisis_id: string;
  upstream_models: UpstreamModel[];
  manual_time_days: string;
  build_room_seconds: number;
}

function formatCountdown(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `T-${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function WizardScenarioPage() {
  const [s, setS] = useState<ScenarioData | null>(null);
  const [tMinus, setTMinus] = useState('T-08:00:00');

  useEffect(() => {
    fetch(wizardDataUrl('wizard_scenario.json')).then(r => r.json()).then(setS);
  }, []);

  useEffect(() => {
    let remaining = 8 * 3600; // 8-hour countdown to Reliability Review
    const id = setInterval(() => {
      remaining = Math.max(0, remaining - 1);
      setTMinus(formatCountdown(remaining));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (!s) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 font-mono text-sm" style={{ color: 'var(--graphite-500)' }}>
        Loading scenario...
      </div>
    );
  }

  const LAYER_COLOR: Record<string, string> = {
    staging:      'var(--racing)',
    intermediate: 'var(--signal)',
    gold:         'var(--bull)',
    gap:          'var(--bear)',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" style={{ backgroundColor: '#f5f5f0' }}>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span
            className="status-pill bear inline-flex items-center gap-1.5"
            style={{ fontSize: 12, padding: '4px 10px', fontWeight: 700 }}
          >
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: 'var(--bear)' }} />
            Gap · Active
          </span>
          <span className="eyebrow">{s.request_id}</span>
          <span className="eyebrow">Follows {s.prior_crisis_id}</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-wide" style={{ color: 'var(--graphite-900)' }}>
          {s.timezone_label}.{' '}
          <span style={{ color: 'var(--racing)' }}>{s.requested_by}.</span>
        </h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-lg" style={{ color: 'var(--graphite-600)' }}>
          No <span className="font-mono text-sm" style={{ color: 'var(--racing)' }}>gold.fct_thermal_flags_by_powertrain_climate_week</span> exists.
          The {s.fleet_line} cold-climate thermal-event spike is unresolved.
          Reliability Review meets in 8 hours. Manual build ETA: {s.manual_time_days}.
          dbt-wizard ETA: {s.build_room_seconds} seconds. At risk: {s.at_risk}.
        </p>

        {/* VP question highlight */}
        <div
          className="mt-5 p-5"
          style={{
            borderLeft: '4px solid var(--racing)',
            background: 'rgba(220,38,38,0.04)',
            border: '1px solid var(--hairline)',
            borderLeftColor: 'var(--racing)',
            borderLeftWidth: 4,
          }}
        >
          <div className="eyebrow mb-2">The VP's question</div>
          <p className="font-display text-2xl font-semibold leading-tight" style={{ color: 'var(--graphite-900)' }}>
            "{s.question}"
          </p>
        </div>
      </header>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <KpiTile
          label="Reliability Review"
          value={tMinus}
          unit={s.sop_meeting_label}
          tone="var(--caution)"
        />
        <KpiTile
          label="Metric requested"
          value="NEW"
          unit={s.metric_label}
          tone="var(--caution)"
        />
        <KpiTile
          label="Manual ETA"
          value={s.manual_time_days}
          unit="data engineering"
          tone="var(--graphite-600)"
        />
        <KpiTile
          label="dbt-wizard ETA"
          value={`${s.build_room_seconds}s`}
          unit="four sub-agents"
          tone="var(--bull)"
        />
      </div>

      {/* Upstream models + state of world */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
        <div className="lg:col-span-2 spec-card relative overflow-hidden">
          <div className="spec-card-header flex-wrap gap-2">
            <div>
              <div className="eyebrow">Upstream models available</div>
              <div className="font-display text-xl tracking-wide mt-1" style={{ color: 'var(--graphite-900)' }}>
                Four signals. Already in the lake.
              </div>
            </div>
            <span className="status-pill bull inline-flex items-center gap-1.5" style={{ fontSize: 11 }}>
              4 of 4
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
            {s.upstream_models.map(u => (
              <div
                key={u.model}
                className="border p-4 relative"
                style={{ borderLeft: `3px solid ${LAYER_COLOR[u.layer] ?? 'var(--bull)'}`, borderColor: 'var(--hairline)', borderLeftColor: LAYER_COLOR[u.layer] ?? 'var(--bull)', background: '#f8f8fb' }}
              >
                <div className="font-condensed text-xs" style={{ color: LAYER_COLOR[u.layer] ?? 'var(--bull)' }}>
                  {u.layer}
                </div>
                <div className="font-mono text-sm font-semibold mt-1" style={{ color: 'var(--graphite-900)' }}>{u.model}</div>
                <div className="font-mono text-[11px] mt-1" style={{ color: 'var(--graphite-500)' }}>grain · {u.grain}</div>
                <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--graphite-600)' }}>{u.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="spec-card">
          <div className="spec-card-header">
            <div className="spec-card-title">State of the world</div>
          </div>
          <dl className="space-y-3 text-sm p-4">
            <Row k="Question requested by" v={s.requested_by} />
            <Row k="Requested at" v={<span className="font-mono">{s.timezone_label}</span>} />
            <Row k="Fleet line" v={s.fleet_line} />
            <Row k="Service line" v={s.service_line} />
            <Row k="At risk" v={<span className="font-mono text-xs" style={{ color: 'var(--bear)' }}>{s.at_risk}</span>} />
            <Row k="Target schema" v={<span className="font-mono">{s.target_schema}</span>} />
            <Row k="Target model" v={<span className="font-mono text-xs">{s.target_model}</span>} />
            <Row k="Target grain" v={<span className="font-mono text-xs">{s.target_grain}</span>} />
            <Row k="Lookback window" v={<span className="font-mono">trailing 21 days</span>} />
            <Row k="Prior incident" v={<span className="font-mono">{s.prior_crisis_id}</span>} />
            <Row
              k="Review next"
              v={<span className="font-mono" style={{ color: 'var(--caution)' }}>{s.sop_meeting_label}</span>}
            />
          </dl>
        </div>
      </div>

      {/* 6-step build path */}
      <div
        className="spec-card p-5 mb-8"
        style={{ borderLeft: '4px solid var(--bull)' }}
      >
        <div className="eyebrow mb-2" style={{ color: 'var(--bull)' }}>The path through six steps</div>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="font-mono text-xs shrink-0 mt-0.5" style={{ color: step.color }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <div className="font-display text-sm tracking-wide" style={{ color: 'var(--graphite-900)' }}>{step.title}</div>
                <div className="text-xs font-mono" style={{ color: 'var(--graphite-500)' }}>
                  {step.who} · {step.tools}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* CTA */}
      <div className="spec-card p-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div>
          <div className="font-display text-2xl tracking-wide" style={{ color: 'var(--graphite-900)' }}>
            Ready to open the Live Build?
          </div>
          <div className="text-sm mt-1" style={{ color: 'var(--graphite-600)' }}>
            Four sub-agents will be paged. The new model gets written character-by-character on screen.
          </div>
        </div>
        <Link
          to="/wizard-live"
          state={{ question: s.question }}
          className="inline-flex items-center gap-2 text-white font-display tracking-wider px-6 py-4 whitespace-nowrap hover:opacity-95 transition-opacity text-sm uppercase"
          style={{ background: 'var(--racing)' }}
        >
          Open the Live Build
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

const STEPS = [
  { title: 'Discovery',             who: 'Explorer',     tools: 'status, search',        color: 'var(--racing)' },
  { title: 'Schema Understanding',  who: 'Summary',      tools: 'describe, lineage',     color: 'var(--signal)' },
  { title: 'Data Inspection',       who: 'Worker',       tools: 'warehouse, dbt_show',   color: 'var(--caution)' },
  { title: 'Model Creation',        who: 'Worker',       tools: 'file edits, model gen', color: 'var(--caution)' },
  { title: 'Test Authoring',        who: 'Verification', tools: 'describe, dbt_show',    color: 'var(--bull)' },
  { title: 'Materialization',       who: 'Worker + Ver', tools: 'dbt_run, lineage',      color: 'var(--bull)' },
];

function KpiTile({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit: string;
  tone: string;
}) {
  return (
    <div
      className="spec-card p-5 relative overflow-hidden"
      style={{ borderTop: `3px solid ${tone}` }}
    >
      <div className="eyebrow mb-2">{label}</div>
      <div
        className="font-display text-3xl tracking-wide tabular"
        style={{ color: tone }}
      >
        {value}
      </div>
      <div className="text-xs mt-2 font-mono" style={{ color: 'var(--graphite-500)' }}>{unit}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="font-mono text-xs" style={{ color: 'var(--graphite-500)' }}>{k}</dt>
      <dd className="text-right" style={{ color: 'var(--graphite-900)' }}>{v}</dd>
    </div>
  );
}
