import { useState } from 'react';
import { useCommunity, likeCount, helpfulCount, postsForPlace } from '../communityStore';
import { useUi } from '../uiStore';
import { placeById } from '../data/indianPlaces';
import { badgeById } from '../data/badges';
import { userById } from '../data/users';
import { Link, navigate } from '../router';
import { Poster } from '../components/ui/Poster';
import { BadgeArt } from '../components/Badges/BadgeArt';
import { AuthorLine, Avatar, VerifiedTag, ActionButton, EmptyState } from '../components/ui/primitives';
import { formatCoords } from '../lib/geo';

/**
 * ------------------------------------------------------------------
 * /forum/:postId — POST DETAIL
 * ------------------------------------------------------------------
 * The full contribution, plus the two things that make it part of the product
 * rather than a blog entry: the badge it earned, and the destination it made
 * more discoverable. Comments are real local state.
 */
export function PostDetail({ postId }: { postId: string }) {
  const posts = useCommunity((s) => s.posts);
  const likedIds = useCommunity((s) => s.likedIds);
  const helpfulIds = useCommunity((s) => s.helpfulIds);
  const savedIds = useCommunity((s) => s.savedIds);
  const toggleLike = useCommunity((s) => s.toggleLike);
  const toggleSave = useCommunity((s) => s.toggleSave);
  const toggleHelpful = useCommunity((s) => s.toggleHelpful);
  const addComment = useCommunity((s) => s.addComment);
  const openDocument = useUi((s) => s.openDocument);

  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState(false);

  const post = posts.find((p) => p.id === postId);

  if (!post) {
    return (
      <div className="relative z-10 min-h-screen bg-ink px-5 pt-36 md:px-8">
        <div className="mx-auto max-w-3xl">
          <EmptyState line="That post is no longer here." action={{ label: 'BACK TO COMMUNITY', to: '/forum' }} />
        </div>
      </div>
    );
  }

  const place = placeById(post.destination);
  const badge = post.badgeId ? badgeById(post.badgeId) : null;
  const author = userById(post.authorId);
  const media = post.media[0];
  const liked = likedIds.includes(post.id);
  const saved = savedIds.includes(post.id);
  const marked = helpfulIds.includes(post.id);

  const related = place ? postsForPlace(posts, place.id).filter((p) => p.id !== post.id).slice(0, 3) : [];

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className="relative z-10 bg-ink pb-24">
      {/* ---------------- hero ---------------- */}
      <header className="relative">
        <div className="relative h-[46vh] min-h-[320px] w-full overflow-hidden md:h-[62vh]">
          {place && <Poster terrain={media?.terrain ?? place.terrain} palette={place.palette} className="absolute inset-0" intensity={1.25} />}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/70" />

          <div className="absolute inset-x-0 bottom-0 px-5 pb-8 md:px-8 md:pb-12">
            <div className="mx-auto max-w-4xl">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {place && (
                  <Link to={`/destination/${place.id}/community`} className="tech text-saffron hover:text-bone">
                    {place.name.toUpperCase()}, {place.state.toUpperCase()}
                  </Link>
                )}
                <span className="tech text-bone/40">{post.category}</span>
                {post.verified && <VerifiedTag />}
              </div>
              <h1 className="display mt-4 text-[clamp(32px,6.5vw,76px)] leading-[0.9] text-bone">{post.title}</h1>
            </div>
          </div>
        </div>

        <div className="border-b border-bone/10 px-5 py-5 md:px-8">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-5">
            <AuthorLine userId={post.authorId} size={40} />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="tech">{post.createdAt}</span>
              {place && <span className="tech">{formatCoords(place.coordinates[0], place.coordinates[1])}</span>}
            </div>
          </div>
        </div>
      </header>

      <div className="px-5 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* ---------------- body ---------------- */}
          <div>
            {media && (
              <figure className="mb-10">
                <div className="relative aspect-[16/10] overflow-hidden border border-bone/10">
                  {place && <Poster terrain={media.terrain ?? place.terrain} palette={place.palette} className="absolute inset-0" />}
                  {media.kind === 'video' && (
                    <span className="tech absolute bottom-4 left-4 bg-ink/65 px-2.5 py-1.5 text-saffron backdrop-blur-sm">
                      ▶ {media.duration ? `0:${String(media.duration).padStart(2, '0')}` : 'CLIP'} · MUTED
                    </span>
                  )}
                </div>
                <figcaption className="tech mt-3 normal-case tracking-[0.1em]">{media.caption}</figcaption>
              </figure>
            )}

            <div className="max-w-2xl space-y-6">
              {post.body.split('\n\n').map((para, i) => (
                <p key={i} className="text-[17px] leading-relaxed text-bone/85">
                  {para}
                </p>
              ))}
            </div>

            {post.details && (
              <div className="mt-10 grid gap-px border border-bone/10 bg-bone/10 sm:grid-cols-4">
                {(
                  [
                    ['BEST TIME', post.details.bestTime],
                    ['DURATION', post.details.duration],
                    ['DIFFICULTY', post.details.difficulty],
                    ['BUDGET', post.details.budget],
                  ] as const
                )
                  .filter(([, v]) => Boolean(v))
                  .map(([label, value]) => (
                    <div key={label} className="bg-ink px-4 py-5">
                      <div className="tech">{label}</div>
                      <div className="mt-2 text-[15px] text-bone">{value}</div>
                    </div>
                  ))}
              </div>
            )}

            {/* ---------------- actions ---------------- */}
            <div className="mt-10 flex flex-wrap items-center gap-3 border-y border-bone/10 py-5">
              <button
                onClick={() => toggleLike(post.id)}
                aria-pressed={liked}
                data-cursor="LIKE"
                className={`tech flex items-center gap-2 border px-4 py-2.5 transition-colors ${
                  liked ? 'border-vermilion/60 text-vermilion' : 'border-bone/20 text-bone/65 hover:text-bone'
                }`}
              >
                <span aria-hidden="true">{liked ? '♥' : '♡'}</span> {likeCount(post, likedIds)}
              </button>
              <button
                onClick={() => toggleHelpful(post.id)}
                aria-pressed={marked}
                data-cursor="HELPFUL"
                className={`tech flex items-center gap-2 border px-4 py-2.5 transition-colors ${
                  marked ? 'border-teal/60 text-teal' : 'border-bone/20 text-bone/65 hover:text-bone'
                }`}
              >
                ✓ HELPFUL {helpfulCount(post, helpfulIds)}
              </button>
              <button
                onClick={() => toggleSave(post.id)}
                aria-pressed={saved}
                data-cursor="SAVE"
                className={`tech border px-4 py-2.5 transition-colors ${
                  saved ? 'border-saffron/60 text-saffron' : 'border-bone/20 text-bone/65 hover:text-bone'
                }`}
              >
                🔖 {saved ? 'SAVED' : 'SAVE'}
              </button>
              <button
                onClick={share}
                data-cursor="SHARE"
                className="tech border border-bone/20 px-4 py-2.5 text-bone/65 transition-colors hover:text-bone"
              >
                ↗ {copied ? 'LINK COPIED' : 'SHARE'}
              </button>
            </div>

            {/* ---------------- comments ---------------- */}
            <section className="mt-12" aria-label="Comments">
              <h2 className="tech text-saffron">COMMENTS · {post.comments.length}</h2>

              <div className="mt-7 space-y-7">
                {post.comments.map((c) => {
                  const user = userById(c.authorId);
                  return (
                    <div key={c.id} className="flex gap-4">
                      <Avatar userId={c.authorId} size={32} />
                      <div className="min-w-0 flex-1 border-b border-bone/8 pb-6">
                        <div className="flex flex-wrap items-baseline gap-x-3">
                          <Link
                            to={`/community/user/${c.authorId}`}
                            className="text-[13px] text-bone/90 hover:text-saffron"
                          >
                            {user?.handle ?? c.authorId}
                          </Link>
                          {user && <span className="tech">{user.role}</span>}
                          <span className="tech ml-auto">{c.createdAt}</span>
                        </div>
                        <p className="mt-2 text-[15px] leading-relaxed text-bone/80">{c.body}</p>
                      </div>
                    </div>
                  );
                })}
                {!post.comments.length && (
                  <p className="text-[15px] text-muted">No comments yet. Ask the question you actually have.</p>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const text = draft.trim();
                  if (!text) return;
                  addComment(post.id, text);
                  setDraft('');
                }}
                className="mt-9"
              >
                <label className="tech mb-2.5 block" htmlFor="comment">
                  WRITE A COMMENT
                </label>
                <textarea
                  id="comment"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={3}
                  placeholder="Write a comment..."
                  className="w-full resize-none border border-bone/15 bg-transparent p-3.5 text-[15px] leading-relaxed text-bone outline-none placeholder:text-muted focus:border-saffron"
                />
                <div className="mt-3">
                  <ActionButton type="submit" tone="solid" disabled={!draft.trim()}>
                    POST
                  </ActionButton>
                </div>
              </form>
            </section>
          </div>

          {/* ---------------- rail ---------------- */}
          <aside className="space-y-10">
            {badge && (
              <div className="border border-bone/12 p-6">
                <div className="tech text-saffron">BADGE EARNED</div>
                <div className="mt-5 flex items-center gap-5">
                  <BadgeArt badge={badge} size={82} />
                  <div>
                    <div className="display text-[22px] leading-none text-bone">{badge.name}</div>
                    <p className="mt-2 text-[12px] leading-relaxed text-muted">{badge.description}</p>
                  </div>
                </div>
                <Link
                  to="/passport/badges"
                  className="tech mt-5 inline-block border-b border-saffron/50 pb-1 text-saffron hover:text-bone"
                >
                  VIEW BADGE COLLECTION →
                </Link>
              </div>
            )}

            {place && (
              <div className="border border-bone/12 p-6">
                <div className="tech text-teal">DESTINATION</div>
                <div className="display mt-3 text-[30px] leading-none text-bone">{place.name}</div>
                <div className="tech mt-2">{place.state.toUpperCase()}</div>
                <p className="mt-4 text-[13px] leading-relaxed text-muted">{place.tagline}</p>
                <div className="mt-5 flex flex-col gap-2">
                  <Link to={`/destination/${place.id}`} className="tech text-bone/70 hover:text-saffron">
                    → DESTINATION PAGE
                  </Link>
                  <Link to={`/destination/${place.id}/community`} className="tech text-bone/70 hover:text-saffron">
                    → {place.name.toUpperCase()} COMMUNITY
                  </Link>
                </div>
              </div>
            )}

            {author && (
              <div className="border border-bone/12 p-6">
                <div className="tech">CONTRIBUTOR</div>
                <div className="mt-4">
                  <AuthorLine userId={author.id} size={42} />
                </div>
                <p className="mt-4 text-[13px] leading-relaxed text-muted">{author.bio}</p>
                <Link to={`/community/user/${author.id}`} className="tech mt-4 inline-block text-saffron hover:text-bone">
                  VIEW PROFILE →
                </Link>
              </div>
            )}

            <div className="border border-saffron/30 bg-saffron/[0.05] p-6">
              <div className="tech text-saffron">BEEN HERE?</div>
              <p className="mt-3 text-[14px] leading-snug text-bone/80">
                Document it. A verified contribution stamps your passport and puts this place in front of the next
                traveller.
              </p>
              <div className="mt-5">
                <ActionButton tone="solid" onClick={() => openDocument(place?.id)}>
                  DOCUMENT YOUR JOURNEY
                </ActionButton>
              </div>
            </div>
          </aside>
        </div>

        {/* ---------------- more from this place ---------------- */}
        {related.length > 0 && place && (
          <div className="mx-auto max-w-6xl border-t border-bone/10 pt-10">
            <h2 className="tech text-saffron">MORE FROM {place.name.toUpperCase()}</h2>
            <div className="mt-7 grid gap-6 md:grid-cols-3">
              {related.map((r) => (
                <button
                  key={r.id}
                  onClick={() => navigate(`/forum/${r.id}`)}
                  data-cursor="READ"
                  className="group border border-bone/10 p-5 text-left transition-colors hover:border-saffron/40"
                >
                  <div className="tech">{r.category}</div>
                  <div className="display mt-3 text-[20px] leading-tight text-bone transition-colors group-hover:text-saffron">
                    {r.title}
                  </div>
                  <div className="tech mt-4">{userById(r.authorId)?.handle}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
