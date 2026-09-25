import type { Terrain } from './types';

/**
 * ------------------------------------------------------------------
 * FORUM SEED CONTENT
 * ------------------------------------------------------------------
 * The forum is place-centric: every post belongs to exactly one Indian
 * destination, which is what lets a post raise that destination's visibility
 * instead of just the author's.
 *
 * Posts carry no photographs. Like the rest of the prototype, the "image" is
 * a procedural <Poster> drawn from the destination's terrain + palette, so
 * there are no image licences and no megabytes to ship. `media` describes what
 * to draw, not a file to fetch.
 *
 * All content below is PLACEHOLDER DEMO DATA written for the prototype.
 */

export type PostCategory = 'STORY' | 'HIDDEN GEM' | 'FOOD' | 'EXPERIENCE' | 'TRAVEL TIP' | 'EVENT' | 'LOCAL GUIDE';

/** Filter chips across the top of /forum. */
export const CATEGORY_FILTERS = ['ALL', 'STORIES', 'HIDDEN GEMS', 'FOOD', 'EXPERIENCES', 'TIPS'] as const;
export type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

/** Maps a filter chip onto the post categories it accepts. */
export const FILTER_MATCHES: Record<CategoryFilter, PostCategory[] | null> = {
  ALL: null,
  STORIES: ['STORY'],
  'HIDDEN GEMS': ['HIDDEN GEM'],
  FOOD: ['FOOD'],
  EXPERIENCES: ['EXPERIENCE', 'EVENT'],
  TIPS: ['TRAVEL TIP', 'LOCAL GUIDE'],
};

export interface Comment {
  id: string;
  /** CommunityUser id. */
  authorId: string;
  body: string;
  /** ISO date. */
  createdAt: string;
}

export interface PostMedia {
  kind: 'photo' | 'video';
  /** Drawn silhouette; falls back to the destination terrain when omitted. */
  terrain?: Terrain;
  /** Caption printed under the frame. */
  caption: string;
  /** Video only: run time shown on the frame, in seconds. */
  duration?: number;
}

export interface ForumPost {
  id: string;
  /** CommunityUser id. */
  authorId: string;
  /** IndianPlace id — the post always belongs to a place. */
  destination: string;
  category: PostCategory;
  title: string;
  /** Pull quote on the feed card. */
  excerpt: string;
  /** Full body on the detail page; paragraphs split on blank lines. */
  body: string;
  media: PostMedia[];
  likes: number;
  helpful: number;
  comments: Comment[];
  /** True when the contribution passed location + date verification. */
  verified: boolean;
  /** Badge awarded for this contribution, if any. */
  badgeId?: string;
  /** ISO date. */
  createdAt: string;
  /** Optional practical metadata captured at publish time. */
  details?: {
    bestTime?: string;
    duration?: string;
    difficulty?: string;
    budget?: string;
  };
}

export const forumPosts: ForumPost[] = [
  {
    id: 'varkala-sunset-spot',
    authorId: 'arjuntravels',
    destination: 'varkala',
    category: 'HIDDEN GEM',
    title: 'The secret sunset spot most tourists miss',
    excerpt:
      'I found this small cliff viewpoint about twenty minutes north of the main beach, past where the shacks stop.',
    body: `I found this small cliff viewpoint about twenty minutes north of the main beach, past the point where the shacks stop and the path turns to packed red earth.

There is no sign. You walk until the cafes run out, then keep walking for another ten minutes. The cliff steps down twice and the second step has a flat shelf of laterite wide enough for four people.

The reason it is worth it: from the main cliff the sun sets over the sea with two hundred phones in the way. From here it sets over the sea with nobody in the way, and the whole north cliff is lit up orange behind you.

Take water. There is nothing up there. Come back before it is properly dark, the path is not lit and the drop is real.`,
    media: [{ kind: 'photo', caption: 'North cliff, 18:41 — the second shelf' }],
    likes: 248,
    helpful: 96,
    verified: true,
    badgeId: 'cliff-coast',
    createdAt: '2026-08-21',
    details: { bestTime: 'Oct – Mar', duration: '2 hours', difficulty: 'Easy walk', budget: 'Free' },
    comments: [
      { id: 'c1', authorId: 'shalini', body: 'Did you go during monsoon? Wondering if the path holds.', createdAt: '2026-08-22' },
      { id: 'c2', authorId: 'arjuntravels', body: 'Yes, but the cliff was quite windy and the last stretch was slick. I would not take a tripod in July.', createdAt: '2026-08-22' },
      { id: 'c3', authorId: 'anjali-r', body: 'Correct spot. Please stay off the crumbling lip on the sea side — we lose a metre of it most years.', createdAt: '2026-08-24' },
    ],
  },
  {
    id: 'hampi-quiet-side',
    authorId: 'meera',
    destination: 'hampi',
    category: 'STORY',
    title: 'The quiet side of Hampi',
    excerpt: 'Go just before sunrise, cross to the north bank, and you will have an empire to yourself for an hour.',
    body: `Go just before sunrise. Cross the river to the Anegundi side while it is still dark — the coracles start early and the crossing takes four minutes.

Everyone photographs Virupaksha from the south. From the north bank you get the whole bazaar street lined up behind it with the boulders going pink, and there is nobody standing in it.

This is also the older side. Anegundi was the capital before Vijayanagara was, and people still live inside the fort walls. That is the part visitors skip: the ruins on the south bank are a monument, the ones on the north bank are somebody's back wall.

Be respectful about which courtyards you walk into. If a door is open it is not an invitation.`,
    media: [{ kind: 'photo', caption: 'Anegundi bank, 05:52' }],
    likes: 183,
    helpful: 74,
    verified: true,
    badgeId: 'lost-empire',
    createdAt: '2026-08-14',
    details: { bestTime: 'Nov – Feb', duration: 'Half day', difficulty: 'Easy', budget: '₹50 coracle' },
    comments: [
      { id: 'c4', authorId: 'farhan', body: 'What time does the first coracle actually run? Every blog says something different.', createdAt: '2026-08-15' },
      { id: 'c5', authorId: 'meera', body: 'Around 06:00 officially, in practice whenever four people are standing there. Do not count on it before 05:30.', createdAt: '2026-08-15' },
    ],
  },
  {
    id: 'dzukou-valley-floor',
    authorId: 'ridatshi',
    destination: 'dzukou',
    category: 'EXPERIENCE',
    title: 'Sleeping on the valley floor in Dzukou',
    excerpt: 'The rest house is cold and basic and you should stay anyway. The valley at 4am does something to you.',
    body: `The trek from Viswema is the gentler of the two approaches — a jeep gets you to the base, then roughly two hours up. From Zakhama it is longer and steeper and better, if your knees are on speaking terms with you.

The rest house on the valley floor is cold and basic. Bring a bag rated lower than you think. There is no network, which is the point.

What nobody tells you: get up at four. The valley fills with mist that sits below the ridge line, so you are standing above a white floor with the hills poking through it. It burns off by seven.

Carry your rubbish out. All of it. There is no system up there and the only reason the valley still looks like this is that most people who make the walk care.`,
    media: [{ kind: 'video', caption: 'Valley floor, 04:20 — mist below the ridge', duration: 34 }],
    likes: 412,
    helpful: 168,
    verified: true,
    badgeId: 'trailblazer',
    createdAt: '2026-07-30',
    details: { bestTime: 'Jun – Sep', duration: '2 days', difficulty: 'Moderate trek', budget: '₹2,500' },
    comments: [
      { id: 'c6', authorId: 'dheeraj', body: 'Same rule in Munsiyari. Pack it in, pack it out — nothing gets collected above the road head.', createdAt: '2026-07-31' },
      { id: 'c7', authorId: 'manideep', body: 'Adding this to the plan. Is Viswema doable as a day trip or is the rest house essential?', createdAt: '2026-08-02' },
      { id: 'c8', authorId: 'ridatshi', body: 'Doable as a day trip, but you will miss the 4am mist, which is the whole reason to go.', createdAt: '2026-08-02' },
    ],
  },
  {
    id: 'tawang-monastery-ritual',
    authorId: 'pema-t',
    destination: 'tawang',
    category: 'LOCAL GUIDE',
    title: 'A local monastery ritual, and how to watch it properly',
    excerpt: 'The morning prayer is not a performance. Here is how to be there without being in the way.',
    body: `The morning assembly at Tawang starts around six. It is not a performance and there is no ticket for it.

If you want to be present: sit at the back on the left, keep your shoes outside, keep your phone in your pocket for the first fifteen minutes. Nobody will ask you to leave, which is exactly why you should hold yourself to it.

Butter tea gets handed round. Take it. Refusing is ruder than not liking it.

Photography is fine from the courtyard afterwards and not fine during. If a monk covers his face with a hand, that is the answer.

The calendar matters more than the season here. Losar and Torgya move every year and the monastery is a completely different place during them — fuller, louder, and much harder to find a bed for.`,
    media: [{ kind: 'photo', caption: 'Courtyard after assembly' }],
    likes: 291,
    helpful: 143,
    verified: true,
    badgeId: 'mountain-monk',
    createdAt: '2026-08-05',
    details: { bestTime: 'Mar – Oct', duration: '1 morning', difficulty: 'Easy', budget: 'Free' },
    comments: [
      { id: 'c9', authorId: 'meera', body: 'This should be pinned on every Arunachal itinerary. The photography line especially.', createdAt: '2026-08-06' },
    ],
  },
  {
    id: 'chettinad-lunch',
    authorId: 'farhan',
    destination: 'chettinad',
    category: 'FOOD',
    title: 'Eat lunch in a house, not a restaurant',
    excerpt: 'The Chettinad food you have had is a menu. The Chettinad food in Kanadukathan is a lunch that takes three hours.',
    body: `Every city has a Chettinad restaurant. None of them are doing what the houses in Kanadukathan and Karaikudi do.

Several of the mansions serve lunch to guests if you ask a day ahead. It is served on a banana leaf, it arrives in an order, and it does not stop arriving until you fold the leaf.

The things I had not eaten before: kandarappam, a jaggery-and-lentil fritter that is denser than it looks, and a pepper mutton that is pepper-forward rather than chilli-forward, which is the actual Chettinad signature.

Book through the house, not through an aggregator. The money then stays in the house.

Vegetarians are fine — ask for the full vegetarian sequence and you lose nothing.`,
    media: [{ kind: 'photo', terrain: 'colonial', caption: 'Kanadukathan, courtyard table' }],
    likes: 176,
    helpful: 88,
    verified: true,
    badgeId: 'mansion-keeper',
    createdAt: '2026-08-18',
    details: { bestTime: 'Nov – Feb', duration: '3 hours', difficulty: 'Easy', budget: '₹600 – ₹900' },
    comments: [
      { id: 'c10', authorId: 'shalini', body: 'Ask a day ahead is the key line. Turning up at 1pm gets you a polite no.', createdAt: '2026-08-19' },
    ],
  },
  {
    id: 'spiti-road-status',
    authorId: 'tenzin',
    destination: 'spiti',
    category: 'TRAVEL TIP',
    title: 'The road is the itinerary. Read it before you book.',
    excerpt: 'Kunzum closes long before anyone updates a website. Ask a kitchen in Kaza, not a forecast.',
    body: `People plan Spiti around dates. Spiti runs on the road.

Kunzum Pass typically opens sometime in May and shuts by late October, but neither end is a date you can book against. The Shimla side via Kinnaur stays open far longer and is the safer approach if you are coming outside high summer.

What actually helps: call a homestay in Kaza the week before. We know what the road did yesterday. A weather app in another state does not.

Acclimatise. Kaza is above 3,600m and people arrive from Manali in one day and then spend two days ill in a room they paid for.

Carry cash. The ATMs exist and they are not always awake.`,
    media: [{ kind: 'photo', caption: 'Kaza, first week of October' }],
    likes: 322,
    helpful: 211,
    verified: true,
    badgeId: 'high-desert',
    createdAt: '2026-09-02',
    details: { bestTime: 'Jun – Sep', duration: '7–9 days', difficulty: 'Demanding', budget: '₹18,000+' },
    comments: [
      { id: 'c11', authorId: 'dheeraj', body: 'Acclimatisation point cannot be repeated enough. One night at a lower village saves the whole trip.', createdAt: '2026-09-03' },
      { id: 'c12', authorId: 'manideep', body: 'Is October too late if I come up from the Shimla side?', createdAt: '2026-09-05' },
      { id: 'c13', authorId: 'tenzin', body: 'October via Kinnaur is usually fine. October via Kunzum is a gamble you will lose.', createdAt: '2026-09-05' },
    ],
  },
  {
    id: 'kumbalangi-canals',
    authorId: 'arjuntravels',
    destination: 'kumbalangi',
    category: 'EXPERIENCE',
    title: 'Chinese nets at 5am, and the village that owns them',
    excerpt: 'Kumbalangi is not a backwater cruise. You go into a working village and it stays working while you are there.',
    body: `The houseboat version of Kerala is a hotel that floats. Kumbalangi is the opposite: the village runs its own tourism, the money lands in the households, and the nets are lifted whether you are watching or not.

Get on the water before five. The stationary Chinese nets are worked by four men on a counterweight and it is much harder than it looks from a photograph.

Afterwards someone will cook what came up. Ask before you assume it is included.

Crab farming, coir making and toddy tapping are all offered as things you do rather than things you watch, which is the reason to come here rather than Alleppey.

Do not bargain hard here. The margins are thin and the whole point of the model is that they are not.`,
    media: [{ kind: 'video', caption: 'Net lift, 05:10', duration: 41 }],
    likes: 205,
    helpful: 117,
    verified: true,
    badgeId: 'backwater-wanderer',
    createdAt: '2026-07-22',
    details: { bestTime: 'Sep – Mar', duration: '1–2 days', difficulty: 'Easy', budget: '₹3,000' },
    comments: [
      { id: 'c14', authorId: 'shalini', body: 'The "do not bargain hard" line should be on the homepage of every travel site.', createdAt: '2026-07-23' },
    ],
  },
  {
    id: 'gandikota-sunrise',
    authorId: 'farhan',
    destination: 'gandikota',
    category: 'HIDDEN GEM',
    title: 'A gorge nobody put on a poster',
    excerpt: 'Five hours from Hyderabad there is a canyon with a fort on the lip of it and about eleven people at sunrise.',
    body: `Gandikota is roughly five hours from Hyderabad and about eight from Bengaluru, and on a Tuesday morning in December there were eleven people at the viewpoint.

The Pennar cuts through the Erramala hills and the fort sits directly on the edge. You can walk the wall. There is no railing, no ticket queue, and no one stopping you doing something stupid, so do not.

Stay at the APTDC haritha or camp. Both are basic. Neither is the reason you came.

Sunrise over sunset — the gorge faces so that the morning light goes down into it instead of flattening it.

Also walk to the Madhavaraya temple inside the fort. The carving is worth twenty minutes and almost everyone drives straight past it to the viewpoint.`,
    media: [{ kind: 'photo', caption: 'Fort wall, first light' }],
    likes: 267,
    helpful: 134,
    verified: true,
    badgeId: 'canyon-light',
    createdAt: '2026-06-28',
    details: { bestTime: 'Nov – Feb', duration: '2 days', difficulty: 'Easy', budget: '₹4,000' },
    comments: [
      { id: 'c15', authorId: 'meera', body: 'It is the closest thing we have to a canyon and nobody knows. Glad this is up here.', createdAt: '2026-06-29' },
    ],
  },
  {
    id: 'munsiyari-khaliya',
    authorId: 'dheeraj',
    destination: 'munsiyari',
    category: 'LOCAL GUIDE',
    title: 'Khaliya Top in a day, honestly assessed',
    excerpt: 'Everyone sells it as easy. It is easy until the last kilometre, and the last kilometre is where people turn back.',
    body: `Khaliya Top is sold as a beginner trek and mostly that is fair. Balati Farm to the top is where it stops being a walk and starts being a climb, and that is the stretch people underestimate.

Start by seven. The Panchachuli view goes behind cloud most afternoons from late morning onward, so a late start buys you a grey summit.

In winter it is a snow trek and needs gaiters and a guide, not enthusiasm.

Hire locally. There are guides and porters in Munsiyari who do this every week, and booking through a city operator means most of your money stops in the city.

Take a thermos. There is no chai at the top, whatever the internet says.`,
    media: [{ kind: 'photo', terrain: 'peaks', caption: 'Balati Farm, above the treeline' }],
    likes: 158,
    helpful: 102,
    verified: true,
    badgeId: 'alpine-explorer',
    createdAt: '2026-08-09',
    details: { bestTime: 'Apr – Jun, Sep – Nov', duration: '1 day', difficulty: 'Moderate', budget: '₹2,000 guide' },
    comments: [],
  },
  {
    id: 'varkala-seafood',
    authorId: 'anjali-r',
    destination: 'varkala',
    category: 'FOOD',
    title: 'Local seafood recommendations that are not on the cliff',
    excerpt: 'The cliff restaurants buy from the same landing you can walk to. Eat at the landing.',
    body: `Everything on the north cliff comes off the same boats, marked up for the view. The view is genuinely worth something, so this is not a complaint — but if you want the fish rather than the sunset, go down.

Odayam and the stretch toward Kappil have small places that cook what came in that morning, and the karimeen and squid are a third of the price.

Ask what came in today instead of ordering off the board. The board is aspirational.

If you are here between June and July, a lot of the good boats are not going out at all. Trawling bans exist for a reason and the fish on the menu in monsoon has usually travelled.

Fish curry takes time. If a place serves it to you in six minutes, it was made this morning for somebody else.`,
    media: [{ kind: 'photo', caption: 'Odayam landing, late morning' }],
    likes: 194,
    helpful: 121,
    verified: true,
    createdAt: '2026-09-01',
    details: { bestTime: 'Oct – May', duration: '1 meal', difficulty: 'Easy', budget: '₹250 – ₹500' },
    comments: [
      { id: 'c16', authorId: 'farhan', body: 'The board is aspirational. Framing this.', createdAt: '2026-09-02' },
      { id: 'c17', authorId: 'manideep', body: 'Is October a good time, or is it still turning over from monsoon?', createdAt: '2026-09-04' },
      { id: 'c18', authorId: 'anjali-r', body: 'October is the turn. Second half is reliably good, first half can still be grey.', createdAt: '2026-09-04' },
    ],
  },
  {
    id: 'majuli-masks',
    authorId: 'meera',
    destination: 'majuli',
    category: 'STORY',
    title: 'The mask makers of a shrinking island',
    excerpt: 'Majuli loses land to the Brahmaputra every year. The satras keep making masks anyway.',
    body: `Majuli is the largest river island there is and it is smaller every year. The Brahmaputra takes land back in the monsoon and does not return it.

The satras — monastic villages founded in the sixteenth century — are still there, and Samaguri satra still makes the bamboo-and-clay masks used in the bhaona performances. They are enormous, they are worn on the whole head, and they are made by hand in a shed.

You can watch it being done and you can commission one. It takes weeks.

What struck me: nobody there talks about the island disappearing as a tragedy in progress. They talk about which villages moved and when. It is a fact of the place, not a headline.

Go by ferry from Nimati Ghat. Check the last return or plan to stay.`,
    media: [{ kind: 'photo', terrain: 'water', caption: 'Samaguri satra workshop' }],
    likes: 231,
    helpful: 97,
    verified: true,
    createdAt: '2026-07-12',
    details: { bestTime: 'Nov – Mar', duration: '2–3 days', difficulty: 'Easy', budget: '₹5,000' },
    comments: [],
  },
  {
    id: 'ellora-kailasa',
    authorId: 'pema-t',
    destination: 'ellora',
    category: 'STORY',
    title: 'Cave 16 is not a cave',
    excerpt: 'Kailasa was cut downward out of one rock. There was no way to correct a mistake.',
    body: `Everyone books Ellora for the caves and then stands in cave 16 trying to work out what they are looking at.

Kailasa is not built. It is removed. Two hundred thousand tonnes of basalt were cut away from the top down to leave a temple standing in a pit, complete with courtyard, gateway and free-standing columns.

Cut downward means there is no assembly and no correction. A mistake at the top cannot be fixed at the bottom.

Go early. By eleven the courtyard is full and the scale stops registering because there are people in every sightline.

Caves 29 and 32 are quieter and nearly as good — 32 is the Jain group and the ceiling work is finer than anything in 16.`,
    media: [{ kind: 'photo', terrain: 'caves', caption: 'Cave 16 courtyard, from the north gallery' }],
    likes: 213,
    helpful: 84,
    verified: true,
    createdAt: '2026-06-15',
    details: { bestTime: 'Nov – Feb', duration: '1 day', difficulty: 'Easy', budget: '₹600' },
    comments: [
      { id: 'c19', authorId: 'shalini', body: 'Cave 32 is criminally empty. Everyone leaves after 16.', createdAt: '2026-06-16' },
    ],
  },
  {
    id: 'pondicherry-quiet-hours',
    authorId: 'shalini',
    destination: 'pondicherry',
    category: 'TRAVEL TIP',
    title: 'Puducherry has two quiet hours. Use them.',
    excerpt: 'The French quarter between 6 and 8am is a different town from the one on the postcards.',
    body: `Between six and eight in the morning the White Town is nearly empty, the promenade is closed to traffic, and the yellow walls do the thing everyone came to photograph without twelve scooters in the frame.

The second quiet window is roughly two to four in the afternoon, when it is too hot for anyone sensible and half the shops shut anyway.

Everything in between is busy, and on a weekend it is very busy — Chennai empties into it.

Stay on the Tamil Town side if you want a cheaper room and a more interesting street. The architecture there is Franco-Tamil and much less photographed.

Auroville is a forty minute ride and is not a theme park. If you go, go for the morning and read what it actually is first.`,
    media: [{ kind: 'photo', terrain: 'colonial', caption: 'Rue Dumas, 06:40' }],
    likes: 142,
    helpful: 109,
    verified: false,
    createdAt: '2026-09-08',
    details: { bestTime: 'Oct – Mar', duration: '2 days', difficulty: 'Easy', budget: '₹3,500' },
    comments: [],
  },
  {
    id: 'neil-island-reef',
    authorId: 'ridatshi',
    destination: 'neil-island',
    category: 'EXPERIENCE',
    title: 'You can see the reef without a tank. Please do not stand on it.',
    excerpt: 'Laxmanpur and Bharatpur are shallow enough to snorkel from the sand — which is exactly why they are fragile.',
    body: `Neil sits on a reef shelf, so the water stays waist-deep and clear a long way out. You do not need a boat or a certification to see live coral here, which is rare and which is the problem.

Shallow reef plus fins plus a footing means broken coral. Float, do not walk. If you cannot swim well enough to stay off the bottom, take the glass-bottom boat instead — it is not a lesser experience.

At low tide the natural arch at Laxmanpur appears and a few hours later it is gone again. Check the tide table the day before, not the morning of.

Sunscreen: the reef-safe question is real here. Cover up instead if you are not sure what is in yours.

There is one road worth naming and a great many bicycles. Nobody is going anywhere quickly and that is the point.`,
    media: [{ kind: 'photo', terrain: 'island', caption: 'Laxmanpur at low tide' }],
    likes: 188,
    helpful: 95,
    verified: true,
    createdAt: '2026-05-30',
    details: { bestTime: 'Dec – Apr', duration: '3 days', difficulty: 'Easy', budget: '₹9,000' },
    comments: [],
  },
];
