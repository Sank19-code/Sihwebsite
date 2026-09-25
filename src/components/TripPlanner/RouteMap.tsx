import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { T } from '../../animations/transitions';
import type { IndianPlace } from '../../data/types';

/**
 * Stylised route drawing.
 *
 * A contour field with the day stops plotted on it and a line that draws
 * itself using stroke-dashoffset. Deliberately abstract rather than a road
 * map: the waypoints are indicative (see lib/itinerary.ts) and a real-looking
 * map would imply routing accuracy this prototype does not have.
 */
export function RouteMap({ place, route }: { place: IndianPlace; route: [number, number][] }) {
  const ref = useRef<SVGSVGElement>(null);

  // Fit the waypoints into the viewbox with a margin.
  const W = 640;
  const H = 260;
  const lats = route.map((r) => r[0]);
  const lons = route.map((r) => r[1]);
  const latMin = Math.min(...lats);
  const latMax = Math.max(...lats);
  const lonMin = Math.min(...lons);
  const lonMax = Math.max(...lons);
  const px = (lon: number) => 70 + ((lon - lonMin) / (lonMax - lonMin || 1)) * (W - 140);
  const py = (lat: number) => H - 55 - ((lat - latMin) / (latMax - latMin || 1)) * (H - 110);

  const points = route.map(([lat, lon]) => [px(lon), py(lat)] as const);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const path = svg.querySelector<SVGPathElement>('.route-line');
    if (!path) return;

    const len = path.getTotalLength();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        path,
        { strokeDasharray: len, strokeDashoffset: len },
        { strokeDashoffset: 0, duration: T.route, ease: T.easeInOut },
      );
      gsap.fromTo(
        '.route-stop',
        { scale: 0, opacity: 0, transformOrigin: 'center' },
        { scale: 1, opacity: 1, duration: 0.5, stagger: T.route / Math.max(1, points.length), ease: 'back.out(2.5)' },
      );
    }, svg);
    return () => ctx.revert();
  }, [d, points.length]);

  return (
    <div className="relative overflow-hidden border border-bone/10" style={{ background: place.palette.sky[0] }}>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
        {/* Contour field */}
        <g stroke={place.palette.glow} strokeOpacity="0.14" fill="none" strokeWidth="0.7">
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M -20 ${20 + i * 30} Q 160 ${i * 30} 320 ${26 + i * 30} T 660 ${14 + i * 30}`} />
          ))}
        </g>

        {/* Route */}
        <path className="route-line" d={d} fill="none" stroke="#E8833A" strokeWidth="1.2" strokeLinecap="round" />

        {points.map((p, i) => (
          <g key={i} className="route-stop">
            <circle cx={p[0]} cy={p[1]} r="9" fill="#E8833A" opacity="0.12" />
            <circle cx={p[0]} cy={p[1]} r="3" fill="#E8833A" />
            <text
              x={p[0]}
              y={p[1] - 16}
              textAnchor="middle"
              fill="#F2EEE7"
              fontSize="9"
              fontFamily="monospace"
              letterSpacing="1.5"
              opacity="0.8"
            >
              D{String(i + 1).padStart(2, '0')}
            </text>
          </g>
        ))}

        <text x="20" y={H - 16} fill="#F2EEE7" fontSize="8.5" fontFamily="monospace" letterSpacing="2" opacity="0.45">
          {place.name.toUpperCase()} · INDICATIVE ROUTE · NOT TO SCALE
        </text>
      </svg>
      <div className="grain pointer-events-none absolute inset-0" />
    </div>
  );
}
