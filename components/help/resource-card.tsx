'use client'

import { Accessibility, MapPin, Navigation, Phone } from 'lucide-react'
import { DemoBadge, ExternalA, SourceNote } from '@/components/common/bits'
import { usePreferences } from '@/components/providers/preferences-provider'
import { directionsUrl, formatMiles } from '@/lib/recommend'
import type { Resource } from '@/lib/types'
import { card } from '@/lib/ui'
import { cn } from '@/lib/utils'

export function ResourceCard({ resource, compact = false }: { resource: Resource; compact?: boolean }) {
  const { t } = usePreferences()
  const miles = formatMiles(resource.distanceMeters)

  return (
    <article className={cn(card, 'flex flex-col gap-3 p-5')}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-bold text-primary">
          {t(`help.categories.${resource.category}`)}
        </span>
        {resource.isDemo ? <DemoBadge /> : null}
      </div>
      <h3 className="font-heading text-xl font-extrabold text-balance">{resource.name}</h3>
      {miles ? <p className="font-bold">{t('common.miles', { n: miles })}</p> : null}

      {!compact ? (
        <dl className="flex flex-col gap-2 text-base">
          <div className="flex gap-2">
            <dt>
              <MapPin aria-hidden="true" className="mt-0.5 size-5 text-muted-foreground" />
              <span className="sr-only">{t('help.address')}</span>
            </dt>
            <dd>{resource.address ?? t('help.noAddress')}</dd>
          </div>
          <div className="flex gap-2">
            <dt>
              <Phone aria-hidden="true" className="mt-0.5 size-5 text-muted-foreground" />
              <span className="sr-only">{t('help.phone')}</span>
            </dt>
            <dd>
              {resource.phone ? (
                <a href={`tel:${resource.phone.replace(/[^\d+]/g, '')}`} className="font-bold text-primary underline">
                  {resource.phone}
                </a>
              ) : (
                t('help.noPhone')
              )}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt>
              <Accessibility aria-hidden="true" className="mt-0.5 size-5 text-muted-foreground" />
              <span className="sr-only">{t('help.accessibility')}</span>
            </dt>
            <dd>{resource.accessibility ?? t('help.noAccessibility')}</dd>
          </div>
        </dl>
      ) : null}

      <ExternalA
        href={directionsUrl(resource.lat, resource.lon)}
        className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-full no-underline border-2 border-primary px-5 font-heading font-bold text-primary hover:bg-primary-soft"
      >
        <Navigation aria-hidden="true" className="size-5" />
        {t('common.directions')}
        <span className="sr-only">: {resource.name}</span>
      </ExternalA>
      {!compact ? <SourceNote source={resource.source} /> : null}
    </article>
  )
}
