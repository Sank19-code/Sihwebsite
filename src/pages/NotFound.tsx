import { EmptyState } from '../components/ui/primitives';

/**
 * /anything-else — the only route that should not exist.
 * Every real destination and post in the prototype resolves before this.
 */
export function NotFound() {
  return (
    <div className="relative z-10 flex min-h-screen items-center bg-ink px-5 md:px-8">
      <div className="mx-auto w-full max-w-2xl py-24 text-center">
        <div className="tech text-saffron">404 · OFF THE GRATICULE</div>
        <h1 className="display mt-6 text-[clamp(44px,8vw,96px)] leading-[0.9] text-bone">
          This marker
          <br />
          is not on the map.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-muted">
          TwinTrip plots 17 dream destinations and 13 Indian twins. This address is not one of them — the route
          may be mistyped, or the page may not exist yet.
        </p>
        <div className="mt-14 flex flex-col items-center gap-4">
          <EmptyState line="The globe is still turning, and so are the places on it." action={{ label: 'BACK TO THE GLOBE', to: '/' }} />
        </div>
      </div>
    </div>
  );
}
