import { CURRENT_USER_ID } from './users';

/**
 * ------------------------------------------------------------------
 * PASSPORT SEED
 * ------------------------------------------------------------------
 * The passport is the record of what a traveller documented, not where they
 * checked in. A journey only enters it after a contribution was verified,
 * which is what ties the Forum and the Passport into one loop:
 *
 *   VISIT -> DOCUMENT -> VERIFY -> BADGE -> PASSPORT -> DISCOVERY
 *
 * Everything below is DEMO DATA seeded so the prototype opens with a passport
 * that already has a history. Live state (new journeys, new badges) is layered
 * on top of this in communityStore.ts and persisted to localStorage.
 */

export interface Journey {
  /** IndianPlace id. */
  placeId: string;
  /** ISO date of the verified visit. */
  date: string;
  /** Badge earned at this destination. */
  badgeId: string;
  /** Forum post that carried the verification, when there is one. */
  postId?: string;
  /** How the visit was verified. Demo simulation. */
  verification: 'GPS + DATE' | 'GPS + DATE + LOCAL CONFIRMATION';
  /** Short note printed on the passport page like a stamp caption. */
  note: string;
}

export interface ContributionStats {
  /** Destinations the traveller was first or near-first to document. */
  destinationsDocumented: number;
  storiesContributed: number;
  hiddenGemsFound: number;
  localExperiencesShared: number;
  /** DEMO DATA — labelled as such everywhere it is displayed. */
  travellersReached: number;
  lesserKnownPlaces: number;
  localContributorsDiscovered: number;
}

export interface PassportSeed {
  userId: string;
  /** Printed on the passport cover, passport-document style. */
  passportNo: string;
  issued: string;
  nationality: string;
  journeys: Journey[];
  /** Badge ids already unlocked at first load. */
  unlockedBadgeIds: string[];
  /** Craft badge progress at first load, keyed by badge id. */
  progress: Record<string, number>;
  stats: ContributionStats;
}

export const passportSeed: PassportSeed = {
  userId: CURRENT_USER_ID,
  passportNo: 'TT-IN-0042196',
  issued: '2025-11-04',
  nationality: 'INDIAN',
  journeys: [
    {
      placeId: 'hampi',
      date: '2026-01-18',
      badgeId: 'lost-empire',
      postId: 'hampi-quiet-side',
      verification: 'GPS + DATE + LOCAL CONFIRMATION',
      note: 'Crossed at 05:40. The coracle man was already awake.',
    },
    {
      placeId: 'munsiyari',
      date: '2026-04-27',
      badgeId: 'alpine-explorer',
      verification: 'GPS + DATE',
      note: 'Khaliya Top before the cloud came in.',
    },
    {
      placeId: 'tawang',
      date: '2026-05-16',
      badgeId: 'mountain-monk',
      verification: 'GPS + DATE + LOCAL CONFIRMATION',
      note: 'Sat at the back on the left. Took the butter tea.',
    },
    {
      placeId: 'spiti',
      date: '2026-06-30',
      badgeId: 'high-desert',
      verification: 'GPS + DATE',
      note: 'Two nights lower down first. Worth every hour.',
    },
    {
      placeId: 'kumbalangi',
      date: '2026-07-21',
      badgeId: 'backwater-wanderer',
      verification: 'GPS + DATE + LOCAL CONFIRMATION',
      note: 'Counterweight is heavier than it looks in photographs.',
    },
    {
      placeId: 'gandikota',
      date: '2026-08-02',
      badgeId: 'canyon-light',
      verification: 'GPS + DATE',
      note: 'Eleven people at the wall at sunrise. Eleven.',
    },
  ],
  unlockedBadgeIds: [
    'lost-empire',
    'alpine-explorer',
    'mountain-monk',
    'high-desert',
    'backwater-wanderer',
    'canyon-light',
    'heritage-keeper',
    'food-explorer',
  ],
  progress: {
    // Craft badges already earned sit at their target.
    'heritage-keeper': 3,
    'food-explorer': 3,
    // Still in progress — these are the ones the locked cards motivate.
    'local-legend': 1,
    'eco-explorer': 2,
    'community-contributor': 4,
  },
  stats: {
    destinationsDocumented: 4,
    storiesContributed: 12,
    hiddenGemsFound: 6,
    localExperiencesShared: 8,
    travellersReached: 1240,
    lesserKnownPlaces: 4,
    localContributorsDiscovered: 3,
  },
};

/**
 * Travel identity, derived from what is actually in the collection rather
 * than from an XP bar. The first matching rule wins, so the list runs from
 * most specific to most general.
 */
export interface TravelIdentity {
  title: string;
  line: string;
  /** Traits listed under the title. */
  traits: string[];
}

export function deriveIdentity(placeIds: string[], badgeCount: number): TravelIdentity {
  const has = (ids: string[]) => ids.filter((id) => placeIds.includes(id)).length;

  const coast = has(['varkala', 'neil-island', 'kumbalangi', 'majuli']);
  const mountain = has(['munsiyari', 'tawang', 'spiti', 'dzukou']);
  const heritage = has(['hampi', 'ellora', 'chettinad', 'pondicherry', 'gandikota']);

  const traits: string[] = [];
  if (coast >= 1) traits.push('COASTAL EXPLORER');
  if (mountain >= 1) traits.push('MOUNTAIN TRAVELLER');
  if (heritage >= 1) traits.push('HERITAGE SEEKER');
  if (badgeCount >= 8) traits.push('LOCAL STORYTELLER');
  if (!traits.length) traits.push('FIRST JOURNEY PENDING');

  if (coast >= 2 && mountain >= 2 && heritage >= 2)
    return { title: 'The Discoverer', line: 'Coast, altitude and ruin. You do not specialise.', traits };
  if (mountain >= 2 && mountain >= coast && mountain >= heritage)
    return { title: 'The High Traveller', line: 'You keep going up until the road gives out.', traits };
  if (coast >= 2 && coast >= heritage)
    return { title: 'The Shoreline Reader', line: 'You follow water until it stops being scenery.', traits };
  if (heritage >= 2)
    return { title: 'The Stone Reader', line: 'You go where somebody built something and left.', traits };
  if (placeIds.length === 0)
    return { title: 'The Unstamped', line: 'Your passport is waiting for its first stamp.', traits };
  return { title: 'The Discoverer', line: 'Still deciding what kind of traveller you are. Good.', traits };
}

/**
 * Landscape affinities for the profile page, from where the journeys actually
 * went. Three buckets, most visited first; ties broken by the order the
 * buckets are declared in.
 */
export function favoriteLandscapes(placeIds: string[], limit = 3): string[] {
  const buckets: Record<string, string[]> = {
    Coast: ['varkala', 'kumbalangi', 'majuli', 'neil-island'],
    Mountains: ['munsiyari', 'tawang', 'spiti', 'dzukou'],
    Heritage: ['hampi', 'ellora', 'chettinad', 'pondicherry', 'gandikota'],
  };
  return Object.entries(buckets)
    .filter(([, ids]) => ids.some((id) => placeIds.includes(id)))
    .slice(0, limit)
    .map(([label]) => label);
}
