import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Latitude / longitude wireframe.
 *
 * Built once as a single LineSegments geometry (one draw call) rather than
 * dozens of separate line objects. The globe reads as a drawn instrument,
 * not a textured planet — which is the whole point of the art direction.
 */
export function Graticule({
  radius,
  color = '#F2EEE7',
  opacity = 0.16,
  latStep = 15,
  lonStep = 15,
  segments = 128,
}: {
  radius: number;
  color?: string;
  opacity?: number;
  latStep?: number;
  lonStep?: number;
  segments?: number;
}) {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const push = (v: THREE.Vector3) => positions.push(v.x, v.y, v.z);

    const point = (lat: number, lon: number) => {
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon + 180);
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta),
      );
    };

    // Parallels
    for (let lat = -90 + latStep; lat < 90; lat += latStep) {
      for (let i = 0; i < segments; i++) {
        push(point(lat, (i / segments) * 360 - 180));
        push(point(lat, ((i + 1) / segments) * 360 - 180));
      }
    }

    // Meridians
    for (let lon = -180; lon < 180; lon += lonStep) {
      for (let i = 0; i < segments; i++) {
        push(point((i / segments) * 180 - 90, lon));
        push(point(((i + 1) / segments) * 180 - 90, lon));
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [radius, latStep, lonStep, segments]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </lineSegments>
  );
}
