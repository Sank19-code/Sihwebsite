import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useApp, selectedDestination } from '../../store';
import { placeById } from '../../data/indianPlaces';
import { formatCoords } from '../../lib/geo';
import { T } from '../../animations/transitions';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { lockScroll, unlockScroll, scrollTo } from '../../hooks/useSmoothScroll';
import { Poster } from '../ui/Poster';

/**
 * ------------------------------------------------------------------
 * THE TRANSITION  —  dream destination → Indian twin
 * ------------------------------------------------------------------
 * Four beats, driven by one GSAP timeline:
 *
 *   01  the chosen destination is named, over a darkening globe
 *   02  the question:  "WHAT IF YOU DIDN'T HAVE TO GO THAT FAR?"
 *   03  a coordinate field resolves and the twin's marker ignites
 *   04  the Indian landscape rises and takes the frame
 *
 * The globe keeps flying behind this the whole time (the camera tween starts
 * in GlobeScene the moment `selectedId` changes), so beat 01 is genuinely a
 * camera move and not a cut to a picture of one.
 *
 * Scrolling is locked for the duration. ESC or the skip control exits early.
 */
export function TransitionOverlay() {
  const root = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const phase = useApp((s) => s.phase);
  const selectedId = useApp((s) => s.selectedId);
  const setPhase = useApp((s) => s.setPhase);
  const reduced = usePrefersReducedMotion();

  const dest = selectedDestination(selectedId);
  const twin = dest ? placeById(dest.twin) : null;
  const active = phase === 'transition' && Boolean(dest && twin);

  useEffect(() => {
    if (!active) return;
    lockScroll();

    const finish = () => {
      // The cleanup below releases the scroll lock; doing it here as well
      // would unbalance the lock counter.
      setPhase('revealed');
      requestAnimationFrame(() => scrollTo('#twin'));
    };

    const ctx = gsap.context(() => {
      const d = reduced ? 0.15 : T.transitionPanel;

      // Every beat starts hidden; the timeline turns them on in order.
      gsap.set(['.tx-2', '.tx-4'], { opacity: 0 });
      gsap.set(['.tx-1-sub', '.tx-4-sub', '.tx-3-label'], { opacity: 0 });
      gsap.set('.line-inner', { yPercent: 115 });
      gsap.set('.tx-pin', { scale: 0 });

      const tl = gsap.timeline({ onComplete: finish });
      timeline.current = tl;

      // --- beat 00: the veil closes over the globe -------------------------
      tl.fromTo('.tx-veil', { opacity: 0 }, { opacity: 1, duration: d * 0.6, ease: 'power2.inOut' });

      // --- beat 01: name the dream -----------------------------------------
      tl.fromTo(
        '.tx-1 .line-inner',
        { yPercent: 115 },
        { yPercent: 0, duration: d * 0.8, stagger: 0.07, ease: T.easeCine },
        '-=0.4',
      )
        .fromTo('.tx-1-sub', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: d * 0.6 }, '-=0.5')
        .to('.tx-1', { opacity: 0, y: -40, duration: d * 0.6, ease: 'power2.in' }, `+=${d * 0.85}`);

      // --- beat 02: the question -------------------------------------------
      tl.set('.tx-2', { opacity: 1 });
      tl.fromTo(
        '.tx-2 .line-inner',
        { yPercent: 115 },
        { yPercent: 0, duration: d * 0.75, stagger: 0.06, ease: T.easeCine },
        '-=0.2',
      ).to('.tx-2', { opacity: 0, duration: d * 0.5, ease: 'power2.in' }, `+=${d * 0.9}`);

      // --- beat 03: the coordinate field resolves, the twin ignites --------
      tl.fromTo('.tx-grid', { opacity: 0, scale: 1.15 }, { opacity: 1, scale: 1, duration: d, ease: 'expo.out' }, '-=0.3')
        .fromTo('.tx-crosshair', { scale: 3, opacity: 0 }, { scale: 1, opacity: 1, duration: d * 0.8, ease: 'expo.out' }, '-=0.7')
        .fromTo('.tx-pin', { scale: 0 }, { scale: 1, duration: d * 0.5, ease: 'back.out(3)' }, '-=0.35')
        .fromTo('.tx-3-label', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: d * 0.5, stagger: 0.08 }, '-=0.3')
        .to(['.tx-grid', '.tx-crosshair', '.tx-3-label'], { opacity: 0, duration: d * 0.5 }, `+=${d * 0.7}`);

      // --- beat 04: the landscape arrives ----------------------------------
      tl.set('.tx-4', { opacity: 1 });
      tl.fromTo('.tx-poster', { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: d * 1.1, ease: 'expo.out' }, '-=0.35')
        .fromTo(
          '.tx-4 .line-inner',
          { yPercent: 115 },
          { yPercent: 0, duration: d * 0.8, stagger: 0.07, ease: T.easeCine },
          '-=0.7',
        )
        .fromTo('.tx-4-sub', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: d * 0.6 }, '-=0.5')
        // Lift the whole overlay to reveal the real twin section underneath.
        .to(root.current, { opacity: 0, duration: d * 0.9, ease: 'power2.inOut' }, `+=${d * 0.9}`);
    }, root);

    // ESC skips straight to the twin section.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        timeline.current?.progress(1);
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      ctx.revert();
      unlockScroll();
    };
  }, [active, setPhase, reduced, selectedId]);

  if (!active || !dest || !twin) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[80] overflow-hidden">
      <div className="tx-veil absolute inset-0 bg-ink/95 backdrop-blur-sm" />

      {/* ---------------- beat 01 ---------------- */}
      <div className="tx-1 absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <div className="display text-[clamp(46px,11vw,170px)] text-bone">
          <span className="line-mask">
            <span className="line-inner block">{dest.name}</span>
          </span>
        </div>
        <div className="tx-1-sub mt-5">
          <div className="tech text-saffron">{dest.country}</div>
          <div className="tech mt-2">{formatCoords(dest.coordinates[0], dest.coordinates[1])}</div>
          <p className="mt-7 max-w-md text-[15px] text-muted">{dest.tagline}</p>
          <p className="mt-8 text-[13px] italic text-bone/70">Looking for this feeling?</p>
        </div>
      </div>

      {/* ---------------- beat 02 ---------------- */}
      <div className="tx-2 absolute inset-0 flex items-center justify-center px-6">
        <h2 className="display text-left text-[clamp(38px,8.5vw,124px)] leading-[0.88] text-bone">
          <span className="line-mask">
            <span className="line-inner block">What if</span>
          </span>
          <span className="line-mask">
            <span className="line-inner block">you didn&rsquo;t</span>
          </span>
          <span className="line-mask">
            <span className="line-inner block">have to go</span>
          </span>
          <span className="line-mask">
            <span className="line-inner block text-saffron">that far?</span>
          </span>
        </h2>
      </div>

      {/* ---------------- beat 03 ---------------- */}
      <div className="absolute inset-0 flex items-center justify-center">
        <TwinCoordinateField
          lat={twin.coordinates[0]}
          lon={twin.coordinates[1]}
          name={twin.name}
          state={twin.state}
        />
      </div>

      {/* ---------------- beat 04 ---------------- */}
      <div className="tx-poster absolute inset-0 opacity-0">
        <Poster terrain={twin.terrain} palette={twin.palette} className="h-full w-full" intensity={1.15} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/60" />
      </div>
      <div className="tx-4 absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <div className="tech mb-6 text-teal">Your Indian twin</div>
        <div className="display text-[clamp(46px,12vw,180px)] text-bone">
          <span className="line-mask">
            <span className="line-inner block">{twin.name}</span>
          </span>
        </div>
        <div className="tx-4-sub mt-5">
          <div className="tech text-saffron">{twin.state}, India</div>
          <p className="mt-6 text-[15px] text-bone/80">{twin.tagline}</p>
        </div>
      </div>

      {/* Skip */}
      <button
        onClick={() => timeline.current?.progress(1)}
        data-cursor="SKIP"
        className="tech absolute bottom-6 right-6 z-10 border border-bone/20 px-4 py-2 text-bone/60 transition-colors hover:border-saffron hover:text-bone"
      >
        Skip · ESC
      </button>
    </div>
  );
}

/**
 * Beat 03's visual: a coordinate field rather than a map outline.
 *
 * Deliberately not a drawn national border — a stylised silhouette would be
 * both cartographically wrong and needlessly fraught. A graticule with the
 * real latitude/longitude of the twin makes the same point and stays honest.
 */
function TwinCoordinateField({
  lat,
  lon,
  name,
  state,
}: {
  lat: number;
  lon: number;
  name: string;
  state: string;
}) {
  // India's bounding box, used as the frame.
  const LON_MIN = 67,
    LON_MAX = 98,
    LAT_MIN = 6,
    LAT_MAX = 36;
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * 100;
  const y = (1 - (lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 100;

  return (
    <div className="tx-grid relative aspect-[31/30] w-[min(78vw,560px)] opacity-0">
      {/* Graticule */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 16.6} x2="100" y2={i * 16.6} stroke="#F2EEE7" strokeOpacity="0.1" strokeWidth="0.2" />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`v${i}`} x1={i * 16.6} y1="0" x2={i * 16.6} y2="100" stroke="#F2EEE7" strokeOpacity="0.1" strokeWidth="0.2" />
        ))}
      </svg>

      {/* Crosshair on the twin */}
      <div className="tx-crosshair absolute inset-0">
        <div className="absolute h-px w-full bg-saffron/40" style={{ top: `${y}%` }} />
        <div className="absolute h-full w-px bg-saffron/40" style={{ left: `${x}%` }} />
      </div>

      {/* The pin itself */}
      <div className="tx-pin absolute" style={{ left: `${x}%`, top: `${y}%` }}>
        <span className="absolute -left-1.5 -top-1.5 block h-3 w-3 rounded-full bg-saffron" />
        <span className="absolute -left-5 -top-5 block h-10 w-10 animate-ping rounded-full border border-saffron/50" />
      </div>

      <div className="tx-3-label absolute -top-10 left-0 tech text-teal">India · 6°N – 36°N / 67°E – 98°E</div>
      <div
        className="tx-3-label absolute whitespace-nowrap"
        style={{ left: `calc(${x}% + 18px)`, top: `calc(${y}% - 10px)` }}
      >
        <div className="display text-[22px] text-bone">{name}</div>
        <div className="tech">{state}</div>
      </div>
      <div className="tx-3-label absolute -bottom-10 right-0 tech">{formatCoords(lat, lon)}</div>
    </div>
  );
}
