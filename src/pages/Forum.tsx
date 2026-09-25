import { useMemo, useState } from 'react';
import { useCommunity, likeCount, helpfulCount } from '../communityStore';
import { useUi } from '../uiStore';
import { CATEGORY_FILTERS, FILTER_MATCHES, type CategoryFilter } from '../data/forumPosts';
import { indianPlaces, placeById } from '../data/indianPlaces';
import { PostCard } from '../components/Forum/PostCard';
import { PageHeader, Chip, EmptyState, ActionButton, DemoDataTag } from '../components/ui/primitives';
import { Link } from '../router';

type Sort = 'Trending' | 'Latest' | 'Nearby' | 'Most Helpful';
const SORTS: Sort[] = ['Trending', 'Latest', 'Nearby', 'Most Helpful'];

/**
 * ------------------------------------------------------------------
 * /forum — COMMUNITY
 * ------------------------------------------------------------------
 * A destination magazine rather than a message board. Filtering, search,
 * location scoping and sorting all run on local state over the same post array
 * the passport writes into, so a contribution published in the document flow
 * appears here immediately.
 *
 * "Nearby" has no geolocation in the prototype; it sorts by proximity to the
 * currently selected location filter, and falls back to south-to-north order
 * across India. It is labelled honestly rather than faked.
 */
export function Forum() {
  const posts = useCommunity((s) => s.posts);
  const likedIds = useCommunity((s) => s.likedIds);
  const helpfulIds = useCommunity((s) => s.helpfulIds);
  const openDocument = useUi((s) => s.openDocument);

  const [filter, setFilter] = useState<CategoryFilter>('ALL');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState<string>('ALL');
  // Newest first by default: a magazine leads with the fresh dispatch, and
  // a contribution just verified in the document flow lands at the top of
  // the feed instead of the bottom.
  const [sort, setSort] = useState<Sort>('Latest');

  const visible = useMemo(() => {
    const accepted = FILTER_MATCHES[filter];
    const q = query.trim().toLowerCase();

    let list = posts.filter((p) => {
      if (accepted && !accepted.includes(p.category)) return false;
      if (location !== 'ALL' && p.destination !== location) return false;
      if (!q) return true;
      const place = placeById(p.destination);
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        (place ? `${place.name} ${place.state}`.toLowerCase().includes(q) : false)
      );
    });

    list = [...list];
    switch (sort) {
      case 'Latest':
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case 'Most Helpful':
        list.sort((a, b) => helpfulCount(b, helpfulIds) - helpfulCount(a, helpfulIds));
        break;
      case 'Nearby': {
        // Anchor on the selected location; otherwise run south to north.
        const anchor = location !== 'ALL' ? placeById(location) : null;
        list.sort((a, b) => {
          const pa = placeById(a.destination);
          const pb = placeById(b.destination);
          if (!pa || !pb) return 0;
          if (!anchor) return pa.coordinates[0] - pb.coordinates[0];
          const d = (p: typeof pa) =>
            Math.hypot(p.coordinates[0] - anchor.coordinates[0], p.coordinates[1] - anchor.coordinates[1]);
          return d(pa) - d(pb);
        });
        break;
      }
      default:
        list.sort(
          (a, b) =>
            likeCount(b, likedIds) + b.comments.length * 6 - (likeCount(a, likedIds) + a.comments.length * 6),
        );
    }
    return list;
  }, [posts, filter, query, location, sort, likedIds, helpfulIds]);

  const verifiedCount = posts.filter((p) => p.verified).length;
  const contributorCount = new Set(posts.map((p) => p.authorId)).size;

  return (
    <div className="relative z-10 bg-ink">
      <PageHeader
        eyebrow="TWINTRIP COMMUNITY"
        title={
          <>
            <span className="block">COMMUNITY</span>
          </>
        }
        lede="India is full of places worth discovering."
        sub="Stories, hidden places and experiences shared by travellers and locals. Every post belongs to a destination, so every post makes that destination easier to find."
      >
        <div className="flex flex-wrap items-center gap-3">
          <ActionButton tone="solid" onClick={() => openDocument()}>
            DOCUMENT YOUR JOURNEY
          </ActionButton>
          <Link
            to="/passport"
            data-cursor="GO"
            className="tech border border-bone/25 px-5 py-3 text-bone/80 transition-colors hover:border-saffron/60 hover:text-saffron"
          >
            OPEN PASSPORT
          </Link>
        </div>
      </PageHeader>

      {/* ---------------- community pulse ---------------- */}
      <div className="border-b border-bone/10 px-5 py-6 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-10 gap-y-3">
          <span className="tech">
            <span className="text-bone">{posts.length}</span> POSTS
          </span>
          <span className="tech">
            <span className="text-teal">{verifiedCount}</span> VERIFIED EXPERIENCES
          </span>
          <span className="tech">
            <span className="text-bone">{contributorCount}</span> CONTRIBUTORS
          </span>
          <span className="tech">
            <span className="text-bone">{indianPlaces.length}</span> DESTINATIONS
          </span>
          <DemoDataTag />
        </div>
      </div>

      {/* ---------------- controls ---------------- */}
      <div className="sticky top-0 z-30 border-b border-bone/10 bg-ink/92 px-5 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORY_FILTERS.map((f) => (
              <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
                {f}
              </Chip>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex min-w-[230px] flex-1 items-center gap-2 border-b border-bone/15 pb-2 focus-within:border-saffron">
              <span aria-hidden="true" className="text-bone/40">
                ⌕
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search destinations, stories or places..."
                aria-label="Search the community"
                className="w-full bg-transparent text-[14px] text-bone outline-none placeholder:text-muted"
              />
            </div>

            <label className="flex items-center gap-2">
              <span className="tech">LOCATION</span>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="tech border border-bone/15 bg-ink px-2.5 py-2 text-bone/80 outline-none focus:border-saffron"
              >
                <option value="ALL">ALL INDIA</option>
                {indianPlaces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.toUpperCase()}, {p.state.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2">
              <span className="tech">SORT</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="tech border border-bone/15 bg-ink px-2.5 py-2 text-bone/80 outline-none focus:border-saffron"
              >
                {SORTS.map((s) => (
                  <option key={s} value={s}>
                    {s.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* ---------------- feed ---------------- */}
      <div className="px-5 pb-24 md:px-8">
        <div className="mx-auto max-w-6xl">
          {visible.length ? (
            visible.map((post, i) => <PostCard key={post.id} post={post} index={i} />)
          ) : (
            <div className="py-16">
              <EmptyState line="Your next story could help someone discover India." />
              <div className="mt-6 flex justify-center">
                <ActionButton tone="solid" onClick={() => openDocument(location !== 'ALL' ? location : undefined)}>
                  CREATE FIRST STORY
                </ActionButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
