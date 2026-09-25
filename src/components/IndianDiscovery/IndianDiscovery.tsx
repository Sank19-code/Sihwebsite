import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { indianPlaces } from '../../data/indianPlaces';
import { destinations } from '../../data/destinations';
import { formatCoords, projectIndia } from '../../lib/geo';
import { revealLines, riseIn } from '../../animations/transitions';
import { useApp } from '../../store';
import { scrollTo } from '../../hooks/useSmoothScroll';
import { Poster } from '../ui/Poster';
import { useHasHover } from '../../hooks/useHasHover';

/**
 * DISCOVER MORE INDIA
 *
 * The second map moment. Indian places are plotted on a coordinate field by
 * their real latitude and longitude — deliberately a graticule rather than a
 * drawn national outline, which would be both inaccurate at this scale and
 * unnecessary to make the point.
 *
 * Clicking a place runs the reveal backwards: it finds the dream destination
 * that maps to it and replays the whole cinematic for that pairing, so the
 * entire page below re-composes around the new choice.
 */
export function IndianDiscovery() {
  const root = useRef<HTMLDivElement>(null);
  const hasHover = useHasHover();
  // On touch devices there is no hover, so the first place is previewed by
  // default and a tap selects rather than immediately opening the twin.
  const [hovered, setHovered] = useState<string | null>(null);
  const select = useApp((s) => s.select);

  useEffect(() => {
    if (!hasHover) setHovered((cur) => cur ?? indianPlaces[0].id);
  }, [hasHover]);

  const W = 520;
  const H = 500;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scope = root.current!;
      revealLines(scope.querySelector('.id-title') as HTMLElement, { trigger: scope, start: 'top 72%' });
      riseIn('.id-meta', { trigger: scope, start: 'top 68%', stagger: 0.08 });

      // Markers ignite one by one as the field comes into view.
      gsap.fromTo(
        '.id-pin',
        { scale: 0, opacity: 0, transformOrigin: 'center' },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          stagger: 0.07,
          ease: 'back.out(2.2)',
          scrollTrigger: { trigger: scope, start: 'top 62%', once: true },
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  const active = indianPlaces.find((p) => p.id === hovered) ?? null;

  const openPlace = (placeId: string) => {
    const source = destinations.find((d) => d.twin === placeId);
    if (!source) return;
    select(source.id);
    scrollTo(0);
  };

  return (
    <section
      id="india"
      ref={root}
      className="contours relative z-20 border-t border-bone/10 bg-ink px-5 py-24 md:px-8 md:py-36"
    >
      <div className="mx-auto max-w-6xl">
        <div className="tech mb-8 text-teal">Discover more India</div>
        <h2 className="id-title display max-w-5xl text-[clamp(26px,7vw,110px)] text-bone">
          <span className="line-mask">
            <span className="line-inner block">There&rsquo;s more India</span>
          </span>
          <span className="line-mask">
            <span className="line-inner block text-muted-2">than the places</span>
          </span>
          <span className="line-mask">
            <span className="line-inner block text-muted-2">you already know.</span>
          </span>
        </h2>

        <div className="mt-20 grid gap-14 lg:grid-cols-[minmax(0,540px),1fr] lg:gap-20">
          {/* ---------------- Coordinate field ---------------- */}
          <div className="id-meta relative">
            {/* The viewBox is wider than the projection so the labels on the
                  eastern edge stay inside the frame instead of overflowing the page. */}
            <svg viewBox={`0 0 ${W + 110} ${H}`} className="h-auto w-full">
              {/* Graticule */}
              {Array.from({ length: 7 }, (_, i) => (
                <line
                  key={`h${i}`}
                  x1="0"
                  y1={(i / 6) * H}
                  x2={W}
                  y2={(i / 6) * H}
                  stroke="#F2EEE7"
                  strokeOpacity="0.08"
                  strokeWidth="0.6"
                />
              ))}
              {Array.from({ length: 7 }, (_, i) => (
                <line
                  key={`v${i}`}
                  x1={(i / 6) * W}
                  y1="0"
                  x2={(i / 6) * W}
                  y2={H}
                  stroke="#F2EEE7"
                  strokeOpacity="0.08"
                  strokeWidth="0.6"
                />
              ))}

              {indianPlaces.map((p) => {
                const [x, y] = projectIndia(p.coordinates[0], p.coordinates[1], W, H);
                const on = hovered === p.id;
                return (
                  <g
                    key={p.id}
                    className="id-pin cursor-pointer"
                    onMouseEnter={() => hasHover && setHovered(p.id)}
                    onMouseLeave={() => hasHover && setHovered(null)}
                    onClick={() => (hasHover ? openPlace(p.id) : setHovered(p.id))}
                  >
                    <circle cx={x} cy={y} r="18" fill="transparent" />
                    <circle cx={x} cy={y} r={on ? 14 : 8} fill="#2F6F63" opacity={on ? 0.3 : 0.15}>
                      {!on && (
                        <animate attributeName="r" values="7;12;7" dur="3.5s" repeatCount="indefinite" />
                      )}
                    </circle>
                    <circle cx={x} cy={y} r={on ? 4 : 2.6} fill={on ? '#E8833A' : '#2F6F63'} />
                    <text
                      x={x + 12}
                      y={y + 3.5}
                      fill="#F2EEE7"
                      fontSize="9"
                      fontFamily="monospace"
                      letterSpacing="1.6"
                      opacity={on ? 0.95 : 0.4}
                    >
                      {p.name.toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="tech mt-6 flex justify-between">
              <span>6°N – 36°N</span>
              <span>{indianPlaces.length} places · prototype set</span>
              <span>67°E – 98°E</span>
            </div>
          </div>

          {/* ---------------- Hover preview ---------------- */}
          <div className="id-meta">
            {active ? (
              <div key={active.id} className="animate-[fadeIn_.5s_cubic-bezier(0.16,1,0.3,1)]">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Poster terrain={active.terrain} palette={active.palette} className="h-full w-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
                </div>
                <div className="mt-7">
                  <h3 className="display text-[clamp(30px,4.6vw,60px)] text-bone">{active.name}</h3>
                  <div className="tech mt-2 text-saffron">{active.state}</div>
                  <p className="display mt-6 text-[clamp(18px,2.2vw,28px)] leading-tight text-bone/80">
                    {active.feelingOf}
                  </p>
                  <p className="mt-5 max-w-md text-[13.5px] leading-relaxed text-muted">{active.why}</p>
                  <div className="tech mt-7 flex flex-wrap gap-x-8 gap-y-2">
                    <span>{formatCoords(active.coordinates[0], active.coordinates[1])}</span>
                    <span className="text-bone">{active.bestSeason}</span>
                    <span>{active.budget}</span>
                  </div>
                  <button
                    onClick={() => openPlace(active.id)}
                    data-cursor="OPEN"
                    className="tech mt-8 border border-bone/25 px-6 py-3 text-bone transition-colors duration-500 hover:border-saffron hover:text-saffron"
                  >
                    Open this twin →
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[280px] items-center">
                <p className="display max-w-sm text-[clamp(20px,2.6vw,34px)] leading-tight text-muted-2">
                  {hasHover ? 'Hover' : 'Tap'} a marker.
                  <br />
                  Every one of them is somebody&rsquo;s
                  <br />
                  bucket-list photograph.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
