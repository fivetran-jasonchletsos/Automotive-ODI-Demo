import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  relatedFor,
  allEdges,
  segmentColor,
  type GraphEdge,
} from "../lib/related";
import { VEHICLES, type Vehicle } from "../lib/vehicles";

// ---------------------------------------------------------------------------
// Force simulation — no external library
// ---------------------------------------------------------------------------
type Vec2 = { x: number; y: number };

function runSimulation(
  nodeIds: string[],
  edges: GraphEdge[],
  width: number,
  height: number,
  onTick: (positions: Vec2[], alpha: number) => void,
  onDone: (positions: Vec2[]) => void
) {
  const n = nodeIds.length;
  const pos: Vec2[] = nodeIds.map(() => ({
    x: width / 2 + (Math.random() - 0.5) * Math.min(width, height) * 0.5,
    y: height / 2 + (Math.random() - 0.5) * Math.min(width, height) * 0.5,
  }));
  const vel: Vec2[] = nodeIds.map(() => ({ x: 0, y: 0 }));

  const idToIdx = new Map(nodeIds.map((id, i) => [id, i]));
  const adjMap = new Map<string, { target: number; score: number }[]>();
  for (const e of edges) {
    const si = idToIdx.get(e.source);
    const ti = idToIdx.get(e.target);
    if (si == null || ti == null) continue;
    if (!adjMap.has(e.source)) adjMap.set(e.source, []);
    if (!adjMap.has(e.target)) adjMap.set(e.target, []);
    adjMap.get(e.source)!.push({ target: ti, score: e.score });
    adjMap.get(e.target)!.push({ target: si, score: e.score });
  }

  const REPEL    = 8000;
  const SPRING_K = 0.06;
  const REST_LEN = 200;
  const CENTER_G = 0.015;
  const DAMP     = 0.78;

  let alpha = 1.0;
  let frame = 0;
  let rafId: number;

  function tick() {
    alpha *= 0.990;
    const cx = width / 2;
    const cy = height / 2;

    for (let i = 0; i < n; i++) {
      let fx = 0;
      let fy = 0;

      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const dx = pos[i].x - pos[j].x;
        const dy = pos[i].y - pos[j].y;
        const dist2 = dx * dx + dy * dy + 1;
        const dist  = Math.sqrt(dist2);
        const str   = REPEL / dist2;
        fx += (dx / dist) * str;
        fy += (dy / dist) * str;
      }

      const nbrs = adjMap.get(nodeIds[i]) ?? [];
      for (const { target: j, score } of nbrs) {
        const dx = pos[j].x - pos[i].x;
        const dy = pos[j].y - pos[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
        const stretch = dist - REST_LEN * (1 - score * 0.4);
        fx += (dx / dist) * SPRING_K * stretch;
        fy += (dy / dist) * SPRING_K * stretch;
      }

      fx += (cx - pos[i].x) * CENTER_G;
      fy += (cy - pos[i].y) * CENTER_G;

      vel[i].x = (vel[i].x + fx * alpha) * DAMP;
      vel[i].y = (vel[i].y + fy * alpha) * DAMP;
      pos[i].x = Math.max(40, Math.min(width  - 40, pos[i].x + vel[i].x));
      pos[i].y = Math.max(40, Math.min(height - 40, pos[i].y + vel[i].y));
    }

    frame++;
    if (frame % 3 === 0) onTick([...pos.map((p) => ({ ...p }))], alpha);

    if (alpha > 0.01 && frame < 400) {
      rafId = requestAnimationFrame(tick);
    } else {
      onDone([...pos.map((p) => ({ ...p }))]);
    }
  }

  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId);
}

// ---------------------------------------------------------------------------
// Canvas renderer
// ---------------------------------------------------------------------------
const NODE_R     = 28;
const NODE_R_SEL = 38;
const NODE_R_HOV = 33;

function drawGraph(
  ctx: CanvasRenderingContext2D,
  vehicles: Vehicle[],
  edges: GraphEdge[],
  positions: Vec2[],
  idToIdx: Map<string, number>,
  selectedId: string | null,
  hoveredId: string | null
) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;

  ctx.save();
  ctx.clearRect(0, 0, W, H);

  // Dark graphite background
  ctx.fillStyle = "#0f0f12";
  ctx.fillRect(0, 0, W, H);

  // Subtle grid
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 1;
  const gridStep = 48;
  for (let x = 0; x < W; x += gridStep) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += gridStep) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Edges
  for (const e of edges) {
    const si = idToIdx.get(e.source);
    const ti = idToIdx.get(e.target);
    if (si == null || ti == null) continue;
    const sp = positions[si];
    const tp = positions[ti];
    if (!sp || !tp) continue;

    const isHighlighted =
      e.source === selectedId || e.target === selectedId ||
      e.source === hoveredId  || e.target === hoveredId;

    ctx.beginPath();
    ctx.moveTo(sp.x, sp.y);
    ctx.lineTo(tp.x, tp.y);

    if (isHighlighted) {
      ctx.strokeStyle = `rgba(220,38,38,${0.3 + e.score * 0.55})`;
      ctx.lineWidth   = 2 + e.score * 2.5;
    } else {
      ctx.strokeStyle = `rgba(200,200,210,${0.05 + e.score * 0.12})`;
      ctx.lineWidth   = 0.8 + e.score;
    }
    ctx.stroke();

    // Score label on highlighted edge
    if (isHighlighted) {
      const mx = (sp.x + tp.x) / 2;
      const my = (sp.y + tp.y) / 2;
      ctx.font      = "bold 10px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(220,38,38,0.85)";
      ctx.textAlign = "center";
      ctx.fillText(`${Math.round(e.score * 100)}%`, mx, my - 4);
    }
  }

  // Nodes (non-special first, then special on top)
  const specialIds = new Set([selectedId, hoveredId].filter(Boolean) as string[]);

  const drawNode = (v: Vehicle, i: number) => {
    const p = positions[i];
    if (!p) return;

    const isSel = v.id === selectedId;
    const isHov = v.id === hoveredId;
    const r     = isSel ? NODE_R_SEL : isHov ? NODE_R_HOV : NODE_R;
    const color = segmentColor(v.segment);

    // Glow ring for selected
    if (isSel) {
      const grad = ctx.createRadialGradient(p.x, p.y, r - 2, p.x, p.y, r + 18);
      grad.addColorStop(0, "rgba(220,38,38,0.35)");
      grad.addColorStop(1, "rgba(220,38,38,0)");
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 18, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Node circle
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = isSel ? "#dc2626" : color;
    ctx.fill();

    // Border ring
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = isSel
      ? "#f43f3f"
      : isHov
      ? "rgba(255,255,255,0.75)"
      : "rgba(255,255,255,0.22)";
    ctx.lineWidth = isSel ? 2.5 : 1.5;
    ctx.stroke();

    // Label — always show since node set is small
    const shortName = v.name.replace("Pinnacle ", "");
    ctx.font      = `${isSel ? "bold" : "600"} ${isSel ? 11 : 10}px 'Barlow Condensed', sans-serif`;
    ctx.fillStyle = isSel ? "#ffffff" : isHov ? "#ffffff" : "rgba(255,255,255,0.80)";
    ctx.textAlign = "center";
    ctx.fillText(shortName.toUpperCase(), p.x, p.y + r + 14);

    // Segment tag below name
    const segTag = v.segment[0].toUpperCase();
    ctx.font      = "9px 'JetBrains Mono', monospace";
    ctx.fillStyle = isSel ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)";
    ctx.fillText(segTag, p.x, p.y + r + 24);
  };

  vehicles.forEach((v, i) => { if (!specialIds.has(v.id)) drawNode(v, i); });
  vehicles.forEach((v, i) => { if (specialIds.has(v.id)) drawNode(v, i); });

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function RelatedVehiclesPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posRef    = useRef<Vec2[]>([]);
  const rafRef    = useRef<number>(0);
  const dragging  = useRef<{ startX: number; startY: number; tx: number; ty: number } | null>(null);

  const [positions,  setPositions]  = useState<Vec2[]>([]);
  const [simDone,    setSimDone]    = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId,  setHoveredId]  = useState<string | null>(null);
  const [transform,  setTransform]  = useState({ x: 0, y: 0, scale: 1 });
  const [size,       setSize]       = useState({ w: 900, h: 560 });

  const edges   = useMemo(() => allEdges(), []);
  const idToIdx = useMemo(() => new Map(VEHICLES.map((v, i) => [v.id, i])), []);
  const nodeIds = useMemo(() => VEHICLES.map((v) => v.id), []);

  // Canvas sizing
  useEffect(() => {
    function measure() {
      const el = canvasRef.current?.parentElement;
      if (el) setSize({ w: el.clientWidth, h: Math.min(el.clientWidth * 0.65, 560) });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Simulation
  useEffect(() => {
    if (size.w < 100) return;
    setSimDone(false);
    const cleanup = runSimulation(
      nodeIds, edges, size.w, size.h,
      (pos) => { posRef.current = pos; setPositions([...pos]); },
      (pos) => { posRef.current = pos; setPositions([...pos]); setSimDone(true); }
    );
    return cleanup;
  }, [nodeIds, edges, size.w, size.h]);

  // Render loop
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || posRef.current.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    canvas.width  = size.w * dpr;
    canvas.height = size.h * dpr;
    canvas.style.width  = `${size.w}px`;
    canvas.style.height = `${size.h}px`;
    ctx.scale(dpr, dpr);

    const logW = size.w;
    const logH = size.h;

    ctx.save();
    ctx.translate(transform.x + logW / 2, transform.y + logH / 2);
    ctx.scale(transform.scale, transform.scale);
    ctx.translate(-logW / 2, -logH / 2);

    drawGraph(ctx, VEHICLES, edges, posRef.current, idToIdx, selectedId, hoveredId);
    ctx.restore();
  }, [edges, idToIdx, selectedId, hoveredId, transform, size]);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    function loop() {
      renderFrame();
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [renderFrame, positions]);

  // Canvas → world coords
  function toWorld(clientX: number, clientY: number, canvas: HTMLCanvasElement): Vec2 {
    const rect = canvas.getBoundingClientRect();
    const lx = clientX - rect.left;
    const ly = clientY - rect.top;
    const cx = size.w / 2;
    const cy = size.h / 2;
    return {
      x: (lx - cx - transform.x) / transform.scale + cx,
      y: (ly - cy - transform.y) / transform.scale + cy,
    };
  }

  function nearestVehicle(wx: number, wy: number): Vehicle | null {
    let best: Vehicle | null = null;
    let bestDist = 42;
    posRef.current.forEach((p, i) => {
      if (!p) return;
      const d = Math.hypot(p.x - wx, p.y - wy);
      if (d < bestDist) { bestDist = d; best = VEHICLES[i]; }
    });
    return best;
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (dragging.current) {
      setTransform((t) => ({
        ...t,
        x: dragging.current!.tx + e.clientX - dragging.current!.startX,
        y: dragging.current!.ty + e.clientY - dragging.current!.startY,
      }));
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = toWorld(e.clientX, e.clientY, canvas);
    const v = nearestVehicle(x, y);
    setHoveredId(v?.id ?? null);
    canvas.style.cursor = v ? "pointer" : "grab";
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    dragging.current = { startX: e.clientX, startY: e.clientY, tx: transform.x, ty: transform.y };
  }

  function onMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    const moved = dragging.current
      ? Math.hypot(e.clientX - dragging.current.startX, e.clientY - dragging.current.startY) > 4
      : false;
    dragging.current = null;
    if (!moved) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { x, y } = toWorld(e.clientX, e.clientY, canvas);
      const v = nearestVehicle(x, y);
      setSelectedId(v?.id ?? null);
    }
  }

  function onWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.9;
    setTransform((t) => ({
      ...t,
      scale: Math.max(0.4, Math.min(5, t.scale * factor)),
    }));
  }

  const selected = selectedId ? VEHICLES.find((v) => v.id === selectedId) ?? null : null;
  const selectedNeighbors = selectedId ? relatedFor(selectedId) : [];

  // Segment legend
  const legendItems = [
    { label: "SUV / Midsize",    color: "#6b6b74" },
    { label: "Crossover",        color: "#059669" },
    { label: "EV Crossover",     color: "#2563eb" },
    { label: "Full-size Truck",  color: "#d97706" },
    { label: "Sedan",            color: "#7c3aed" },
    { label: "Flagship",         color: "#dc2626" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f5f0" }}>
      {/* Hero */}
      <div className="hero-bg text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="font-condensed text-[11px] tracking-[0.28em] text-racing-500 mb-2">
            Fleet Intelligence · Model Similarity
          </div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-wide">
            Related Vehicle Network
          </h1>
          <p className="mt-3 max-w-3xl text-graphite-300 leading-relaxed">
            Weighted Jaccard similarity across segment, powertrain, platform architecture,
            telematics-issue signature, fleet cohort, and region.
            Top-8 neighbors pre-computed from{" "}
            <span className="font-mono text-racing-500">gold.dim_vehicles</span> +{" "}
            <span className="font-mono text-racing-500">fct_telemetry_health_signals</span>.
            Drag to pan, scroll to zoom, click any node.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row" style={{ minHeight: `${size.h}px` }}>
        {/* Canvas */}
        <div className="flex-1 min-w-0 relative" style={{ background: "#0f0f12", minHeight: `${size.h}px` }}>
          <canvas
            ref={canvasRef}
            onMouseMove={onMouseMove}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={() => { setHoveredId(null); dragging.current = null; }}
            onWheel={onWheel}
            style={{ display: "block", cursor: "grab", userSelect: "none" }}
          />

          {!simDone && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30 animate-pulse">
                Calculating similarity graph...
              </p>
            </div>
          )}

          {/* Stats bar */}
          <div className="absolute top-3 left-3 font-mono text-[9px] uppercase tracking-[0.22em] text-white/30">
            {VEHICLES.length} nameplates &middot; {edges.length} similarity edges &middot;{" "}
            {simDone ? "settled" : "settling..."}
          </div>

          {/* Segment legend */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-x-4 gap-y-1.5 max-w-xs">
            {legendItems.map((item) => (
              <span key={item.label} className="flex items-center gap-1.5">
                <span
                  className="inline-block rounded-full flex-none"
                  style={{ width: 8, height: 8, background: item.color }}
                />
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
                  {item.label}
                </span>
              </span>
            ))}
          </div>

          {/* Interaction hint */}
          <div className="absolute top-3 right-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/25 text-right">
            Drag to pan &middot; scroll to zoom
          </div>
        </div>

        {/* Side panel */}
        <aside
          className="w-full lg:w-80 flex-none overflow-y-auto"
          style={{
            background: "#0f0f12",
            borderLeft: "1px solid rgba(255,255,255,0.07)",
            maxHeight: `${size.h + 80}px`,
          }}
        >
          {selected ? (
            <div className="p-5">
              {/* Vehicle header */}
              <div className="border-l-2 border-racing-600 pl-3 mb-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-racing-500">
                  Selected
                </p>
                <h2 className="font-display text-xl text-white mt-1 tracking-wide">
                  {selected.name.replace("Pinnacle ", "")}
                </h2>
                <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] mt-0.5">
                  {selected.modelYear} &middot; {selected.segment.join(", ")}
                </p>
              </div>

              {/* Dimension tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {selected.powertrain.map((pt) => (
                  <span
                    key={pt}
                    className="font-mono text-[9px] uppercase tracking-[0.15em] px-1.5 py-0.5"
                    style={{ border: "1px solid rgba(220,38,38,0.35)", color: "rgba(244,63,63,0.8)" }}
                  >
                    {pt.replace(/_/g, " ")}
                  </span>
                ))}
                {selected.platform.map((pl) => (
                  <span
                    key={pl}
                    className="font-mono text-[9px] uppercase tracking-[0.15em] px-1.5 py-0.5"
                    style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.45)" }}
                  >
                    {pl.replace(/_/g, " ")}
                  </span>
                ))}
              </div>

              {/* Top DTC signature */}
              {selected.telematicsIssues.length > 0 && (
                <div className="mb-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30 mb-1">
                    DTC Signature
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selected.telematicsIssues.map((dtc) => (
                      <span
                        key={dtc}
                        className="font-mono text-[9px] px-1.5 py-0.5"
                        style={{ background: "rgba(217,119,6,0.15)", color: "#d97706", border: "1px solid rgba(217,119,6,0.3)" }}
                      >
                        {dtc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Neighbors */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} className="pt-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/30 mb-2">
                  Nearest neighbors
                </p>
                <ol className="space-y-1">
                  {selectedNeighbors.map((nb) => (
                    <li key={nb.id}>
                      <button
                        onClick={() => setSelectedId(nb.id)}
                        className="w-full text-left px-2 py-2 transition"
                        style={{
                          borderLeft: "2px solid rgba(255,255,255,0.08)",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderLeftColor = "#dc2626";
                          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderLeftColor = "rgba(255,255,255,0.08)";
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                        }}
                      >
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="font-display text-sm text-white tracking-wide truncate">
                            {nb.vehicle.name.replace("Pinnacle ", "").toUpperCase()}
                          </span>
                          <span className="font-mono text-[10px] flex-none" style={{ color: "#dc2626" }}>
                            {Math.round(nb.score * 100)}%
                          </span>
                        </div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35 truncate mt-0.5">
                          {nb.why}
                        </p>
                        {nb.sharedTelematics.length > 0 && (
                          <p className="font-mono text-[9px] mt-0.5" style={{ color: "rgba(217,119,6,0.7)" }}>
                            DTC overlap: {nb.sharedTelematics.join(", ")}
                          </p>
                        )}
                      </button>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Navigation hint */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} className="mt-5 pt-4">
                <Link
                  to="/connected-car"
                  className="font-mono text-[9px] uppercase tracking-[0.25em] transition"
                  style={{ color: "rgba(220,38,38,0.7)", textDecoration: "none" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#dc2626"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(220,38,38,0.7)"; }}
                >
                  View telematics for this fleet
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-5 flex flex-col gap-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/30">
                Click any node to explore
              </p>
              <p className="text-sm text-white/45 leading-relaxed">
                Each node is a Pinnacle nameplate. Edges connect models with
                the highest weighted similarity across segment, powertrain,
                platform, telematics-issue signature, fleet cohort, and region.
                Stronger edges indicate higher cross-shop and recall-signal overlap.
              </p>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} className="pt-4 space-y-2">
                {VEHICLES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedId(v.id)}
                    className="w-full text-left px-3 py-2 font-display text-sm tracking-wide transition"
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(220,38,38,0.5)";
                      (e.currentTarget as HTMLElement).style.color = "#ffffff";
                      (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    {v.name.replace("Pinnacle ", "").toUpperCase()}
                    <span className="ml-2 font-mono text-[9px] text-white/30 normal-case tracking-normal">
                      {v.segment[0]}
                    </span>
                  </button>
                ))}
              </div>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/20 mt-2">
                {VEHICLES.length} nameplates &middot; {edges.length} similarity edges
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Methodology strip */}
      <div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 mb-12"
        style={{ marginTop: "1.5rem" }}
      >
        <div className="spec-card p-5">
          <div className="spec-card-header mb-4">
            <div className="spec-card-title">Similarity Methodology</div>
            <span className="layer-chip">gold.dim_vehicles + fct_telemetry_health_signals</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { dim: "Segment",    w: "1.4", note: "Body class + size tier" },
              { dim: "Powertrain", w: "1.2", note: "Engine, drive, fuel type" },
              { dim: "Platform",   w: "1.0", note: "Shared architecture code" },
              { dim: "Telematics", w: "0.8", note: "Common DTC signatures" },
              { dim: "Region",     w: "0.4", note: "Sales geography overlap" },
              { dim: "Fleet cohort",w:"0.4", note: "Rental / commercial / retail" },
            ].map((item) => (
              <div key={item.dim} className="text-center">
                <div className="font-readout text-2xl font-semibold" style={{ color: "#dc2626" }}>
                  {item.w}
                </div>
                <div className="font-condensed text-[10px] text-graphite-700 mt-0.5">{item.dim}</div>
                <div className="text-[10px] text-graphite-500 mt-0.5 leading-snug">{item.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Navigate to quality page for a specific model (future deep-link)
function _navigateToModel(_navigate: ReturnType<typeof useNavigate>, _vehicleId: string) {
  _navigate("/connected-car");
}
void _navigateToModel;
