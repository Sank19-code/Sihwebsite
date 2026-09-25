import { create } from 'zustand';
import { destinations } from './data/destinations';

export type Phase =
  /** Preloader is still running. */
  | 'boot'
  /** Globe is live, nothing selected. */
  | 'globe'
  /** The "what if you didn't have to go that far" cinematic is playing. */
  | 'transition'
  /** A twin has been revealed; the scroll narrative below is unlocked. */
  | 'revealed';

interface AppState {
  phase: Phase;
  /** id of the selected ForeignDestination, or null on the open globe. */
  selectedId: string | null;
  /** id of the marker currently under the pointer. */
  hoveredId: string | null;
  /** True while the pointer is dragging the globe (drives the cursor label). */
  dragging: boolean;
  /** Label shown inside the custom cursor ring. */
  cursorLabel: string | null;
  /** Scroll progress 0–1, mirrored out of Lenis for the progress rail. */
  scroll: number;
  /** Index of the section currently in view, for "03 / 08". */
  section: number;
  /**
   * True while the home scroll narrative is the active surface. Routed pages
   * paint opaque over the fixed globe layer, so the WebGL frame loop pauses
   * for them instead of rendering behind the wall.
   */
  globeLive: boolean;

  setPhase: (p: Phase) => void;
  select: (id: string) => void;
  clearSelection: () => void;
  setHovered: (id: string | null) => void;
  setDragging: (d: boolean) => void;
  setCursorLabel: (l: string | null) => void;
  setScroll: (s: number) => void;
  setSection: (i: number) => void;
  setGlobeLive: (l: boolean) => void;
}

/**
 * The opening cinematic only belongs to the home scroll. A direct load or
 * refresh on a routed page (/forum, /passport, …) skips the preloader, so
 * the phase starts "globe" there — otherwise the navigation would stay
 * hidden behind the boot opacity with nothing ever releasing it.
 */
const initialPhase = (): Phase =>
  typeof window !== 'undefined' && window.location.pathname !== '/' && window.location.pathname !== '/explore'
    ? 'globe'
    : 'boot';

export const useApp = create<AppState>((set) => ({
  phase: initialPhase(),
  selectedId: null,
  hoveredId: null,
  dragging: false,
  cursorLabel: null,
  scroll: 0,
  section: 0,
  globeLive: true,

  setPhase: (phase) => set({ phase }),
  select: (selectedId) => set({ selectedId, phase: 'transition', hoveredId: null }),
  clearSelection: () => set({ selectedId: null, phase: 'globe' }),
  setHovered: (hoveredId) => set({ hoveredId }),
  setDragging: (dragging) => set({ dragging }),
  setCursorLabel: (cursorLabel) => set({ cursorLabel }),
  setScroll: (scroll) => set({ scroll }),
  setSection: (section) => set({ section }),
  setGlobeLive: (globeLive) => set({ globeLive }),
}));

// Dev-only handle for debugging from the console.
if (import.meta.env.DEV) {
  (window as unknown as { __twintrip?: unknown }).__twintrip = useApp;
}

/** Convenience selector: the currently selected foreign destination object. */
export const selectedDestination = (id: string | null) =>
  id ? destinations.find((d) => d.id === id) ?? null : null;
