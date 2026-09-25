import { useMemo } from 'react';
import { useCommunity } from '../communityStore';
import { useUi } from '../uiStore';
import { userById } from '../data/users';
import { badgeById } from '../data/badges';
import { placeById } from '../data/indianPlaces';
import { BadgeArt } from '../components/Badges/BadgeArt';
import {
  PageHeader,
  Avatar,
  VerifiedTag,
  ActionButton,
  EmptyState,
  Stat,
  DemoDataTag,
} from '../components/ui/primitives';
import { Link } from '../router';

/**
 * ------------------------------------------------------------------
 * /community/user/:userId — CONTRIBUTOR PROFILE
 * ------------------------------------------------------------------
 * Opened from a byline in the forum. Reputation and passport are the
 * same record seen from two ends, so the profile shows both: what this
 * person has contributed to the community, and the badges it earned.
 */
export function ContributorProfile({ userId }: { userId: string }) {
  const user = userById(userId);
  const posts = useCommunity((s) => s.posts);
  const journeys = useCommunity((s) => s.journeys);
  const unlocked = useCommunity((s) => s.unlockedBadgeIds);
  const stats = useCommunity((s) => s.stats);
  const openDocument = useUi((s) => s.openDocument);

  const theirPosts = useMemo(
    () => posts.filter((p) => p.authorId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [posts, userId],
  );

  if (!user) {
    return (
      <div className="relative z-10 min-h-screen bg-ink px-5 pt-36 md:px-8">
        <div className="mx-auto max-w-3xl">
          <EmptyState line="This contributor is not in the prototype roster." action={{ label: 'BACK TO COMMUNITY', to: '/forum' }} />
        </div>
      </div>
    );
  }

  const verifiedCount = theirPosts.filter((p) => p.verified).length;

  // For the current user the record is live: it is the passport, read out
  // loud. Other contributors keep their authored demo numbers.
  const isYou = user.isYou === true;
  const numbers = isYou
    ? {
        destinations: new Set(journeys.map((j) => j.placeId)).size,
        stories: stats.storiesContributed,
        verified: verifiedCount,
        badgeIds: unlocked,
      }
    : { ...user.stats, badgeIds: user.badgeIds };

  const theirBadges = numbers.badgeIds.map((id) => badgeById(id)).filter(Boolean);

  return (
    <div className="relative z-10 bg-ink pb-24">
      <PageHeader
        eyebrow="PROFILE"
        title={
          <span className="block">{user.name}</span>
        }
        lede={user.bio}
      >
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-4">
            <Avatar userId={user.id} size={56} />
            <div>
              <div className="text-[16px] text-bone">{user.handle}</div>
              <div className="tech mt-1 text-teal">
                {user.role}
                {verifiedCount > 0 && ' · VERIFIED EXPERIENCES'}
              </div>
            </div>
          </div>
          <div className="tech text-bone/40">{user.base}</div>
          <Link to="/forum" data-cursor="BACK" className="tech border border-bone/25 px-5 py-3 text-bone/80 transition-colors hover:border-saffron/60 hover:text-saffron">
            ← COMMUNITY
          </Link>
        </div>
      </PageHeader>

      <div className="px-5 md:px-8">
        <div className="mx-auto max-w-6xl">
          {/* ---------------- the numbers ---------------- */}
          <div className="grid grid-cols-2 gap-px border border-bone/10 bg-bone/10 md:grid-cols-4">
            <Stat value={numbers.destinations} label="DESTINATIONS" />
            <Stat value={numbers.stories} label="STORIES" />
            <Stat value={numbers.verified} label="VERIFIED EXPERIENCES" />
            <div className="relative bg-ink p-6">
              <div className="display text-[38px] leading-none text-bone md:text-[52px]">
                {numbers.badgeIds.length}
              </div>
              <div className="tech mt-2.5">BADGES</div>
              {isYou && (
                <span className="tech absolute right-4 top-4 border border-saffron/40 px-1.5 py-0.5 text-[8px] text-saffron">
                  YOU · LIVE
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            {isYou ? (
              <span className="tech text-bone/40">LIVE FROM YOUR PASSPORT</span>
            ) : (
              <>
                <DemoDataTag />
                <span className="tech text-bone/40">CONTRIBUTOR RECORDS ARE DEMO DATA</span>
              </>
            )}
          </div>

          {/* ---------------- two columns ---------------- */}
          <div className="mt-10 grid gap-px border border-bone/10 bg-bone/10 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* contributions */}
            <div className="bg-ink p-6 md:p-9">
              <div className="flex items-baseline justify-between">
                <h2 className="display text-[28px] leading-none text-bone">Recent contributions</h2>
                <span className="tech text-bone/40">{theirPosts.length} IN PROTOTYPE</span>
              </div>

              {theirPosts.length ? (
                <div className="mt-8 space-y-0 divide-y divide-bone/10">
                  {theirPosts.map((p) => {
                    const place = placeById(p.destination);
                    return (
                      <Link
                        key={p.id}
                        to={`/forum/${p.id}`}
                        data-cursor="READ"
                        className="group grid grid-cols-[1fr,auto] items-center gap-4 py-4"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="tech text-bone/45">{p.category}</span>
                            <span className="tech text-saffron/80">
                              {place ? `${place.name.toUpperCase()}, ${place.state.toUpperCase()}` : p.destination.toUpperCase()}
                            </span>
                            {p.verified && <VerifiedTag />}
                          </div>
                          <div className="mt-1.5 truncate text-[15px] text-bone/85 transition-colors group-hover:text-saffron">
                            {p.title}
                          </div>
                        </div>
                        <span className="tech text-bone/35">{p.createdAt}</span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-8 text-[14px] leading-relaxed text-muted">
                  No posts from this contributor in the prototype yet.
                </p>
              )}

              {isYou && (
                <div className="mt-9 border-t border-bone/10 pt-7">
                  <div className="tech mb-3 text-saffron">ADD TO YOUR RECORD</div>
                  <p className="max-w-lg text-[14px] leading-relaxed text-bone/70">
                    A verified contribution lands here and in your passport at the same time.
                  </p>
                  <div className="mt-5">
                    <ActionButton tone="solid" onClick={() => openDocument()}>
                      DOCUMENT YOUR JOURNEY
                    </ActionButton>
                  </div>
                </div>
              )}
            </div>

            {/* badges */}
            <aside className="bg-ink-2 p-6 md:p-9">
              <div className="tech text-saffron">BADGES HELD</div>
              {theirBadges.length ? (
                <div className="mt-6 flex flex-wrap gap-4">
                  {theirBadges.map((b) => b && <BadgeArt key={b.id} badge={b} size={78} />)}
                </div>
              ) : (
                <p className="mt-6 text-[13px] leading-relaxed text-muted">
                  No badges in the prototype set yet.
                </p>
              )}

              <div className="mt-9 border-t border-bone/10 pt-7">
                <div className="tech">BASE</div>
                <p className="mt-2 text-[15px] text-bone/80">{user.base}</p>
              </div>

              <div className="mt-7 flex flex-col gap-2.5">
                <Link
                  to="/forum"
                  data-cursor="FEED"
                  className="tech text-bone/70 transition-colors hover:text-saffron"
                >
                  → THEIR POSTS IN THE COMMUNITY
                </Link>
                <Link
                  to="/passport"
                  data-cursor="PASSPORT"
                  className="tech text-bone/70 transition-colors hover:text-saffron"
                >
                  → YOUR PASSPORT
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
