import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from '../../router';
import { userById } from '../../data/users';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

/**
 * Small shared pieces used across the Forum and the Passport. They deliberately
 * reuse the existing token set (`.tech`, `.display`, hairline rules, saffron
 * accent) so the new surfaces read as the same product as the globe narrative.
 */

/* ------------------------------------------------------------------ Avatar */

export function Avatar({ userId, size = 34 }: { userId: string; size?: number }) {
  const user = userById(userId);
  if (!user) return null;
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full border font-mono"
      style={{
        width: size,
        height: size,
        borderColor: `${user.accent}66`,
        color: user.accent,
        fontSize: size * 0.32,
        letterSpacing: '0.06em',
        background: 'rgba(255,255,255,0.03)',
      }}
      aria-hidden="true"
    >
      {user.initials}
    </span>
  );
}

/**
 * Author line: avatar, handle, role. Clicking opens the contributor profile.
 *
 * Pass `asLink={false}` when the line sits inside a card that is itself a
 * link — an anchor inside an anchor is invalid HTML, and the browser
 * reparents it, which breaks both the card click and the author click.
 */
export function AuthorLine({
  userId,
  size = 34,
  asLink = true,
}: {
  userId: string;
  size?: number;
  asLink?: boolean;
}) {
  const user = userById(userId);
  if (!user) return null;

  const body = (
    <>
      <Avatar userId={userId} size={size} />
      <span className="leading-tight">
        <span className="block text-[13px] text-bone/90 transition-colors group-hover:text-saffron">
          {user.handle}
        </span>
        <span className="tech block">{user.role}</span>
      </span>
    </>
  );

  if (!asLink) {
    return <span className="group inline-flex items-center gap-3">{body}</span>;
  }

  return (
    <Link
      to={`/community/user/${user.id}`}
      className="group inline-flex items-center gap-3"
      data-cursor="PROFILE"
    >
      {body}
    </Link>
  );
}

/* ------------------------------------------------------- Verified marker */

/**
 * Deliberately not a blue tick. It marks the *contribution*, not the person:
 * a hairline rule, a small check, and the word "experience".
 */
export function VerifiedTag({ label = 'VERIFIED EXPERIENCE' }: { label?: string }) {
  return (
    <span className="tech inline-flex items-center gap-1.5 border-l border-teal/60 pl-2 text-teal">
      <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M1.5 6.5 4.5 9.5 10.5 2.5" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      {label}
    </span>
  );
}

/* ---------------------------------------------------------------- Chips */

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-cursor="PICK"
      className={`tech whitespace-nowrap border px-3.5 py-2 transition-all duration-300 ${
        active
          ? 'border-saffron/70 bg-saffron/10 text-saffron'
          : 'border-bone/15 text-bone/55 hover:border-bone/35 hover:text-bone'
      }`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------- Counter */

/** Count-up that fires once when scrolled into view. Honours reduced motion. */
export function Counter({
  value,
  suffix = '',
  className = '',
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const el = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    if (reduced) {
      node.textContent = value.toLocaleString('en-IN') + suffix;
      return;
    }
    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: value,
      duration: 1.7,
      ease: 'expo.out',
      onUpdate: () => {
        node.textContent = Math.round(obj.v).toLocaleString('en-IN') + suffix;
      },
      scrollTrigger: { trigger: node, start: 'top 88%', once: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [value, suffix, reduced]);

  return (
    <span ref={el} className={className}>
      0{suffix}
    </span>
  );
}

/* ---------------------------------------------------------- Stat block */

export function Stat({
  value,
  label,
  suffix,
  animate = true,
}: {
  value: number;
  label: string;
  suffix?: string;
  animate?: boolean;
}) {
  return (
    <div>
      <div className="display text-[38px] leading-none text-bone md:text-[52px]">
        {animate ? <Counter value={value} suffix={suffix} /> : `${value}${suffix ?? ''}`}
      </div>
      <div className="tech mt-2.5">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------- Demo data mark */

/** Every fabricated aggregate in the prototype carries this. */
export function DemoDataTag({ className = '' }: { className?: string }) {
  return (
    <span
      className={`tech inline-block border border-bone/20 px-2 py-1 text-[9px] text-muted ${className}`}
      title="Prototype figure. Not a production statistic."
    >
      DEMO DATA
    </span>
  );
}

/* ------------------------------------------------------------ Page shell */

/**
 * Standard chrome for every non-home route: top padding that clears the fixed
 * header, bottom padding that clears the mobile bar, and an eyebrow + title
 * block that animates in the same way the scroll sections do.
 */
export function PageHeader({
  eyebrow,
  title,
  lede,
  sub,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: string;
  sub?: string;
  children?: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.ph-el',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.08 },
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={root} className="border-b border-bone/10 px-5 pb-10 pt-28 md:px-8 md:pb-14 md:pt-36">
      <div className="mx-auto max-w-6xl">
        {eyebrow && <div className="ph-el tech mb-5 text-saffron">{eyebrow}</div>}
        <h1 className="ph-el display text-[clamp(44px,9vw,116px)] text-bone">{title}</h1>
        {lede && <p className="ph-el mt-6 max-w-2xl text-[17px] leading-snug text-bone/80 md:text-[20px]">{lede}</p>}
        {sub && <p className="ph-el mt-3 max-w-2xl text-[14px] leading-relaxed text-muted">{sub}</p>}
        {children && <div className="ph-el mt-8">{children}</div>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- Empty state */

export function EmptyState({
  line,
  action,
}: {
  line: string;
  action?: { label: string; to: string };
}) {
  return (
    <div className="hairline border border-dashed px-6 py-20 text-center">
      <p className="mx-auto max-w-md text-[19px] leading-snug text-bone/75">{line}</p>
      {action && (
        <Link
          to={action.to}
          data-cursor="GO"
          className="tech mt-7 inline-block border border-saffron/60 px-5 py-3 text-saffron transition-colors hover:bg-saffron hover:text-ink"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- Buttons */

export function ActionButton({
  children,
  onClick,
  tone = 'ghost',
  type = 'button',
  disabled,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: 'ghost' | 'solid';
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}) {
  const base =
    'tech inline-flex items-center justify-center gap-2 px-5 py-3 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-35';
  const tones =
    tone === 'solid'
      ? 'bg-saffron text-ink hover:bg-bone'
      : 'border border-bone/25 text-bone/80 hover:border-saffron/70 hover:text-saffron';
  return (
    <button type={type} onClick={onClick} disabled={disabled} data-cursor="GO" className={`${base} ${tones} ${className}`}>
      {children}
    </button>
  );
}
