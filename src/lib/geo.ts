import * as THREE from 'three';

/**
 * Convert geographic coordinates to a point on a sphere of the given radius.
 *
 * Longitude is offset by -90° so that the prime meridian lands on +Z, which is
 * the orientation the graticule mesh is built in.
 */
export function latLonToVector3(lat: number, lon: number, radius = 1): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/** Format a coordinate pair as the monospaced metadata used across the UI. */
export function formatCoords(lat: number, lon: number): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${ns}  ${Math.abs(lon).toFixed(4)}° ${ew}`;
}

/** Linear interpolation with a frame-rate independent damping factor. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
}

/** Map a 2D projection of India used by the stylized itinerary/discovery maps. */
export function projectIndia(lat: number, lon: number, w: number, h: number): [number, number] {
  // Simple equirectangular fit over the Indian bounding box.
  const LON_MIN = 67,
    LON_MAX = 98,
    LAT_MIN = 6,
    LAT_MAX = 36;
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * w;
  const y = (1 - (lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * h;
  return [x, y];
}
