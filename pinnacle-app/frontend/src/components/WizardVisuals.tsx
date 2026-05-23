/*
 * WizardVisuals — hero visualizations for the dbt-wizard pages.
 * Ported from Healthcare-EPIC-Snowflake-Demo — Pinnacle Motors automotive flavour.
 *
 * Components:
 *   LineagePanel         — live-evolving lineage graph for WizardLivePage
 *   BuildCompleteSummary — 4-pane summary for build-complete panel
 */

import { useMemo } from 'react';
import type { WizardScenario } from './wizardTypes';

// ─────────────────────────────────────────────────────────────────────────
// Accent tokens — Pinnacle Motors palette
// ─────────────────────────────────────────────────────────────────────────

const C = {
  racing:  '#dc2626',
  signal:  '#2563eb',
  caution: '#d97706',
  bull:    '#15803d',
  iceberg: '#7C3AED',
  dbt:     '#FF694A',
  snow:    '#29B5E8',
  ink:     '#0f0f12',
  inkDim:  '#6b6b74',
};

// ─────────────────────────────────────────────────────────────────────────
// LineagePanel — live-evolving lineage graph for WizardLivePage
// ─────────────────────────────────────────────────────────────────────────

type LineageNodeKind = 'silver' | 'gold-new' | 'gold-existing';
type LineageNode = {
  id: string;
  label: string;
  kind: LineageNodeKind;
  x: number;
  y: number;
};

type LineageEdge = { from: string; to: string };

export function LineagePanel({
  currentStep,
  complete,
  scenario,
}: {
  currentStep: number;
  complete: boolean;
  scenario: WizardScenario | null;
}) {
  const nodes: LineageNode[] = useMemo(() => {
    const upstream = scenario?.upstream_models ?? [];
    const silvers: LineageNode[] = upstream.slice(0, 4).map((u, i) => ({
      id: u.model,
      label: u.model.replace(/^silver\./, '').replace(/^gold\./, ''),
      kind: 'silver',
      x: 18,
      y: 18 + i * 22,
    }));
    const gold: LineageNode = {
      id: scenario?.metric_code ?? 'gold.new',
      label: (scenario?.metric_code ?? 'gold.new').replace(/^gold\./, ''),
      kind: 'gold-new',
      x: 82,
      y: 48,
    };
    return [...silvers, gold];
  }, [scenario]);

  const edges: LineageEdge[] = useMemo(() => {
    const silvers = nodes.filter((n) => n.kind === 'silver');
    const gold    = nodes.find((n) => n.kind === 'gold-new');
    if (!gold) return [];
    return silvers.map((s) => ({ from: s.id, to: gold.id }));
  }, [nodes]);

  const nodeOpacity = (n: LineageNode): number => {
    if (n.kind === 'silver') return currentStep >= 1 ? 1 : 0.05;
    if (n.kind === 'gold-new') return currentStep >= 4 ? 1 : currentStep >= 3 ? 0.35 : 0.05;
    return 1;
  };
  const edgeOpacity = (): number => (currentStep >= 2 ? 1 : 0.0);
  const goldStateClass = complete
    ? 'lineage-gold-live'
    : currentStep >= 6
      ? 'lineage-gold-live'
      : currentStep >= 5
        ? 'lineage-gold-tested'
        : currentStep >= 4
          ? 'lineage-gold-built'
          : 'lineage-gold-pending';

  return (
    <div
      className="spec-card flex flex-col"
      style={{ minHeight: 220, background: '#ffffff', border: '1px solid var(--hairline)' }}
    >
      <header
        className="px-5 py-3 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--hairline)' }}
      >
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <div
            className="font-condensed"
            style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--graphite-500)' }}
          >
            Lineage · building live
          </div>
          <span
            className="layer-chip"
            style={{
              color: C.iceberg,
              background: `${C.iceberg}12`,
              border: `1px solid ${C.iceberg}55`,
              fontSize: 10,
              padding: '3px 8px',
              fontWeight: 700,
            }}
          >
            iceberg-resolved
          </span>
        </div>
        <span className="font-mono" style={{ color: 'var(--graphite-400)', fontSize: 12 }}>
          {nodes.filter((n) => n.kind === 'silver').length} silver → 1 new gold
        </span>
      </header>
      <div className="flex-1 relative" style={{ minHeight: 180, padding: '14px 14px 12px' }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full" role="img" aria-label="Live model lineage">
          {edges.map((e, i) => {
            const a = nodes.find((n) => n.id === e.from);
            const b = nodes.find((n) => n.id === e.to);
            if (!a || !b) return null;
            return (
              <g key={i}>
                <path
                  d={`M ${a.x + 7} ${a.y} C ${(a.x + b.x) / 2} ${a.y}, ${(a.x + b.x) / 2} ${b.y}, ${b.x - 7} ${b.y}`}
                  fill="none"
                  stroke={C.racing}
                  strokeWidth="0.45"
                  strokeDasharray="1 1.2"
                  opacity={edgeOpacity()}
                  style={{ transition: 'opacity 600ms ease' }}
                />
              </g>
            );
          })}
          {nodes.map((n) => {
            const fill = n.kind === 'silver' ? '#cfd6e0' : C.racing;
            const stroke = n.kind === 'silver' ? '#94a3b8' : (currentStep >= 6 || complete) ? C.bull : C.racing;
            return (
              <g key={n.id} opacity={nodeOpacity(n)} style={{ transition: 'opacity 700ms ease' }}>
                <rect
                  x={n.x - 7} y={n.y - 3.5}
                  width="14" height="7"
                  rx="0" ry="0"
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="0.4"
                  className={n.kind === 'gold-new' ? goldStateClass : ''}
                />
                <text
                  x={n.x} y={n.y + 1.2}
                  textAnchor="middle"
                  fill={n.kind === 'silver' ? C.ink : '#fff'}
                  style={{ fontSize: 2.6, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700 }}
                >
                  {truncate(n.label, 22)}
                </text>
              </g>
            );
          })}
          <text x="2" y="12" fill={C.inkDim} style={{ fontSize: 2.6, letterSpacing: '0.2em', fontFamily: '"JetBrains Mono", monospace' }}>SILVER</text>
          <text x="98" y="12" textAnchor="end" fill={C.inkDim} style={{ fontSize: 2.6, letterSpacing: '0.2em', fontFamily: '"JetBrains Mono", monospace' }}>GOLD</text>
        </svg>
        <div className="absolute left-3 bottom-2 right-3 flex items-center justify-between font-mono" style={{ fontSize: 11, color: 'var(--graphite-500)' }}>
          <span>{stepCaption(currentStep, complete)}</span>
          <span style={{ color: complete ? C.bull : C.racing }}>
            {complete ? '● live in iceberg' : currentStep >= 4 ? '◐ materializing' : currentStep >= 2 ? '◐ joins validated' : '○ discovering'}
          </span>
        </div>
      </div>
      <style>{`
        .lineage-gold-pending { filter: grayscale(0.5); }
        .lineage-gold-built  { animation: lineageBuilt 1.2s ease-out 1; }
        .lineage-gold-tested { animation: lineageTested 1.2s ease-out 1; }
        .lineage-gold-live   { animation: lineageLive 1.4s ease-in-out infinite alternate; }
        @keyframes lineageBuilt {
          0%   { transform-origin: center; transform: scale(0.6); filter: brightness(1.6); }
          100% { transform: scale(1);   filter: brightness(1); }
        }
        @keyframes lineageTested {
          0%, 100% { filter: brightness(1); }
          50%      { filter: brightness(1.4); }
        }
        @keyframes lineageLive {
          0%   { filter: drop-shadow(0 0 1px ${C.bull}88); }
          100% { filter: drop-shadow(0 0 2.5px ${C.bull}); }
        }
      `}</style>
    </div>
  );
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

function stepCaption(step: number, complete: boolean): string {
  if (complete) return 'New gold table is live · downstream consumers see it on next read';
  if (step >= 6) return 'Materialized · Iceberg parquet written to gold prefix';
  if (step >= 5) return 'Schema YAML written · column tests + uniqueness asserted';
  if (step >= 4) return 'Worker authoring · model file emerging in repo';
  if (step >= 3) return 'Worker validating proposed grain against silver tables';
  if (step >= 2) return 'Summary confirming schema · join keys · null rates';
  if (step >= 1) return 'Explorer found candidate silver tables';
  return 'Awaiting Explorer to map upstream candidates';
}

// ─────────────────────────────────────────────────────────────────────────
// BuildCompleteSummary
// ─────────────────────────────────────────────────────────────────────────

type SummaryStat = { label: string; value: string; sub?: string };

export function BuildCompleteSummary({
  seconds,
  modelCode,
  rows = 312,
  columnTests = 7,
  combinationTests = 1,
}: {
  seconds: number;
  modelCode: string;
  rows?: number;
  columnTests?: number;
  combinationTests?: number;
}) {
  const panels: { title: string; stats: SummaryStat[]; accent: string }[] = [
    {
      title: 'Time saved',
      accent: C.racing,
      stats: [
        { label: 'dbt-wizard build', value: `${seconds}s` },
        { label: 'Manual equivalent', value: '3–5 days' },
        { label: 'Speedup', value: `≈ ${Math.round((3 * 24 * 3600) / seconds)}×` },
      ],
    },
    {
      title: 'Model file',
      accent: C.caution,
      stats: [
        { label: 'Path', value: modelCode.replace('gold.', 'models/gold/'), sub: '.sql' },
        { label: 'Layer', value: 'gold' },
        { label: 'Materialization', value: 'table · Iceberg' },
      ],
    },
    {
      title: 'Tests written',
      accent: C.bull,
      stats: [
        { label: 'Column tests', value: `${columnTests}` },
        { label: 'Combination uniqueness', value: `${combinationTests}` },
        { label: 'Schema contract', value: 'enforced' },
      ],
    },
    {
      title: 'Lineage delta',
      accent: C.iceberg,
      stats: [
        { label: 'Upstream refs', value: '4 silver' },
        { label: 'Downstream readers', value: 'auto-discover' },
        { label: 'Iceberg snapshot', value: `+${rows.toLocaleString()} rows` },
      ],
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
      {panels.map((p) => (
        <div key={p.title} className="spec-card p-4" style={{ borderTop: `3px solid ${p.accent}` }}>
          <div className="font-condensed" style={{ fontSize: 10, color: p.accent, letterSpacing: '0.12em' }}>
            {p.title}
          </div>
          <div className="mt-3 space-y-2">
            {p.stats.map((s) => (
              <div key={s.label}>
                <div className="font-mono" style={{ fontSize: 9.5, color: 'var(--graphite-400)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  {s.label}
                </div>
                <div className="font-display" style={{ fontSize: 15, color: 'var(--graphite-900)', lineHeight: 1.2 }}>
                  {s.value}
                  {s.sub ? <span className="font-mono" style={{ fontSize: 11, color: 'var(--graphite-500)' }}>{s.sub}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Need React in scope for JSX
import React from 'react';
