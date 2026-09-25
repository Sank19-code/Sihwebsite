import { useEffect, useState } from 'react';

/**
 * Detects whether a WebGL context can actually be created.
 *
 * Returns null while probing so the caller can avoid rendering the fallback
 * for a frame. When false, <Globe> swaps in the CSS/SVG globe.
 */
export function useWebGLSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
      setSupported(Boolean(gl));
      // Release the probe context immediately.
      const lose = (gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context');
      lose?.loseContext();
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}
