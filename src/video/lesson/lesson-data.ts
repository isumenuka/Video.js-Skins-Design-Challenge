/**
 * The lesson the Language Lab skin teaches: the dialogue of "Sintel" in English, with the official French subtitles.
 * Sintel © copyright Blender Foundation | durian.blender.org — licensed CC BY 3.0. Subtitles from durian.blender.org.
 */

export interface Cue {
  id: number;
  start: number;
  end: number;
  /** The line as spoken (the language being learned). */
  native: string;
  /** The learner's language. */
  translation: string;
}

export interface Gloss {
  /** Headword shown in the popover and the vocabulary list. */
  term: string;
  /** Translation into the learner's language. */
  translation: string;
  /** Part of speech, abbreviated. */
  pos: string;
}

export interface Lesson {
  title: string;
  nativeLanguage: { code: string; name: string };
  translationLanguage: { code: string; name: string };
  cues: Cue[];
  /** Keyed by the lowercased word form as it appears in a line. */
  glossary: Record<string, Gloss>;
}

const t = (time: string) => {
  const [h, m, s] = time.split(':');
  return Number(h) * 3600 + Number(m) * 60 + Number(s.replace(',', '.'));
};

const raw: Array<[string, string, string, string]> = [
  ['00:01:47,250', '00:01:50,500', 'This blade has a dark past.', 'Cette lame a un sombre passé.'],
  ['00:01:51,800', '00:01:55,800', 'It has shed much innocent blood.', 'Elle a fait couler bien du sang innocent.'],
  [
    '00:01:58,000',
    '00:02:01,450',
    "You're a fool for traveling alone, so completely unprepared.",
    'Tu es bien idiote de voyager seule sans la moindre préparation.',
  ],
  [
    '00:02:01,750',
    '00:02:04,800',
    "You're lucky your blood's still flowing.",
    'Tu as de la chance que ton sang coule encore dans tes veines.',
  ],
  ['00:02:05,250', '00:02:06,300', 'Thank you.', 'Merci.'],
  ['00:02:07,500', '00:02:09,000', 'So...', 'Alors...'],
  [
    '00:02:09,400',
    '00:02:13,800',
    'What brings you to the land of the gatekeepers?',
    "Qu'est-ce qui t'amène sur la terre des gardiens ?",
  ],
  ['00:02:15,000', '00:02:17,500', "I'm searching for someone.", 'Je recherche quelqu’un.'],
  ['00:02:18,000', '00:02:22,200', 'Someone very dear? A kindred spirit?', 'Quelqu’un de très cher ? Une âme sœur ?'],
  ['00:02:23,400', '00:02:25,000', 'A dragon.', 'Un dragon.'],
  ['00:02:28,850', '00:02:31,750', 'A dangerous quest for a lone hunter.', 'Une quête dangereuse pour une chasseresse solitaire.'],
  [
    '00:02:32,950',
    '00:02:35,870',
    "I've been alone for as long as I can remember.",
    'J’ai été seule aussi longtemps que je m’en souvienne.',
  ],
  ['00:03:27,250', '00:03:30,500', "We're almost done. Shhh...", 'C’est bientôt fini. Chut...'],
  ['00:03:30,750', '00:03:33,500', 'Hey, sit still.', 'Ne bouge pas !'],
  ['00:03:48,250', '00:03:52,250', 'Good night, Scales.', 'Bonne nuit, Scales.'],
  ['00:04:10,350', '00:04:13,850', 'Get him, Scales! Come on!', 'Attrape-la, Scales ! Vas-y !'],
  ['00:04:25,250', '00:04:28,250', 'Scales?', 'Scales ?'],
  ['00:05:04,000', '00:05:07,500', 'Yeah! Come on!', 'Ouais ! Vas-y !'],
  ['00:05:38,750', '00:05:42,000', 'Scales!', 'Scales !'],
  ['00:07:25,850', '00:07:27,500', 'I have failed.', 'J’ai échoué.'],
  ['00:07:32,800', '00:07:36,500', "You've only failed to see...", 'Tu n’as juste pas su ouvrir les yeux...'],
  ['00:07:37,800', '00:07:40,500', 'These are dragon lands, Sintel.', 'Ce sont des terres à dragons, Sintel.'],
  ['00:07:40,850', '00:07:44,000', 'You are closer than you know.', 'Tu es plus proche que tu ne le crois.'],
  ['00:09:17,600', '00:09:19,500', 'Scales!', 'Scales !'],
  ['00:10:21,600', '00:10:24,000', 'Scales?', 'Scales ?'],
  ['00:10:26,200', '00:10:29,800', 'Scales...', 'Scales...'],
];

const g = (term: string, translation: string, pos: string): Gloss => ({ term, translation, pos });

const blade = g('blade', 'lame', 'n.');
const dark = g('dark', 'sombre', 'adj.');
const past = g('past', 'passé', 'n.');
const shed = g('shed (blood)', 'verser, faire couler', 'v.');
const innocent = g('innocent', 'innocent·e', 'adj.');
const blood = g('blood', 'sang', 'n.');
const fool = g('fool', 'idiot·e', 'n.');
const traveling = g('to travel', 'voyager', 'v.');
const alone = g('alone', 'seul·e', 'adj.');
const unprepared = g('unprepared', 'sans préparation', 'adj.');
const lucky = g('lucky', 'chanceux·se', 'adj.');
const flowing = g('to flow', 'couler', 'v.');
const brings = g('to bring', 'amener', 'v.');
const land = g('land', 'terre', 'n.');
const gatekeepers = g('gatekeeper', 'gardien·ne', 'n.');
const searching = g('to search for', 'chercher', 'v.');
const someone = g('someone', 'quelqu’un', 'pron.');
const dear = g('dear', 'cher·ère', 'adj.');
const kindred = g('kindred spirit', 'âme sœur', 'phrase');
const dragon = g('dragon', 'dragon', 'n.');
const dangerous = g('dangerous', 'dangereux·se', 'adj.');
const quest = g('quest', 'quête', 'n.');
const lone = g('lone', 'solitaire', 'adj.');
const hunter = g('hunter', 'chasseur·esse', 'n.');
const remember = g('to remember', 'se souvenir', 'v.');
const almost = g('almost', 'presque', 'adv.');
const still = g('still', 'encore ; immobile', 'adv./adj.');
const night = g('night', 'nuit', 'n.');
const failed = g('to fail', 'échouer', 'v.');
const closer = g('close → closer', 'proche → plus proche', 'adj.');
const scales = g('scales', 'écailles (le nom du dragon)', 'n.');
const thank = g('thank you', 'merci', 'phrase');

export const sintelLesson: Lesson = {
  title: 'English 101: Sintel — A Dragon’s Tale',
  nativeLanguage: { code: 'EN', name: 'English' },
  translationLanguage: { code: 'FR', name: 'Français' },
  cues: raw.map(([start, end, native, translation], index) => ({
    id: index + 1,
    start: t(start),
    end: t(end),
    native,
    translation,
  })),
  glossary: {
    blade,
    dark,
    past,
    shed,
    innocent,
    blood,
    "blood's": blood,
    fool,
    traveling,
    alone,
    unprepared,
    lucky,
    flowing,
    brings,
    land,
    lands: land,
    gatekeepers,
    searching,
    someone,
    dear,
    kindred,
    spirit: kindred,
    dragon,
    dangerous,
    quest,
    lone,
    hunter,
    remember,
    almost,
    still,
    night,
    failed,
    closer,
    scales,
    thank,
  },
};

/** Looks a word up in the glossary, ignoring case and surrounding punctuation. */
export function glossFor(lesson: Lesson, word: string): Gloss | undefined {
  const key = word
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/^[^a-z']+|[^a-z']+$/g, '');
  return key ? lesson.glossary[key] : undefined;
}

/** Splits a line into words and the spaces and punctuation between them, so each word can be its own control. */
export function tokenize(line: string): Array<{ text: string; word: boolean }> {
  return line.split(/(\s+)/).filter(Boolean).map((text) => ({ text, word: !/^\s+$/.test(text) }));
}

const VOCAPEDIA = 'https://vocapedia.base44.app';

/** Vocapedia's search finds the entry, or offers to write it when the encyclopedia has none yet. */
export function vocapediaUrl(gloss: Gloss, languageCode: string) {
  const term = gloss.term.replace(/^to /, '').replace(/\s*\(.*\)$/, '').split(' → ')[0];
  return `${VOCAPEDIA}/search?q=${encodeURIComponent(term)}&language=${languageCode.toLowerCase()}`;
}

export const vocapediaHome = VOCAPEDIA;

/** The vocabulary that appears in a set of cues, each headword once, in order of appearance. */
export function vocabularyIn(lesson: Lesson, cues: Cue[]): Gloss[] {
  const seen = new Set<string>();
  const list: Gloss[] = [];
  for (const cue of cues) {
    for (const { text, word } of tokenize(cue.native)) {
      if (!word) continue;
      const gloss = glossFor(lesson, text);
      if (gloss && !seen.has(gloss.term)) {
        seen.add(gloss.term);
        list.push(gloss);
      }
    }
  }
  return list;
}

export function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
