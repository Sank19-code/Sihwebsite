import { useEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { useApp } from '../../store';
import { useCommunity } from '../../communityStore';
import { scrollTo } from '../../hooks/useSmoothScroll';
import { navigate, setPendingAnchor } from '../../router';

/** The six chapters the progress rail counts through. */
export const SECTIONS = [
  { id: 'globe', label: 'GLOBE' },
  { id: 'twin', label: 'TWIN' },
  { id: 'story', label: 'STORY' },
  { id: 'plan', label: 'PLAN' },
  { id: 'locals', label: 'LOCALS' },
  { id: 'india', label: 'INDIA' },
] as const;

/**
 * Home sections are not routes; they are scroll targets on the home page.
 * Tapping one from another page routes to home first, then hands the scroll
 * target to the mounting Home page via `setPendingAnchor`.
 */
const NAV = [
  { label: 'EXPLORE', target: '#globe' },
  { label: 'STORIES', target: '#story' },
  { label: 'PLAN', target: '#plan' },
  { label: 'LOCALS', target: '#locals' },
] as const;

const FORUM_INDEX = 4;
const PASSPORT_INDEX = 5;

/**
 * ------------------------------------------------------------------
 * TOP NAVIGATION  —  shared by every route
 * ------------------------------------------------------------------
 * Desktop: the four home chapters jump the scroll on home and route home
 * otherwise. FORUM and PASSPORT are real routes; PASSPORT carries the
 * unlocked-badge count so progress is always visible without navigating.
 *
 * The underline indicator is a single absolutely-positioned element that
 * GSAP slides between labels, so the active state moves rather than blinks.
 */
export function Navigation({ activePath }: { activePath: string }) {
  const phase = useApp((s) => s.phase);
  const section = useApp((s) => s.section);
  const badgeCount = useCommunity((s) => s.unlockedBadgeIds.length);
  const indicator = useRef<HTMLSpanElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const onHome = activePath === '/' || activePath === '/explore';

  /** Jump a home section, routing home first when needed. */
  const goHome = (anchor?: string) => {
    if (onHome) {
      if (anchor) scrollTo(anchor);
      else scrollTo(0);
      return;
    }
    if (anchor) setPendingAnchor(anchor);
    navigate('/');
  };

  const goForum = () => {
    if (activePath.startsWith('/forum') || activePath.startsWith('/community')) return;
    navigate('/forum');
  };

  const goPassport = () => {
    if (activePath.startsWith('/passport')) return;
    navigate('/passport');
  };

  // Map the current position onto a nav item index.
  let activeIndex: number;
  if (onHome) activeIndex = hoverIndex ?? (section >= 4 ? 3 : section >= 3 ? 2 : section >= 2 ? 1 : 0);
  else if (activePath.startsWith('/forum') || activePath.startsWith('/destination') || activePath.startsWith('/community'))
    activeIndex = FORUM_INDEX;
  else if (activePath.startsWith('/passport')) activeIndex = PASSPORT_INDEX;
  else activeIndex = hoverIndex ?? 0;

  useEffect(() => {
    const el = items.current[activeIndex];
    const bar = indicator.current;
    if (!el || !bar) return;
    gsap.to(bar, {
      x: el.offsetLeft,
      width: el.offsetWidth,
      duration: 0.65,
      ease: 'expo.out',
    });
  }, [activeIndex, hoverIndex]);

  const navButton = (
    i: number,
    active: boolean,
    onClick: () => void,
    children: ReactNode,
    ariaLabel?: string,
  ) => (
    <button
      key={i}
      ref={(el) => {
        items.current[i] = el;
      }}
      onClick={onClick}
      onMouseEnter={() => setHoverIndex(i)}
      onMouseLeave={() => setHoverIndex(null)}
      data-cursor="GO"
      aria-current={active ? 'page' : undefined}
      aria-label={ariaLabel}
      className={`tech relative pb-1.5 transition-colors duration-300 ${
        active ? 'text-saffron' : 'text-bone/70 hover:text-bone'
      }`}
    >
      {children}
    </button>
  );

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between p-5 transition-opacity duration-700 md:p-8"
      style={{ opacity: phase === 'boot' ? 0 : 1 }}
    >
      {/* Soft scrim so content scrolling under the header fades out instead of
          colliding with the wordmark. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-ink via-ink/70 to-transparent"
        aria-hidden="true"
      />

      <button
        onClick={() => goHome()}
        data-cursor="TOP"
        className="pointer-events-auto text-left leading-[0.9]"
        aria-label="TwinTrip India — home"
      >
        <span className="display block text-[15px] tracking-[-0.03em] text-bone md:text-[17px]">TwinTrip</span>
        <span className="display block text-[15px] tracking-[-0.03em] text-saffron md:text-[17px]">India</span>
      </button>

      <nav className="pointer-events-auto relative hidden items-center gap-7 lg:flex" aria-label="Primary">
        {NAV.map((item, i) => navButton(i, onHome && activeIndex === i, () => goHome(item.target), item.label))}
        {navButton(FORUM_INDEX, activeIndex === FORUM_INDEX, goForum, 'FORUM')}
        {navButton(
          PASSPORT_INDEX,
          activeIndex === PASSPORT_INDEX,
          goPassport,
          <span className="inline-flex items-center gap-1.5">
            PASSPORT
            {badgeCount > 0 && (
              <span
                className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-saffron px-1 font-mono text-[10px] leading-none tracking-normal text-ink"
                aria-label={`${badgeCount} badges unlocked`}
              >
                {badgeCount}
              </span>
            )}
          </span>,
          'Passport, with the unlocked badge count',
        )}
        <span ref={indicator} className="absolute bottom-0 left-0 h-px w-0 bg-saffron" />
      </nav>

      {/* Mobile: the bottom bar owns the main destinations, so the header
          keeps only the wordmark. */}
    </header>
  );
}
