import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { revealLines, riseIn } from '../../animations/transitions';
import { scrollTo } from '../../hooks/useSmoothScroll';
import { useApp } from '../../store';
import { destinations } from '../../data/destinations';
import { indianPlaces } from '../../data/indianPlaces';

/**
 * Final CTA + footer.
 *
 * Ends where it began: the only call to action is to go back to the globe.
 * There is nothing to sign up for, which is the point of the product.
 */
export function FinalCTA() {
  const root = useRef<HTMLDivElement>(null);
  const clearSelection = useApp((s) => s.clearSelection);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scope = root.current!;
      revealLines(scope.querySelector('.cta-title') as HTMLElement, { trigger: scope, start: 'top 74%' });
      riseIn('.cta-meta', { trigger: scope, start: 'top 70%', stagger: 0.1 });
    }, root);
    return () => ctx.revert();
  }, []);

  const restart = () => {
    clearSelection();
    scrollTo(0);
  };

  return (
    <footer ref={root} className="relative z-20 border-t border-bone/10 bg-ink">
      {/* ---------------- CTA ---------------- */}
      <div className="px-5 py-32 md:px-8 md:py-48">
        <div className="mx-auto max-w-6xl">
          <h2 className="cta-title display text-[clamp(38px,9vw,150px)] text-bone">
            <span className="line-mask">
              <span className="line-inner block text-muted-2">The world is big.</span>
            </span>
            <span className="line-mask">
              <span className="line-inner block">India is bigger</span>
            </span>
            <span className="line-mask">
              <span className="line-inner block">than you think.</span>
            </span>
          </h2>

          <p className="cta-meta mt-10 max-w-md text-[15px] leading-relaxed text-muted">
            Your next journey might be closer than you imagined.
          </p>

          <button
            onClick={restart}
            data-cursor="EXPLORE"
            className="cta-meta group mt-14 flex items-center gap-5"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full border border-bone/25 transition-all duration-700 ease-cine group-hover:scale-110 group-hover:border-saffron group-hover:bg-saffron/10">
              <span className="text-saffron transition-transform duration-700 group-hover:-translate-y-0.5">↑</span>
            </span>
            <span className="display text-[clamp(22px,3.2vw,44px)] text-bone transition-colors duration-500 group-hover:text-saffron">
              Explore India
            </span>
          </button>
        </div>
      </div>

      {/* ---------------- Footer ---------------- */}
      <div className="border-t border-bone/10 px-5 py-12 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr,auto]">
          <div>
            <div className="display text-[20px] leading-[0.95] text-bone">
              TwinTrip
              <br />
              <span className="text-saffron">India</span>
            </div>
            <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-muted">
              Find the feeling. Tell the story. Plan the trip. Help the locals.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-4 md:grid-cols-3">
            <FooterStat label="Dream destinations" value={String(destinations.length)} />
            <FooterStat label="Indian twins" value={String(indianPlaces.length)} />
            <FooterStat label="Commission" value="0%" />
            <FooterStat label="Backend services" value="None" />
            <FooterStat label="Booking flow" value="By design, none" />
            <FooterStat label="Build" value="SIH 2026 prototype" />
          </div>
        </div>

        <div className="mx-auto mt-14 flex max-w-6xl flex-wrap justify-between gap-4 border-t border-bone/10 pt-6">
          <span className="tech">Smart India Hackathon 2026 · Prototype</span>
          <span className="tech">
            All match scores, budgets and listings shown are demo data
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="tech mb-1.5">{label}</div>
      <div className="font-mono text-[13px] text-bone">{value}</div>
    </div>
  );
}
