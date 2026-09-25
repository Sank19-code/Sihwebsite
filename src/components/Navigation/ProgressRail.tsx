import { useEffect } from 'react';
import { useApp } from '../../store';
import { scrollTo } from '../../hooks/useSmoothScroll';
import { SECTIONS } from './Navigation';

/**
 * Side progress rail — "03 / 06" plus a scrubbing hairline.
 *
 * The active chapter is derived from IntersectionObserver rather than from
 * scroll maths, so it stays correct no matter how section heights change.
 */
export function ProgressRail() {
  const phase = useApp((s) => s.phase);
  const scroll = useApp((s) => s.scroll);
  const section = useApp((s) => s.section);
  const setSection = useApp((s) => s.setSection);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the middle of the viewport.
        const visible = entries.filter((e) => e.isIntersecting);
        if (!visible.length) return;
        const best = visible.reduce((a, b) => (a.intersectionRatio > b.intersectionRatio ? a : b));
        const index = SECTIONS.findIndex((s) => s.id === best.target.id);
        if (index >= 0) setSection(index);
      },
      { threshold: [0.15, 0.4, 0.7], rootMargin: '-20% 0px -20% 0px' },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [setSection]);

  return (
    <div
      className="pointer-events-none fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 transition-opacity duration-700 lg:flex"
      style={{ opacity: phase === 'boot' ? 0 : 1 }}
    >
      <span className="tech tabular-nums text-bone">
        {String(section + 1).padStart(2, '0')}
        <span className="text-muted"> / {String(SECTIONS.length).padStart(2, '0')}</span>
      </span>

      <div className="relative h-52 w-px bg-bone/15">
        {/* Continuous scroll position. */}
        <div
          className="absolute left-0 top-0 w-px bg-saffron transition-[height] duration-200 ease-out"
          style={{ height: `${Math.min(100, scroll * 100)}%` }}
        />
        {/* Discrete chapter stops — clickable. */}
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => scrollTo(`#${s.id}`)}
            data-cursor={s.label}
            className="pointer-events-auto absolute -left-[7px] h-3.5 w-3.5"
            style={{ top: `${(i / (SECTIONS.length - 1)) * 100}%`, marginTop: -7 }}
            aria-label={`Go to ${s.label}`}
          >
            <span
              className="block h-1.5 w-1.5 translate-x-1 translate-y-1 rounded-full transition-all duration-500"
              style={{
                background: i <= section ? '#E8833A' : 'rgba(242,238,231,0.3)',
                transform: i === section ? 'translate(2px,4px) scale(1.7)' : undefined,
              }}
            />
          </button>
        ))}
      </div>

      <span className="tech writing-vertical text-muted" style={{ writingMode: 'vertical-rl' }}>
        {SECTIONS[section]?.label}
      </span>
    </div>
  );
}
