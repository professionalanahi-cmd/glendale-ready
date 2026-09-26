'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { getBackend, type Backend } from '@/lib/backend'
import type { AuthUser, UserProfile } from '@/lib/types'

interface AuthContextValue {
  backend: Backend
  user: AuthUser | null
  ready: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const backend = useMemo(() => getBackend(), [])
  const [user, setUser] = useState<AuthUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(
    () =>
      backend.onAuthChange((next) => {
        setUser(next)
        setReady(true)
      }),
    [backend],
  )

  return <AuthContext.Provider value={{ backend, user, ready }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useProfile() {
  const { backend, user } = useAuth()
  const { data, error, isLoading, mutate } = useSWR<UserProfile | null>(
    user ? ['profile', user.uid] : null,
    () => backend.getProfile(user!.uid),
  )

  async function save(profile: UserProfile) {
    const next = { ...profile, updatedAt: new Date().toISOString() }
    await mutate(
      async () => {
        await backend.saveProfile(next)
        return next
      },
      { optimisticData: next, rollbackOnError: true, revalidate: false },
    )
  }

  return { profile: data ?? null, error, isLoading: Boolean(user) && isLoading, save, mutate }
}
