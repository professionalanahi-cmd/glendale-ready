'use client'

import { LanguageToggle } from '@/components/common/language-toggle'
import { Logo } from '@/components/common/logo'
import { useT } from '@/components/providers/preferences-provider'
import { card } from '@/lib/ui'
import { ForgotForm, SignInForm, SignUpForm } from './auth-forms'

const variants = {
  'sign-up': { title: 'auth.signUpTitle', subtitle: 'auth.signUpSubtitle', Form: SignUpForm },
  'sign-in': { title: 'auth.signInTitle', subtitle: 'auth.signInSubtitle', Form: SignInForm },
  forgot: { title: 'auth.forgotTitle', subtitle: 'auth.forgotSubtitle', Form: ForgotForm },
} as const

export function AuthShell({ variant }: { variant: keyof typeof variants }) {
  const t = useT()
  const { title, subtitle, Form } = variants[variant]
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="skip-link">
        {t('nav.skipToContent')}
      </a>
      <div className="relative overflow-hidden bg-ink pb-24">
        <div aria-hidden="true" className="absolute -right-20 -top-20 size-56 rounded-full bg-coral" />
        <header className="relative mx-auto flex max-w-lg items-center justify-between gap-4 px-5 py-5">
          <Logo onInk />
          <LanguageToggle onInk />
        </header>
      </div>
      <main id="main" className="relative mx-auto -mt-20 w-full max-w-lg flex-1 px-5 pb-12">
        <div className={`${card} flex flex-col gap-6 p-6 md:p-8`}>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold">{t(title)}</h1>
            <p className="text-pretty text-muted-foreground">{t(subtitle)}</p>
          </div>
          <Form />
        </div>
      </main>
    </div>
  )
}
