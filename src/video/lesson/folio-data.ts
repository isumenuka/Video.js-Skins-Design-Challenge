/**
 * The folio facts for each special word, in the shape of a Vocapedia article: register, difficulty, a compact
 * etymology (Origo), related words (Vide etiam), and false friends (Falsi amici) for each translation language.
 * Keyed by the word's lemma (see lesson-data.ts).
 */

import type { LangCode } from './translations';

export type Register = 'neutral' | 'informal' | 'literary';

/** Source languages in the etymologies, abbreviated as dictionaries do; folio-i18n.ts names them in full. */
export type OriginLang = 'OE' | 'ME' | 'OFr' | 'Lat' | 'Gk' | 'MDu' | 'Frank';

/**
 * One step of an etymology, newest first: `[lang, form]` prints as "← OE blæd"; a step with no language prints its
 * text as written (for compounds such as "un- + prepare").
 */
export type OriginStep = [OriginLang | '', string];

export interface FolioFacts {
  register: Register;
  /** How hard the word is for a learner: 1 easy, 3 hard. */
  difficulty: 1 | 2 | 3;
  origin: OriginStep[];
  /** Related English words; a word that is itself in the lesson becomes a link to its entry. */
  related: string[];
}

export const FOLIO: Record<string, FolioFacts> = {
  blade: { register: 'neutral', difficulty: 2, origin: [['OE', 'blæd']], related: ['sword', 'knife', 'edge'] },
  dark: { register: 'neutral', difficulty: 1, origin: [['OE', 'deorc']], related: ['darkness', 'night', 'shadow'] },
  past: { register: 'neutral', difficulty: 1, origin: [['ME', 'passed'], ['OFr', 'passer']], related: ['history', 'memory', 'remember'] },
  shed: { register: 'literary', difficulty: 3, origin: [['OE', 'scēadan']], related: ['spill', 'blood'] },
  innocent: { register: 'neutral', difficulty: 2, origin: [['OFr', 'innocent'], ['Lat', 'innocēns']], related: ['innocence', 'guilty'] },
  blood: { register: 'neutral', difficulty: 1, origin: [['OE', 'blōd']], related: ['bleed', 'bloody', 'shed'] },
  fool: { register: 'informal', difficulty: 2, origin: [['OFr', 'fol'], ['Lat', 'follis']], related: ['foolish', 'folly'] },
  travel: { register: 'neutral', difficulty: 1, origin: [['ME', 'travailen'], ['OFr', 'travailler']], related: ['journey', 'trip', 'quest'] },
  alone: { register: 'neutral', difficulty: 1, origin: [['ME', 'al one']], related: ['lonely', 'lone', 'solitude'] },
  unprepared: { register: 'neutral', difficulty: 2, origin: [['', 'un- + prepare'], ['Lat', 'praeparāre']], related: ['ready', 'prepare'] },
  lucky: { register: 'neutral', difficulty: 1, origin: [['', 'luck + -y'], ['MDu', 'gelucke']], related: ['luck', 'fortune'] },
  flow: { register: 'neutral', difficulty: 2, origin: [['OE', 'flōwan']], related: ['stream', 'pour'] },
  bring: { register: 'neutral', difficulty: 1, origin: [['OE', 'bringan']], related: ['carry', 'fetch'] },
  land: { register: 'neutral', difficulty: 1, origin: [['OE', 'land']], related: ['country', 'realm', 'ground'] },
  gatekeeper: { register: 'neutral', difficulty: 2, origin: [['', 'gate + keeper'], ['OE', 'geat']], related: ['guard', 'gate', 'keeper'] },
  'search for': { register: 'neutral', difficulty: 2, origin: [['OFr', 'cerchier'], ['Lat', 'circāre']], related: ['seek', 'look for', 'quest'] },
  someone: { register: 'neutral', difficulty: 1, origin: [['', 'some + one'], ['OE', 'sum']], related: ['somebody', 'anyone'] },
  dear: { register: 'neutral', difficulty: 2, origin: [['OE', 'dēore']], related: ['beloved', 'darling'] },
  'kindred spirit': {
    register: 'literary',
    difficulty: 3,
    origin: [['', 'kindred'], ['OE', 'cynn'], ['', '· spirit'], ['Lat', 'spīritus']],
    related: ['soulmate', 'kin', 'friend'],
  },
  dragon: { register: 'neutral', difficulty: 1, origin: [['OFr', 'dragon'], ['Lat', 'dracō'], ['Gk', 'drákōn']], related: ['wyrm', 'scales', 'serpent'] },
  dangerous: { register: 'neutral', difficulty: 1, origin: [['OFr', 'dangereus']], related: ['danger', 'risky', 'safe'] },
  quest: { register: 'literary', difficulty: 2, origin: [['OFr', 'queste'], ['Lat', 'quaerere']], related: ['journey', 'search for', 'mission'] },
  lone: { register: 'literary', difficulty: 3, origin: [['', 'a(lone)'], ['ME', 'al one']], related: ['alone', 'lonely', 'single'] },
  hunter: { register: 'neutral', difficulty: 1, origin: [['', 'hunt + -er'], ['OE', 'huntian']], related: ['hunt', 'prey'] },
  remember: { register: 'neutral', difficulty: 1, origin: [['OFr', 'remembrer'], ['Lat', 'rememorārī']], related: ['memory', 'forget', 'past'] },
  almost: { register: 'neutral', difficulty: 1, origin: [['OE', 'eallmǣst']], related: ['nearly', 'barely'] },
  still: { register: 'neutral', difficulty: 3, origin: [['OE', 'stille']], related: ['yet', 'motionless', 'quiet'] },
  night: { register: 'neutral', difficulty: 1, origin: [['OE', 'niht']], related: ['evening', 'dark', 'midnight'] },
  fail: { register: 'neutral', difficulty: 2, origin: [['OFr', 'faillir'], ['Lat', 'fallere']], related: ['failure', 'succeed'] },
  close: { register: 'neutral', difficulty: 2, origin: [['OFr', 'clos'], ['Lat', 'clausus']], related: ['near', 'closer', 'far'] },
  scales: { register: 'neutral', difficulty: 2, origin: [['OFr', 'escale'], ['Frank', '*skala']], related: ['dragon', 'reptile', 'claw'] },
  'thank you': { register: 'neutral', difficulty: 1, origin: [['OE', 'þancian']], related: ['thanks', 'grateful'] },
};

/**
 * A false friend: a word in the learner's language that looks like an English word with a different meaning.
 * `learner` is the word in the learner's language, `english` the English look-alike, and `englishMeans` what that
 * English word really means, written in the learner's language.
 */
export interface FalseFriend {
  learner: string;
  english: string;
  englishMeans: string;
}

/** Real look-alikes only, curated per language; a word with none shows no Falsi amici section. */
export const FALSE_FRIENDS: Partial<Record<LangCode, Record<string, FalseFriend>>> = {
  FR: {
    blade: { learner: 'lame', english: 'lame', englishMeans: 'boiteux·se' },
    past: { learner: 'passé', english: 'passé', englishMeans: 'démodé·e' },
    blood: { learner: 'sang', english: 'sang', englishMeans: 'a chanté (passé de « to sing »)' },
    lucky: { learner: 'chance', english: 'chance', englishMeans: 'possibilité, occasion' },
    remember: { learner: 'souvenir', english: 'souvenir', englishMeans: 'objet-souvenir, bibelot' },
    still: { learner: 'encore', english: 'encore', englishMeans: 'bis (à la fin d’un concert)' },
    lone: { learner: 'solitaire', english: 'solitaire', englishMeans: 'réussite (jeu de cartes)' },
    'thank you': { learner: 'merci', english: 'mercy', englishMeans: 'pitié, clémence' },
  },
  ES: {
    remember: { learner: 'recordar', english: 'record', englishMeans: 'grabar, registrar' },
    fail: { learner: 'fracasar', english: 'fracas', englishMeans: 'pelea, alboroto' },
  },
  DE: {
    almost: { learner: 'fast', english: 'fast', englishMeans: 'schnell' },
    still: { learner: 'still', english: 'still', englishMeans: 'noch; regungslos' },
  },
  IT: {
    blade: { learner: 'lama', english: 'llama', englishMeans: 'lama (l’animale delle Ande)' },
    remember: { learner: 'ricordare', english: 'record', englishMeans: 'registrare' },
    almost: { learner: 'quasi', english: 'quasi-', englishMeans: 'pseudo-, apparente' },
  },
  PT: {
    'search for': { learner: 'procurar', english: 'procure', englishMeans: 'obter, adquirir' },
    quest: { learner: 'demanda', english: 'demand', englishMeans: 'exigir; exigência' },
  },
  NL: {
    still: { learner: 'stil', english: 'still', englishMeans: 'nog; bewegingloos' },
  },
  PL: {
    blood: { learner: 'krew', english: 'crew', englishMeans: 'załoga' },
    dragon: { learner: 'smok', english: 'smoke', englishMeans: 'dym' },
  },
};

export function folioFor(lemma: string): FolioFacts | undefined {
  return FOLIO[lemma];
}

export function falseFriendFor(lemma: string, code: LangCode): FalseFriend | undefined {
  return FALSE_FRIENDS[code]?.[lemma];
}

/** The site's Phrase passport is indexed for these translation languages; Polish isn't (yet). */
const PASSPORT_CODES = new Set<LangCode>(['FR', 'ES', 'DE', 'IT', 'PT', 'NL', 'RU']);

export function passportUrl(code: LangCode): string {
  return PASSPORT_CODES.has(code)
    ? `https://vocapedia.base44.app/passport/${code.toLowerCase()}`
    : 'https://vocapedia.base44.app/';
}

export const vocapediaReviewUrl = 'https://vocapedia.base44.app/review';
