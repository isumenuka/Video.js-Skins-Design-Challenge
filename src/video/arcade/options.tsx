/** @jsxImportSource react */

import { Dialog } from '@videojs/react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { arcadeText, useArcadeTranslator } from './i18n';
import { type ArcadePrefs, setArcadePref, useArcadePrefs } from './prefs';
import { usePlayerRoot } from './use-player-root';

/* Open state, shared so the Settings menu's "Arcade" item can open the card on the screen. */
let open = false;
const listeners = new Set<() => void>();
const setOpen = (value: boolean) => {
  open = value;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Opens the Arcade options card (called from Settings → Arcade). */
export const openArcadeOptions = () => setOpen(true);

const ICONS: Record<string, string> = {
  crt: 'M3 4h14v10H3zM7 17h6',
  sfx: 'M3 8h3l4-3v10l-4-3H3zM13 7a4 4 0 0 1 0 6M15.5 4.5a8 8 0 0 1 0 11',
  arcadeCaptions: 'M2 4h16v10H8l-4 3v-3H2zM5 8h6M5 11h9',
  haptics: 'M7 3h6v14H7zM4 6v8M16 6v8',
};

/**
 * Arcade options: a card on the screen, like Level select, with a big switch for each of the skin's own options —
 * curved CRT, sound effects, arcade captions and vibration. A Video.js Dialog (focus trapped, Esc closes); each switch
 * is a real `role="switch"` button with a translated name.
 */
export function ArcadeOptions() {
  const isOpen = useSyncExternalStore(
    subscribe,
    () => open,
    () => false,
  );
  const prefs = useArcadePrefs();
  const t = useArcadeTranslator();
  const anchor = useRef<HTMLSpanElement>(null);
  const root = usePlayerRoot(anchor);
  const [, force] = useState(0);

  // Back to the Settings button when the card closes (the menu item that opened it is gone by then).
  const wasOpen = useRef(false);
  useEffect(() => {
    if (isOpen) {
      wasOpen.current = true;
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    // After the Dialog's own focus restore (to the menu item, which is hidden by then).
    const timer = window.setTimeout(
      () => root?.querySelector<HTMLElement>('.video-controls-bottom button[aria-haspopup="menu"]')?.focus(),
      60,
    );
    return () => clearTimeout(timer);
  }, [isOpen, root]);

  const options: [keyof ArcadePrefs, string][] = [
    ['crt', t(arcadeText.crt)],
    ['sfx', t(arcadeText.soundFx)],
    ['arcadeCaptions', t(arcadeText.captionStyle)],
    ['haptics', t(arcadeText.haptics)],
  ];

  return (
    <>
      <span ref={anchor} hidden />
      {root &&
        createPortal(
          <Dialog.Root
            open={isOpen}
            onOpenChange={(value) => {
              setOpen(value);
              force((n) => n + 1);
            }}
          >
            <Dialog.Backdrop className={'media-dialog-backdrop arc-sheet-backdrop'} />
            <Dialog.Popup className={'media-dialog-popup arc-sheet arc-options'}>
              <Dialog.Title className={'arc-sheet-title'}>{t(arcadeText.arcade)}</Dialog.Title>
              <div className={'arc-options-grid'}>
                {options.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="switch"
                    aria-checked={Boolean(prefs[key])}
                    className={'arc-option'}
                    onClick={() => setArcadePref(key, !prefs[key])}
                  >
                    <svg
                      className={'arc-option-icon'}
                      viewBox="0 0 20 20"
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d={ICONS[key]} />
                    </svg>
                    <span className={'arc-option-label'}>{label}</span>
                    <span className={'arc-option-switch'} aria-hidden="true">
                      <span className={'arc-option-knob'} />
                    </span>
                  </button>
                ))}
              </div>
              <Dialog.Close
                render={
                  <button type="button" className={'media-button arc-sheet-close'} aria-label={t(arcadeText.close)} />
                }
              >
                <svg
                  className={'media-button-icon'}
                  viewBox="0 0 20 20"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M5 5l10 10M15 5 5 15" />
                </svg>
              </Dialog.Close>
            </Dialog.Popup>
          </Dialog.Root>,
          root,
        )}
    </>
  );
}
