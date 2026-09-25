import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useApp } from '../store';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

/** The single Lenis instance, exposed so overlays can lock/unlock scrolling. */
let lenis: Lenis | null = null;

/**
 * Lock state is tracked separately from the instance.
 *
 * The preloader and the transition overlay both lock scrolling, and in React
 * StrictMode (and on hot reload) they can run before or after the Lenis
 * instance exists. Keeping the intent in a module flag and re-applying it when
 * an instance is created means the page can never get stranded unscrollable.
 */
let lockCount = 0;

const applyLock = () => {
  const locked = lockCount > 0;
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
    return;
  }
  // Reduced-motion mode runs on native scrolling, so lock the document
  // directly instead.
  if (typeof document !== 'undefined') {
    document.body.style.overflow = locked ? 'hidden' : '';
  }
};

export const lockScroll = () => {
  lockCount += 1;
  applyLock();
};

export const unlockScroll = () => {
  lockCount = Math.max(0, lockCount - 1);
  applyLock();
};
export const scrollTo = (target: string | number, offset = 0) => {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.6 });
    return;
  }
  // Native fallback for reduced-motion mode, which never creates a Lenis
  // instance. Resolves selectors the same way Lenis would.
  const top =
    typeof target === 'number'
      ? target
      : (document.querySelector(target) as HTMLElement | null)?.offsetTop ?? 0;
  window.scrollTo({ top: top + offset, behavior: 'auto' });
};

/**
 * Wires Lenis smooth scrolling into GSAP's ScrollTrigger and mirrors scroll
 * progress into the store for the progress rail.
 *
 * Under `prefers-reduced-motion` Lenis is not started at all: the page falls
 * back to native scrolling and ScrollTrigger drives the reveals directly.
 */
export function useSmoothScroll() {
  const reduced = usePrefersReducedMotion();
  const setScroll = useApp((s) => s.setScroll);

  useEffect(() => {
    if (reduced) {
      const onScroll = () => {
        const max = document.body.scrollHeight - window.innerHeight;
        setScroll(max > 0 ? window.scrollY / max : 0);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener('scroll', onScroll);
    }

    lenis = new Lenis({
      duration: 1.15,
      // Long, decelerating ease — the "premium and intentional" feel.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    });

    // Re-apply whatever lock state was requested while there was no instance.
    applyLock();

    lenis.on('scroll', (e: { progress: number }) => {
      setScroll(e.progress);
      ScrollTrigger.update();
    });

    // Drive Lenis from GSAP's ticker so both share one RAF loop.
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, [reduced, setScroll]);
}
