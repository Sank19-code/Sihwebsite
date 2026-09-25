import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { T, countTo } from '../../animations/transitions';
import type { ForeignDestination } from '../../data/types';

gsap.registerPlugin(ScrollTrigger);

/**
 * ------------------------------------------------------------------
 * MATCH VISUALISATION
 * ------------------------------------------------------------------
 * A radial arc for the headline number, hairline bars for the attributes.
 *
 * Deliberately not a dashboard: no panels, no rounded cards, no axis labels.
 * The number is typographic first and a chart second — the arc exists only to
 * give the count-up something to move against.
 *
 * All values are PROTOTYPE DATA and the UI says so, in the section footnote.
 */
export function MatchVisualization({ destination }: { destination: ForeignDestination }) {
  const root = useRef<HTMLDivElement>(null);
  const number = useRef<HTMLSpanElement>(null);

  const R = 78;
  const CIRC = 2 * Math.PI * R;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scope = root.current!;

      // Headline percentage.
      if (number.current) {
        countTo(number.current, destination.match, { suffix: '', trigger: scope });
      }

      // The arc sweeps to the same value on the same curve.
      gsap.fromTo(
        '.mv-arc',
        { strokeDashoffset: CIRC },
        {
          strokeDashoffset: CIRC - (destination.match / 100) * CIRC,
          duration: T.counter,
          ease: T.easeCine,
          scrollTrigger: { trigger: scope, start: 'top 75%', once: true },
        },
      );

      // Attribute bars sweep from the left, staggered.
      gsap.fromTo(
        '.mv-bar-fill',
        { scaleX: 0 },
        {
          scaleX: (_i: number, el: HTMLElement) => Number(el.dataset.value) / 100,
          duration: T.bar,
          stagger: T.barStagger,
          ease: T.easeCine,
          scrollTrigger: { trigger: scope, start: 'top 72%', once: true },
        },
      );

      // Each bar's numeral counts alongside its own bar.
      scope.querySelectorAll<HTMLElement>('.mv-bar-value').forEach((el) => {
        countTo(el, Number(el.dataset.value), { duration: T.bar, trigger: scope });
      });

      gsap.fromTo(
        '.mv-row',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: T.barStagger,
          ease: T.ease,
          scrollTrigger: { trigger: scope, start: 'top 76%', once: true },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [destination, CIRC]);

  const entries = Object.entries(destination.attributes);

  return (
    <div ref={root} className="grid gap-12 md:grid-cols-[auto,1fr] md:gap-20">
      {/* --- Radial headline --- */}
      <div className="flex items-center gap-6">
        <div className="relative h-[190px] w-[190px] shrink-0">
          <svg viewBox="0 0 190 190" className="h-full w-full -rotate-90">
            <circle cx="95" cy="95" r={R} fill="none" stroke="#F2EEE7" strokeOpacity="0.12" strokeWidth="1" />
            <circle
              className="mv-arc"
              cx="95"
              cy="95"
              r={R}
              fill="none"
              stroke="#E8833A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC}
            />
            {/* Tick marks every 10% — the instrument detail. */}
            {Array.from({ length: 40 }, (_, i) => {
              const a = (i / 40) * Math.PI * 2;
              const r1 = R + 8;
              const r2 = R + (i % 4 === 0 ? 14 : 11);
              return (
                <line
                  key={i}
                  x1={95 + Math.cos(a) * r1}
                  y1={95 + Math.sin(a) * r1}
                  x2={95 + Math.cos(a) * r2}
                  y2={95 + Math.sin(a) * r2}
                  stroke="#F2EEE7"
                  strokeOpacity={i % 4 === 0 ? 0.3 : 0.12}
                  strokeWidth="0.75"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="display text-[56px] leading-none text-bone">
                <span ref={number}>0</span>
                <span className="text-saffron">%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[170px]">
          <div className="tech text-saffron">Emotional match</div>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            How closely {destination.name} and its twin share the things people actually travel for.
          </p>
        </div>
      </div>

      {/* --- Attribute bars --- */}
      <div className="self-center">
        {entries.map(([key, value]) => (
          <div key={key} className="mv-row border-t border-bone/10 py-4 first:border-t-0">
            <div className="flex items-baseline justify-between gap-4">
              <span className="tech text-bone">{key}</span>
              <span className="font-mono text-[15px] tabular-nums text-bone">
                <span className="mv-bar-value" data-value={value}>
                  0
                </span>
                <span className="text-muted">%</span>
              </span>
            </div>
            <div className="mt-2.5 h-px w-full bg-bone/10">
              <div
                className="mv-bar-fill h-px w-full origin-left bg-saffron"
                data-value={value}
                style={{ transform: 'scaleX(0)' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
