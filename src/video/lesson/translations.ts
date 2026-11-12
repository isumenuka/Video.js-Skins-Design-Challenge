/**
 * The languages the lesson can be translated into, and the dictionary's word translations for each. English is
 * always the spoken (original) line; the viewer chooses the translation language in Settings.
 */

import type { Cue, Gloss } from './lesson-data';
import { SINTEL_TRANSLATIONS } from './sintel-translations';

export type LangCode = 'FR' | 'ES' | 'DE' | 'IT' | 'PT' | 'NL' | 'PL' | 'RU';

export interface TranslationLanguage {
  code: LangCode;
  /** The language's own name for itself. */
  name: string;
}

export const TRANSLATION_LANGUAGES: TranslationLanguage[] = [
  { code: 'FR', name: 'Français' },
  { code: 'ES', name: 'Español' },
  { code: 'DE', name: 'Deutsch' },
  { code: 'IT', name: 'Italiano' },
  { code: 'PT', name: 'Português' },
  { code: 'NL', name: 'Nederlands' },
  { code: 'PL', name: 'Polski' },
  { code: 'RU', name: 'Русский' },
];

export const isLangCode = (value: unknown): value is LangCode =>
  TRANSLATION_LANGUAGES.some((language) => language.code === value);

type Words = Record<Exclude<LangCode, 'FR'>, string>;

/** Each special word in the sense the film uses it. French lives with the glossary in lesson-data.ts. */
const WORDS: Record<string, Words> = {
  blade: { ES: 'hoja', DE: 'Klinge', IT: 'lama', PT: 'lâmina', NL: 'lemmet', PL: 'ostrze', RU: 'клинок' },
  dark: { ES: 'oscuro·a', DE: 'dunkel', IT: 'oscuro·a', PT: 'sombrio·a', NL: 'duister', PL: 'mroczny', RU: 'тёмный' },
  past: { ES: 'pasado', DE: 'Vergangenheit', IT: 'passato', PT: 'passado', NL: 'verleden', PL: 'przeszłość', RU: 'прошлое' },
  shed: { ES: 'derramar', DE: 'vergießen', IT: 'versare', PT: 'derramar', NL: 'vergieten', PL: 'przelać', RU: 'проливать' },
  innocent: { ES: 'inocente', DE: 'unschuldig', IT: 'innocente', PT: 'inocente', NL: 'onschuldig', PL: 'niewinny', RU: 'невинный' },
  blood: { ES: 'sangre', DE: 'Blut', IT: 'sangue', PT: 'sangue', NL: 'bloed', PL: 'krew', RU: 'кровь' },
  fool: { ES: 'tonto·a', DE: 'Narr·in', IT: 'sciocco·a', PT: 'tolo·a', NL: 'dwaas', PL: 'głupiec', RU: 'глупец' },
  travel: { ES: 'viajar', DE: 'reisen', IT: 'viaggiare', PT: 'viajar', NL: 'reizen', PL: 'podróżować', RU: 'путешествовать' },
  alone: { ES: 'solo·a', DE: 'allein', IT: 'solo·a', PT: 'sozinho·a', NL: 'alleen', PL: 'sam·a', RU: 'один, одна' },
  unprepared: {
    ES: 'sin preparación',
    DE: 'unvorbereitet',
    IT: 'impreparato·a',
    PT: 'despreparado·a',
    NL: 'onvoorbereid',
    PL: 'nieprzygotowany',
    RU: 'неподготовленный',
  },
  lucky: { ES: 'afortunado·a', DE: 'glücklich', IT: 'fortunato·a', PT: 'sortudo·a', NL: 'gelukkig', PL: 'szczęśliwy', RU: 'везучий' },
  flow: { ES: 'fluir, correr', DE: 'fließen', IT: 'scorrere', PT: 'correr', NL: 'stromen', PL: 'płynąć', RU: 'течь' },
  bring: { ES: 'traer', DE: 'bringen', IT: 'portare', PT: 'trazer', NL: 'brengen', PL: 'przyprowadzać', RU: 'приводить' },
  land: { ES: 'tierra', DE: 'Land', IT: 'terra', PT: 'terra', NL: 'land', PL: 'kraina', RU: 'земля' },
  gatekeeper: { ES: 'guardián·a', DE: 'Torwächter·in', IT: 'guardiano·a', PT: 'guardião', NL: 'poortwachter', PL: 'strażnik', RU: 'страж' },
  'search for': { ES: 'buscar', DE: 'suchen', IT: 'cercare', PT: 'procurar', NL: 'zoeken', PL: 'szukać', RU: 'искать' },
  someone: { ES: 'alguien', DE: 'jemand', IT: 'qualcuno', PT: 'alguém', NL: 'iemand', PL: 'ktoś', RU: 'кто-то' },
  dear: { ES: 'querido·a', DE: 'lieb, teuer', IT: 'caro·a', PT: 'querido·a', NL: 'dierbaar', PL: 'drogi', RU: 'дорогой' },
  'kindred spirit': {
    ES: 'alma gemela',
    DE: 'Seelenverwandte·r',
    IT: 'anima gemella',
    PT: 'alma gémea',
    NL: 'zielsverwant',
    PL: 'bratnia dusza',
    RU: 'родственная душа',
  },
  dragon: { ES: 'dragón', DE: 'Drache', IT: 'drago', PT: 'dragão', NL: 'draak', PL: 'smok', RU: 'дракон' },
  dangerous: { ES: 'peligroso·a', DE: 'gefährlich', IT: 'pericoloso·a', PT: 'perigoso·a', NL: 'gevaarlijk', PL: 'niebezpieczny', RU: 'опасный' },
  quest: { ES: 'búsqueda', DE: 'Suche', IT: 'ricerca', PT: 'demanda', NL: 'queeste', PL: 'wyprawa', RU: 'поиски' },
  lone: { ES: 'solitario·a', DE: 'einsam', IT: 'solitario·a', PT: 'solitário·a', NL: 'eenzaam', PL: 'samotny', RU: 'одинокий' },
  hunter: { ES: 'cazador·a', DE: 'Jäger·in', IT: 'cacciatore·trice', PT: 'caçador·a', NL: 'jager', PL: 'łowca', RU: 'охотник' },
  remember: { ES: 'recordar', DE: 'sich erinnern', IT: 'ricordare', PT: 'lembrar-se', NL: 'zich herinneren', PL: 'pamiętać', RU: 'помнить' },
  almost: { ES: 'casi', DE: 'fast', IT: 'quasi', PT: 'quase', NL: 'bijna', PL: 'prawie', RU: 'почти' },
  still: { ES: 'todavía ; quieto', DE: 'noch ; still', IT: 'ancora ; fermo', PT: 'ainda ; quieto', NL: 'nog ; stil', PL: 'wciąż ; nieruchomo', RU: 'ещё ; неподвижно' },
  night: { ES: 'noche', DE: 'Nacht', IT: 'notte', PT: 'noite', NL: 'nacht', PL: 'noc', RU: 'ночь' },
  fail: { ES: 'fracasar', DE: 'scheitern', IT: 'fallire', PT: 'falhar', NL: 'falen', PL: 'ponieść porażkę', RU: 'потерпеть неудачу' },
  close: {
    ES: 'cercano → más cercano',
    DE: 'nah → näher',
    IT: 'vicino → più vicino',
    PT: 'próximo → mais próximo',
    NL: 'dichtbij → dichterbij',
    PL: 'blisko → bliżej',
    RU: 'близко → ближе',
  },
  scales: { ES: 'escamas', DE: 'Schuppen', IT: 'scaglie', PT: 'escamas', NL: 'schubben', PL: 'łuski', RU: 'чешуя' },
  'thank you': { ES: 'gracias', DE: 'danke', IT: 'grazie', PT: 'obrigado·a', NL: 'dank je', PL: 'dziękuję', RU: 'спасибо' },
};

/** The translation of a spoken line in the chosen language (official subtitles). */
export function cueText(cue: Cue, code: LangCode): string {
  if (code === 'FR') return cue.translation;
  return SINTEL_TRANSLATIONS[code]?.[cue.id - 1] ?? cue.translation;
}

/** A word's translation in the chosen language. */
export function glossText(gloss: Gloss, code: LangCode): string {
  if (code === 'FR') return gloss.translation;
  return WORDS[gloss.lemma]?.[code] ?? gloss.translation;
}
