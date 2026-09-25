import { useCommunity } from '../../communityStore';
import { navigate, usePathname } from '../../router';

/**
 * ------------------------------------------------------------------
 * MOBILE BOTTOM NAVIGATION
 * ------------------------------------------------------------------
 * EXPLORE · FORUM · PASSPORT · PROFILE, fixed to the bottom edge on
 * small screens. The desktop header does not render a menu on mobile,
 * so this bar is the only primary navigation there.
 *
 * PROFILE resolves to the passport profile page (the traveller's own
 * record); FORUM and PASSPORT are routes, EXPLORE routes home to the
 * globe.
 */
export function MobileNav() {
  const pathname = usePathname();
  const badgeCount = useCommunity((s) => s.unlockedBadgeIds.length);

  const on = (prefixes: string[]) => prefixes.some((p) => pathname.startsWith(p));

  const targets: {
    label: string;
    to?: string;
    section?: string;
    active: boolean;
    count?: number;
    icon: string;
  }[] = [
    {
      label: 'EXPLORE',
      to: '/explore',
      active: on(['/explore']) || pathname === '/',
      icon: '◉',
    },
    {
      label: 'FORUM',
      to: '/forum',
      active: on(['/forum', '/destination', '/community']),
      icon: '❝',
    },
    {
      label: 'PASSPORT',
      to: '/passport',
      active: on(['/passport']),
      icon: '✳',
      count: badgeCount,
    },
    {
      label: 'PROFILE',
      to: '/passport/profile',
      active: on(['/passport/profile']),
      icon: '◍',
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex border-t border-bone/10 bg-ink-2/95 backdrop-blur-xl lg:hidden"
      aria-label="Primary mobile"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {targets.map((t) => (
        <button
          key={t.label}
          onClick={() => (t.to ? navigate(t.to) : undefined)}
          aria-current={t.active ? 'page' : undefined}
          className={`relative flex flex-1 flex-col items-center gap-1 px-2 py-3 transition-colors ${
            t.active ? 'text-saffron' : 'text-bone/55'
          }`}
        >
          <span className="text-[13px]" aria-hidden="true">
            {t.icon}
          </span>
          <span className="tech text-[8px]">{t.label}</span>
          {typeof t.count === 'number' && t.count > 0 && (
            <span className="absolute right-[22%] top-1.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-saffron px-1 font-mono text-[9px] leading-none text-ink">
              {t.count}
            </span>
          )}
          <span
            className={`absolute bottom-0 h-px w-8 transition-all duration-500 ${
              t.active ? 'w-12 bg-saffron' : 'w-0 bg-transparent'
            }`}
            aria-hidden="true"
          />
        </button>
      ))}
    </nav>
  );
}
