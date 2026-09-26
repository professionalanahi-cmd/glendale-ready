'use client'

import { MapPinOff } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { DemoBadge, InfoNote, PageHeader } from '@/components/common/bits'
import { FilterChips } from '@/components/common/filter-chips'
import { CardSkeleton } from '@/components/dashboard/dashboard'
import { useProfile } from '@/components/providers/auth-provider'
import { usePreferences } from '@/components/providers/preferences-provider'
import { useResources } from '@/lib/hooks'
import type { ResourceCategory } from '@/lib/types'
import { btn, card } from '@/lib/ui'
import { cn } from '@/lib/utils'
import { ResourceCard } from './resource-card'

type Filter = ResourceCategory | 'all'

export function NearbyHelp() {
  const { t } = usePreferences()
  const { profile } = useProfile()
  const point = profile?.home ?? profile?.current ?? null
  const { data, error, isLoading } = useResources(point)
  const [filter, setFilter] = useState<Filter>('all')

  if (!profile) return null

  const resources = data?.resources ?? []
  const available = Array.from(new Set(resources.map((r) => r.category)))
  const list = filter === 'all' ? resources.slice(0, 6) : resources.filter((r) => r.category === filter)

  const contact = [profile.emergencyContact.name, profile.emergencyContact.phone].filter(Boolean).join(' · ')
  const insurance = [profile.insurance.carrier, profile.insurance.healthPlan].filter(Boolean).join(' · ')

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-10">
      <PageHeader title={t('help.title')} subtitle={t('help.subtitle')}>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {point ? (
            <p className="text-lg">
              {t('help.near')}: <span className="font-bold">{point.label}</span>
            </p>
          ) : null}
          {data?.mode === 'demo' ? <DemoBadge /> : null}
        </div>
      </PageHeader>

      {!point ? (
        <div className={cn(card, 'flex flex-col items-start gap-4 p-6')}>
          <MapPinOff aria-hidden="true" className="size-8 text-primary" />
          <p className="text-lg">{t('help.needHome')}</p>
          <Link href="/settings/profile?section=location" className={btn.primary}>
            {t('preparedness.editLocations')}
          </Link>
        </div>
      ) : isLoading ? (
        <CardSkeleton count={6} />
      ) : error || data?.status === 'unavailable' ? (
        <InfoNote>{data?.message ?? t('hazards.serviceUnavailable')}</InfoNote>
      ) : (
        <div className="flex flex-col gap-6">
          {available.length > 1 ? (
            <FilterChips<Filter>
              label={t('help.filterLabel')}
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: t('help.allTypes') },
                ...available.map((c) => ({ value: c, label: t(`help.categories.${c}`) })),
              ]}
            />
          ) : null}
          <div aria-live="polite">
            {list.length ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {list.map((r) => (
                  <ResourceCard key={r.id} resource={r} />
                ))}
              </div>
            ) : (
              <p className="text-lg">{t('help.empty')}</p>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{t('help.distanceNote')}</p>
          {data?.notConnected.length ? (
            <InfoNote>
              <p className="font-bold">{t('help.notConnected')}</p>
              <p>
                {t('help.notConnectedBody')} {data.notConnected.map((c) => t(`help.categories.${c}`)).join(', ')}
              </p>
            </InfoNote>
          ) : null}
        </div>
      )}

      {contact || insurance ? (
        <section aria-labelledby="your-plan" className={cn(card, 'flex flex-col gap-3 p-6')}>
          <h2 id="your-plan" className="font-heading text-2xl font-extrabold">
            {t('help.yourPlan')}
          </h2>
          <dl className="flex flex-col gap-2 text-lg">
            {contact ? (
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-muted-foreground sm:w-48">{t('preparedness.contact')}</dt>
                <dd className="font-bold">{contact}</dd>
              </div>
            ) : null}
            {insurance ? (
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-muted-foreground sm:w-48">{t('preparedness.insurance')}</dt>
                <dd className="font-bold">{insurance}</dd>
              </div>
            ) : null}
          </dl>
          {insurance ? <p className="text-sm text-muted-foreground">{t('preparedness.insuranceNote')}</p> : null}
        </section>
      ) : null}
    </div>
  )
}
