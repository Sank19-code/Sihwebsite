import { useEffect, useState } from 'react';

/**
 * True on devices with a real pointer. Sections that reveal content on hover
 * fall back to tap-to-select when this is false, so nothing is unreachable on
 * a phone.
 */
export function useHasHover(): boolean {
  const [hasHover, setHasHover] = useState(
    () => typeof window === 'undefined' || window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const onChange = () => setHasHover(mq.matches);
    mq.addEventListener('change', onChange);
    onChange();
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return hasHover;
}
