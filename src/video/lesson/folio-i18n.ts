/**
 * The folio's small print in each translation language: infobox labels, registers, parts of speech, the false-friend
 * labels, and the full names behind the etymology abbreviations. Section titles stay in Latin, as on Vocapedia.
 */

import type { OriginLang, Register } from './folio-data';
import type { LangCode } from './translations';

type Pos = 'n' | 'v' | 'adj' | 'adv' | 'pron' | 'phr';

interface FolioLabels {
  partOfSpeech: string;
  register: string;
  difficulty: string;
  looksLike: string;
  actuallyMeans: string;
  registers: Record<Register, string>;
  pos: Record<Pos, string>;
  origins: Record<OriginLang, string>;
}

const LABELS: Record<LangCode, FolioLabels> = {
  FR: {
    partOfSpeech: 'Classe',
    register: 'Registre',
    difficulty: 'Difficulté',
    looksLike: 'Ressemble à',
    actuallyMeans: 'Veut dire en fait',
    registers: { neutral: 'neutre', informal: 'familier', literary: 'littéraire' },
    pos: { n: 'nom', v: 'verbe', adj: 'adjectif', adv: 'adverbe', pron: 'pronom', phr: 'locution' },
    origins: {
      OE: 'vieil anglais',
      ME: 'moyen anglais',
      OFr: 'ancien français',
      Lat: 'latin',
      Gk: 'grec ancien',
      MDu: 'moyen néerlandais',
      Frank: 'francique',
    },
  },
  ES: {
    partOfSpeech: 'Categoría',
    register: 'Registro',
    difficulty: 'Dificultad',
    looksLike: 'Se parece a',
    actuallyMeans: 'En realidad significa',
    registers: { neutral: 'neutro', informal: 'coloquial', literary: 'literario' },
    pos: { n: 'sustantivo', v: 'verbo', adj: 'adjetivo', adv: 'adverbio', pron: 'pronombre', phr: 'locución' },
    origins: {
      OE: 'inglés antiguo',
      ME: 'inglés medio',
      OFr: 'francés antiguo',
      Lat: 'latín',
      Gk: 'griego antiguo',
      MDu: 'neerlandés medio',
      Frank: 'fráncico',
    },
  },
  DE: {
    partOfSpeech: 'Wortart',
    register: 'Register',
    difficulty: 'Schwierigkeit',
    looksLike: 'Sieht aus wie',
    actuallyMeans: 'Bedeutet eigentlich',
    registers: { neutral: 'neutral', informal: 'umgangssprachlich', literary: 'gehoben' },
    pos: { n: 'Substantiv', v: 'Verb', adj: 'Adjektiv', adv: 'Adverb', pron: 'Pronomen', phr: 'Wendung' },
    origins: {
      OE: 'Altenglisch',
      ME: 'Mittelenglisch',
      OFr: 'Altfranzösisch',
      Lat: 'Latein',
      Gk: 'Altgriechisch',
      MDu: 'Mittelniederländisch',
      Frank: 'Fränkisch',
    },
  },
  IT: {
    partOfSpeech: 'Categoria',
    register: 'Registro',
    difficulty: 'Difficoltà',
    looksLike: 'Somiglia a',
    actuallyMeans: 'In realtà significa',
    registers: { neutral: 'neutro', informal: 'colloquiale', literary: 'letterario' },
    pos: { n: 'sostantivo', v: 'verbo', adj: 'aggettivo', adv: 'avverbio', pron: 'pronome', phr: 'locuzione' },
    origins: {
      OE: 'inglese antico',
      ME: 'inglese medio',
      OFr: 'francese antico',
      Lat: 'latino',
      Gk: 'greco antico',
      MDu: 'olandese medio',
      Frank: 'francone',
    },
  },
  PT: {
    partOfSpeech: 'Classe',
    register: 'Registro',
    difficulty: 'Dificuldade',
    looksLike: 'Parece',
    actuallyMeans: 'Na verdade significa',
    registers: { neutral: 'neutro', informal: 'coloquial', literary: 'literário' },
    pos: { n: 'substantivo', v: 'verbo', adj: 'adjetivo', adv: 'advérbio', pron: 'pronome', phr: 'locução' },
    origins: {
      OE: 'inglês antigo',
      ME: 'inglês médio',
      OFr: 'francês antigo',
      Lat: 'latim',
      Gk: 'grego antigo',
      MDu: 'neerlandês médio',
      Frank: 'frâncico',
    },
  },
  NL: {
    partOfSpeech: 'Woordsoort',
    register: 'Register',
    difficulty: 'Moeilijkheid',
    looksLike: 'Lijkt op',
    actuallyMeans: 'Betekent eigenlijk',
    registers: { neutral: 'neutraal', informal: 'informeel', literary: 'literair' },
    pos: {
      n: 'zelfstandig naamwoord',
      v: 'werkwoord',
      adj: 'bijvoeglijk naamwoord',
      adv: 'bijwoord',
      pron: 'voornaamwoord',
      phr: 'uitdrukking',
    },
    origins: {
      OE: 'Oudengels',
      ME: 'Middelengels',
      OFr: 'Oudfrans',
      Lat: 'Latijn',
      Gk: 'Oudgrieks',
      MDu: 'Middelnederlands',
      Frank: 'Frankisch',
    },
  },
  PL: {
    partOfSpeech: 'Część mowy',
    register: 'Rejestr',
    difficulty: 'Trudność',
    looksLike: 'Wygląda jak',
    actuallyMeans: 'Naprawdę znaczy',
    registers: { neutral: 'neutralny', informal: 'potoczny', literary: 'literacki' },
    pos: { n: 'rzeczownik', v: 'czasownik', adj: 'przymiotnik', adv: 'przysłówek', pron: 'zaimek', phr: 'wyrażenie' },
    origins: {
      OE: 'staroangielski',
      ME: 'średnioangielski',
      OFr: 'starofrancuski',
      Lat: 'łacina',
      Gk: 'greka starożytna',
      MDu: 'średnioniderlandzki',
      Frank: 'frankijski',
    },
  },
  RU: {
    partOfSpeech: 'Часть речи',
    register: 'Регистр',
    difficulty: 'Сложность',
    looksLike: 'Похоже на',
    actuallyMeans: 'На самом деле значит',
    registers: { neutral: 'нейтральный', informal: 'разговорный', literary: 'книжный' },
    pos: {
      n: 'существительное',
      v: 'глагол',
      adj: 'прилагательное',
      adv: 'наречие',
      pron: 'местоимение',
      phr: 'выражение',
    },
    origins: {
      OE: 'древнеанглийский',
      ME: 'среднеанглийский',
      OFr: 'старофранцузский',
      Lat: 'латынь',
      Gk: 'древнегреческий',
      MDu: 'средненидерландский',
      Frank: 'франкский',
    },
  },
};

export function folioLabels(code: LangCode): FolioLabels {
  return LABELS[code];
}

const POS_KEYS: Record<string, Pos> = { 'n.': 'n', 'v.': 'v', 'adj.': 'adj', 'adv.': 'adv', 'pron.': 'pron', 'phr.': 'phr' };

/** A glossary part of speech ("n.", "adv./adj.") written out in the chosen language. */
export function posName(pos: string, code: LangCode): string {
  const labels = LABELS[code];
  return pos
    .split('/')
    .map((part) => {
      const key = POS_KEYS[part.endsWith('.') ? part : `${part}.`];
      return key ? labels.pos[key] : part;
    })
    .join(' / ');
}
