import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useApp, selectedDestination } from '../../store';
import { placeById } from '../../data/indianPlaces';
import { INTERESTS, type Interest } from '../../data/activities';
import { buildItinerary, type Itinerary } from '../../lib/itinerary';
import { revealLines, riseIn, T } from '../../animations/transitions';
import { RouteMap } from './RouteMap';

/**
 * ------------------------------------------------------------------
 * TRIP PLANNER
 * ------------------------------------------------------------------
 * Four inputs, one button, a generated itinerary and an animated route.
 *
 * Everything runs locally (see lib/itinerary.ts). The inputs are hairline
 * sliders and text toggles rather than form controls, so the section stays in
 * the same visual language as the rest of the page.
 */
export function TripPlanner() {
  const root = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const selectedId = useApp((s) => s.selectedId);
  const dest = selectedDestination(selectedId);
  const place = dest ? placeById(dest.twin)! : placeById('varkala')!;

  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(10000);
  const [travellers, setTravellers] = useState(2);
  const [interests, setInterests] = useState<Interest[]>(['nature', 'culture', 'food']);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [building, setBuilding] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scope = root.current!;
      revealLines(scope.querySelector('.tp-title') as HTMLElement, { trigger: scope, start: 'top 72%' });
      riseIn('.tp-field', { trigger: scope, start: 'top 68%', stagger: 0.08 });
    }, root);
    return () => ctx.revert();
  }, []);

  /* Reset the output when the destination changes under us. */
  useEffect(() => setItinerary(null), [place.id]);

  const toggle = (id: Interest) =>
    setInterests((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const build = () => {
    setBuilding(true);
    const next = buildItinerary(place, days, budget, travellers, interests);

    // A short, deliberate beat before the itinerary lands — it reads as the
    // system thinking rather than as a spinner.
    window.setTimeout(() => {
      setItinerary(next);
      setBuilding(false);
    }, 520);
  };

  /* Animate the itinerary in whenever it is (re)generated. */
  useEffect(() => {
    if (!itinerary || !outputRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.tp-day',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.09, ease: T.easeCine },
      );
      gsap.fromTo(
        '.tp-day-rule',
        { scaleX: 0 },
        { scaleX: 1, duration: 1.1, stagger: 0.09, ease: T.easeInOut },
      );
    }, outputRef);
    return () => ctx.revert();
  }, [itinerary]);

  return (
    <section id="plan" ref={root} className="relative z-20 border-t border-bone/10 bg-ink px-5 py-24 md:px-8 md:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="tech mb-8 text-saffron">The journey</div>
        <h2 className="tp-title display text-[clamp(34px,7vw,110px)] text-bone">
          <span className="line-mask">
            <span className="line-inner block">Now plan</span>
          </span>
          <span className="line-mask">
            <span className="line-inner block text-muted-2">the journey.</span>
          </span>
        </h2>

        <div className="mt-20 grid gap-16 lg:grid-cols-[minmax(0,380px),1fr] lg:gap-24">
          {/* ---------------- Inputs ---------------- */}
          <div>
            <Slider
              className="tp-field"
              label="How many days?"
              value={days}
              min={2}
              max={10}
              onChange={setDays}
              display={`${days}`}
              unit={days === 1 ? 'day' : 'days'}
            />

            <Slider
              className="tp-field"
              label="Budget / person"
              value={budget}
              min={4000}
              max={60000}
              step={1000}
              onChange={setBudget}
              display={`₹${budget.toLocaleString('en-IN')}`}
            />

            <Slider
              className="tp-field"
              label="Travellers"
              value={travellers}
              min={1}
              max={8}
              onChange={setTravellers}
              display={`${travellers}`}
              unit={travellers === 1 ? 'person' : 'people'}
            />

            <div className="tp-field border-t border-bone/10 py-7">
              <div className="tech mb-5">Interests</div>
              <div className="flex flex-col gap-3">
                {INTERESTS.map((i) => {
                  const on = interests.includes(i.id);
                  return (
                    <button
                      key={i.id}
                      onClick={() => toggle(i.id)}
                      data-cursor={on ? 'DROP' : 'ADD'}
                      className="group flex items-center gap-4 text-left"
                    >
                      <span
                        className="grid h-4 w-4 shrink-0 place-items-center border transition-all duration-400"
                        style={{
                          borderColor: on ? '#E8833A' : 'rgba(242,238,231,0.3)',
                          background: on ? '#E8833A' : 'transparent',
                        }}
                      >
                        {on && <span className="text-[9px] leading-none text-ink">✓</span>}
                      </span>
                      <span
                        className="text-[15px] transition-colors duration-300"
                        style={{ color: on ? '#F2EEE7' : '#8B8782' }}
                      >
                        {i.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={build}
              disabled={building}
              data-cursor="BUILD"
              className="tp-field group mt-4 flex w-full items-center justify-between border border-bone/25 px-6 py-5 transition-all duration-500 hover:border-saffron hover:bg-saffron/5 disabled:opacity-50"
            >
              <span className="tech text-bone group-hover:text-saffron">
                {building ? 'Composing…' : itinerary ? 'Rebuild my trip' : 'Build my trip'}
              </span>
              <span className="text-saffron transition-transform duration-500 group-hover:translate-x-1.5">→</span>
            </button>

            <p className="tech mt-5 leading-loose">
              Generated locally, no backend. Zero commission, no booking — TwinTrip never stands
              between you and the person you are paying.
            </p>
          </div>

          {/* ---------------- Output ---------------- */}
          <div ref={outputRef}>
            {!itinerary ? (
              <div className="flex h-full min-h-[320px] flex-col justify-center border-t border-bone/10 pt-10">
                <div className="tech mb-4 text-muted-2">Awaiting input</div>
                <p className="display max-w-md text-[clamp(20px,2.6vw,34px)] leading-tight text-muted-2">
                  Set the shape of the trip, and we will draw it across {place.name}.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4 border-b border-bone/15 pb-5">
                  <div>
                    <div className="tech text-saffron">Your itinerary</div>
                    <div className="display mt-2 text-[clamp(24px,3.4vw,44px)] text-bone">
                      {place.name}, {place.state}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[18px] text-bone">
                      ₹{itinerary.total.toLocaleString('en-IN')}
                    </div>
                    <div className="tech mt-1">
                      {travellers} × ₹{budget.toLocaleString('en-IN')} · demo estimate
                    </div>
                  </div>
                </div>

                {/* Route drawing */}
                <RouteMap place={place} route={itinerary.route} />

                {/* Days */}
                <div className="mt-14">
                  {itinerary.days.map((d) => (
                    <div key={d.index} className="tp-day py-7">
                      <div className="tp-day-rule mb-6 h-px w-full origin-left bg-bone/12" />
                      <div className="grid gap-4 md:grid-cols-[120px,1fr] md:gap-10">
                        <div>
                          <div className="tech text-saffron">Day {String(d.index).padStart(2, '0')}</div>
                          <div className="tech mt-2 text-muted-2">
                            ≈ ₹{Math.round(budget * d.share).toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div>
                          <h3 className="display text-[clamp(20px,2.6vw,32px)] text-bone">{d.title}</h3>
                          <ul className="mt-4 space-y-2">
                            {d.lines.map((l) => (
                              <li key={l} className="flex gap-3 text-[14px] leading-relaxed text-muted">
                                <span className="mt-2 h-px w-4 shrink-0 bg-saffron/60" />
                                {l}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="tech mt-8 leading-loose">{itinerary.note}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Hairline slider with a large monospaced readout. */
function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  display,
  unit,
  className = '',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  display: string;
  unit?: string;
  className?: string;
}) {
  return (
    <div className={`${className} border-t border-bone/10 py-7`}>
      <div className="flex items-baseline justify-between">
        <span className="tech">{label}</span>
        <span className="font-mono text-[22px] tabular-nums text-bone">
          {display}
          {unit && <span className="ml-2 text-[11px] uppercase tracking-widest text-muted">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        className="mt-5"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
      />
    </div>
  );
}
