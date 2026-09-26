'use client'

import { Activity, CloudLightning, Flame } from 'lucide-react'
import { ExternalA } from '@/components/common/bits'
import { usePreferences } from '@/components/providers/preferences-provider'
import type { LiveEmergency, LiveFeed } from '@/lib/gis/types'
import { card } from '@/lib/ui'
import { cn } from '@/lib/utils'
import { formatKm, formatNumber, formatWhen } from './format'
import { ProvenanceLine } from './provenance'

function FeedCard<T>({
  feed,
  title,
  icon,
  empty,
  render,
}: {
  feed: LiveFeed<T> | undefined
  title: string
  icon: React.ReactNode
  empty: string
  render: (item: T) => React.ReactNode
}) {
  const { t } = usePreferences()
  return (
    <article className={cn(card, 'flex flex-col gap-4 p-5')}>
      <h3 className="flex items-center gap-2 font-heading text-lg font-extrabold">
        {icon}
        {title}
      </h3>
      {!feed ? (
        <div aria-hidden="true" className="h-16 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
      ) : feed.status === 'unavailable' ? (
        <p className="leading-relaxed">{t('emergency.feedDown')}</p>
      ) : feed.items.length ? (
        <ul className="flex flex-col gap-3">{feed.items.map(render)}</ul>
      ) : (
        <p className="leading-relaxed text-muted-foreground">{empty}</p>
      )}
      {feed ? (
        <ProvenanceLine
          className="mt-auto"
          agency={feed.source.agency}
          url={feed.source.url}
          retrievedAt={feed.retrievedAt}
        />
      ) : null}
    </article>
  )
}

export function LiveFeeds({ data }: { data: LiveEmergency | undefined }) {
  const { t, locale } = usePreferences()
  return (
    <section aria-labelledby="live-now" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 id="live-now" className="font-heading text-xl font-extrabold">
          {t('emergency.liveTitle')}
        </h3>
        <p className="leading-relaxed text-muted-foreground">{t('emergency.liveHelp')}</p>
      </div>
      <div aria-live="polite" className="grid gap-4 lg:grid-cols-3">
        <FeedCard
          feed={data?.weather}
          title={t('emergency.weather')}
          icon={<CloudLightning aria-hidden="true" className="size-5 text-primary" />}
          empty={t('emergency.noWeather')}
          render={(a) => (
            <li key={a.id} className="flex flex-col gap-1 rounded-2xl bg-coral-soft p-3">
              <p className="font-bold">{a.event}</p>
              {a.headline && a.headline !== a.event ? <p className="text-sm leading-relaxed">{a.headline}</p> : null}
              {a.expires ? (
                <p className="text-sm text-muted-foreground">{t('emergency.until', { time: formatWhen(a.expires, locale) })}</p>
              ) : null}
            </li>
          )}
        />
        <FeedCard
          feed={data?.earthquakes}
          title={t('emergency.quakes')}
          icon={<Activity aria-hidden="true" className="size-5 text-primary" />}
          empty={t('emergency.noQuakes')}
          render={(q) => (
            <li key={q.id} className="flex items-start gap-3">
              <span className="inline-flex min-w-12 justify-center rounded-full bg-sun-soft px-2 py-1 font-heading font-extrabold">
                {q.magnitude.toFixed(1)}
              </span>
              <div className="flex flex-col">
                <ExternalA href={q.url} className="font-bold text-foreground no-underline hover:underline">
                  {q.place}
                </ExternalA>
                <span className="text-sm text-muted-foreground">
                  {formatWhen(q.time, locale)} · {t('emergency.away', { distance: formatKm(q.distanceKm, locale) })}
                </span>
              </div>
            </li>
          )}
        />
        <FeedCard
          feed={data?.fires}
          title={t('emergency.fires')}
          icon={<Flame aria-hidden="true" className="size-5 text-coral" />}
          empty={t('emergency.noFires')}
          render={(f) => (
            <li key={f.id} className="flex flex-col gap-1">
              <p className="font-bold">{f.name}</p>
              <p className="text-sm text-muted-foreground">
                {[
                  t('emergency.away', { distance: formatKm(f.distanceKm, locale) }),
                  f.acres !== undefined ? t('emergency.acres', { acres: formatNumber(Math.round(f.acres), locale) }) : null,
                  f.containment !== undefined ? t('emergency.contained', { pct: Math.round(f.containment) }) : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </li>
          )}
        />
      </div>
    </section>
  )
}
