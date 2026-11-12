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
  /** The form the word is filed under: it decides the sort order and the A–Z tab. */
  lemma: string;
  /** The headword as printed. */
  term: string;
  /** Part of speech, abbreviated. */
  pos: string;
  /** Pronunciation, in IPA. */
  ipa: string;
  /** A one-line English definition. */
  definition: string;
  /** Translation into the learner's language. */
  translation: string;
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

/**
 * Dictionary data for each special word: the form it's filed under, how it's said, what it means, and the French.
 * `term` is how the headword prints; `lemma` is how it sorts and which A–Z tab it lives behind.
 */
const g = (lemma: string, term: string, pos: string, ipa: string, definition: string, translation: string): Gloss => ({
  lemma,
  term,
  pos,
  ipa,
  definition,
  translation,
});

const blade = g('blade', 'blade', 'n.', '/bleɪd/', 'The flat, sharp cutting part of a sword or knife.', 'lame');
const dark = g('dark', 'dark', 'adj.', '/dɑːk/', 'Hidden, troubling or evil; also, with little light.', 'sombre');
const past = g('past', 'past', 'n.', '/pɑːst/', 'The time and events before now; someone’s history.', 'passé');
const shed = g('shed', 'shed (blood)', 'v.', '/ʃed/', 'To cause blood to flow, by wounding or killing.', 'verser, faire couler');
const innocent = g('innocent', 'innocent', 'adj.', '/ˈɪn.ə.sənt/', 'Having done nothing wrong; not guilty.', 'innocent·e');
const blood = g('blood', 'blood', 'n.', '/blʌd/', 'The red liquid that flows through the body.', 'sang');
const fool = g('fool', 'fool', 'n.', '/fuːl/', 'A person who acts without good sense.', 'idiot·e');
const travel = g('travel', 'to travel', 'v.', '/ˈtræv.əl/', 'To go from one place to another, often far.', 'voyager');
const alone = g('alone', 'alone', 'adj.', '/əˈləʊn/', 'Without anyone else; by yourself.', 'seul·e');
const unprepared = g('unprepared', 'unprepared', 'adj.', '/ˌʌn.prɪˈpeəd/', 'Not ready for what is going to happen.', 'sans préparation');
const lucky = g('lucky', 'lucky', 'adj.', '/ˈlʌk.i/', 'Having good things happen by chance.', 'chanceux·se');
const flow = g('flow', 'to flow', 'v.', '/fləʊ/', 'To move along steadily, as a liquid does.', 'couler');
const bring = g('bring', 'to bring', 'v.', '/brɪŋ/', 'To make someone come to a place.', 'amener');
const land = g('land', 'land', 'n.', '/lænd/', 'A country or region; the ground of a place.', 'terre');
const gatekeeper = g('gatekeeper', 'gatekeeper', 'n.', '/ˈɡeɪtˌkiː.pər/', 'Someone who guards a gate or a way in.', 'gardien·ne');
const search = g('search for', 'to search for', 'v.', '/sɜːtʃ fɔː/', 'To look carefully in order to find someone.', 'chercher');
const someone = g('someone', 'someone', 'pron.', '/ˈsʌm.wʌn/', 'A person who is not named or known.', 'quelqu’un');
const dear = g('dear', 'dear', 'adj.', '/dɪər/', 'Loved very much; precious.', 'cher·ère');
const kindred = g('kindred spirit', 'kindred spirit', 'phr.', '/ˌkɪn.drəd ˈspɪr.ɪt/', 'A person who feels and thinks as you do.', 'âme sœur');
const dragon = g('dragon', 'dragon', 'n.', '/ˈdræɡ.ən/', 'A huge winged reptile of legend that breathes fire.', 'dragon');
const dangerous = g('dangerous', 'dangerous', 'adj.', '/ˈdeɪn.dʒər.əs/', 'Able to harm or kill you.', 'dangereux·se');
const quest = g('quest', 'quest', 'n.', '/kwest/', 'A long, hard search for something.', 'quête');
const lone = g('lone', 'lone', 'adj.', '/ləʊn/', 'Alone; the only one.', 'solitaire');
const hunter = g('hunter', 'hunter', 'n.', '/ˈhʌn.tər/', 'A person who chases and catches animals.', 'chasseur·esse');
const remember = g('remember', 'to remember', 'v.', '/rɪˈmem.bər/', 'To keep something in your mind.', 'se souvenir');
const almost = g('almost', 'almost', 'adv.', '/ˈɔːl.məʊst/', 'Very nearly, but not quite.', 'presque');
const still = g('still', 'still', 'adv./adj.', '/stɪl/', 'Even now; or, not moving at all.', 'encore ; immobile');
const night = g('night', 'night', 'n.', '/naɪt/', 'The dark part of the day, when people sleep.', 'nuit');
const fail = g('fail', 'to fail', 'v.', '/feɪl/', 'To not succeed in doing what you tried to do.', 'échouer');
const close = g('close', 'close → closer', 'adj.', '/kləʊs/', 'Near in space or time.', 'proche → plus proche');
const scales = g('scales', 'scales', 'n.', '/skeɪlz/', 'The small hard plates on a reptile’s skin — and the dragon’s name.', 'écailles');
const thank = g('thank you', 'thank you', 'phr.', '/ˈθæŋk juː/', 'What you say to show you are grateful.', 'merci');

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
    traveling: travel,
    alone,
    unprepared,
    lucky,
    flowing: flow,
    brings: bring,
    land,
    lands: land,
    gatekeepers: gatekeeper,
    searching: search,
    someone,
    dear,
    kindred,
    dragon,
    dangerous,
    quest,
    lone,
    hunter,
    remember,
    almost,
    still,
    night,
    failed: fail,
    closer: close,
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
  return `${VOCAPEDIA}/search?q=${encodeURIComponent(gloss.lemma)}&language=${languageCode.toLowerCase()}`;
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

/** The A–Z tab a word lives behind. */
export function letterOf(gloss: Gloss) {
  return gloss.lemma.charAt(0).toUpperCase();
}

export interface TimedToken {
  text: string;
  word: boolean;
  /** When the karaoke sweep reaches this word, in media seconds. */
  start: number;
  gloss?: Gloss;
}

/**
 * Word timings for one line. Sintel's subtitles are timed per line, not per word, so the line's duration is spread
 * across its words by length: close enough for a reading sweep.
 */
export function wordTimings(lesson: Lesson, cue: Cue): TimedToken[] {
  const tokens = tokenize(cue.native);
  const weight = (text: string) => text.replace(/[^\p{L}']/gu, '').length + 1.5;
  const total = tokens.reduce((sum, token) => sum + (token.word ? weight(token.text) : 0), 0) || 1;
  const lead = Math.min(0.15, (cue.end - cue.start) * 0.05);
  const span = (cue.end - cue.start) * 0.85 - lead;
  let consumed = 0;
  return tokens.map((token) => {
    const start = cue.start + lead + (consumed / total) * span;
    if (token.word) consumed += weight(token.text);
    return { ...token, start, gloss: token.word ? glossFor(lesson, token.text) : undefined };
  });
}

export interface Occurrence {
  /** Position in the lesson's list of occurrences. */
  index: number;
  gloss: Gloss;
  cueId: number;
  time: number;
}

const occurrenceCache = new WeakMap<Lesson, Occurrence[]>();

/** Every time a special word is spoken in the film, in order. */
export function occurrences(lesson: Lesson): Occurrence[] {
  const cached = occurrenceCache.get(lesson);
  if (cached) return cached;
  const list: Occurrence[] = [];
  for (const cue of lesson.cues) {
    for (const token of wordTimings(lesson, cue)) {
      if (token.gloss) list.push({ index: list.length, gloss: token.gloss, cueId: cue.id, time: token.start });
    }
  }
  occurrenceCache.set(lesson, list);
  return list;
}

/** One page of the "Just heard" card: a spoken line and the special words in it. */
export interface LinePage {
  /** Position in the lesson's list of pages. */
  index: number;
  cue: Cue;
  /** The special words in the line, once each, in spoken order. */
  words: Gloss[];
  /** When the sweep reaches each of those words. */
  wordTimes: number[];
  /** When the first special word is spoken: the page turns then. */
  firstTime: number;
}

const pageCache = new WeakMap<Lesson, LinePage[]>();

/** The lines that hold special words, as pages, so the card turns once per line rather than once per word. */
export function linePages(lesson: Lesson): LinePage[] {
  const cached = pageCache.get(lesson);
  if (cached) return cached;
  const pages: LinePage[] = [];
  for (const cue of lesson.cues) {
    const words: Gloss[] = [];
    const wordTimes: number[] = [];
    for (const token of wordTimings(lesson, cue)) {
      if (token.gloss && !words.includes(token.gloss)) {
        words.push(token.gloss);
        wordTimes.push(token.start);
      }
    }
    if (words.length) pages.push({ index: pages.length, cue, words, wordTimes, firstTime: wordTimes[0] });
  }
  pageCache.set(lesson, pages);
  return pages;
}
