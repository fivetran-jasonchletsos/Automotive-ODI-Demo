import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, formatNumber } from '../api/queries';
import USMap from '../components/USMap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function DealerPage() {
  const dealersQ = useQuery({ queryKey: ['dealers'], queryFn: api.getDealers });
  const [region, setRegion] = useState<string>('All');

  const data = dealersQ.data;
  const dealers = data?.dealers ?? [];
  const regions = ['All', ...(data?.region_rollups ?? []).map((r) => r.region)];

  const filtered = useMemo(
    () => (region === 'All' ? dealers : dealers.filter((d) => d.region === region)),
    [dealers, region],
  );

  const top = [...filtered].sort((a, b) => b.csi - a.csi).slice(0, 10);
  const bottom = [...filtered].sort((a, b) => a.csi - b.csi).slice(0, 10);

  const regionRollups = data?.region_rollups ?? [];

  return (
    <div className="bg-graphite-50 min-h-screen">
      <div className="bg-graphite-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-500 mb-2">Dealer Network · Operations View</div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-wide">280 Dealers. One Iceberg Table.</h1>
          <p className="mt-3 max-w-3xl text-graphite-300 leading-relaxed">
            Dealertrack DMS data was historically locked behind 280 rooftops. ODI lands every
            inventory row, CSI score, and F&I attach into <span className="font-mono text-racing-500">gold.dim_dealers</span> /
            <span className="font-mono text-racing-500"> fct_dealer_inventory_daily</span> — Pinnacle's first true
            field-of-view across the network.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Region filter */}
        <div className="spec-card p-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase font-bold tracking-wider text-graphite-500 mr-2">Region</span>
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`px-3 py-1.5 text-xs font-display tracking-wider uppercase border transition-colors ${
                region === r ? 'bg-racing-600 text-white border-racing-600' : 'bg-white text-graphite-700 border-graphite-200 hover:bg-graphite-50'
              }`}
            >
              {r}
            </button>
          ))}
          <div className="ml-auto text-xs font-mono text-graphite-500">{formatNumber(filtered.length)} dealers in view</div>
        </div>

        {/* Region rollups */}
        <div className="mt-6 spec-card">
          <div className="spec-card-header">
            <div className="spec-card-title">Regional Health Index</div>
            <span className="layer-chip">gold.fct_dealer_inventory_daily</span>
          </div>
          <div className="p-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionRollups} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#e4e4e7" />
                <XAxis dataKey="region" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ borderRadius: 0, border: '1px solid #d4d4d8', fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="avg_csi" fill="#2563eb" name="Avg CSI" />
                <Bar yAxisId="right" dataKey="avg_days_on_lot" fill="#dc2626" name="Days on lot" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Map */}
        <div className="mt-6 spec-card">
          <div className="spec-card-header">
            <div className="spec-card-title">Footprint Map — {region}</div>
            <span className="layer-chip racing">gold.dim_dealers</span>
          </div>
          <div className="p-2">
            <USMap
              plants={[]}
              dealers={filtered.map((d) => ({ id: d.dealer_id, lat: d.lat, lng: d.lng, color: d.csi >= 90 ? '#2563eb' : d.csi >= 82 ? '#52525b' : '#dc2626' }))}
              showLabels={false}
            />
          </div>
        </div>

        {/* Top / Bottom */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DealerList title="Top 10 by CSI" list={top} accent="signal" />
          <DealerList title="Bottom 10 by CSI" list={bottom} accent="racing" />
        </div>

        {/* Full grid */}
        <div className="mt-6 spec-card mb-12">
          <div className="spec-card-header">
            <div className="spec-card-title">All dealers — {region}</div>
            <span className="text-xs font-mono text-graphite-500">{formatNumber(filtered.length)} rows</span>
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            <table className="spec-table">
              <thead className="sticky top-0">
                <tr>
                  <th>Dealer ID</th>
                  <th>Name</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Region</th>
                  <th className="text-right">Days on lot</th>
                  <th className="text-right">Margin %</th>
                  <th className="text-right">CSI</th>
                  <th className="text-right">Sales/mo</th>
                  <th>Top model</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.dealer_id}>
                    <td className="font-mono text-xs">{d.dealer_id}</td>
                    <td>{d.name}</td>
                    <td>{d.city}</td>
                    <td className="font-mono">{d.state}</td>
                    <td>{d.region}</td>
                    <td className="text-right tabular">{d.days_on_lot}</td>
                    <td className="text-right tabular">{d.gross_margin_pct.toFixed(1)}</td>
                    <td className={`text-right tabular font-semibold ${d.csi >= 90 ? 'text-signal-600' : d.csi < 78 ? 'text-racing-600' : 'text-graphite-900'}`}>{d.csi.toFixed(1)}</td>
                    <td className="text-right tabular">{d.sales_pace_units_mo}</td>
                    <td className="text-xs">{d.top_grossing_model}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function DealerList({ title, list, accent }: { title: string; list: any[]; accent: 'signal' | 'racing' }) {
  const dot = accent === 'signal' ? 'bg-signal-600' : 'bg-racing-600';
  return (
    <div className="spec-card">
      <div className="spec-card-header">
        <div className="spec-card-title">{title}</div>
      </div>
      <div className="divide-y divide-graphite-200">
        {list.map((d) => (
          <div key={d.dealer_id} className="flex items-center gap-3 px-4 py-2.5">
            <span className={`h-2 w-2 ${dot} shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="font-display text-sm tracking-wide">{d.name}</div>
              <div className="text-[11px] font-mono text-graphite-500">{d.dealer_id} · {d.city}, {d.state} · {d.region}</div>
            </div>
            <div className="text-right">
              <div className="font-display text-lg tabular">{d.csi.toFixed(1)}</div>
              <div className="text-[10px] uppercase tracking-wider text-graphite-500">CSI</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
