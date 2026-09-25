import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useApp } from '../store';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { riseIn } from '../animations/transitions';

import { Preloader } from '../components/Preloader/Preloader';
import { Hero } from '../components/Hero/Hero';
import { TransitionOverlay } from '../components/TwinReveal/TransitionOverlay';
import { TwinReveal } from '../components/TwinReveal/TwinReveal';
import { StorySection } from '../components/StorySection/StorySection';
import { TripPlanner } from '../components/TripPlanner/TripPlanner';
import { LocalDiscovery } from '../components/LocalDiscovery/LocalDiscovery';
import { IndianDiscovery } from '../components/IndianDiscovery/IndianDiscovery';
import { FinalCTA } from '../components/Footer/FinalCTA';
import { JourneyContinues } from '../components/Journey/JourneyContinues';
import { FromTheCommunity } from '../components/Journey/FromTheCommunity';

/**
 * One page, one continuous scroll:
 *
 *   INTRO → GLOBE → DREAM → TWIN → WHY → STORY → PLAN → LOCALS
 *         → JOURNEY (community + passport) → MORE → CTA
 *
 * Nothing routes. Selecting a destination mutates the store and every section
 * below re-composes around the new pairing, which is what makes the globe an
 * interaction mechanism rather than a decoration.
 *
 * The chrome that several routes share (navigation, the WebGL globe, the
 * document → verify → badge overlays) is mounted once by the app shell, so
 * this page renders only the home narrative and the preloader.
 */
export function Home() {
  const phase = useApp((s) => s.phase);
  useSmoothScroll();

  return (
    <>
      {phase === 'boot' && <Preloader />}

      <main className="relative">
        <Hero />
        <ChainStrip />
        <TwinReveal />
        <StorySection />
        <TripPlanner />
        <LocalDiscovery />
        <JourneyContinues />
        <FromTheCommunity />
        <IndianDiscovery />
        <FinalCTA />
      </main>

      {/* Sits above everything while the cinematic plays. */}
      <TransitionOverlay />
    </>
  );
}

/**
 * The product model, stated once, as a band of type. This is the "how it
 * works" section — six words rather than six illustrated cards.
 */
function ChainStrip() {
  const root = useRef<HTMLDivElement>(null);

  const steps = [
    { n: '01', label: 'Dream destination', hint: 'Pick it off the globe' },
    { n: '02', label: 'Emotional twin', hint: 'We find the Indian match' },
    { n: '03', label: 'Why it matches', hint: 'Scored, not asserted' },
    { n: '04', label: 'Story', hint: 'A 90-second legend' },
    { n: '05', label: 'Plan', hint: 'Days, budget, route' },
    { n: '06', label: 'Local experience', hint: 'Straight to the people' },
    { n: '07', label: 'Document', hint: 'File the visit to the community' },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      riseIn('.chain-item', { trigger: root.current!, start: 'top 82%', stagger: 0.06 });
      gsap.fromTo(
        '.chain-rule',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.4,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: root.current!, start: 'top 85%', once: true },
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="relative z-20 bg-ink px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="chain-rule h-px w-full origin-left bg-bone/15" />
        <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3 lg:grid-cols-7">
          {steps.map((s) => (
            <div key={s.n} className="chain-item">
              <div className="tech text-saffron">{s.n}</div>
              <div className="mt-3 text-[14px] leading-tight text-bone">{s.label}</div>
              <div className="tech mt-2 leading-relaxed">{s.hint}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
