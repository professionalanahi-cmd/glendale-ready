'use client'

import {
  BookOpen,
  CalendarDays,
  House,
  LifeBuoy,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Volume2,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LanguageToggle } from '@/components/common/language-toggle'
import { Logo } from '@/components/common/logo'
import { useAuth, useProfile } from '@/components/providers/auth-provider'
import { usePreferences } from '@/components/providers/preferences-provider'
import { cn } from '@/lib/utils'
import { FullPageLoading } from './require-auth'

const NAV = [
  { href: '/dashboard', key: 'nav.home', icon: House },
  { href: '/preparedness', key: 'nav.preparedness', icon: ShieldCheck },
  { href: '/learn', key: 'nav.learn', icon: BookOpen },
  { href: '/help', key: 'nav.help', icon: LifeBuoy },
  { href: '/training', key: 'nav.training', icon: CalendarDays },
  { href: '/sounds', key: 'nav.sounds', icon: Volume2 },
  { href: '/settings', key: 'nav.settings', icon: Settings },
] as const

const MOBILE_TABS = ['/dashboard', '/preparedness', '/learn', '/help', '/settings']

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = usePreferences()
  const { backend } = useAuth()
  const { profile, isLoading } = useProfile()
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const needsOnboarding = !isLoading && (!profile || !profile.onboardingComplete)
  useEffect(() => {
    if (needsOnboarding) router.replace('/onboarding')
  }, [needsOnboarding, router])

  useEffect(() => setMenuOpen(false), [pathname])

  if (isLoading || needsOnboarding) return <FullPageLoading />

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  async function signOut() {
    await backend.signOut()
    router.push('/')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-sun px-5 py-3 font-bold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t('nav.skipToContent')}
      </a>

      <header className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Logo onInk href="/dashboard" />
          <div className="flex items-center gap-2">
            <LanguageToggle onInk />
            <button
              type="button"
              onClick={signOut}
              className="hidden min-h-11 items-center gap-2 rounded-full px-4 font-bold hover:bg-ink-foreground/10 lg:inline-flex"
            >
              <LogOut aria-hidden="true" className="size-5" />
              {t('common.signOut')}
            </button>
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-full hover:bg-ink-foreground/10 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X aria-hidden="true" className="size-6" /> : <Menu aria-hidden="true" className="size-6" />}
              <span className="sr-only">{t('nav.label')}</span>
            </button>
          </div>
        </div>

        <nav aria-label={t('nav.label')} className="mx-auto hidden max-w-6xl px-5 pb-3 lg:block">
          <ul className="flex flex-wrap gap-1">
            {NAV.map(({ href, key, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-bold transition-colors',
                    isActive(href) ? 'bg-sun text-ink' : 'text-ink-foreground/85 hover:bg-ink-foreground/10',
                  )}
                >
                  <Icon aria-hidden="true" className="size-5" />
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {menuOpen ? (
          <nav id="mobile-menu" aria-label={t('nav.label')} className="border-t border-ink-foreground/15 px-5 pt-2 pb-5 lg:hidden">
            <ul className="flex flex-col gap-1">
              {NAV.map(({ href, key, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive(href) ? 'page' : undefined}
                    className={cn(
                      'flex min-h-12 items-center gap-3 rounded-2xl px-4 text-lg font-bold',
                      isActive(href) ? 'bg-sun text-ink' : 'hover:bg-ink-foreground/10',
                    )}
                  >
                    <Icon aria-hidden="true" className="size-5" />
                    {t(key)}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={signOut}
                  className="flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 text-lg font-bold hover:bg-ink-foreground/10"
                >
                  <LogOut aria-hidden="true" className="size-5" />
                  {t('common.signOut')}
                </button>
              </li>
            </ul>
          </nav>
        ) : null}
      </header>

      <main id="main" tabIndex={-1} className="flex-1 pb-28 outline-none lg:pb-12">
        {children}
      </main>

      <footer className="mx-auto hidden w-full max-w-6xl px-5 pb-8 text-sm leading-relaxed text-muted-foreground lg:block">
        {t('common.notOfficial')}
      </footer>

      <nav
        aria-label={t('nav.label')}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {NAV.filter((n) => MOBILE_TABS.includes(n.href)).map(({ href, key, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive(href) ? 'page' : undefined}
                className={cn(
                  'flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-xs font-bold',
                  isActive(href) ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-14 items-center justify-center rounded-full',
                    isActive(href) ? 'bg-primary-soft' : undefined,
                  )}
                >
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className="text-center leading-tight">{t(key)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
