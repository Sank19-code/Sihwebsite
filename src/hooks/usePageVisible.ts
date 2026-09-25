import { useEffect, useState } from 'react';

/**
 * True while the tab is visible. The Canvas uses this to switch its frameloop
 * to "never", which stops all WebGL work when the tab is hidden.
 */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState === 'visible',
  );

  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return visible;
}
