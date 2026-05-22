import { useQuery } from '@tanstack/react-query';
import { api, formatNumber, formatNumberShort, formatPercent } from '../api/queries';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from 'recharts';

export default function ConnectedCarPage() {
  const ccQ = useQuery({ queryKey: ['connected'], queryFn: api.getConnectedCar });
  const evQ = useQuery({ queryKey: ['ev'],        queryFn: api.getEVCharging });

  const cc = ccQ.data;
  const ev = evQ.data;

  return (
    <div style={{ backgroundColor: '#f5f5f0' }} className="min-h-screen">
      <div className="hero-bg-signal text-white relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="font-condensed text-[11px] tracking-[0.28em] text-signal-500 mb-2">Connected Car · Fleet Operations</div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-wide">The agent that watches <span className="text-signal-500">1.2M vehicles</span>.</h1>
          <p className="mt-3 max-w-3xl text-graphite-300 leading-relaxed">
            Every Pinnacle vehicle on the road emits 400+ telemetry signals every three seconds.
            ODI lands the raw stream into <span className="font-mono text-signal-500">bronze.telemetry_events_raw</span>,
            aggregates to <span className="font-mono text-signal-500">fct_telemetry_health_signals</span>, and serves
            the same gold layer to BI, dbt tests, and the predictive-maintenance agent.
          </p>
        </div>
      </div>

      {cc && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
          {/* Fleet health KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Tile label="Active vehicles"        value={formatNumber(cc.active_vehicles)}     accent="signal" />
            <Tile label="Telemetry / day"        value={formatNumberShort(cc.telemetry_events_per_day)} accent="signal" sub="events" />
            <Tile label="Avg fleet uptime"       value={`${cc.fleet_health.avg_uptime_pct}%`} accent="bull" />
            <Tile label="Critical DTCs"          value={formatNumber(cc.fleet_health.vehicles_with_critical_dtc)} accent="racing" sub="vehicles flagged" />
          </div>

          {/* OTA + DTC trend */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="spec-card">
              <div className="spec-card-header">
                <div className="spec-card-title">OTA Program · last 30d</div>
                <span className="layer-chip signal">live</span>
              </div>
              <div className="p-5 space-y-4">
                <Row label="Active campaigns" value={cc.ota_program.active_campaigns} />
                <Row label="Rolling release" value={`${cc.ota_program.rolling_release_pct}% of fleet`} />
                <Row label="Success rate"     value={`${cc.ota_program.last_30d_success_rate_pct}%`} good />
                <Row label="Attempts"         value={formatNumber(cc.ota_program.last_30d_attempts)} />
                <Row label="Failures"         value={formatNumber(cc.ota_program.failed_attempts)} bad />
                <Row label="Top failure"      value={cc.ota_program.top_failure_reason.replaceAll('_', ' ')} />
              </div>
            </div>

            <div className="lg:col-span-2 spec-card">
              <div className="spec-card-header">
                <div className="spec-card-title">Top 10 DTCs · 30-day trend</div>
                <span className="layer-chip">fct_telemetry_health_signals</span>
              </div>
              <div className="p-2 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cc.top_dtcs} margin={{ top: 8, right: 16, left: 0, bottom: 8 }} layout="vertical">
                    <CartesianGrid strokeDasharray="2 4" stroke="#e4e4e7" />
                    <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                    <YAxis type="category" dataKey="dtc" width={70} tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                    <Tooltip
                      cursor={{ fill: '#f4f4f5' }}
                      contentStyle={{ borderRadius: 0, border: '1px solid #d4d4d8', fontSize: 12 }}
                      formatter={(v: any, _n, p: any) => [`${formatNumber(v as number)} · ${p.payload.model}`, p.payload.name]}
                    />
                    <Bar dataKey="count" name="Vehicles" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* DTC details */}
          <div className="mt-6 spec-card">
            <div className="spec-card-header">
              <div className="spec-card-title">DTC Watchlist</div>
              <span className="text-xs font-mono text-graphite-500">Joined: VIN → production date → supplier lot</span>
            </div>
            <table className="spec-table">
              <thead>
                <tr>
                  <th>DTC</th>
                  <th>Description</th>
                  <th>Model</th>
                  <th className="text-right">MY</th>
                  <th className="text-right">Vehicles</th>
                  <th className="text-right">Trend 30d</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {cc.top_dtcs.map((d) => (
                  <tr key={d.dtc}>
                    <td className="font-mono font-semibold">{d.dtc}</td>
                    <td>{d.name}</td>
                    <td>{d.model}</td>
                    <td className="text-right tabular">{d.model_year}</td>
                    <td className="text-right tabular">{formatNumber(d.count)}</td>
                    <td className={`text-right tabular font-semibold ${d.trend_pct_30d > 0 ? 'text-racing-600' : 'text-bull-600 text-emerald-700'}`}>{formatPercent(d.trend_pct_30d)}</td>
                    <td><SeverityPill s={d.severity} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Predictive maintenance */}
          <div className="mt-6 spec-card">
            <div className="spec-card-header">
              <div className="spec-card-title">Predictive Maintenance · Agent Alerts</div>
              <span className="layer-chip signal">agent: pinnacle_pdm_v3</span>
            </div>
            <table className="spec-table">
              <thead>
                <tr>
                  <th>Alert</th>
                  <th>Model</th>
                  <th className="text-right">Vehicles flagged</th>
                  <th className="text-right">Window</th>
                  <th className="text-right">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {cc.predictive_maintenance_alerts.map((a) => (
                  <tr key={a.alert_type}>
                    <td className="font-display">{a.alert_type}</td>
                    <td>{a.model}</td>
                    <td className="text-right tabular font-semibold">{formatNumber(a.vehicles_flagged)}</td>
                    <td className="text-right tabular">{a.expected_failure_window_days}d</td>
                    <td className="text-right tabular">{(a.confidence * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* EV charging */}
          {ev && (
            <>
              <div className="mt-10 mb-4">
                <div className="eyebrow-signal eyebrow">EV Crossover · Volt Owner Telemetry</div>
                <h2 className="font-display text-3xl tracking-wide text-graphite-900">Volt EV — {formatNumber(ev.fleet_size_volt_ev)} owners</h2>
                <p className="text-sm text-graphite-700 mt-1 max-w-3xl">{ev.headline_insight}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="spec-card">
                  <div className="spec-card-header">
                    <div className="spec-card-title">Charging Mix</div>
                    <span className="layer-chip signal">fct_telemetry_health_signals</span>
                  </div>
                  <div className="p-5 space-y-3">
                    <ChargeBar label="Home L2"      pct={ev.charging_mix.home_l2_pct}     color="#15803d" />
                    <ChargeBar label="Public DCFC"  pct={ev.charging_mix.public_dcfc_pct} color="#dc2626" />
                    <ChargeBar label="Public L2"    pct={ev.charging_mix.public_l2_pct}   color="#b45309" />
                    <ChargeBar label="Workplace"    pct={ev.charging_mix.workplace_pct}   color="#2563eb" />
                    <div className="border-t border-graphite-200 pt-3 mt-3 text-xs text-graphite-600 leading-relaxed">
                      <span className="font-mono text-racing-600 mr-2">Range anxiety:</span>{ev.range_anxiety_signals.narrative}
                    </div>
                  </div>
                </div>

                <div className="spec-card">
                  <div className="spec-card-header">
                    <div className="spec-card-title">OTA Range Improvements</div>
                  </div>
                  <div className="p-2 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={ev.ota_range_improvements} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="2 4" stroke="#e4e4e7" />
                        <XAxis dataKey="release" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                        <YAxis tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                        <Tooltip contentStyle={{ borderRadius: 0, border: '1px solid #d4d4d8', fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="range_delta_mi" stroke="#2563eb" strokeWidth={2.5} name="Range delta (mi)" />
                        <Line type="monotone" dataKey="owners_pct_taken" stroke="#dc2626" strokeWidth={2} name="% owners taken" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="mt-6 spec-card mb-12">
                <div className="spec-card-header">
                  <div className="spec-card-title">NPS by Charging Cluster</div>
                </div>
                <table className="spec-table">
                  <thead>
                    <tr>
                      <th>Cluster</th>
                      <th className="text-right">Owners</th>
                      <th className="text-right">Share</th>
                      <th className="text-right">NPS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ev.nps_by_charging_cluster.map((c) => (
                      <tr key={c.cluster}>
                        <td className="font-display tracking-wide">{c.cluster}</td>
                        <td className="text-right tabular">{formatNumber(c.owners)}</td>
                        <td className="text-right tabular">{c.share_pct.toFixed(1)}%</td>
                        <td className={`text-right tabular font-semibold ${c.nps >= 60 ? 'text-emerald-700' : c.nps >= 30 ? 'text-amber-700' : 'text-racing-600'}`}>{c.nps}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Tile({ label, value, sub, accent }: { label: string; value: any; sub?: string; accent: 'racing' | 'signal' | 'bull' | 'caution' | 'graphite' }) {
  return (
    <div className="kpi-tile">
      <div className={`kpi-tile-accent ${accent}`} />
      <div className="kpi-tile-label">{label}</div>
      <div className="kpi-tile-value">{value}</div>
      {sub && <div className="kpi-tile-sub">{sub}</div>}
    </div>
  );
}

function Row({ label, value, good, bad }: { label: string; value: any; good?: boolean; bad?: boolean }) {
  const color = good ? 'text-emerald-700' : bad ? 'text-racing-600' : 'text-graphite-900';
  return (
    <div className="flex items-center justify-between text-sm border-b border-graphite-100 pb-2">
      <span className="text-graphite-500 font-mono uppercase text-[11px] tracking-wider">{label}</span>
      <span className={`font-display tracking-wide text-lg ${color}`}>{value}</span>
    </div>
  );
}

function SeverityPill({ s }: { s: string }) {
  const map: Record<string, string> = { low: 'neutral', moderate: 'caution', high: 'bear', critical: 'bear' };
  return <span className={`status-pill ${map[s] ?? 'neutral'}`}>{s}</span>;
}

function ChargeBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-display tracking-wide">{label}</span>
        <span className="font-mono">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-graphite-100">
        <div className="h-2" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
      </div>
    </div>
  );
}
