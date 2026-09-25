# TwinTrip India

**Find the feeling. Tell the story. Plan the trip. Help the locals.**

An immersive WebGL prototype for Smart India Hackathon 2026.

TwinTrip India takes the destination you dream about and shows you the Indian place
that carries the same feeling — then tells you its story, plans the trip, and puts
you in touch with the people who live there. No booking engine, no commission, no
backend.

The centrepiece is an interactive 3D globe. It is the navigation, not decoration:
every dream destination is a marker, and selecting one re-composes the entire page
around that pairing.

The journey does not stop at arrival. Two features close the loop:

- **Forum / Community** — a place-centric travel community. Every post belongs to
  a destination, so every contribution makes that destination easier to find. A
  "Document your journey" flow turns a photo or a thirty-second clip into a
  verified post, in five steps (capture → details → verify → run → done).
- **Travel Passport + Badges** — the traveller's record. Each verified
  contribution stamps the passport and unlocks a collectible badge, with a
  celebration overlay, a derived travel identity, and a local-impact panel that
  shows how a documented place puts its guides, homestays and artisans in front
  of the next traveller.

The full loop the prototype walks:

```
WORLD DESTINATION → INDIAN TWIN → STORY → PLAN → VISIT → DOCUMENT →
VERIFY → EARN BADGE → PASSPORT → COMMUNITY → HELP OTHERS DISCOVER INDIA
```

---

## 1. How to run

```bash
npm install
```

```bash
npm run dev
```

Then open the URL Vite prints (default `http://localhost:5173`).

Other scripts:

```bash
npm run build
```

```bash
npm run preview
```

`npm run build` type-checks with `tsc --noEmit` before bundling, so a type error
fails the build.

**Requirements:** Node 18+ and a browser with WebGL. Without WebGL the app falls
back to an interactive SVG globe automatically — the whole demo still works.

---

## 2. Project structure

```
src/
  components/
    Globe/                  Canvas host, scene, camera rig, atmosphere, particles,
                            graticule, and the no-WebGL fallback
    DestinationMarker/      One marker: core dot, pulse ring, halo, hit target
    Navigation/             Top nav + mobile bottom bar + side progress rail (01 / 06)
    Hero/                   First viewport copy
    TwinReveal/             TransitionOverlay (the cinematic) + TwinReveal (section)
    MatchVisualization/     Radial match % and attribute bars
    StorySection/           Scroll-driven story with Web Speech narration
    TripPlanner/            Inputs, demo itinerary, RouteMap
    LocalDiscovery/         Guide / homestay / artisan cards
    IndianDiscovery/        "There's more India" coordinate field
    Journey/                Home sections: JourneyContinues (the loop) +
                            FromTheCommunity (live feed cards)
    Forum/                  PostCard (editorial feed card) + DocumentJourney
                            (capture → details → verify → run → done)
    Badges/                 BadgeArt (procedural medallion) + BadgeUnlockOverlay
                            (the celebration, mounted once at the app root)
    Demo/                   DemoPanel — the demo script + "reset demo"
    Footer/                 Final CTA + footer
    ui/Poster.tsx           Procedural artwork renderer (see below)
    ui/primitives.tsx       Avatar, AuthorLine, VerifiedTag, chips, counters,
                            PageHeader, EmptyState, DemoDataTag

  data/
    destinations.ts         17 dream destinations  ← edit these
    indianPlaces.ts         13 Indian twins + their stories  ← and these
    activities.ts           Per-place activity seeds for the planner
    locals.ts               Guide / homestay / artisan seeds
    i18n.ts                 Narration languages
    types.ts                Shared types, with notes on what is demo data
    forumPosts.ts           Forum seed posts + category filters
    users.ts                Contributor roster (all placeholder demo data)
    badges.ts               The badge set: 13 place badges + 5 craft badges
    passport.ts             Passport seed: journeys, unlocked badges, stats,
                            identity + landscape derivations

  hooks/
    useSmoothScroll.ts      Lenis + ScrollTrigger wiring, scroll lock, scrollTo
    usePrefersReducedMotion.ts
    useWebGLSupport.ts      Probes for a real WebGL context
    usePageVisible.ts       Pauses the render loop on a hidden tab
    useIsMobile.ts / useHasHover.ts

  animations/transitions.ts All animation timings  ← retune here
  lib/geo.ts                lat/lon → vector, projections, formatting
  lib/itinerary.ts          The demo itinerary generator

  pages/                    One file per route, swapped by the app shell:
    Home.tsx                The continuous-scroll narrative
    Forum.tsx               /forum — community feed
    PostDetail.tsx          /forum/:postId — the full post + comments
    Destination.tsx         /destination/:placeId — the six-section hub
    DestinationCommunity.tsx /destination/:placeId/community
    Passport.tsx            /passport — cover, journeys, badges, identity,
                            loop, contribution + local impact
    PassportProfile.tsx     /passport/profile — my travel identity
    BadgeCollection.tsx     /passport/badges — the full collection
    ContributorProfile.tsx  /community/user/:userId — a byline's record
    NotFound.tsx            anything else

  router.tsx                Minimal history-API router (~130 lines, no deps)
  store.ts                  Zustand store: phase, selection, hover, scroll
  communityStore.ts         The community + passport state, one store,
                            persisted to localStorage (demo survives refresh)
  uiStore.ts                Transient UI state (the document-flow dialog)
```

### About the artwork

There are **no image files in this project**. Every "photograph" is drawn at
runtime by `components/ui/Poster.tsx` from two fields on a place — a `terrain`
silhouette type and a four-colour `palette`. That means no broken images, no
licensing questions on a hackathon submission, and a colour-coherent site.

To move to real photography later, replace the body of `<Poster>` with an `<img>`.
Every caller already passes only `terrain` and `palette`, so nothing else changes.

---

## 3. Main libraries

| Library | Used for |
| --- | --- |
| **React 18 + TypeScript + Vite** | App shell, strict typing, dev server |
| **Three.js** | The globe: sphere, graticule, markers, shaders |
| **@react-three/fiber** | React renderer for Three.js |
| **@react-three/drei** | `<Html>`, used to anchor the hover card to a marker in 3D |
| **GSAP + ScrollTrigger** | Every timeline: boot sequence, camera flights, the transition, text reveals, counters, route drawing |
| **Lenis** | Smooth scrolling, driven from GSAP's ticker so both share one RAF loop |
| **Tailwind CSS** | Styling, with the design tokens in `src/index.css` |
| **Zustand** | The small amount of shared state (phase, selection, hover, scroll) |

No UI kit, no icon library. The only "router" is ~130 lines of history-API
routing in `src/router.tsx` — the app has one layout, so there is nothing to
buy. The community and passport state is one Zustand store persisted to
`localStorage`, so the demo survives a refresh until "reset demo".

---

## 4. Where to modify destination data

**Dream destinations (globe markers):** `src/data/destinations.ts`

```ts
{
  id: 'santorini',
  name: 'Santorini',
  country: 'Greece',
  coordinates: [36.3932, 25.4615],   // real lat/lon
  twin: 'varkala',                   // id from indianPlaces.ts
  match: 82,                         // demo data
  tagline: 'White cliffs. Blue water. Golden sunsets.',
  attributes: { 'Coastal cliffs': 94, Sunset: 91, 'Cafe culture': 76, 'Relaxed pace': 84 },
}
```

**Indian twins:** `src/data/indianPlaces.ts` — name, state, coordinates, terrain,
palette, season, trip length, budget, the "why it matches" paragraph and the story
chapters all live on one object per place.

**Supporting data:** `activities.ts` (one signature activity per interest per
place) and `locals.ts` (guide / homestay / artisan per place).

### Community, passport and badges

The two new features have their own data models, all under `src/data/`:

- **`forumPosts.ts`** — seed posts. A post always belongs to a destination
  (`destination: placeId`), which is what raises a place's visibility rather
  than just the author's. Categories: story / hidden gem / food / experience /
  travel tip / event / local guide. Media is `{ kind, terrain?, caption }` —
  described, not fetched, so the `<Poster>` draws the frame.
- **`users.ts`** — the contributor roster (traveller / local / verified guide /
  local storyteller / community contributor). `CURRENT_USER_ID` is the
  prototype's traveller. All placeholder data, labelled as such in the UI.
- **`badges.ts`** — two kinds: *place* badges (one per destination, earned by
  a verified experience there) and *craft* badges (a pattern of contribution:
  heritage, food, eco, storytelling, community). A badge carries `motif` and
  `frame`, which `<BadgeArt>` draws; `target` is a progress goal for craft
  badges and `null` for single-visit place badges.
- **`passport.ts`** — the seed record: stamped journeys, unlocked badge ids,
  craft progress, contribution stats, and the derivations (`deriveIdentity`,
  `favoriteLandscapes`).

State lives in one store, `src/communityStore.ts`, because the loop is the
product: a verified submission (`submitVerifiedExperience`) writes the post,
files the journey, advances badge progress and queues the unlock — the forum
feed, the passport and the destination pages all read the same object. It is
persisted to `localStorage` (`twintrip.community.v1`), with `resetDemo`
restoring the seed. Aggregates shown in the UI are scaled from the real
counts and labelled **DEMO DATA** everywhere they appear.

---

## 5. Where to modify animation timings

`src/animations/transitions.ts` exports a single `T` object that every cinematic
system reads:

```ts
export const T = {
  bootStep: 0.55,        // preloader dwell per step
  cameraFly: 2.2,        // globe camera flight on select
  cameraReturn: 1.6,     // flight back to the world view
  transitionPanel: 1.5,  // each beat of the dream → twin cinematic
  lineReveal: 1.05,      // headline line reveal
  lineStagger: 0.08,
  counter: 1.8,          // match % count-up
  bar: 1.4,              // attribute bar sweep
  barStagger: 0.12,
  route: 1.6,            // itinerary route draw
  ease: 'power3.out',
  easeCine: 'expo.out',
  easeInOut: 'power2.inOut',
};
```

CSS-side durations are tokens in `src/index.css` (`--t-fast`, `--t-med`,
`--t-slow`, `--ease-cine`). The globe's feel — auto-rotation speed, drag
sensitivity, inertia decay and the damping constant — lives in the single
integrator in `components/Globe/GlobeScene.tsx` (search for "damped integrator").

---

## 6. How to add a new destination

1. **Add the Indian place** in `src/data/indianPlaces.ts`: give it real
   coordinates, a `terrain` from the list in `data/types.ts`, a `palette`
   (two sky colours, a land colour, a glow), the copy fields, and 3–4 story
   chapters.
2. **Add the dream destination** in `src/data/destinations.ts` and point its
   `twin` at the new id.
3. Optionally add entries in `activities.ts` and `locals.ts` under the same id.
   Both fall back gracefully if you skip this.

That is all. The globe marker layer, the "discover more India" field, the planner,
the locals section and the footer counts are all derived from these arrays.

---

## 7. Known prototype limitations

- **All numbers are demo data.** Match percentages, attribute scores, budgets,
  trip lengths and itineraries are hand-authored to illustrate the intended
  output. A production system would score landscape, climate, built form, food
  and pace as a feature vector. The UI says so wherever a number appears.
- **Local listings are placeholders.** Names are plausible but invented, and the
  contact details are masked. Nothing dials or messages anyone.
- **No maps of India are drawn.** The India sections use a latitude/longitude
  graticule with real coordinates rather than a national outline — a hand-drawn
  border would be inaccurate at this scale and is unnecessary to make the point.
- **Story text is English only.** The language selector switches the narration
  voice (and the surrounding UI labels) but the story bodies are authored in
  English. Real translations need a human translator, not a model.
- **Narration depends on the OS.** It uses the Web Speech API, so it needs a
  voice installed for the selected language. When one is missing the component
  says so and runs a silent timed read-through instead, so the demo still works
  on stage. Nothing ever autoplays.
- **Verification is simulated.** The document flow presents location, date and
  destination as if they were checked, and says so on the screen. A production
  build would match device GPS and capture time against the destination
  boundary; the prototype only walks the shape of that flow.
- **No backend, but the demo state persists.** There is no server, no accounts
  and no booking flow (the last is deliberate — the product's position is zero
  commission). The community + passport store does persist to `localStorage`,
  so the demo survives a refresh; "reset demo" in the Demo Mode panel restores
  the seeded starting point.
- **Bundle size.** Three.js is ~970 KB minified (~270 KB gzipped) and Vite warns
  about it. It is split into its own chunk; lazy-loading the globe would remove
  the warning at the cost of a less cinematic first paint.
- **Touch gestures are basic.** Drag-to-rotate and pinch-to-zoom work; there is
  no momentum tuning per device and no gesture for tilting the globe.
- **Dev-only helper.** In development the store is exposed as `window.__twintrip`
  for debugging from the console. It is stripped from production builds.

---

## Demo route

1. Cinematic boot sequence → the globe materialises.
2. Drag to rotate. Hover a marker for its card (name, country, twin, match,
   plus the community pulse: stories / verified / locals, and the badge state
   — "visit to unlock" or ✓ unlocked).
3. Click **Santorini** → the camera flies, the screen darkens, and the cinematic
   plays: *Santorini* → *"What if you didn't have to go that far?"* → the
   coordinate field ignites over Varkala → the landscape arrives.
4. Scroll: the twin reveal (with the hub + community doors), why it matches,
   and the animated 82% match.
5. The story — press play for narration, pick a language.
6. The planner — set days, budget, travellers and interests, build the trip.
7. The locals — guide, homestay, artisan. Contact only, no payment.
8. **Journey continues** — the loop (visit → document → earn → share) and two
   doors into the passport and the community.
9. **From the community** — three live posts from the same store the forum
   reads.
10. Discover more India, then the final CTA back to the globe.

Then the full contribution loop, the acceptance test:

1. From the globe card or the twin reveal, **open the Varkala hub**
   (`/destination/varkala`): match, story, plan, locals, community, passport.
2. Read a community post (`/forum/:postId`); comments work in local state.
3. **Document your journey** → *use demo video* → destination, title, story →
   verify (simulated, labelled as such) → **badge unlocked** overlay →
   *view in passport*.
4. `/passport`: a new stamp and the **Cliff & Coast** badge are in the
   collection; the loop section and the local-discovery panel read from the
   same journey.
5. Back to `/forum`: the verified contribution is at the top of the feed
   (latest sort), tagged to Varkala.
6. **DEMO MODE** (bottom-left panel) shows the script and can reset the state.

`ESC` returns to the globe from anywhere. `ESC` during the cinematic skips it.
"# Sihwebsite" 
