import { useState } from 'react';
import { useCommunity } from '../../communityStore';

/**
 * ------------------------------------------------------------------
 * DEMO MODE
 * ------------------------------------------------------------------
 * The seeded state IS the demo: the passport opens with eight badges and
 * six stamped journeys, and the forum already has a live feed. This panel
 * exists for two reasons a presenter actually has:
 *
 *   1. a visible script of the acceptance flow, so the walk-through is
 *      reproducible in front of a room
 *   2. a reset, because a half-finished run (one extra badge, one new
 *      post) is not the same story the second time
 *
 * It is deliberately small: a corner control, not a second UI layer.
 */
const SCRIPT = [
  'GLOBE — hover Santorini: the twin card now shows community stories and the badge state',
  'CLICK SANTORINI → VARKALA twin reveal',
  'OPEN THE VARKALA COMMUNITY / READ A POST',
  'DOCUMENT YOUR JOURNEY → USE DEMO VIDEO',
  'VERIFY — the three checks run, the post goes live',
  'BADGE UNLOCKED — Cliff & Coast celebrates',
  'VIEW IN PASSPORT — 9 badges, a new stamp',
  'RETURN TO FORUM — the verified contribution is in the feed',
];

export function DemoPanel() {
  const [open, setOpen] = useState(false);
  const resetDemo = useCommunity((s) => s.resetDemo);
  const unlocked = useCommunity((s) => s.unlockedBadgeIds.length);
  const posts = useCommunity((s) => s.posts.length);

  return (
    <div
      className="fixed left-4 z-[70] bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] md:left-6 md:bottom-6 lg:bottom-6"
    >
      {open && (
        <div className="hairline absolute bottom-[52px] left-0 w-[300px] max-w-[82vw] border bg-ink-2/95 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="tech text-saffron">DEMO FLOW</span>
            <button onClick={() => setOpen(false)} className="tech text-bone/50 hover:text-bone" aria-label="Close demo panel">
              ✕
            </button>
          </div>

          <ol className="mt-4 space-y-2.5">
            {SCRIPT.map((line, i) => (
              <li key={i} className="flex gap-2.5 text-[11.5px] leading-snug text-bone/70">
                <span className="tech shrink-0 text-saffron/70">{String(i + 1).padStart(2, '0')}</span>
                {line}
              </li>
            ))}
          </ol>

          <div className="mt-5 flex items-center justify-between border-t border-bone/10 pt-4">
            <span className="tech text-bone/40">
              {unlocked} BADGES · {posts} POSTS
            </span>
            <button
              onClick={() => resetDemo()}
              data-cursor="RESET"
              className="tech border border-bone/25 px-3 py-2 text-bone/70 transition-colors hover:border-saffron/60 hover:text-saffron"
            >
              RESET DEMO
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        data-cursor="DEMO"
        aria-expanded={open}
        className={`tech flex items-center gap-2 border px-4 py-2.5 backdrop-blur-xl transition-colors ${
          open
            ? 'border-saffron/60 bg-saffron/15 text-saffron'
            : 'border-bone/20 bg-ink-2/80 text-bone/60 hover:border-saffron/50 hover:text-saffron'
        }`}
      >
        <span
          className="relative flex h-2 w-2"
          aria-hidden="true"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-saffron opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-saffron" />
        </span>
        DEMO MODE
      </button>
    </div>
  );
}
