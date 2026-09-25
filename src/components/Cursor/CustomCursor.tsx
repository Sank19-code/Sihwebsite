import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useApp } from '../../store';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

/**
 * Custom cursor: a small dot plus a lagging ring that can carry a label.
 *
 * The ring uses gsap.quickTo, which writes straight to the transform without
 * re-rendering React — the cursor stays glued to the pointer at any frame rate.
 *
 * Labels come from two places:
 *   - the store (`cursorLabel`), set by the globe: EXPLORE / ROTATE
 *   - `data-cursor` attributes on ordinary DOM elements: VIEW, PLAY, etc.
 *
 * Disabled entirely on touch devices and under prefers-reduced-motion.
 */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  const storeLabel = useApp((s) => s.cursorLabel);
  const dragging = useApp((s) => s.dragging);

  // Globe-driven labels take priority over DOM `data-cursor` ones. Mirrored
  // into a ref so the pointermove handler can read the current value.
  const active = dragging ? 'ROTATE' : storeLabel;
  const activeRef = useRef<string | null>(active);
  activeRef.current = active;

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine || reduced) return;

    document.body.classList.add('custom-cursor');

    const xDot = gsap.quickTo(dot.current, 'x', { duration: 0.08, ease: 'none' });
    const yDot = gsap.quickTo(dot.current, 'y', { duration: 0.08, ease: 'none' });
    const xRing = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3.out' });
    const yRing = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3.out' });

    const onMove = (e: PointerEvent) => {
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);

      // Walk up from the hovered element looking for an explicit cursor label.
      const el = (e.target as HTMLElement | null)?.closest?.('[data-cursor]') as HTMLElement | null;
      const custom = activeRef.current ?? el?.dataset.cursor ?? null;
      if (label.current) label.current.textContent = custom ?? '';
      gsap.to(ring.current, {
        scale: custom ? 2.5 : 1,
        borderColor: custom ? 'rgba(232,131,58,0.9)' : 'rgba(242,238,231,0.45)',
        duration: 0.45,
        ease: 'expo.out',
        overwrite: 'auto',
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.body.classList.remove('custom-cursor');
    };
  }, [reduced]);

  // Keep the ring in sync when the globe changes the label without the
  // pointer moving (e.g. drag start/end).
  useEffect(() => {
    if (!ring.current) return;
    if (label.current) label.current.textContent = active ?? '';
    gsap.to(ring.current, {
      scale: active ? 2.5 : 1,
      borderColor: active ? 'rgba(232,131,58,0.9)' : 'rgba(242,238,231,0.45)',
      duration: 0.5,
      ease: 'expo.out',
      overwrite: 'auto',
    });
  }, [active]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[120] hidden md:block" aria-hidden="true">
      <div
        ref={dot}
        className="absolute -left-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-saffron"
      />
      <div
        ref={ring}
        className="absolute -left-[18px] -top-[18px] grid h-9 w-9 place-items-center rounded-full border border-bone/45"
      >
        <span
          ref={label}
          className="tech whitespace-nowrap text-[5.5px] text-bone"
          style={{ letterSpacing: '0.1em' }}
        />
      </div>
    </div>
  );
}
