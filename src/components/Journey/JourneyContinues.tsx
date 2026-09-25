import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useCommunity } from '../../communityStore';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { navigate } from '../../router';

/**
 * ------------------------------------------------------------------
 * JOURNEY CONTINUES  —  the loop, stated
 * ------------------------------------------------------------------
 * Sits between LOCALS and the community feed on the home scroll. The
 * product model after arrival, as four beats rather than a paragraph:
 *
 *   VISIT → DOCUMENT → EARN → SHARE
 *
 * and two doors: the passport (the record) and the community (the feed).
 * Nothing here is text-heavy — the section earns its space by being a
 * bridge the reader can act on, not a promise.
 */
export function JourneyContinues() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const unlocked = useCommunity((s) => s.unlockedBadgeIds.length);

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.jc-el',
        { y: 26, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.09,
          scrollTrigger: { trigger: root.current!, start: 'top 74%', once: true },
        },
      );
      gsap.fromTo(
        '.jc-rule',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.3,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: root.current!, start: 'top 78%', once: true },
        },
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const beats = [
    { n: '01', label: 'VISIT', hint: 'The place does its thing to you' },
    { n: '02', label: 'DOCUMENT', hint: 'A photo or a thirty-second clip' },
    { n: '03', label: 'EARN', hint: 'Verified, and stamped into the passport' },
    { n: '04', label: 'SHARE', hint: 'The next traveller finds it through you' },
  ];

  return (
    <div ref={root} className="relative z-20 border-t border-bone/10 bg-ink px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="jc-el tech text-saffron">The loop</div>
        <h2 className="jc-el display mt-5 max-w-4xl text-[clamp(30px,5.6vw,76px)] leading-[0.92] text-bone">
          Your journey doesn&rsquo;t end
          <br />
          <span className="text-muted-2">when you arrive.</span>
        </h2>
        <p className="jc-el mt-6 max-w-xl text-[16px] leading-snug text-bone/75">
          It becomes part of your passport — and part of the place. Document a visit and the stamp, the badge and the
          community post all happen in the same move.
        </p>

        <div className="jc-rule mt-12 h-px w-full origin-left bg-bone/15" />

        <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-9 lg:grid-cols-4">
          {beats.map((b, i) => (
            <div key={b.n} className="jc-el">
              <div className="flex items-baseline gap-3">
                <span className="tech text-saffron">{b.n}</span>
                <span className="display text-[22px] leading-none text-bone md:text-[26px]">{b.label}</span>
                {i < beats.length - 1 && <span aria-hidden="true" className="ml-auto text-bone/30">→</span>}
              </div>
              <div className="tech mt-2.5 leading-relaxed">{b.hint}</div>
            </div>
          ))}
        </div>

        <div className="jc-el mt-12 flex flex-wrap items-center gap-4">
          <button
            onClick={() => navigate('/passport')}
            data-cursor="PASSPORT"
            className="tech flex items-center gap-3 border border-saffron/60 bg-saffron/10 px-6 py-3.5 text-saffron transition-colors hover:bg-saffron hover:text-ink"
          >
            OPEN PASSPORT
            <span className="rounded-full bg-saffron/25 px-2 py-0.5 font-mono text-[10px] tracking-normal text-saffron">
              {unlocked}
            </span>
          </button>
          <button
            onClick={() => navigate('/forum')}
            data-cursor="COMMUNITY"
            className="tech border border-bone/25 px-6 py-3.5 text-bone/80 transition-colors hover:border-saffron/60 hover:text-saffron"
          >
            EXPLORE COMMUNITY
          </button>
        </div>
      </div>
    </div>
  );
}
