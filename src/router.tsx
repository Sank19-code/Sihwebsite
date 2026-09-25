import { useCallback, useEffect, useState, type AnchorHTMLAttributes } from 'react';

/**
 * ------------------------------------------------------------------
 * MINIMAL ROUTER
 * ------------------------------------------------------------------
 * TwinTrip started life as one continuous scroll. Forum and Passport need
 * real, linkable pages, so this adds history-API routing in ~90 lines rather
 * than pulling in a router dependency — the app has exactly one layout, no
 * nested outlets and no data loaders, so there is nothing else to buy.
 *
 * Routes:
 *   /                              home (globe + twin narrative)
 *   /explore                       home, scrolled to the globe
 *   /destination/:placeId          destination hub (match/story/plan/locals/community)
 *   /destination/:placeId/community  destination community feed
 *   /forum                         community feed
 *   /forum/:postId                 post detail
 *   /passport                      travel passport
 *   /passport/profile              passport profile
 *   /passport/badges               badge collection
 *   /community/user/:userId        contributor profile
 *
 * Cross-page scroll targets:
 *   `setPendingAnchor` hands a one-shot scroll target to the NEXT mounted
 *   route (home section ids, `#d-locals`, …). The mounting page consumes it
 *   with `takePendingAnchor` after its DOM is ready.
 */

const EVENT = 'twintrip:navigate';

export function navigate(to: string, options: { replace?: boolean } = {}) {
  if (to === window.location.pathname + window.location.search) return;
  if (options.replace) window.history.replaceState({}, '', to);
  else window.history.pushState({}, '', to);
  window.dispatchEvent(new Event(EVENT));
}

/** Current pathname, re-rendering on both programmatic and back/forward nav. */
export function usePathname() {
  const [path, setPath] = useState(() =>
    typeof window === 'undefined' ? '/' : window.location.pathname,
  );

  useEffect(() => {
    const sync = () => setPath(window.location.pathname);
    window.addEventListener(EVENT, sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  return path;
}

export interface Route {
  name:
    | 'home'
    | 'explore'
    | 'destination'
    | 'destination-community'
    | 'forum'
    | 'post'
    | 'passport'
    | 'passport-profile'
    | 'passport-badges'
    | 'user'
    | 'not-found';
  params: Record<string, string>;
}

/** Pure path → route resolution, so it can be unit-tested without a DOM. */
export function resolve(pathname: string): Route {
  const segments = pathname.replace(/\/+$/, '').split('/').filter(Boolean);

  if (segments.length === 0) return { name: 'home', params: {} };

  const [a, b, c, d] = segments;

  if (a === 'explore' && !b) return { name: 'explore', params: {} };

  if (a === 'destination' && b) {
    if (c === 'community') return { name: 'destination-community', params: { placeId: b } };
    if (!c) return { name: 'destination', params: { placeId: b } };
  }

  if (a === 'forum') {
    if (!b) return { name: 'forum', params: {} };
    if (!c) return { name: 'post', params: { postId: b } };
  }

  if (a === 'passport') {
    if (!b) return { name: 'passport', params: {} };
    if (b === 'profile' && !c) return { name: 'passport-profile', params: {} };
    if (b === 'badges' && !c) return { name: 'passport-badges', params: {} };
  }

  if (a === 'community' && b === 'user' && c && !d) return { name: 'user', params: { userId: c } };

  return { name: 'not-found', params: {} };
}

export function useRoute(): Route {
  const pathname = usePathname();
  return resolve(pathname);
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; replace?: boolean };

/**
 * An anchor that routes in-app on plain left-clicks but still behaves like a
 * real link for middle-click, cmd-click and "copy link address".
 */
export function Link({ to, replace, onClick, children, ...rest }: LinkProps) {
  const handle = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      navigate(to, { replace });
    },
    [to, replace, onClick],
  );

  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  );
}

/* ------------------------------------------------------------------
   One-shot scroll targets across route mounts
   ------------------------------------------------------------------ */

/** `'#globe'`, `'#d-locals'`, … or a numeric scrollTop. */
export type Anchor = string | number;

let pendingAnchor: Anchor | null = null;

/** Hands a scroll target to the next route that mounts. */
export const setPendingAnchor = (a: Anchor) => {
  pendingAnchor = a;
};

/** Consumes the pending target exactly once. */
export const takePendingAnchor = (): Anchor | null => {
  const a = pendingAnchor;
  pendingAnchor = null;
  return a;
};
