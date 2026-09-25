import { useMemo, useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCommunity, placeLabel } from '../communityStore';
import { useUi } from '../uiStore';
import { badges, badgeById, rarityLabel } from '../data/badges';
import { passportSeed, deriveIdentity, favoriteLandscapes, type Journey } from '../data/passport';
import { placeById, indianPlaces } from '../data/indianPlaces';
import { localsFor } from '../data/locals';
import { BadgeArt } from '../components/Badges/BadgeArt';
import {
  PageHeader,
  Stat,
  ActionButton,
  DemoDataTag,
  VerifiedTag,
  EmptyState,
} from '../components/ui/primitives';
import { Link, navigate, setPendingAnchor } from '../router';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { formatCoords } from '../lib/geo';

gsap.registerPlugin(ScrollTrigger);

/**
 * ------------------------------------------------------------------
 * /passport — THE TRAVEL PASSPORT
 * ------------------------------------------------------------------
 * A digital passport, not a profile dashboard:
 *
 *   the cover  — a physical document with the traveller's identity
 *   journeys   — verified visits, stamped with dates
 *   badges     — the collection, locked and unlocked
 *   identity   — who this traveller is, derived from what they did
 *   impact     — the local economic argument, made visible
 *
 * Everything reads from the same store the forum writes into, so a
 * contribution verified anywhere updates this page immediately.
 */
export function Passport() {
  const journeys = useCommunity((s) => s.journeys);
  const unlocked = useCommunity((s) => s.unlockedBadgeIds);
  const stats = useCommunity((s) => s.stats);
  const openDocument = useUi((s) => s.openDocument);
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);

  const placeIds = useMemo(() => journeys.map((j) => j.placeId), [journeys]);
  const identity = useMemo(
    () => deriveIdentity(placeIds, unlocked.length),
    [placeIds, unlocked.length],
  );
  const landscapes = useMemo(() => favoriteLandscapes(placeIds), [placeIds]);

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.pp-stamp',
        { scale: 1.9, opacity: 0, rotate: -24 },
        {
          scale: 1,
          opacity: 1,
          rotate: -9,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: { trigger: '.pp-journeys', start: 'top 78%', once: true },
        },
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={root} className="relative z-10 bg-ink pb-24">
      <PageHeader
        eyebrow="TWINTRIP"
        title={
          <>
            <span className="block">TRAVEL PASSPORT</span>
          </>
        }
        lede="Not a record of where you were. A record of what you brought back."
        sub="Every verified contribution stamps the passport, unlocks a badge, and puts a place in front of the next traveller."
      >
        <div className="flex flex-wrap gap-3">
          <Link
            to="/passport/profile"
            data-cursor="GO"
            className="tech border border-bone/25 px-5 py-3 text-bone/80 transition-colors hover:border-saffron/60 hover:text-saffron"
          >
            PROFILE
          </Link>
          <Link
            to="/passport/badges"
            data-cursor="GO"
            className="tech border border-bone/25 px-5 py-3 text-bone/80 transition-colors hover:border-saffron/60 hover:text-saffron"
          >
            BADGE COLLECTION
          </Link>
          <ActionButton tone="solid" onClick={() => openDocument()}>
            DOCUMENT YOUR JOURNEY
          </ActionButton>
        </div>
      </PageHeader>

      {/* ---------------- passport cover ---------------- */}
      <div className="px-5 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[440px,1fr] lg:gap-16">
            <PassportCover journeys={journeys.length} badges={unlocked.length} stories={stats.storiesContributed} />

            <div className="min-w-0">
              <div className="tech text-saffron">MANIDEEP</div>
              <div className="mt-2 flex flex-wrap items-baseline gap-3">
                <span className="display text-[clamp(30px,4.6vw,54px)] leading-none text-bone">{identity.title}</span>
                <VerifiedTag label="EXPLORER" />
              </div>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-bone/75">{identity.line}</p>
              {landscapes.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {landscapes.map((l) => (
                    <span key={l} className="tech border border-bone/15 px-3 py-1.5 text-bone/60">
                      {l.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-10 grid grid-cols-2 gap-px border border-bone/10 bg-bone/10 sm:grid-cols-4">
                <StatCell value={journeys.length} label="DESTINATIONS" />
                <StatCell value={unlocked.length} label="BADGES" />
                <StatCell value={stats.storiesContributed} label="STORIES" />
                <StatCell value={stats.localExperiencesShared} label="LOCAL EXPERIENCES" />
              </div>

              <p className="tech mt-6">PASSPORT № {passportSeed.passportNo} · ISSUED {passportSeed.issued}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- my journeys ---------------- */}
      <section className="pp-journeys px-5 pt-20 md:px-8 md:pt-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="display text-[clamp(30px,5vw,58px)] leading-none text-bone">My journeys</h2>
            <span className="tech">
              {journeys.length} STAMPED · {indianPlaces.length} POSSIBLE
            </span>
          </div>

          {journeys.length ? (
            <div className="grid gap-px border border-bone/10 bg-bone/10 sm:grid-cols-2 lg:grid-cols-3">
              {journeys.map((j) => {
                const place = placeById(j.placeId);
                const badge = j.badgeId ? badgeById(j.badgeId) : null;
                return (
                  <Link
                    key={j.placeId}
                    to={`/destination/${j.placeId}`}
                    data-cursor="OPEN"
                    className="pp-stamp group relative block bg-ink p-6 transition-colors hover:bg-ink-2"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="tech text-teal">✓ VERIFIED</div>
                        <div className="display mt-3 text-[26px] leading-none text-bone transition-colors group-hover:text-saffron">
                          {place?.name ?? j.placeId}
                        </div>
                        <div className="tech mt-1.5">{place?.state.toUpperCase()}</div>
                      </div>
                      {badge && <BadgeArt badge={badge} size={64} />}
                    </div>

                    <div className="mt-6 border-t border-bone/10 pt-4">
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                        <span className="tech text-bone/60">{j.date}</span>
                        <span className="tech text-bone/60">{j.verification}</span>
                      </div>
                      {badge && (
                        <div className="tech mt-2.5 text-saffron">
                          BADGE · {badge.name.toUpperCase()}
                        </div>
                      )}
                      <p className="mt-3 text-[13px] italic leading-snug text-muted">{j.note}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState line="Your passport is waiting for its first stamp." action={{ label: 'EXPLORE INDIA', to: '/' }} />
          )}
        </div>
      </section>

      {/* ---------------- passport -> local discovery ---------------- */}
      <LocalDiscoverySection journeys={journeys} />

      {/* ---------------- badge shelf ---------------- */}
      <section className="px-5 pt-20 md:px-8 md:pt-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="display text-[clamp(30px,5vw,58px)] leading-none text-bone">Badges</h2>
            <Link to="/passport/badges" data-cursor="COLLECT" className="tech text-saffron transition-colors hover:text-bone">
              FULL COLLECTION →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {badges
              .filter((b) => unlocked.includes(b.id))
              .slice(0, 8)
              .map((b) => {
                const place = b.destination ? placeById(b.destination) : null;
                return (
                  <div key={b.id} className="hairline border p-5">
                    <BadgeArt badge={b} size={92} float />
                    <div className="display mt-4 text-[17px] leading-tight text-bone">{b.name}</div>
                    <div className="tech mt-1.5 text-bone/50">{place ? placeLabel(b.destination!) : rarityLabel[b.rarity]}</div>
                  </div>
                );
              })}
          </div>

          {journeys.length === 0 && unlocked.length === 0 && (
            <EmptyState line="This badge collection is waiting for your next journey." />
          )}
        </div>
      </section>

      {/* ---------------- travel identity ---------------- */}
      <section className="px-5 pt-20 md:px-8 md:pt-28">
        <div className="mx-auto max-w-6xl">
          <h2 className="pp-el tech mb-6 text-saffron">Your travel identity</h2>
          <div className="grid gap-px border border-bone/10 bg-bone/10 md:grid-cols-[1fr,360px]">
            <div className="bg-ink p-7 md:p-10">
              <div className="display pp-el text-[clamp(40px,7vw,96px)] leading-none text-bone">{identity.title}</div>
              <p className="pp-el mt-5 max-w-md text-[15px] leading-relaxed text-bone/75">{identity.line}</p>
              <div className="pp-el mt-8 flex flex-wrap gap-2">
                {identity.traits.map((t) => (
                  <span key={t} className="tech border border-saffron/40 px-3 py-1.5 text-saffron/90">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-ink-2 p-7 md:p-10">
              <div className="tech pp-el">DERIVED FROM</div>
              <ul className="mt-5 space-y-3.5">
                <IdentityLine label="Destinations stamped" value={String(journeys.length)} />
                <IdentityLine label="Badges held" value={String(unlocked.length)} />
                <IdentityLine label="Stories contributed" value={String(stats.storiesContributed)} />
                <IdentityLine label="Landscape pull" value={landscapes.join(' · ') || '—'} />
              </ul>
              <p className="tech pp-el mt-8 leading-relaxed">
                IDENTITY IS GENERATED FROM THE COLLECTION, NOT A LEVEL BAR.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- the loop: economic engine ---------------- */}
      <section className="px-5 pt-20 md:px-8 md:pt-28">
        <div className="mx-auto max-w-6xl">
          <h2 className="display pp-el max-w-3xl text-[clamp(30px,4.6vw,54px)] leading-[0.95] text-bone">
            Your passport helps places get discovered.
          </h2>
          <p className="pp-el mt-5 max-w-xl text-[15px] leading-relaxed text-bone/70">
            The loop is the product. It is not a loyalty scheme: each step gives something back to the place, not
            only the traveller.
          </p>

          <div className="mt-12 grid gap-px border border-bone/10 bg-bone/10 md:grid-cols-3">
            {LOOP_STEPS.map((s, i) => (
              <div key={s.title} className="bg-ink p-6 md:p-7">
                <div className="flex items-center justify-between">
                  <span className="tech text-saffron">{String(i + 1).padStart(2, '0')}</span>
                  {i < LOOP_STEPS.length - 1 && <span aria-hidden="true" className="text-bone/30">→</span>}
                </div>
                <div className="display mt-6 text-[22px] leading-tight text-bone">{s.title}</div>
                <p className="mt-3 text-[13px] leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="tech flex items-center gap-3 text-bone/60">
              LOCAL GUIDES · HOMESTAYS · ARTISANS
              <span aria-hidden="true" className="h-px w-10 bg-saffron/60" />
              GET VISIBILITY
            </div>
            <Link
              to="/destination/varkala"
              data-cursor="OPEN"
              className="tech border border-bone/20 px-4 py-2.5 text-bone/70 transition-colors hover:border-saffron/60 hover:text-saffron"
            >
              SEE A DESTINATION&rsquo;S LOCALS
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- contribution + impact ---------------- */}
      <section className="px-5 pt-20 md:px-8 md:pt-28">
        <div className="mx-auto max-w-6xl grid gap-px border border-bone/10 bg-bone/10 lg:grid-cols-2">
          <div className="bg-ink p-7 md:p-10">
            <div className="flex items-center justify-between">
              <h2 className="display text-[26px] leading-none text-bone">Your contribution</h2>
              <DemoDataTag />
            </div>
            <div className="mt-9 grid grid-cols-2 gap-x-10 gap-y-8">
              <Stat value={stats.destinationsDocumented} label="DESTINATIONS DOCUMENTED" />
              <Stat value={stats.storiesContributed} label="STORIES CONTRIBUTED" />
              <Stat value={stats.hiddenGemsFound} label="HIDDEN GEMS FOUND" />
              <Stat value={stats.localExperiencesShared} label="LOCAL EXPERIENCES SHARED" />
            </div>
            <p className="tech mt-9 leading-relaxed">
              YOUR CONTRIBUTIONS HELPED <span className="text-saffron">{stats.travellersReached.toLocaleString('en-IN')}</span> TRAVELLERS DISCOVER NEW
              PLACES. <span className="text-bone/50">DEMO DATA.</span>
            </p>
          </div>

          <div className="bg-ink-2 p-7 md:p-10">
            <h2 className="display text-[26px] leading-none text-bone">Your journey impact</h2>
            <div className="mt-9 space-y-7">
              <ImpactRow value={stats.lesserKnownPlaces} label="LESSER-KNOWN PLACES DOCUMENTED" />
              <ImpactRow value={stats.localExperiencesShared} label="LOCAL EXPERIENCES SHARED" />
              <ImpactRow value={stats.localContributorsDiscovered} label="LOCAL CONTRIBUTORS DISCOVERED" />
            </div>
            <p className="mt-9 border-l border-saffron/40 pl-4 text-[14px] leading-relaxed text-bone/70">
              Every contribution helps make a place more visible.
            </p>
            <div className="mt-9">
              <ActionButton tone="solid" onClick={() => openDocument()}>
                ADD ANOTHER STAMP
              </ActionButton>
            </div>
          </div>
        </div>
      </section>

      <div className="px-5 md:px-8">
        <div className="mx-auto mt-20 max-w-6xl border-t border-bone/10 pt-8">
          <p className="tech leading-relaxed">
            PASSPORT DATA PERSISTS IN THIS BROWSER ONLY · RESET THE DEMO FROM THE DEMO PANEL ·{' '}
            <span className="text-bone/50">STATISTICS ARE DEMO DATA, NOT PRODUCTION MEASUREMENTS</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ cover */

function PassportCover({ journeys, badges, stories }: { journeys: number; badges: number; stories: number }) {
  // Touch devices have no hover, so the book also flips by toggle. The
  // default is open — the record page is the content the cover hides. Under
  // reduced motion the CSS drops the transition; the toggle still works.
  const [open, setOpen] = useState(true);

  return (
    <div className="passport-stage select-none" data-cursor="FLIP">
      <div
        className="passport-book relative mx-auto aspect-[8/11] w-[min(100%,380px)]"
        data-open={open ? 'true' : 'false'}
      >
        {/* open leaf: the "photo page" */}
        <div className="passport-face passport-paper absolute inset-0 border border-bone/15 p-6">
          <div className="tech passport-rule absolute inset-x-0 top-0 h-3 opacity-40" />
          <div className="tech text-teal">RECORD OF JOURNEYS</div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[...Array(Math.min(journeys, 4))].map((_, i) => (
              <div key={i} className="relative aspect-[4/5] border border-bone/12 bg-ink/40 p-3">
                <div className="tech text-[8px] text-bone/50">STAMP {String(i + 1).padStart(2, '0')}</div>
                <div className="absolute bottom-2 left-3 right-3 h-px bg-saffron/30" />
              </div>
            ))}
            {journeys <= 4 && (
              <div className="aspect-[4/5] border border-dashed border-bone/15 p-3">
                <div className="tech text-[8px] leading-relaxed text-bone/35">NEXT STAMP PENDING</div>
              </div>
            )}
          </div>
          <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between">
            <span className="tech text-bone/40">STAMPS {journeys}</span>
            <span className="tech text-bone/40">№ TT-IN-0042196</span>
          </div>
        </div>

        {/* front cover, flipping open on its spine */}
        <div
          className="passport-face passport-cover absolute inset-0 border border-bone/20"
          style={{
            background: 'linear-gradient(160deg, #131011 0%, #1A1512 60%, #221A14 100%)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(242,238,231,0.06)',
          }}
        >
          <div className="passport-rule absolute inset-x-0 top-0 h-3 opacity-50" />
          <div className="flex h-full flex-col p-6">
            <div className="tech text-saffron">TWINTRIP INDIA</div>
            <div className="mt-2 h-px w-16 bg-saffron/50" />

            <div className="mt-10 text-center">
              <div className="tech text-bone/60">TRAVEL PASSPORT</div>
              <div className="display mt-4 text-[42px] leading-none text-bone">MANIDEEP</div>
              <div className="tech mt-3 text-teal">EXPLORER · {formatCoords(8.7379, 76.7163)}</div>
            </div>

            <div className="mt-auto">
              <div className="grid grid-cols-3 gap-px border border-bone/12 bg-bone/12">
                {[
                  [journeys, 'DESTINATIONS'],
                  [badges, 'BADGES'],
                  [stories, 'STORIES'],
                ].map(([v, l]) => (
                  <div key={l} className="bg-ink/70 px-2 py-3 text-center">
                    <div className="font-mono text-[18px] text-saffron">{v}</div>
                    <div className="tech mt-1 text-[7px]">{l}</div>
                  </div>
                ))}
              </div>
              <div className="tech mt-4 flex justify-between">
                <span className="text-bone/40">INDIA · PROTOTYPE EDITION</span>
                <span className="text-bone/40">2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="tech mt-4 text-center text-bone/35">HOVER TO FLIP · OR USE THE CONTROL</p>
      <div className="mt-3 flex justify-center">
        <button
          onClick={() => setOpen((o) => !o)}
          data-cursor="FLIP"
          aria-pressed={open}
          className={`tech border px-4 py-2 transition-colors ${
            open ? 'border-saffron/50 text-saffron' : 'border-bone/25 text-bone/70 hover:border-saffron/50'
          }`}
        >
          {open ? 'COVER OPEN' : 'CLOSE COVER'}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ local
   discovery — the passport entry that pays forward
   ------------------------------------------------------------------ */

/**
 * A stamp is not just a record. The destination page it points at lists the
 * people who make the place, and this section makes the economic argument
 * concrete: your verified visit puts those specific guides, homestays and
 * artisans in front of the next traveller. No booking, no payment —
 * discovery and direct contact only.
 */
function LocalDiscoverySection({ journeys }: { journeys: Journey[] }) {
  const first = journeys[0];
  const place = first ? placeById(first.placeId) : null;
  if (!place) return null;
  const listings = localsFor(place.id);
  // The badge this specific stamp earned — not just the newest one in the
  // collection, so the panel reads as a record of this visit.
  const badge = first.badgeId ? badgeById(first.badgeId) : null;

  return (
    <section className="px-5 pt-20 md:px-8 md:pt-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-px border border-bone/10 bg-bone/10 lg:grid-cols-[minmax(0,380px),1fr]">
          <div className="bg-ink p-7 md:p-9">
            <div className="tech text-saffron">YOUR STAMP PAYS FORWARD</div>
            <h2 className="display mt-4 text-[clamp(26px,3.6vw,40px)] leading-[0.95] text-bone">
              {place.name}
              <span className="block text-muted">— what your visit unlocked</span>
            </h2>

            <div className="mt-7 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-teal">✓</span>
                <span className="text-[14px] text-bone/80">Your visit</span>
                <span className="tech ml-auto text-teal">VERIFIED</span>
              </div>
              <div className="flex items-center gap-3">
                {badge ? <BadgeArt badge={badge} size={30} /> : <span className="h-[30px] w-[30px]" />}
                <span className="text-[14px] text-bone/80">Your badge</span>
                <span className="tech ml-auto text-saffron">{badge ? badge.name.toUpperCase() : 'PENDING'}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setPendingAnchor('#d-locals');
                navigate(`/destination/${place.id}`);
              }}
              data-cursor="LOCALS"
              className="tech mt-9 block w-full border border-bone/25 px-5 py-3.5 text-center text-bone/80 transition-colors hover:border-saffron/60 hover:text-saffron"
            >
              DESTINATION PAGE →
            </button>
            <p className="tech mt-4 leading-relaxed">
              NO BOOKING, NO PAYMENTS, NO COMMISSION — DIRECT DISCOVERY ONLY
            </p>
          </div>

          <div className="grid gap-px bg-bone/10 sm:grid-cols-3">
            {listings.map((l) => (
              <LocalTile key={l.id} listing={l} placeId={place.id} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LocalTile({ listing, placeId }: { listing: ReturnType<typeof localsFor>[number]; placeId: string }) {
  const [contact, setContact] = useState(false);
  return (
    <div className="bg-ink-2 p-6">
      <div className="flex items-center justify-between">
        <span className="tech text-teal">{listing.category}</span>
        {listing.verified && <span className="text-teal" aria-label="verified">✓</span>}
      </div>
      <div className="display mt-4 text-[19px] leading-tight text-bone">{listing.name}</div>
      <p className="mt-3 text-[12.5px] leading-relaxed text-muted">{listing.blurb}</p>
      <button
        onClick={() => setContact((c) => !c)}
        data-cursor="CONTACT"
        className="mt-5 flex w-full items-center justify-between border-t border-bone/15 pt-4 text-left transition-colors hover:border-saffron/50"
      >
        <span className="tech text-bone/70">{contact ? listing.handle : `VIEW ${listing.category}`}</span>
        <span className="text-saffron" aria-hidden="true">
          {contact ? '·' : '→'}
        </span>
      </button>
      <span className="sr-only">
        {listing.place} — opens the {placeId} locals section with a demo contact
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ bits */

const LOOP_STEPS = [
  { title: 'You visit', body: 'You go somewhere and it does something to you. The visit is the first fact.' },
  { title: 'You document', body: 'A photo or a short clip, in the moment, filed against a real destination.' },
  { title: 'We verify', body: 'Location and date are checked against the place. In this prototype that check is simulated.' },
  { title: 'You earn a badge', body: 'The receipt for the record. The passport gains a stamp, the collection gains a medal.' },
  {
    title: 'Your story discovers the place',
    body: 'The post appears in the community feed, tagged to the destination, and the place becomes easier to find.',
  },
  {
    title: 'Locals get visibility',
    body: 'A documented place surfaces its guides, homestays and artisans to the next traveller, with zero commission.',
  },
];

function StatCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-ink p-5">
      <div className="font-mono text-[26px] text-saffron">{value}</div>
      <div className="tech mt-1.5">{label}</div>
    </div>
  );
}

function IdentityLine({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b border-bone/8 pb-2.5">
      <span className="tech text-bone/50">{label}</span>
      <span className="text-[14px] text-bone">{value}</span>
    </li>
  );
}

function ImpactRow({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-5">
      <Stat value={value} label={label} />
      <div className="tech mt-2 flex-1 border-b border-bone/12" />
    </div>
  );
}
