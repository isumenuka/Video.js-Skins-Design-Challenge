'use client';

import { useEffect, useRef } from 'react';

import type { Cue, Gloss, LinePage } from './lesson-data';
import { cueText, glossText, isLangCode, type LangCode, TRANSLATION_LANGUAGES } from './translations';

/*
 * The site bridge: when the player is framed by a Vocapedia page on its own origin, it tells that page what the reader
 * does (a word collected, a card graded, how far the film has played), so the site can file the words in the reader's
 * real review queue and count their XP. Standalone, or framed by any other origin, it stays silent.
 */

type Grade = 'again' | 'hard' | 'good' | 'easy';

export type BridgeMessage =
  | { type: 'vocapedia:ready'; language: string; words: BridgeWord[] }
  | { type: 'vocapedia:language'; language: string }
  | { type: 'vocapedia:collect'; word: BridgeWordIn }
  | { type: 'vocapedia:grade'; word: BridgeWordIn; grade: Grade }
  | { type: 'vocapedia:progress'; percent: 25 | 50 | 75 | 100 };

/** A lesson word with its translation in every language the player offers. */
export interface BridgeWord {
  lemma: string;
  term: string;
  pos: string;
  ipa: string;
  definition: string;
  translations: Record<string, string>;
}

/** A word as the reader met it: in the language they're reading, with the line it was spoken in. */
export interface BridgeWordIn {
  lemma: string;
  pos: string;
  definition: string;
  language: string;
  term: string;
  line?: { english: string; translated: string };
}

function embedded(): boolean {
  if (typeof window === 'undefined' || window.parent === window) return false;
  try {
    // Reading the parent's origin throws when it's another site: then we have nobody to talk to.
    return window.parent.location.origin === window.location.origin;
  } catch {
    return false;
  }
}

export const isEmbeddedInSite = embedded();

function post(message: BridgeMessage) {
  if (!isEmbeddedInSite) return;
  window.parent.postMessage(message, window.location.origin);
}

export function wordIn(gloss: Gloss, code: LangCode, cue?: Cue): BridgeWordIn {
  return {
    lemma: gloss.lemma,
    pos: gloss.pos,
    definition: gloss.definition,
    language: code.toLowerCase(),
    term: glossText(gloss, code),
    line: cue ? { english: cue.native, translated: cueText(cue, code) } : undefined,
  };
}

export const bridge = {
  collect: (word: BridgeWordIn) => post({ type: 'vocapedia:collect', word }),
  grade: (word: BridgeWordIn, grade: Grade) => post({ type: 'vocapedia:grade', word, grade }),
};

/**
 * Links back to Vocapedia: inside the site they stay in the same tab, as site paths; standalone they open the public
 * site in a new tab.
 */
export function siteLink(url: string): { href: string; target: string; rel?: string } {
  if (!isEmbeddedInSite) return { href: url, target: '_blank', rel: 'noreferrer' };
  const { pathname, search } = new URL(url);
  return { href: `${pathname}${search}`, target: '_top' };
}

/** Announces the lesson, follows the reading language and the film's progress, and answers "play this word". */
export function useSiteBridge({
  pages,
  language,
  currentTime,
  duration,
  playWord,
  setTranslation,
}: {
  pages: LinePage[];
  language: LangCode;
  currentTime: number;
  duration: number;
  playWord: (lemma: string) => void;
  setTranslation: (code: LangCode) => void;
}) {
  // The lesson's words, each once, in the order the film first speaks them.
  useEffect(() => {
    if (!isEmbeddedInSite) return;
    const seen = new Set<string>();
    const words: BridgeWord[] = [];
    for (const page of pages)
      for (const g of page.words) {
        if (seen.has(g.lemma)) continue;
        seen.add(g.lemma);
        const translations: Record<string, string> = {};
        for (const { code } of TRANSLATION_LANGUAGES) translations[code.toLowerCase()] = glossText(g, code);
        words.push({ lemma: g.lemma, term: g.term, pos: g.pos, ipa: g.ipa, definition: g.definition, translations });
      }
    post({ type: 'vocapedia:ready', language: language.toLowerCase(), words });
    // Sent once: the language that follows is reported on its own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages]);

  const firstLanguage = useRef(true);
  useEffect(() => {
    if (firstLanguage.current) {
      firstLanguage.current = false;
      return;
    }
    post({ type: 'vocapedia:language', language: language.toLowerCase() });
  }, [language]);

  // Each quarter of the film reported once per visit, only when reached by playing through, not by seeking.
  const reached = useRef(new Set<number>());
  const previous = useRef(currentTime);
  useEffect(() => {
    const before = previous.current;
    previous.current = currentTime;
    if (!duration || currentTime - before <= 0 || currentTime - before > 2) return;
    for (const percent of [25, 50, 75, 100] as const) {
      const at = percent === 100 ? duration - 1 : (duration * percent) / 100;
      if (before < at && currentTime >= at && !reached.current.has(percent)) {
        reached.current.add(percent);
        post({ type: 'vocapedia:progress', percent });
      }
    }
  }, [currentTime, duration]);

  // The site's word cards ask the film to play a word, or to switch reading language.
  const playRef = useRef(playWord);
  playRef.current = playWord;
  const languageRef = useRef(setTranslation);
  languageRef.current = setTranslation;
  useEffect(() => {
    if (!isEmbeddedInSite) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      const data = event.data as { type?: string; lemma?: unknown; language?: unknown };
      if (data?.type === 'vocapedia:open-word' && typeof data.lemma === 'string') playRef.current(data.lemma);
      if (data?.type === 'vocapedia:set-language' && typeof data.language === 'string') {
        const code = data.language.toUpperCase();
        if (isLangCode(code)) languageRef.current(code);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
}
