import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useApp } from '../../store';
import { T } from '../../animations/transitions';
import { scrollTo } from '../../hooks/useSmoothScroll';
import { destinations } from '../../data/destinations';

/**
 * The first viewport.
 *
 * Deliberately almost empty: four corners of type and a globe in the middle.
 * The headline waits for the preloader to finish (`phase !== 'boot'`) so the
 * opening reads as one continuous shot rather than two competing animations.
 *
 * All hero copy fades out once a destination is selected, handing the screen
 * to the cinematic transition.
 */
export function Hero() {
  const root = useRef<HTMLDivElement>(null);
  const phase = useApp((s) => s.phase);
  const scroll = useApp((s) => s.scroll);

  useEffect(() => {
    if (phase === 'boot') return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo(
        '.hero-line .line-inner',
        { yPercent: 115 },
        { yPercent: 0, duration: T.lineReveal, stagger: T.lineStagger, ease: T.easeCine },
      )
        .fromTo('.hero-meta', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: T.ease }, '-=0.6')
        .fromTo('.hero-rule', { scaleX: 0 }, { scaleX: 1, duration: 1, ease: T.easeInOut }, '-=0.8');
    }, root);
    return () => ctx.revert();
  }, [phase]);

  // The corner copy lifts away as the reader starts scrolling.
  const fade = Math.max(0, 1 - scroll * 9);
  const selected = phase !== 'globe' && phase !== 'boot';

  return (
    <section
      id="globe"
      ref={root}
      className="pointer-events-none relative z-20 flex min-h-[100svh] flex-col justify-between p-5 md:p-8"
      style={{
        opacity: selected ? 0 : fade,
        transition: 'opacity 700ms cubic-bezier(0.16,1,0.3,1)',
        visibility: fade < 0.02 ? 'hidden' : 'visible',
      }}
    >
      {/* The header component occupies the top row; the globe owns the middle.
          Hero copy lives only in the two bottom corners so the first viewport
          stays almost empty, with the globe as the subject. */}
      <div className="h-10" />
      <div className="hidden flex-1 lg:block" />

      {/* Bottom rail: headline left, invitation right. */}
      <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <div className="max-w-[min(92vw,620px)]">
          <h1 className="hero-line display text-[clamp(38px,6.6vw,92px)] text-bone">
            <span className="line-mask">
              <span className="line-inner block">Find</span>
            </span>
            <span className="line-mask">
              <span className="line-inner block">the feeling.</span>
            </span>
            <span className="line-mask">
              <span className="line-inner block text-muted-2">Not just the place.</span>
            </span>
          </h1>

          <div className="hero-rule mt-6 h-px w-[min(420px,72vw)] origin-left bg-bone/20" />

          <p className="hero-meta mt-4 text-[13px] leading-relaxed text-muted md:text-[14px]">
            You dream of Santorini. <span className="text-bone">We show you Varkala.</span>
          </p>
        </div>

        <div className="flex flex-col items-start gap-6 lg:items-end">
          <div className="hero-meta text-left lg:text-right">
            <div className="tech text-saffron">{destinations.length} dream destinations</div>
            <div className="tech">13 Indian twins · prototype data</div>
          </div>

          <div className="hero-meta pointer-events-auto">
            <button
              onClick={() => scrollTo('#twin')}
              data-cursor="SPIN"
              className="group flex items-center gap-3"
            >
              <span className="text-left lg:text-right">
                <span className="tech block text-bone">Explore the globe</span>
                <span className="tech block">Drag to rotate · Click a marker</span>
              </span>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-bone/25 transition-all duration-500 group-hover:border-saffron group-hover:bg-saffron/10">
                <span className="text-saffron transition-transform duration-500 group-hover:translate-y-0.5">↓</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
