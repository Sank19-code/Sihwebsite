import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useApp } from '../../store';
import { useWebGLSupport } from '../../hooks/useWebGLSupport';
import { usePageVisible } from '../../hooks/usePageVisible';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useIsMobile } from '../../hooks/useIsMobile';
import { GlobeScene } from './GlobeScene';
import { GlobeFallback } from './GlobeFallback';

/**
 * Globe host.
 *
 * Fixed behind the whole page: the globe is the backdrop the entire narrative
 * scrolls over, not a widget in a box. It fades out once the reader has moved
 * past the twin reveal so it never competes with the editorial sections.
 *
 * Performance rules enforced here:
 *  - device pixel ratio capped at 1.75
 *  - `frameloop="never"` when the tab is hidden (zero GPU work in background)
 *  - no post-processing pipeline at all
 */
export function Globe() {
  const webgl = useWebGLSupport();
  const visible = usePageVisible();
  const reduced = usePrefersReducedMotion();
  const mobile = useIsMobile();
  const phase = useApp((s) => s.phase);
  const scroll = useApp((s) => s.scroll);
  const globeLive = useApp((s) => s.globeLive);

  // Scroll is read every frame inside the scene; a ref avoids re-rendering
  // the Canvas subtree on every scroll event.
  const scrollRef = useRef(0);
  useEffect(() => {
    scrollRef.current = scroll;
  }, [scroll]);

  // The globe owns the first ~2 screens of the home scroll; beyond that it
  // recedes. On routed pages it is hidden behind the opaque surface and the
  // frame loop is stopped entirely — no rendering behind the wall.
  const fadeStart = 0.16;
  const fadeEnd = 0.3;
  const scrollFade = 1 - Math.min(1, Math.max(0, (scroll - fadeStart) / (fadeEnd - fadeStart))) * 0.92;
  const opacity = phase === 'boot' || !globeLive ? 0 : scrollFade;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        opacity,
        transition: 'opacity 900ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Pointer events only where the globe actually is, so the page below
          stays scrollable and selectable. */}
      <div className={opacity > 0.25 ? 'pointer-events-auto h-full w-full' : 'h-full w-full'}>
        {webgl === false ? (
          <GlobeFallback />
        ) : webgl === true ? (
          <Canvas
            camera={{ position: [0, 0, 8], fov: 42, near: 0.1, far: 100 }}
            dpr={[1, 1.75]}
            frameloop={visible && globeLive ? 'always' : 'never'}
            gl={{ antialias: !mobile, powerPreference: 'high-performance', alpha: true }}
            style={{ touchAction: 'pan-y' }}
          >
            <GlobeScene reduced={reduced} mobile={mobile} scrollRef={scrollRef} />
          </Canvas>
        ) : null}
      </div>
    </div>
  );
}
