import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link, navigate } from '../../router';
import { placeById } from '../../data/indianPlaces';
import type { ForumPost } from '../../data/forumPosts';
import { useCommunity, likeCount } from '../../communityStore';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { Poster } from '../ui/Poster';
import { AuthorLine, VerifiedTag } from '../ui/primitives';
import { formatCoords } from '../../lib/geo';

gsap.registerPlugin(ScrollTrigger);

/**
 * ------------------------------------------------------------------
 * FORUM POST CARD
 * ------------------------------------------------------------------
 * Editorial, not a feed row. The destination sits above the headline because
 * the place is the subject and the author is the byline — that ordering is the
 * whole difference between this and a social timeline.
 *
 * The "photograph" is the procedural <Poster> for the destination, parallaxed
 * on scroll and zoomed on hover, same as the rest of the site.
 */

export function PostCard({ post, index = 0 }: { post: ForumPost; index?: number }) {
  const place = placeById(post.destination);
  const liked = useCommunity((s) => s.likedIds.includes(post.id));
  const saved = useCommunity((s) => s.savedIds.includes(post.id));
  const likedIds = useCommunity((s) => s.likedIds);
  const toggleLike = useCommunity((s) => s.toggleLike);
  const toggleSave = useCommunity((s) => s.toggleSave);
  const reduced = usePrefersReducedMotion();

  const root = useRef<HTMLElement>(null);
  const art = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          // Cards that enter together cascade by three rather than all at once.
          delay: (index % 3) * 0.09,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        },
      );
      if (art.current) {
        gsap.fromTo(
          art.current,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      }
    }, el);
    return () => ctx.revert();
  }, [reduced, index]);

  if (!place) return null;

  const media = post.media[0];
  const to = `/forum/${post.id}`;

  return (
    <article
      ref={root}
      className="group grid gap-6 border-b border-bone/10 py-9 md:grid-cols-[minmax(0,1fr)_minmax(0,300px)] md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '420px' }}
    >
      {/* ---------------- text column ---------------- */}
      <div className="order-2 md:order-1">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            to={`/destination/${place.id}/community`}
            data-cursor="PLACE"
            className="tech text-saffron transition-colors hover:text-bone"
          >
            {place.name.toUpperCase()}, {place.state.toUpperCase()}
          </Link>
          <span className="tech text-bone/35">{post.category}</span>
          {post.verified && <VerifiedTag />}
        </div>

        <h2 className="mt-4">
          <Link
            to={to}
            data-cursor="READ"
            className="display block text-[clamp(26px,4.2vw,44px)] leading-[0.92] text-bone transition-colors group-hover:text-saffron"
          >
            {post.title}
          </Link>
        </h2>

        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-bone/70">
          {'“'}
          {post.excerpt}
          {'”'}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
          <AuthorLine userId={post.authorId} size={32} />

          <div className="flex items-center gap-5">
            <button
              onClick={() => toggleLike(post.id)}
              aria-pressed={liked}
              aria-label={`Like ${post.title}`}
              data-cursor="LIKE"
              className={`tech flex items-center gap-1.5 transition-colors ${liked ? 'text-vermilion' : 'text-bone/50 hover:text-bone'}`}
            >
              <span aria-hidden="true">{liked ? '♥' : '♡'}</span>
              {likeCount(post, likedIds)}
            </button>

            <Link
              to={to}
              data-cursor="READ"
              className="tech flex items-center gap-1.5 text-bone/50 transition-colors hover:text-bone"
            >
              <span aria-hidden="true">💬</span>
              {post.comments.length}
            </Link>

            <button
              onClick={() => toggleSave(post.id)}
              aria-pressed={saved}
              aria-label={`Save ${post.title}`}
              data-cursor="SAVE"
              className={`tech transition-colors ${saved ? 'text-saffron' : 'text-bone/50 hover:text-bone'}`}
            >
              {saved ? '🔖 SAVED' : '🔖 SAVE'}
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={to}
            data-cursor="READ"
            className="tech border border-bone/20 px-4 py-2.5 text-bone/70 transition-colors hover:border-saffron/60 hover:text-saffron"
          >
            {post.category === 'STORY' ? 'VIEW STORY' : 'READ POST'}
          </Link>
          <Link
            to={`/destination/${place.id}`}
            data-cursor="PLACE"
            className="tech border border-bone/20 px-4 py-2.5 text-bone/70 transition-colors hover:border-saffron/60 hover:text-saffron"
          >
            VIEW DESTINATION
          </Link>
        </div>
      </div>

      {/* ---------------- art column ---------------- */}
      <button
        onClick={() => navigate(to)}
        data-cursor="READ"
        aria-label={`Open ${post.title}`}
        className="order-1 block w-full text-left md:order-2"
      >
        <div className="relative aspect-[4/3] overflow-hidden md:aspect-[4/5]">
          <div
            ref={art}
            className="absolute inset-[-8%] transition-transform duration-[900ms] ease-cine group-hover:scale-[1.06]"
          >
            <Poster
              terrain={media?.terrain ?? place.terrain}
              palette={place.palette}
              className="absolute inset-0"
            />
          </div>

          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
            <div className="flex items-start justify-between">
              <span className="tech bg-ink/55 px-2 py-1 text-bone/90 backdrop-blur-sm">
                {formatCoords(place.coordinates[0], place.coordinates[1])}
              </span>
              {media?.kind === 'video' && (
                <span className="tech bg-ink/55 px-2 py-1 text-saffron backdrop-blur-sm">
                  ▶ {media.duration ? `0:${String(media.duration).padStart(2, '0')}` : 'CLIP'}
                </span>
              )}
            </div>
            {media?.caption && (
              <span className="tech normal-case tracking-[0.1em] text-bone/70">{media.caption}</span>
            )}
          </div>
        </div>
      </button>
    </article>
  );
}
