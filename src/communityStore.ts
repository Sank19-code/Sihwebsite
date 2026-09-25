import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { forumPosts as seedPosts, type ForumPost, type PostCategory, type PostMedia } from './data/forumPosts';
import { badgeForPlace, badgeById, type Badge } from './data/badges';
import { passportSeed, type Journey, type ContributionStats } from './data/passport';
import { CURRENT_USER_ID } from './data/users';
import { placeById } from './data/indianPlaces';

/**
 * ------------------------------------------------------------------
 * COMMUNITY + PASSPORT STATE
 * ------------------------------------------------------------------
 * One store owns the whole contribution loop, because the loop is the point:
 *
 *   document -> verify -> badge -> passport -> forum post -> destination
 *
 * Splitting "forum" and "passport" into two stores would let them drift, and
 * the entire pitch is that they are the same object seen from two angles.
 *
 * State is persisted to localStorage so a demo survives a refresh. `resetDemo`
 * puts it back to the seeded starting point for the next run-through.
 */

const STORAGE_KEY = 'twintrip.community.v1';

/** Which craft badge a contribution category counts toward. */
const CRAFT_FOR_CATEGORY: Record<PostCategory, string> = {
  STORY: 'local-legend',
  'HIDDEN GEM': 'heritage-keeper',
  FOOD: 'food-explorer',
  EXPERIENCE: 'eco-explorer',
  'TRAVEL TIP': 'community-contributor',
  'LOCAL GUIDE': 'community-contributor',
  EVENT: 'community-contributor',
};

export interface VerifiedSubmission {
  placeId: string;
  category: PostCategory;
  title: string;
  body: string;
  media: PostMedia[];
  details?: ForumPost['details'];
}

/** What the unlock overlay needs to present one badge. */
export interface UnlockEvent {
  badgeId: string;
  placeId?: string;
  postId?: string;
}

interface CommunityState {
  /** Seed posts plus anything published in this session. Newest first. */
  posts: ForumPost[];
  likedIds: string[];
  savedIds: string[];
  helpfulIds: string[];

  journeys: Journey[];
  unlockedBadgeIds: string[];
  progress: Record<string, number>;
  stats: ContributionStats;

  /** Badges waiting to be celebrated, oldest first. */
  unlockQueue: UnlockEvent[];

  /* ---- forum actions ---- */
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  toggleHelpful: (postId: string) => void;
  addComment: (postId: string, body: string) => void;
  /** Publishes an unverified post (no media / no location proof). */
  publishPost: (input: VerifiedSubmission) => string;

  /* ---- the loop ---- */
  /**
   * Publishes a documented experience that passed verification, files the
   * journey in the passport and awards whatever badges that earned.
   * Returns the new post id.
   */
  submitVerifiedExperience: (input: VerifiedSubmission) => string;

  /* ---- unlock overlay ---- */
  dismissUnlock: () => void;

  resetDemo: () => void;
}

const initial = () => ({
  posts: [...seedPosts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  likedIds: [] as string[],
  savedIds: [] as string[],
  helpfulIds: [] as string[],
  journeys: [...passportSeed.journeys],
  unlockedBadgeIds: [...passportSeed.unlockedBadgeIds],
  progress: { ...passportSeed.progress },
  stats: { ...passportSeed.stats },
  unlockQueue: [] as UnlockEvent[],
});

const today = () => new Date().toISOString().slice(0, 10);
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export const useCommunity = create<CommunityState>()(
  persist(
    (set, get) => ({
      ...initial(),

      toggleLike: (postId) =>
        set((s) => ({
          likedIds: s.likedIds.includes(postId)
            ? s.likedIds.filter((id) => id !== postId)
            : [...s.likedIds, postId],
        })),

      toggleSave: (postId) =>
        set((s) => ({
          savedIds: s.savedIds.includes(postId)
            ? s.savedIds.filter((id) => id !== postId)
            : [...s.savedIds, postId],
        })),

      toggleHelpful: (postId) =>
        set((s) => ({
          helpfulIds: s.helpfulIds.includes(postId)
            ? s.helpfulIds.filter((id) => id !== postId)
            : [...s.helpfulIds, postId],
        })),

      addComment: (postId, body) =>
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: [
                    ...p.comments,
                    { id: uid('c'), authorId: CURRENT_USER_ID, body, createdAt: today() },
                  ],
                }
              : p,
          ),
        })),

      publishPost: (input) => {
        const id = uid('post');
        const post: ForumPost = {
          id,
          authorId: CURRENT_USER_ID,
          destination: input.placeId,
          category: input.category,
          title: input.title,
          excerpt: input.body.split('\n')[0].slice(0, 180),
          body: input.body,
          media: input.media,
          likes: 0,
          helpful: 0,
          comments: [],
          verified: false,
          createdAt: today(),
          details: input.details,
        };
        set((s) => ({
          posts: [post, ...s.posts],
          stats: { ...s.stats, storiesContributed: s.stats.storiesContributed + 1 },
        }));
        return id;
      },

      submitVerifiedExperience: (input) => {
        const postId = uid('post');
        const state = get();

        /* --- which badges does this contribution earn? --- */
        const awarded: UnlockEvent[] = [];
        const unlocked = new Set(state.unlockedBadgeIds);
        const progress = { ...state.progress };

        const placeBadge = badgeForPlace(input.placeId);
        if (placeBadge && !unlocked.has(placeBadge.id)) {
          unlocked.add(placeBadge.id);
          awarded.push({ badgeId: placeBadge.id, placeId: input.placeId, postId });
        }

        // Every verified contribution also advances one craft badge.
        const craftId = CRAFT_FOR_CATEGORY[input.category];
        const craft = badgeById(craftId);
        if (craft) {
          progress[craftId] = (progress[craftId] ?? 0) + 1;
          if (!unlocked.has(craftId) && craft.target !== null && progress[craftId] >= craft.target) {
            unlocked.add(craftId);
            awarded.push({ badgeId: craftId, placeId: input.placeId, postId });
          }
        }

        const post: ForumPost = {
          id: postId,
          authorId: CURRENT_USER_ID,
          destination: input.placeId,
          category: input.category,
          title: input.title,
          excerpt: input.body.split('\n')[0].slice(0, 180),
          body: input.body,
          media: input.media,
          likes: 0,
          helpful: 0,
          comments: [],
          verified: true,
          badgeId: awarded[0]?.badgeId,
          createdAt: today(),
          details: input.details,
        };

        const alreadyVisited = state.journeys.some((j) => j.placeId === input.placeId);
        const journey: Journey | null = alreadyVisited
          ? null
          : {
              placeId: input.placeId,
              date: today(),
              badgeId: placeBadge?.id ?? awarded[0]?.badgeId ?? '',
              postId,
              verification: 'GPS + DATE',
              note: input.title,
            };

        set((s) => ({
          posts: [post, ...s.posts],
          journeys: journey ? [journey, ...s.journeys] : s.journeys,
          unlockedBadgeIds: [...unlocked],
          progress,
          unlockQueue: [...s.unlockQueue, ...awarded],
          stats: {
            ...s.stats,
            storiesContributed: s.stats.storiesContributed + 1,
            destinationsDocumented: s.stats.destinationsDocumented + (journey ? 1 : 0),
            lesserKnownPlaces: s.stats.lesserKnownPlaces + (journey ? 1 : 0),
            hiddenGemsFound: s.stats.hiddenGemsFound + (input.category === 'HIDDEN GEM' ? 1 : 0),
            localExperiencesShared:
              s.stats.localExperiencesShared + (input.category === 'EXPERIENCE' || input.category === 'LOCAL GUIDE' ? 1 : 0),
            localContributorsDiscovered: s.stats.localContributorsDiscovered + (journey ? 3 : 0),
            travellersReached: s.stats.travellersReached + 40 + Math.round(Math.random() * 60),
          },
        }));

        return postId;
      },

      dismissUnlock: () => set((s) => ({ unlockQueue: s.unlockQueue.slice(1) })),

      resetDemo: () => set(initial()),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // The unlock queue is a transient UI concern; never restore it, or a
      // refresh mid-celebration would replay the overlay forever.
      partialize: ({ unlockQueue: _unlockQueue, ...rest }) => rest,
    },
  ),
);

/* ------------------------------------------------------------------
   Derived selectors — plain functions so components can call them with
   whatever slice of state they already subscribe to.
   ------------------------------------------------------------------ */

export const postById = (posts: ForumPost[], id: string) => posts.find((p) => p.id === id);

export const postsForPlace = (posts: ForumPost[], placeId: string) =>
  posts.filter((p) => p.destination === placeId);

/** Community activity numbers shown on the globe card and destination pages. */
export interface PlaceActivity {
  stories: number;
  verified: number;
  contributors: number;
}

export function placeActivity(posts: ForumPost[], placeId: string): PlaceActivity {
  const forPlace = posts.filter((p) => p.destination === placeId);
  return {
    stories: forPlace.length,
    verified: forPlace.filter((p) => p.verified).length,
    contributors: new Set(forPlace.map((p) => p.authorId)).size,
  };
}

/**
 * Demo-data multiplier.
 *
 * The seed set holds a handful of posts per destination; the numbers a real
 * community would show are two orders of magnitude larger. Rather than invent
 * a static fake, the display figure is derived from the real one and labelled
 * DEMO DATA wherever it appears.
 */
export const displayScale = (n: number, factor = 23) => n * factor;

/** Total likes for a post, including the viewer's own. */
export const likeCount = (post: ForumPost, likedIds: string[]) =>
  post.likes + (likedIds.includes(post.id) ? 1 : 0);

export const helpfulCount = (post: ForumPost, helpfulIds: string[]) =>
  post.helpful + (helpfulIds.includes(post.id) ? 1 : 0);

/** Badge + progress, resolved for display. */
export interface BadgeStatus {
  badge: Badge;
  unlocked: boolean;
  progress: number;
  target: number | null;
}

export function badgeStatus(
  badge: Badge,
  unlockedIds: string[],
  progress: Record<string, number>,
): BadgeStatus {
  return {
    badge,
    unlocked: unlockedIds.includes(badge.id),
    progress: progress[badge.id] ?? 0,
    target: badge.target,
  };
}

/** Human label for a journey's place, e.g. "Varkala, Kerala". */
export function placeLabel(placeId: string) {
  const place = placeById(placeId);
  return place ? `${place.name}, ${place.state}` : placeId;
}
