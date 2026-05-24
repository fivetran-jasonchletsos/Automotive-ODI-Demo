// Pinnacle Motors — Open Data Infrastructure architecture page.
//
// Ported from Clarity Health's ArchitecturePage to give Pinnacle the same
// medallion / multi-engine surface. Automotive flavour: OEM ERP (SQL
// Server CDC) + plant production (Oracle LogMiner) + CAN-bus telematics
// (1.2M connected vehicles) + NHTSA recall feed. Snowflake is the primary
// engine; Athena/DuckDB/Trino/Spark stay listed as the same open-lake reads.

import { useQuery } from '@tanstack/react-query';
import { AliveMedallion, type SourceNode, type EngineNode, type ConsumerRole } from '../components/AliveMedallion';
import { api, formatBytes, formatNumber } from '../api/queries';

const AUTO_SOURCES: SourceNode[] = [
  { id: 'dms',   label: 'Dealer DMS',         sub: 'SQL Server log-CDC',   logo: 'sqlserver', freshness: '43s lag',  status: 'healthy' },
  { id: 'prod',  label: 'Plant Production',   sub: 'Oracle LogMiner',      logo: 'oracle',    freshness: '2 min lag', status: 'healthy' },
  { id: 'can',   label: 'CAN-bus Telematics', sub: 'Connected-car stream', logo: 'hl7',       freshness: 'live',      status: 'healthy', streaming: true },
  { id: 'nhtsa', label: 'NHTSA Recall Feed',  sub: 'Daily federal pull',   logo: 'cms',       freshness: '1d lag',   status: 'healthy' },
];

const AUTO_ENGINES: EngineNode[] = [
  { name: 'Snowflake', active: true,  logo: 'snowflake' },
  { name: 'Athena',                    logo: 'athena' },
  { name: 'DuckDB',                    logo: 'duckdb' },
  { name: 'Trino',                     logo: 'trino' },
  { name: 'Spark',                     logo: 'spark' },
];

const AUTO_ROLES: ConsumerRole[] = [
  { label: 'Mfg Operations',     sub: 'OEE & quality' },
  { label: 'Dealer Network',     sub: 'inventory & sales' },
  { label: 'Quality / Warranty', sub: 'defect & cost' },
  { label: 'Connected Services', sub: 'fleet & telematics' },
];

export default function ArchitecturePage() {
  const icebergQ = useQuery({ queryKey: ['iceberg'], queryFn: api.getIceberg });

  const tables = icebergQ.data ?? [];
  const layers = ['bronze', 'silver', 'gold'] as const;

  const layerStats = (l: 'bronze' | 'silver' | 'gold') => {
    const t = tables.filter((row) => row.database === l);
    return {
      tables: t.length,
      rows: t.reduce((s, r) => s + (r.rows ?? 0), 0),
      bytes: t.reduce((s, r) => s + (r.bytes ?? 0), 0),
    };
  };

  return (
    <div style={{ backgroundColor: '#f5f5f0' }} className="min-h-screen">
      <div className="hero-bg text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="font-condensed text-[11px] tracking-[0.28em] text-racing-500 mb-2">ODI Architecture · Reference Diagram</div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-wide">Four sources. One Iceberg lake. Any engine.</h1>
          <p className="mt-3 max-w-3xl text-graphite-300 leading-relaxed">
            Pinnacle Motors' ODI stack: managed connectors landing into Apache Iceberg on S3, governed
            by Glue catalog, transformed by dbt, queried by Snowflake — all without re-ingesting data.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Data Flow — alive medallion */}
        <div className="spec-card overflow-hidden">
          <div className="spec-card-header">
            <div className="spec-card-title">Data Flow · From four open sources to one governed gold layer</div>
            <span className="layer-chip">ODI v1</span>
          </div>
          <div className="p-6 lg:p-8 bg-white">
            <AliveMedallion
              sources={AUTO_SOURCES}
              bronze={layerStats('bronze')}
              silver={layerStats('silver')}
              gold={layerStats('gold')}
              engines={AUTO_ENGINES}
              roles={AUTO_ROLES}
              accent="#dc2626"
              enginesCaption="All five read the same Iceberg tables — no copies, no rebuilds per tool."
            />
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
