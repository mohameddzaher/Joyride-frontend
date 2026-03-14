'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

export type Locale = 'en' | 'ar';
type TranslationValue = string | Record<string, any>;
type Translations = Record<string, TranslationValue>;

const translations: Record<Locale, Translations> = { en, ar };

interface I18nContextValue {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  setLocale: (locale: Locale) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === undefined || current === null) return path;
    current = current[key];
  }
  return typeof current === 'string' ? current : path;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('joyride-locale') as Locale;
    if (saved === 'ar' || saved === 'en') {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('joyride-locale', locale);
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  const t = useCallback((key: string, replacements?: Record<string, string>): string => {
    let value = getNestedValue(translations[locale], key);
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        value = value.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
      });
    }
    return value;
  }, [locale]);

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <I18nContext.Provider value={{ locale, dir, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function useTranslation() {
  const { t, locale, dir } = useI18n();
  return { t, locale, dir };
}
