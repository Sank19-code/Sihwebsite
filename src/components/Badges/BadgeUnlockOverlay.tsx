import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { useCommunity } from '../../communityStore';
import { badgeById, rarityLabel } from '../../data/badges';
import { placeById } from '../../data/indianPlaces';
import { lockScroll, unlockScroll } from '../../hooks/useSmoothScroll';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { BadgeArt } from './BadgeArt';
import { navigate } from '../../router';

/**
 * ------------------------------------------------------------------
 * BADGE UNLOCK
 * ------------------------------------------------------------------
 * Mounted once, at the app root. It watches the store's unlock queue, so a
 * badge earned anywhere — the document flow today, a streak or a community
 * milestone later — is celebrated identically.
 *
 * The sequence: dim, strike the medallion in (scale + rotation + glow),
 * burst a ring of particles, then set the type. Under reduced motion the
 * same information appears with no movement at all.
 */

const PARTICLES = 22;

export function BadgeUnlockOverlay() {
  const queue = useCommunity((s) => s.unlockQueue);
  const dismiss = useCommunity((s) => s.dismissUnlock);
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);

  const event = queue[0] ?? null;
  const badge = event ? badgeById(event.badgeId) : null;
  const place = event?.placeId ? placeById(event.placeId) : badge?.destination ? placeById(badge.destination) : null;

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLES }, (_, i) => {
        const angle = (i / PARTICLES) * Math.PI * 2;
        return { x: Math.cos(angle), y: Math.sin(angle), delay: (i % 5) * 0.02 };
      }),
    [],
  );

  useEffect(() => {
    if (!event) return;
    lockScroll();
    return () => unlockScroll();
  }, [event]);

  useEffect(() => {
    if (!event || !root.current) return;

    if (reduced) {
      gsap.set(root.current.querySelectorAll('.bu-el, .bu-medal'), { opacity: 1, scale: 1, y: 0, rotate: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo('.bu-scrim', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' })
        .fromTo('.bu-eyebrow', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, '-=0.2')
        .fromTo(
          '.bu-medal',
          { scale: 0.2, rotate: -28, opacity: 0 },
          { scale: 1, rotate: 0, opacity: 1, duration: 1.15, ease: 'expo.out' },
          '-=0.1',
        )
        .fromTo('.bu-halo', { scale: 0.4, opacity: 0.85 }, { scale: 2.4, opacity: 0, duration: 1.4, ease: 'expo.out' }, '<')
        .fromTo(
          '.bu-particle',
          { x: 0, y: 0, opacity: 1, scale: 1 },
          {
            x: (i: number) => particles[i].x * gsap.utils.random(90, 190),
            y: (i: number) => particles[i].y * gsap.utils.random(90, 190),
            opacity: 0,
            scale: 0.2,
            duration: 1.3,
            ease: 'expo.out',
            stagger: 0.012,
          },
          '<0.08',
        )
        .fromTo('.bu-el', { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.07 }, '-=0.75');
    }, root);

    return () => ctx.revert();
  }, [event, reduced, particles]);

  useEffect(() => {
    if (!event) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [event, dismiss]);

  if (!event || !badge) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[110] flex items-center justify-center px-5"
      role="dialog"
      aria-modal="true"
      aria-label={`New badge unlocked: ${badge.name}`}
    >
      <div className="bu-scrim absolute inset-0 bg-ink/88 backdrop-blur-md" />

      <div className="relative w-full max-w-lg text-center">
        <div className="bu-eyebrow tech text-saffron">NEW BADGE UNLOCKED</div>

        <div className="relative mx-auto mt-8 flex h-[200px] w-[200px] items-center justify-center">
          {/* expanding halo */}
          <span
            className="bu-halo absolute h-[150px] w-[150px] rounded-full"
            style={{ border: `1px solid ${badge.ink[1]}`, boxShadow: `0 0 60px ${badge.ink[1]}55` }}
            aria-hidden="true"
          />
          {/* particle burst */}
          {particles.map((_, i) => (
            <span
              key={i}
              className="bu-particle absolute h-1 w-1 rounded-full"
              style={{ background: i % 3 === 0 ? badge.ink[1] : badge.ink[0] }}
              aria-hidden="true"
            />
          ))}
          <div className="bu-medal relative">
            <BadgeArt badge={badge} size={168} />
          </div>
        </div>

        <div className="bu-el tech mt-7">{rarityLabel[badge.rarity]}</div>
        <h2 className="bu-el display mt-3 text-[clamp(40px,10vw,68px)] leading-none text-bone">{badge.name}</h2>
        {place && <div className="bu-el tech mt-4 text-teal">{place.name.toUpperCase()} · {place.state.toUpperCase()}</div>}

        <p className="bu-el mx-auto mt-6 max-w-sm text-[16px] leading-snug text-bone/80">{badge.citation}</p>

        <div className="bu-el mt-9 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              dismiss();
              navigate('/passport');
            }}
            data-cursor="GO"
            className="tech bg-saffron px-6 py-3.5 text-ink transition-colors hover:bg-bone"
          >
            VIEW IN PASSPORT
          </button>
          <button
            onClick={dismiss}
            data-cursor="CLOSE"
            className="tech border border-bone/25 px-6 py-3.5 text-bone/70 transition-colors hover:border-saffron/60 hover:text-saffron"
          >
            KEEP EXPLORING
          </button>
        </div>
      </div>
    </div>
  );
}
