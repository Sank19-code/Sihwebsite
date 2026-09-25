import { useMemo, useState } from 'react';
import { placeById } from '../data/indianPlaces';
import { useCommunity, placeActivity, displayScale } from '../communityStore';
import { useUi } from '../uiStore';
import { badgeForPlace } from '../data/badges';
import type { PostCategory } from '../data/forumPosts';
import { PostCard } from '../components/Forum/PostCard';
import { PageHeader, Chip, EmptyState, ActionButton, DemoDataTag } from '../components/ui/primitives';
import { Link } from '../router';
import { formatCoords } from '../lib/geo';

const TABS: { label: string; match: PostCategory[] | null }[] = [
  { label: 'ALL', match: null },
  { label: 'STORIES', match: ['STORY'] },
  { label: 'HIDDEN GEMS', match: ['HIDDEN GEM'] },
  { label: 'FOOD', match: ['FOOD'] },
  { label: 'TIPS', match: ['TRAVEL TIP', 'LOCAL GUIDE'] },
  { label: 'EXPERIENCES', match: ['EXPERIENCE', 'EVENT'] },
];

/**
 * ------------------------------------------------------------------
 * /destination/:placeId/community
 * ------------------------------------------------------------------
 * Every destination gets its own community area. This is the surface that
 * makes the economic argument concrete: the more verified contributions a
 * place accumulates, the more discoverable it becomes, and the locals listed
 * on the destination page are the ones who benefit.
 */
export function DestinationCommunity({ placeId }: { placeId: string }) {
  const place = placeById(placeId);
  const posts = useCommunity((s) => s.posts);
  const unlocked = useCommunity((s) => s.unlockedBadgeIds);
  const openDocument = useUi((s) => s.openDocument);
  const [tab, setTab] = useState(0);

  const placePosts = useMemo(() => posts.filter((p) => p.destination === placeId), [posts, placeId]);
  const activity = useMemo(() => placeActivity(posts, placeId), [posts, placeId]);

  const visible = useMemo(() => {
    const match = TABS[tab].match;
    return match ? placePosts.filter((p) => match.includes(p.category)) : placePosts;
  }, [placePosts, tab]);

  if (!place) {
    return (
      <div className="relative z-10 min-h-screen bg-ink px-5 pt-36 md:px-8">
        <div className="mx-auto max-w-3xl">
          <EmptyState line="No destination with that name yet." action={{ label: 'OPEN THE COMMUNITY', to: '/forum' }} />
        </div>
      </div>
    );
  }

  const badge = badgeForPlace(place.id);
  const badgeUnlocked = badge ? unlocked.includes(badge.id) : false;

  return (
    <div className="relative z-10 bg-ink pb-24">
      <PageHeader
        eyebrow={`${formatCoords(place.coordinates[0], place.coordinates[1])}`}
        title={
          <>
            <span className="block">{place.name}</span>
            <span className="block text-[0.42em] tracking-[0.2em] text-muted">{place.state.toUpperCase()}</span>
          </>
        }
        lede="Community stories"
        sub={place.tagline}
      >
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <span className="tech">
            <span className="text-bone">{displayScale(activity.stories)}</span> STORIES
          </span>
          <span className="tech">
            <span className="text-teal">{displayScale(activity.verified, 7)}</span> VERIFIED
          </span>
          <span className="tech">
            <span className="text-bone">{displayScale(activity.contributors, 4)}</span> CONTRIBUTORS
          </span>
          <DemoDataTag />
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <ActionButton tone="solid" onClick={() => openDocument(place.id)}>
            DOCUMENT YOUR JOURNEY
          </ActionButton>
          <Link
            to={`/destination/${place.id}`}
            data-cursor="GO"
            className="tech border border-bone/25 px-5 py-3 text-bone/80 transition-colors hover:border-saffron/60 hover:text-saffron"
          >
            DESTINATION PAGE
          </Link>
          {badge && (
            <Link
              to="/passport/badges"
              data-cursor="GO"
              className={`tech border px-5 py-3 transition-colors ${
                badgeUnlocked
                  ? 'border-teal/50 text-teal hover:bg-teal hover:text-ink'
                  : 'border-bone/25 text-bone/60 hover:border-saffron/60 hover:text-saffron'
              }`}
            >
              {badgeUnlocked ? `✓ ${badge.name.toUpperCase()}` : `LOCKED · ${badge.name.toUpperCase()}`}
            </Link>
          )}
        </div>
      </PageHeader>

      <div className="sticky top-0 z-30 border-b border-bone/10 bg-ink/92 px-5 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto">
          {TABS.map((t, i) => (
            <Chip key={t.label} active={tab === i} onClick={() => setTab(i)}>
              {t.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="px-5 md:px-8">
        <div className="mx-auto max-w-6xl">
          {visible.length ? (
            visible.map((p, i) => <PostCard key={p.id} post={p} index={i} />)
          ) : (
            <div className="py-16">
              <EmptyState line={`Nothing in this category for ${place.name} yet. Your next story could help someone discover India.`} />
              <div className="mt-6 flex justify-center">
                <ActionButton tone="solid" onClick={() => openDocument(place.id)}>
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
