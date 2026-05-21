export default function PolicyPage() {
  return (
    <div className="bg-graphite-50 min-h-screen">
      <div className="bg-graphite-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing-500 mb-2">Why ODI · Automotive Data Reality</div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-wide">Three IT estates that have never spoken to each other.</h1>
          <p className="mt-3 max-w-3xl text-graphite-300 leading-relaxed">
            The automotive industry doesn't have a data problem — it has a data <em>seam</em> problem.
            ODI is the architecture that closes the seams without replacing the underlying systems.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ESTATES.map((e) => (
            <div key={e.title} className="spec-card p-5 border-t-4" style={{ borderTopColor: e.color }}>
              <div className="text-[11px] font-bold uppercase tracking-wider font-mono" style={{ color: e.color }}>{e.label}</div>
              <div className="font-display text-xl tracking-wide mt-2">{e.title}</div>
              <div className="text-xs text-graphite-600 mt-2 leading-relaxed">{e.detail}</div>
              <div className="mt-3 pt-3 border-t border-graphite-200 text-[11px] font-mono text-graphite-500">
                {e.systems.join(' · ')}
              </div>
            </div>
          ))}
        </section>

        <section className="spec-card p-6">
          <div className="eyebrow mb-2">The seam tax</div>
          <h2 className="font-display text-2xl tracking-wide text-graphite-900">Why automotive data is fragmented</h2>
          <p className="text-sm text-graphite-700 mt-3 leading-relaxed">
            The three estates have different owners, different vendors, different update cadences, and
            different governance regimes. The OEM controls the assembly plant. The dealer owns the
            rooftop. The driver owns the car. Connecting them historically meant signing 280 dealer
            data-sharing agreements, building a custom telemetry warehouse, and reconciling a different
            "vehicle" entity in each system. Most OEMs gave up and ran three disconnected reports.
          </p>
          <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-graphite-700">
            {FRICTIONS.map((f, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-mono text-racing-600 text-xs mt-1">F{i + 1}</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="spec-card p-6 border-l-4 border-l-racing-600">
          <div className="eyebrow mb-2">How ODI bridges it</div>
          <h2 className="font-display text-2xl tracking-wide text-graphite-900">One Iceberg lake, owned by the OEM</h2>
          <p className="text-sm text-graphite-700 mt-3 leading-relaxed">
            ODI flips the architecture: the OEM owns the storage layer, not the warehouse vendor.
            Managed connectors land each estate into its own bronze namespace on Apache Iceberg. The
            VIN is the join key — it's already in every system. dbt materializes a vehicle-keyed gold
            layer that every consumer reads: Snowflake dashboards, predictive-maintenance agents,
            warranty triage, recall investigators.
          </p>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {BRIDGES.map((b) => (
              <div key={b.title} className="border border-graphite-200 p-4">
                <div className="layer-chip racing inline-flex mb-2">{b.tag}</div>
                <div className="font-display text-base tracking-wide">{b.title}</div>
                <div className="text-xs text-graphite-700 mt-1 leading-relaxed">{b.body}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="spec-card p-6 bg-graphite-100">
          <div className="eyebrow-graphite eyebrow">Outcome</div>
          <h2 className="font-display text-2xl tracking-wide text-graphite-900 mt-2">The CDO question that ODI answers</h2>
          <blockquote className="mt-3 border-l-2 border-l-racing-600 pl-4 text-graphite-800 italic">
            "Which model years and production dates are driving the spike in U0100 'lost comm' DTCs,
            which dealers have the highest concentration on lot, and what was the BOM-level supplier
            change that lines up with the failure window?"
          </blockquote>
          <p className="mt-3 text-sm text-graphite-700 leading-relaxed">
            Before ODI: three teams, three queries, three weeks. After ODI: one SQL statement joining
            <span className="font-mono"> gold.fct_telemetry_health_signals</span>,
            <span className="font-mono"> gold.fct_dealer_inventory_daily</span>, and
            <span className="font-mono"> gold.fct_production_daily</span> on the VIN.
          </p>
        </section>
      </div>
    </div>
  );
}

const ESTATES = [
  {
    label: 'Estate 1',
    color: '#dc2626',
    title: 'OEM Production IT',
    detail: 'The assembly plant. Owns BOM, supplier nominations, build sheets, financial close. The system that knows what was built.',
    systems: ['SAP S/4HANA', 'Plant MES', 'Supplier portals'],
  },
  {
    label: 'Estate 2',
    color: '#52525b',
    title: 'Dealer DMS',
    detail: '280 independently-owned franchises, each running their own DMS, each owning the customer relationship. The OEM sees aggregate, not detail.',
    systems: ['Dealertrack', 'CDK Global', 'Reynolds & Reynolds'],
  },
  {
    label: 'Estate 3',
    color: '#2563eb',
    title: 'Connected-Car IT',
    detail: 'The vehicle on the road. Streaming telemetry, OTA updates, driver app, charging events. A different cloud, a different schema, a different cadence.',
    systems: ['Telemetry Kafka', 'OTA backend', 'Mobile app cloud'],
  },
];

const FRICTIONS = [
  'VIN exists in all three systems, but with different attribute sets and refresh cadences.',
  'Dealer DMS data is contractually owned by the dealer — OEM sees only what the franchise agreement permits.',
  'Connected-car telemetry volume (billions of events/day) overwhelms a traditional warehouse.',
  'Warranty cases live in Salesforce; the production-date join lives in SAP; the DTC stream lives in Kafka.',
  'Each estate has its own data governance, retention policy, and PII regime.',
  'Recall investigations cross all three estates and have a regulatory clock attached.',
];

const BRIDGES = [
  { tag: 'Bridge 1', title: 'Customer-owned Iceberg lake', body: 'Pinnacle owns the storage — every system lands into one S3 bucket, governed by Glue.' },
  { tag: 'Bridge 2', title: 'VIN-keyed semantic layer',     body: 'dbt builds gold.dim_vehicles as the spine; every fact table joins on VIN.' },
  { tag: 'Bridge 3', title: 'Any compute, same gold layer', body: 'Snowflake for BI, Athena for ad-hoc, agents for predictive maintenance — same files, no re-ingest.' },
];
