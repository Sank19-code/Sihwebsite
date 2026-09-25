import { activities, fallbackActivities, type Interest } from '../data/activities';
import type { IndianPlace } from '../data/types';

export interface Day {
  index: number;
  title: string;
  lines: string[];
  /** Indicative share of the total budget for this day, 0–1. */
  share: number;
}

export interface Itinerary {
  days: Day[];
  /** Indicative per-person total, in rupees. */
  total: number;
  perDay: number;
  /** Indicative route waypoints as [lat, lon]. */
  route: [number, number][];
  note: string;
}

/**
 * ------------------------------------------------------------------
 * DEMO ITINERARY GENERATOR
 * ------------------------------------------------------------------
 * Fully client-side. Given a place, a day count, a budget, a party size and a
 * set of interests, it composes an arrival day, themed middle days and a
 * departure day, then spreads the budget across them.
 *
 * This is a plausible-output generator, not a planning engine: it does not
 * check opening hours, transport connections or seasonality. Swapping it for a
 * real service means replacing this one function.
 */
export function buildItinerary(
  place: IndianPlace,
  days: number,
  budget: number,
  travellers: number,
  interests: Interest[],
): Itinerary {
  const pool = activities[place.id] ?? fallbackActivities;
  const picked = (interests.length ? interests : (['nature', 'culture'] as Interest[])).map(
    (i) => (pool as Record<Interest, string>)[i] ?? fallbackActivities[i],
  );

  const result: Day[] = [];

  // Day 1 — arrival.
  result.push({
    index: 1,
    title: `Arrive in ${place.name}`,
    lines: [
      'Transfer in, settle at the homestay',
      picked[0] ?? fallbackActivities.nature,
      'Sunset from the viewpoint, early night',
    ],
    share: 0.3,
  });

  // Middle days — one interest each, cycling if there are more days than picks.
  const middle = Math.max(0, days - 2);
  for (let i = 0; i < middle; i++) {
    const a = picked[(i + 1) % picked.length];
    const b = picked[(i + 2) % picked.length];
    result.push({
      index: i + 2,
      title: dayTitle(i, interests),
      lines: [a, b, i === 0 ? 'Evening free in the village' : 'Slow evening, local dinner'].filter(
        (v, idx, arr) => arr.indexOf(v) === idx,
      ),
      share: 0.24,
    });
  }

  // Final day — departure (only if there is more than one day).
  if (days > 1) {
    result.push({
      index: days,
      title: 'Culture + departure',
      lines: [
        picked[picked.length - 1] ?? fallbackActivities.culture,
        'Buy direct from the artisan, not the airport',
        'Transfer out',
      ],
      share: 0.22,
    });
  }

  // Normalise the budget shares so they always sum to 1.
  const sum = result.reduce((n, d) => n + d.share, 0);
  result.forEach((d) => (d.share = d.share / sum));

  const total = budget * travellers;

  return {
    days: result,
    total,
    perDay: Math.round(budget / Math.max(1, days)),
    route: buildRoute(place, result.length),
    note: 'Indicative demo itinerary. No availability, transport or pricing is checked.',
  };
}

function dayTitle(i: number, interests: Interest[]): string {
  const titles = [
    'Cliff + beach + local food',
    'Backwater experience',
    'Trail day',
    'Village + kitchen',
    'Ruins + river',
    'Long walk, no plan',
  ];
  if (interests.includes('adventure') && i === 0) return 'Trail day';
  if (interests.includes('food') && i === 1) return 'Village + kitchen';
  return titles[i % titles.length];
}

/**
 * Synthesises indicative waypoints around the destination for the route map.
 * Deterministic, so the same trip always draws the same line.
 */
function buildRoute(place: IndianPlace, days: number): [number, number][] {
  const [lat, lon] = place.coordinates;
  const pts: [number, number][] = [];
  const seed = place.name.length;
  for (let i = 0; i < days; i++) {
    // Longitude advances steadily so the drawn line reads left-to-right like
    // a journey; latitude wanders so it does not look like a ruler.
    const t = days > 1 ? i / (days - 1) : 0.5;
    pts.push([lat + Math.sin(i * 1.35 + seed) * 0.07, lon - 0.13 + t * 0.26]);
  }
  return pts;
}
