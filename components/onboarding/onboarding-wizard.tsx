'use client'

import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { FullPageLoading } from '@/components/app/require-auth'
import { LanguageToggle } from '@/components/common/language-toggle'
import { Logo } from '@/components/common/logo'
import { useAuth, useProfile } from '@/components/providers/auth-provider'
import { usePreferences } from '@/components/providers/preferences-provider'
import { createEmptyProfile } from '@/lib/profile'
import type { UserProfile } from '@/lib/types'
import { btn } from '@/lib/ui'
import { cn } from '@/lib/utils'
import { ReviewStep, type StepId } from './review-step'
import { AboutStep, HouseholdStep, LocationStep, NeedsStep } from './steps'

const STEPS: StepId[] = ['about', 'household', 'location', 'needs', 'review']

export function OnboardingWizard() {
  const { user } = useAuth()
  const { profile, isLoading, save } = useProfile()
  const { t, locale } = usePreferences()
  const router = useRouter()

  const [draft, setDraft] = useState<UserProfile | null>(null)
  const [ageText, setAgeText] = useState('')
  const [started, setStarted] = useState(false)
  const [index, setIndex] = useState(0)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (draft || isLoading || !user) return
    const base = profile ?? createEmptyProfile(user, locale)
    setDraft(base)
    setAgeText(base.age ? String(base.age) : '')
    if (profile) setStarted(true)
  }, [draft, isLoading, profile, user, locale])

  useEffect(() => {
    if (started) headingRef.current?.focus()
  }, [index, started])

  if (!draft) return <FullPageLoading />

  const step = STEPS[index]
  const update = (patch: Partial<UserProfile>) => setDraft((d) => (d ? { ...d, ...patch } : d))

  function validate(): UserProfile | null {
    if (!draft) return null
    if (step === 'about') {
      if (ageText) {
        const age = Number(ageText)
        if (!Number.isInteger(age) || age < 13 || age > 120) {
          setErrors({ age: t('onboarding.ageError') })
          return null
        }
        setErrors({})
        return { ...draft, age }
      }
      setErrors({})
      return { ...draft, age: null }
    }
    if (step === 'household' && draft.householdSize == null) return { ...draft, householdSize: 1 }
    return draft
  }

  async function persist(next: UserProfile) {
    setSaving(true)
    setSaveError(false)
    try {
      await save(next)
      return true
    } catch {
      setSaveError(true)
      return false
    } finally {
      setSaving(false)
    }
  }

  async function goNext(skip = false) {
    const next = skip ? draft : validate()
    if (!next) return
    if (skip) setErrors({})
    setDraft(next)
    if (await persist(next)) setIndex((i) => Math.min(i + 1, STEPS.length - 1))
  }

  async function finish() {
    if (!draft) return
    const ok = await persist({ ...draft, onboardingComplete: true })
    if (ok) router.push('/dashboard')
  }

  if (!started) {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-8 text-center">
          <Image
            src="/images/onboarding-home.png"
            alt=""
            width={320}
            height={320}
            priority
            className="size-56 object-contain sm:size-72"
          />
          <div className="flex flex-col gap-3">
            <h1 className="font-heading text-3xl font-extrabold text-balance sm:text-4xl">{t('onboarding.welcomeTitle')}</h1>
            <p className="mx-auto max-w-prose text-lg leading-relaxed text-pretty text-muted-foreground">
              {t('onboarding.welcomeBody')}
            </p>
          </div>
          <button type="button" className={cn(btn.primary, 'w-full sm:w-auto sm:px-12')} onClick={() => setStarted(true)}>
            {t('onboarding.start')}
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </Shell>
    )
  }

  const optional = step !== 'review'

  return (
    <Shell progress={{ index, total: STEPS.length }}>
      <form
        className="flex flex-col gap-8"
        onSubmit={(e) => {
          e.preventDefault()
          if (step === 'review') finish()
          else goNext()
        }}
        noValidate
      >
        <div className="flex flex-col gap-1">
          <p className="font-bold text-primary">{t('onboarding.stepOf', { current: index + 1, total: STEPS.length })}</p>
          <h2 ref={headingRef} tabIndex={-1} className="font-heading text-3xl font-extrabold text-balance outline-none sm:text-4xl">
            {step === 'review' ? t('onboarding.reviewTitle') : t(`onboarding.steps.${step}`)}
          </h2>
          {step === 'review' ? <p className="text-lg text-muted-foreground">{t('onboarding.reviewHelp')}</p> : null}
        </div>

        {step === 'about' ? (
          <AboutStep draft={draft} update={update} errors={errors} ageText={ageText} setAgeText={setAgeText} />
        ) : step === 'household' ? (
          <HouseholdStep draft={draft} update={update} errors={errors} />
        ) : step === 'location' ? (
          <LocationStep draft={draft} update={update} errors={errors} />
        ) : step === 'needs' ? (
          <NeedsStep draft={draft} update={update} errors={errors} />
        ) : (
          <ReviewStep draft={draft} goTo={(id) => setIndex(STEPS.indexOf(id))} />
        )}

        {saveError ? (
          <p role="alert" className="rounded-2xl bg-coral-soft p-4 font-bold text-destructive">
            {t('errors.saveFailed')}
          </p>
        ) : null}

          <div className="sticky bottom-0 -mx-5 grid grid-cols-2 gap-2 border-t border-border bg-background px-5 py-3 sm:mx-0 sm:flex sm:items-center sm:justify-between sm:rounded-full sm:border sm:px-3 sm:py-3">
            {index > 0 ? (
              <button type="button" className={btn.ghost} onClick={() => setIndex((i) => i - 1)} disabled={saving}>
                <ArrowLeft aria-hidden="true" />
                {t('common.back')}
              </button>
            ) : (
              <span className="hidden sm:block" />
            )}
            {optional ? (
              <button
                type="button"
                className={cn(btn.ghost, index === 0 && 'col-span-2', 'sm:ml-auto')}
                onClick={() => goNext(true)}
                disabled={saving}
              >
                {t('common.skip')}
              </button>
            ) : null}
            <div className="order-first col-span-2 flex sm:order-last sm:col-span-1">
              <button type="submit" className={cn(step === 'review' ? btn.sun : btn.primary, 'w-full sm:px-10')} disabled={saving}>
                {saving ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
                {saving ? t('common.saving') : step === 'review' ? t('onboarding.finish') : t('common.next')}
                {!saving ? step === 'review' ? <Check aria-hidden="true" /> : <ArrowRight aria-hidden="true" /> : null}
              </button>
            </div>
          </div>
      </form>
    </Shell>
  )
}

function Shell({ children, progress }: { children: React.ReactNode; progress?: { index: number; total: number } }) {
  const { t } = usePreferences()
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4">
          <Logo onInk href="/" />
          <LanguageToggle onInk />
        </div>
        {progress ? (
          <div className="mx-auto max-w-3xl px-5 pb-5">
            <p className="sr-only">{t('onboarding.title')}</p>
            <ol className="flex gap-2">
              {STEPS.map((id, i) => (
                <li key={id} className="flex flex-1 flex-col gap-2">
                  <span
                    aria-hidden="true"
                    className={cn('h-2 rounded-full', i <= progress.index ? 'bg-sun' : 'bg-ink-foreground/25')}
                  />
                  <span
                    className={cn(
                      'hidden text-sm sm:block',
                      i === progress.index ? 'font-bold text-ink-foreground' : 'text-ink-foreground/70',
                    )}
                    aria-current={i === progress.index ? 'step' : undefined}
                  >
                    {t(`onboarding.steps.${id}`)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:py-12">{children}</main>
    </div>
  )
}
