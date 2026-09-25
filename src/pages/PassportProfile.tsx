import { useMemo } from 'react';
import { useCommunity } from '../communityStore';
import { useUi } from '../uiStore';
import { passportSeed, deriveIdentity, favoriteLandscapes } from '../data/passport';
import { userById, users } from '../data/users';
import { placeById } from '../data/indianPlaces';
import { badgeById } from '../data/badges';
import { BadgeArt } from '../components/Badges/BadgeArt';
import {
  PageHeader,
  Stat,
  ActionButton,
  DemoDataTag,
  Avatar,
  VerifiedTag,
} from '../components/ui/primitives';
import { Link } from '../router';

/**
 * ------------------------------------------------------------------
 * /passport/profile — MY TRAVEL IDENTITY
 * ------------------------------------------------------------------
 * The traveller's own record, live from the store: who they are now,
 * what they have documented, and where it points next. The demo
 * contributor roster underneath shows that the same profile shape
 * belongs to other travellers too, which is how the passport and the
 * forum reputation stay the same object.
 */
export function PassportProfile() {
  const journeys = useCommunity((s) => s.journeys);
  const unlocked = useCommunity((s) => s.unlockedBadgeIds);
  const stats = useCommunity((s) => s.stats);
  const posts = useCommunity((s) => s.posts);
  const openDocument = useUi((s) => s.openDocument);

  const me = userById(passportSeed.userId)!;
  const placeIds = useMemo(() => journeys.map((j) => j.placeId), [journeys]);
  const identity = useMemo(
    () => deriveIdentity(placeIds, unlocked.length),
    [placeIds, unlocked.length],
  );
  const landscapes = useMemo(() => favoriteLandscapes(placeIds), [placeIds]);
  const myPosts = useMemo(() => posts.filter((p) => p.authorId === me.id), [posts, me.id]);
  const recent = journeys.slice(0, 4);

  return (
    <div className="relative z-10 bg-ink pb-24">
      <PageHeader
        eyebrow="MY TRAVEL IDENTITY"
        title={
          <>
            <span className="block">{me.name}</span>
            <span className="block text-[0.34em] tracking-[0.12em] text-muted">{identity.title}</span>
          </>
        }
        lede={me.bio}
        sub={`${me.base} · ${passportSeed.passportNo}`}
      >
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-4">
            <Avatar userId={me.id} size={56} />
            <div>
              <div className="text-[16px] text-bone">{me.handle}</div>
              <div className="tech mt-1">{me.role}</div>
            </div>
          </div>
          <Link
            to="/passport"
            data-cursor="BACK"
            className="tech border border-bone/25 px-5 py-3 text-bone/80 transition-colors hover:border-saffron/60 hover:text-saffron"
          >
            ← PASSPORT
          </Link>
        </div>
      </PageHeader>

      <div className="px-5 md:px-8">
        <div className="mx-auto max-w-6xl">
          {/* ---------------- stats ---------------- */}
          <div className="grid grid-cols-2 gap-px border border-bone/10 bg-bone/10 md:grid-cols-4">
            <Stat value={journeys.length} label="DESTINATIONS" />
            <Stat value={unlocked.length} label="BADGES" />
            <Stat value={stats.storiesContributed} label="STORIES" />
            <Stat value={journeys.length} label="VERIFIED EXPERIENCES" />
          </div>

          {/* ---------------- identity ---------------- */}
          <div className="mt-10 grid gap-px border border-bone/10 bg-bone/10 lg:grid-cols-[1fr,340px]">
            <div className="bg-ink p-7 md:p-10">
              <div className="tech text-saffron">YOUR TRAVEL IDENTITY</div>
              <div className="display mt-4 text-[clamp(34px,5vw,64px)] leading-none text-bone">
                {identity.title}
              </div>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-bone/75">
                {journeys.length} destinations. {unlocked.length} badges. {stats.storiesContributed} stories.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {identity.traits.map((t) => (
                  <span key={t} className="tech border border-saffron/40 px-3 py-1.5 text-saffron/90">
                    {t}
                  </span>
                ))}
              </div>
              {landscapes.length > 0 && (
                <div className="mt-9">
                  <div className="tech mb-3 text-bone/50">FAVORITE LANDSCAPES</div>
                  <div className="flex flex-wrap gap-2">
                    {landscapes.map((l) => (
                      <span key={l} className="tech border border-bone/15 px-3.5 py-2 text-bone/75">
                        {l.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-9 flex flex-wrap gap-3">
                <ActionButton tone="solid" onClick={() => openDocument()}>
                  NEXT JOURNEY
                </ActionButton>
                <Link
                  to="/passport/badges"
                  data-cursor="COLLECT"
                  className="tech border border-bone/25 px-5 py-3 text-bone/80 transition-colors hover:border-saffron/60 hover:text-saffron"
                >
                  BADGE COLLECTION
                </Link>
              </div>
            </div>

            <div className="bg-ink-2 p-7 md:p-10">
              <div className="tech flex items-center justify-between">
                UNLOCKED
                <span className="text-saffron">{unlocked.length}</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {unlocked.slice(0, 9).map((id) => {
                  const badge = badgeById(id);
                  return badge ? (
                    <div key={id} title={badge.name} className="transition-transform hover:-translate-y-1">
                      <BadgeArt badge={badge} size={64} />
                    </div>
                  ) : null;
                })}
                {!unlocked.length && (
                  <p className="text-[13px] leading-relaxed text-muted">
                    No badges yet. The first verified contribution starts the collection.
                  </p>
                )}
              </div>
              {unlocked.length > 9 && (
                <div className="tech mt-4">
                  +{unlocked.length - 9} MORE IN THE <span className="text-saffron">COLLECTION</span>
                </div>
              )}
            </div>
          </div>

          {/* ---------------- recent journeys ---------------- */}
          <div className="mt-12">
            <div className="flex items-baseline justify-between">
              <h2 className="display text-[clamp(24px,3.6vw,40px)] leading-none text-bone">Recent journeys</h2>
              <Link to="/passport" data-cursor="ALL" className="tech text-bone/50 hover:text-saffron">
                ALL STAMPS →
              </Link>
            </div>
            <div className="mt-7 grid gap-px border border-bone/10 bg-bone/10 sm:grid-cols-2 lg:grid-cols-4">
              {recent.map((j) => {
                const place = placeById(j.placeId);
                return (
                  <Link
                    key={j.placeId}
                    to={`/destination/${j.placeId}`}
                    data-cursor="OPEN"
                    className="group block bg-ink p-5 transition-colors hover:bg-ink-2"
                  >
                    <VerifiedTag label="STAMPED" />
                    <div className="display mt-4 text-[20px] leading-tight text-bone transition-colors group-hover:text-saffron">
                      {place?.name}
                    </div>
                    <div className="tech mt-1.5">{place?.state.toUpperCase()}</div>
                    <div className="tech mt-4 text-bone/40">{j.date}</div>
                  </Link>
                );
              })}
              {!recent.length && (
                <div className="bg-ink p-7 sm:col-span-2 lg:col-span-4">
                  <p className="text-[14px] text-bone/60">No journeys stamped yet.</p>
                  <ActionButton className="mt-5" onClick={() => openDocument()}>
                    DOCUMENT YOUR FIRST
                  </ActionButton>
                </div>
              )}
            </div>
          </div>

          {/* ---------------- recent contributions ---------------- */}
          <div className="mt-12">
            <div className="flex items-baseline justify-between">
              <h2 className="display text-[clamp(24px,3.6vw,40px)] leading-none text-bone">Recent contributions</h2>
              <Link to="/forum" data-cursor="FEED" className="tech text-bone/50 hover:text-saffron">
                COMMUNITY FEED →
              </Link>
            </div>
            {myPosts.length ? (
              <div className="mt-7 divide-y divide-bone/10 border border-bone/10 bg-ink">
                {myPosts.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    to={`/forum/${p.id}`}
                    data-cursor="READ"
                    className="group flex flex-wrap items-baseline gap-x-5 gap-y-2 px-6 py-5 transition-colors hover:bg-ink-2"
                  >
                    <span className="tech text-bone/40">{p.createdAt}</span>
                    <span className="tech text-saffron/70">{p.category}</span>
                    <span className="text-[15px] text-bone/85 transition-colors group-hover:text-saffron">{p.title}</span>
                    {p.verified && <span className="tech ml-auto text-teal">✓ VERIFIED</span>}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-7 text-[14px] leading-relaxed text-muted">
                Nothing of yours in the feed yet. The first documented journey will land here and in the community
                together.
              </p>
            )}
          </div>

          {/* ---------------- community roster ---------------- */}
          <div className="mt-16">
            <div className="flex items-center justify-between">
              <h2 className="display text-[clamp(24px,3.6vw,40px)] leading-none text-bone">The community</h2>
              <Link to="/forum" data-cursor="FEED" className="tech text-bone/50 hover:text-saffron">
                OPEN FORUM →
              </Link>
            </div>
            <p className="tech mt-4 mb-8 leading-relaxed">
              YOUR PROFILE AND THESE PROFILES ARE THE SAME RECORD, SEEN FROM BOTH ENDS · DEMO ROSTER
            </p>
            <div className="grid gap-px border border-bone/10 bg-bone/10 sm:grid-cols-2 lg:grid-cols-3">
              {users
                .filter((u) => !u.isYou)
                .slice(0, 6)
                .map((u) => (
                  <Link
                    key={u.id}
                    to={`/community/user/${u.id}`}
                    data-cursor="PROFILE"
                    className="group flex items-center gap-4 bg-ink p-5 transition-colors hover:bg-ink-2"
                  >
                    <Avatar userId={u.id} size={44} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] text-bone transition-colors group-hover:text-saffron">
                        {u.handle}
                      </div>
                      <div className="tech mt-1">{u.role}</div>
                    </div>
                    <div className="tech shrink-0 text-bone/40">
                      {u.stats.verified} ✓
                    </div>
                  </Link>
                ))}
            </div>
            <div className="mt-6 flex items-center gap-3">
              <DemoDataTag />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
