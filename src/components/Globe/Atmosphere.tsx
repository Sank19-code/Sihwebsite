import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Fresnel atmosphere shell.
 *
 * A back-faced sphere slightly larger than the globe, lit only at its rim.
 * Cheap (one extra sphere, no post-processing) and it gives the globe the
 * "lit from behind" quality that reads as atmosphere rather than as a glow
 * filter. Two tints are mixed vertically: saffron low, teal high.
 */
export function Atmosphere({ radius, intensity = 1 }: { radius: number; intensity?: number }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uWarm: { value: new THREE.Color('#E8833A') },
          uCool: { value: new THREE.Color('#2F6F63') },
          uIntensity: { value: intensity },
        },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vWorld;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vWorld = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uWarm;
          uniform vec3 uCool;
          uniform float uIntensity;
          varying vec3 vNormal;
          varying vec3 vWorld;
          void main() {
            // Rim term: strongest where the shell faces away from the camera.
            float rim = pow(clamp(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 4.5);
            vec3 tint = mix(uWarm, uCool, smoothstep(-0.4, 0.75, vWorld.y));
            gl_FragColor = vec4(tint, clamp(rim, 0.0, 1.0) * uIntensity);
          }
        `,
      }),
    [intensity],
  );

  return (
    <mesh scale={radius * 1.16} material={material}>
      <sphereGeometry args={[1, 48, 48]} />
    </mesh>
  );
}
