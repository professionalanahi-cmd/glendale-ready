'use client'

import { CheckCircle2, House, MapPin, Pencil } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { InfoNote, PageHeader } from '@/components/common/bits'
import { HazardIcon } from '@/components/hazards/hazard-card'
import { ReviewStep } from '@/components/onboarding/review-step'
import { useProfile } from '@/components/providers/auth-provider'
import { usePreferences } from '@/components/providers/preferences-provider'
import { useHazards } from '@/lib/hooks'
import { preparednessTips } from '@/lib/recommend'
import type { GeoPoint, Hazard } from '@/lib/types'
import { btn, card } from '@/lib/ui'
import { cn } from '@/lib/utils'

function LocationCard({
  kind,
  point,
  hazards,
  loading,
}: {
  kind: 'home' | 'current'
  point: GeoPoint | null
  hazards: Hazard[]
  loading: boolean
}) {
  const { t } = usePreferences()
  const Icon = kind === 'home' ? House : MapPin
  const here = hazards.filter((h) => (kind === 'home' ? h.applicableToHome : h.applicableToCurrentLocation))

  return (
    <section className={cn(card, 'flex flex-col gap-4 p-5')}>
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-heading text-xl font-extrabold">{t(kind === 'home' ? 'common.home' : 'common.current')}</h3>
          <p className="truncate text-muted-foreground">{point?.label ?? t('common.notSet')}</p>
        </div>
      </div>
      {point ? (
        <div className="flex flex-col gap-2">
          <h4 className="font-bold">{t('preparedness.hazardsAt')}</h4>
          {loading ? (
            <p className="text-muted-foreground">{t('common.loading')}</p>
          ) : here.length ? (
            <ul className="flex flex-wrap gap-2">
              {here.map((h) => (
                <li key={h.id}>
                  <Link
                    href={`/hazards/${h.category}`}
                    className="flex items-center gap-2 rounded-full bg-muted py-1 pr-4 pl-1 font-bold hover:bg-primary-soft"
                  >
                    <HazardIcon category={h.category} className="size-8 rounded-full [&_svg]:size-4" />
                    {t(`hazards.names.${h.category}`)}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">{t('preparedness.noHazardsHere')}</p>
          )}
        </div>
      ) : null}
    </section>
  )
}

export function Preparedness() {
  const { t } = usePreferences()
  const { profile } = useProfile()
  const router = useRouter()
  const { data, isLoading } = useHazards(profile)
  if (!profile) return null
  const hazards = data?.hazards ?? []
  const tips = preparednessTips(profile)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-10">
      <PageHeader title={t('preparedness.title')} subtitle={t('preparedness.subtitle')}>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/settings/profile" className={btn.primary}>
            <Pencil aria-hidden="true" />
            {t('preparedness.editProfile')}
          </Link>
          <Link href="/settings/profile?section=location" className={btn.outline}>
            {t('preparedness.editLocations')}
          </Link>
        </div>
      </PageHeader>

      <section aria-labelledby="locations" className="flex flex-col gap-4">
        <h2 id="locations" className="font-heading text-2xl font-extrabold">
          {t('preparedness.locations')}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <LocationCard kind="home" point={profile.home} hazards={hazards} loading={isLoading} />
          <LocationCard kind="current" point={profile.current} hazards={hazards} loading={isLoading} />
        </div>
      </section>

      <section aria-labelledby="tips" className={cn(card, 'flex flex-col gap-4 bg-sun-soft p-6 ring-sun')}>
        <h2 id="tips" className="font-heading text-2xl font-extrabold text-ink">
          {t('preparedness.tipsTitle')}
        </h2>
        <ul className="flex flex-col gap-3">
          {tips.map((key) => (
            <li key={key} className="flex items-start gap-3 text-lg text-ink">
              <CheckCircle2 aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" />
              {t(key)}
            </li>
          ))}
        </ul>
        <p className="text-sm text-ink/80">{t('preparedness.tipSource')}</p>
      </section>

      <section aria-labelledby="summary" className="flex flex-col gap-4">
        <h2 id="summary" className="font-heading text-2xl font-extrabold">
          {t('preparedness.household')}
        </h2>
        <ReviewStep draft={profile} goTo={(step) => router.push(`/settings/profile?section=${step}`)} />
        {profile.insurance.carrier || profile.insurance.healthPlan ? <InfoNote>{t('preparedness.insuranceNote')}</InfoNote> : null}
      </section>
    </div>
  )
}
