/**
 * Shared types for TwinTrip India prototype data.
 *
 * All numbers in here are DEMO DATA. The real product would compute the
 * emotional-similarity score from a landscape/climate/culture feature vector;
 * for the prototype they are hand-authored so the narrative is legible.
 */

export type Coordinates = [lat: number, lon: number];

/** Silhouette used by the procedural <Poster> renderer (no remote images). */
export type Terrain =
  | 'cliff'
  | 'peaks'
  | 'boulders'
  | 'canyon'
  | 'water'
  | 'caves'
  | 'island'
  | 'plateau'
  | 'colonial'
  | 'valley';

export interface Palette {
  /** Sky gradient, top → horizon. */
  sky: [string, string];
  /** Landform fill. */
  land: string;
  /** Accent used for light sources, rim light and marker glow. */
  glow: string;
}

export interface ForeignDestination {
  id: string;
  name: string;
  country: string;
  coordinates: Coordinates;
  /** id of the matching IndianPlace. */
  twin: string;
  /** 0–100 emotional similarity. Demo data. */
  match: number;
  /** One line shown in the hover card and the cinematic overlay. */
  tagline: string;
  /** Per-attribute similarity, 0–100. Demo data. */
  attributes: Record<string, number>;
}

export interface StoryChapter {
  /** Small monospaced marker, e.g. "01 — THE CLIFF". */
  label: string;
  text: string;
}

export interface IndianPlace {
  id: string;
  name: string;
  state: string;
  coordinates: Coordinates;
  terrain: Terrain;
  palette: Palette;
  /** Shown under the hero name in the twin reveal. */
  tagline: string;
  /** The "why it matches" paragraph. */
  why: string;
  bestSeason: string;
  tripLength: string;
  /** Demo budget range per person. */
  budget: string;
  /** Used by the "Discover more India" section. */
  feelingOf: string;
  story: {
    title: string;
    /** Approx narration length in seconds (the brief asks for ~90s). */
    duration: number;
    chapters: StoryChapter[];
  };
}

export interface LocalListing {
  id: string;
  name: string;
  category: 'GUIDE' | 'HOMESTAY' | 'ARTISAN' | 'KITCHEN' | 'BOATMAN';
  place: string;
  placeId: string;
  blurb: string;
  verified: boolean;
  /** Demo handle only — no real contact details in the prototype. */
  handle: string;
  palette: Palette;
}
