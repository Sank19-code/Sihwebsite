import { useMemo } from 'react';
import type { Badge, BadgeFrame, BadgeMotif } from '../../data/badges';

/**
 * ------------------------------------------------------------------
 * PROCEDURAL BADGE MEDALLION
 * ------------------------------------------------------------------
 * Same principle as <Poster>: drawn, not fetched. A badge is a frame
 * silhouette + a landform/craft motif + a hairline rule, so eighteen badges
 * cost eighteen data rows rather than eighteen PNGs.
 *
 * Locked badges render the identical geometry desaturated behind a lock, so
 * the traveller can see the shape of what they have not earned yet.
 */

interface BadgeArtProps {
  badge: Badge;
  size?: number;
  locked?: boolean;
  /** Adds the slow idle float used in the passport grid. */
  float?: boolean;
  className?: string;
}

/** Outer silhouette paths, all drawn inside a 100×100 box. */
function framePath(frame: BadgeFrame): string {
  switch (frame) {
    case 'hex':
      return 'M50 4 L88 26 L88 74 L50 96 L12 74 L12 26 Z';
    case 'shield':
      return 'M50 4 L90 18 V54 C90 74 72 88 50 96 C28 88 10 74 10 54 V18 Z';
    case 'diamond':
      return 'M50 3 L97 50 L50 97 L3 50 Z';
    case 'arch':
      return 'M18 96 V44 C18 24 32 8 50 8 C68 8 82 24 82 44 V96 Z';
    case 'disc':
    default:
      return 'M50 5 A45 45 0 1 1 49.9 5 Z';
  }
}

/** Inner motif, clipped by the frame. */
function motifPaths(motif: BadgeMotif): { d: string; opacity: number; stroke?: boolean }[] {
  switch (motif) {
    case 'peaks':
      return [
        { d: 'M14 74 L34 42 L46 58 L60 34 L86 74 Z', opacity: 1 },
        { d: 'M28 50 L34 42 L40 50 Z', opacity: 0.45 },
        { d: 'M54 44 L60 34 L67 46 Z', opacity: 0.45 },
      ];
    case 'cliff':
      return [
        { d: 'M12 74 V40 H44 L52 50 H64 L78 74 Z', opacity: 1 },
        { d: 'M12 74 H88', opacity: 0.5, stroke: true },
        { d: 'M56 62 H88', opacity: 0.32, stroke: true },
      ];
    case 'boulders':
      return [
        { d: 'M22 74 a13 13 0 0 1 26 0 Z', opacity: 1 },
        { d: 'M44 74 a17 15 0 0 1 34 0 Z', opacity: 0.85 },
        { d: 'M36 52 a9 8 0 0 1 18 0 Z', opacity: 0.6 },
      ];
    case 'canyon':
      return [
        { d: 'M12 74 V34 L38 40 L44 74 Z', opacity: 1 },
        { d: 'M88 74 V32 L62 39 L56 74 Z', opacity: 1 },
        { d: 'M44 74 L50 56 L56 74 Z', opacity: 0.5 },
      ];
    case 'water':
      return [
        { d: 'M14 58 q12 -7 24 0 t24 0 t24 0', opacity: 0.8, stroke: true },
        { d: 'M14 68 q12 -7 24 0 t24 0 t24 0', opacity: 0.6, stroke: true },
        { d: 'M14 78 q12 -7 24 0 t24 0 t24 0', opacity: 0.4, stroke: true },
        { d: 'M50 24 a9 9 0 1 1 -0.1 0 Z', opacity: 0.9 },
      ];
    case 'caves':
      return [
        { d: 'M14 78 V38 H86 V78 Z', opacity: 0.9 },
        { d: 'M26 78 V60 a8 8 0 0 1 16 0 V78 Z', opacity: 0, stroke: false },
        { d: 'M30 78 V60 a6 6 0 0 1 12 0 V78 Z', opacity: 1, stroke: true },
        { d: 'M58 78 V60 a6 6 0 0 1 12 0 V78 Z', opacity: 1, stroke: true },
      ];
    case 'island':
      return [
        { d: 'M28 62 q22 -22 44 0 Z', opacity: 1 },
        { d: 'M12 68 q38 -8 76 0', opacity: 0.7, stroke: true },
        { d: 'M12 78 q38 -8 76 0', opacity: 0.45, stroke: true },
      ];
    case 'plateau':
      return [
        { d: 'M14 74 V50 H40 L46 44 H70 L86 74 Z', opacity: 1 },
        { d: 'M14 62 H86', opacity: 0.35, stroke: true },
        { d: 'M50 26 a7 7 0 1 1 -0.1 0 Z', opacity: 0.8 },
      ];
    case 'colonial':
      return [
        { d: 'M22 78 V50 a10 10 0 0 1 20 0 V78 Z', opacity: 1, stroke: true },
        { d: 'M50 78 V50 a10 10 0 0 1 20 0 V78 Z', opacity: 1, stroke: true },
        { d: 'M16 80 H84', opacity: 0.8, stroke: true },
        { d: 'M18 42 H82', opacity: 0.6, stroke: true },
      ];
    case 'valley':
      return [
        { d: 'M10 78 L34 44 L50 66 L66 40 L90 78 Z', opacity: 0.95 },
        { d: 'M28 78 q22 -16 44 0', opacity: 0.55, stroke: true },
      ];
    case 'leaf':
      return [
        { d: 'M50 22 C72 34 72 62 50 80 C28 62 28 34 50 22 Z', opacity: 1 },
        { d: 'M50 26 V78', opacity: 0.5, stroke: true },
        { d: 'M50 44 L64 38 M50 56 L64 50 M50 44 L36 38 M50 56 L36 50', opacity: 0.4, stroke: true },
      ];
    case 'flame':
      return [{ d: 'M50 20 C62 38 74 44 66 62 C60 76 40 78 34 62 C28 46 44 42 50 20 Z', opacity: 1 }];
    case 'bowl':
      return [
        { d: 'M22 52 h56 a28 28 0 0 1 -56 0 Z', opacity: 1 },
        { d: 'M18 52 H82', opacity: 0.7, stroke: true },
        { d: 'M40 36 q4 -8 0 -14 M52 34 q4 -10 0 -18 M64 36 q4 -8 0 -14', opacity: 0.55, stroke: true },
      ];
    case 'quill':
      return [
        { d: 'M28 78 C40 52 56 32 76 22 C74 46 62 66 40 76 Z', opacity: 1 },
        { d: 'M28 78 L58 46', opacity: 0.5, stroke: true },
      ];
    case 'people':
      return [
        { d: 'M36 44 a8 8 0 1 1 -0.1 0 Z M22 78 v-8 a14 14 0 0 1 28 0 v8 Z', opacity: 1 },
        { d: 'M64 40 a7 7 0 1 1 -0.1 0 Z M52 78 v-9 a12 12 0 0 1 24 0 v9 Z', opacity: 0.65 },
      ];
    default:
      return [{ d: 'M50 28 a22 22 0 1 1 -0.1 0 Z', opacity: 1 }];
  }
}

export function BadgeArt({ badge, size = 120, locked = false, float = false, className = '' }: BadgeArtProps) {
  const uid = useMemo(() => `b${badge.id.replace(/[^a-z0-9]/gi, '')}`, [badge.id]);
  const motif = useMemo(() => motifPaths(badge.motif), [badge.motif]);
  const frame = framePath(badge.frame);

  const [c1, c2] = locked ? ['#3A3A3D', '#54545A'] : badge.ink;

  return (
    <div
      className={`relative ${float ? 'badge-float' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`${badge.name} badge`}>
        <defs>
          <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor={c2} />
            <stop offset="100%" stopColor={c1} />
          </linearGradient>
          <radialGradient id={`${uid}-glow`} cx="50%" cy="38%" r="60%">
            <stop offset="0%" stopColor={c2} stopOpacity={locked ? 0.1 : 0.55} />
            <stop offset="100%" stopColor={c2} stopOpacity="0" />
          </radialGradient>
          <clipPath id={`${uid}-clip`}>
            <path d={frame} />
          </clipPath>
        </defs>

        {/* Glow behind the medallion. */}
        <rect width="100" height="100" fill={`url(#${uid}-glow)`} />

        {/* Medallion body. */}
        <path d={frame} fill="#0B0B0C" stroke={`url(#${uid}-fill)`} strokeWidth="1.6" />

        <g clipPath={`url(#${uid}-clip)`} opacity={locked ? 0.28 : 1}>
          {/* Horizon wash inside the frame. */}
          <rect x="0" y="44" width="100" height="56" fill={c1} opacity="0.12" />

          {/* Contour hairlines — the cartographic thread shared with the globe. */}
          <g stroke={c2} strokeWidth="0.4" fill="none" opacity="0.28">
            {[0, 1, 2, 3].map((i) => (
              <path key={i} d={`M0 ${30 + i * 16} q25 -6 50 0 t50 0`} />
            ))}
          </g>

          {motif.map((m, i) =>
            m.stroke ? (
              <path
                key={i}
                d={m.d}
                fill="none"
                stroke={c2}
                strokeWidth="1.7"
                strokeLinecap="round"
                opacity={m.opacity}
              />
            ) : (
              <path key={i} d={m.d} fill={c1} opacity={m.opacity} />
            ),
          )}
        </g>

        {/* Inner hairline, the "struck metal" edge. */}
        <path d={frame} fill="none" stroke={c2} strokeWidth="0.5" opacity={locked ? 0.25 : 0.6} transform="translate(50 50) scale(0.88) translate(-50 -50)" />
      </svg>

      {locked && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <svg width={size * 0.22} height={size * 0.22} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="4" y="10" width="16" height="11" rx="1.5" stroke="#8B8782" strokeWidth="1.6" />
            <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="#8B8782" strokeWidth="1.6" />
          </svg>
        </div>
      )}
    </div>
  );
}
