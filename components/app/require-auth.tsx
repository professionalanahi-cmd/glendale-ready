'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { useT } from '@/components/providers/preferences-provider'

export function FullPageLoading() {
  const t = useT()
  return (
    <div role="status" className="flex min-h-dvh items-center justify-center gap-3 text-lg font-bold text-muted-foreground">
      <Loader2 aria-hidden="true" className="size-6 animate-spin text-primary" />
      {t('common.loading')}
    </div>
  )
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (ready && !user) router.replace('/sign-in')
  }, [ready, user, router])

  if (!ready || !user) return <FullPageLoading />
  return <>{children}</>
}
