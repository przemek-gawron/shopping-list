import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import { useCallback } from 'react';

import { useStore } from '@/data/store';
import type { Language } from '@/data/types';
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
