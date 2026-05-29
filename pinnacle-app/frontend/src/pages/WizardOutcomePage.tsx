/*
 * WizardOutcomePage — Post-build outcome page for the dbt-wizard demo.
 *
 * Route: /wizard-outcome
 *
 * Shows: materialized model card, test pass summary, root-cause panel,
 * before/after lineage, without/with wizard columns, governance posture,
 * and CTAs to replay or return home.
 *
 * Ported from Healthcare-EPIC-Snowflake-Demo/ClarityOutcomePage.tsx — Pinnacle Motors flavour.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface LineageNode {
  id: string;
  name: string;
  layer: string;
  built?: boolean;
  new?: boolean;
}

interface LineageEdge {
  from: string;
  to: string;
}

interface Metric {
  label: string;
  value: string;
}

interface Column {
  label: string;
  summary: string;
  metrics: Metric[];
  narrative: string[];
}

interface GovernanceItem {
  label: string;
  value: string;
}

interface RootCause {
  headline: string;
  detail: string;
  affected_cohort: string;
  fallout_count: number;
  total_reviewed: number;
}

interface OutcomeData {
  materialized_model: string;
  row_count: number;
  tests_passed: number;
  tests_written: string;
  build_seconds: number;
  before: { nodes: LineageNode[]; edges: LineageEdge[] };
  after:  { nodes: LineageNode[]; edges: LineageEdge[] };
  root_cause: RootCause;
  without_wizard: Column;
  with_wizard:    Column;
  governance: GovernanceItem[];
  hero: { label: string; value: string; note: string };
}

const NODE_COLOR: Record<string, string> = {
  staging:      '#2563eb',
  intermediate: '#d97706',
  gold:         '#15803d',
  gap:          '#dc2626',
  consumer:     '#7c3aed',
};

export default function WizardOutcomePage() {
  const [o, setO] = useState<OutcomeData | null>(null);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL?.replace(/\/$/, '') + '/data/wizard_outcome.json')
      .then(r => {
        if (!r.ok) throw new Error(`Failed to fetch wizard_outcome.json: ${r.status}`);
        return r.json();
      })
      .then(setO)
      .catch(() => {});
  }, []);

  if (!o) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 font-mono text-sm" style={{ color: 'var(--graphite-500)' }}>
        Loading outcome...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" style={{ backgroundColor: '#f5f5f0' }}>

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span
            className="status-pill bull inline-flex items-center gap-1.5"
            style={{ fontSize: 12, padding: '4px 10px', fontWeight: 700 }}
          >
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: 'var(--bull)' }} />
            Build · Materialized
          </span>
          <span className="eyebrow">Lineage updated</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-wide" style={{ color: 'var(--graphite-900)' }}>
          Before and after, on the same lake.
        </h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-lg" style={{ color: 'var(--graphite-600)' }}>
          The gap on the left. The asset on the right. The delta is what dbt-wizard built in{' '}
          {o.build_seconds} seconds — the same window the VP waited for an answer.
        </p>
      </header>

      {/* Root-cause panel — lead with the answer */}
      <section
        className="p-6 mb-10"
        style={{ borderLeft: '5px solid var(--caution)', background: 'rgba(217,119,6,0.04)', border: '1px solid var(--hairline)', borderLeftColor: 'var(--caution)', borderLeftWidth: 5 }}
      >
        <div className="eyebrow mb-2">Root cause identified</div>
        <p className="font-display text-xl sm:text-2xl leading-tight tracking-wide mb-3" style={{ color: 'var(--graphite-900)' }}>
          {o.root_cause.headline}
        </p>
        <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--graphite-600)' }}>{o.root_cause.detail}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="eyebrow mb-1">Affected cohort</div>
            <div className="font-mono text-sm font-semibold" style={{ color: 'var(--graphite-900)' }}>
              {o.root_cause.affected_cohort}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-1">Flagged events</div>
            <div className="font-display text-3xl tracking-wide" style={{ color: 'var(--caution)' }}>
              {o.root_cause.fallout_count}
            </div>
            <div className="font-mono text-xs" style={{ color: 'var(--graphite-500)' }}>
              of {o.root_cause.total_reviewed} reviewed
            </div>
          </div>
          <div>
            <div className="eyebrow mb-1">Resolution</div>
            <div className="font-mono text-sm font-semibold" style={{ color: 'var(--graphite-900)' }}>
              OTA rollback · no recall · $9M exposure closed
            </div>
          </div>
        </div>
      </section>

      {/* Lineage comparison */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
        <LineagePanel
          title="Before · the gap"
          subtitle="No gold table tracks thermal-event flags by powertrain and climate zone."
          nodes={o.before.nodes}
          edges={o.before.edges}
          tone="crisis"
        />
        <LineagePanel
          title="After · the asset"
          subtitle="Materialized to Iceberg. Downstream consumers attached."
          nodes={o.after.nodes}
          edges={o.after.edges}
          tone="resolved"
        />
      </section>

      {/* Without vs. with */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
        <WizardColumn data={o.without_wizard} tone="crisis" />
        <WizardColumn data={o.with_wizard}    tone="resolved" />
      </section>

      {/* Model card + test summary */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div
          className="spec-card p-5 sm:col-span-2"
          style={{ borderLeft: '4px solid var(--bull)' }}
        >
          <div className="eyebrow mb-1">Materialized model</div>
          <div className="font-mono text-base font-semibold mb-1" style={{ color: 'var(--graphite-900)' }}>
            {o.materialized_model}
          </div>
          <div className="font-mono text-xs" style={{ color: 'var(--graphite-500)' }}>
            {o.row_count.toLocaleString()} rows · Iceberg v2 · Parquet · ZSTD
          </div>
        </div>
        <div
          className="spec-card p-5"
          style={{ borderLeft: '4px solid var(--bull)' }}
        >
          <div className="eyebrow mb-1">Tests</div>
          <div className="font-display text-3xl tracking-wide" style={{ color: 'var(--bull)' }}>
            {o.tests_passed} / {o.tests_passed}
          </div>
          <div className="font-mono text-xs mt-1" style={{ color: 'var(--graphite-500)' }}>{o.tests_written}</div>
        </div>
      </section>

      {/* Governance posture */}
      <section className="mb-10">
        <h2 className="font-display text-2xl tracking-wide mb-4 pb-2 border-b" style={{ color: 'var(--graphite-900)', borderColor: 'var(--hairline)' }}>
          Governance posture on the new asset
        </h2>
        <div className="spec-card p-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {o.governance.map(g => (
              <div key={g.label}>
                <div className="eyebrow mb-1">{g.label}</div>
                <div className="font-mono text-sm font-semibold" style={{ color: 'var(--graphite-900)' }}>{g.value}</div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Hero */}
      <section
        className="p-8 mb-10"
        style={{ borderLeft: '5px solid var(--bull)', background: 'rgba(21,128,61,0.04)', border: '1px solid var(--hairline)', borderLeftColor: 'var(--bull)', borderLeftWidth: 5 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          <div className="sm:col-span-1">
            <div className="eyebrow mb-2">dbt-wizard result</div>
            <div className="font-display text-6xl sm:text-7xl tracking-wide tabular leading-none" style={{ color: 'var(--bull)' }}>
              {o.hero.value}
            </div>
            <div className="font-mono text-xs mt-2" style={{ color: 'var(--graphite-500)' }}>question to materialized</div>
          </div>
          <div className="sm:col-span-2">
            <div className="font-display text-2xl sm:text-3xl leading-tight tracking-wide" style={{ color: 'var(--graphite-900)' }}>
              {o.hero.label}
            </div>
            <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--graphite-600)' }}>{o.hero.note}</p>
          </div>
        </div>
      </section>

      {/* CTAs */}
      <div className="spec-card p-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div>
          <div className="font-display text-2xl tracking-wide" style={{ color: 'var(--graphite-900)' }}>Run it again?</div>
          <div className="text-sm mt-1" style={{ color: 'var(--graphite-600)' }}>
            The pipeline is real. The sub-agents are deterministic.
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            to="/"
            className="inline-flex items-center gap-2 border font-display text-sm tracking-wider uppercase px-5 py-2.5 hover:bg-graphite-50 transition-colors"
            style={{ borderColor: 'var(--hairline)', color: 'var(--graphite-900)' }}
          >
            Back to console
          </Link>
          <Link
            to="/wizard-live"
            className="inline-flex items-center gap-2 text-white font-display text-sm tracking-wider uppercase px-5 py-2.5 hover:opacity-95 transition-opacity"
            style={{ background: 'var(--racing)' }}
          >
            Replay live build
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

function WizardColumn({ data, tone }: { data: Column; tone: 'crisis' | 'resolved' }) {
  const toneColor = tone === 'crisis' ? 'var(--caution)' : 'var(--bull)';
  const chipClass = tone === 'crisis' ? 'status-pill caution' : 'status-pill bull';
  return (
    <div
      className="spec-card p-6"
      style={{ borderLeft: `5px solid ${toneColor}` }}
    >
      <div className={`${chipClass} mb-3 inline-flex`} style={{ fontSize: 11 }}>
        {data.label}
      </div>
      <h2 className="font-display text-xl tracking-wide mb-2" style={{ color: 'var(--graphite-900)' }}>{data.summary}</h2>

      <dl className="space-y-2 my-5 p-4" style={{ background: 'var(--graphite-50)', border: '1px solid var(--hairline)' }}>
        {data.metrics.map(m => (
          <div key={m.label} className="flex justify-between gap-3 text-sm">
            <dt className="font-mono text-xs" style={{ color: 'var(--graphite-500)' }}>{m.label}</dt>
            <dd className="font-mono font-semibold" style={{ color: toneColor }}>{m.value}</dd>
          </div>
        ))}
      </dl>

      <div className="eyebrow mb-2">Narrative</div>
      <ol className="space-y-2 text-sm">
        {data.narrative.map((n, i) => (
          <li key={n} className="flex gap-2" style={{ color: 'var(--graphite-600)' }}>
            <span className="font-mono text-xs shrink-0 mt-0.5" style={{ color: toneColor }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{n}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function LineagePanel({
  title,
  subtitle,
  nodes,
  edges,
  tone,
}: {
  title: string;
  subtitle: string;
  nodes: LineageNode[];
  edges: LineageEdge[];
  tone: 'crisis' | 'resolved';
}) {
  const accent = tone === 'crisis' ? 'var(--caution)' : 'var(--bull)';
  const chipClass = tone === 'crisis' ? 'status-pill caution' : 'status-pill bull';

  const layers = ['staging', 'intermediate', 'gold', 'gap', 'consumer'];
  const grouped: Record<string, LineageNode[]> = {};
  for (const l of layers) grouped[l] = [];
  for (const n of nodes) {
    const key = grouped[n.layer] ? n.layer : 'staging';
    grouped[key].push(n);
  }
  const populated = layers.filter(l => grouped[l].length > 0);

  return (
    <div
      className="spec-card p-5"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      <div className={`${chipClass} mb-2 inline-flex`} style={{ fontSize: 11 }}>
        {title}
      </div>
      <div className="text-sm mb-4" style={{ color: 'var(--graphite-500)' }}>{subtitle}</div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" style={{ minHeight: 280 }}>
        {populated.map(layer => (
          <div key={layer}>
            <div className="eyebrow mb-2" style={{ color: NODE_COLOR[layer] ?? 'var(--bull)' }}>
              {layer}
            </div>
            <div className="space-y-1.5">
              {grouped[layer].map(n => {
                const isGap = layer === 'gap';
                const isNew = n.new;
                return (
                  <div
                    key={n.id}
                    className="p-2.5"
                    style={{
                      borderLeft: `3px solid ${NODE_COLOR[layer] ?? 'var(--bull)'}`,
                      border: '1px solid var(--hairline)',
                      borderLeftColor: NODE_COLOR[layer] ?? 'var(--bull)',
                      borderLeftWidth: 3,
                      background: isGap ? 'rgba(220,38,38,0.06)' : isNew ? 'rgba(21,128,61,0.06)' : '#f8f8fb',
                      borderStyle: isGap ? 'dashed' : 'solid',
                    }}
                  >
                    <div className="font-mono text-[11px]" style={{ color: NODE_COLOR[layer] ?? 'var(--bull)' }}>
                      {layer}
                    </div>
                    <div className="font-mono text-xs font-semibold mt-0.5" style={{ color: 'var(--graphite-900)' }}>
                      {n.name}
                    </div>
                    {isGap && (
                      <div className="font-mono text-[10px] mt-1" style={{ color: 'var(--bear)' }}>NOT BUILT</div>
                    )}
                    {isNew && (
                      <div className="font-mono text-[10px] mt-1" style={{ color: 'var(--bull)' }}>
                        BUILT BY dbt-wizard
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t flex items-center gap-2 font-mono text-[10px]" style={{ borderColor: 'var(--hairline)', color: 'var(--graphite-400)' }}>
        <span>{nodes.length} nodes</span>
        <span style={{ color: 'var(--hairline)' }}>·</span>
        <span>{edges.length} edges</span>
      </div>
    </div>
  );
}
