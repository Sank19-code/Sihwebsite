import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useApp, selectedDestination } from '../../store';
import { placeById } from '../../data/indianPlaces';
import { localsFor } from '../../data/locals';
import { revealLines, riseIn } from '../../animations/transitions';
import { Poster } from '../ui/Poster';
import type { LocalListing } from '../../data/types';

/**
 * LOCAL DISCOVERY  —  the anti-booking-platform section.
 *
 * Three listings per destination: a guide, a homestay and an artisan. Each
 * card can only do one thing — put you in touch. There is no price, no
 * availability calendar, no cart and no commission, because the moment those
 * appear TwinTrip becomes the intermediary it is trying not to be.
 */
export function LocalDiscovery() {
  const root = useRef<HTMLDivElement>(null);
  const selectedId = useApp((s) => s.selectedId);
  const dest = selectedDestination(selectedId);
  const place = dest ? placeById(dest.twin)! : placeById('varkala')!;
  const listings = localsFor(place.id);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scope = root.current!;
      revealLines(scope.querySelector('.ld-title') as HTMLElement, { trigger: scope, start: 'top 72%' });
      riseIn('.ld-card', { trigger: scope, start: 'top 66%', stagger: 0.12 });
    }, root);
    return () => ctx.revert();
  }, [place.id]);

  return (
    <section
      id="locals"
      ref={root}
      className="relative z-20 border-t border-bone/10 bg-ink px-5 py-24 md:px-8 md:py-36"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <div className="tech mb-8 text-saffron">Zero commission</div>
            <h2 className="ld-title display text-[clamp(34px,7vw,110px)] text-bone">
              <span className="line-mask">
                <span className="line-inner block">Meet the people</span>
              </span>
              <span className="line-mask">
                <span className="line-inner block text-muted-2">who make the place.</span>
              </span>
            </h2>
          </div>
          <p className="max-w-xs text-[13px] leading-relaxed text-muted">
            Verified by local tourism bodies and by other travellers. You contact them directly.
            No booking fee, no markup, no platform in the middle.
          </p>
        </div>

        <div className="mt-20 grid gap-px bg-bone/10 md:grid-cols-3">
          {listings.map((l) => (
            <LocalCard key={l.id} listing={l} />
          ))}
        </div>
      </div>
    </section>
  );
}

function LocalCard({ listing }: { listing: LocalListing }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <article className="ld-card group relative flex flex-col bg-ink">
      {/* Image: procedural, zooms on hover. */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="h-full w-full transition-transform duration-[1200ms] ease-cine group-hover:scale-[1.07]">
          {/* Each category gets its own composition so the three cards do not
              read as the same picture three times: the guide gets the place
              itself, the homestay a built form, the artisan a close landscape. */}
          <Poster
            terrain={
              listing.category === 'HOMESTAY'
                ? 'colonial'
                : listing.category === 'GUIDE'
                  ? (placeById(listing.placeId)?.terrain ?? 'cliff')
                  : 'boulders'
            }
            palette={listing.palette}
            intensity={listing.category === 'HOMESTAY' ? 0.8 : listing.category === 'ARTISAN' ? 1.25 : 1}
            className="h-full w-full"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="tech bg-ink/70 px-2 py-1 text-bone backdrop-blur-sm">{listing.category}</span>
          {listing.verified && (
            <span className="tech flex items-center gap-1 bg-teal/25 px-2 py-1 text-[8px] text-bone backdrop-blur-sm">
              <span className="inline-block h-1 w-1 rounded-full bg-teal" />
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Metadata rises on hover. */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="display text-[clamp(20px,2.3vw,28px)] text-bone transition-transform duration-700 ease-cine group-hover:-translate-y-1">
          {listing.name}
        </h3>
        <div className="tech mt-2 transition-transform duration-700 ease-cine group-hover:-translate-y-1">
          {listing.place}
        </div>
        <p className="mt-5 flex-1 text-[13px] leading-relaxed text-muted">{listing.blurb}</p>

        <button
          onClick={() => setRevealed((r) => !r)}
          data-cursor="CONTACT"
          className="mt-7 flex items-center justify-between border-t border-bone/15 pt-5 text-left transition-colors duration-500 hover:border-saffron"
        >
          <span className="tech text-bone">{revealed ? listing.handle : 'Contact directly'}</span>
          <span className="text-saffron transition-transform duration-500 group-hover:translate-x-1">
            {revealed ? '·' : '→'}
          </span>
        </button>
        {revealed && (
          <p className="tech mt-3 text-[8px] leading-relaxed text-muted-2">
            Prototype: contact details are placeholders. A production build would open WhatsApp or
            a phone dialler with the verified number.
          </p>
        )}
      </div>
    </article>
  );
}
