'use client'

import { Languages } from 'lucide-react'
import { usePreferences } from '@/components/providers/preferences-provider'
import { localeNames } from '@/lib/i18n'
import type { Locale } from '@/lib/types'
import { cn } from '@/lib/utils'

export function LanguageToggle({ className, onInk = false }: { className?: string; onInk?: boolean }) {
  const { locale, setPreference, t } = usePreferences()
  return (
    <div
      role="group"
      aria-label={t('settings.language')}
      className={cn('inline-flex items-center gap-1 rounded-full p-1', onInk ? 'bg-ink-foreground/10' : 'bg-muted', className)}
    >
      <Languages aria-hidden="true" className={cn('ml-2 size-4', onInk ? 'text-ink-foreground' : 'text-muted-foreground')} />
      {(Object.keys(localeNames) as Locale[]).map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={locale === code}
          onClick={() => setPreference('locale', code)}
          className={cn(
            'min-h-10 rounded-full px-3 text-sm font-bold transition-colors',
            locale === code
              ? 'bg-card text-foreground shadow-sm'
              : onInk
                ? 'text-ink-foreground hover:bg-ink-foreground/10'
                : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {localeNames[code]}
        </button>
      ))}
    </div>
  )
}
