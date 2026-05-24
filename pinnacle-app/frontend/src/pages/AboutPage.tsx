export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Canonical ODI block — DO NOT EDIT (mirrors FinServ verbatim) */}
      <section className="spec-card p-6 mb-10 border-l-4 border-l-racing-600">
        <div className="eyebrow mb-2">The ODI Story</div>
        <h2 className="font-display text-3xl tracking-wide text-graphite-900">
          Data infrastructure for agents you trust.
        </h2>
        <p className="mt-3 text-graphite-700 leading-relaxed">
          <em>"MDS was optimized for humans. ODI is designed for a future with humans and
          production agents at scale."</em> This demo is one instance of that architecture:
          Fivetran's 750+ connectors and Managed Data Lake Service (MDLS) land data into open
          table formats; dbt transformations build the governed semantic layer; multiple compute
          engines and AI agents read the same gold tables.
        </p>
        <a
          href="https://fivetran-jasonchletsos.github.io/Fivetran-Demo-Repository/story/"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-racing-600 hover:underline"
        >
          Read the full ODI Story →
        </a>
      </section>

      <header className="mb-8">
        <div className="eyebrow mb-1">ODI Reference Architecture · Automotive</div>
        <h1 className="font-display text-4xl tracking-wide text-graphite-900">About Pinnacle Motors</h1>
        <p className="mt-3 text-graphite-700 leading-relaxed">
          Pinnacle Motors is a reference build that demonstrates how a regional automotive OEM
          can reconcile three radically different data realities — assembly-line ERP, dealer DMS,
          and a 1.2M-vehicle connected-car telemetry stream — on a single Apache Iceberg lake.
          The CDO no longer chooses which truth wins; the same gold tables power Snowflake
          dashboards, dbt semantic models, and the agents watching the fleet.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-wide text-graphite-900 border-b border-graphite-200 pb-2 mb-4">What this demo shows</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="spec-card p-5">
              <div className="layer-chip racing inline-flex mb-3">{p.tag}</div>
              <h3 className="font-display text-lg tracking-wide text-graphite-900">{p.title}</h3>
              <p className="mt-1 text-sm text-graphite-700 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-wide text-graphite-900 border-b border-graphite-200 pb-2 mb-4">Tech stack</h2>
        <div className="spec-card p-5">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {STACK.map((s) => (
              <li key={s.name} className="flex items-start gap-3">
                <div className="layer-chip silver shrink-0 mt-0.5">{s.layer}</div>
                <div className="min-w-0">
                  <div className="font-display text-graphite-900">{s.name}</div>
                  <div className="text-xs text-graphite-600">{s.note}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-wide text-graphite-900 border-b border-graphite-200 pb-2 mb-4">The three realities ODI unifies</h2>
        <div className="space-y-3">
          {SOURCES.map((s) => (
            <article key={s.title} className="spec-card p-5">
              <div className="flex items-start gap-3">
                <span className="layer-chip bronze shrink-0">Source</span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg tracking-wide text-graphite-900">{s.title}</h3>
                  <p className="mt-1 text-sm text-graphite-700 leading-relaxed">{s.description}</p>
                  <div className="mt-2 text-xs text-graphite-500">
                    <span className="font-bold uppercase tracking-wider text-[10px]">Provides:</span> {s.provides}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-wide text-graphite-900 border-b border-graphite-200 pb-2 mb-4">ODI vs MDS — automotive lens</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="spec-card p-5">
            <div className="eyebrow-graphite mb-2">Traditional MDS</div>
            <h3 className="font-display text-lg tracking-wide text-graphite-900">Warehouse-centric</h3>
            <ul className="mt-3 space-y-2 text-sm text-graphite-700">
              <li>· Telemetry copied into warehouse — pay for storage twice</li>
              <li>· Engineering reaches for a different system for each source</li>
              <li>· Compute engine choice locked to vendor roadmap</li>
              <li>· Connected-car volume blows up warehouse budget</li>
              <li>· Schema drift between SAP and DMS handled manually</li>
            </ul>
          </div>
          <div className="spec-card p-5 border-l-4 border-l-racing-600">
            <div className="eyebrow mb-2">Open Data Infrastructure</div>
            <h3 className="font-display text-lg tracking-wide text-graphite-900">Open lake-centric</h3>
            <ul className="mt-3 space-y-2 text-sm text-graphite-700">
              <li>· Customer owns the storage (S3 + Iceberg)</li>
              <li>· Snowflake, Athena, Trino read the same Iceberg bytes — external catalogs, no extracts</li>
              <li>· Telemetry stream lands once, queried by humans and agents</li>
              <li>· Iceberg time-travel keeps the audit trail for recall investigations</li>
              <li>· Schema evolution is in the spec, vendor-neutral</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-10 bg-graphite-100 border border-graphite-200 p-5 text-sm text-graphite-700">
        <div className="eyebrow mb-2" style={{ color: 'var(--caution)' }}>Disclaimer</div>
        <p className="leading-relaxed">
          <strong className="text-graphite-900">All data shown is synthetic.</strong>{' '}
          Pinnacle Motors is a fictional OEM. Plants, dealers, VINs, DTCs, warranty claims, and
          J.D. Power positioning are illustrative only. This site does not represent any real
          automaker or product.
        </p>
      </section>
    </div>
  );
}

const PILLARS = [
  { tag: 'Pillar 1', title: 'Customer-owned storage', body: 'Fivetran lands every CDC row into Iceberg (MDLS) on Pinnacle\'s S3 bucket — one copy of the bytes, in open Apache Iceberg format. Fivetran writes; the OEM reads with any engine.' },
  { tag: 'Pillar 2', title: 'Open table format',     body: 'Iceberg v2 brings ACID transactions, schema evolution, and time-travel — critical for warranty investigations and recall traceability.' },
  { tag: 'Pillar 3', title: 'Multi-engine reads',    body: 'Snowflake, Athena, and Trino read the same Iceberg bytes via external catalogs — no copies, no extracts. Fivetran Transformations triggers dbt Labs the moment the source sync finishes.' },
];

const STACK = [
  { layer: 'Source',    name: 'Six operational systems',     note: 'SAP S/4HANA · Dealertrack DMS · Manheim · Telemetry Kafka · Salesforce · J.D. Power.' },
  { layer: 'Ingest',    name: 'Fivetran connectors',         note: 'CDC + batch + stream landing into Iceberg (MDLS). 750+ source library.' },
  { layer: 'Lake',      name: 'Iceberg (MDLS) on S3',         note: 'pinnacle-odi-lake bucket · open Apache Iceberg v2 · Parquet · ZSTD · one copy of the bytes.' },
  { layer: 'Catalog',   name: 'AWS Glue Data Catalog',        note: 'Iceberg REST + table-level access control.' },
  { layer: 'Compute',   name: 'Snowflake / Athena / Trino',  note: 'External Iceberg reads — same bytes, no copies, no extracts.' },
  { layer: 'Transform', name: 'dbt Labs',                     note: 'Triggered by Fivetran Transformations on sync completion. bronze → silver → gold, all in Iceberg.' },
  { layer: 'Frontend',  name: 'React 18 + Vite + Tailwind',   note: 'Static SPA on GitHub Pages, reads JSON snapshot of gold.' },
  { layer: 'Charts',    name: 'Recharts + custom SVG',        note: 'Spec-sheet aesthetic — tight gridlines, monospace numerics.' },
];

const SOURCES = [
  { title: 'OEM ERP — SAP S/4HANA',         description: 'Assembly-plant production orders, BOM, supplier nominations, financial close. Pinnacle\'s system of record for "what got built."', provides: 'Production by plant · BOM · supplier allocation · cost of goods' },
  { title: 'Dealer Network — Dealertrack DMS', description: '280 franchised dealers run on Dealertrack. Inventory days-on-lot, F&I, CSI, gross margin — and the data Pinnacle didn\'t own until ODI.', provides: 'Dealer inventory · sales pace · CSI · margin · F&I attach' },
  { title: 'Used-Vehicle Market — Cox Automotive Manheim', description: 'Wholesale auction feed used to triangulate residual value, certified pre-owned strategy, and recall-affected resale.', provides: 'Wholesale price · mileage curve · CPO eligibility · regional mix' },
  { title: 'Connected-Car Telemetry Stream', description: '1.2M active vehicles emit telemetry every three seconds — DTCs, OTA results, predictive-maintenance signals, driving behavior, charging sessions.', provides: 'DTC stream · OTA campaign results · predictive alerts · driving / charging' },
  { title: 'Warranty & Customer — Salesforce Service Cloud', description: 'Customer cases, warranty claims, dealer service tickets. Joined back to VIN and production date for root-cause analysis.', provides: 'Warranty claims · customer cases · TSB engagement' },
  { title: 'J.D. Power Benchmarks',           description: 'Initial Quality Study (IQS), APEAL, and segment positioning. External benchmark joined to internal warranty data.', provides: 'IQS PP100 · APEAL · segment rank' },
];
