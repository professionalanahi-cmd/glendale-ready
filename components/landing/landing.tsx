'use client'

import { ClipboardList, FileCheck2, MapPin, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { LanguageToggle } from '@/components/common/language-toggle'
import { Logo } from '@/components/common/logo'
import { useAuth } from '@/components/providers/auth-provider'
import { useT } from '@/components/providers/preferences-provider'
import { btn, card } from '@/lib/ui'

export function Landing() {
  const t = useT()
  const { user } = useAuth()
  const startHref = user ? '/dashboard' : '/sign-up'

  const steps = [
    { icon: ClipboardList, title: t('landing.step1Title'), body: t('landing.step1Body') },
    { icon: MapPin, title: t('landing.step2Title'), body: t('landing.step2Body') },
    { icon: FileCheck2, title: t('landing.step3Title'), body: t('landing.step3Body') },
  ]

  return (
    <>
      <a href="#main" className="skip-link">
        {t('nav.skipToContent')}
      </a>
      <div className="relative overflow-hidden bg-ink text-ink-foreground">
        <div aria-hidden="true" className="absolute -right-24 -top-24 size-72 rounded-full bg-coral md:size-96" />
        <div aria-hidden="true" className="absolute -bottom-10 -left-10 size-28 rounded-full bg-sun" />
        <header className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
          <Logo onInk />
          <LanguageToggle onInk />
        </header>

        <main id="main" className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-6 md:grid-cols-2 md:pb-24">
          <div className="flex flex-col gap-6">
            <p className="font-heading text-lg font-bold text-sun">{t('landing.eyebrow')}</p>
            <h1 className="text-balance text-4xl font-extrabold leading-tight md:text-5xl">{t('landing.title')}</h1>
            <p className="max-w-xl text-pretty text-xl leading-relaxed text-ink-foreground/90">{t('landing.subtitle')}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={startHref} className={btn.sun}>
                {t('landing.getStarted')}
              </Link>
              <a href="#how" className={btn.onInk}>
                {t('landing.howItWorks')}
              </a>
            </div>
            {!user ? (
              <Link href="/sign-in" className="w-fit font-bold text-ink-foreground underline underline-offset-4">
                {t('landing.signIn')}
              </Link>
            ) : null}
          </div>
          <div className="relative">
            <Image
              src="/images/hero-neighbors.png"
              alt={t('landing.heroAlt')}
              width={1024}
              height={1024}
              priority
              className="aspect-square w-full rounded-[2.5rem] bg-card object-cover"
            />
          </div>
        </main>
      </div>

      <section id="how" aria-labelledby="how-title" className="mx-auto flex max-w-6xl scroll-mt-4 flex-col gap-8 px-5 py-16">
        <h2 id="how-title" className="text-3xl font-extrabold">
          {t('landing.howTitle')}
        </h2>
        <ol className="grid gap-5 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }) => (
            <li key={title} className={`${card} flex flex-col gap-3 p-6`}>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Icon aria-hidden="true" className="size-6" />
              </span>
              <h3 className="text-xl font-extrabold">{title}</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-6 rounded-3xl bg-primary p-8 text-primary-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 text-2xl font-extrabold">
              <ShieldCheck aria-hidden="true" className="size-7" />
              {t('landing.promiseTitle')}
            </h2>
            <ul className="flex flex-col gap-1 text-lg">
              <li>{t('landing.promise1')}</li>
              <li>{t('landing.promise2')}</li>
              <li>{t('landing.promise3')}</li>
            </ul>
          </div>
          <Link href={startHref} className={btn.sun}>
            {t('landing.getStarted')}
          </Link>
        </div>

        <p className="max-w-3xl text-pretty text-sm text-muted-foreground">{t('common.notOfficial')}</p>
      </section>
    </>
  )
}
