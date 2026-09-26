'use client'

import { ExternalLink, FlaskConical, Info, Siren } from 'lucide-react'
import { useT } from '@/components/providers/preferences-provider'
import { officialAlertSources } from '@/lib/content/catalog'
import type { SourceRef } from '@/lib/types'
import { card } from '@/lib/ui'
import { cn } from '@/lib/utils'

export function ExternalA({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const t = useT()
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('inline-flex items-center gap-1 font-bold text-primary underline underline-offset-4', className)}
    >
      {children}
      <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
      <span className="sr-only">{t('common.opensInNewTab')}</span>
    </a>
  )
}

export function SourceNote({ source, className }: { source: SourceRef | null | undefined; className?: string }) {
  const t = useT()
  if (!source) {
    return <p className={cn('text-sm text-muted-foreground', className)}>{t('common.sourceComingSoon')}</p>
  }
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      <span className="font-bold">{t('common.source')}:</span> {source.organization}
      {' — '}
      {source.url ? <ExternalA href={source.url}>{source.title}</ExternalA> : source.title}
      {source.date ? `, ${source.date}` : null}
    </p>
  )
}

export function DemoBadge({ className }: { className?: string }) {
  const t = useT()
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-sun-soft px-3 py-1 text-sm font-bold text-ink ring-1 ring-sun',
        className,
      )}
    >
      <FlaskConical aria-hidden="true" className="size-4" />
      {t('common.demoBadge')}
    </span>
  )
}

export function DemoNotice({ className }: { className?: string }) {
  const t = useT()
  return (
    <div role="note" className={cn('flex items-start gap-3 rounded-2xl bg-sun-soft p-4 ring-1 ring-sun', className)}>
      <FlaskConical aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-ink" />
      <p className="text-pretty text-ink">{t('common.demoNotice')}</p>
    </div>
  )
}

export function InfoNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div role="note" className={cn('flex items-start gap-3 rounded-2xl bg-primary-soft p-4', className)}>
      <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
      <div className="text-pretty text-foreground">{children}</div>
    </div>
  )
}

export function OfficialAlerts({ className }: { className?: string }) {
  const t = useT()
  return (
    <section aria-labelledby="official-alerts" className={cn(card, 'flex flex-col gap-3 p-5', className)}>
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-coral-soft text-coral">
          <Siren aria-hidden="true" className="size-5" />
        </span>
        <h2 id="official-alerts" className="text-lg font-extrabold">
          {t('alerts.title')}
        </h2>
      </div>
      <p className="text-pretty text-muted-foreground">{t('alerts.body')}</p>
      <ul className="flex flex-col gap-2">
        {officialAlertSources.map((s) => (
          <li key={s.url}>
            {s.url ? <ExternalA href={s.url}>{`${s.organization}: ${s.title}`}</ExternalA> : s.title}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">{title}</h1>
      {subtitle ? <p className="max-w-2xl text-pretty text-lg text-muted-foreground">{subtitle}</p> : null}
      {children}
    </header>
  )
}
