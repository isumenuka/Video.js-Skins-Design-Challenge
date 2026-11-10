import { createContext, useContext } from 'react';

/** Options the host passes to the Arcade skin (through `VideoSkin` props) that its inner parts read. */
export interface ArcadeOptions {
  /** An image or short silent video looped on the tube before the first play (for example Mux's animated preview). */
  attractLoop?: string | undefined;
}

export const ArcadeContext = createContext<ArcadeOptions>({});

export const useArcadeOptions = () => useContext(ArcadeContext);
