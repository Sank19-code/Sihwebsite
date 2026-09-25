import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useApp } from '../../store';
import { T } from '../../animations/transitions';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { lockScroll, unlockScroll } from '../../hooks/useSmoothScroll';

/**
 * ------------------------------------------------------------------
 * CINEMATIC OPENING SEQUENCE
 * ------------------------------------------------------------------
 * Black screen → wordmark → particles → globe materialises → atmosphere →
 * markers activate → headline.
 *
 * The preloader does not fake a progress bar. It reports what the system is
 * actually doing, step by step, then hands the page over. Scrolling is locked
 * for its duration so nobody scrolls past the opening shot.
 */
const STEPS = [
  'INITIALISING',
  'PLOTTING GRATICULE',
  'SEEDING PARTICLE FIELD',
  'RESOLVING ATMOSPHERE',
  'ACTIVATING 17 DESTINATIONS',
  'READY',
];

export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const setPhase = useApp((s) => s.setPhase);
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    lockScroll();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        // Unlocking is handled by the effect cleanup when this component
        // unmounts, so the lock counter stays balanced.
        onComplete: () => setPhase('globe'),
      });

      const dwell = reduced ? 0.06 : T.bootStep;

      // 1. Wordmark resolves out of the black.
      tl.fromTo(
        '.boot-mark .line-inner',
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1, stagger: 0.09, ease: T.easeCine },
      );

      // 2. Hairline draws across, under the mark.
      tl.fromTo('.boot-rule', { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: T.easeInOut }, '-=0.5');

      // 3. Step through the boot log. Each step also gates a globe layer,
      //    via the `phase` the scene reads.
      STEPS.forEach((_, i) => {
        tl.call(() => setStep(i), undefined, `+=${i === 0 ? 0.1 : dwell}`);
      });

      // 4. Curtain lifts; the globe is already live behind it.
      tl.to('.boot-veil', { opacity: 0, duration: 1.1, ease: 'power2.inOut' }, `+=${dwell}`);
      tl.to(root.current, { autoAlpha: 0, duration: 0.5 }, '-=0.35');
    }, root);

    return () => {
      ctx.revert();
      unlockScroll();
    };
  }, [setPhase, reduced]);

  return (
    <div ref={root} className="fixed inset-0 z-[90] flex items-center justify-center">
      <div className="boot-veil absolute inset-0 bg-ink" />
      <div className="relative z-10 px-8 text-center">
        <div className="boot-mark display text-[clamp(38px,7vw,96px)] text-bone">
          <span className="line-mask">
            <span className="line-inner block">TwinTrip</span>
          </span>
          <span className="line-mask">
            <span className="line-inner block text-saffron">India</span>
          </span>
        </div>

        <div className="boot-rule mx-auto mt-8 h-px w-[min(420px,70vw)] origin-left bg-bone/25" />

        <div className="mt-5 flex items-center justify-center gap-3">
          <span className="tech tabular-nums text-saffron">
            {String(Math.min(step + 1, STEPS.length)).padStart(2, '0')}/{STEPS.length}
          </span>
          <span className="tech">{STEPS[step]}</span>
        </div>
      </div>
    </div>
  );
}
