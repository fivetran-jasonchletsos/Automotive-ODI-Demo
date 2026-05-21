import { useQuery } from '@tanstack/react-query';
import { api, formatCurrencyShort, formatNumber, formatPercent } from '../api/queries';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function QualityPage() {
  const q = useQuery({ queryKey: ['quality'], queryFn: api.getQuality });
  const data = q.data;

  return (
    <div className="bg-graphite-50 min-h-screen">
      <div className="bg-graphite-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-500 mb-2">Quality · Warranty · J.D. Power</div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-wide">Find the issue before the recall finds you.</h1>
          <p className="mt-3 max-w-3xl text-graphite-300 leading-relaxed">
            Warranty claims from Salesforce Service Cloud, joined to production date from SAP S/4HANA,
            joined to DTC velocity from the telemetry stream. Three sources, one VIN-keyed join in
            <span className="font-mono text-racing-500"> gold.fct_warranty_claims</span>.
          </p>
        </div>
      </div>

      {data && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
          {/* Headline KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Tile label="Warranty rate"       value={formatNumber(data.warranty_rate_per_1000)} sub="claims / 1k vehicles" accent="racing" />
            <Tile label="YoY trend"           value={formatPercent(data.warranty_rate_trend_yoy_pct)} sub="vs prior year" accent={data.warranty_rate_trend_yoy_pct < 0 ? 'bull' : 'racing'} />
            <Tile label="J.D. Power IQS"      value={`${data.jd_power_iqs.pinnacle_pp100} PP100`} sub={`industry: ${data.jd_power_iqs.industry_avg_pp100}`} accent="signal" />
            <Tile label="Segment rank"        value={`#${data.jd_power_iqs.rank_in_segment} / ${data.jd_power_iqs.segment_size}`} sub={`${data.jd_power_iqs.trailing_quarter_change > 0 ? '+' : ''}${data.jd_power_iqs.trailing_quarter_change} QoQ`} accent="graphite" />
          </div>

          {/* Claims by part family */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 spec-card">
              <div className="spec-card-header">
                <div className="spec-card-title">Warranty Claims by Part Family · 90d</div>
                <span className="layer-chip">gold.fct_warranty_claims</span>
              </div>
              <div className="p-2 h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.claims_by_part_family} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#e4e4e7" />
                    <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                    <YAxis type="category" dataKey="part_family" width={180} tick={{ fontSize: 11 }} />
                    <Tooltip
                      cursor={{ fill: '#f4f4f5' }}
                      contentStyle={{ borderRadius: 0, border: '1px solid #d4d4d8', fontSize: 12 }}
                      formatter={(v: any) => formatNumber(v as number)}
                    />
                    <Bar dataKey="claims_90d" name="Claims (90d)" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-card-header">
                <div className="spec-card-title">Cost & Rate · drill</div>
              </div>
              <div className="divide-y divide-graphite-200">
                {data.claims_by_part_family.map((p) => (
                  <div key={p.part_family} className="px-4 py-3">
                    <div className="flex items-baseline justify-between">
                      <div className="font-display text-sm tracking-wide truncate">{p.part_family}</div>
                      <div className={`text-xs font-mono ${p.trend_pct > 0 ? 'text-racing-600' : 'text-emerald-700'}`}>{formatPercent(p.trend_pct)}</div>
                    </div>
                    <div className="mt-1 grid grid-cols-3 gap-2 text-[11px] font-mono">
                      <span>{formatCurrencyShort(p.cost_per_claim_usd)}/claim</span>
                      <span>{p.rate_per_1000.toFixed(1)}/1k</span>
                      <span>{formatNumber(p.claims_90d)} claims</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top issues — root cause */}
          <div className="mt-6 spec-card mb-12">
            <div className="spec-card-header">
              <div className="spec-card-title">Top 5 Issues · Root-cause status</div>
              <span className="layer-chip racing">gold.fct_quality_recall_risk_signal</span>
            </div>
            <div className="divide-y divide-graphite-200">
              {data.top_issues.map((iss) => (
                <div key={iss.issue} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-graphite-500">{iss.model} · MY{iss.model_year} · {iss.production_dates}</div>
                      <div className="mt-1 font-display text-xl tracking-wide text-graphite-900">{iss.issue}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <RecallPill risk={iss.recall_risk} />
                      <span className="text-[11px] font-mono uppercase tracking-wider text-graphite-500">{iss.root_cause_status.replaceAll('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <Cell label="Affected units" value={formatNumber(iss.affected_units)} />
                    <Cell label="Claims" value={formatNumber(iss.claim_count)} />
                    <Cell label="Claim rate" value={`${((iss.claim_count / iss.affected_units) * 100).toFixed(1)}%`} />
                    <Cell label="Fix status" value={iss.fix} small />
                  </div>
                </div>
              ))}
            </div>
          </div>
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

function Cell({ label, value, small }: { label: string; value: any; small?: boolean }) {
  return (
    <div className="border-t border-graphite-100 pt-2">
      <div className="text-[10px] uppercase tracking-wider text-graphite-500 font-mono">{label}</div>
      <div className={`${small ? 'text-xs leading-snug mt-1' : 'font-display text-base tracking-wide mt-0.5'} text-graphite-900`}>{value}</div>
    </div>
  );
}

function RecallPill({ risk }: { risk: string }) {
  const map: Record<string, string> = { none: 'neutral', low: 'neutral', moderate: 'caution', high: 'bear' };
  return <span className={`status-pill ${map[risk] ?? 'neutral'}`}>recall · {risk}</span>;
}
