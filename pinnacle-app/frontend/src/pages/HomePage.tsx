import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api, formatNumber, formatNumberShort, formatPercent } from '../api/queries';
import USMap from '../components/USMap';

export default function HomePage() {
  const summaryQ    = useQuery({ queryKey: ['summary'],    queryFn: api.getSummary });
  const productionQ = useQuery({ queryKey: ['production'], queryFn: api.getProduction });
  const dealersQ    = useQuery({ queryKey: ['dealers'],    queryFn: api.getDealers });
  const qualityQ    = useQuery({ queryKey: ['quality'],    queryFn: api.getQuality });
  const connectedQ  = useQuery({ queryKey: ['connected'],  queryFn: api.getConnectedCar });
  const inventoryQ  = useQuery({ queryKey: ['inventory'],  queryFn: api.getInventory });

  const s = summaryQ.data;
  const plants = productionQ.data?.plants ?? [];
  const dealers = dealersQ.data?.dealers ?? [];
  const regionRollups = dealersQ.data?.region_rollups ?? [];
  const topIssues = (qualityQ.data?.top_issues ?? []).slice(0, 3);
  const topDealers = [...dealers].sort((a, b) => b.csi - a.csi).slice(0, 8);

  return (
    <div style={{ backgroundColor: '#f5f5f0' }}>
      {/* Hero */}
      <section className="hero-bg text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <div className="font-condensed text-[11px] tracking-[0.28em] text-racing-500 mb-3">
                Chief Data Officer · ODI Operations Console
              </div>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-wide leading-[0.95]">
                Three data realities.<br />
                <span className="text-racing-500">One source of truth.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-graphite-300 text-base leading-relaxed">
                Pinnacle Motors runs four assembly plants on SAP S/4HANA, a 280-dealer franchise
                network on Dealertrack DMS, and 1.2M connected vehicles streaming telemetry every
                three seconds. ODI unifies all three on Apache Iceberg — read by Snowflake, dbt, and
                agents from the same gold tables.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/dealers" className="px-4 py-2.5 bg-racing-600 hover:bg-racing-700 text-white font-display tracking-wider text-sm uppercase">
                  Dealer Network →
                </Link>
                <Link to="/connected-car" className="px-4 py-2.5 bg-signal-600 hover:bg-signal-700 text-white font-display tracking-wider text-sm uppercase">
                  Connected Car →
                </Link>
                <Link to="/architecture" className="px-4 py-2.5 border border-white/20 hover:bg-white/10 text-white font-display tracking-wider text-sm uppercase">
                  ODI Architecture →
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="grid grid-cols-2 gap-3 font-mono">
                <SpecBlock label="Plants"      value={s ? s.active_plants : '—'} />
                <SpecBlock label="Nameplates"  value={s ? s.nameplates : '—'} />
                <SpecBlock label="Dealers"     value={s ? formatNumber(s.dealer_count) : '—'} />
                <SpecBlock label="Connected fleet" value={s ? formatNumberShort(s.connected_vehicles) : '—'} sub="active vehicles" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI tiles */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Kpi label="Units built YTD" value={s ? formatNumber(s.units_built_ytd) : '—'} sub="across 4 plants" accent="racing" />
          <Kpi label="Dealer count"    value={s ? formatNumber(s.dealer_count) : '—'} sub="franchise network" accent="graphite" />
          <Kpi label="Connected fleet" value={s ? formatNumberShort(s.connected_vehicles) : '—'} sub="vehicles on road" accent="signal" />
          <Kpi label="OEM CSI"         value={s ? s.oem_csi.toFixed(1) : '—'} sub="customer sat index" accent="bull" />
          <Kpi label="Warranty rate"   value={s ? formatNumber(s.warranty_rate_per_1000) : '—'} sub="claims / 1k vehicles" accent="caution" />
        </div>
      </section>

      {/* Map + top issues */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 spec-card">
            <div className="spec-card-header">
              <div>
                <div className="spec-card-title">Network Footprint</div>
                <div className="text-[11px] text-graphite-500 mt-0.5 font-mono">4 plants · 280 dealers · top 8 by CSI</div>
              </div>
              <span className="layer-chip racing">dim_dealers</span>
            </div>
            <div className="p-2">
              <USMap
                plants={plants.map((p) => ({ id: p.plant_code, lat: p.lat, lng: p.lng, label: p.plant_code }))}
                dealers={dealers.map((d) => ({ id: d.dealer_id, lat: d.lat, lng: d.lng }))}
                highlightTop={topDealers.map((d) => ({ id: d.dealer_id, lat: d.lat, lng: d.lng }))}
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className="spec-card">
            <div className="spec-card-header">
              <div className="spec-card-title">Top 3 Quality Watch</div>
              <span className="layer-chip">fct_warranty_claims</span>
            </div>
            <div className="divide-y divide-graphite-200">
              {topIssues.map((iss) => (
                <div key={iss.issue} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-graphite-500">{iss.model} · MY{iss.model_year}</div>
                      <div className="mt-1 font-display text-base tracking-wide text-graphite-900">{iss.issue}</div>
                    </div>
                    <RecallPill risk={iss.recall_risk} />
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <div className="text-graphite-500 uppercase tracking-wider">Affected</div>
                      <div className="text-graphite-900 font-semibold">{formatNumber(iss.affected_units)}</div>
                    </div>
                    <div>
                      <div className="text-graphite-500 uppercase tracking-wider">Claims</div>
                      <div className="text-graphite-900 font-semibold">{formatNumber(iss.claim_count)}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-graphite-600 leading-snug">{iss.fix}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottleneck story */}
      {inventoryQ.data && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
          <div className="spec-card border-l-4 border-l-racing-600">
            <div className="p-5">
              <div className="eyebrow mb-2">Active Constraint</div>
              <h2 className="font-display text-2xl tracking-wide text-graphite-900">{inventoryQ.data.bottleneck_story.headline}</h2>
              <p className="mt-2 text-sm text-graphite-700 leading-relaxed max-w-4xl">{inventoryQ.data.bottleneck_story.detail}</p>
              <ul className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {inventoryQ.data.bottleneck_story.actions.map((a, i) => (
                  <li key={i} className="text-xs leading-snug bg-graphite-50 border border-graphite-200 p-3">
                    <span className="font-mono text-racing-600 mr-2">A{i+1}</span>{a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Region rollups + Connected car snapshot */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="spec-card">
            <div className="spec-card-header">
              <div className="spec-card-title">Dealer Network by Region</div>
              <Link to="/dealers" className="text-xs text-racing-600 font-semibold uppercase tracking-wider">View all →</Link>
            </div>
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Region</th>
                  <th className="text-right">Dealers</th>
                  <th className="text-right">Avg CSI</th>
                  <th className="text-right">Days on lot</th>
                  <th className="text-right">Margin %</th>
                </tr>
              </thead>
              <tbody>
                {regionRollups.map((r) => (
                  <tr key={r.region}>
                    <td className="font-display tracking-wide">{r.region}</td>
                    <td className="text-right tabular">{r.dealer_count}</td>
                    <td className="text-right tabular">{r.avg_csi.toFixed(1)}</td>
                    <td className="text-right tabular">{r.avg_days_on_lot.toFixed(0)}</td>
                    <td className="text-right tabular">{r.avg_gross_margin_pct.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <div className="spec-card-header">
              <div className="spec-card-title">Connected Car · Live Health</div>
              <Link to="/connected-car" className="text-xs text-signal-600 font-semibold uppercase tracking-wider">View all →</Link>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <Stat label="Avg uptime" value={connectedQ.data ? `${connectedQ.data.fleet_health.avg_uptime_pct}%` : '—'} signal />
              <Stat label="Connectivity" value={connectedQ.data ? `${connectedQ.data.fleet_health.connectivity_rate_pct}%` : '—'} signal />
              <Stat label="Active DTC" value={connectedQ.data ? formatNumber(connectedQ.data.fleet_health.vehicles_with_active_dtc) : '—'} />
              <Stat label="Critical DTC" value={connectedQ.data ? formatNumber(connectedQ.data.fleet_health.vehicles_with_critical_dtc) : '—'} bear />
              <Stat label="OTA 30d success" value={connectedQ.data ? `${connectedQ.data.ota_program.last_30d_success_rate_pct}%` : '—'} signal />
              <Stat label="Telemetry/day" value={connectedQ.data ? formatNumberShort(connectedQ.data.telemetry_events_per_day) : '—'} />
            </div>
          </div>
        </div>
      </section>

      {/* Production lineup */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 mb-12">
        <div className="spec-card">
          <div className="spec-card-header">
            <div>
              <div className="spec-card-title">Plant Production · Today</div>
              <div className="text-[11px] text-graphite-500 mt-0.5 font-mono">fct_production_daily · {productionQ.data?.daily_pace.at(-1)?.units ?? '—'} units yesterday</div>
            </div>
            <span className="layer-chip">{plants.length} plants</span>
          </div>
          <table className="spec-table">
            <thead>
              <tr>
                <th>Plant</th>
                <th>Location</th>
                <th>Nameplates</th>
                <th className="text-right">Units / shift</th>
                <th className="text-right">Takt (s)</th>
                <th className="text-right">OEE</th>
                <th className="text-right">FTQ</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {plants.map((p) => (
                <tr key={p.plant_code}>
                  <td className="font-mono font-semibold">{p.plant_code}</td>
                  <td>{p.name}<div className="text-[11px] text-graphite-500">{p.city}, {p.state}</div></td>
                  <td className="text-[12px]">{p.nameplates.join(', ')}</td>
                  <td className="text-right tabular">{formatNumber(p.units_per_shift)}</td>
                  <td className="text-right tabular">{p.takt_time_seconds}</td>
                  <td className="text-right tabular">{p.oee_pct.toFixed(1)}%</td>
                  <td className="text-right tabular">{p.first_time_quality_pct.toFixed(1)}%</td>
                  <td><PlantStatusPill status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SpecBlock({ label, value, sub }: { label: string; value: any; sub?: string }) {
  return (
    <div className="border border-graphite-700 p-3 bg-graphite-800/60">
      <div className="text-[10px] uppercase tracking-[0.18em] text-graphite-400">{label}</div>
      <div className="font-display text-3xl tracking-wide text-white mt-1">{value}</div>
      {sub && <div className="text-[10px] uppercase tracking-wider text-graphite-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function Kpi({ label, value, sub, accent }: { label: string; value: any; sub?: string; accent: 'racing' | 'signal' | 'bull' | 'caution' | 'graphite' }) {
  return (
    <div className="kpi-tile">
      <div className={`kpi-tile-accent ${accent}`} />
      <div className="kpi-tile-label">{label}</div>
      <div className="kpi-tile-value">{value}</div>
      {sub && <div className="kpi-tile-sub">{sub}</div>}
    </div>
  );
}

function Stat({ label, value, signal, bear }: { label: string; value: any; signal?: boolean; bear?: boolean }) {
  const color = signal ? 'text-signal-600' : bear ? 'text-racing-600' : 'text-graphite-900';
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-graphite-500 font-mono">{label}</div>
      <div className={`font-display text-2xl tracking-wide mt-1 ${color}`}>{value}</div>
    </div>
  );
}

function PlantStatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    on_pace:          { cls: 'bull',    label: 'On pace' },
    ahead:            { cls: 'bull',    label: 'Ahead' },
    constrained:      { cls: 'caution', label: 'Constrained' },
    chip_constrained: { cls: 'bear',    label: 'Chip-constrained' },
  };
  const m = map[status] ?? { cls: 'neutral', label: status };
  return <span className={`status-pill ${m.cls}`}>{m.label}</span>;
}

function RecallPill({ risk }: { risk: string }) {
  const map: Record<string, string> = { none: 'neutral', low: 'neutral', moderate: 'caution', high: 'bear' };
  return <span className={`status-pill ${map[risk] ?? 'neutral'}`}>recall · {risk}</span>;
}
