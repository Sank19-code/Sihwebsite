import type { LocalListing } from './types';
import { placeById } from './indianPlaces';

/**
 * Local discovery data.
 *
 * TwinTrip is explicitly NOT a booking platform: there is no payment flow, no
 * inventory and no commission. Each listing is a pointer to a real person or
 * household, and the only action is "get in touch".
 *
 * Names and handles below are PLACEHOLDER DEMO DATA for the prototype — they
 * do not describe real businesses and carry no real contact details.
 */
interface LocalSeed {
  guide: string;
  guideBlurb: string;
  homestay: string;
  homestayBlurb: string;
  artisan: string;
  artisanCategory: LocalListing['category'];
  artisanBlurb: string;
}

const seeds: Record<string, LocalSeed> = {
  varkala: {
    guide: 'Anjali R.',
    guideBlurb: 'Walks the cliff from the temple end at first light, before the cafes open. Twelve years guiding, licensed by Kerala Tourism.',
    homestay: 'Sea Cliff Home',
    homestayBlurb: 'Four rooms in a family house set back from the north cliff. Fish curry at 8pm if you ask by noon.',
    artisan: 'Handloom Studio, Chirayinkeezhu',
    artisanCategory: 'ARTISAN',
    artisanBlurb: 'Two pit looms and one family. Kasavu cotton woven to order, roughly a week per piece.',
  },
  hampi: {
    guide: 'Shivaraj K.',
    guideBlurb: 'Archaeology graduate who grew up in Anegundi. Knows which ruins are worth sunrise and which are worth silence.',
    homestay: 'Boulder House',
    homestayBlurb: 'Mud-plastered rooms on the Virupapur side, reachable by coracle. Terrace faces the sunrise ridge.',
    artisan: 'Banana Fibre Craft Collective',
    artisanCategory: 'ARTISAN',
    artisanBlurb: 'A women-run workshop in Anegundi turning banana stem into paper, bags and rope.',
  },
  munsiyari: {
    guide: 'Dheeraj S.',
    guideBlurb: 'Certified high-altitude guide. Runs the Khaliya Top and Panchachuli base routes with his own porters.',
    homestay: 'Panchachuli View Home',
    homestayBlurb: 'Stone-and-slate house above the bend in the road. Five rooms, one wood stove, all five peaks.',
    artisan: 'Johari Wool Weavers',
    artisanCategory: 'ARTISAN',
    artisanBlurb: 'Hand-spun sheep and yak wool, woven on frame looms exactly as it was for the Tibet trade.',
  },
  tawang: {
    guide: 'Pema T.',
    guideBlurb: 'Monpa guide from Lhou village. Fluent in the monastery calendar and in when the pass will actually be open.',
    homestay: 'Lhou Village Homestay',
    homestayBlurb: 'A working Monpa household. Buckwheat pancakes, butter tea, and a wood-fired room at the end.',
    artisan: 'Mon Paper & Thangka Workshop',
    artisanCategory: 'ARTISAN',
    artisanBlurb: 'Handmade shugu-sheng paper and thangka painting, taught in short sessions if you have a morning.',
  },
  spiti: {
    guide: 'Tenzin D.',
    guideBlurb: 'Drives and guides the Kaza circuit. Will refuse a schedule that ignores acclimatisation, which is the right answer.',
    homestay: 'Langza Family Homestay',
    homestayBlurb: 'A mud-brick house at 4,400 metres with the Buddha statue on the ridge above it.',
    artisan: 'Spiti Ecosphere Craft Room',
    artisanCategory: 'ARTISAN',
    artisanBlurb: 'Sea buckthorn preserves, yak wool and solar-cooked local produce, run as a community enterprise.',
  },
  kumbalangi: {
    guide: 'Siby J.',
    guideBlurb: 'Fisherman by trade, guide by consequence. Works the Chinese nets and explains the counterweight properly.',
    homestay: 'Kallanchery Retreat',
    homestayBlurb: 'A waterfront family house on the channel. Country boat tied at the steps, included.',
    artisan: 'Coir Twisting Yard',
    artisanCategory: 'ARTISAN',
    artisanBlurb: 'Coconut husk retted in the backwater, then spun into coir by hand at the village yard.',
  },
  majuli: {
    guide: 'Bhaskar B.',
    guideBlurb: 'Grew up inside a satra. Times visits around the actual prayer schedule instead of around the ferry.',
    homestay: 'Mishing Stilt House',
    homestayBlurb: 'A traditional chang ghar on bamboo stilts, raised above the flood line, with a rice-beer welcome.',
    artisan: 'Samaguri Mask Workshop',
    artisanCategory: 'ARTISAN',
    artisanBlurb: 'Bamboo, clay and cow dung masks for the bhaona dance-dramas, made by the same family for generations.',
  },
  gandikota: {
    guide: 'Ravi Teja M.',
    guideBlurb: 'Local trekking guide for the gorge rim and the Belum caves circuit. Carries the only reliable torch.',
    homestay: 'Fort Edge Camp',
    homestayBlurb: 'Six canvas tents on the plateau, a hundred metres back from the drop. No walls, no wifi.',
    artisan: 'Kalamkari Block Studio',
    artisanCategory: 'ARTISAN',
    artisanBlurb: 'Natural-dye Kalamkari from nearby Pedana, block-printed and river-washed the slow way.',
  },
  chettinad: {
    guide: 'Meenakshi S.',
    guideBlurb: 'Heritage walker for the Kanadukathan mansions, with access to three houses that are not open to the public.',
    homestay: 'Aayiram Jannal House',
    homestayBlurb: 'A restored merchant mansion wing: teak pillars, an open courtyard, and a very long dining table.',
    artisan: 'Athangudi Tile Works',
    artisanCategory: 'ARTISAN',
    artisanBlurb: 'Handmade cement tiles poured one at a time on glass plates, cured in the sun for a week.',
  },
  dzukou: {
    guide: 'Vikho K.',
    guideBlurb: 'Angami guide from Viswema. Knows the shorter climb and the reason you should take the longer one.',
    homestay: 'Kigwema Village Homestay',
    homestayBlurb: 'A Naga family house at the trailhead. Smoked pork, sticky rice, and a 4am start if you want the mist.',
    artisan: 'Naga Loin-Loom Weavers',
    artisanCategory: 'ARTISAN',
    artisanBlurb: 'Back-strap loom shawls whose patterns still carry clan meaning. Ask before you buy a chief pattern.',
  },
  pondicherry: {
    guide: 'Arun P.',
    guideBlurb: 'Runs a two-hour walk across both grids, French and Tamil, ending at the market instead of the beach.',
    homestay: 'Thinnai House',
    homestayBlurb: 'A Tamil-quarter home with the original veranda seats and a courtyard that stays cool all afternoon.',
    artisan: 'Auroville Paper Unit',
    artisanCategory: 'ARTISAN',
    artisanBlurb: 'Cotton-rag handmade paper and marbling, made by a workers collective just outside town.',
  },
  ellora: {
    guide: 'Sameer D.',
    guideBlurb: 'Licensed ASI guide. Starts at Cave 16 from the top path so you meet Kailasa the way the carvers did.',
    homestay: 'Verul Village Stay',
    homestayBlurb: 'A simple four-room house ten minutes from the gate, with a kitchen that does a proper Marathwada thali.',
    artisan: 'Paithani Silk Loom',
    artisanCategory: 'ARTISAN',
    artisanBlurb: 'Paithani weaving in Yeola: a single sari can take months, and the border is done without a shuttle.',
  },
  'neil-island': {
    guide: 'Rahul B.',
    guideBlurb: 'PADI-certified reef guide. Will not take you out over live coral at low tide, and will explain why.',
    homestay: 'Bharatpur Beach Home',
    homestayBlurb: 'Three rooms behind the treeline, bicycles at the gate, and the reef ten minutes away on foot.',
    artisan: 'Island Shell & Wood Craft',
    artisanCategory: 'ARTISAN',
    artisanBlurb: 'Driftwood and reclaimed timber work. Nothing taken from a living reef, which rules out most souvenirs.',
  },
};

/**
 * Returns the three local listings for a place. Falls back to Varkala's set
 * so the section is never empty while new places are being added.
 */
export function localsFor(placeId: string): LocalListing[] {
  const place = placeById(placeId);
  const seed = seeds[placeId] ?? seeds.varkala;
  const label = place ? `${place.name}, ${place.state}` : 'Varkala, Kerala';
  const palette = place?.palette ?? {
    sky: ['#1B1014', '#E8833A'] as [string, string],
    land: '#120C0E',
    glow: '#FFB25E',
  };

  return [
    {
      id: `${placeId}-guide`,
      name: seed.guide,
      category: 'GUIDE',
      place: label,
      placeId,
      blurb: seed.guideBlurb,
      verified: true,
      handle: '+91 •••• ••••  ·  demo contact',
      palette,
    },
    {
      id: `${placeId}-stay`,
      name: seed.homestay,
      category: 'HOMESTAY',
      place: label,
      placeId,
      blurb: seed.homestayBlurb,
      verified: true,
      handle: '+91 •••• ••••  ·  demo contact',
      palette,
    },
    {
      id: `${placeId}-artisan`,
      name: seed.artisan,
      category: seed.artisanCategory,
      place: label,
      placeId,
      blurb: seed.artisanBlurb,
      verified: false,
      handle: '+91 •••• ••••  ·  demo contact',
      palette,
    },
  ];
}
