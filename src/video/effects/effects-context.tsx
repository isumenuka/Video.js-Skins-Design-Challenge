/** @jsxImportSource react */

'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';

export type EffectDirection = 'back' | 'forward';

export type EffectRequest =
  | { kind: 'skip'; direction: EffectDirection; seconds: number }
  | { kind: 'stop' }
  | { kind: 'line'; direction: EffectDirection };

/** The effect on screen. `id` changes on every firing, so the element remounts and its animation replays. */
export type ActiveEffect = EffectRequest & { id: number };

interface EffectsState {
  effect: ActiveEffect | null;
  fire: (request: EffectRequest) => void;
}

/** Repeated skips in the same direction within this window add up (+10, +20, +30), like `SeekIndicator`. */
const STACK_MS = 800;

const EffectsContext = createContext<EffectsState | null>(null);

/** Fires a one-off visual effect over the plate. A no-op outside the provider. */
export function useFireEffect() {
  return useContext(EffectsContext)?.fire ?? noop;
}

export function useActiveEffect() {
  return useContext(EffectsContext)?.effect ?? null;
}

function noop() {}

export function EffectsProvider({ children }: { children: ReactNode }) {
  const [effect, setEffect] = useState<ActiveEffect | null>(null);
  const counter = useRef(0);
  const lastSkip = useRef<{ direction: EffectDirection; total: number; at: number; id: number } | null>(null);

  const fire = useCallback((request: EffectRequest) => {
    if (request.kind === 'skip') {
      const now = performance.now();
      const last = lastSkip.current;
      const stacking = last && last.direction === request.direction && now - last.at < STACK_MS;
      // A stacked skip keeps the same id: the corner stays folded open and only its number counts up.
      if (!stacking) counter.current += 1;
      const id = stacking ? last.id : counter.current;
      const total = stacking ? last.total + request.seconds : request.seconds;
      lastSkip.current = { direction: request.direction, total, at: now, id };
      setEffect({ ...request, seconds: total, id });
    } else {
      counter.current += 1;
      const id = counter.current;
      lastSkip.current = null;
      setEffect({ ...request, id });
    }
  }, []);

  const value = useMemo(() => ({ effect, fire }), [effect, fire]);
  return <EffectsContext.Provider value={value}>{children}</EffectsContext.Provider>;
}
