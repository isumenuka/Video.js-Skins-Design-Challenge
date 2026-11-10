import { useSyncExternalStore } from 'react';

/*
 * The Arcade skin's own preferences: the curved-CRT shader, sound effects, arcade-style captions, vibration, and the
 * Konami-code 8-bit mode. Kept per device in localStorage (when storage is available — the skin works without it) and
 * shared by every component through one tiny store.
 */
export interface ArcadePrefs {
  crt: boolean;
  sfx: boolean;
  arcadeCaptions: boolean;
  haptics: boolean;
  secret: boolean;
}

const KEY = 'arcade-skin-prefs';
const DEFAULTS: ArcadePrefs = { crt: false, sfx: true, arcadeCaptions: false, haptics: true, secret: false };

function load(): ArcadePrefs {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}') as Partial<ArcadePrefs>;
    return { ...DEFAULTS, ...saved, secret: false }; // the secret is per visit
  } catch {
    return { ...DEFAULTS };
  }
}

let prefs: ArcadePrefs = typeof window === 'undefined' ? { ...DEFAULTS } : load();
const listeners = new Set<() => void>();

export function getArcadePrefs() {
  return prefs;
}

export function setArcadePref<K extends keyof ArcadePrefs>(key: K, value: ArcadePrefs[K]) {
  prefs = { ...prefs, [key]: value };
  try {
    const { secret: _secret, ...stored } = prefs;
    localStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    /* storage unavailable: the choice lasts for this visit */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useArcadePrefs(): ArcadePrefs {
  return useSyncExternalStore(subscribe, getArcadePrefs, getArcadePrefs);
}

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
