/**
 * Shared drag bookkeeping for the globe.
 *
 * The globe is both draggable and clickable, so a marker must be able to tell
 * "the user tapped me" from "the user finished a spin that happened to end on
 * me". GlobeScene accumulates the pointer travel of the current gesture here
 * and DestinationMarker ignores clicks that came at the end of a real drag.
 */
export const dragState = {
  /** Total pointer travel, in pixels, since the last pointerdown. */
  moved: 0,
};

/** Travel beyond this many pixels counts as a drag, not a click. */
export const DRAG_THRESHOLD = 6;
