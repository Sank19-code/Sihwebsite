import { useMemo } from 'react';
import type { Palette, Terrain } from '../../data/types';

/**
 * ------------------------------------------------------------------
 * PROCEDURAL POSTER
 * ------------------------------------------------------------------
 * Every "photograph" in this prototype is drawn, not fetched.
 *
 * Reasons: no broken image requests, no licensing questions on a hackathon
 * submission, no megabytes of JPEG, and a single palette per place keeps the
 * whole site colour-coherent. Each poster is layered silhouettes over a sky
 * gradient, with a light source, contour lines and grain.
 *
 * Swap this component for <img> tags later — every caller passes only
 * `terrain` + `palette`, so the interface stays the same.
 */

interface PosterProps {
  terrain: Terrain;
  palette: Palette;
  /** Vertical parallax offset in px, driven by scroll where used. */
  offset?: number;
  className?: string;
  /** Multiplier on the light source size — the twin hero uses a bigger sun. */
  intensity?: number;
}

/** Deterministic pseudo-random so a given place always draws identically. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** Builds the stacked silhouette paths for a terrain type. */
function buildLayers(terrain: Terrain): { d: string; opacity: number; y: number }[] {
  const W = 1000;
  const H = 600;
  const r = rng(terrain.length * 9973 + terrain.charCodeAt(0) * 131);

  const ridge = (baseY: number, amp: number, steps: number, sharp: boolean) => {
    const pts: string[] = [`M -40 ${H + 40}`, `L -40 ${baseY}`];
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * (W + 80) - 40;
      const y = baseY - Math.abs(Math.sin(i * 1.7 + r() * 2)) * amp * (sharp ? 1 : 0.55);
      pts.push(sharp ? `L ${x.toFixed(1)} ${y.toFixed(1)}` : `Q ${(x - 20).toFixed(1)} ${(y - 8).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    pts.push(`L ${W + 40} ${H + 40} Z`);
    return pts.join(' ');
  };

  switch (terrain) {
    case 'peaks':
      return [
        { d: ridge(400, 210, 7, true), opacity: 0.55, y: 0 },
        { d: ridge(455, 150, 9, true), opacity: 0.78, y: 0 },
        { d: ridge(515, 90, 11, true), opacity: 1, y: 0 },
      ];
    case 'cliff':
      // A hard vertical edge dropping into water on the right.
      return [
        { d: `M -40 ${H + 40} L -40 300 L 210 296 L 250 320 L 430 316 L 470 352 L 640 470 L 660 ${H + 40} Z`, opacity: 0.6, y: 0 },
        { d: `M -40 ${H + 40} L -40 372 L 180 368 L 300 392 L 470 400 L 560 500 L 585 ${H + 40} Z`, opacity: 0.85, y: 0 },
        { d: `M -40 ${H + 40} L -40 470 L 260 466 L 420 496 L 500 ${H + 40} Z`, opacity: 1, y: 0 },
      ];
    case 'canyon':
      // Two facing walls with a gap of sky between them.
      return [
        { d: `M -40 ${H + 40} L -40 250 L 300 268 L 390 420 L 430 ${H + 40} Z`, opacity: 0.75, y: 0 },
        { d: `M ${W + 40} ${H + 40} L ${W + 40} 232 L 700 256 L 590 430 L 560 ${H + 40} Z`, opacity: 0.75, y: 0 },
        { d: `M -40 ${H + 40} L -40 430 L 380 470 L 620 468 L ${W + 40} 424 L ${W + 40} ${H + 40} Z`, opacity: 1, y: 0 },
      ];
    case 'boulders': {
      const blobs: string[] = [];
      for (let i = 0; i < 9; i++) {
        const cx = 60 + i * 110 + r() * 40;
        const cy = 430 + r() * 70;
        const rx = 60 + r() * 70;
        const ry = 45 + r() * 45;
        blobs.push(`M ${cx - rx} ${cy + ry} a ${rx} ${ry} 0 1 1 ${rx * 2} 0 Z`);
      }
      return [
        { d: ridge(420, 60, 8, false), opacity: 0.45, y: 0 },
        { d: blobs.slice(0, 5).join(' '), opacity: 0.8, y: 0 },
        { d: blobs.slice(5).join(' ') + ` M -40 520 L ${W + 40} 500 L ${W + 40} ${H + 40} L -40 ${H + 40} Z`, opacity: 1, y: 0 },
      ];
    }
    case 'water':
      return [
        { d: ridge(430, 30, 6, false), opacity: 0.4, y: 0 },
        // Palm/mangrove edge suggested with thin verticals.
        { d: `M -40 ${H + 40} L -40 468 L 1040 452 L 1040 ${H + 40} Z`, opacity: 0.9, y: 0 },
        { d: `M -40 ${H + 40} L -40 540 L 1040 524 L 1040 ${H + 40} Z`, opacity: 1, y: 0 },
      ];
    case 'island':
      return [
        { d: `M 250 470 Q 500 330 760 470 Z`, opacity: 0.7, y: 0 },
        { d: `M -40 ${H + 40} L -40 476 Q 500 440 1040 472 L 1040 ${H + 40} Z`, opacity: 0.92, y: 0 },
        { d: `M -40 ${H + 40} L -40 548 Q 500 520 1040 544 L 1040 ${H + 40} Z`, opacity: 1, y: 0 },
      ];
    case 'caves':
      // Rock face pierced by arched openings.
      return [
        { d: ridge(300, 60, 5, false), opacity: 0.5, y: 0 },
        {
          d:
            `M -40 ${H + 40} L -40 340 L 1040 320 L 1040 ${H + 40} Z ` +
            [0, 1, 2, 3].map((i) => {
              const x = 170 + i * 200;
              return `M ${x} ${H + 40} L ${x} 470 Q ${x + 45} 396 ${x + 90} 470 L ${x + 90} ${H + 40} Z`;
            }).join(' '),
          opacity: 1,
          y: 0,
        },
      ];
    case 'plateau':
      return [
        { d: ridge(360, 120, 6, true), opacity: 0.5, y: 0 },
        { d: `M -40 ${H + 40} L -40 452 L 300 430 L 340 452 L 700 440 L 740 462 L 1040 444 L 1040 ${H + 40} Z`, opacity: 0.85, y: 0 },
        { d: `M -40 ${H + 40} L -40 522 L 1040 508 L 1040 ${H + 40} Z`, opacity: 1, y: 0 },
      ];
    case 'valley':
      return [
        { d: ridge(350, 110, 6, false), opacity: 0.45, y: 0 },
        { d: ridge(430, 80, 8, false), opacity: 0.72, y: 0 },
        { d: `M -40 ${H + 40} L -40 500 Q 500 440 1040 496 L 1040 ${H + 40} Z`, opacity: 1, y: 0 },
      ];
    case 'colonial': {
      // A colonnade: repeated arches on a plinth.
      const arches = [0, 1, 2, 3, 4, 5].map((i) => {
        const x = 40 + i * 160;
        return `M ${x} 520 L ${x} 420 Q ${x + 55} 350 ${x + 110} 420 L ${x + 110} 520 Z`;
      });
      return [
        { d: ridge(390, 24, 5, false), opacity: 0.35, y: 0 },
        { d: arches.join(' '), opacity: 0.9, y: 0 },
        { d: `M -40 ${H + 40} L -40 518 L 1040 518 L 1040 ${H + 40} Z`, opacity: 1, y: 0 },
      ];
    }
    default:
      return [{ d: ridge(440, 70, 8, false), opacity: 1, y: 0 }];
  }
}

export function Poster({ terrain, palette, offset = 0, className = '', intensity = 1 }: PosterProps) {
  const layers = useMemo(() => buildLayers(terrain), [terrain]);
  const uid = useMemo(() => `p${Math.random().toString(36).slice(2, 8)}`, []);

  // The inner artwork is absolutely positioned, so the root must establish a
  // containing block — unless the caller already positions it themselves.
  // Emitting `relative` unconditionally would beat the caller's `absolute`
  // in Tailwind's cascade order and collapse the poster to zero height.
  const positioned = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className) ? '' : 'relative';
  const sunY = terrain === 'water' || terrain === 'island' || terrain === 'cliff' ? 400 : 330;

  return (
    <div className={`${positioned} overflow-hidden ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        style={{ transform: `translate3d(0, ${offset}px, 0) scale(1.12)` }}
      >
        <defs>
          <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.sky[0]} />
            <stop offset="62%" stopColor={palette.sky[0]} />
            <stop offset="100%" stopColor={palette.sky[1]} />
          </linearGradient>
          <radialGradient id={`${uid}-sun`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={palette.glow} stopOpacity="0.95" />
            <stop offset="45%" stopColor={palette.glow} stopOpacity="0.28" />
            <stop offset="100%" stopColor={palette.glow} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${uid}-vignette`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#050505" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#050505" stopOpacity="0" />
            <stop offset="100%" stopColor="#050505" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        <rect width="1000" height="600" fill={`url(#${uid}-sky)`} />

        {/* Light source — sun or moon depending on the palette warmth. */}
        <circle cx="640" cy={sunY} r={220 * intensity} fill={`url(#${uid}-sun)`} />
        <circle cx="640" cy={sunY} r={26 * intensity} fill={palette.glow} opacity="0.85" />

        {/* Topographic contour lines: the cartographic layer of the identity. */}
        <g stroke={palette.glow} strokeWidth="0.6" fill="none" opacity="0.13">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M -40 ${200 + i * 52} Q 250 ${170 + i * 52} 500 ${205 + i * 52} T 1040 ${188 + i * 52}`} />
          ))}
        </g>

        {/* Terrain silhouettes, back to front. */}
        {layers.map((l, i) => (
          <path key={i} d={l.d} fill={palette.land} opacity={l.opacity} />
        ))}

        {/* Reflection for water-type scenes. */}
        {(terrain === 'water' || terrain === 'island') && (
          <g opacity="0.3">
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={560 + i * 7} y={470 + i * 18} width={160 - i * 24} height="2" fill={palette.glow} />
            ))}
          </g>
        )}

        <rect width="1000" height="600" fill={`url(#${uid}-vignette)`} />
      </svg>

      {/* Grain sits above the artwork, below any text. */}
      <div className="grain pointer-events-none absolute inset-0" />
    </div>
  );
}
