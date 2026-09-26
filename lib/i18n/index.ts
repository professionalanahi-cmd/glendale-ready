import type { Locale, LocalizedText } from '@/lib/types'
import en from './en'
import es from './es'

/**
 * To add a language (e.g. Armenian), create `hy.ts` typed as `Dictionary`,
 * register it here, and add the code to `Locale` and SUPPORTED_LOCALES.
 */
export const dictionaries = { en, es } as const

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
}

type Vars = Record<string, string | number>

function lookup(dict: unknown, path: string): string | undefined {
  let node: unknown = dict
  for (const part of path.split('.')) {
    if (node && typeof node === 'object' && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return typeof node === 'string' ? node : undefined
}

export function translate(locale: Locale, key: string, vars?: Vars): string {
  const raw = lookup(dictionaries[locale], key) ?? lookup(dictionaries.en, key) ?? key
  if (!vars) return raw
  return raw.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`))
}

export function pick(text: LocalizedText, locale: Locale): string {
  return text[locale] || text.en
}

export const speechLang: Record<Locale, string> = { en: 'en-US', es: 'es-US' }
