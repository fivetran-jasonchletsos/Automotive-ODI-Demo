import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api, formatNumber } from '../api/queries';

// Real Fivetran connector IDs for the Pinnacle Motors demo.
// Deep-link pattern: https://fivetran.com/dashboard/connections/{id}/status
const FIVETRAN_CONNECTOR_IDS: Record<string, string> = {
  'SAP S/4HANA — OEM ERP':       'arrest_unfolded',
  'Dealertrack DMS':              'hotter_hurling',
  'Manheim Used-Vehicle Feed':    'kiss_vain',
  'Connected-Car Telemetry Stream': 'goodbye_unsalted',
  'Salesforce Service Cloud':     'recorded_udder',
  'J.D. Power Benchmarks':        'validity_creating',
};

export default function PipelinePage() {
  const pipelineQ = useQuery({ queryKey: ['pipeline'], queryFn: api.getPipeline });
  const [simFailure, setSimFailure] = useState<string | null>(null);

  const data = pipelineQ.data;

  return (
    <div style={{ backgroundColor: '#f5f5f0' }} className="min-h-screen">
      <div className="hero-bg text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="font-condensed text-[11px] tracking-[0.28em] text-racing-500 mb-2">Pipeline · Connector Status</div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-wide">Six connectors. Four dbt layers. One snapshot.</h1>
          <p className="mt-3 max-w-3xl text-graphite-300 leading-relaxed">
            Fivetran-managed connectors land raw data into <span className="font-mono text-racing-500">bronze</span> on
            Apache Iceberg. dbt builds <span className="font-mono text-racing-500">silver</span> staging models and
            <span className="font-mono text-racing-500"> gold</span> semantic marts on the same files.
          </p>
        </div>
      </div>

      {data && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 space-y-8">
          {/* Layers */}
          <div className="spec-card">
            <div className="spec-card-header">
              <div className="spec-card-title">dbt layers · last 24h</div>
              <span className="text-[11px] font-mono text-graphite-500">{data.as_of}</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4">
              {data.layers.map((l) => (
                <div key={l.layer} className="p-5 border-r last:border-r-0 border-graphite-200 border-b lg:border-b-0">
                  <div className="layer-chip inline-flex mb-3">{l.layer}</div>
                  <div className="font-display text-3xl tracking-wide text-graphite-900 tabular">{formatNumber(l.rows_out)}</div>
                  <div className="font-condensed text-[10px] tracking-wider text-graphite-500 mt-1">rows out</div>
                  <div className="text-[11px] font-mono text-graphite-500 mt-3">{l.tables} tables · status {l.status}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Connectors */}
          <div className="spec-card">
            <div className="spec-card-header">
              <div className="spec-card-title">Connectors · Fivetran (lineage)</div>
              <span className="text-[11px] font-mono text-graphite-500">click a row to simulate failure</span>
            </div>
            <div className="overflow-x-auto">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>Connector</th>
                    <th>Connector ID</th>
                    <th>Source</th>
                    <th className="text-right">Rows / 24h</th>
                    <th className="text-right">Lag (min)</th>
                    <th>Last sync</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.connectors.map((c) => {
                    const failing = simFailure === c.name;
                    return (
                      <tr
                        key={c.name}
                        onClick={() => setSimFailure(failing ? null : c.name)}
                        className="cursor-pointer"
                      >
                        <td className="font-display tracking-wide">{c.name}</td>
                        <td className="font-mono text-xs text-graphite-500">{c.fivetran_id ?? '—'}</td>
                        <td className="font-mono text-xs">{c.source}</td>
                        <td className="text-right tabular">{formatNumber(c.rows_24h)}</td>
                        <td className="text-right tabular">{failing ? '—' : c.lag_minutes}</td>
                        <td className="text-[11px] font-mono">{failing ? 'failed retry · 3/5' : new Date(c.last_sync).toLocaleString()}</td>
                        <td>
                          {failing
                            ? <span className="status-pill bear">failed</span>
                            : c.status === 'ok' ? <span className="status-pill bull">healthy</span>
                            : c.status === 'lag' ? <span className="status-pill caution">lag</span>
                            : <span className="status-pill bear">failed</span>}
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          {(c.fivetran_id ?? FIVETRAN_CONNECTOR_IDS[c.name]) && (
                            <a
                              href={`https://fivetran.com/dashboard/connections/${c.fivetran_id ?? FIVETRAN_CONNECTOR_IDS[c.name]}/status`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-condensed tracking-wider border border-racing-600/40 text-racing-600 hover:bg-racing-600 hover:text-white transition-colors whitespace-nowrap"
                            >
                              Open in Fivetran
                              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                                <path d="M2 10L10 2M6 2h4v4" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {simFailure && (
            <div className="spec-card border-l-4 border-l-racing-600 p-5">
              <div className="eyebrow mb-1">Simulated failure</div>
              <div className="font-display text-xl tracking-wide">Downstream impact of "{simFailure}" outage</div>
              <ul className="mt-3 text-sm text-graphite-700 space-y-1 list-disc list-inside">
                <li>Bronze table partition stalls — Iceberg keeps last good snapshot (time-travel).</li>
                <li>dbt silver models still run on prior partition; freshness test fires.</li>
                <li>Downstream marts (dim_dealers / fct_warranty_claims) remain queryable; freshness pill flips to "stale".</li>
                <li>Snowflake dashboards and the reliability agent both see the same staleness signal — single source of truth.</li>
              </ul>
              <button onClick={() => setSimFailure(null)} className="mt-4 inline-flex px-3 py-1.5 bg-graphite-900 text-white font-display tracking-wider text-xs uppercase">
                Reset
              </button>
            </div>
          )}

          {/* dbt-wizard callout */}
          <div className="spec-card border-l-4 border-l-racing-600 p-5 mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="eyebrow mb-1">dbt-wizard · build-time AI</div>
                <div className="font-display text-xl tracking-wide" style={{ color: 'var(--graphite-900)' }}>
                  Missing gold model? Author one in 91 seconds.
                </div>
                <p className="mt-2 text-sm text-graphite-600 leading-relaxed max-w-2xl">
                  When the VP of Connected Vehicle Ops asks why Volt EV thermal flags spiked 3.1x in
                  cold-climate markets, there is no gold table to answer it. dbt-wizard's four sub-agents
                  surface the upstreams, author the SQL, write the tests, and materialize the model —
                  before the Reliability Review. $9M warranty exposure. 91 seconds.
                </p>
              </div>
              <Link
                to="/wizard-scenario"
                className="inline-flex items-center gap-2 px-5 py-3 text-white font-display tracking-wider text-sm uppercase whitespace-nowrap hover:opacity-95 transition-opacity shrink-0"
                style={{ background: 'var(--racing)' }}
              >
                See the scenario
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
