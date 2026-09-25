import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { useUi } from '../../uiStore';
import { useCommunity } from '../../communityStore';
import { indianPlaces, placeById } from '../../data/indianPlaces';
import { badgeForPlace } from '../../data/badges';
import type { PostCategory, PostMedia } from '../../data/forumPosts';
import { lockScroll, unlockScroll } from '../../hooks/useSmoothScroll';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { Poster } from '../ui/Poster';
import { ActionButton } from '../ui/primitives';
import { navigate } from '../../router';

/**
 * ------------------------------------------------------------------
 * DOCUMENT YOUR JOURNEY
 * ------------------------------------------------------------------
 * The hinge of the whole product. Five steps:
 *
 *   CAPTURE  -> pick a real file, or load the demo clip
 *   DETAILS  -> destination, category, title, story, practical notes
 *   VERIFY   -> location / date / destination checks presented honestly
 *   RUNNING  -> the simulated verification sequence
 *   DONE     -> the post is live, the passport is stamped
 *
 * The verification is SIMULATED. It is labelled as such on the screen where a
 * real system would be doing device-attestation and EXIF/GPS matching — the
 * prototype should not imply it verified something it did not.
 *
 * Badge celebration is NOT handled here: submitting pushes onto the store's
 * unlock queue and <BadgeUnlockOverlay> takes over, so a badge earned from
 * anywhere in the app is celebrated the same way.
 */

type Step = 'capture' | 'details' | 'verify' | 'running' | 'done';

const CATEGORIES: PostCategory[] = ['STORY', 'HIDDEN GEM', 'FOOD', 'EXPERIENCE', 'TRAVEL TIP'];

const DEMO_CLIP = {
  filename: 'VARKALA EXPERIENCE.mp4',
  placeId: 'varkala',
  duration: 32,
  title: 'The secret sunset spot most tourists miss',
  body: `Twenty minutes north of the main beach the cafes stop and the path turns to packed red earth. There is a second shelf of laterite below the cliff edge, wide enough for four people.

Nobody was there. The whole north cliff lit up orange behind me and the sun went down over the sea with nothing in the way of it.`,
  category: 'HIDDEN GEM' as PostCategory,
};

const CHECKS = [
  { label: 'Location matched', detail: 'Coordinates fall inside the destination boundary' },
  { label: 'Destination confirmed', detail: 'Selected place agrees with the capture location' },
  { label: 'Content received', detail: 'Media stored against your contributor record' },
];

export function DocumentJourney() {
  const open = useUi((s) => s.documentOpen);
  const presetPlace = useUi((s) => s.documentPlaceId);
  const close = useUi((s) => s.closeDocument);
  const submit = useCommunity((s) => s.submitVerifiedExperience);
  const reduced = usePrefersReducedMotion();

  const [step, setStep] = useState<Step>('capture');
  const [media, setMedia] = useState<{ kind: 'photo' | 'video'; filename: string; url?: string; duration?: number } | null>(null);
  const [placeId, setPlaceId] = useState<string>('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<PostCategory>('EXPERIENCE');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [bestTime, setBestTime] = useState('');
  const [duration, setDuration] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [budget, setBudget] = useState('');
  const [checkIndex, setCheckIndex] = useState(-1);
  const [newPostId, setNewPostId] = useState<string | null>(null);

  const panel = useRef<HTMLDivElement>(null);
  const objectUrl = useRef<string | null>(null);

  /* ---- open / close plumbing ---- */
  useEffect(() => {
    if (!open) return;
    lockScroll();
    setStep('capture');
    setCheckIndex(-1);
    setNewPostId(null);
    setPlaceId(presetPlace ?? '');
    return () => unlockScroll();
  }, [open, presetPlace]);

  useEffect(() => {
    if (!open || reduced || !panel.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.dj-panel', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out' });
    }, panel);
    return () => ctx.revert();
  }, [open, reduced]);

  // Release any blob URL we created for a real upload.
  useEffect(
    () => () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step !== 'running') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, step, close]);

  /* ---- the simulated verification sequence ---- */
  useEffect(() => {
    if (step !== 'running') return;
    const timers: number[] = [];
    CHECKS.forEach((_, i) => {
      timers.push(window.setTimeout(() => setCheckIndex(i), reduced ? 80 * (i + 1) : 700 + i * 780));
    });
    timers.push(
      window.setTimeout(
        () => {
          const place = placeById(placeId);
          const media0: PostMedia[] = media
            ? [
                {
                  kind: media.kind,
                  terrain: place?.terrain,
                  caption: media.filename,
                  duration: media.duration,
                },
              ]
            : [];
          const id = submit({
            placeId,
            category,
            title: title.trim(),
            body: body.trim(),
            media: media0,
            details: {
              bestTime: bestTime || place?.bestSeason,
              duration: duration || undefined,
              difficulty: difficulty || undefined,
              budget: budget || undefined,
            },
          });
          setNewPostId(id);
          setStep('done');
        },
        reduced ? 400 : 3100,
      ),
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return indianPlaces;
    return indianPlaces.filter(
      (p) => p.name.toLowerCase().includes(q) || p.state.toLowerCase().includes(q),
    );
  }, [query]);

  const place = placeId ? placeById(placeId) : null;
  const badge = placeId ? badgeForPlace(placeId) : null;
  const canContinue = Boolean(placeId && title.trim().length > 2 && body.trim().length > 10);

  if (!open) return null;

  const onFile = (file: File | undefined) => {
    if (!file) return;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    const url = URL.createObjectURL(file);
    objectUrl.current = url;
    setMedia({ kind: file.type.startsWith('video') ? 'video' : 'photo', filename: file.name, url });
    setStep('details');
  };

  const useDemo = () => {
    if (objectUrl.current) {
      URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = null;
    }
    setMedia({ kind: 'video', filename: DEMO_CLIP.filename, duration: DEMO_CLIP.duration });
    setPlaceId(presetPlace || DEMO_CLIP.placeId);
    setCategory(DEMO_CLIP.category);
    setTitle(DEMO_CLIP.title);
    setBody(DEMO_CLIP.body);
    setStep('details');
  };

  return (
    <div
      ref={panel}
      className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-ink/92 px-4 py-8 backdrop-blur-xl md:px-8 md:py-14"
      role="dialog"
      aria-modal="true"
      aria-label="Document your journey"
    >
      <div className="dj-panel relative w-full max-w-3xl border border-bone/12 bg-ink-2">
        {/* header */}
        <div className="flex items-start justify-between border-b border-bone/10 px-6 py-5 md:px-8">
          <div>
            <div className="tech text-saffron">DOCUMENT YOUR JOURNEY</div>
            <div className="display mt-2 text-[26px] leading-none text-bone md:text-[32px]">
              {step === 'capture' && 'What did you bring back?'}
              {step === 'details' && 'Where was this?'}
              {step === 'verify' && 'Verify experience'}
              {step === 'running' && 'Verifying experience'}
              {step === 'done' && 'Experience verified'}
            </div>
          </div>
          {step !== 'running' && (
            <button onClick={close} aria-label="Close" data-cursor="CLOSE" className="tech text-bone/60 hover:text-saffron">
              ESC ✕
            </button>
          )}
        </div>

        {/* step rail */}
        <div className="flex gap-1 px-6 pt-5 md:px-8">
          {(['capture', 'details', 'verify', 'done'] as const).map((s, i) => {
            const order = ['capture', 'details', 'verify', 'running', 'done'];
            const done = order.indexOf(step) >= order.indexOf(s);
            return (
              <span key={s} className="h-px flex-1 overflow-hidden bg-bone/12">
                <span
                  className="block h-full bg-saffron transition-transform duration-700 ease-cine"
                  style={{ transform: `scaleX(${done ? 1 : 0})`, transformOrigin: 'left' }}
                  aria-hidden="true"
                />
                <span className="sr-only">{`step ${i + 1}`}</span>
              </span>
            );
          })}
        </div>

        <div className="px-6 py-7 md:px-8 md:py-9">
          {/* ---------------------------------------------------- CAPTURE */}
          {step === 'capture' && (
            <div>
              <p className="max-w-lg text-[15px] leading-relaxed text-bone/75">
                A photo or a thirty-second clip is enough. It is what turns a visit into something another
                traveller can find.
              </p>

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                <label className="hairline group flex cursor-pointer flex-col items-start justify-between border border-dashed px-5 py-7 transition-colors hover:border-saffron/60">
                  <span className="tech text-saffron">+ PHOTO / VIDEO</span>
                  <span className="mt-8 text-[15px] leading-snug text-bone/80">
                    Upload from this device
                  </span>
                  <span className="tech mt-2">JPG · PNG · MP4 · MOV</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="sr-only"
                    onChange={(e) => onFile(e.target.files?.[0])}
                  />
                </label>

                <button
                  type="button"
                  onClick={useDemo}
                  data-cursor="DEMO"
                  className="hairline flex flex-col items-start justify-between border border-saffron/40 bg-saffron/[0.06] px-5 py-7 text-left transition-colors hover:bg-saffron/[0.12]"
                >
                  <span className="tech text-saffron">USE DEMO VIDEO</span>
                  <span className="mt-8 text-[15px] leading-snug text-bone/80">
                    Loads a sample Varkala clip so the flow can be shown without a file.
                  </span>
                  <span className="tech mt-2">VARKALA EXPERIENCE.MP4 · 0:32</span>
                </button>
              </div>

              <p className="tech mt-6 leading-relaxed">
                NOTHING IS UPLOADED ANYWHERE. FILES STAY IN THIS BROWSER TAB.
              </p>
            </div>
          )}

          {/* ---------------------------------------------------- DETAILS */}
          {step === 'details' && media && (
            <div className="grid gap-8 md:grid-cols-[minmax(0,260px)_1fr]">
              {/* preview */}
              <div>
                <div className="tech mb-3">PREVIEW</div>
                <div className="relative aspect-[4/5] overflow-hidden border border-bone/12">
                  {media.url && media.kind === 'video' ? (
                    <video
                      src={media.url}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      loop
                      autoPlay
                      aria-label={media.filename}
                    />
                  ) : media.url ? (
                    <img src={media.url} alt={media.filename} className="h-full w-full object-cover" />
                  ) : (
                    <Poster
                      terrain={place?.terrain ?? 'cliff'}
                      palette={place?.palette ?? { sky: ['#1B1014', '#E8833A'], land: '#120C0E', glow: '#FFB25E' }}
                      className="absolute inset-0"
                    />
                  )}
                  {media.kind === 'video' && (
                    <span className="tech absolute bottom-3 left-3 bg-ink/70 px-2 py-1 text-bone">
                      ▶ {media.duration ? `0:${String(media.duration).padStart(2, '0')}` : 'CLIP'}
                    </span>
                  )}
                </div>
                <div className="tech mt-3 normal-case tracking-normal text-bone/70">{media.filename}</div>
                <button
                  onClick={() => setStep('capture')}
                  className="tech mt-3 text-bone/50 underline underline-offset-4 hover:text-saffron"
                >
                  REPLACE
                </button>
              </div>

              {/* form */}
              <div>
                <Field label="SELECT DESTINATION">
                  <input
                    value={place ? `${place.name}, ${place.state}` : query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPlaceId('');
                    }}
                    placeholder="Search destination…"
                    className="w-full border-b border-bone/20 bg-transparent pb-2 text-[16px] text-bone outline-none placeholder:text-muted focus:border-saffron"
                  />
                  {!placeId && (
                    <div className="mt-3 max-h-40 overflow-y-auto border border-bone/10">
                      {filtered.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setPlaceId(p.id);
                            setQuery('');
                          }}
                          className="flex w-full items-baseline justify-between px-3 py-2 text-left text-[14px] text-bone/80 transition-colors hover:bg-saffron/10 hover:text-saffron"
                        >
                          <span>{p.name}</span>
                          <span className="tech">{p.state}</span>
                        </button>
                      ))}
                      {!filtered.length && <div className="tech px-3 py-3">NO MATCH</div>}
                    </div>
                  )}
                </Field>

                <Field label="WHAT ARE YOU SHARING?">
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        aria-pressed={category === c}
                        className={`tech border px-3 py-2 transition-colors ${
                          category === c
                            ? 'border-saffron/70 bg-saffron/10 text-saffron'
                            : 'border-bone/15 text-bone/55 hover:text-bone'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="TITLE">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title"
                    maxLength={90}
                    className="w-full border-b border-bone/20 bg-transparent pb-2 text-[17px] text-bone outline-none placeholder:text-muted focus:border-saffron"
                  />
                </Field>

                <Field label="DESCRIPTION">
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Tell your story…"
                    rows={5}
                    className="w-full resize-none border border-bone/15 bg-transparent p-3 text-[14px] leading-relaxed text-bone outline-none placeholder:text-muted focus:border-saffron"
                  />
                </Field>

                <Field label="OPTIONAL">
                  <div className="grid grid-cols-2 gap-3">
                    <MiniInput value={bestTime} onChange={setBestTime} placeholder={place?.bestSeason ?? 'Best time'} />
                    <MiniInput value={duration} onChange={setDuration} placeholder="Approx. duration" />
                    <MiniInput value={difficulty} onChange={setDifficulty} placeholder="Difficulty" />
                    <MiniInput value={budget} onChange={setBudget} placeholder="Budget" />
                  </div>
                </Field>

                <div className="mt-7 flex items-center gap-3">
                  <ActionButton tone="solid" onClick={() => setStep('verify')} disabled={!canContinue}>
                    CONTINUE →
                  </ActionButton>
                  {!canContinue && <span className="tech">DESTINATION, TITLE AND STORY REQUIRED</span>}
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- VERIFY */}
          {step === 'verify' && place && (
            <div>
              <div className="grid gap-px border border-bone/10 bg-bone/10 sm:grid-cols-3">
                <VerifyCell label="LOCATION" value="Detected" detail={`${place.coordinates[0].toFixed(3)}, ${place.coordinates[1].toFixed(3)}`} />
                <VerifyCell label="DATE" value="Recorded" detail={new Date().toISOString().slice(0, 10)} />
                <VerifyCell label="DESTINATION" value="Selected" detail={`${place.name}, ${place.state}`} />
              </div>

              {badge && (
                <div className="mt-7 border-l border-saffron/50 pl-5">
                  <div className="tech text-saffron">THIS CONTRIBUTION EARNS</div>
                  <div className="display mt-2 text-[30px] leading-none text-bone">{badge.name}</div>
                  <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted">{badge.description}</p>
                </div>
              )}

              <p className="tech mt-8 max-w-lg leading-relaxed">
                VERIFICATION IS SIMULATED IN THIS PROTOTYPE. A PRODUCTION BUILD WOULD MATCH DEVICE GPS AND
                CAPTURE TIME AGAINST THE DESTINATION BOUNDARY.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <ActionButton tone="solid" onClick={() => setStep('running')}>
                  SUBMIT FOR VERIFICATION
                </ActionButton>
                <ActionButton onClick={() => setStep('details')}>BACK</ActionButton>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- RUNNING */}
          {step === 'running' && (
            <div className="py-6">
              <div className="flex items-center gap-4">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-saffron opacity-60" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-saffron" />
                </span>
                <span className="display text-[24px] leading-none text-bone">VERIFYING EXPERIENCE…</span>
              </div>

              <div className="mt-9 space-y-5">
                {CHECKS.map((c, i) => (
                  <div
                    key={c.label}
                    className="flex items-baseline gap-4 transition-all duration-500"
                    style={{ opacity: checkIndex >= i ? 1 : 0.22, transform: `translateX(${checkIndex >= i ? 0 : -8}px)` }}
                  >
                    <span className="tech w-4 text-teal">{checkIndex >= i ? '✓' : '·'}</span>
                    <span>
                      <span className="block text-[16px] text-bone">{c.label}</span>
                      <span className="tech mt-1 block normal-case tracking-[0.12em] text-muted">{c.detail}</span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-9 h-px w-full overflow-hidden bg-bone/12">
                <div className="dj-bar h-full bg-saffron" />
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- DONE */}
          {step === 'done' && place && (
            <div>
              <div className="flex items-center gap-3">
                <span className="tech text-teal">✓ EXPERIENCE VERIFIED</span>
              </div>
              <p className="mt-5 max-w-lg text-[17px] leading-snug text-bone/85">
                Your contribution is live in the {place.name} community, and your passport has been stamped.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <ActionButton
                  tone="solid"
                  onClick={() => {
                    close();
                    navigate('/passport');
                  }}
                >
                  VIEW IN PASSPORT
                </ActionButton>
                <ActionButton
                  onClick={() => {
                    close();
                    if (newPostId) navigate(`/forum/${newPostId}`);
                  }}
                >
                  SEE THE POST
                </ActionButton>
                <ActionButton
                  onClick={() => {
                    close();
                    navigate(`/destination/${place.id}/community`);
                  }}
                >
                  {place.name.toUpperCase()} COMMUNITY
                </ActionButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="tech mb-2.5">{label}</div>
      {children}
    </div>
  );
}

function MiniInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border-b border-bone/15 bg-transparent pb-1.5 text-[13px] text-bone outline-none placeholder:text-muted focus:border-saffron"
    />
  );
}

function VerifyCell({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="bg-ink-2 px-5 py-6">
      <div className="tech">{label}</div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-teal">✓</span>
        <span className="text-[17px] text-bone">{value}</span>
      </div>
      <div className="tech mt-2 normal-case tracking-[0.1em]">{detail}</div>
    </div>
  );
}
