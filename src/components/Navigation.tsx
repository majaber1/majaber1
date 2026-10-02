'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/lib/locale-context';
import { cn } from '@/lib/utils';

export default function Navigation() {
  const pathname = usePathname();
  const { t, locale, toggleLocale } = useLocale();

  const links = [
    { href: '/', label: t('nav.portfolio') },
    { href: '/focus', label: t('nav.focus') },
    { href: '/audit', label: locale === 'ar' ? 'التدقيق' : 'Audit' },
    { href: '/tools/simulator', label: locale === 'ar' ? 'محاكي القرارات' : 'Simulator' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-accent)]">
                <span className="text-xs font-bold text-white">JD</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {t('app.title')}
                </span>
                <span className="ml-2 text-xs text-[var(--color-text-tertiary)]">v2.1 Audit</span>
              </div>
            </Link>

            <nav className="flex items-center gap-1">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm transition-colors',
                    pathname === link.href
                      ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-medium'
                      : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLocale}
              className="rounded-md border border-[var(--color-border-primary)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-accent)] hover:text-[var(--color-text-primary)]"
            >
              {locale === 'en' ? 'عربي' : 'EN'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
