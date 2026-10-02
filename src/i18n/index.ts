import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import { useCallback } from 'react';

import { useStore } from '@/data/store';
import type { Language, Unit } from '@/data/types';
import en from './en';
import pl from './pl';

const i18n = new I18n({ pl, en });
i18n.defaultLocale = 'pl';
i18n.enableFallback = true;

export type Locale = 'pl' | 'en';

export function resolveLocale(language: Language): Locale {
  if (language !== 'system') return language;
  return getLocales()[0]?.languageCode === 'pl' ? 'pl' : 'en';
}

export type TFunction = (key: string, options?: Record<string, string | number>) => string;

/** Translator bound to the language chosen in Settings (re-renders when it changes). */
export function useT(): TFunction {
  const language = useStore((s) => s.language);
  const locale = resolveLocale(language);
  return useCallback((key, options) => i18n.t(key, { ...options, locale }), [locale]);
}

export function useLocale(): Locale {
  return resolveLocale(useStore((s) => s.language));
}

/** Polish forms for one, a few (2–4, and fractions) and many; other units are abbreviations. */
const PL_UNIT_FORMS: Partial<Record<Unit, [string, string, string]>> = {
  lyzka: ['łyżka', 'łyżki', 'łyżek'],
  lyzeczka: ['łyżeczka', 'łyżeczki', 'łyżeczek'],
  szklanka: ['szklanka', 'szklanki', 'szklanek'],
};

function polishForm(quantity: number, [one, few, many]: [string, string, string]) {
  if (!Number.isInteger(quantity)) return few;
  if (quantity === 1) return one;
  const last = quantity % 10;
  const lastTwo = quantity % 100;
  return last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? few : many;
}

/** "0,5 łyżki", "2 łyżki", "1.5 cups": an amount with its unit in the app's language. */
export function useFormatAmount() {
  const t = useT();
  const locale = useLocale();
  return useCallback(
    (quantity: number, unit: Unit) => {
      const number = quantity.toLocaleString(locale, { maximumFractionDigits: 2, useGrouping: false });
      const forms = locale === 'pl' ? PL_UNIT_FORMS[unit] : undefined;
      let label = forms ? polishForm(quantity, forms) : t(`unit_${unit}`);
      if (locale === 'en' && unit === 'szklanka' && quantity !== 1) label = 'cups';
      return `${number} ${label}`;
    },
    [t, locale],
  );
}
