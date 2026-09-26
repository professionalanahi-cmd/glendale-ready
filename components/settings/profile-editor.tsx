'use client'

import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { FullPageLoading } from '@/components/app/require-auth'
import { PageHeader } from '@/components/common/bits'
import { FilterChips } from '@/components/common/filter-chips'
import { AboutStep, HouseholdStep, LocationStep, NeedsStep } from '@/components/onboarding/steps'
import { useAuth, useProfile } from '@/components/providers/auth-provider'
import { usePreferences } from '@/components/providers/preferences-provider'
import { createEmptyProfile } from '@/lib/profile'
import type { UserProfile } from '@/lib/types'
import { btn, card } from '@/lib/ui'
import { cn } from '@/lib/utils'

const SECTIONS = ['about', 'household', 'location', 'needs'] as const
type SectionId = (typeof SECTIONS)[number]

function isSection(v: string | null): v is SectionId {
  return !!v && (SECTIONS as readonly string[]).includes(v)
}

export function ProfileEditor() {
  const { t, locale } = usePreferences()
  const { user } = useAuth()
  const { profile, isLoading, save } = useProfile()
  const params = useSearchParams()
  const initial = params.get('section')
  const [section, setSection] = useState<SectionId>(isSection(initial) ? initial : 'about')
  const [draft, setDraft] = useState<UserProfile | null>(null)
  const [ageText, setAgeText] = useState('')
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (draft || isLoading || !user) return
    const base = profile ?? createEmptyProfile(user, locale)
    setDraft(base)
    setAgeText(base.age ? String(base.age) : '')
  }, [draft, isLoading, profile, user, locale])

  if (!draft) return <FullPageLoading />

  const update = (patch: Partial<UserProfile>) => {
    setStatus('idle')
    setDraft((d) => (d ? { ...d, ...patch } : d))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!draft) return
    let next = draft
    if (section === 'about') {
      if (ageText) {
        const age = Number(ageText)
        if (!Number.isInteger(age) || age < 13 || age > 120) {
          setErrors({ age: t('onboarding.ageError') })
          return
        }
        next = { ...draft, age }
      } else {
        next = { ...draft, age: null }
      }
    }
    setErrors({})
    setStatus('saving')
    try {
      await save(next)
      setDraft(next)
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }

  const stepProps = { draft, update, errors }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/settings" className={cn(btn.ghost, 'self-start px-3')}>
        <ArrowLeft aria-hidden="true" />
        {t('common.back')}
      </Link>
      <PageHeader title={t('settings.profile')} subtitle={t('settings.profileHelp')} />
      <FilterChips
        label={t('settings.profile')}
        value={section}
        onChange={(v) => {
          setSection(v)
          setStatus('idle')
          panelRef.current?.focus()
        }}
        options={SECTIONS.map((id) => ({ value: id, label: t(`onboarding.steps.${id}`) }))}
      />
      <form onSubmit={handleSave} noValidate className={cn(card, 'flex flex-col gap-6 p-5 sm:p-8')}>
        <div ref={panelRef} tabIndex={-1} className="flex flex-col gap-6 outline-none">
          {section === 'about' ? (
            <AboutStep {...stepProps} ageText={ageText} setAgeText={setAgeText} />
          ) : section === 'household' ? (
            <HouseholdStep {...stepProps} />
          ) : section === 'location' ? (
            <LocationStep {...stepProps} />
          ) : (
            <NeedsStep {...stepProps} />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6">
          <button type="submit" className={cn(btn.primary, 'sm:px-10')} disabled={status === 'saving'}>
            {status === 'saving' ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Check aria-hidden="true" />}
            {status === 'saving' ? t('common.saving') : t('common.save')}
          </button>
          <p role="status" className="font-bold text-primary">
            {status === 'saved' ? t('common.saved') : ''}
            {status === 'error' ? <span className="text-destructive">{t('errors.saveFailed')}</span> : null}
          </p>
        </div>
      </form>
    </div>
  )
}
