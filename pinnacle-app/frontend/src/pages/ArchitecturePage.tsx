import { useQuery } from '@tanstack/react-query';
import { api, formatBytes, formatNumber } from '../api/queries';

export default function ArchitecturePage() {
  const icebergQ = useQuery({ queryKey: ['iceberg'], queryFn: api.getIceberg });

  const tables = icebergQ.data ?? [];
  const layers = ['bronze', 'silver', 'gold'] as const;

  return (
    <div style={{ backgroundColor: '#f5f5f0' }} className="min-h-screen">
      <div className="hero-bg text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="font-condensed text-[11px] tracking-[0.28em] text-racing-500 mb-2">ODI Architecture · Reference Diagram</div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-wide">Six sources. One Iceberg lake. Any engine.</h1>
          <p className="mt-3 max-w-3xl text-graphite-300 leading-relaxed">
            Pinnacle Motors' ODI stack: managed connectors landing into Apache Iceberg on S3, governed
            by Glue catalog, transformed by dbt, queried by Snowflake — all without re-ingesting data.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Schematic diagram */}
        <div className="spec-card overflow-hidden">
          <div className="spec-card-header">
            <div className="spec-card-title">Reference Architecture · Schematic</div>
            <span className="layer-chip">ODI v1</span>
          </div>
          <div className="blueprint-grid p-6 lg:p-10">
            <Schematic />
          </div>
        </div>

        {/* Source systems */}
        <div className="spec-card">
          <div className="spec-card-header">
            <div className="spec-card-title">Source Systems</div>
            <span className="text-[11px] font-mono text-graphite-500">6 systems · ingested by Fivetran</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {SOURCES.map((s) => (
              <div key={s.title} className="p-5 border-b lg:border-b-0 lg:border-r border-graphite-200 last:border-r-0">
                <div className="layer-chip bronze inline-flex mb-2">{s.kind}</div>
                <div className="font-display text-lg tracking-wide text-graphite-900">{s.title}</div>
                <div className="text-xs text-graphite-600 mt-1 leading-relaxed">{s.detail}</div>
                <div className="mt-2 text-[10px] font-mono uppercase tracking-wider text-racing-600">{s.lands}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Iceberg catalog */}
        <div className="spec-card">
          <div className="spec-card-header">
            <div className="spec-card-title">Iceberg Tables · Glue Catalog</div>
            <span className="text-[11px] font-mono text-graphite-500">{tables.length} tables · all on s3://pinnacle-odi-lake/</span>
          </div>
          {layers.map((layer) => {
            const subset = tables.filter((t) => t.database === layer);
            if (!subset.length) return null;
            return (
              <div key={layer} className="border-b last:border-b-0 border-graphite-200">
                <div className="px-4 py-2 bg-graphite-50 flex items-center gap-2">
                  <span className={`layer-chip ${layer}`}>{layer}</span>
                  <span className="text-[11px] font-mono text-graphite-500">{subset.length} tables · {formatBytes(subset.reduce((s, t) => s + t.bytes, 0))}</span>
                </div>
                <table className="spec-table">
                  <thead>
                    <tr>
                      <th>Table</th>
                      <th>Source</th>
                      <th>Partitions</th>
                      <th className="text-right">Rows</th>
                      <th className="text-right">Bytes</th>
                      <th className="text-right">Cols</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subset.map((t) => (
                      <tr key={t.table}>
                        <td className="font-mono text-xs">{t.database}.{t.table}</td>
                        <td className="text-xs">{t.source_system}</td>
                        <td className="text-[11px] font-mono text-graphite-500">{t.partitions.length ? t.partitions.join(', ') : '—'}</td>
                        <td className="text-right tabular">{formatNumber(t.rows)}</td>
                        <td className="text-right tabular">{formatBytes(t.bytes)}</td>
                        <td className="text-right tabular">{t.schema_columns}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const SOURCES = [
  { kind: 'OEM ERP',          title: 'SAP S/4HANA',                  detail: 'Production orders, BOM, material master, supplier nominations.',                            lands: 'bronze.sap_s4_*' },
  { kind: 'Dealer DMS',       title: 'Dealertrack DMS',              detail: 'Inventory, sales, F&I, CSI across 280 rooftops.',                                          lands: 'bronze.dealertrack_*' },
  { kind: 'Used-vehicle feed', title: 'Cox Automotive Manheim',       detail: 'Wholesale auction prices, mileage curves, CPO eligibility signals.',                       lands: 'bronze.manheim_wholesale_raw' },
  { kind: 'Telemetry',        title: 'Connected-Car Stream',         detail: '1.2M VINs emitting 400+ signals every 3 seconds via simulated Kafka topic.',               lands: 'bronze.telemetry_events_raw' },
  { kind: 'CRM / Service',    title: 'Salesforce Service Cloud',     detail: 'Warranty cases, dealer service tickets, customer outreach.',                                lands: 'bronze.salesforce_service_cases_raw' },
  { kind: 'Benchmark',        title: 'J.D. Power IQS / APEAL',       detail: 'Initial Quality Study PP100 by segment, APEAL scores, segment rank.',                       lands: 'bronze.jd_power_iqs_raw' },
];

function Schematic() {
  return (
    <svg viewBox="0 0 1100 560" className="w-full h-auto" role="img" aria-label="ODI reference architecture diagram">
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="#52525b" />
        </marker>
      </defs>

      {/* Column headers */}
      {[
        ['Source Systems', 80,  '#52525b'],
        ['Ingest',          290, '#dc2626'],
        ['Lake (Iceberg)',  500, '#52525b'],
        ['Transform',       720, '#52525b'],
        ['Consume',         930, '#2563eb'],
      ].map(([label, x, color], i) => (
        <text key={i} x={x as number} y="32" fontFamily="Antonio, sans-serif" fontWeight="600" fontSize="14" letterSpacing="2" fill={color as string}>
          {(label as string).toUpperCase()}
        </text>
      ))}

      {/* Sources */}
      {[
        { y: 70,  label: 'SAP S/4HANA',           sub: 'OEM ERP' },
        { y: 130, label: 'Dealertrack DMS',       sub: '280 rooftops' },
        { y: 190, label: 'Manheim feed',          sub: 'Cox Automotive' },
        { y: 250, label: 'Telemetry stream',      sub: '1.2M VINs · Kafka' },
        { y: 310, label: 'Salesforce Service',    sub: 'warranty + CRM' },
        { y: 370, label: 'J.D. Power IQS',        sub: 'benchmarks' },
      ].map((s) => (
        <g key={s.label}>
          <rect x="40" y={s.y} width="200" height="44" fill="#ffffff" stroke="#18181b" strokeWidth="1.5" />
          <text x="50" y={s.y + 19} fontFamily="Inter, sans-serif" fontWeight="600" fontSize="12" fill="#18181b">{s.label}</text>
          <text x="50" y={s.y + 34} fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#71717a">{s.sub}</text>
          <line x1="240" y1={s.y + 22} x2="280" y2={s.y + 22} stroke="#52525b" strokeWidth="1.25" markerEnd="url(#arrow)" />
        </g>
      ))}

      {/* Ingest */}
      <g>
        <rect x="280" y="120" width="180" height="200" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
        <text x="370" y="148" textAnchor="middle" fontFamily="Antonio, sans-serif" fontSize="16" fontWeight="600" letterSpacing="1" fill="#dc2626">FIVETRAN</text>
        <text x="370" y="170" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="11" fill="#7f1d1d">Managed connectors</text>
        <text x="370" y="190" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="11" fill="#7f1d1d">MDLS · Iceberg writes</text>
        <text x="370" y="225" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#dc2626">SAP · DMS · Kafka</text>
        <text x="370" y="242" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#dc2626">Manheim · SFDC · J.D.P.</text>
        <text x="370" y="277" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="10" fontStyle="italic" fill="#7f1d1d">lineage label only</text>
        <line x1="460" y1="220" x2="500" y2="220" stroke="#52525b" strokeWidth="1.25" markerEnd="url(#arrow)" />
      </g>

      {/* Iceberg lake */}
      <g>
        <rect x="500" y="80" width="200" height="370" fill="#ffffff" stroke="#18181b" strokeWidth="1.5" />
        <text x="600" y="108" textAnchor="middle" fontFamily="Antonio, sans-serif" fontSize="14" fontWeight="600" letterSpacing="2" fill="#18181b">APACHE ICEBERG</text>
        <text x="600" y="126" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#71717a">s3://pinnacle-odi-lake/</text>

        {[
          { y: 150, label: 'bronze',  color: '#9a3412', bg: '#fff7ed' },
          { y: 230, label: 'silver',  color: '#475569', bg: '#f8fafc' },
          { y: 310, label: 'gold',    color: '#854d0e', bg: '#fefce8' },
        ].map((b) => (
          <g key={b.label}>
            <rect x="518" y={b.y} width="164" height="60" fill={b.bg} stroke={b.color} />
            <text x="600" y={b.y + 25} textAnchor="middle" fontFamily="Antonio, sans-serif" fontSize="14" fontWeight="600" letterSpacing="2" fill={b.color}>{b.label.toUpperCase()}</text>
            <text x="600" y={b.y + 44} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill={b.color}>
              {b.label === 'bronze' ? 'raw · partitioned' : b.label === 'silver' ? 'staged · typed' : 'modeled · semantic'}
            </text>
          </g>
        ))}

        <text x="600" y="430" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="11" fill="#52525b" fontStyle="italic">Glue catalog · time-travel · schema evolution</text>
        <line x1="700" y1="230" x2="720" y2="230" stroke="#52525b" strokeWidth="1.25" markerEnd="url(#arrow)" />
      </g>

      {/* Transform */}
      <g>
        <rect x="720" y="160" width="170" height="160" fill="#ffffff" stroke="#18181b" strokeWidth="1.5" />
        <text x="805" y="190" textAnchor="middle" fontFamily="Antonio, sans-serif" fontSize="14" fontWeight="600" letterSpacing="2" fill="#18181b">DBT</text>
        <text x="805" y="210" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="11" fill="#52525b">Iceberg-native</text>
        <text x="805" y="226" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="11" fill="#52525b">semantic models</text>
        <text x="805" y="262" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#dc2626">7 gold marts</text>
        <text x="805" y="278" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#dc2626">94 tests</text>
        <line x1="890" y1="240" x2="910" y2="240" stroke="#52525b" strokeWidth="1.25" markerEnd="url(#arrow)" />
      </g>

      {/* Consume */}
      <g>
        <rect x="910" y="80" width="170" height="370" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.5" />
        <text x="995" y="110" textAnchor="middle" fontFamily="Antonio, sans-serif" fontSize="14" fontWeight="600" letterSpacing="2" fill="#2563eb">CONSUME</text>

        {[
          { y: 140, label: 'Snowflake',       sub: 'executive BI' },
          { y: 200, label: 'Athena · Trino',   sub: 'ad-hoc SQL' },
          { y: 260, label: 'dbt semantic',     sub: 'metrics layer' },
          { y: 320, label: 'PdM agent',        sub: 'predictive maintenance' },
          { y: 380, label: 'Recall agent',     sub: 'risk monitoring' },
        ].map((c) => (
          <g key={c.label}>
            <rect x="928" y={c.y} width="134" height="40" fill="#ffffff" stroke="#2563eb" />
            <text x="995" y={c.y + 18} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="600" fill="#1d4ed8">{c.label}</text>
            <text x="995" y={c.y + 32} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#52525b">{c.sub}</text>
          </g>
        ))}
      </g>

      {/* Footer note */}
      <text x="40" y="540" fontFamily="Inter, sans-serif" fontSize="10" fontStyle="italic" fill="#71717a">
        Customer owns the storage layer. Compute is pluggable. Schema evolution is in the spec. Time-travel keeps the audit trail.
      </text>
    </svg>
  );
}
