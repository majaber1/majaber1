'use client';

import { LocaleProvider } from '@/lib/locale-context';
import Navigation from '@/components/Navigation';
import type { ReactNode } from 'react';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <Navigation />
      <main className="flex-1">{children}</main>
    </LocaleProvider>
  );
}
