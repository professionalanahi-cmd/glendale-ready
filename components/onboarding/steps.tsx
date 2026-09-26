'use client'

import { Minus, Plus } from 'lucide-react'
import { ChoiceCard, Fieldset, TextField } from '@/components/common/fields'
import { LocationPicker } from '@/components/location/location-picker'
import { usePreferences } from '@/components/providers/preferences-provider'
import { SUPPORTED_LOCALES } from '@/lib/config'
import { localeNames } from '@/lib/i18n'
import { NEED_KEYS } from '@/lib/profile'
import type { Gender, UserProfile } from '@/lib/types'
import { InfoNote } from '@/components/common/bits'

export interface StepProps {
  draft: UserProfile
  update: (patch: Partial<UserProfile>) => void
  errors: Record<string, string | undefined>
}

const GENDERS: Gender[] = ['woman', 'man', 'nonbinary', 'self-describe', 'prefer-not']
export const PET_KINDS = ['dog', 'cat', 'bird', 'small', 'other'] as const

export function AboutStep({ draft, update, errors, ageText, setAgeText }: StepProps & { ageText: string; setAgeText: (v: string) => void }) {
  const { t } = usePreferences()
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h3 className="font-heading text-2xl font-extrabold">{t('onboarding.ageQuestion')}</h3>
        <TextField
          label={t('onboarding.ageLabel')}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={3}
          value={ageText}
          onChange={(e) => setAgeText(e.target.value.replace(/\D/g, ''))}
          error={errors.age}
          className="max-w-48"
        />
      </div>

      <Fieldset legend={t('onboarding.genderQuestion')} help={t('onboarding.genderHelp')}>
        <div className="grid gap-3 sm:grid-cols-2">
          {GENDERS.map((g) => (
            <ChoiceCard
              key={g}
              type="radio"
              name="gender"
              checked={draft.gender === g}
              onChange={() => update({ gender: g })}
              label={t(`onboarding.genders.${g}`)}
            />
          ))}
        </div>
        {draft.gender === 'self-describe' ? (
          <TextField
            label={t('onboarding.genderSelfLabel')}
            value={draft.genderSelfDescribe ?? ''}
            maxLength={60}
            onChange={(e) => update({ genderSelfDescribe: e.target.value })}
          />
        ) : null}
      </Fieldset>
    </div>
  )
}

export function HouseholdStep({ draft, update }: StepProps) {
  const { t } = usePreferences()
  const size = draft.householdSize ?? 1
  const setSize = (n: number) => update({ householdSize: Math.min(20, Math.max(1, n)) })

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h3 className="font-heading text-2xl font-extrabold">{t('onboarding.householdQuestion')}</h3>
        <p className="text-muted-foreground">{t('onboarding.householdHelp')}</p>
        <div className="flex items-center gap-4" role="group" aria-label={t('onboarding.householdLabel')}>
          <button
            type="button"
            onClick={() => setSize(size - 1)}
            disabled={size <= 1}
            className="flex size-14 items-center justify-center rounded-full border-2 border-primary bg-card text-primary hover:bg-primary-soft disabled:opacity-40"
          >
            <Minus aria-hidden="true" className="size-6" />
            <span className="sr-only">{t('onboarding.decrease')}</span>
          </button>
          <output aria-live="polite" className="min-w-16 text-center font-heading text-5xl font-extrabold tabular-nums">
            {size}
          </output>
          <button
            type="button"
            onClick={() => setSize(size + 1)}
            disabled={size >= 20}
            className="flex size-14 items-center justify-center rounded-full border-2 border-primary bg-card text-primary hover:bg-primary-soft disabled:opacity-40"
          >
            <Plus aria-hidden="true" className="size-6" />
            <span className="sr-only">{t('onboarding.increase')}</span>
          </button>
          <span className="text-lg text-muted-foreground">
            {size === 1 ? t('onboarding.person') : t('onboarding.people', { n: size })}
          </span>
        </div>
      </section>

      <Fieldset legend={t('onboarding.petsQuestion')} help={t('onboarding.petsHelp')}>
        <div className="grid grid-cols-2 gap-3 sm:max-w-md">
          <ChoiceCard
            type="radio"
            name="pets"
            checked={draft.pets.has}
            onChange={() => update({ pets: { ...draft.pets, has: true } })}
            label={t('common.yes')}
          />
          <ChoiceCard
            type="radio"
            name="pets"
            checked={!draft.pets.has}
            onChange={() => update({ pets: { has: false, kinds: [] } })}
            label={t('common.no')}
          />
        </div>
      </Fieldset>

      {draft.pets.has ? (
        <Fieldset legend={t('onboarding.petKindsLabel')}>
          <div className="grid gap-3 sm:grid-cols-2">
            {PET_KINDS.map((kind) => {
              const checked = draft.pets.kinds.includes(kind)
              return (
                <ChoiceCard
                  key={kind}
                  type="checkbox"
                  name="petKinds"
                  checked={checked}
                  onChange={(on) =>
                    update({
                      pets: {
                        has: true,
                        kinds: on ? [...draft.pets.kinds, kind] : draft.pets.kinds.filter((k) => k !== kind),
                      },
                    })
                  }
                  label={t(`onboarding.petKinds.${kind}`)}
                />
              )
            })}
          </div>
        </Fieldset>
      ) : null}
    </div>
  )
}

export function LocationStep({ draft, update }: StepProps) {
  const { t } = usePreferences()
  return (
    <div className="flex flex-col gap-10">
      <InfoNote>{t('onboarding.whyLocation')}</InfoNote>
      <LocationPicker
        title={t('onboarding.homeQuestion')}
        help={t('onboarding.homeHelp')}
        value={draft.home}
        onChange={(home) => update({ home })}
      />
      <LocationPicker
        title={t('onboarding.currentQuestion')}
        help={t('onboarding.currentHelp')}
        value={draft.current}
        homePoint={draft.home}
        onChange={(current) => update({ current })}
      />
    </div>
  )
}

export function NeedsStep({ draft, update }: StepProps) {
  const { t, setPreference } = usePreferences()
  return (
    <div className="flex flex-col gap-10">
      <Fieldset legend={t('onboarding.needsQuestion')} help={t('onboarding.needsHelp')}>
        <div className="grid gap-3 sm:grid-cols-2">
          {NEED_KEYS.map((key) => (
            <ChoiceCard
              key={key}
              type="checkbox"
              name="needs"
              checked={draft.needs[key]}
              onChange={(on) => update({ needs: { ...draft.needs, [key]: on } })}
              label={t(`onboarding.needs.${key}`)}
            />
          ))}
        </div>
        <TextField
          label={t('onboarding.otherNeeds')}
          value={draft.needs.other}
          maxLength={300}
          onChange={(e) => update({ needs: { ...draft.needs, other: e.target.value } })}
        />
      </Fieldset>

      <Fieldset legend={t('onboarding.contactTitle')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label={t('onboarding.contactName')}
            autoComplete="off"
            maxLength={80}
            value={draft.emergencyContact.name}
            onChange={(e) => update({ emergencyContact: { ...draft.emergencyContact, name: e.target.value } })}
          />
          <TextField
            label={t('onboarding.contactPhone')}
            type="tel"
            inputMode="tel"
            autoComplete="off"
            maxLength={30}
            value={draft.emergencyContact.phone}
            onChange={(e) => update({ emergencyContact: { ...draft.emergencyContact, phone: e.target.value } })}
          />
        </div>
      </Fieldset>

      <Fieldset legend={t('onboarding.languageQuestion')}>
        <div className="grid grid-cols-2 gap-3 sm:max-w-md">
          {SUPPORTED_LOCALES.map((loc) => (
            <ChoiceCard
              key={loc}
              type="radio"
              name="language"
              checked={draft.preferredLanguage === loc}
              onChange={() => {
                update({ preferredLanguage: loc })
                setPreference('locale', loc)
              }}
              label={localeNames[loc]}
            />
          ))}
        </div>
      </Fieldset>

      <Fieldset legend={t('onboarding.insuranceTitle')} help={t('onboarding.insuranceHelp')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label={t('onboarding.insuranceCarrier')}
            maxLength={80}
            value={draft.insurance.carrier}
            onChange={(e) => update({ insurance: { ...draft.insurance, carrier: e.target.value } })}
          />
          <TextField
            label={t('onboarding.healthPlan')}
            maxLength={80}
            value={draft.insurance.healthPlan}
            onChange={(e) => update({ insurance: { ...draft.insurance, healthPlan: e.target.value } })}
          />
        </div>
      </Fieldset>

      <Fieldset legend={t('onboarding.notificationsQuestion')} help={t('onboarding.notificationsHelp')}>
        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceCard
            type="radio"
            name="email"
            checked={draft.notifications.emailEnabled}
            onChange={() =>
              update({
                notifications: {
                  ...draft.notifications,
                  emailEnabled: true,
                  preparednessUpdates: true,
                  trainings: true,
                  courses: true,
                },
              })
            }
            label={t('onboarding.emailYes')}
          />
          <ChoiceCard
            type="radio"
            name="email"
            checked={!draft.notifications.emailEnabled}
            onChange={() => update({ notifications: { ...draft.notifications, emailEnabled: false } })}
            label={t('onboarding.emailNo')}
          />
        </div>
      </Fieldset>
    </div>
  )
}
