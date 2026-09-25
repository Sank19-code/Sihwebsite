import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useApp, selectedDestination } from '../../store';
import { placeById } from '../../data/indianPlaces';
import { languages, languageByCode } from '../../data/i18n';
import { revealLines } from '../../animations/transitions';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { Poster } from '../ui/Poster';

gsap.registerPlugin(ScrollTrigger);

/**
 * ------------------------------------------------------------------
 * STORY  —  the 90-second legend
 * ------------------------------------------------------------------
 * Scroll drives the chapters: a sticky visual stays put while the text
 * columns move past it, and each chapter re-tints the artwork as it becomes
 * active. That is the editorial feel the brief asks for — closer to a long
 * magazine feature than to a carousel.
 *
 * NARRATION uses the Web Speech API, which needs no backend and no audio
 * files. Nothing ever autoplays. If the device has no installed voice for the
 * selected language the component says so and falls back to a silent timed
 * read-through, so the demo still advances on stage.
 */
export function StorySection() {
  const root = useRef<HTMLDivElement>(null);
  const selectedId = useApp((s) => s.selectedId);
  const dest = selectedDestination(selectedId);
  const twin = (dest ? placeById(dest.twin) : undefined) ?? placeById('varkala')!;
  const reduced = usePrefersReducedMotion();

  const [chapter, setChapter] = useState(0);
  const [lang, setLang] = useState('en');
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);

  const language = languageByCode(lang);
  const chapters = twin.story.chapters;
  const duration = twin.story.duration;

  /* ---------------- Scroll-driven chapter switching ---------------- */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const scope = root.current!;
      revealLines(scope.querySelector('.st-title') as HTMLElement, { trigger: scope, start: 'top 70%' });

      scope.querySelectorAll<HTMLElement>('.st-chapter').forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 62%',
          end: 'bottom 40%',
          onEnter: () => setChapter(i),
          onEnterBack: () => setChapter(i),
        });

        gsap.fromTo(
          el.querySelectorAll('.st-fade'),
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 78%', once: true },
          },
        );
      });
    }, root);
    return () => ctx.revert();
  }, [twin.id]);

  /* ---------------- Narration ---------------- */
  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const findVoice = useCallback(
    (tag: string) => {
      if (!speechSupported) return null;
      const voices = window.speechSynthesis.getVoices();
      const base = tag.split('-')[0];
      return (
        voices.find((v) => v.lang.replace('_', '-') === tag) ??
        voices.find((v) => v.lang.replace('_', '-').startsWith(base)) ??
        null
      );
    },
    [speechSupported],
  );

  const stopNarration = useCallback(() => {
    if (speechSupported) window.speechSynthesis.cancel();
    setPlaying(false);
  }, [speechSupported]);

  const play = useCallback(() => {
    if (playing) {
      stopNarration();
      return;
    }

    const voice = findVoice(language.speech);

    if (!speechSupported || !voice) {
      // Silent fallback: advance chapters on a timer so the sequence still
      // plays for an audience. Stated explicitly in the UI.
      setVoiceNote(
        speechSupported
          ? `No ${language.label} voice installed on this device — running a silent read-through.`
          : 'Speech synthesis unavailable — running a silent read-through.',
      );
      setPlaying(true);
      return;
    }

    setVoiceNote(null);
    window.speechSynthesis.cancel();
    setPlaying(true);

    chapters.forEach((c, i) => {
      const u = new SpeechSynthesisUtterance(c.text);
      u.voice = voice;
      u.lang = language.speech;
      u.rate = 0.92;
      u.pitch = 1;
      u.onstart = () => setChapter(i);
      if (i === chapters.length - 1) {
        u.onend = () => setPlaying(false);
      }
      window.speechSynthesis.speak(u);
    });
  }, [playing, findVoice, language, speechSupported, chapters, stopNarration]);

  /* Elapsed-time readout, and chapter advance for the silent fallback. */
  useEffect(() => {
    if (!playing) {
      setElapsed(0);
      return;
    }
    const perChapter = duration / chapters.length;
    const start = performance.now();
    const id = window.setInterval(() => {
      const t = (performance.now() - start) / 1000;
      setElapsed(t);
      if (voiceNote) {
        // Silent mode owns chapter advancement.
        const idx = Math.min(chapters.length - 1, Math.floor(t / perChapter));
        setChapter(idx);
      }
      if (t >= duration) {
        setPlaying(false);
        if (speechSupported) window.speechSynthesis.cancel();
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [playing, duration, chapters.length, voiceNote, speechSupported]);

  /* Stop narration when the component unmounts or the place changes. */
  useEffect(() => () => stopNarration(), [twin.id, stopNarration]);

  const mmss = useMemo(() => {
    const total = playing ? Math.max(0, duration - elapsed) : duration;
    const m = Math.floor(total / 60);
    const s = Math.floor(total % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [playing, elapsed, duration]);

  return (
    <section id="story" ref={root} className="relative z-20 bg-ink">
      {/* ---------- Section opener ---------- */}
      <div className="border-t border-bone/10 px-5 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="tech mb-8 text-saffron">The legend</div>
          <h2 className="st-title display text-[clamp(34px,7vw,110px)] text-bone">
            <span className="line-mask">
              <span className="line-inner block">Every place</span>
            </span>
            <span className="line-mask">
              <span className="line-inner block text-muted-2">has a story.</span>
            </span>
          </h2>
        </div>
      </div>

      {/* ---------- Sticky visual + scrolling chapters ---------- */}
      <div className="relative grid md:grid-cols-2">
        {/* Visual column — sticky on desktop, a banner on mobile. */}
        <div className="relative h-[46svh] md:sticky md:top-0 md:h-[100svh]">
          <Poster
            terrain={twin.terrain}
            palette={twin.palette}
            className="absolute inset-0"
            intensity={1 + chapter * 0.16}
          />
          {/* Chapter tint: each beat shifts the light a little. */}
          <div
            className="absolute inset-0 transition-all duration-[1400ms] ease-cine"
            style={{
              background: `linear-gradient(${180 - chapter * 22}deg, rgba(5,5,5,${0.75 - chapter * 0.08}), rgba(5,5,5,0.15))`,
            }}
          />

          <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10">
            <div>
              <div className="tech text-bone/70">{twin.name} · {twin.state}</div>
            </div>

            <div>
              <div className="tech mb-3 text-saffron">
                {language.ui.chapter} {String(chapter + 1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}
              </div>
              <h3 className="display max-w-md text-[clamp(26px,4.2vw,58px)] text-bone">
                {twin.story.title}
              </h3>

              {/* Chapter progress ticks */}
              <div className="mt-6 flex gap-1.5">
                {chapters.map((_, i) => (
                  <span
                    key={i}
                    className="h-px flex-1 transition-all duration-700"
                    style={{ background: i <= chapter ? '#E8833A' : 'rgba(242,238,231,0.2)' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Text column */}
        <div className="px-5 md:px-12">
          {/* Narration controls */}
          <div className="sticky top-[68px] z-10 -mx-5 border-b border-bone/10 bg-ink/90 px-5 py-4 backdrop-blur-md md:top-[84px] md:mx-0 md:px-0 md:py-6">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <button
                onClick={play}
                data-cursor={playing ? 'STOP' : 'PLAY'}
                className="group flex items-center gap-3"
                aria-pressed={playing}
              >
                <span className="grid h-11 w-11 place-items-center rounded-full border border-bone/25 text-saffron transition-all duration-500 group-hover:border-saffron group-hover:bg-saffron/10">
                  {playing ? '■' : '▶'}
                </span>
                <span className="text-left">
                  <span className="tech block text-bone">
                    {playing ? language.ui.pause : language.ui.play} {mmss}
                  </span>
                  <span className="tech block">{language.ui.narration}</span>
                </span>
              </button>

              <div className="ml-auto flex flex-wrap gap-x-4 gap-y-2">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      stopNarration();
                      setVoiceNote(null);
                      setLang(l.code);
                    }}
                    data-cursor="LANG"
                    className="tech transition-colors duration-300"
                    style={{ color: l.code === lang ? '#E8833A' : undefined }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {voiceNote && <p className="tech mt-3 text-[9px] leading-relaxed text-vermilion">{voiceNote}</p>}
            {lang !== 'en' && !voiceNote && (
              <p className="tech mt-3 text-[9px] leading-relaxed">
                Prototype: narration switches voice; story text is authored in English.
              </p>
            )}
          </div>

          {/* Chapters */}
          {chapters.map((c, i) => (
            <article
              key={c.label}
              className="st-chapter flex min-h-[58svh] flex-col justify-center py-14 md:min-h-[100svh] md:py-16"
            >
              <div
                className="st-fade tech mb-6 transition-colors duration-700"
                style={{ color: i === chapter ? '#E8833A' : undefined }}
              >
                {c.label}
              </div>
              <p
                className="st-fade max-w-xl text-[clamp(19px,2.3vw,30px)] leading-[1.42] tracking-tight transition-opacity duration-700"
                style={{ opacity: reduced ? 1 : i === chapter ? 1 : 0.35, color: '#F2EEE7' }}
              >
                {c.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
