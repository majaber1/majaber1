'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type Locale, t as translate, isRTL } from './i18n';

interface LocaleContextType {
  locale: Locale;
  toggleLocale: () => void;
  t: (key: string) => string;
  rtl: boolean;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'en',
  toggleLocale: () => {},
  t: (key: string) => key,
  rtl: false,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  const toggleLocale = useCallback(() => {
    setLocale(prev => prev === 'en' ? 'ar' : 'en');
  }, []);

  const tFn = useCallback((key: string) => translate(key, locale), [locale]);

  return (
    <LocaleContext.Provider value={{ locale, toggleLocale, t: tFn, rtl: isRTL(locale) }}>
      <div dir={isRTL(locale) ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
