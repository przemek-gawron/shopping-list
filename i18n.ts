import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import pl from './locales/pl';
import en from './locales/en';

const i18n = new I18n({ pl, en });

const deviceLang = getLocales()[0]?.languageCode ?? 'pl';
i18n.locale = deviceLang === 'pl' ? 'pl' : 'en';
i18n.defaultLocale = 'pl';
i18n.enableFallback = true;

export const t = i18n.t.bind(i18n);
export const locale = i18n.locale;

export default i18n;
