import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';
import { destinations } from '../../data/destinations';
import { indianPlaces, placeById } from '../../data/indianPlaces';
import { badgeForPlace } from '../../data/badges';
import { useCommunity, placeActivity, displayScale } from '../../communityStore';
import { navigate } from '../../router';
import { latLonToVector3, formatCoords } from '../../lib/geo';
import { useApp } from '../../store';
import { T } from '../../animations/transitions';
import { dragState } from './dragState';
import { Graticule } from './Graticule';
import { Atmosphere } from './Atmosphere';
import { Particles } from './Particles';
import { DestinationMarker } from '../DestinationMarker/DestinationMarker';

const RADIUS = 1.55;

/**
 * ------------------------------------------------------------------
 * GLOBE CAMERA + INTERACTION RIG
 * ------------------------------------------------------------------
 * One mutable `rig` object holds both the *target* orientation and the
 * *current* orientation. Everything (drag, inertia, auto-rotation, scroll,
 * GSAP camera flights) writes to the targets; a single damped integrator in
 * useFrame moves the current values toward them.
 *
 * That is what makes every input feel like the same instrument — nothing
 * snaps, and two inputs at once blend instead of fighting.
 */
interface Rig {
  rx: number;
  ry: number;
  targetRx: number;
  targetRy: number;
  /** Drag inertia, decayed every frame. */
  vx: number;
  vy: number;
  camZ: number;
  targetCamZ: number;
  /** Normalised pointer, -1..1, for camera parallax. */
  px: number;
  py: number;
  dragging: boolean;
  lastX: number;
  lastY: number;
}

export function GlobeScene({
  reduced,
  mobile,
  scrollRef,
}: {
  reduced: boolean;
  mobile: boolean;
  scrollRef: React.MutableRefObject<number>;
}) {
  const { camera, gl, size } = useThree();
  const globe = useRef<THREE.Group>(null);

  const phase = useApp((s) => s.phase);
  const selectedId = useApp((s) => s.selectedId);
  const hoveredId = useApp((s) => s.hoveredId);
  const setHovered = useApp((s) => s.setHovered);
  const select = useApp((s) => s.select);
  const setDragging = useApp((s) => s.setDragging);
  const setCursorLabel = useApp((s) => s.setCursorLabel);

  /**
   * Camera distance that frames the globe on any viewport.
   *
   * The perspective camera's FOV is vertical, so on a tall phone screen the
   * globe would overflow horizontally. Pulling the camera back in proportion
   * to the inverse aspect ratio keeps the same composition from 1440px down
   * to 360px without changing the FOV (which would warp the perspective).
   */
  const baseZ = useMemo(() => {
    const aspect = size.width / Math.max(1, size.height);
    const fit = aspect < 1 ? Math.min(1.85, 1 / aspect) : 1;
    return (mobile ? 6.6 : 6.2) * fit;
  }, [size.width, size.height, mobile]);

  /**
   * On portrait screens the hero copy owns the lower third, so aim the camera
   * slightly below the globe's centre to lift the globe up in frame.
   */
  const lookY = useMemo(
    () => (size.width / Math.max(1, size.height) < 0.85 ? -0.62 : 0),
    [size.width, size.height],
  );

  const rig = useRef<Rig>({
    rx: 0.25,
    ry: -0.6,
    targetRx: 0.18,
    targetRy: -0.6,
    vx: 0,
    vy: 0,
    camZ: 6.2,
    targetCamZ: 6.2,
    px: 0,
    py: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
  });

  const hovered = useMemo(() => destinations.find((d) => d.id === hoveredId) ?? null, [hoveredId]);

  /* Re-frame when the viewport changes, unless a destination is focused. */
  useEffect(() => {
    if (selectedId) return;
    rig.current.targetCamZ = baseZ;
  }, [baseZ, selectedId]);

  /* ---------------- Pointer: drag to rotate, move for parallax ------------- */
  useEffect(() => {
    const el = gl.domElement;
    const r = rig.current;

    const onDown = (e: PointerEvent) => {
      r.dragging = true;
      r.lastX = e.clientX;
      r.lastY = e.clientY;
      dragState.moved = 0;
      setDragging(true);
      el.setPointerCapture?.(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      r.px = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      r.py = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      if (!r.dragging) return;
      const dx = e.clientX - r.lastX;
      const dy = e.clientY - r.lastY;
      r.lastX = e.clientX;
      r.lastY = e.clientY;
      dragState.moved += Math.abs(dx) + Math.abs(dy);

      r.targetRy += dx * 0.005;
      r.targetRx = THREE.MathUtils.clamp(r.targetRx + dy * 0.004, -1.0, 1.0);
      // Feed inertia so the globe keeps coasting when you let go.
      r.vy = dx * 0.0016;
      r.vx = dy * 0.0012;
    };

    const onUp = (e: PointerEvent) => {
      r.dragging = false;
      setDragging(false);
      el.releasePointerCapture?.(e.pointerId);
    };

    const onLeave = () => {
      r.px = 0;
      r.py = 0;
    };

    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [gl, setDragging]);

  /* ---------------- Pinch / wheel zoom on the globe ------------------------ */
  useEffect(() => {
    const el = gl.domElement;
    const r = rig.current;
    let pinchStart = 0;
    let camStart = 0;

    // Ctrl+wheel is the trackpad pinch gesture; plain wheel stays page scroll.
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      r.targetCamZ = THREE.MathUtils.clamp(r.targetCamZ + e.deltaY * 0.01, 2.6, 16);
    };

    const touches = new Map<number, PointerEvent>();
    const onDown = (e: PointerEvent) => {
      touches.set(e.pointerId, e);
      if (touches.size === 2) {
        const [a, b] = [...touches.values()];
        pinchStart = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        camStart = r.targetCamZ;
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!touches.has(e.pointerId)) return;
      touches.set(e.pointerId, e);
      if (touches.size === 2) {
        const [a, b] = [...touches.values()];
        const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        if (pinchStart > 0) {
          r.targetCamZ = THREE.MathUtils.clamp(camStart * (pinchStart / d), 2.6, 16);
        }
      }
    };
    const onUp = (e: PointerEvent) => {
      touches.delete(e.pointerId);
      pinchStart = 0;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [gl]);

  /* ---------------- Camera flight on selection (GSAP) ---------------------- */
  useEffect(() => {
    const r = rig.current;
    const dest = destinations.find((d) => d.id === selectedId);

    if (!dest) {
      // Return to the world view.
      gsap.to(r, {
        targetCamZ: baseZ,
        duration: reduced ? 0.01 : T.cameraReturn,
        ease: T.easeInOut,
        overwrite: true,
      });
      return;
    }

    // Solve the globe rotation that brings this marker to face the camera.
    const p = latLonToVector3(dest.coordinates[0], dest.coordinates[1], 1);
    const h = Math.hypot(p.x, p.z);
    const rx = Math.atan2(p.y, h);
    let ry = -Math.atan2(p.x, p.z);
    // Unwrap so the globe always takes the short way round.
    ry += Math.round((r.targetRy - ry) / (Math.PI * 2)) * Math.PI * 2;

    gsap.to(r, {
      targetRx: rx,
      targetRy: ry,
      targetCamZ: baseZ * 0.58,
      duration: reduced ? 0.01 : T.cameraFly,
      ease: T.easeInOut,
      overwrite: true,
    });
  }, [selectedId, reduced, baseZ]);

  /* ---------------- The single damped integrator --------------------------- */
  useFrame((_, delta) => {
    const r = rig.current;
    const dt = Math.min(delta, 1 / 30);
    const g = globe.current;
    if (!g) return;

    // Auto-rotation: slows when a marker is hovered, stops when one is chosen.
    if (!r.dragging && !selectedId && phase !== 'transition') {
      const speed = hoveredId ? 0.012 : reduced ? 0.01 : 0.045;
      r.targetRy += speed * dt * 60 * 0.016;
    }

    // Drag inertia.
    if (!r.dragging) {
      r.targetRy += r.vy;
      r.targetRx = THREE.MathUtils.clamp(r.targetRx + r.vx, -1.0, 1.0);
      r.vy *= 0.94;
      r.vx *= 0.94;
    }

    const k = 1 - Math.exp(-(reduced ? 20 : 4.2) * dt);
    r.rx += (r.targetRx - r.rx) * k;
    r.ry += (r.targetRy - r.ry) * k;
    g.rotation.set(r.rx, r.ry, 0);

    // Scroll pushes the camera back a little as the story begins.
    const scrollPush = scrollRef.current * 1.6;
    r.camZ += (r.targetCamZ + scrollPush - r.camZ) * (1 - Math.exp(-3.2 * dt));

    // Pointer parallax: the camera drifts, the globe does not tilt.
    const par = reduced ? 0 : 1;
    const tx = r.px * 0.34 * par;
    const ty = -r.py * 0.2 * par;
    camera.position.x += (tx - camera.position.x) * (1 - Math.exp(-2.6 * dt));
    camera.position.y += (ty - camera.position.y) * (1 - Math.exp(-2.6 * dt));
    camera.position.z = r.camZ;
    camera.lookAt(0, lookY, 0);
  });

  /* ---------------- Cursor labels ----------------------------------------- */
  useEffect(() => {
    if (hoveredId) setCursorLabel('EXPLORE');
    else setCursorLabel(null);
  }, [hoveredId, setCursorLabel]);

  const dimmed = Boolean(selectedId);
  const twin = hovered ? placeById(hovered.twin) : null;

  // Community + passport data for the hover card: the globe shows not only
  // where a place is, but how discovered it already is.
  const posts = useCommunity((s) => s.posts);
  const unlocked = useCommunity((s) => s.unlockedBadgeIds);
  const twinActivity = hovered && twin ? placeActivity(posts, twin.id) : null;
  const twinBadge = hovered && twin ? badgeForPlace(twin.id) : null;
  const twinUnlocked = twinBadge ? unlocked.includes(twinBadge.id) : false;

  return (
    <>
      {/* Star / dust shell */}
      <Particles count={mobile ? 420 : 900} reduced={reduced} />

      <group ref={globe}>
        {/* The planet body: near-black, so the graticule and markers read. */}
        <mesh>
          <sphereGeometry args={[RADIUS, 64, 64]} />
          <meshBasicMaterial color="#07070A" />
        </mesh>

        {/* A faint inner shell gives the surface a sense of depth. */}
        <mesh scale={0.999}>
          <sphereGeometry args={[RADIUS, 48, 48]} />
          <meshBasicMaterial
            color="#1A2430"
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>

        <Graticule radius={RADIUS} opacity={dimmed ? 0.05 : 0.09} />
        <Graticule radius={RADIUS} latStep={45} lonStep={45} opacity={dimmed ? 0.07 : 0.17} />

        {/* Indian places: a quiet teal layer, present from the first frame.
            They are not clickable here — section 10 is their moment. */}
        {indianPlaces.map((p) => (
          <DestinationMarker
            key={p.id}
            id={p.id}
            coordinates={p.coordinates}
            radius={RADIUS}
            color="#2F6F63"
            passive
            reduced={reduced}
          />
        ))}

        {/* Dream destinations: the interactive layer. */}
        {destinations.map((d) => (
          <DestinationMarker
            key={d.id}
            id={d.id}
            coordinates={d.coordinates}
            radius={RADIUS}
            color="#E8833A"
            active={selectedId === d.id}
            dimmed={dimmed}
            reduced={reduced}
            onHover={setHovered}
            onSelect={select}
          />
        ))}

        {/* Hover card, anchored to the marker in 3D and drawn in the DOM. */}
        {hovered && !selectedId && (
          <Html
            position={latLonToVector3(hovered.coordinates[0], hovered.coordinates[1], RADIUS * 1.05)}
            style={{ pointerEvents: 'none' }}
            zIndexRange={[40, 0]}
            center={false}
          >
            <div className="w-[230px] -translate-y-1/2 translate-x-4 animate-[fadeIn_.35s_ease-out] border-l border-saffron/60 bg-ink/70 px-4 py-3 backdrop-blur-md">
              <div className="tech mb-2 text-saffron">{formatCoords(hovered.coordinates[0], hovered.coordinates[1])}</div>
              <div className="display text-[26px] leading-none text-bone">{hovered.name}</div>
              <div className="tech mt-1.5">{hovered.country}</div>
              <div className="my-3 h-px w-full bg-bone/15" />
              <div className="text-[12px] leading-snug text-muted">{hovered.tagline}</div>
              {twin && (
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="tech text-teal">TWIN · {twin.name}</span>
                  <span className="font-mono text-[13px] text-bone">{hovered.match}%</span>
                </div>
              )}

              {/* The community pulse: how discovered is this place already? */}
              {twin && twinActivity && (
                <div className="mt-4 space-y-2 border-t border-bone/10 pt-3">
                  <div className="grid grid-cols-3 gap-2">
                    <GlobeCardStat value={displayScale(twinActivity.stories)} label="STORIES" />
                    <GlobeCardStat value={displayScale(twinActivity.verified, 7)} label="VERIFIED" accent />
                    <GlobeCardStat value={displayScale(twinActivity.contributors, 4)} label="LOCALS" />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="tech text-bone/40">DEMO DATA</span>
                    {twinBadge &&
                      (twinUnlocked ? (
                        <span className="tech text-teal">✓ {twinBadge.name.toUpperCase()}</span>
                      ) : (
                        <span className="tech text-bone/40">VISIT TO UNLOCK {twinBadge.name.toUpperCase()}</span>
                      ))}
                  </div>
                  {/* The card is otherwise pointer-passive; this one control opens
                      the destination hub — match, story, community, passport. */}
                  <button
                    onClick={() => navigate(`/destination/${twin.id}`)}
                    data-cursor="GO"
                    style={{ pointerEvents: 'auto' }}
                    className="tech mt-1 flex w-full items-center justify-between border border-saffron/40 px-2.5 py-1.5 text-saffron transition-colors hover:bg-saffron hover:text-ink"
                  >
                    EXPLORE <span aria-hidden="true">→</span>
                  </button>
                </div>
              )}
            </div>
          </Html>
        )}
      </group>

      <Atmosphere radius={RADIUS} intensity={dimmed ? 0.35 : 0.55} />
    </>
  );
}

/** One cell of the hover card's community pulse row. */
function GlobeCardStat({ value, label, accent = false }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className="min-w-0">
      <div className={`font-mono text-[12px] leading-none ${accent ? 'text-teal' : 'text-bone'}`}>
        {value.toLocaleString('en-IN')}
      </div>
      <div className="tech mt-1.5 text-[7px] text-bone/40">{label}</div>
    </div>
  );
}
