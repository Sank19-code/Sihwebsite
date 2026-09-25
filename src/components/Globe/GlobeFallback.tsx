import { destinations } from '../../data/destinations';
import { useApp } from '../../store';

/**
 * Elegant no-WebGL fallback.
 *
 * A static SVG globe with the same graticule language and the same markers,
 * still fully clickable — so the entire product demo (twin reveal, story,
 * planner, locals) works on a machine with no WebGL at all.
 */
export function GlobeFallback() {
  const select = useApp((s) => s.select);
  const setHovered = useApp((s) => s.setHovered);
  const hoveredId = useApp((s) => s.hoveredId);

  // Orthographic projection of the front hemisphere, centred near 40°E.
  const project = (lat: number, lon: number) => {
    const l0 = 40;
    const phi = (lat * Math.PI) / 180;
    const lam = ((lon - l0) * Math.PI) / 180;
    const x = Math.cos(phi) * Math.sin(lam);
    const y = Math.sin(phi);
    const visible = Math.cos(phi) * Math.cos(lam) > 0;
    return { x: 200 + x * 160, y: 200 - y * 160, visible };
  };

  return (
    <div className="absolute inset-0 grid place-items-center">
      <svg viewBox="0 0 400 400" className="h-[min(78vw,78vh)] w-[min(78vw,78vh)]">
        <defs>
          <radialGradient id="fbAtmo" cx="50%" cy="50%" r="50%">
            <stop offset="72%" stopColor="#E8833A" stopOpacity="0" />
            <stop offset="93%" stopColor="#E8833A" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2F6F63" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="200" cy="200" r="190" fill="url(#fbAtmo)" />
        <circle cx="200" cy="200" r="160" fill="#07070A" stroke="#F2EEE7" strokeOpacity="0.22" />

        {/* Parallels */}
        {[-60, -30, 0, 30, 60].map((lat) => {
          const ry = Math.abs(160 * Math.cos((lat * Math.PI) / 180));
          const cy = 200 - Math.sin((lat * Math.PI) / 180) * 160;
          return <ellipse key={lat} cx="200" cy={cy} rx={ry} ry={ry * 0.18} fill="none" stroke="#F2EEE7" strokeOpacity="0.13" />;
        })}
        {/* Meridians */}
        {[0, 30, 60, 90, 120, 150].map((lon) => (
          <ellipse
            key={lon}
            cx="200"
            cy="200"
            rx={Math.abs(160 * Math.cos((lon * Math.PI) / 180))}
            ry="160"
            fill="none"
            stroke="#F2EEE7"
            strokeOpacity="0.13"
          />
        ))}

        {destinations.map((d) => {
          const p = project(d.coordinates[0], d.coordinates[1]);
          if (!p.visible) return null;
          const active = hoveredId === d.id;
          return (
            <g
              key={d.id}
              className="cursor-pointer"
              onMouseEnter={() => setHovered(d.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => select(d.id)}
            >
              <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
              <circle cx={p.x} cy={p.y} r={active ? 9 : 5} fill="#E8833A" opacity={active ? 0.25 : 0.18} />
              <circle cx={p.x} cy={p.y} r={active ? 3.4 : 2.2} fill="#E8833A" />
              {active && (
                <text x={p.x + 12} y={p.y + 3} fill="#F2EEE7" fontSize="9" fontFamily="monospace" letterSpacing="1.5">
                  {d.name.toUpperCase()}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <p className="tech absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        WEBGL UNAVAILABLE · STATIC GLOBE MODE · ALL DESTINATIONS STILL SELECTABLE
      </p>
    </div>
  );
}
