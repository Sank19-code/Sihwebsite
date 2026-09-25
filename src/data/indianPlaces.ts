import type { IndianPlace } from './types';

/**
 * The Indian "emotional twins".
 *
 * TO ADD A PLACE: append an entry, give it a `terrain` + `palette` (the
 * procedural <Poster> component draws the artwork from these two fields, so
 * there are no image files to source), then point a destination's `twin` at it.
 *
 * Budgets, trip lengths and seasons are indicative PROTOTYPE VALUES.
 */
export const indianPlaces: IndianPlace[] = [
  {
    id: 'varkala',
    name: 'Varkala',
    state: 'Kerala',
    coordinates: [8.7379, 76.7163],
    terrain: 'cliff',
    palette: { sky: ['#1B1014', '#E8833A'], land: '#120C0E', glow: '#FFB25E' },
    tagline: 'Same feeling. Different place.',
    why: 'Clifftop views over the Arabian Sea, west-facing sunsets and a slow coastal rhythm — the red laterite cliff does what the caldera does, only warmer.',
    bestSeason: 'Oct – Mar',
    tripLength: '3–4 days',
    budget: '₹8,000 – ₹14,000',
    feelingOf: 'Your Santorini feeling.',
    story: {
      title: 'The cliff that meets the sea',
      duration: 90,
      chapters: [
        {
          label: '01 — THE EDGE',
          text: 'Varkala is one of the few places on the Indian coast where a cliff walks straight into the sea. Red laterite, fifteen metres of it, holding a footpath above the Arabian Sea.',
        },
        {
          label: '02 — THE SPRING',
          text: 'Fresh water seeps out of that rock and runs down to the beach. Papanasham, the locals call it: the sand that takes away sin. People came here to remember their dead long before anyone came here to watch a sunset.',
        },
        {
          label: '03 — THE TEMPLE',
          text: 'The Janardanaswamy temple has stood above this shore for around a thousand years. In the morning the cliff belongs to ritual. By afternoon it belongs to whoever is awake.',
        },
        {
          label: '04 — THE HOUR',
          text: 'And then the cliff turns west, and everything on it stops for twenty minutes. That is the feeling you were looking for. It was never only in Greece.',
        },
      ],
    },
  },
  {
    id: 'tawang',
    name: 'Tawang',
    state: 'Arunachal Pradesh',
    coordinates: [27.5861, 91.8594],
    terrain: 'peaks',
    palette: { sky: ['#0A1418', '#5E93A8'], land: '#0C1113', glow: '#9FD4E3' },
    tagline: 'Same quiet. Thinner air.',
    why: 'A 17th-century monastery on a ridge at 3,000 metres, timber prayer halls, and mountain weather that changes the light every ten minutes.',
    bestSeason: 'Mar – Oct',
    tripLength: '5–6 days',
    budget: '₹16,000 – ₹24,000',
    feelingOf: 'Your Kyoto feeling.',
    story: {
      title: 'The monastery above the clouds',
      duration: 90,
      chapters: [
        {
          label: '01 — THE RIDGE',
          text: 'Tawang Monastery sits on a spur above the valley, founded in the 1680s and still the largest of its kind in India.',
        },
        {
          label: '02 — THE HORSE',
          text: 'Legend says the site was chosen by a horse that wandered off and stopped here. The name carries it: Ta-wang, chosen by the horse.',
        },
        {
          label: '03 — THE HALL',
          text: 'Inside, an eight-metre Buddha, rows of butter lamps, and the low sound of a hundred voices reciting at exactly the same speed.',
        },
        {
          label: '04 — THE PASS',
          text: 'Outside, Sela Pass, snow for most of the year, and a silence that has nothing to prove to anybody.',
        },
      ],
    },
  },
  {
    id: 'munsiyari',
    name: 'Munsiyari',
    state: 'Uttarakhand',
    coordinates: [30.0668, 80.2386],
    terrain: 'peaks',
    palette: { sky: ['#0B0F16', '#7E93B8'], land: '#0A0D11', glow: '#CFE0F5' },
    tagline: 'The Alps, without the passport.',
    why: 'The Panchachuli massif stands directly above the village: five snow peaks, alpine meadows below them, and trekking routes that start at your guesthouse door.',
    bestSeason: 'Mar – Jun, Sep – Nov',
    tripLength: '4–5 days',
    budget: '₹12,000 – ₹18,000',
    feelingOf: 'Your Swiss Alps feeling.',
    story: {
      title: 'Five peaks and a kitchen fire',
      duration: 90,
      chapters: [
        {
          label: '01 — THE FIVE',
          text: 'Panchachuli: five chulhas, five cooking fires. The Pandavas are said to have cooked their last meal on these summits before walking on.',
        },
        {
          label: '02 — THE ROUTE',
          text: 'This was a trade road to Tibet. Salt and wool moved through Munsiyari until the border closed in 1962, and the village has been quiet ever since.',
        },
        {
          label: '03 — THE WOOL',
          text: 'Johari weavers still work here. The shawl on the loom is the same weave that used to travel the pass.',
        },
        {
          label: '04 — THE LIGHT',
          text: 'At twenty to six the first sun hits the snow wall and the whole thing goes orange for about four minutes. Everyone in the village already knows.',
        },
      ],
    },
  },
  {
    id: 'ellora',
    name: 'Ellora',
    state: 'Maharashtra',
    coordinates: [20.0268, 75.1779],
    terrain: 'caves',
    palette: { sky: ['#17100A', '#C8762F'], land: '#0E0A07', glow: '#E8A25A' },
    tagline: 'Carved down, not built up.',
    why: 'Thirty-four monuments cut straight into a basalt cliff, and Kailasa: a full temple excavated top-down out of a single rock. Petra in scale, India in intent.',
    bestSeason: 'Nov – Feb',
    tripLength: '2–3 days',
    budget: '₹7,000 – ₹11,000',
    feelingOf: 'Your Petra feeling.',
    story: {
      title: 'A temple removed from a mountain',
      duration: 90,
      chapters: [
        {
          label: '01 — THE SUBTRACTION',
          text: 'Kailasa was not constructed. Rock was removed from a hillside, by hand, until a temple was left standing inside the hole.',
        },
        {
          label: '02 — THE ORDER',
          text: 'They started at the top and worked down. There is no way to undo a mistake in a technique like that.',
        },
        {
          label: '03 — THE THREE',
          text: 'Buddhist, Hindu and Jain caves share the same cliff, cut over roughly five centuries, next door to each other.',
        },
        {
          label: '04 — THE SCALE',
          text: 'Stand in the courtyard and the walls go up thirty metres on every side. All of it used to be solid basalt.',
        },
      ],
    },
  },
  {
    id: 'hampi',
    name: 'Hampi',
    state: 'Karnataka',
    coordinates: [15.335, 76.462],
    terrain: 'boulders',
    palette: { sky: ['#160F0A', '#D98C3E'], land: '#100B08', glow: '#F0B168' },
    tagline: 'An empire, left where it fell.',
    why: 'Granite boulders the size of houses, a river running through them, and the ruins of Vijayanagara scattered across twenty-six square kilometres.',
    bestSeason: 'Oct – Feb',
    tripLength: '3–4 days',
    budget: '₹7,000 – ₹12,000',
    feelingOf: 'Your Machu Picchu feeling.',
    story: {
      title: 'The city the boulders kept',
      duration: 90,
      chapters: [
        {
          label: '01 — THE CAPITAL',
          text: 'Around 1500, Vijayanagara was one of the largest cities on earth. Foreign traders wrote home about markets selling gemstones by the measure.',
        },
        {
          label: '02 — THE END',
          text: 'In 1565 it was sacked and abandoned. The boulders stayed. The city did not.',
        },
        {
          label: '03 — THE STONE',
          text: 'The carved pillars at Vittala ring like struck metal. The stone chariot in the courtyard has wheels that once turned.',
        },
        {
          label: '04 — THE RIVER',
          text: 'The Tungabhadra still moves through it at the same pace, past coracle boats whose design has not changed in centuries.',
        },
      ],
    },
  },
  {
    id: 'majuli',
    name: 'Majuli',
    state: 'Assam',
    coordinates: [26.9511, 94.1758],
    terrain: 'water',
    palette: { sky: ['#0C1410', '#3F8F6D'], land: '#091110', glow: '#7EDCAC' },
    tagline: 'An island the river is still deciding about.',
    why: 'The largest river island in the world, monastic satras where dance is a daily practice, and an entire culture organised around the mood of the Brahmaputra.',
    bestSeason: 'Nov – Mar',
    tripLength: '3–4 days',
    budget: '₹9,000 – ₹14,000',
    feelingOf: 'Your Bali feeling.',
    story: {
      title: 'The island that keeps moving',
      duration: 90,
      chapters: [
        {
          label: '01 — THE RIVER',
          text: 'Majuli sits inside the Brahmaputra. Every flood takes some of it away, and the island is a fraction of the size it was a century ago.',
        },
        {
          label: '02 — THE SATRA',
          text: 'Its monasteries were founded in the 1500s as centres of a devotional movement where theology is taught through performance.',
        },
        {
          label: '03 — THE MASK',
          text: 'In Samaguri, masks of bamboo, clay and cloth are still made by hand for the dance-dramas. Some are tall enough to swallow a person.',
        },
        {
          label: '04 — THE FERRY',
          text: 'There is no bridge. You arrive by boat, and the island decides how long the crossing takes.',
        },
      ],
    },
  },
  {
    id: 'gandikota',
    name: 'Gandikota',
    state: 'Andhra Pradesh',
    coordinates: [14.8127, 78.2833],
    terrain: 'canyon',
    palette: { sky: ['#180D09', '#B64A28'], land: '#0F0806', glow: '#E8703F' },
    tagline: 'The ground opens, quietly.',
    why: 'A deep red sandstone gorge cut by the Pennar river, with a 13th-century fort sitting on the rim and almost nobody standing on it.',
    bestSeason: 'Oct – Feb',
    tripLength: '2 days',
    budget: '₹5,000 – ₹9,000',
    feelingOf: 'Your Grand Canyon feeling.',
    story: {
      title: 'The gorge with a fort on the edge',
      duration: 90,
      chapters: [
        {
          label: '01 — THE NARROW',
          text: 'Gandi-kota: the fort in the gorge. The Pennar squeezes between two hills and drops away below the wall.',
        },
        {
          label: '02 — THE FORT',
          text: 'Built in the 13th century, extended for five hundred years, and now mostly left to goats and grass.',
        },
        {
          label: '03 — THE WALLS',
          text: 'Inside them, a granary, a Jamia Masjid and a Madhavaraya temple stand within a few minutes of each other.',
        },
        {
          label: '04 — THE EDGE',
          text: 'There is no railing. You walk to the lip, sit down, and the canyon does the rest.',
        },
      ],
    },
  },
  {
    id: 'chettinad',
    name: 'Chettinad',
    state: 'Tamil Nadu',
    coordinates: [10.1651, 78.7859],
    terrain: 'colonial',
    palette: { sky: ['#160E0B', '#9E2B18'], land: '#0E0908', glow: '#E06A4A' },
    tagline: 'Wealth, turned into architecture.',
    why: 'Merchant mansions built with Burmese teak, Italian marble and Belgian glass: an entire region designed to be impressive, and a cuisine that matches it.',
    bestSeason: 'Nov – Feb',
    tripLength: '2–3 days',
    budget: '₹9,000 – ₹15,000',
    feelingOf: 'Your Dubai feeling, three centuries earlier.',
    story: {
      title: 'The houses the traders built',
      duration: 90,
      chapters: [
        {
          label: '01 — THE MONEY',
          text: 'The Nattukottai Chettiars financed trade across Burma, Ceylon and Malaya, and brought the profits home to seventy-odd villages.',
        },
        {
          label: '02 — THE IMPORT',
          text: 'Teak from Burma, marble from Italy, chandeliers from Europe, all assembled around a courtyard plan that is entirely local.',
        },
        {
          label: '03 — THE TILE',
          text: 'Athangudi tiles are still poured by hand, one at a time, from local soil and coloured cement.',
        },
        {
          label: '04 — THE TABLE',
          text: 'And then the food: black pepper, star anise, sun-dried meat, and a kitchen that never learned restraint.',
        },
      ],
    },
  },
  {
    id: 'dzukou',
    name: 'Dzükou Valley',
    state: 'Nagaland',
    coordinates: [25.5561, 94.0928],
    terrain: 'valley',
    palette: { sky: ['#0A1210', '#4E8F72'], land: '#080E0C', glow: '#8FE0B0' },
    tagline: 'Green, all the way across.',
    why: 'A high valley of rolling bamboo grass and seasonal lilies, with mist crossing it at walking speed. Highland weather at a tropical latitude.',
    bestSeason: 'Jun – Sep',
    tripLength: '3 days',
    budget: '₹8,000 – ₹12,000',
    feelingOf: 'Your Scottish Highlands feeling.',
    story: {
      title: 'The valley of flowers nobody planted',
      duration: 90,
      chapters: [
        {
          label: '01 — THE CLIMB',
          text: 'You reach Dzükou on foot, from Viswema or Jakhama, and the last hour is the one that decides how you feel about it.',
        },
        {
          label: '02 — THE GRASS',
          text: 'The floor is dwarf bamboo, cut close by wind, and it rolls in a way that makes distance impossible to judge.',
        },
        {
          label: '03 — THE LILY',
          text: 'In late monsoon the Dzükou lily appears here and, as far as anyone has found, nowhere else.',
        },
        {
          label: '04 — THE COLD',
          text: 'The stream runs under ice in winter. There is one rest house, and it is always full of people who are glad they came.',
        },
      ],
    },
  },
  {
    id: 'spiti',
    name: 'Spiti',
    state: 'Himachal Pradesh',
    coordinates: [32.2464, 78.0349],
    terrain: 'plateau',
    palette: { sky: ['#0A0D14', '#6B7FA3'], land: '#0B0A09', glow: '#C9D8F0' },
    tagline: 'Land before decoration.',
    why: 'A cold desert at four thousand metres. No trees, no softness, and a night sky that is genuinely difficult to describe afterwards.',
    bestSeason: 'Jun – Sep',
    tripLength: '7–8 days',
    budget: '₹22,000 – ₹32,000',
    feelingOf: 'Your Iceland feeling.',
    story: {
      title: 'The middle land',
      duration: 90,
      chapters: [
        {
          label: '01 — THE NAME',
          text: 'Spiti means the middle land: between India and Tibet, and between habitable and not.',
        },
        {
          label: '02 — THE MONASTERY',
          text: 'Tabo has been in continuous use since 996 CE. Its mud walls hold murals older than most stone buildings anywhere.',
        },
        {
          label: '03 — THE VILLAGE',
          text: 'Kibber, Langza, Komic: villages above four thousand metres, farming barley in a window of about four months.',
        },
        {
          label: '04 — THE SKY',
          text: 'At night, with no moisture and no light, the sky here stops being a background and becomes the subject.',
        },
      ],
    },
  },
  {
    id: 'kumbalangi',
    name: 'Kumbalangi',
    state: 'Kerala',
    coordinates: [9.8756, 76.2634],
    terrain: 'water',
    palette: { sky: ['#0B1211', '#2F6F63'], land: '#081010', glow: '#6FD3C0' },
    tagline: 'Where the lanes are water.',
    why: 'The first model tourism village in India: backwater channels instead of streets, Chinese fishing nets on the shoreline, and boats doing the work cars do elsewhere.',
    bestSeason: 'Sep – Mar',
    tripLength: '2–3 days',
    budget: '₹6,000 – ₹11,000',
    feelingOf: 'Your Venice feeling.',
    story: {
      title: 'The village that floats',
      duration: 90,
      chapters: [
        {
          label: '01 — THE ISLAND',
          text: 'Kumbalangi is a cluster of islands near Kochi, held together by mangrove roots and the tide.',
        },
        {
          label: '02 — THE NET',
          text: 'The cheena vala, the Chinese fishing nets, have been lowered into this water since the 14th century, worked by four men and a counterweight.',
        },
        {
          label: '03 — THE GLOW',
          text: 'On some dark nights the water lights up wherever you disturb it. Kavaru, they call it: bioluminescent plankton.',
        },
        {
          label: '04 — THE MEAL',
          text: 'The catch does not travel. It goes from the net to a kitchen fifty metres away, with coconut and kudampuli.',
        },
      ],
    },
  },
  {
    id: 'pondicherry',
    name: 'Puducherry',
    state: 'Tamil Nadu',
    coordinates: [11.9139, 79.8145],
    terrain: 'colonial',
    palette: { sky: ['#140F0D', '#D2A24E'], land: '#0C0908', glow: '#F0C878' },
    tagline: 'Long afternoons, louvred shutters.',
    why: 'A grid of mustard-yellow colonnades and bougainvillea, a promenade that closes to traffic every evening, and a cafe culture that never learned to hurry.',
    bestSeason: 'Oct – Mar',
    tripLength: '3 days',
    budget: '₹9,000 – ₹15,000',
    feelingOf: 'Your Paris feeling.',
    story: {
      title: 'The town with two grids',
      duration: 90,
      chapters: [
        {
          label: '01 — THE CANAL',
          text: 'A canal once split the town in two: French quarter on one side, Tamil quarter on the other. The architecture still remembers it.',
        },
        {
          label: '02 — THE SHUTTER',
          text: 'White Town is colonnades, ochre walls and louvred shutters. Cross over, and the houses turn inward around thinnai verandas instead.',
        },
        {
          label: '03 — THE PROMENADE',
          text: 'Every evening the seafront closes to cars and the entire town walks the same stretch of road.',
        },
        {
          label: '04 — THE TABLE',
          text: 'And then a coffee, at a table, for as long as you like. That was always the point.',
        },
      ],
    },
  },
  {
    id: 'neil-island',
    name: 'Neil Island',
    state: 'Andaman & Nicobar',
    coordinates: [11.8318, 93.0288],
    terrain: 'island',
    palette: { sky: ['#071215', '#2E8C9E'], land: '#061011', glow: '#77DCE8' },
    tagline: 'Shallow, clear, and almost empty.',
    why: 'Turquoise shallows over living coral, a natural rock bridge that appears at low tide, and an island small enough to cycle across in an afternoon.',
    bestSeason: 'Nov – Apr',
    tripLength: '4–5 days',
    budget: '₹18,000 – ₹28,000',
    feelingOf: 'Your Maldives feeling.',
    story: {
      title: 'Low tide, and what it shows',
      duration: 90,
      chapters: [
        {
          label: '01 — THE SHELF',
          text: 'Neil, officially Shaheed Dweep, sits on a reef shelf. That is why the water stays waist-deep and glass-clear a long way out.',
        },
        {
          label: '02 — THE BRIDGE',
          text: 'At low tide a natural coral arch appears at Laxmanpur. A few hours later the sea takes it back.',
        },
        {
          label: '03 — THE REEF',
          text: 'The coral here is alive and shallow enough to see without a tank, which also makes it fragile enough to ruin by standing on it.',
        },
        {
          label: '04 — THE PACE',
          text: 'There is one road worth naming and a great many bicycles. Nobody is going anywhere quickly.',
        },
      ],
    },
  },
];

export const placeById = (id: string) => indianPlaces.find((p) => p.id === id);
