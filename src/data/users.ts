/**
 * ------------------------------------------------------------------
 * COMMUNITY USERS
 * ------------------------------------------------------------------
 * Contributors are travellers OR locals. The distinction matters more than a
 * follower count does: a local's tip about a road closing is worth more than
 * a traveller's, and the UI says so without shouting about it.
 *
 * Every person below is PLACEHOLDER DEMO DATA. No real handles, no real
 * contact details, no real statistics.
 */

export type ContributorRole =
  | 'TRAVELLER'
  | 'LOCAL'
  | 'VERIFIED GUIDE'
  | 'LOCAL STORYTELLER'
  | 'COMMUNITY CONTRIBUTOR';

export interface CommunityUser {
  id: string;
  handle: string;
  name: string;
  role: ContributorRole;
  /** Home base, shown under the handle. */
  base: string;
  bio: string;
  /** Two initials for the drawn avatar. */
  initials: string;
  /** Avatar ring colour. */
  accent: string;
  /** Badge ids this contributor holds (demo data for other users). */
  badgeIds: string[];
  stats: {
    destinations: number;
    stories: number;
    verified: number;
  };
  /** True for the person using the prototype. */
  isYou?: boolean;
}

export const CURRENT_USER_ID = 'manideep';

export const users: CommunityUser[] = [
  {
    id: 'manideep',
    handle: '@manideep',
    name: 'Manideep',
    role: 'TRAVELLER',
    base: 'India',
    bio: 'Looking for the feeling first and the flight second. Mostly coastlines and high roads.',
    initials: 'MD',
    accent: '#E8833A',
    badgeIds: [],
    stats: { destinations: 0, stories: 0, verified: 0 },
    isYou: true,
  },
  {
    id: 'arjuntravels',
    handle: '@arjuntravels',
    name: 'Arjun Nair',
    role: 'TRAVELLER',
    base: 'Kochi, Kerala',
    bio: 'Four years of walking the Kerala coast end to end. I write down the parts the cafes have not reached yet.',
    initials: 'AN',
    accent: '#E8833A',
    badgeIds: ['cliff-coast', 'backwater-wanderer', 'food-explorer'],
    stats: { destinations: 9, stories: 31, verified: 12 },
  },
  {
    id: 'meera',
    handle: '@meera',
    name: 'Meera Rao',
    role: 'LOCAL STORYTELLER',
    base: 'Anegundi, Karnataka',
    bio: 'Born on the north bank of the Tungabhadra. I grew up inside the ruins people buy tickets for.',
    initials: 'MR',
    accent: '#C2703C',
    badgeIds: ['lost-empire', 'heritage-keeper', 'local-legend'],
    stats: { destinations: 6, stories: 44, verified: 21 },
  },
  {
    id: 'pema-t',
    handle: '@pema.t',
    name: 'Pema Tsering',
    role: 'VERIFIED GUIDE',
    base: 'Lhou, Arunachal Pradesh',
    bio: 'Monpa guide. I can tell you the monastery calendar and whether Sela Pass will actually be open.',
    initials: 'PT',
    accent: '#9E2B18',
    badgeIds: ['mountain-monk', 'heritage-keeper'],
    stats: { destinations: 4, stories: 27, verified: 19 },
  },
  {
    id: 'ridatshi',
    handle: '@ridatshi',
    name: 'Ri Datshi',
    role: 'LOCAL',
    base: 'Kohima, Nagaland',
    bio: 'Weekend walker in the Dzukou range. Nobody documents this valley, so I started.',
    initials: 'RD',
    accent: '#2F6F63',
    badgeIds: ['trailblazer', 'eco-explorer'],
    stats: { destinations: 3, stories: 18, verified: 11 },
  },
  {
    id: 'shalini',
    handle: '@shalini.walks',
    name: 'Shalini Iyer',
    role: 'COMMUNITY CONTRIBUTOR',
    base: 'Madurai, Tamil Nadu',
    bio: 'I answer the boring questions. Bus timings, October rain, whether the ATM works.',
    initials: 'SI',
    accent: '#A8763A',
    badgeIds: ['mansion-keeper', 'food-explorer', 'community-contributor'],
    stats: { destinations: 11, stories: 52, verified: 8 },
  },
  {
    id: 'dheeraj',
    handle: '@dheeraj.high',
    name: 'Dheeraj Singh',
    role: 'VERIFIED GUIDE',
    base: 'Munsiyari, Uttarakhand',
    bio: 'High-altitude guide on the Khaliya Top and Panchachuli base routes. Own porters, own kitchen.',
    initials: 'DS',
    accent: '#7FA8C9',
    badgeIds: ['alpine-explorer', 'eco-explorer'],
    stats: { destinations: 5, stories: 23, verified: 16 },
  },
  {
    id: 'tenzin',
    handle: '@tenzin.spiti',
    name: 'Tenzin Angmo',
    role: 'LOCAL',
    base: 'Kaza, Himachal Pradesh',
    bio: 'Homestay kitchen in Kaza. I post what the road is doing, because the forecast never knows.',
    initials: 'TA',
    accent: '#6E7A8A',
    badgeIds: ['high-desert', 'eco-explorer'],
    stats: { destinations: 3, stories: 29, verified: 14 },
  },
  {
    id: 'farhan',
    handle: '@farhan.eats',
    name: 'Farhan Qureshi',
    role: 'TRAVELLER',
    base: 'Hyderabad, Telangana',
    bio: 'I plan entire trips around one meal and regret nothing.',
    initials: 'FQ',
    accent: '#C8531F',
    badgeIds: ['food-explorer', 'canyon-light'],
    stats: { destinations: 8, stories: 36, verified: 9 },
  },
  {
    id: 'anjali-r',
    handle: '@anjali.cliff',
    name: 'Anjali R.',
    role: 'VERIFIED GUIDE',
    base: 'Varkala, Kerala',
    bio: 'Twelve years guiding the cliff, licensed by Kerala Tourism. I start at the temple end, at first light.',
    initials: 'AR',
    accent: '#FFB25E',
    badgeIds: ['cliff-coast', 'local-legend'],
    stats: { destinations: 2, stories: 41, verified: 24 },
  },
];

export const userById = (id: string) => users.find((u) => u.id === id);
export const userByHandle = (handle: string) => users.find((u) => u.handle === handle);
export const currentUser = () => users.find((u) => u.id === CURRENT_USER_ID)!;
