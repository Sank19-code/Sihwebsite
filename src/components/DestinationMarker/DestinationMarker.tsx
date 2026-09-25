import { useCallback, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { latLonToVector3 } from '../../lib/geo';
import { dragState, DRAG_THRESHOLD } from '../Globe/dragState';
import type { Coordinates } from '../../data/types';

/**
 * A single destination marker on the globe.
 *
 * Structure, from the sphere outwards:
 *   - a solid core dot
 *   - a billboarded ring that pulses continuously
 *   - a transparent hit sphere, several times larger, so hovering is forgiving
 *
 * Markers on the far side of the globe fade out and stop accepting pointer
 * events, so you never click something hidden behind the planet.
 */
export interface MarkerProps {
  id: string;
  coordinates: Coordinates;
  radius: number;
  color: string;
  /** Muted markers (the Indian places layer) are smaller and not clickable. */
  passive?: boolean;
  active?: boolean;
  dimmed?: boolean;
  reduced?: boolean;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
}

const _world = new THREE.Vector3();
const _normal = new THREE.Vector3();
const _toMarker = new THREE.Vector3();

export function DestinationMarker({
  id,
  coordinates,
  radius,
  color,
  passive = false,
  active = false,
  dimmed = false,
  reduced = false,
  onHover,
  onSelect,
}: MarkerProps) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const facing = useRef(1);

  const position = latLonToVector3(coordinates[0], coordinates[1], radius * 1.01);
  const base = passive ? 0.022 : 0.036;

  useFrame(({ camera, clock }, dt) => {
    if (!group.current) return;

    // --- Visibility: is this marker on the near side of the globe? ---
    // Scratch vectors are module-level so this runs allocation-free every
    // frame for every marker.
    group.current.getWorldPosition(_world);
    _normal.copy(_world).normalize();
    _toMarker.copy(_world).sub(camera.position).normalize();
    // dot ≈ -1 means the marker faces us head on; above -0.1 it has turned
    // far enough round the limb to count as hidden.
    const dot = _toMarker.dot(_normal);
    const targetFacing = dot < -0.1 ? 1 : 0;
    facing.current = THREE.MathUtils.lerp(facing.current, targetFacing, 1 - Math.exp(-9 * dt));

    // Billboard the flat discs toward the camera so they stay round at the
    // limb of the globe instead of collapsing to a line.
    //
    // lookAt() is used rather than copying the camera quaternion, because
    // these meshes are nested inside the rotating globe group — a raw copy
    // would ignore the parent's rotation and skew once the globe turns.
    if (ring.current) ring.current.lookAt(camera.position);
    if (halo.current) halo.current.lookAt(camera.position);
    if (core.current) core.current.lookAt(camera.position);

    const visible = facing.current;
    const dimFactor = dimmed && !active ? 0.18 : 1;

    // --- Core dot: grows on hover and when selected ---
    const targetScale = (hovered ? 1.9 : active ? 2.3 : 1) * (0.35 + 0.65 * visible);
    if (core.current) {
      core.current.scale.setScalar(
        THREE.MathUtils.lerp(core.current.scale.x, targetScale, 1 - Math.exp(-10 * dt)),
      );
      const m = core.current.material as THREE.MeshBasicMaterial;
      m.opacity = visible * dimFactor;
    }

    // --- Pulse ring: continuous breathing, faster and wider when hovered ---
    if (ring.current) {
      const t = clock.elapsedTime;
      const speed = hovered || active ? 1.6 : 0.85;
      const pulse = reduced ? 0.5 : (Math.sin(t * speed + position.x * 4) + 1) / 2;
      const spread = hovered || active ? 5.2 : 3.1;
      ring.current.scale.setScalar((1.4 + pulse * spread) * (0.4 + 0.6 * visible));
      const m = ring.current.material as THREE.MeshBasicMaterial;
      m.opacity = (1 - pulse) * 0.55 * visible * dimFactor * (passive ? 0.35 : 1);
    }

    // --- Soft halo behind the dot ---
    if (halo.current) {
      const m = halo.current.material as THREE.MeshBasicMaterial;
      m.opacity = (hovered || active ? 0.4 : 0.14) * visible * dimFactor;
      halo.current.scale.setScalar(hovered || active ? 5.5 : 3.4);
    }
  });

  /**
   * Custom raycast for the hit target.
   *
   * A marker that has rotated behind the globe removes itself from the
   * intersection list entirely. Guarding inside the event handlers is not
   * enough: a far-side marker would still be *hit*, and since it bails out
   * without calling stopPropagation it would quietly shadow the marker the
   * pointer is actually over. This also keeps the raycast cheap.
   */
  const hitRaycast = useCallback(function (
    this: THREE.Mesh,
    raycaster: THREE.Raycaster,
    intersects: THREE.Intersection[],
  ) {
    if (facing.current < 0.5) return;
    THREE.Mesh.prototype.raycast.call(this, raycaster, intersects);
  },
  []);

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    onHover?.(id);
  };
  const out = () => {
    setHovered(false);
    onHover?.(null);
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    // Ignore the click that ends a spin — otherwise letting go of a drag over
    // a marker would launch the cinematic you did not ask for.
    if (dragState.moved > DRAG_THRESHOLD) return;
    e.stopPropagation();
    onSelect?.(id);
  };

  return (
    <group ref={group} position={position}>
      <mesh ref={halo} renderOrder={10}>
        <circleGeometry args={[base * 0.55, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <mesh ref={ring} renderOrder={11}>
        <ringGeometry args={[base * 0.44, base * 0.52, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} depthTest={false} side={THREE.DoubleSide} />
      </mesh>

      <mesh ref={core} renderOrder={12}>
        <circleGeometry args={[base * 0.34, 18]} />
        <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} depthTest={false} />
      </mesh>

      {/* Generous hit target, several times the size of the dot.
          NOTE: it must stay `visible`, because three.js skips raycasting
          against invisible objects. It is hidden with colorWrite instead. */}
      {!passive && (
        <mesh onPointerOver={over} onPointerOut={out} onClick={click} raycast={hitRaycast}>
          <sphereGeometry args={[base * 2.6, 8, 8]} />
          <meshBasicMaterial colorWrite={false} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
