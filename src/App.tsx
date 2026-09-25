import { useEffect } from 'react';
import { useRoute, usePathname, takePendingAnchor } from './router';
import { useApp } from './store';
import { Home } from './pages/Home';
import { Forum } from './pages/Forum';
import { PostDetail } from './pages/PostDetail';
import { Destination } from './pages/Destination';
import { DestinationCommunity } from './pages/DestinationCommunity';
import { Passport } from './pages/Passport';
import { PassportProfile } from './pages/PassportProfile';
import { BadgeCollection } from './pages/BadgeCollection';
import { ContributorProfile } from './pages/ContributorProfile';
import { NotFound } from './pages/NotFound';

import { Navigation } from './components/Navigation/Navigation';
import { MobileNav } from './components/Navigation/MobileNav';
import { ProgressRail } from './components/Navigation/ProgressRail';
import { CustomCursor } from './components/Cursor/CustomCursor';
import { Globe } from './components/Globe/Globe';
import { BadgeUnlockOverlay } from './components/Badges/BadgeUnlockOverlay';
import { DocumentJourney } from './components/Forum/DocumentJourney';
import { DemoPanel } from './components/Demo/DemoPanel';
import { scrollTo } from './hooks/useSmoothScroll';

/**
 * ------------------------------------------------------------------
 * APP SHELL
 * ------------------------------------------------------------------
 * The globe backdrop, navigation and the two global overlays (the document
 * → verify → badge flow, and the badge celebration) live here so every
 * route shares them.
 *
 * Home keeps its Lenis smooth scroll (mounted inside Home) and fades the
 * globe out as the narrative scrolls. Routed pages scroll natively and sit
 * on the opaque `.route-surface`, which is why a contribution published on
 * /forum appears the moment you return from /passport.
 *
 * Scroll on navigation: every route starts at the top of the new surface,
 * unless the previous page handed off a one-shot target (`setPendingAnchor`,
 * e.g. the mobile "EXPLORE" button → `/explore` → `#globe`). The target
 * runs on the next frame, once the mounting page's own scroll system is up.
 */
export default function App() {
  const route = useRoute();
  const pathname = usePathname();
  const setGlobeLive = useApp((s) => s.setGlobeLive);

  const isHome = route.name === 'home' || route.name === 'explore';

  // Routed pages paint opaque over the globe layer, so pause the WebGL
  // frame loop behind them (zero GPU work, instant resume on the way back).
  // A marker hover left behind would otherwise keep its card alive under the
  // opaque surface.
  useEffect(() => {
    setGlobeLive(isHome);
    if (!isHome) {
      useApp.getState().setHovered(null);
      useApp.getState().setDragging(false);
    }
  }, [isHome, setGlobeLive]);

  // Every navigation starts at the top of the new surface — unless a
  // one-shot target was handed off by the previous page, or the route is
  // /explore, which lands on the globe by definition. Deferred one frame
  // so that on home the mounting Lenis instance exists before it scrolls.
  useEffect(() => {
    const pending = takePendingAnchor();
    const target: string | number | null =
      pending ?? (route.name === 'explore' ? '#globe' : null);
    if (target == null) {
      window.scrollTo(0, 0);
      return;
    }
    requestAnimationFrame(() => scrollTo(target));
  }, [pathname, route.name]);

  const page = (() => {
    switch (route.name) {
      case 'home':
      case 'explore':
        return <Home />;
      case 'destination':
        return <Destination placeId={route.params.placeId} />;
      case 'destination-community':
        return <DestinationCommunity placeId={route.params.placeId} />;
      case 'forum':
        return <Forum />;
      case 'post':
        return <PostDetail postId={route.params.postId} />;
      case 'passport':
        return <Passport />;
      case 'passport-profile':
        return <PassportProfile />;
      case 'passport-badges':
        return <BadgeCollection />;
      case 'user':
        return <ContributorProfile userId={route.params.userId} />;
      default:
        return <NotFound />;
    }
  })();

  // Home renders bare (the globe must show through it); everything else
  // gets the opaque routed-page ground.
  const pageEl = isHome ? page : <div className="route-surface">{page}</div>;

  return (
    <>
      <Navigation activePath={pathname} />
      <MobileNav />
      {isHome && <ProgressRail />}
      <CustomCursor />

      {/* Fixed WebGL backdrop for the whole document. */}
      <Globe />

      {pageEl}

      {/* Global overlays: the contribution flow and the badge celebration. */}
      <DocumentJourney />
      <BadgeUnlockOverlay />

      {/* Presenter controls: the demo script and the state reset. */}
      <DemoPanel />
    </>
  );
}
