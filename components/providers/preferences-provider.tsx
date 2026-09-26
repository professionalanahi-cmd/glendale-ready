'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { PREFS_STORAGE_KEY } from '@/lib/display'
import { pick, translate } from '@/lib/i18n'
import type { Locale, LocalizedText } from '@/lib/types'

export type TextSize = 'default' | 'large' | 'larger'
export type Contrast = 'standard' | 'high'
export type Motion = 'system' | 'reduce'

export interface Preferences {
  locale: Locale
  textSize: TextSize
  contrast: Contrast
  motion: Motion
}

const defaults: Preferences = { locale: 'en', textSize: 'default', contrast: 'standard', motion: 'system' }

interface PreferencesContextValue extends Preferences {
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void
  t: (key: string, vars?: Record<string, string | number>) => string
  l: (text: LocalizedText) => string
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

function applyToDocument(prefs: Preferences) {
  const el = document.documentElement
  el.lang = prefs.locale
  el.dataset.textSize = prefs.textSize
  el.dataset.contrast = prefs.contrast
  el.dataset.motion = prefs.motion
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(defaults)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(PREFS_STORAGE_KEY)
      if (stored) setPrefs({ ...defaults, ...(JSON.parse(stored) as Partial<Preferences>) })
    } catch {
      // Display preferences are optional; fall back to defaults.
    }
  }, [])

  useEffect(() => {
    applyToDocument(prefs)
  }, [prefs])

  const setPreference = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value }
      try {
        window.localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Ignore storage failures (private mode, quota)
      }
      return next
    })
  }, [])

  const value = useMemo<PreferencesContextValue>(
    () => ({
      ...prefs,
      setPreference,
      t: (key, vars) => translate(prefs.locale, key, vars),
      l: (text) => pick(text, prefs.locale),
    }),
    [prefs, setPreference],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}

export const useT = () => usePreferences().t
