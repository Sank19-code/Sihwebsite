import { useMemo } from 'react';
import { placeById } from '../data/indianPlaces';
import { destinations } from '../data/destinations';
import { localsFor } from '../data/locals';
import { badgeForPlace } from '../data/badges';
import { useCommunity, placeActivity, displayScale } from '../communityStore';
import { useUi } from '../uiStore';
import { useApp } from '../store';
import { Link, navigate } from '../router';
import { Poster } from '../components/ui/Poster';
import { BadgeArt } from '../components/Badges/BadgeArt';
import { ActionButton, EmptyState, VerifiedTag, DemoDataTag, AuthorLine } from '../components/ui/primitives';
import { formatCoords } from '../lib/geo';

/**
 * ------------------------------------------------------------------
 * /destination/:placeId — DESTINATION HUB
 * ------------------------------------------------------------------
 * One place, six ways in: MATCH · STORY · PLAN · LOCALS · COMMUNITY · PASSPORT.
 *
 * The full cinematic twin reveal still lives on the home scroll — this page is
 * the linkable, returnable version of it, and the surface where the community
 * and the passport attach to a destination.
 */
export function Destination({ placeId }: { placeId: string }) {
  const place = placeById(placeId);
  const posts = useCommunity((s) => s.posts);
  const journeys = useCommunity((s) => s.journeys);
  const unlocked = useCommunity((s) => s.unlockedBadgeIds);
  const openDocument = useUi((s) => s.openDocument);
  const select = useApp((s) => s.select);

  const twinOf = useMemo(() => destinations.filter((d) => d.twin === placeId), [placeId]);
  const activity = useMemo(() => placeActivity(posts, placeId), [posts, placeId]);
  const placePosts = useMemo(
    () => posts.filter((p) => p.destination === placeId).slice(0, 3),
    [posts, placeId],
  );

  if (!place) {
    return (
      <div className="relative z-10 min-h-screen bg-ink px-5 pt-36 md:px-8">
        <div className="mx-auto max-w-3xl">
          <EmptyState line="No destination with that name yet." action={{ label: 'EXPLORE THE GLOBE', to: '/' }} />
        </div>
      </div>
    );
  }

  const badge = badgeForPlace(place.id);
  const journey = journeys.find((j) => j.placeId === place.id);
  const badgeUnlocked = badge ? unlocked.includes(badge.id) : false;
  const locals = localsFor(place.id);
  const lead = twinOf[0];

  return (
    <div className="relative z-10 bg-ink pb-24">
      {/* ---------------- hero ---------------- */}
      <header className="relative h-[62vh] min-h-[380px] overflow-hidden">
        <Poster terrain={place.terrain} palette={place.palette} className="absolute inset-0" intensity={1.3} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/60" />

        <div className="absolute inset-x-0 bottom-0 px-5 pb-10 md:px-8 md:pb-14">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center gap-4">
              <span className="tech text-saffron">{formatCoords(place.coordinates[0], place.coordinates[1])}</span>
              {journey && <VerifiedTag label="PASSPORT DESTINATION" />}
            </div>
            <h1 className="display mt-4 text-[clamp(48px,11vw,150px)] leading-[0.84] text-bone">{place.name}</h1>
            <div className="tech mt-4">{place.state.toUpperCase()}</div>
            <p className="mt-5 max-w-xl text-[18px] leading-snug text-bone/85">{place.tagline}</p>
          </div>
        </div>
      </header>

      {/* ---------------- section rail ---------------- */}
      <nav className="sticky top-0 z-30 border-y border-bone/10 bg-ink/92 px-5 py-3 backdrop-blur-xl md:px-8" aria-label="Destination sections">
        <div className="mx-auto flex max-w-6xl gap-6 overflow-x-auto">
          {['MATCH', 'STORY', 'PLAN', 'LOCALS', 'COMMUNITY', 'PASSPORT'].map((s) => (
            <a
              key={s}
              href={`#d-${s.toLowerCase()}`}
              className="tech whitespace-nowrap text-bone/55 transition-colors hover:text-saffron"
            >
              {s}
            </a>
          ))}
        </div>
      </nav>

      <div className="px-5 md:px-8">
        <div className="mx-auto max-w-6xl">
          {/* ---------------- MATCH ---------------- */}
          <Section id="d-match" label="MATCH" title="Why it matches">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <p className="max-w-2xl text-[18px] leading-relaxed text-bone/85">{place.why}</p>
                <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted">{place.feelingOf}</p>

                {twinOf.length > 0 && (
                  <div className="mt-8">
                    <div className="tech mb-4">MATCHED DREAM DESTINATIONS</div>
                    <div className="grid gap-px border border-bone/10 bg-bone/10 sm:grid-cols-2">
                      {twinOf.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => {
                            select(d.id);
                            navigate('/');
                          }}
                          data-cursor="REVEAL"
                          className="group bg-ink px-5 py-5 text-left transition-colors hover:bg-ink-3"
                        >
                          <div className="flex items-baseline justify-between">
                            <span className="display text-[24px] leading-none text-bone transition-colors group-hover:text-saffron">
                              {d.name}
                            </span>
                            <span className="font-mono text-[15px] text-saffron">{d.match}%</span>
                          </div>
                          <div className="tech mt-2">{d.country.toUpperCase()}</div>
                          <div className="mt-3 text-[13px] leading-snug text-muted">{d.tagline}</div>
                        </button>
                      ))}
                    </div>
                    <p className="tech mt-4">MATCH SCORES ARE PROTOTYPE DATA</p>
                  </div>
                )}
              </div>

              {lead && (
                <div className="border border-bone/12 p-6">
                  <div className="tech text-saffron">ATTRIBUTE SIMILARITY</div>
                  <div className="tech mt-1">VS {lead.name.toUpperCase()}</div>
                  <div className="mt-6 space-y-5">
                    {Object.entries(lead.attributes).map(([k, v]) => (
                      <div key={k}>
                        <div className="flex items-baseline justify-between">
                          <span className="text-[13px] text-bone/80">{k}</span>
                          <span className="font-mono text-[12px] text-muted">{v}%</span>
                        </div>
                        <div className="mt-2 h-px w-full bg-bone/12">
                          <div className="h-full bg-saffron" style={{ width: `${v}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* ---------------- STORY ---------------- */}
          <Section id="d-story" label="STORY" title={place.story.title}>
            <div className="tech mb-8">{place.story.duration}s · {place.story.chapters.length} CHAPTERS</div>
            <div className="grid gap-x-10 gap-y-9 md:grid-cols-2">
              {place.story.chapters.map((c) => (
                <div key={c.label} className="border-l border-bone/15 pl-5">
                  <div className="tech text-saffron">{c.label}</div>
                  <p className="mt-3 text-[15px] leading-relaxed text-bone/80">{c.text}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ---------------- PLAN ---------------- */}
          <Section id="d-plan" label="PLAN" title="What a trip here looks like">
            <div className="grid gap-px border border-bone/10 bg-bone/10 sm:grid-cols-3">
              <Cell label="BEST SEASON" value={place.bestSeason} />
              <Cell label="TRIP LENGTH" value={place.tripLength} />
              <Cell label="INDICATIVE BUDGET" value={place.budget} />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ActionButton
                onClick={() => {
                  if (lead) select(lead.id);
                  navigate('/');
                }}
              >
                OPEN THE FULL TRIP PLANNER
              </ActionButton>
              <span className="tech">BUDGETS ARE PROTOTYPE VALUES</span>
            </div>
          </Section>

          {/* ---------------- LOCALS ---------------- */}
          <Section id="d-locals" label="LOCALS" title="The people already here">
            <div className="grid gap-6 md:grid-cols-3">
              {locals.map((l) => (
                <div key={l.id} className="border border-bone/12 p-5">
                  <div className="flex items-center justify-between">
                    <span className="tech text-teal">{l.category}</span>
                    {l.verified && <span className="tech text-teal">✓</span>}
                  </div>
                  <div className="display mt-4 text-[22px] leading-tight text-bone">{l.name}</div>
                  <p className="mt-3 text-[13px] leading-relaxed text-muted">{l.blurb}</p>
                  <div className="tech mt-5 normal-case tracking-[0.1em]">{l.handle}</div>
                </div>
              ))}
            </div>
            <p className="tech mt-5">NO BOOKING, NO PAYMENTS, NO COMMISSION — DIRECT CONTACT ONLY</p>
          </Section>

          {/* ---------------- COMMUNITY ---------------- */}
          <Section id="d-community" label="COMMUNITY" title="Community stories">
            <p className="mb-8 max-w-xl text-[16px] leading-snug text-bone/75">
              See what travellers are saying about {place.name}.
            </p>

            <div className="mb-8 flex flex-wrap items-center gap-x-10 gap-y-3">
              <span className="tech">
                <span className="text-bone">{displayScale(activity.stories)}</span> COMMUNITY STORIES
              </span>
              <span className="tech">
                <span className="text-teal">{displayScale(activity.verified, 7)}</span> VERIFIED EXPERIENCES
              </span>
              <span className="tech">
                <span className="text-bone">{displayScale(activity.contributors, 4)}</span> LOCAL CONTRIBUTORS
              </span>
              <DemoDataTag />
            </div>

            {placePosts.length ? (
              <div className="grid gap-6 md:grid-cols-3">
                {placePosts.map((p) => (
                  <Link
                    key={p.id}
                    to={`/forum/${p.id}`}
                    data-cursor="READ"
                    className="group border border-bone/10 p-5 transition-colors hover:border-saffron/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="tech">{p.category}</span>
                      {p.verified && <span className="tech text-teal">✓</span>}
                    </div>
                    <div className="display mt-4 text-[21px] leading-tight text-bone transition-colors group-hover:text-saffron">
                      {p.title}
                    </div>
                    <div className="mt-5">
                      <AuthorLine userId={p.authorId} size={28} asLink={false} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                line={`Nobody has documented ${place.name} yet. That is an opportunity, not a gap.`}
                action={{ label: 'OPEN THE COMMUNITY', to: '/forum' }}
              />
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={`/destination/${place.id}/community`}
                data-cursor="GO"
                className="tech border border-bone/20 px-5 py-3 text-bone/75 transition-colors hover:border-saffron/60 hover:text-saffron"
              >
                ALL {place.name.toUpperCase()} POSTS →
              </Link>
              <ActionButton onClick={() => openDocument(place.id)}>DOCUMENT YOUR JOURNEY</ActionButton>
            </div>
          </Section>

          {/* ---------------- PASSPORT ---------------- */}
          <Section id="d-passport" label="PASSPORT" title={badgeUnlocked ? 'Already in your passport' : 'Waiting for a stamp'}>
            {badge ? (
              <div className="flex flex-col gap-8 border border-bone/12 p-6 sm:flex-row sm:items-center md:p-9">
                <BadgeArt badge={badge} size={132} locked={!badgeUnlocked} />
                <div className="min-w-0 flex-1">
                  <div className="tech text-saffron">{badgeUnlocked ? 'BADGE UNLOCKED' : 'LOCKED'}</div>
                  <div className="display mt-3 text-[34px] leading-none text-bone">{badge.name}</div>
                  <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-bone/75">
                    {badgeUnlocked ? badge.citation : `Visit ${place.name} to unlock the ${badge.name} badge.`}
                  </p>
                  {journey && (
                    <div className="tech mt-4 text-teal">
                      ✓ VERIFIED {journey.date} · {journey.verification}
                    </div>
                  )}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to="/passport/badges"
                      data-cursor="GO"
                      className="tech border border-saffron/50 px-5 py-3 text-saffron transition-colors hover:bg-saffron hover:text-ink"
                    >
                      EXPLORE BADGE
                    </Link>
                    {!badgeUnlocked && (
                      <ActionButton onClick={() => openDocument(place.id)}>DOCUMENT TO UNLOCK</ActionButton>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState line="This destination has no badge yet." action={{ label: 'OPEN PASSPORT', to: '/passport' }} />
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  id,
  label,
  title,
  children,
}: {
  id: string;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-bone/10 py-14 md:py-20">
      <div className="tech mb-3 text-saffron">{label}</div>
      <h2 className="display mb-9 text-[clamp(28px,5vw,58px)] leading-[0.92] text-bone">{title}</h2>
      {children}
    </section>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink px-5 py-6">
      <div className="tech">{label}</div>
      <div className="mt-3 text-[19px] text-bone">{value}</div>
    </div>
  );
}
