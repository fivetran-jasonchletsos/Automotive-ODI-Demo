// RelatedVehiclesPanel — embeddable sidebar/section for any per-vehicle
// detail view.  Shows the top-K related nameplates with score, reason, and
// shared telematics signature.

import { Link } from "react-router-dom";
import { relatedFor, segmentColor } from "../lib/related";
import { type Vehicle } from "../lib/vehicles";

interface Props {
  vehicle: Vehicle;
  /** Max rows to show (default 5) */
  limit?: number;
}

export default function RelatedVehiclesPanel({ vehicle, limit = 5 }: Props) {
  const neighbors = relatedFor(vehicle.id).slice(0, limit);

  if (neighbors.length === 0) return null;

  return (
    <div className="spec-card">
      <div className="spec-card-header">
        <div className="spec-card-title">Related Vehicles</div>
        <Link
          to="/related"
          className="font-mono text-[9px] uppercase tracking-[0.22em] transition-colors"
          style={{ color: "#6b6b74", textDecoration: "none" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#dc2626"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#6b6b74"; }}
        >
          Full network map
        </Link>
      </div>
      <ul className="divide-y divide-graphite-100">
        {neighbors.map((nb) => (
          <li key={nb.id} className="flex items-center gap-3 px-4 py-3">
            {/* Segment color swatch */}
            <span
              className="flex-none inline-block"
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: segmentColor(nb.vehicle.segment),
                flexShrink: 0,
              }}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-display text-sm text-graphite-900 tracking-wide truncate">
                  {nb.vehicle.name.replace("Pinnacle ", "").toUpperCase()}
                </span>
                <span className="font-readout text-xs flex-none" style={{ color: "#dc2626" }}>
                  {Math.round(nb.score * 100)}%
                </span>
              </div>
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-graphite-500 truncate mt-0.5">
                {nb.why}
              </p>
              {nb.sharedTelematics.length > 0 && (
                <p className="font-mono text-[9px] mt-0.5" style={{ color: "#d97706" }}>
                  DTC overlap: {nb.sharedTelematics.join(", ")}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div
        className="px-4 py-2"
        style={{ borderTop: "1px solid var(--hairline)" }}
      >
        <Link
          to="/related"
          className="font-mono text-[9px] uppercase tracking-[0.22em] transition-colors"
          style={{ color: "rgba(220,38,38,0.65)", textDecoration: "none" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#dc2626"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(220,38,38,0.65)"; }}
        >
          View full similarity network
        </Link>
      </div>
    </div>
  );
}
