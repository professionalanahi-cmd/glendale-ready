'use client'

import { CalendarPlus, MapPin } from 'lucide-react'
import { DemoBadge, ExternalA, SourceNote } from '@/components/common/bits'
import { usePreferences } from '@/components/providers/preferences-provider'
import { intlTag, pick } from '@/lib/i18n'
import type { Locale, TrainingEvent } from '@/lib/types'
import { card } from '@/lib/ui'
import { cn } from '@/lib/utils'

const gcalDate = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

export function googleCalendarUrl(event: TrainingEvent, locale: Locale) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: pick(event.title, locale),
    dates: `${gcalDate(event.start)}/${gcalDate(event.end)}`,
    details: pick(event.description, locale),
    location: event.location,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function EventCard({ event, compact = false }: { event: TrainingEvent; compact?: boolean }) {
  const { t, locale } = usePreferences()
  const start = new Date(event.start)
  const tag = intlTag[locale]
  const month = start.toLocaleDateString(tag, { month: 'short' })
  const day = start.toLocaleDateString(tag, { day: 'numeric' })
  const when = `${start.toLocaleDateString(tag, { weekday: 'long', month: 'long', day: 'numeric' })}, ${start.toLocaleTimeString(tag, { hour: 'numeric', minute: '2-digit' })} – ${new Date(event.end).toLocaleTimeString(tag, { hour: 'numeric', minute: '2-digit' })}`

  return (
    <article className={cn(card, 'flex flex-col gap-4 p-5')}>
      <div className="flex items-start gap-4">
        <div aria-hidden="true" className="flex w-16 shrink-0 flex-col items-center rounded-2xl bg-sun py-2 text-ink">
          <span className="text-sm font-bold uppercase">{month}</span>
          <span className="font-heading text-3xl leading-none font-extrabold">{day}</span>
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-sm font-bold text-primary">{t(`topics.${event.category}`)}</p>
          <h3 className="font-heading text-xl font-extrabold text-balance">{pick(event.title, locale)}</h3>
        </div>
      </div>
      <dl className="flex flex-col gap-1">
        <div className="flex gap-2">
          <dt className="sr-only">{t('training.when')}</dt>
          <dd className="font-bold">{when}</dd>
        </div>
        <div className="flex items-start gap-2">
          <dt>
            <MapPin aria-hidden="true" className="mt-0.5 size-5 text-muted-foreground" />
            <span className="sr-only">{t('training.where')}</span>
          </dt>
          <dd>{event.location}</dd>
        </div>
      </dl>
      {!compact ? <p className="leading-relaxed text-pretty text-muted-foreground">{pick(event.description, locale)}</p> : null}
      {event.isDemo ? (
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <DemoBadge />
          <span className="text-muted-foreground">{t('training.demoEvent')}</span>
        </p>
      ) : null}
      <div className="mt-auto flex flex-col gap-2 sm:flex-row">
        <ExternalA
          href={googleCalendarUrl(event, locale)}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full no-underline border-2 border-primary px-5 font-heading font-bold text-primary hover:bg-primary-soft"
        >
          <CalendarPlus aria-hidden="true" className="size-5" />
          {t('training.addToCalendar')}
        </ExternalA>
        {event.registrationUrl ? (
          <ExternalA
            href={event.registrationUrl}
            className="inline-flex min-h-12 items-center justify-center rounded-full no-underline bg-primary px-5 font-heading font-bold text-primary-foreground hover:bg-primary/90"
          >
            {t('training.register')}
          </ExternalA>
        ) : null}
      </div>
      {!compact ? <SourceNote source={event.source} /> : null}
    </article>
  )
}
