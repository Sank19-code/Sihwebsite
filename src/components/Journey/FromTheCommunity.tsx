import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useCommunity } from '../../communityStore';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { placeById } from '../../data/indianPlaces';
import { navigate, Link } from '../../router';

/**
 * ------------------------------------------------------------------
 * FROM THE COMMUNITY  —  live feed on the home scroll
 * ------------------------------------------------------------------
 * Three recent posts pulled straight from the store that the document
 * flow writes into, so a contribution made anywhere surfaces here on the
 * next visit home. They are "live-looking" by construction: same data
 * as /forum, not a static mock.
 */
export function FromTheCommunity() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const posts = useCommunity((s) => s.posts);

  // Newest first, three across the home page.
  const feed = posts.slice(0, 3);

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.ftc-el',
        { y: 26, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: { trigger: root.current!, start: 'top 74%', once: true },
        },
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={root} className="relative z-20 border-t border-bone/10 bg-ink-2 px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="ftc-el flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <div className="tech text-saffron">From the community</div>
            <h2 className="display mt-3 text-[clamp(28px,4.6vw,56px)] leading-none text-bone">
              What travellers are saying
            </h2>
          </div>
          <Link
            to="/forum"
            data-cursor="COMMUNITY"
            className="tech border border-bone/25 px-5 py-3 text-bone/80 transition-colors hover:border-saffron/60 hover:text-saffron"
          >
            VIEW COMMUNITY →
          </Link>
        </div>

        <div className="mt-10 grid gap-px border border-bone/10 bg-bone/10 md:grid-cols-3">
          {feed.map((p) => {
            const place = placeById(p.destination);
            const verified = p.verified;
            return (
              <button
                key={p.id}
                onClick={() => navigate(`/forum/${p.id}`)}
                data-cursor="READ"
                className="ftc-el group block bg-ink-2 p-6 text-left transition-colors hover:bg-ink-3 md:p-7"
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="tech text-saffron">{place?.name.toUpperCase()}</span>
                  <span className="tech text-bone/35">{p.category}</span>
                  {verified && (
                    <span className="tech text-teal">
                      ✓ <span className="text-bone/40">VERIFIED</span>
                    </span>
                  )}
                </div>
                <div className="mt-4 text-[19px] leading-snug text-bone transition-colors group-hover:text-saffron">
                  &ldquo;{p.excerpt}&rdquo;
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="tech text-bone/45">{p.createdAt}</span>
                  <span className="tech text-bone/45 transition-colors group-hover:text-saffron">READ →</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
