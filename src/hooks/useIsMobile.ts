import { useEffect, useState } from 'react';

/** Coarse breakpoint hook used to drop particle counts and recompose layout. */
export function useIsMobile(breakpoint = 768): boolean {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < breakpoint,
  );

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);

  return mobile;
}
