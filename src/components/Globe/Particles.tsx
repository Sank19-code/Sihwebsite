import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Dust / star field surrounding the globe.
 *
 * One THREE.Points object with additive blending — a single draw call. The
 * whole field rotates very slowly rather than animating per-particle on the
 * CPU, which keeps this effectively free.
 */
export function Particles({
  count = 900,
  innerRadius = 2.4,
  outerRadius = 7,
  reduced = false,
}: {
  count?: number;
  innerRadius?: number;
  outerRadius?: number;
  reduced?: boolean;
}) {
  const ref = useRef<THREE.Points>(null);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Uniform-ish distribution inside a spherical shell.
      const r = innerRadius + Math.cbrt(Math.random()) * (outerRadius - innerRadius);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = Math.random() < 0.08 ? 0.035 : 0.014 + Math.random() * 0.012;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: new THREE.Color('#F2EEE7') } },
      vertexShader: /* glsl */ `
        attribute float aSize;
        varying float vAlpha;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aSize * 620.0 / -mv.z;
          // Fade the far side of the shell so the globe stays the subject.
          vAlpha = smoothstep(-9.0, 0.0, mv.z) * 0.85;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.0, d) * vAlpha;
          gl_FragColor = vec4(uColor, a);
        }
      `,
    });

    return { geometry: geo, material: mat };
  }, [count, innerRadius, outerRadius]);

  useFrame((_, dt) => {
    if (reduced || !ref.current) return;
    ref.current.rotation.y += dt * 0.012;
    ref.current.rotation.x += dt * 0.004;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}
