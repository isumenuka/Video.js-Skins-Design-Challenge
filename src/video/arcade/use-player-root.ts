import { type RefObject, useEffect, useState } from 'react';

/**
 * The player container (`.media-skin`) an element sits in, found after mount. Dialogs portal their backdrop and card
 * here, so they cover the screen instead of the control panel they're opened from, and stay inside the player.
 */
export function usePlayerRoot(anchor: RefObject<HTMLElement | null>) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setRoot(anchor.current?.closest<HTMLElement>('.media-skin') ?? null);
  }, [anchor]);
  return root;
}
