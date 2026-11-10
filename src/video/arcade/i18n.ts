import { useLocale, useTranslator } from '@videojs/react';

/*
 * Strings for the Arcade skin's own controls, as Video.js text descriptors: `t(text)` returns the registered
 * translation for the player's locale, or the English default. The skin's components read them through
 * `useArcadeTranslator()`, which adds the skin's own strings (Spanish so far) on top of Video.js's; other locales fall back
 * to English until they're added the same way.
 */
const text = <K extends string>(key: K, english: string) => ({ key: `arcade.${key}`, text: english }) as const;

export const arcadeText = {
  levels: text('levels', 'Level select'),
  level: text('level', 'Level'),
  turbo: text('turbo', 'Turbo'),
  arcade: text('arcade', 'Arcade'),
  crt: text('crt', 'Curved CRT'),
  soundFx: text('soundFx', 'Sound effects'),
  captionStyle: text('captionStyle', 'Arcade captions'),
  haptics: text('haptics', 'Vibration'),
  howToPlay: text('howToPlay', 'How to play'),
  secretUnlocked: text('secretUnlocked', 'Secret unlocked: 8-bit mode'),
  secretOff: text('secretOff', '8-bit mode off'),
  close: text('close', 'Close'),
  sticks: text('sticks', 'Joysticks'),
  keys: text('keys', 'Keys'),
  buttons: text('buttons', 'Buttons'),
} as const;

const spanish = {
  'arcade.levels': 'Selección de nivel',
  'arcade.level': 'Nivel',
  'arcade.turbo': 'Turbo',
  'arcade.arcade': 'Arcade',
  'arcade.crt': 'CRT curvo',
  'arcade.soundFx': 'Efectos de sonido',
  'arcade.captionStyle': 'Subtítulos arcade',
  'arcade.haptics': 'Vibración',
  'arcade.howToPlay': 'Cómo jugar',
  'arcade.secretUnlocked': 'Secreto desbloqueado: modo 8 bits',
  'arcade.secretOff': 'Modo 8 bits desactivado',
  'arcade.close': 'Cerrar',
  'arcade.sticks': 'Palancas',
  'arcade.keys': 'Teclas',
  'arcade.buttons': 'Botones',
} as Record<string, string>;

/** The skin's own strings for a locale (English comes from the descriptors' defaults). */
export function arcadeTranslations(locale: string | undefined): Record<string, string> | undefined {
  return locale && /^es(-|$)/i.test(locale) ? spanish : undefined;
}

/**
 * A translator for the skin's components: the skin's own strings for the active locale first, then Video.js's
 * translator (its built-in packs, registered overlays and English defaults) for everything else.
 */
export function useArcadeTranslator() {
  const t = useTranslator();
  const own = arcadeTranslations(useLocale());
  return ((text: { key: string; text: string }, params?: Record<string, string | number>) =>
    own?.[text.key] ?? (params ? t(text, params) : t(text))) as typeof t;
}
