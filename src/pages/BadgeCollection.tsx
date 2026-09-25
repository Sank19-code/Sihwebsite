import { useMemo, useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCommunity, badgeStatus, type BadgeStatus } from '../communityStore';
import { badges, type Badge, rarityLabel } from '../data/badges';
import { placeById } from '../data/indianPlaces';
import { BadgeArt } from '../components/Badges/BadgeArt';
import { PageHeader, ActionButton, EmptyState } from '../components/ui/primitives';
import { useUi } from '../uiStore';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { Link } from '../router';

gsap.registerPlugin(ScrollTrigger);

/**
 * ------------------------------------------------------------------
 * /passport/badges — THE BADGE COLLECTION
 * ------------------------------------------------------------------
 * The whole set, unlocked and locked, drawn with the same medallion art as
 * the unlock overlay so a badge looks identical everywhere it appears.
 *
 * A locked badge is not a dead end: it says what to actually do, with live
 * progress, and an entry to the document flow when the missing ingredient is
 * a destination visit.
 */
export function BadgeCollection() {
  const unlocked = useCommunity((s) => s.unlockedBadgeIds);
  const progress = useCommunity((s) => s.progress);
  const openDocument = useUi((s) => s.openDocument);
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);

  const [expanded, setExpanded] = useState<string | null>(null);

  const statuses = useMemo(
    () => badges.map((b) => badgeStatus(b, unlocked, progress)),
    [unlocked, progress],
  );
  const unlockedCount = statuses.filter((s) => s.unlocked).length;

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.bc-card',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.04,
          scrollTrigger: { trigger: root.current!, start: 'top 72%', once: true },
        },
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={root} className="relative z-10 bg-ink pb-24">
      <PageHeader
        eyebrow="TWINTRIP PASSPORT"
        title={
          <>
            <span className="block">Badge collection</span>
          </>
        }
        lede="Receipts for verified contributions — one medal per place you documented, plus the craft badges a pattern of work earns."
        sub="Locked badges are not decoration. Each one names the next thing worth doing."
      >
        <div className="flex flex-wrap items-center gap-5">
          <span className="tech">
            <span className="text-saffron">{unlockedCount}</span> / {badges.length} UNLOCKED
          </span>
          <div className="h-px flex-1 min-w-[60px] bg-bone/15" />
          <Link to="/passport" data-cursor="BACK" className="tech text-bone/60 hover:text-saffron">
            ← PASSPORT
          </Link>
        </div>
      </PageHeader>

      <div className="px-5 md:px-8">
        <div className="mx-auto max-w-6xl pt-14">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {statuses.map((s) => (
              <BadgeCard
                key={s.badge.id}
                status={s}
                expanded={expanded === s.badge.id}
                onToggle={() => setExpanded((e) => (e === s.badge.id ? null : s.badge.id))}
                onDocument={openDocument}
              />
            ))}
          </div>

          {!unlockedCount && (
            <div className="mt-16">
              <EmptyState line="This badge collection is waiting for your next journey." action={{ label: 'EXPLORE INDIA', to: '/' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BadgeCard({
  status,
  expanded,
  onToggle,
  onDocument,
}: {
  status: BadgeStatus;
  expanded: boolean;
  onToggle: () => void;
  onDocument: (placeId?: string | null) => void;
}) {
  const b: Badge = status.badge;
  const place = b.destination ? placeById(b.destination) : null;
  const pct = status.target ? Math.min(100, (status.progress / status.target) * 100) : 0;

  return (
    <div className={`bc-card hairline relative border bg-ink-2 transition-colors ${status.unlocked ? 'border-saffron/25' : 'border-bone/10'}`}>
      <div className="flex flex-col items-center px-6 pt-9 text-center">
        <div className="relative">
          <BadgeArt badge={b} size={132} locked={!status.unlocked} float={status.unlocked} />
          {status.unlocked && (
            <span className="tech absolute -bottom-2 left-1/2 -translate-x-1/2 bg-ink px-2 text-teal">
              ✓ {rarityLabel[b.rarity]}
            </span>
          )}
        </div>

        <div className="display mt-6 text-[24px] leading-none text-bone">{b.name}</div>
        <div className="tech mt-2.5 text-bone/45">
          {place ? `${place.name.toUpperCase()}, ${place.state.toUpperCase()}` : b.kind === 'craft' ? 'CRAFT BADGE' : 'PASSPORT BADGE'}
        </div>
        <p className="mt-4 max-w-[18rem] text-[13px] leading-relaxed text-muted">{b.description}</p>
      </div>

      {/* progress / unlock strip */}
      <div className="mt-7 border-t border-bone/10 px-6 py-4">
        {status.unlocked ? (
          <div className="tech flex items-center justify-between">
            <span className="text-teal">UNLOCKED</span>
            <span className="text-bone/40">{place ? `STAMPED AT ${place.name.toUpperCase()}` : 'IN YOUR COLLECTION'}</span>
          </div>
        ) : (
          <button onClick={onToggle} data-cursor="PICK" className="block w-full text-left" aria-expanded={expanded}>
            <div className="flex items-center justify-between">
              <span className="tech text-bone/50">HOW TO UNLOCK</span>
              {status.target ? (
                <span className="tech text-saffron">
                  {status.progress} / {status.target}
                </span>
              ) : (
                <span className="text-bone/30">{expanded ? '−' : '+'}</span>
              )}
            </div>

            {status.target && (
              <div className="mt-3 h-px w-full overflow-hidden bg-bone/12">
                <div className="h-full bg-saffron transition-[width] duration-700 ease-cine" style={{ width: `${pct}%` }} />
              </div>
            )}

            {expanded && (
              <div className="mt-4">
                <p className="text-[13px] leading-relaxed text-bone/70">{b.requirement}</p>
                {b.destination ? (
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <ActionButton tone="solid" onClick={() => onDocument(b.destination ?? null)}>
                      DOCUMENT HERE
                    </ActionButton>
                    <Link
                      to={`/destination/${b.destination}`}
                      data-cursor="PLACE"
                      className="tech border border-bone/20 px-4 py-2.5 text-bone/70 transition-colors hover:border-saffron/60 hover:text-saffron"
                    >
                      {place?.name.toUpperCase()}
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4">
                    <ActionButton onClick={() => onDocument(null)}>START A CONTRIBUTION</ActionButton>
                  </div>
                )}
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
