'use client'

import { Activity, ArrowRight, Droplets, Flame, Mountain, Waves } from 'lucide-react'
import Link from 'next/link'
import { SourceNote } from '@/components/common/bits'
import { usePreferences } from '@/components/providers/preferences-provider'
import type { Hazard, HazardCategory } from '@/lib/types'
import { card } from '@/lib/ui'
import { cn } from '@/lib/utils'

export const HAZARD_STYLE: Record<HazardCategory, { icon: typeof Flame; tile: string }> = {
  earthquake: { icon: Activity, tile: 'bg-sun text-ink' },
  wildfire: { icon: Flame, tile: 'bg-coral text-ink-foreground' },
  flood: { icon: Waves, tile: 'bg-primary text-primary-foreground' },
  'dam-inundation': { icon: Droplets, tile: 'bg-primary text-primary-foreground' },
  'debris-flow': { icon: Mountain, tile: 'bg-ink text-ink-foreground' },
}

export function HazardIcon({ category, className }: { category: HazardCategory; className?: string }) {
  const { icon: Icon, tile } = HAZARD_STYLE[category]
  return (
    <span aria-hidden="true" className={cn('flex size-14 shrink-0 items-center justify-center rounded-2xl', tile, className)}>
      <Icon className="size-7" />
    </span>
  )
}

export function hazardSummaryKey(h: Hazard) {
  if (h.applicableToHome && h.applicableToCurrentLocation) return 'hazards.summary.both'
  return h.applicableToHome ? 'hazards.summary.home' : 'hazards.summary.current'
}

export function AppliesTo({ hazard }: { hazard: Hazard }) {
  const { t } = usePreferences()
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="sr-only">{t('hazards.appliesTo')}:</span>
      {hazard.applicableToHome ? (
        <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-bold text-primary">{t('common.home')}</span>
      ) : null}
      {hazard.applicableToCurrentLocation ? (
        <span className="rounded-full bg-sun-soft px-3 py-1 text-sm font-bold text-ink">{t('common.current')}</span>
      ) : null}
    </div>
  )
}

export function HazardCard({ hazard }: { hazard: Hazard }) {
  const { t } = usePreferences()
  const name = t(`hazards.names.${hazard.category}`)
  const sourceClass = hazard.exposure.home ?? hazard.exposure.current

  return (
    <article className={cn(card, 'flex flex-col gap-4 p-5')}>
      <div className="flex items-start gap-4">
        <HazardIcon category={hazard.category} />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-sm font-bold tracking-wide text-primary uppercase">{t('dashboard.categoryPrepare')}</p>
          <h3 className="font-heading text-2xl font-extrabold text-balance">{name}</h3>
        </div>
      </div>
      <p className="text-lg leading-relaxed text-pretty">{t(hazardSummaryKey(hazard), { name })}</p>
      <AppliesTo hazard={hazard} />
      {sourceClass ? (
        <p className="text-sm">
          <span className="text-muted-foreground">{t('hazards.sourceClass')}: </span>
          <span className="font-bold">{sourceClass}</span>
        </p>
      ) : null}
      <Link
        href={`/hazards/${hazard.category}`}
        className="mt-auto inline-flex min-h-12 items-center justify-between gap-2 rounded-full bg-ink px-5 font-heading font-bold text-ink-foreground hover:bg-ink/90"
      >
        {t(`hazards.cta.${hazard.category}`)}
        <span className="sr-only">: {name}</span>
        <ArrowRight aria-hidden="true" className="size-5" />
      </Link>
      <SourceNote source={hazard.source} />
    </article>
  )
}
