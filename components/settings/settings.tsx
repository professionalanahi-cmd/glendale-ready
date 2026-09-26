'use client'

import { ChevronRight, Loader2, Trash2, UserRound } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { InfoNote, PageHeader } from '@/components/common/bits'
import { ChoiceCard, Fieldset, TextField } from '@/components/common/fields'
import { useAuth, useProfile } from '@/components/providers/auth-provider'
import {
  usePreferences,
  type Contrast,
  type Motion,
  type TextSize,
} from '@/components/providers/preferences-provider'
import { localeNames } from '@/lib/i18n'
import { SUPPORTED_LOCALES } from '@/lib/config'
import type { NotificationPreferences } from '@/lib/types'
import { btn, card } from '@/lib/ui'
import { cn } from '@/lib/utils'

function Section({ id, title, help, children }: { id: string; title: string; help: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className={cn(card, 'flex flex-col gap-6 p-5 sm:p-8')}>
      <div className="flex flex-col gap-1">
        <h2 id={id} className="font-heading text-2xl font-extrabold text-balance">
          {title}
        </h2>
        <p className="text-pretty text-muted-foreground">{help}</p>
      </div>
      {children}
    </section>
  )
}

function RadioGroup<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string
  name: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-lg font-bold">{legend}</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((o) => (
          <ChoiceCard
            key={o.value}
            type="radio"
            name={name}
            label={o.label}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
        ))}
      </div>
    </fieldset>
  )
}

function DisplaySection() {
  const { t, textSize, contrast, motion, locale, setPreference } = usePreferences()
  return (
    <Section id="display" title={t('settings.accessibility')} help={t('settings.accessibilityHelp')}>
      <RadioGroup<TextSize>
        legend={t('settings.textSize')}
        name="text-size"
        value={textSize}
        onChange={(v) => setPreference('textSize', v)}
        options={(['default', 'large', 'larger'] as const).map((v) => ({ value: v, label: t(`settings.textSizes.${v}`) }))}
      />
      <p className="rounded-2xl bg-muted px-4 py-3 text-lg leading-relaxed" aria-live="polite">
        {t('settings.preview')}
      </p>
      <RadioGroup<Contrast>
        legend={t('settings.contrast')}
        name="contrast"
        value={contrast}
        onChange={(v) => setPreference('contrast', v)}
        options={(['standard', 'high'] as const).map((v) => ({ value: v, label: t(`settings.contrasts.${v}`) }))}
      />
      <RadioGroup<Motion>
        legend={t('settings.motion')}
        name="motion"
        value={motion}
        onChange={(v) => setPreference('motion', v)}
        options={(['system', 'reduce'] as const).map((v) => ({ value: v, label: t(`settings.motions.${v}`) }))}
      />
      <RadioGroup
        legend={t('settings.language')}
        name="language"
        value={locale}
        onChange={(v) => setPreference('locale', v)}
        options={SUPPORTED_LOCALES.map((code) => ({ value: code, label: localeNames[code] }))}
      />
    </Section>
  )
}

const NOTIF_ROWS: { key: Exclude<keyof NotificationPreferences, 'emailEnabled' | 'hazardSubscriptions'>; label: string }[] = [
  { key: 'preparednessUpdates', label: 'settings.notifPreparedness' },
  { key: 'trainings', label: 'settings.notifTrainings' },
  { key: 'courses', label: 'settings.notifCourses' },
  { key: 'localInfo', label: 'settings.notifLocal' },
]

function NotificationsSection() {
  const { t } = usePreferences()
  const { backend } = useAuth()
  const { profile, save } = useProfile()
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  if (!profile) return null
  const prefs = profile.notifications

  async function update(patch: Partial<NotificationPreferences>) {
    if (!profile) return
    setStatus('saving')
    try {
      await save({ ...profile, notifications: { ...prefs, ...patch } })
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }

  return (
    <Section id="notifications" title={t('settings.notifications')} help={t('settings.notificationsHelp')}>
      <ChoiceCard
        type="checkbox"
        name="email-enabled"
        label={t('settings.emailEnabled')}
        description={profile.email}
        checked={prefs.emailEnabled}
        onChange={(v) => update({ emailEnabled: v })}
      />
      {prefs.emailEnabled ? (
        <Fieldset legend={t('settings.notificationsHelp')} className="[&>legend]:sr-only">
          <div className="grid gap-3 sm:grid-cols-2">
            {NOTIF_ROWS.map((row) => (
              <ChoiceCard
                key={row.key}
                type="checkbox"
                name={row.key}
                label={t(row.label)}
                checked={prefs[row.key]}
                onChange={(v) => update({ [row.key]: v })}
              />
            ))}
          </div>
        </Fieldset>
      ) : null}
      <p role="status" className={status === 'idle' ? 'sr-only' : 'font-bold text-primary'}>
        {status === 'saving' ? t('common.saving') : status === 'saved' ? t('common.saved') : ''}
        {status === 'error' ? <span className="text-destructive">{t('errors.saveFailed')}</span> : null}
      </p>
      <InfoNote>{t('settings.notifNote')}</InfoNote>
      {backend.kind === 'demo' ? <p className="text-sm text-muted-foreground">{t('settings.notifServiceDemo')}</p> : null}
    </Section>
  )
}

function AccountSection() {
  const { t } = usePreferences()
  const { backend, user } = useAuth()
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [word, setWord] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [failed, setFailed] = useState(false)
  const confirmWord = t('settings.deleteConfirmWord')

  if (!user) return null

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault()
    if (!user || word.trim() !== confirmWord) return
    setDeleting(true)
    setFailed(false)
    try {
      await backend.deleteAccountAndData(user.uid)
      router.replace('/')
    } catch {
      setFailed(true)
      setDeleting(false)
    }
  }

  return (
    <Section id="account" title={t('settings.account')} help={t('settings.accountHelp')}>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <dt className="text-sm font-bold text-muted-foreground">{t('settings.name')}</dt>
          <dd className="text-lg font-bold">{user.displayName || t('common.notSet')}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-sm font-bold text-muted-foreground">{t('settings.email')}</dt>
          <dd className="text-lg font-bold break-all">{user.email}</dd>
        </div>
      </dl>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold">{t('settings.dataStored')}</h3>
        <p className="leading-relaxed text-pretty text-muted-foreground">{t('settings.dataStoredList')}</p>
        <p className="text-sm font-bold">
          {backend.kind === 'demo' ? t('settings.backendDemo') : t('settings.backendFirebase')}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={btn.outline} onClick={() => backend.signOut().then(() => router.replace('/'))}>
          {t('common.signOut')}
        </button>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border-2 border-destructive/40 p-5">
        <h3 className="font-heading text-xl font-extrabold text-destructive">{t('settings.deleteTitle')}</h3>
        <p className="leading-relaxed text-pretty">{t('settings.deleteBody')}</p>
        {confirming ? (
          <form onSubmit={handleDelete} className="flex flex-col gap-4" aria-labelledby="delete-confirm-title">
            <p id="delete-confirm-title" className="font-bold">
              {t('settings.deleteConfirmTitle')} {t('settings.deleteConfirmBody')}
            </p>
            <TextField
              label={t('settings.deleteConfirmLabel')}
              value={word}
              onChange={(e) => setWord(e.target.value)}
              autoComplete="off"
              autoFocus
              error={failed ? t('settings.deleteFailed') : undefined}
            />
            <div className="flex flex-wrap gap-3">
              <button type="submit" className={btn.danger} disabled={deleting || word.trim() !== confirmWord}>
                {deleting ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Trash2 aria-hidden="true" />}
                {deleting ? t('settings.deleting') : t('settings.deleteButton')}
              </button>
              <button
                type="button"
                className={btn.ghost}
                onClick={() => {
                  setConfirming(false)
                  setWord('')
                }}
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <button type="button" className={btn.danger} onClick={() => setConfirming(true)}>
              <Trash2 aria-hidden="true" />
              {t('settings.deleteButton')}
            </button>
          </div>
        )}
      </div>
    </Section>
  )
}

export function SettingsScreen() {
  const { t } = usePreferences()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />
      <Link
        href="/settings/profile"
        className={cn(card, 'flex min-h-20 items-center gap-4 p-5 transition-colors hover:bg-primary-soft')}
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <UserRound aria-hidden="true" />
        </span>
        <span className="flex flex-1 flex-col">
          <span className="font-heading text-xl font-extrabold">{t('settings.profile')}</span>
          <span className="text-muted-foreground">{t('settings.profileHelp')}</span>
        </span>
        <ChevronRight aria-hidden="true" className="text-primary" />
      </Link>
      <DisplaySection />
      <NotificationsSection />
      <AccountSection />
    </div>
  )
}
