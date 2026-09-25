import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useApp, selectedDestination } from '../../store';
import { placeById } from '../../data/indianPlaces';
import { formatCoords } from '../../lib/geo';
import { revealLines, riseIn } from '../../animations/transitions';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { Poster } from '../ui/Poster';
import { MatchVisualization } from '../MatchVisualization/MatchVisualization';
import { scrollTo } from '../../hooks/useSmoothScroll';
import { navigate } from '../../router';

gsap.registerPlugin(ScrollTrigger);

/**
 * THE TWIN REVEAL  —  the Indian destination presented as the hero.
 *
 * Structure: a full-bleed procedural landscape with parallax, the name at
 * display size, floating metadata, the "why it matches" paragraph, and then
 * the match visualisation.
 *
 * Before anything is selected this section becomes an invitation back to the
 * globe rather than an empty frame, so the page never looks broken.
 */
export function TwinReveal() {
  const root = useRef<HTMLDivElement>(null);
  const selectedId = useApp((s) => s.selectedId);
  const clearSelection = useApp((s) => s.clearSelection);
  const dest = selectedDestination(selectedId);
  const twin = dest ? placeById(dest.twin) : null;
  const reduced = usePrefersReducedMotion();
  const [parallax, setParallax] = useState(0);

  /* Poster parallax — transform only, so it stays on the compositor. */
  useEffect(() => {
    if (!twin || reduced) return;
    const el = root.current;
    if (!el) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => setParallax((self.progress - 0.5) * 140),
    });
    return () => st.kill();
  }, [twin, reduced]);

  /* Content reveals */
  useEffect(() => {
    if (!twin) return;
    const ctx = gsap.context(() => {
      const scope = root.current!;
      revealLines(scope.querySelector('.tw-name') as HTMLElement, { trigger: scope, start: 'top 70%' });
      riseIn('.tw-meta', { trigger: scope, start: 'top 68%', stagger: 0.09 });
      riseIn('.tw-why', { trigger: scope, start: 'top 62%' });
    }, root);
    return () => ctx.revert();
  }, [twin]);

  /* ESC returns to the open globe from anywhere in the narrative.
     While the cinematic is still running, ESC belongs to the overlay (it
     skips to the end), so this only fires once the reveal has settled. */
  const phase = useApp((s) => s.phase);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedId && phase === 'revealed') {
        clearSelection();
        scrollTo(0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, clearSelection, phase]);

  /* ---------------- Empty state ---------------- */
  if (!dest || !twin) {
    return (
      <section id="twin" className="relative z-20 flex min-h-[70svh] items-center justify-center bg-ink px-6">
        <div className="max-w-lg text-center">
          <div className="tech mb-6 text-saffron">Nothing selected yet</div>
          <h2 className="display text-[clamp(30px,5.5vw,64px)] text-bone">
            Pick a place
            <br />
            you dream about.
          </h2>
          <p className="mt-6 text-[14px] leading-relaxed text-muted">
            Rotate the globe and click any glowing marker. TwinTrip will find the Indian place that
            carries the same feeling, and the rest of this page will build itself around it.
          </p>
          <button
            onClick={() => scrollTo(0)}
            data-cursor="GLOBE"
            className="tech mt-8 border border-bone/25 px-6 py-3 text-bone transition-colors duration-500 hover:border-saffron hover:text-saffron"
          >
            Back to the globe ↑
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="twin" ref={root} className="relative z-20">
      {/* ---------- Hero ---------- */}
      <div className="relative min-h-[112svh] overflow-hidden">
        <Poster
          terrain={twin.terrain}
          palette={twin.palette}
          offset={parallax}
          intensity={1.2}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/25 to-ink" />

        <div className="relative flex min-h-[112svh] flex-col justify-between p-5 md:p-8">
          {/* The chain, stated plainly at the top. */}
          <div className="tw-meta pt-20 md:pt-24">
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="tech">{dest.name}</span>
              <span className="text-saffron">↓</span>
              <span className="tech text-saffron">Emotional twin</span>
            </div>
          </div>

          <div className="max-w-[min(94vw,1100px)]">
            <div className="tw-meta tech mb-4 text-teal">Your Indian twin</div>
            <h2 className="tw-name display text-[clamp(52px,13vw,200px)] text-bone">
              <span className="line-mask">
                <span className="line-inner block">{twin.name}</span>
              </span>
            </h2>
            <div className="tw-meta mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <span className="display text-[clamp(18px,2.6vw,32px)] text-saffron">{twin.state}</span>
              <span className="tech">{formatCoords(twin.coordinates[0], twin.coordinates[1])}</span>
            </div>
            <p className="tw-meta mt-6 max-w-md text-[15px] text-bone/75">{twin.tagline}</p>
          </div>

          {/* Floating metadata row */}
          <div className="tw-meta mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-bone/15 pt-6 md:grid-cols-4">
            <Meta label="Region" value={`${twin.state}, India`} />
            <Meta label="Best season" value={twin.bestSeason} />
            <Meta label="Estimated trip" value={twin.tripLength} />
            <Meta label="Budget / person" value={twin.budget} hint="demo value" />
          </div>

          {/* The hinge to the linkable side of the product: match, story,
              plan, locals, community and the passport all live on one hub. */}
          <div className="tw-meta mt-10 flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate(`/destination/${twin.id}`)}
              data-cursor="OPEN"
              className="tech flex items-center gap-3 border border-saffron/50 bg-saffron/10 px-5 py-3.5 text-saffron transition-colors hover:bg-saffron hover:text-ink"
            >
              OPEN {twin.name.toUpperCase()} HUB
              <span aria-hidden="true">→</span>
            </button>
            <button
              onClick={() => navigate(`/destination/${twin.id}/community`)}
              data-cursor="COMMUNITY"
              className="tech border border-bone/25 px-5 py-3.5 text-bone/75 transition-colors hover:border-saffron/60 hover:text-saffron"
            >
              COMMUNITY STORIES
            </button>
            <span className="tech text-bone/35">COMMUNITY · MATCH · STORY · PLAN · LOCALS · PASSPORT</span>
          </div>
        </div>
      </div>

      {/* ---------- Why it matches ---------- */}
      <div className="contours relative border-t border-bone/10 bg-ink px-5 py-24 md:px-8 md:py-36">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-[220px,1fr] md:gap-20">
            <h3 className="tech text-saffron md:pt-3">Why it matches</h3>
            <div>
              <p className="tw-why display max-w-3xl text-[clamp(22px,3.4vw,44px)] leading-[1.12] tracking-tight text-bone">
                {twin.why}
              </p>
              <p className="tw-why mt-8 max-w-xl text-[14px] leading-relaxed text-muted">
                We are not claiming {twin.name} is {dest.name}. We are claiming that the specific
                things that make you want {dest.name} — {Object.keys(dest.attributes)[0].toLowerCase()},{' '}
                {Object.keys(dest.attributes)[1].toLowerCase()}, the pace of the day — are all here,
                a domestic flight away.
              </p>
            </div>
          </div>

          <div className="mt-24">
            <MatchVisualization destination={dest} />
          </div>

          <p className="tech mt-14 max-w-2xl leading-loose">
            Prototype data. Similarity scores in this demo are hand-authored to illustrate the
            model output; the production system scores landscape, climate, built form, food and
            pace as a feature vector.
          </p>
        </div>
      </div>
    </section>
  );
}

function Meta({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="group">
      <div className="tech mb-2">{label}</div>
      <div className="text-[14px] text-bone transition-transform duration-500 group-hover:-translate-y-0.5 md:text-[15px]">
        {value}
      </div>
      {hint && <div className="tech mt-1 text-[8px] text-muted-2">{hint}</div>}
    </div>
  );
}
