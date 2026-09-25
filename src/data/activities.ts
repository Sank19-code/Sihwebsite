export type Interest = 'nature' | 'culture' | 'adventure' | 'food' | 'spiritual';

export const INTERESTS: { id: Interest; label: string }[] = [
  { id: 'nature', label: 'Nature' },
  { id: 'culture', label: 'Culture' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'food', label: 'Food' },
  { id: 'spiritual', label: 'Spiritual' },
];

/**
 * One signature activity per interest, per place. The itinerary generator in
 * lib/itinerary.ts picks from these according to what the traveller ticked.
 *
 * TO EXTEND: add a key here for any new place id in indianPlaces.ts. Missing
 * places fall back to a generic set so the planner never breaks.
 */
export const activities: Record<string, Record<Interest, string>> = {
  varkala: {
    nature: 'Cliff walk at first light, Papanasham beach below',
    culture: 'Janardanaswamy temple and the old harbour quarter',
    adventure: 'Surf lesson off the black-sand beach',
    food: 'Karimeen and toddy-shop lunch inland',
    spiritual: 'Sivagiri Mutt, then sunset from the north cliff',
  },
  hampi: {
    nature: 'Coracle crossing and the Tungabhadra boulder field',
    culture: 'Vittala temple, stone chariot, musical pillars',
    adventure: 'Bouldering session at Hemakuta at dawn',
    food: 'Banana-leaf thali in Kamalapura village',
    spiritual: 'Virupaksha morning aarti, before the heat',
  },
  munsiyari: {
    nature: 'Khaliya Top meadow trek, Panchachuli in full view',
    culture: 'Johari wool weavers and the old trade-route museum',
    adventure: 'Two-day Thamri Kund trail with a local guide',
    food: 'Bhatt ki churkani and a wood-stove dinner',
    spiritual: 'Nanda Devi temple at the edge of the village',
  },
  tawang: {
    nature: 'Sela Pass and the high lakes on the way up',
    culture: 'Tawang Monastery prayer hall and library',
    adventure: 'Bum La approach road, weather permitting',
    food: 'Thukpa, zan and butter tea in a Monpa kitchen',
    spiritual: 'Morning chanting with the monks, 5:30am',
  },
  spiti: {
    nature: 'Chandratal lake and the Kunzum plateau',
    culture: 'Tabo monastery murals, in use since 996 CE',
    adventure: 'Hikkim to Komic high-altitude ride',
    food: 'Barley thukpa and sea-buckthorn tea',
    spiritual: 'Key Monastery at sunrise above the valley',
  },
  kumbalangi: {
    nature: 'Mangrove channel paddle at high tide',
    culture: 'Chinese fishing nets worked by the village crew',
    adventure: 'Night kayak to look for bioluminescence',
    food: 'Clam roast and toddy at a waterfront kitchen',
    spiritual: 'Old shoreline chapel and the fishing blessing',
  },
  majuli: {
    nature: 'Brahmaputra sandbar birding at dawn',
    culture: 'Satra visit with a bhaona dance rehearsal',
    adventure: 'Cycle the full island loop between ferries',
    food: 'Assamese thali with khar and fish tenga',
    spiritual: 'Evening naam prayer at Auniati satra',
  },
  gandikota: {
    nature: 'Sunrise on the gorge rim above the Pennar',
    culture: 'Fort walls, granary and the Jamia Masjid',
    adventure: 'Belum caves descent, then a rim scramble',
    food: 'Rayalaseema meals: ragi sangati and natu kodi',
    spiritual: 'Madhavaraya temple inside the fort walls',
  },
  chettinad: {
    nature: 'Palm-lined back roads between the villages',
    culture: 'Kanadukathan mansion tour, three houses',
    adventure: 'Cycle the seventy-village heritage circuit',
    food: 'Chettinad cooking session with a family cook',
    spiritual: 'Pillaiyarpatti rock-cut temple at dusk',
  },
  ellora: {
    nature: 'Basalt escarpment walk above the cave line',
    culture: 'Kailasa temple, top path first, then the floor',
    adventure: 'Daulatabad fort climb, all the way up',
    food: 'Marathwada thali and naan qalia in Aurangabad',
    spiritual: 'Grishneshwar jyotirlinga, early morning',
  },
  dzukou: {
    nature: 'Dzükou valley floor, bamboo grass to the horizon',
    culture: 'Angami village visit at Kigwema',
    adventure: 'Full trek from Viswema with an overnight',
    food: 'Smoked pork with axone and sticky rice',
    spiritual: 'Morning mist walk to the valley cross',
  },
  pondicherry: {
    nature: 'Paradise beach by boat, early enough to be alone',
    culture: 'White Town and Tamil quarter walking tour',
    adventure: 'Coastal cycle to Auroville and back',
    food: 'Creole breakfast, then a proper south Indian lunch',
    spiritual: 'Sri Aurobindo Ashram, silent sitting',
  },
  'neil-island': {
    nature: 'Snorkel the shallow reef off Bharatpur',
    culture: 'Village fishing harbour at the morning landing',
    adventure: 'Low-tide walk to the Laxmanpur natural bridge',
    food: 'Grilled catch of the day at a beach shack',
    spiritual: 'Sunset at Laxmanpur, which counts',
  },
};

export const fallbackActivities: Record<Interest, string> = {
  nature: 'Landscape walk with a local guide',
  culture: 'Heritage site visit and village walk',
  adventure: 'Guided trail or water activity',
  food: 'Home-kitchen meal with a local family',
  spiritual: 'Sunrise visit to the main shrine',
};
