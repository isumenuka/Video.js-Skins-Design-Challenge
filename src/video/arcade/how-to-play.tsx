/** @jsxImportSource react */

import { muteText, playText } from '@videojs/core/i18n/text/buttons';
import { enableText as captionsText } from '@videojs/core/i18n/text/captions';
import { enterText as fullscreenText } from '@videojs/core/i18n/text/fullscreen';
import { enterText as pipText } from '@videojs/core/i18n/text/pip';
import { seekText } from '@videojs/core/i18n/text/slider';
import { labelText as volumeText } from '@videojs/core/i18n/text/volume';
import { Dialog } from '@videojs/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/resolve-class-name';

import { ButtonTooltip } from '../shared/tooltip';
import { arcadeText, useArcadeTranslator } from './i18n';
import { usePlayerRoot } from './use-player-root';

function HelpIcon() {
  return (
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
      <path d="M7 7a3 3 0 1 1 4.5 2.6c-1 .6-1.5 1.2-1.5 2.4" />
      <path d="M10 15v1" strokeLinecap="square" />
    </svg>
  );
}

/**
 * How to play: an arcade "HOW TO PLAY" card on the screen listing the joysticks, the buttons and the keys. Opens from
 * the "?" button or the ? key; it's a Video.js Dialog (focus trapped, Esc closes, focus returns). Every action is named
 * with Video.js's own translated labels.
 */
export function HowToPlay() {
  const t = useArcadeTranslator();
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLSpanElement>(null);
  const root = usePlayerRoot(anchor);

  // The ? key opens it from anywhere in the player.
  useEffect(() => {
    const root = anchor.current?.closest<HTMLElement>('.media-skin');
    if (!root) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '?' || e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.target as HTMLElement).closest('input, textarea, [contenteditable]')) return;
      e.preventDefault();
      setOpen(true);
    };
    root.addEventListener('keydown', onKey);
    return () => root.removeEventListener('keydown', onKey);
  }, []);

  const rows: [string, string][] = [
    ['Space / K', t(playText)],
    ['← →', t(seekText)],
    ['↑ ↓', t(volumeText)],
    ['M', t(muteText)],
    ['C', t(captionsText)],
    ['F', t(fullscreenText)],
    ['I', t(pipText)],
    ['?', t(arcadeText.howToPlay)],
    ['↑↑↓↓←→←→ B A', '???'],
  ];

  return (
    <>
      <span ref={anchor} hidden />
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <ButtonTooltip label={t(arcadeText.howToPlay)}>
          <Dialog.Trigger
            render={
              <button
                type="button"
                className={cn('media-button', 'arc-btn-help')}
                aria-label={t(arcadeText.howToPlay)}
                aria-keyshortcuts="?"
              />
            }
          >
            <HelpIcon />
          </Dialog.Trigger>
        </ButtonTooltip>
        {root &&
          createPortal(
            <>
              <Dialog.Backdrop className={'media-dialog-backdrop arc-sheet-backdrop'} />
              <Dialog.Popup className={'media-dialog-popup arc-sheet arc-howto'}>
                <Dialog.Title className={'arc-sheet-title'}>{t(arcadeText.howToPlay)}</Dialog.Title>
                <div className={'arc-howto-cols'}>
                  <section>
                    <h3 className={'arc-howto-head'}>{t(arcadeText.sticks)}</h3>
                    <dl className={'arc-howto-list'}>
                      <div>
                        <dt>
                          <span className={'arc-howto-stick'} aria-hidden="true">
                            ◀ ▶
                          </span>
                        </dt>
                        <dd>{t(seekText)}</dd>
                      </div>
                      <div>
                        <dt>
                          <span className={'arc-howto-stick'} aria-hidden="true">
                            ▲ ▼
                          </span>
                        </dt>
                        <dd>{t(volumeText)}</dd>
                      </div>
                    </dl>
                  </section>
                  <section>
                    <h3 className={'arc-howto-head'}>{t(arcadeText.keys)}</h3>
                    <dl className={'arc-howto-list'}>
                      {rows.map(([key, action]) => (
                        <div key={key}>
                          <dt>
                            <kbd>{key}</kbd>
                          </dt>
                          <dd>{action}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
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
            </>,
            root,
          )}
      </Dialog.Root>
    </>
  );
}
