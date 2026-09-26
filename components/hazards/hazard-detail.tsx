'use client'

import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { DemoBadge, ExternalA, InfoNote, OfficialAlerts, SourceNote } from '@/components/common/bits'
import { ListenButton } from '@/components/common/listen-button'
import { CardSkeleton } from '@/components/dashboard/dashboard'
import { CourseCard } from '@/components/learn/course-card'
import { useProfile } from '@/components/providers/auth-provider'
import { usePreferences } from '@/components/providers/preferences-provider'
import { getCourse } from '@/lib/content/courses'
import { useHazards } from '@/lib/hooks'
import { pick } from '@/lib/i18n'
import type { Course, HazardCategory, HazardLayerFinding } from '@/lib/types'
import { card } from '@/lib/ui'
import { cn } from '@/lib/utils'
import { AppliesTo, HazardIcon, hazardSummaryKey } from './hazard-card'

function Findings({ title, findings }: { title: string; findings: HazardLayerFinding[] }) {
  const { t } = usePreferences()
  if (!findings.length) return null
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-heading text-lg font-extrabold">{title}</h3>
      <ul className="flex flex-col gap-3">
        {findings.map((f) => (
          <li key={f.datasetId} className="flex flex-col gap-1 rounded-2xl bg-muted p-4">
            <p className="font-bold">{f.datasetTitle}</p>
            <p>
              {t(`hazards.status.${f.status}`)}
              {f.sourceClass ? ` · ${t('hazards.sourceClass')}: ${f.sourceClass}` : null}
            </p>
            {f.notes.map((n) => (
              <p key={n} className="text-sm text-muted-foreground">
                {n}
              </p>
            ))}
            {f.disclaimer ? <p className="text-sm text-muted-foreground">{f.disclaimer}</p> : null}
            {f.layerUrl ? (
              <ExternalA href={f.layerUrl} className="text-sm">
                {t('common.officialSource')}
              </ExternalA>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function HazardDetail({ category }: { category: HazardCategory }) {
  const { t, locale } = usePreferences()
  const { profile } = useProfile()
  const { data, isLoading } = useHazards(profile)
  const hazard = data?.hazards.find((h) => h.category === category)
  const name = t(`hazards.names.${category}`)
  const recommended = (hazard?.recommendedCourseIds ?? []).map(getCourse).filter((c): c is Course => Boolean(c))
  const steps = recommended[0]?.before ?? []

  const back = (
    <Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 self-start rounded-full px-3 font-bold text-primary hover:bg-primary-soft">
      <ArrowLeft aria-hidden="true" className="size-5" />
      {t('hazards.backToHome')}
    </Link>
  )

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-5 py-10">
        {back}
        <CardSkeleton count={2} />
      </div>
    )
  }

  if (!hazard) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-5 py-10">
        {back}
        <h1 className="font-heading text-3xl font-extrabold">{name}</h1>
        <InfoNote>{t('hazards.notFound')}</InfoNote>
      </div>
    )
  }

  const explanation = t(`hazards.explain.${category}`)
  const readAloud = [name, t(hazardSummaryKey(hazard), { name }), explanation, ...steps.map((s) => pick(s, locale))].join('. ')

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-5 py-10">
      {back}
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <HazardIcon category={category} className="size-16" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold tracking-wide text-primary uppercase">{t('dashboard.categoryPrepare')}</p>
            <h1 className="font-heading text-4xl font-extrabold text-balance">{name}</h1>
          </div>
        </div>
        <p className="text-xl leading-relaxed text-pretty">{t(hazardSummaryKey(hazard), { name })}</p>
        <div className="flex flex-wrap items-center gap-3">
          <AppliesTo hazard={hazard} />
          {data?.mode === 'demo' ? <DemoBadge /> : null}
          <ListenButton text={readAloud} />
        </div>
      </header>

      <section aria-labelledby="means" className={cn(card, 'flex flex-col gap-3 p-6')}>
        <h2 id="means" className="font-heading text-2xl font-extrabold">
          {t('hazards.whatItMeans')}
        </h2>
        <p className="text-lg leading-relaxed text-pretty">{explanation}</p>
        <p className="leading-relaxed text-muted-foreground">{t('hazards.mapsNote')}</p>
      </section>

      {steps.length ? (
        <section aria-labelledby="todo" className={cn(card, 'flex flex-col gap-4 bg-sun-soft p-6 ring-sun')}>
          <h2 id="todo" className="font-heading text-2xl font-extrabold text-ink">
            {t('hazards.whatToDo')}
          </h2>
          <ul className="flex flex-col gap-3">
            {steps.map((s) => (
              <li key={s.en} className="flex items-start gap-3 text-lg text-ink">
                <CheckCircle2 aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" />
                {pick(s, locale)}
              </li>
            ))}
          </ul>
          <SourceNote source={recommended[0]?.source} className="text-ink/80" />
        </section>
      ) : null}

      <details className={cn(card, 'group p-6')}>
        <summary className="cursor-pointer font-heading text-xl font-extrabold">{t('hazards.details')}</summary>
        <div className="flex flex-col gap-6 pt-4">
          <Findings title={t('common.home')} findings={hazard.findings.home.filter((f) => f.status === 'in_zone')} />
          <Findings title={t('common.current')} findings={hazard.findings.current.filter((f) => f.status === 'in_zone')} />
          <SourceNote source={hazard.source} />
        </div>
      </details>

      {recommended.length ? (
        <section aria-labelledby="courses" className="flex flex-col gap-4">
          <h2 id="courses" className="font-heading text-2xl font-extrabold">
            {t('hazards.recommendedCourses')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {recommended.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      ) : null}

      <OfficialAlerts />
    </div>
  )
}
