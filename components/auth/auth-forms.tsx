'use client'

import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { InfoNote } from '@/components/common/bits'
import { TextField } from '@/components/common/fields'
import { useAuth } from '@/components/providers/auth-provider'
import { useT } from '@/components/providers/preferences-provider'
import { BackendError } from '@/lib/backend'
import { btn } from '@/lib/ui'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function errorKey(err: unknown) {
  if (err instanceof BackendError) {
    if (err.code === 'email-in-use') return 'auth.errors.emailInUse'
    if (err.code === 'invalid-credentials') return 'auth.errors.invalidCredentials'
    if (err.code === 'weak-password') return 'auth.errors.passwordShort'
    if (err.code === 'unavailable') return 'auth.errors.unavailable'
  }
  return 'auth.errors.generic'
}

function PasswordField({
  label,
  value,
  onChange,
  error,
  hint,
  autoComplete,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  hint?: string
  autoComplete: string
}) {
  const t = useT()
  const [show, setShow] = useState(false)
  return (
    <TextField
      label={label}
      hint={hint}
      error={error}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={autoComplete}
      required
      trailing={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          className="flex min-h-10 items-center gap-1 rounded-full px-3 text-sm font-bold text-primary hover:bg-primary-soft"
        >
          {show ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
          {show ? t('auth.hidePassword') : t('auth.showPassword')}
        </button>
      }
    />
  )
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="rounded-2xl bg-coral-soft p-4 font-bold text-destructive">
      {message}
    </p>
  )
}

function DemoAuthNote() {
  const t = useT()
  const { backend } = useAuth()
  if (backend.kind !== 'demo') return null
  return <InfoNote>{t('auth.demoMode')}</InfoNote>
}

export function SignUpForm() {
  const t = useT()
  const router = useRouter()
  const { backend } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = t('auth.errors.nameRequired')
    if (!EMAIL_RE.test(email.trim())) next.email = t('auth.errors.emailInvalid')
    if (password.length < 8) next.password = t('auth.errors.passwordShort')
    if (confirm !== password) next.confirm = t('auth.errors.passwordMismatch')
    setErrors(next)
    setFormError(null)
    if (Object.keys(next).length) return
    setBusy(true)
    try {
      await backend.signUp(name.trim(), email.trim(), password)
      router.push('/onboarding')
    } catch (err) {
      setFormError(t(errorKey(err)))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <DemoAuthNote />
      <TextField
        label={t('auth.name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        autoComplete="given-name"
        required
      />
      <TextField
        label={t('auth.email')}
        type="email"
        inputMode="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        autoComplete="email"
        required
      />
      <PasswordField
        label={t('auth.password')}
        hint={t('auth.passwordHint')}
        value={password}
        onChange={setPassword}
        error={errors.password}
        autoComplete="new-password"
      />
      <PasswordField
        label={t('auth.confirmPassword')}
        value={confirm}
        onChange={setConfirm}
        error={errors.confirm}
        autoComplete="new-password"
      />
      <FormError message={formError} />
      <button type="submit" disabled={busy} className={btn.primary}>
        {busy ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
        {t('auth.createAccount')}
      </button>
      <p className="text-center">
        {t('auth.haveAccount')}{' '}
        <Link href="/sign-in" className="font-bold text-primary underline underline-offset-4">
          {t('auth.signIn')}
        </Link>
      </p>
    </form>
  )
}

export function SignInForm() {
  const t = useT()
  const router = useRouter()
  const { backend } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!EMAIL_RE.test(email.trim())) next.email = t('auth.errors.emailInvalid')
    if (!password) next.password = t('auth.errors.passwordShort')
    setErrors(next)
    setFormError(null)
    if (Object.keys(next).length) return
    setBusy(true)
    try {
      await backend.signIn(email.trim(), password)
      router.push('/dashboard')
    } catch (err) {
      setFormError(t(errorKey(err)))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <DemoAuthNote />
      <TextField
        label={t('auth.email')}
        type="email"
        inputMode="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        autoComplete="email"
        required
      />
      <PasswordField
        label={t('auth.password')}
        value={password}
        onChange={setPassword}
        error={errors.password}
        autoComplete="current-password"
      />
      <Link href="/forgot-password" className="w-fit font-bold text-primary underline underline-offset-4">
        {t('auth.forgot')}
      </Link>
      <FormError message={formError} />
      <button type="submit" disabled={busy} className={btn.primary}>
        {busy ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
        {t('auth.signIn')}
      </button>
      <p className="text-center">
        {t('auth.noAccount')}{' '}
        <Link href="/sign-up" className="font-bold text-primary underline underline-offset-4">
          {t('auth.createAccount')}
        </Link>
      </p>
    </form>
  )
}

export function ForgotForm() {
  const t = useT()
  const { backend } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()
  const [result, setResult] = useState<'sent' | 'demo' | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!EMAIL_RE.test(email.trim())) {
      setError(t('auth.errors.emailInvalid'))
      return
    }
    setError(undefined)
    setBusy(true)
    try {
      setResult(await backend.resetPassword(email.trim()))
    } catch (err) {
      setFormError(t(errorKey(err)))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <TextField
        label={t('auth.email')}
        type="email"
        inputMode="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
        autoComplete="email"
        required
      />
      <div aria-live="polite">
        {result ? <InfoNote>{result === 'sent' ? t('auth.resetSent') : t('auth.resetDemo')}</InfoNote> : null}
      </div>
      <FormError message={formError} />
      <button type="submit" disabled={busy} className={btn.primary}>
        {busy ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
        {t('auth.sendReset')}
      </button>
      <Link href="/sign-in" className="text-center font-bold text-primary underline underline-offset-4">
        {t('auth.backToSignIn')}
      </Link>
    </form>
  )
}
