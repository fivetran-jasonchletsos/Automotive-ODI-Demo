// Related-vehicles similarity engine.
//
// Computes a top-K nearest-neighbor list for each Pinnacle nameplate using
// weighted Jaccard overlap across multiple dimensions.  Mirrors what a
// Cortex EMBED_TEXT pipeline would produce in production — the math runs
// client-side so the static site ships the graph without a runtime API.

import { VEHICLES, type Vehicle } from "./vehicles";

export type RelatedVehicle = {
  id: string;
  vehicle: Vehicle;
  score: number;   // 0..1
  why: string;     // human-readable reason
  sharedSegment: string[];
  sharedPowertrain: string[];
  sharedPlatform: string[];
  sharedTelematics: string[];
};

// ---------------------------------------------------------------------------
// Weights (segment + powertrain heaviest, then platform, then telematics)
// ---------------------------------------------------------------------------
const W_SEGMENT    = 1.4;  // body / size class — strongest product-line signal
const W_POWERTRAIN = 1.2;  // engine / drive — cross-shop driver
const W_PLATFORM   = 1.0;  // shared architecture — engineering similarity
const W_TELEMATICS = 0.8;  // shared DTC signature — fleet cohort / recall linkage
const W_REGION     = 0.4;  // secondary — geographic sales overlap
const W_FLEET      = 0.4;  // secondary — same fleet program cohort

const K = 8; // neighbors per vehicle
const W_SUM = W_SEGMENT + W_POWERTRAIN + W_PLATFORM + W_TELEMATICS + W_REGION + W_FLEET;

// ---------------------------------------------------------------------------
// Jaccard helper
// ---------------------------------------------------------------------------
function jaccard(a: string[], b: string[]): { score: number; shared: string[] } {
  if (a.length === 0 || b.length === 0) return { score: 0, shared: [] };
  const setA = new Set(a);
  const shared = b.filter((x) => setA.has(x));
  const union = new Set([...a, ...b]).size;
  return { score: shared.length / union, shared };
}

// ---------------------------------------------------------------------------
// Pairwise score
// ---------------------------------------------------------------------------
function scorePair(a: Vehicle, b: Vehicle) {
  const seg  = jaccard(a.segment,         b.segment);
  const pt   = jaccard(a.powertrain,      b.powertrain);
  const plat = jaccard(a.platform,        b.platform);
  const tel  = jaccard(a.telematicsIssues,b.telematicsIssues);
  const reg  = jaccard(a.region,          b.region);
  const flt  = jaccard(a.fleetCohort,     b.fleetCohort);

  const raw =
    W_SEGMENT    * seg.score  +
    W_POWERTRAIN * pt.score   +
    W_PLATFORM   * plat.score +
    W_TELEMATICS * tel.score  +
    W_REGION     * reg.score  +
    W_FLEET      * flt.score;

  return {
    score: raw / W_SUM,
    sharedSegment:    seg.shared,
    sharedPowertrain: pt.shared,
    sharedPlatform:   plat.shared,
    sharedTelematics: tel.shared,
  };
}

// ---------------------------------------------------------------------------
// Why-related copy
// ---------------------------------------------------------------------------
const SEGMENT_LABEL: Record<string, string> = {
  suv:           "SUV",
  midsize:       "midsize",
  compact:       "compact",
  crossover:     "crossover",
  sedan:         "sedan",
  truck:         "truck",
  fullsize:      "full-size",
  ev:            "EV",
  flagship:      "flagship",
  body_on_frame: "body-on-frame",
};

const PT_LABEL: Record<string, string> = {
  v6:          "V6",
  v8:          "V8",
  i4_turbo:    "I4 Turbo",
  electric:    "electric",
  battery_ev:  "BEV",
  awd:         "AWD",
  fwd:         "FWD",
  rwd:         "RWD",
  gasoline:    "gasoline",
  mild_hybrid: "mild hybrid",
  tow_package: "tow package",
};

function label(map: Record<string, string>, key: string): string {
  return map[key] ?? key.replace(/_/g, " ");
}

function whyCopy(
  _a: Vehicle,
  _b: Vehicle,
  s: ReturnType<typeof scorePair>
): string {
  if (s.sharedPlatform.length > 0) {
    return `Shared ${s.sharedPlatform[0].replace(/_/g, " ")} platform`;
  }
  if (s.sharedTelematics.length > 0) {
    const dtcs = s.sharedTelematics.slice(0, 2).join(", ");
    return `Common DTC signature (${dtcs})`;
  }
  if (s.sharedPowertrain.length >= 2) {
    const p1 = label(PT_LABEL, s.sharedPowertrain[0]);
    const p2 = label(PT_LABEL, s.sharedPowertrain[1]);
    return `Shared ${p1} + ${p2} powertrain`;
  }
  if (s.sharedPowertrain.length === 1) {
    return `Shared ${label(PT_LABEL, s.sharedPowertrain[0])} powertrain`;
  }
  if (s.sharedSegment.length > 0) {
    return `Same ${label(SEGMENT_LABEL, s.sharedSegment[0])} segment`;
  }
  return "Adjacent model line";
}

// ---------------------------------------------------------------------------
// Build top-K cache
// ---------------------------------------------------------------------------
let _cache: Map<string, RelatedVehicle[]> | null = null;

function build(): Map<string, RelatedVehicle[]> {
  const result = new Map<string, RelatedVehicle[]>();

  for (let i = 0; i < VEHICLES.length; i++) {
    const a = VEHICLES[i];
    const scored: RelatedVehicle[] = [];

    for (let j = 0; j < VEHICLES.length; j++) {
      if (i === j) continue;
      const b = VEHICLES[j];
      const s = scorePair(a, b);
      if (s.score <= 0) continue;
      scored.push({
        id: b.id,
        vehicle: b,
        score: s.score,
        why: whyCopy(a, b, s),
        sharedSegment:    s.sharedSegment,
        sharedPowertrain: s.sharedPowertrain,
        sharedPlatform:   s.sharedPlatform,
        sharedTelematics: s.sharedTelematics,
      });
    }

    scored.sort((x, y) => y.score - x.score);
    result.set(a.id, scored.slice(0, K));
  }

  return result;
}

export function relatedFor(vehicleId: string): RelatedVehicle[] {
  if (!_cache) _cache = build();
  return _cache.get(vehicleId) ?? [];
}

// All edges (source+target, deduped) — used by the graph page.
export type GraphEdge = {
  source: string;
  target: string;
  score: number;
};

let _edges: GraphEdge[] | null = null;

export function allEdges(): GraphEdge[] {
  if (_edges) return _edges;
  if (!_cache) _cache = build();

  const seen = new Set<string>();
  const out: GraphEdge[] = [];

  for (const [src, neighbors] of _cache.entries()) {
    for (const nb of neighbors) {
      const key = [src, nb.id].sort().join("--");
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ source: src, target: nb.id, score: nb.score });
    }
  }

  _edges = out;
  return _edges;
}

// Segment color for graph nodes (maps to graphite/racing-red palette).
export function segmentColor(segments: string[]): string {
  if (segments.includes("ev"))            return "#2563eb"; // signal blue
  if (segments.includes("truck"))         return "#d97706"; // amber
  if (segments.includes("sedan"))         return "#7c3aed"; // violet
  if (segments.includes("flagship"))      return "#dc2626"; // racing red
  if (segments.includes("crossover") || segments.includes("compact")) return "#059669"; // teal
  return "#6b6b74"; // graphite default
}
