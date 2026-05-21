import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { api } from '../api/queries';

const NAV_ITEMS: [string, string][] = [
  ['/', 'Console'],
  ['/dealers', 'Dealers'],
  ['/connected-car', 'Connected Car'],
  ['/quality', 'Quality'],
  ['/architecture', 'Architecture'],
  ['/pipeline', 'Pipeline'],
  ['/policy', 'Why ODI'],
  ['/about', 'About'],
];

const DEMOS = [
  { key: 'automotive',     name: 'Pinnacle Motors',     industry: 'Automotive · OEM + dealer + connected car', url: 'https://fivetran-jasonchletsos.github.io/Automotive-ODI-Demo/', accent: '#dc2626' },
  { key: 'finserv',        name: 'Meridian Capital',    industry: 'Financial Services · Wealth & banking', url: 'https://fivetran-jasonchletsos.github.io/FinServ-ODI-Demo/', accent: '#1d4ed8' },
  { key: 'insurance',      name: 'Atlas Risk',          industry: 'Insurance · Policies, claims, reinsurance', url: 'https://fivetran-jasonchletsos.github.io/Insurance-ODI-Demo/', accent: '#0369a1' },
  { key: 'healthcare',     name: 'Epic Clarity',        industry: 'Healthcare · Clinical analytics',           url: 'https://fivetran-jasonchletsos.github.io/Healthcare-EPIC-Snowflake-Demo/', accent: '#0d9488' },
  { key: 'media',          name: 'Lighthouse Media',    industry: 'Media · Audience intelligence',             url: 'https://fivetran-jasonchletsos.github.io/Media-ODI-Demo/', accent: '#7c3aed' },
  { key: 'retail',         name: 'Storefront Analytics', industry: 'Retail & e-commerce',                       url: 'https://fivetran-jasonchletsos.github.io/RetailEcom-ODI-Demo/', accent: '#ea580c' },
  { key: 'techsaas',       name: 'SaaS Pulse',          industry: 'Tech · SaaS analytics',                     url: 'https://fivetran-jasonchletsos.github.io/TechSaaS-ODI-Demo/', accent: '#059669' },
  { key: 'supplychain',    name: 'Manifest',            industry: 'Supply chain · Logistics',                  url: 'https://fivetran-jasonchletsos.github.io/SupplyChain-ODI-Demo/', accent: '#0891b2' },
  { key: 'lifesci',        name: 'Cohort',              industry: 'Life sciences · Clinical research',         url: 'https://fivetran-jasonchletsos.github.io/LifeSci-ODI-Demo/', accent: '#be185d' },
  { key: 'mission-control',name: 'Mission Control',     industry: 'Admin · Governance + observability',        url: 'https://fivetran-jasonchletsos.github.io/ODI-Mission-Control/', accent: '#22d3ee' },
];
const CURRENT_DEMO = 'automotive';

export default function Layout() {
  const [snapshotAt, setSnapshotAt] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    api.getSummary().then((s) => setSnapshotAt(s.generated_at)).catch(() => {});
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-full flex flex-col bg-[var(--paper)]">
      <div className="precision-rail" />

      <header className="bg-graphite-900 text-white sticky top-0 z-30 border-b border-graphite-800">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-4">
            <Link to="/" className="flex items-center gap-3 shrink-0 min-w-0 group">
              <div className="h-10 w-10 flex items-center justify-center bg-racing-600">
                <PinnacleMark className="h-6 w-6 text-white" />
              </div>
              <div className="leading-tight min-w-0">
                <div className="font-display font-semibold text-xl sm:text-2xl tracking-wider truncate">
                  PINNACLE MOTORS
                </div>
                <div className="mt-0.5 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.22em] text-graphite-400">
                  ODI Operations Console
                </div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5 text-sm">
              {NAV_ITEMS.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `relative px-3 py-2 font-medium tracking-tight transition-colors text-[13px] uppercase font-display ${
                      isActive ? 'text-white' : 'text-graphite-300 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {label}
                      {isActive && (
                        <span className="absolute left-3 right-3 -bottom-[1px] h-[2px] bg-racing-600" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <DemoSwitcher />
              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                className="lg:hidden h-9 w-9 inline-flex items-center justify-center text-white/80 hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  {mobileOpen ? <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /> : <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />}
                </svg>
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div className="lg:hidden pb-4 border-t border-graphite-800 pt-3 space-y-3">
              <nav className="grid grid-cols-2 gap-1 text-sm">
                {NAV_ITEMS.map(([to, label]) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `px-3 py-2 text-center font-display uppercase tracking-wider text-xs border ${
                        isActive
                          ? 'bg-racing-600 text-white border-racing-600'
                          : 'border-graphite-700 text-graphite-200 hover:bg-white/10'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-graphite-200 bg-graphite-900 text-white/80 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 flex items-center justify-center bg-racing-600">
                <PinnacleMark className="h-4 w-4 text-white" />
              </div>
              <div className="font-display font-semibold text-white tracking-wider">PINNACLE MOTORS</div>
            </div>
            <p className="leading-relaxed text-white/60">
              ODI Operations Console — reference build that unifies OEM ERP, dealer DMS, and 1.2M connected
              vehicles on Apache Iceberg. Synthetic data for architecture demonstration only.
            </p>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-racing-500 mb-2">Data Pipeline</div>
            <p className="leading-relaxed text-white/70">
              SAP S/4HANA · Dealertrack DMS · Manheim · Telemetry stream · Salesforce Service · J.D. Power
              → Fivetran connectors → S3 + Apache Iceberg → dbt (bronze / silver / gold) → Snowflake
            </p>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-racing-500 mb-2">Open Standards</div>
            <p className="leading-relaxed text-white/70">
              Apache Iceberg · AWS Glue Data Catalog · ANSI SQL · dbt semantic layer. Any compute engine.
              No lock-in.
            </p>
          </div>
        </div>
        <div className="border-t border-graphite-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 text-[11px] text-white/50 flex flex-col sm:flex-row gap-1 sm:items-center sm:justify-between">
            <div>© 2026 Pinnacle Motors ODI Demo · Fivetran Open Data Infrastructure</div>
            <div className="font-mono">Snapshot {snapshotAt ? new Date(snapshotAt).toLocaleString() : '—'}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DemoSwitcher() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider border bg-racing-600/15 text-racing-500 border-racing-600/40 hover:bg-racing-600/25 transition-colors"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-racing-500 animate-pulse" />
        Snapshot
        <svg viewBox="0 0 24 24" className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-[300px] border border-graphite-200 bg-white shadow-xl z-40 overflow-hidden">
          <div className="px-3 pt-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-graphite-500 border-b border-graphite-200">
            Switch demo
          </div>
          <div className="py-1 max-h-[420px] overflow-y-auto">
            {DEMOS.map((d) => {
              const current = d.key === CURRENT_DEMO;
              const inner = (
                <div className="flex items-center gap-2.5 px-3 py-2">
                  <span className="h-2.5 w-2.5 shrink-0" style={{ background: d.accent }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-graphite-900 truncate">{d.name}</div>
                    <div className="text-[11px] text-graphite-500 truncate">{d.industry}</div>
                  </div>
                  {current && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-graphite-100 text-graphite-600 border border-graphite-200">
                      Current
                    </span>
                  )}
                </div>
              );
              return current ? (
                <div key={d.key} className="opacity-60 cursor-default">{inner}</div>
              ) : (
                <a key={d.key} href={d.url} className="block hover:bg-graphite-50 transition-colors" onClick={() => setOpen(false)}>
                  {inner}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Pinnacle mark — abstract mountain peak / racing chevron
function PinnacleMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 20 L12 4 L21 20 L15 17 L12 20 L9 17 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
