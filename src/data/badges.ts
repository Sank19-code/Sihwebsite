/**
 * ------------------------------------------------------------------
 * BADGES
 * ------------------------------------------------------------------
 * A badge is the receipt for a verified contribution. Two kinds:
 *
 *   PLACE  - earned by documenting a verified experience at one destination.
 *            Exactly one per Indian place, so the collection maps onto the map.
 *   CRAFT  - earned by a pattern of contribution (heritage, food, ecology,
 *            local storytelling, community help) rather than by geography.
 *
 * Rarity and progress targets are PROTOTYPE VALUES, like every other number
 * in this repo. Nothing here talks to a server.
 */

export type BadgeKind = 'place' | 'craft';
export type BadgeRarity = 'common' | 'rare' | 'legendary';

/** Motif drawn inside the badge medallion by <BadgeArt>. */
export type BadgeMotif =
  | 'cliff'
  | 'peaks'
  | 'boulders'
  | 'canyon'
  | 'water'
  | 'caves'
  | 'island'
  | 'plateau'
  | 'colonial'
  | 'valley'
  | 'leaf'
  | 'flame'
  | 'bowl'
  | 'quill'
  | 'people';

/** Outer medallion silhouette. */
export type BadgeFrame = 'hex' | 'shield' | 'disc' | 'diamond' | 'arch';

export type BadgeCategory = 'heritage' | 'food' | 'eco' | 'story' | 'community' | 'discovery';

export interface Badge {
  id: string;
  name: string;
  /** One line shown on the badge card. */
  description: string;
  /** Indian place id for `place` badges. */
  destination?: string;
  kind: BadgeKind;
  /** Contribution category a craft badge counts. */
  category?: BadgeCategory;
  rarity: BadgeRarity;
  motif: BadgeMotif;
  frame: BadgeFrame;
  /** Two-colour medallion palette. */
  ink: [string, string];
  /** Shown on the locked card: what the traveller has to actually do. */
  requirement: string;
  /** Craft badges show progress. `null` = single verified visit unlocks it. */
  target: number | null;
  /** Line printed under the badge at the moment it unlocks. */
  citation: string;
}

export const badges: Badge[] = [
  /* ---------------- Place badges ---------------- */
  {
    id: 'cliff-coast',
    name: 'Cliff & Coast',
    description: 'The red laterite cliff, and the twenty minutes it turns west.',
    destination: 'varkala',
    kind: 'place',
    rarity: 'common',
    motif: 'cliff',
    frame: 'arch',
    ink: ['#E8833A', '#FFB25E'],
    requirement: 'Submit a verified experience from Varkala, Kerala.',
    target: null,
    citation: 'Your journey just became part of India’s story.',
  },
  {
    id: 'lost-empire',
    name: 'Lost Empire',
    description: 'Boulders, ruins, and the hour before the heat arrives.',
    destination: 'hampi',
    kind: 'place',
    rarity: 'common',
    motif: 'boulders',
    frame: 'hex',
    ink: ['#C2703C', '#F2B47E'],
    requirement: 'Submit a verified experience from Hampi, Karnataka.',
    target: null,
    citation: 'Vijayanagara held half a million people. You found the quiet part.',
  },
  {
    id: 'alpine-explorer',
    name: 'Alpine Explorer',
    description: 'Five peaks, one wood stove, and a road that ends.',
    destination: 'munsiyari',
    kind: 'place',
    rarity: 'rare',
    motif: 'peaks',
    frame: 'diamond',
    ink: ['#7FA8C9', '#DCEBF5'],
    requirement: 'Submit a verified experience from Munsiyari, Uttarakhand.',
    target: null,
    citation: 'Panchachuli - the five hearths. You stood under all of them.',
  },
  {
    id: 'mountain-monk',
    name: 'Mountain Monk',
    description: 'Monastery time, measured in butter lamps.',
    destination: 'tawang',
    kind: 'place',
    rarity: 'rare',
    motif: 'peaks',
    frame: 'arch',
    ink: ['#9E2B18', '#E8833A'],
    requirement: 'Submit a verified experience from Tawang, Arunachal Pradesh.',
    target: null,
    citation: 'You kept the monastery calendar, not your own.',
  },
  {
    id: 'trailblazer',
    name: 'Trailblazer',
    description: 'First verified contribution from an under-documented place.',
    destination: 'dzukou',
    kind: 'place',
    rarity: 'legendary',
    motif: 'valley',
    frame: 'shield',
    ink: ['#2F6F63', '#8FD3C1'],
    requirement: 'Visit an under-documented destination and submit a verified experience.',
    target: null,
    citation: 'Your journey just became part of India’s story.',
  },
  {
    id: 'high-desert',
    name: 'High Desert',
    description: 'Cold desert, thin air, thousand-year-old walls.',
    destination: 'spiti',
    kind: 'place',
    rarity: 'rare',
    motif: 'plateau',
    frame: 'hex',
    ink: ['#6E7A8A', '#CFD8E3'],
    requirement: 'Submit a verified experience from Spiti, Himachal Pradesh.',
    target: null,
    citation: 'Tabo has stood there since 996 CE. You made the trip anyway.',
  },
  {
    id: 'backwater-wanderer',
    name: 'Backwater Wanderer',
    description: 'Canals instead of roads, and nobody in a hurry.',
    destination: 'kumbalangi',
    kind: 'place',
    rarity: 'common',
    motif: 'water',
    frame: 'disc',
    ink: ['#2F6F63', '#9FD8B8'],
    requirement: 'Submit a verified experience from Kumbalangi, Kerala.',
    target: null,
    citation: 'A model tourism village. You went as a guest, not a tour.',
  },
  {
    id: 'canyon-light',
    name: 'Canyon Light',
    description: 'The Pennar cutting through Erramala, on a smaller budget.',
    destination: 'gandikota',
    kind: 'place',
    rarity: 'rare',
    motif: 'canyon',
    frame: 'diamond',
    ink: ['#B4561F', '#F0A868'],
    requirement: 'Submit a verified experience from Gandikota, Andhra Pradesh.',
    target: null,
    citation: 'A gorge nobody put on a poster. Now somebody has.',
  },
  {
    id: 'stone-carver',
    name: 'Stone Carver',
    description: 'A temple cut downward out of one rock.',
    destination: 'ellora',
    kind: 'place',
    rarity: 'rare',
    motif: 'caves',
    frame: 'arch',
    ink: ['#8A6A4B', '#E0C29B'],
    requirement: 'Submit a verified experience from Ellora, Maharashtra.',
    target: null,
    citation: 'Kailasa was carved top-down. No second attempt was possible.',
  },
  {
    id: 'river-island',
    name: 'River Island',
    description: 'The largest river island there is, and its mask makers.',
    destination: 'majuli',
    kind: 'place',
    rarity: 'rare',
    motif: 'water',
    frame: 'disc',
    ink: ['#3E7C59', '#A8DCB4'],
    requirement: 'Submit a verified experience from Majuli, Assam.',
    target: null,
    citation: 'The Brahmaputra takes some of it back every year. You saw it first.',
  },
  {
    id: 'mansion-keeper',
    name: 'Mansion Keeper',
    description: 'Burma teak, Athangudi tile, and a very long lunch.',
    destination: 'chettinad',
    kind: 'place',
    rarity: 'common',
    motif: 'colonial',
    frame: 'hex',
    ink: ['#A8763A', '#EBC98C'],
    requirement: 'Submit a verified experience from Chettinad, Tamil Nadu.',
    target: null,
    citation: 'Traders built these for a century that ended. The houses did not.',
  },
  {
    id: 'boulevard-walker',
    name: 'Boulevard Walker',
    description: 'A grid of yellow walls that forgot which country it was in.',
    destination: 'pondicherry',
    kind: 'place',
    rarity: 'common',
    motif: 'colonial',
    frame: 'disc',
    ink: ['#D9A441', '#F6DFA8'],
    requirement: 'Submit a verified experience from Puducherry, Tamil Nadu.',
    target: null,
    citation: 'Rue, not road. The signage never changed.',
  },
  {
    id: 'reef-guardian',
    name: 'Reef Guardian',
    description: 'Shallow coral that survives being looked at, not stood on.',
    destination: 'neil-island',
    kind: 'place',
    rarity: 'legendary',
    motif: 'island',
    frame: 'shield',
    ink: ['#2E7F9E', '#9FE3F0'],
    requirement: 'Submit a verified experience from Neil Island, Andaman & Nicobar.',
    target: null,
    citation: 'You left the reef exactly as loud as you found it.',
  },

  /* ---------------- Craft badges ---------------- */
  {
    id: 'heritage-keeper',
    name: 'Heritage Keeper',
    description: 'For documenting heritage that had no record online.',
    kind: 'craft',
    category: 'heritage',
    rarity: 'rare',
    motif: 'caves',
    frame: 'shield',
    ink: ['#9E2B18', '#E8A05E'],
    requirement: 'Document 3 verified heritage experiences.',
    target: 3,
    citation: 'Three places that are easier to find than they were.',
  },
  {
    id: 'food-explorer',
    name: 'Food Explorer',
    description: 'For the kitchens that never made it into a guidebook.',
    kind: 'craft',
    category: 'food',
    rarity: 'common',
    motif: 'bowl',
    frame: 'disc',
    ink: ['#C8531F', '#F5B679'],
    requirement: 'Document 3 verified local food experiences.',
    target: 3,
    citation: 'Someone is going to eat well because of you.',
  },
  {
    id: 'local-legend',
    name: 'Local Legend',
    description: 'For carrying a local story further than the village.',
    kind: 'craft',
    category: 'story',
    rarity: 'legendary',
    motif: 'quill',
    frame: 'diamond',
    ink: ['#B8862B', '#F3D89A'],
    requirement: 'Document 3 verified local stories.',
    target: 3,
    citation: 'A story only told out loud is one power cut from gone.',
  },
  {
    id: 'eco-explorer',
    name: 'Eco Explorer',
    description: 'For travel that costs the place nothing.',
    kind: 'craft',
    category: 'eco',
    rarity: 'rare',
    motif: 'leaf',
    frame: 'hex',
    ink: ['#2F6F63', '#93D6A8'],
    requirement: 'Complete 3 verified responsible-travel experiences.',
    target: 3,
    citation: 'The place is not worse for you having been there.',
  },
  {
    id: 'community-contributor',
    name: 'Community Contributor',
    description: 'For answers that actually helped somebody travel.',
    kind: 'craft',
    category: 'community',
    rarity: 'common',
    motif: 'people',
    frame: 'arch',
    ink: ['#6C6FB0', '#C3C5EE'],
    requirement: 'Make 5 contributions the community marks as helpful.',
    target: 5,
    citation: 'Five travellers got a real answer instead of a listicle.',
  },
];

export const badgeById = (id: string) => badges.find((b) => b.id === id);

/** The place badge attached to an Indian destination, if any. */
export const badgeForPlace = (placeId: string) =>
  badges.find((b) => b.kind === 'place' && b.destination === placeId);

export const rarityLabel: Record<BadgeRarity, string> = {
  common: 'COMMON',
  rare: 'RARE',
  legendary: 'LEGENDARY',
};
