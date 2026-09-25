import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * ------------------------------------------------------------------
 * ANIMATION TIMING — single source of truth
 * ------------------------------------------------------------------
 * Every duration and easing used by the cinematic systems lives here.
 * Retune the whole site from this object; nothing else hard-codes timings.
 */
export const T = {
  /** Preloader: per-step dwell for the boot sequence. */
  bootStep: 0.55,
  /** Globe camera flight when a destination is clicked. */
  cameraFly: 2.2,
  /** Return flight to the world view (ESC). */
  cameraReturn: 1.6,
  /** Each beat of the Santorini → Varkala cinematic.
      Four beats chain off this, so the whole sequence is roughly 12×. */
  transitionPanel: 1.05,
  /** Headline line-by-line reveal. */
  lineReveal: 1.05,
  lineStagger: 0.08,
  /** Match percentage count-up. */
  counter: 1.8,
  /** Attribute bar sweep. */
  bar: 1.4,
  barStagger: 0.12,
  /** Itinerary route draw. */
  route: 1.6,

  ease: 'power3.out',
  easeCine: 'expo.out',
  easeInOut: 'power2.inOut',
} as const;

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Masked line reveal: each `.line-inner` slides up from behind its clip mask.
 * Used by every display headline in the site.
 */
export function revealLines(
  scope: HTMLElement,
  options: { trigger?: HTMLElement; start?: string; delay?: number } = {},
) {
  const inners = scope.querySelectorAll<HTMLElement>('.line-inner');
  if (!inners.length) return;

  if (prefersReduced()) {
    gsap.set(inners, { yPercent: 0, opacity: 1 });
    return;
  }

  gsap.fromTo(
    inners,
    { yPercent: 115, opacity: 0 },
    {
      yPercent: 0,
      opacity: 1,
      duration: T.lineReveal,
      stagger: T.lineStagger,
      ease: T.easeCine,
      delay: options.delay ?? 0,
      scrollTrigger: options.trigger
        ? { trigger: options.trigger, start: options.start ?? 'top 78%', once: true }
        : undefined,
    },
  );
}

/**
 * Generic fade + rise for supporting copy and metadata rows.
 */
export function riseIn(
  targets: gsap.TweenTarget,
  options: { trigger?: HTMLElement; start?: string; stagger?: number; delay?: number } = {},
) {
  if (prefersReduced()) {
    gsap.set(targets, { y: 0, opacity: 1 });
    return;
  }
  gsap.fromTo(
    targets,
    { y: 26, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: T.ease,
      stagger: options.stagger ?? 0.07,
      delay: options.delay ?? 0,
      scrollTrigger: options.trigger
        ? { trigger: options.trigger, start: options.start ?? 'top 80%', once: true }
        : undefined,
    },
  );
}

/**
 * Animates a numeric counter (match %, budget totals) with a snap to integers.
 */
export function countTo(
  el: HTMLElement,
  value: number,
  options: { suffix?: string; duration?: number; trigger?: HTMLElement } = {},
) {
  const obj = { v: 0 };
  const suffix = options.suffix ?? '';

  if (prefersReduced()) {
    el.textContent = `${value}${suffix}`;
    return;
  }

  gsap.to(obj, {
    v: value,
    duration: options.duration ?? T.counter,
    ease: T.easeCine,
    onUpdate: () => {
      el.textContent = `${Math.round(obj.v)}${suffix}`;
    },
    scrollTrigger: options.trigger ? { trigger: options.trigger, start: 'top 75%', once: true } : undefined,
  });
}

/** Clean up every ScrollTrigger — called when the twin selection changes. */
export function refreshScrollTriggers() {
  ScrollTrigger.refresh();
}
