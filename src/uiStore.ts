import { create } from 'zustand';

/**
 * Transient UI state that several unrelated surfaces need to poke at:
 * the "Document your journey" flow can be opened from the forum header, a
 * destination page, a post detail, the home page and the passport, so its
 * open/closed state does not belong to any one of them.
 */
interface UiState {
  /** Is the document → verify → badge flow open? */
  documentOpen: boolean;
  /** Pre-selected Indian place id, when opened from a destination. */
  documentPlaceId: string | null;

  openDocument: (placeId?: string | null) => void;
  closeDocument: () => void;
}

export const useUi = create<UiState>((set) => ({
  documentOpen: false,
  documentPlaceId: null,

  openDocument: (placeId = null) => set({ documentOpen: true, documentPlaceId: placeId }),
  closeDocument: () => set({ documentOpen: false, documentPlaceId: null }),
}));
