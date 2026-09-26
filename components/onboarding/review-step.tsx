'use client'

import { Pencil } from 'lucide-react'
import { usePreferences } from '@/components/providers/preferences-provider'
import { localeNames } from '@/lib/i18n'
import { NEED_KEYS } from '@/lib/profile'
import type { UserProfile } from '@/lib/types'
import { card } from '@/lib/ui'
import { cn } from '@/lib/utils'

export type StepId = 'about' | 'household' | 'location' | 'needs' | 'review'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="text-muted-foreground sm:w-48 sm:shrink-0">{label}</dt>
      <dd className="font-bold text-pretty">{value}</dd>
    </div>
  )
}

function Section({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  const { t } = usePreferences()
  return (
    <section className={cn(card, 'flex flex-col gap-4 p-5')}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-heading text-xl font-extrabold">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-bold text-primary hover:bg-primary-soft"
        >
          <Pencil aria-hidden="true" className="size-4" />
          {t('common.edit')}
          <span className="sr-only">{title}</span>
        </button>
      </div>
      <dl className="flex flex-col gap-3">{children}</dl>
    </section>
  )
}

export function ReviewStep({ draft, goTo }: { draft: UserProfile; goTo: (step: StepId) => void }) {
  const { t } = usePreferences()
  const notSet = t('common.notSet')
  const needs = NEED_KEYS.filter((k) => draft.needs[k]).map((k) => t(`onboarding.needs.${k}`))
  if (draft.needs.other.trim()) needs.push(draft.needs.other.trim())
  const gender =
    draft.gender === 'self-describe' && draft.genderSelfDescribe
      ? draft.genderSelfDescribe
      : draft.gender
        ? t(`onboarding.genders.${draft.gender}`)
        : notSet
  const size = draft.householdSize ?? 1
  const contact = [draft.emergencyContact.name, draft.emergencyContact.phone].filter(Boolean).join(' · ')
  const insurance = [draft.insurance.carrier, draft.insurance.healthPlan].filter(Boolean).join(' · ')

  return (
    <div className="flex flex-col gap-4">
      <Section title={t('onboarding.steps.about')} onEdit={() => goTo('about')}>
        <Row label={t('onboarding.ageLabel')} value={draft.age ? t('onboarding.years', { n: draft.age }) : notSet} />
        <Row label={t('onboarding.genderQuestion')} value={gender} />
      </Section>
      <Section title={t('onboarding.steps.household')} onEdit={() => goTo('household')}>
        <Row label={t('onboarding.householdLabel')} value={size === 1 ? t('onboarding.person') : t('onboarding.people', { n: size })} />
        <Row
          label={t('onboarding.petsQuestion')}
          value={
            draft.pets.has
              ? [t('common.yes'), ...draft.pets.kinds.map((k) => t(`onboarding.petKinds.${k}`))].join(' · ')
              : t('common.no')
          }
        />
      </Section>
      <Section title={t('onboarding.steps.location')} onEdit={() => goTo('location')}>
        <Row label={t('common.home')} value={draft.home?.label ?? notSet} />
        <Row label={t('common.current')} value={draft.current?.label ?? notSet} />
      </Section>
      <Section title={t('onboarding.steps.needs')} onEdit={() => goTo('needs')}>
        <Row label={t('onboarding.steps.needs')} value={needs.length ? needs.join(' · ') : t('onboarding.none')} />
        <Row label={t('onboarding.contactTitle')} value={contact || notSet} />
        <Row label={t('onboarding.languageQuestion')} value={localeNames[draft.preferredLanguage]} />
        <Row label={t('onboarding.insuranceTitle')} value={insurance || notSet} />
        <Row
          label={t('onboarding.notificationsQuestion')}
          value={draft.notifications.emailEnabled ? t('onboarding.emailYes') : t('onboarding.emailNo')}
        />
      </Section>
    </div>
  )
}
