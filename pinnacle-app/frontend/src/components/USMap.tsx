// Lightweight US map — Albers-equal-area-ish projection of points only.
// Uses an SVG continental US outline rendered as a path. No tile layer dependency
// (so no external CSS at runtime, no map provider). Coordinates are projected with
// a simple equirectangular transform tuned to fit ContUS bbox into the viewBox.

import type { CSSProperties } from 'react';

const VIEW_W = 960;
const VIEW_H = 600;

// CONUS bbox
const LAT_MIN = 24.5, LAT_MAX = 49.4;
const LNG_MIN = -125.0, LNG_MAX = -66.9;

function project(lat: number, lng: number): [number, number] {
  // Equirectangular with a slight latitude scaling
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * VIEW_W;
  const y = VIEW_H - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * VIEW_H;
  return [x, y];
}

// Simple stylized CONUS silhouette path. Not a perfect cartographic outline —
// it's a schematic spec-sheet shape that conveys "US" without external GeoJSON.
const CONUS_PATH =
  'M50,300 L110,250 L160,205 L220,180 L290,160 L355,140 L420,120 L490,108 L555,112 L600,128 ' +
  'L640,150 L675,140 L720,135 L765,148 L800,170 L830,190 L860,212 L885,240 L900,275 L905,310 ' +
  'L890,345 L860,380 L825,420 L780,460 L735,485 L685,505 L630,520 L575,528 L520,532 L465,528 ' +
  'L410,520 L355,508 L300,490 L250,468 L205,440 L165,408 L130,372 L95,340 L70,318 Z';

interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  color?: string;
  size?: number;
  shape?: 'circle' | 'square';
  ring?: boolean;
}

interface Props {
  plants?: MapPoint[];
  dealers?: MapPoint[];
  highlightTop?: MapPoint[];
  className?: string;
  style?: CSSProperties;
  showLabels?: boolean;
}

export default function USMap({ plants = [], dealers = [], highlightTop = [], className = '', style, showLabels = true }: Props) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={className}
      style={style}
      role="img"
      aria-label="Map of plants and dealers across the United States"
    >
      <defs>
        <pattern id="usmap-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#27272a" strokeOpacity="0.08" strokeWidth="0.5" />
        </pattern>
      </defs>

      <rect width={VIEW_W} height={VIEW_H} fill="#fafafa" />
      <rect width={VIEW_W} height={VIEW_H} fill="url(#usmap-grid)" />

      <path d={CONUS_PATH} fill="#f4f4f5" stroke="#52525b" strokeWidth="1.25" strokeLinejoin="round" />

      {/* Dealers — small ticks */}
      {dealers.map((d) => {
        const [x, y] = project(d.lat, d.lng);
        const size = d.size ?? 2.2;
        return (
          <circle
            key={d.id}
            cx={x} cy={y}
            r={size}
            fill={d.color ?? '#52525b'}
            opacity={0.7}
          />
        );
      })}

      {/* Plants — bold red squares with rings */}
      {plants.map((p) => {
        const [x, y] = project(p.lat, p.lng);
        const size = p.size ?? 10;
        return (
          <g key={p.id}>
            <circle cx={x} cy={y} r={size + 6} fill="none" stroke="#dc2626" strokeWidth="1" opacity="0.3" />
            <rect
              x={x - size / 2}
              y={y - size / 2}
              width={size}
              height={size}
              fill="#dc2626"
              stroke="#18181b"
              strokeWidth="1.5"
            />
            {showLabels && p.label && (
              <text
                x={x + size}
                y={y - size}
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="600"
                fill="#18181b"
              >
                {p.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Highlighted top dealers */}
      {highlightTop.map((d) => {
        const [x, y] = project(d.lat, d.lng);
        return (
          <g key={d.id}>
            <circle cx={x} cy={y} r="6" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
            {showLabels && d.label && (
              <text x={x + 9} y={y + 3} fontSize="10" fontFamily="Inter, sans-serif" fontWeight="600" fill="#2563eb">
                {d.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Legend */}
      <g transform={`translate(20, ${VIEW_H - 90})`}>
        <rect width="220" height="76" fill="#ffffff" stroke="#e4e4e7" />
        <text x="12" y="20" fontSize="10" fontFamily="JetBrains Mono, monospace" fontWeight="700" fill="#18181b" letterSpacing="1.5">
          NETWORK MAP
        </text>
        <rect x="12" y="32" width="10" height="10" fill="#dc2626" stroke="#18181b" strokeWidth="1" />
        <text x="28" y="41" fontSize="11" fontFamily="Inter, sans-serif" fill="#27272a">Assembly plant</text>
        <circle cx="17" cy="58" r="4" fill="#2563eb" stroke="#fff" strokeWidth="1" />
        <text x="28" y="62" fontSize="11" fontFamily="Inter, sans-serif" fill="#27272a">Top-tier dealer</text>
      </g>
    </svg>
  );
}
