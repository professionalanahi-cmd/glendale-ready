'use client'

import { ArrowRight, MapPinOff, RotateCw, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { DemoBadge, InfoNote, OfficialAlerts } from '@/components/common/bits'
import { ResourceCard } from '@/components/help/resource-card'
import { HazardCard } from '@/components/hazards/hazard-card'
import { CourseCard } from '@/components/learn/course-card'
import { useProfile } from '@/components/providers/auth-provider'
import { usePreferences } from '@/components/providers/preferences-provider'
import { EventCard } from '@/components/training/event-card'
import { trainingEvents } from '@/lib/content/catalog'
import { useHazards, useResources } from '@/lib/hooks'
import { recommendedCourses } from '@/lib/recommend'
import type { UserProfile } from '@/lib/types'
import { btn, card } from '@/lib/ui'
import { cn } from '@/lib/utils'

function Section({
  id,
  title,
  help,
  href,
  badge,
  children,
}: {
  id: string
  title: string
  help: string
  href?: string
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  const { t } = usePreferences()
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 id={id} className="font-heading text-2xl font-extrabold sm:text-3xl">
              {title}
            </h2>
            {badge}
          </div>
          <p className="text-muted-foreground">{help}</p>
        </div>
        {href ? (
          <Link href={href} className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 font-bold text-primary hover:bg-primary-soft">
            {t('dashboard.seeAll')}
            <span className="sr-only">: {title}</span>
            <ArrowRight aria-hidden="true" className="size-5" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  const { t } = usePreferences()
  return (
    <div role="status" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <span className="sr-only">{t('common.loading')}</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} aria-hidden="true" className={cn(card, 'h-56 animate-pulse bg-muted motion-reduce:animate-none')} />
      ))}
    </div>
  )
}

export function ImportantForYou({ profile }: { profile: UserProfile }) {
  const { t } = usePreferences()
  const { data, error, isLoading, mutate } = useHazards(profile)
  const hasLocation = Boolean(profile.home || profile.current)

  let body: React.ReactNode
  if (!hasLocation) {
    body = (
      <div className={cn(card, 'flex flex-col items-start gap-4 p-6')}>
        <MapPinOff aria-hidden="true" className="size-8 text-primary" />
        <p className="text-lg">{t('help.needHome')}</p>
        <Link href="/settings/profile?section=location" className={btn.primary}>
          {t('preparedness.editLocations')}
        </Link>
      </div>
    )
  } else if (isLoading) {
    body = <CardSkeleton />
  } else if (error || !data) {
    body = (
      <div role="alert" className={cn(card, 'flex flex-col items-start gap-4 p-6')}>
        <p className="text-lg">{t('hazards.serviceUnavailable')}</p>
        <button type="button" className={btn.outline} onClick={() => mutate()}>
          <RotateCw aria-hidden="true" />
          {t('common.retry')}
        </button>
      </div>
    )
  } else {
    const unavailable = [data.home, data.current].some((r) => r?.status === 'unavailable')
    body = (
      <div className="flex flex-col gap-4">
        {unavailable ? <InfoNote>{data.home?.message ?? data.current?.message ?? t('hazards.noDataForLocation')}</InfoNote> : null}
        {data.hazards.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.hazards.map((h) => (
              <HazardCard key={h.id} hazard={h} />
            ))}
          </div>
        ) : !unavailable ? (
          <div className={cn(card, 'flex items-start gap-4 p-6')}>
            <ShieldCheck aria-hidden="true" className="size-8 shrink-0 text-primary" />
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-xl font-extrabold">{t('hazards.noneTitle')}</h3>
              <p className="leading-relaxed">{t('hazards.noneBody')}</p>
            </div>
          </div>
        ) : null}
        <p className="text-sm leading-relaxed text-muted-foreground">{t('hazards.mapsNote')}</p>
      </div>
    )
  }

  return (
    <Section
      id="important"
      title={t('dashboard.importantTitle')}
      help={t('dashboard.importantHelp')}
      badge={data?.mode === 'demo' ? <DemoBadge /> : null}
    >
      {body}
    </Section>
  )
}

function LearnPreview({ profile }: { profile: UserProfile }) {
  const { t } = usePreferences()
  const { data } = useHazards(profile)
  const list = recommendedCourses(data?.hazards, profile).slice(0, 3)
  return (
    <Section id="learn" title={t('dashboard.learnTitle')} help={t('dashboard.learnHelp')} href="/learn">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <CourseCard key={c.id} course={c} compact />
        ))}
      </div>
    </Section>
  )
}

function HelpPreview({ profile }: { profile: UserProfile }) {
  const { t } = usePreferences()
  const point = profile.home ?? profile.current
  const { data, isLoading, error } = useResources(point)
  const list = data?.resources.slice(0, 3) ?? []
  return (
    <Section
      id="help"
      title={t('dashboard.helpTitle')}
      help={t('dashboard.helpHelp')}
      href="/help"
      badge={data?.mode === 'demo' ? <DemoBadge /> : null}
    >
      {!point ? (
        <p className="text-lg">{t('help.needHome')}</p>
      ) : isLoading ? (
        <CardSkeleton />
      ) : error || data?.status === 'unavailable' ? (
        <InfoNote>{data?.message ?? t('hazards.serviceUnavailable')}</InfoNote>
      ) : list.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => (
            <ResourceCard key={r.id} resource={r} compact />
          ))}
        </div>
      ) : (
        <p className="text-lg">{t('help.empty')}</p>
      )}
    </Section>
  )
}

function TrainingPreview() {
  const { t } = usePreferences()
  const upcoming = trainingEvents
    .filter((e) => new Date(e.end).getTime() >= Date.now())
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 2)
  return (
    <Section id="training" title={t('dashboard.trainingTitle')} help={t('dashboard.trainingHelp')} href="/training">
      {upcoming.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {upcoming.map((e) => (
            <EventCard key={e.id} event={e} compact />
          ))}
        </div>
      ) : (
        <p className="text-lg">{t('training.empty')}</p>
      )}
    </Section>
  )
}

export function Dashboard() {
  const { t } = usePreferences()
  const { profile } = useProfile()
  if (!profile) return null
  const firstName = profile.displayName.split(' ')[0] || profile.email.split('@')[0]

  return (
    <>
      <div className="rounded-b-[2.5rem] bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 pt-4 pb-10 sm:pb-14">
          <p className="text-lg font-bold text-sun">{t('dashboard.greeting', { name: firstName })}</p>
          <h1 className="max-w-2xl font-heading text-4xl font-extrabold text-balance sm:text-5xl">{t('dashboard.title')}</h1>
          <p className="max-w-2xl leading-relaxed text-pretty text-ink-foreground/85">{t('dashboard.prepareExplainer')}</p>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-5 py-10">
        <ImportantForYou profile={profile} />
        <LearnPreview profile={profile} />
        <HelpPreview profile={profile} />
        <TrainingPreview />
        <OfficialAlerts />
      </div>
    </>
  )
}
