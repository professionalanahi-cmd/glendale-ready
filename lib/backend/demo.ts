import type { AuthUser, UserProfile } from '@/lib/types'
import { BackendError, type Backend } from './types'

/**
 * Demo-only backend used until Firebase env vars are configured.
 * Data lives in this browser's localStorage and is clearly labeled as demo in the UI.
 */
const ACCOUNTS_KEY = 'glendale-ready:demo:accounts'
const SESSION_KEY = 'glendale-ready:demo:session'
const PROFILE_PREFIX = 'glendale-ready:demo:profile:'

interface DemoAccount extends AuthUser {
  passwordHash: string
}

const listeners = new Set<(user: AuthUser | null) => void>()

function readAccounts(): DemoAccount[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]') as DemoAccount[]
  } catch {
    return []
  }
}

function writeAccounts(accounts: DemoAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

function currentUser(): AuthUser | null {
  const uid = localStorage.getItem(SESSION_KEY)
  const account = readAccounts().find((a) => a.uid === uid)
  return account ? { uid: account.uid, email: account.email, displayName: account.displayName } : null
}

function emit() {
  const user = currentUser()
  listeners.forEach((cb) => cb(user))
}

async function hash(value: string) {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

export const demoBackend: Backend = {
  kind: 'demo',

  onAuthChange(callback) {
    listeners.add(callback)
    callback(currentUser())
    return () => listeners.delete(callback)
  },

  async signUp(name, email, password) {
    const normalized = email.trim().toLowerCase()
    const accounts = readAccounts()
    if (accounts.some((a) => a.email === normalized)) throw new BackendError('email-in-use')
    if (password.length < 8) throw new BackendError('weak-password')
    const account: DemoAccount = {
      uid: crypto.randomUUID(),
      email: normalized,
      displayName: name.trim(),
      passwordHash: await hash(password),
    }
    writeAccounts([...accounts, account])
    localStorage.setItem(SESSION_KEY, account.uid)
    emit()
    return { uid: account.uid, email: account.email, displayName: account.displayName }
  },

  async signIn(email, password) {
    const normalized = email.trim().toLowerCase()
    const passwordHash = await hash(password)
    const account = readAccounts().find((a) => a.email === normalized && a.passwordHash === passwordHash)
    if (!account) throw new BackendError('invalid-credentials')
    localStorage.setItem(SESSION_KEY, account.uid)
    emit()
    return { uid: account.uid, email: account.email, displayName: account.displayName }
  },

  async signOut() {
    localStorage.removeItem(SESSION_KEY)
    emit()
  },

  async resetPassword() {
    return 'demo'
  },

  async getProfile(uid) {
    const raw = localStorage.getItem(PROFILE_PREFIX + uid)
    return raw ? (JSON.parse(raw) as UserProfile) : null
  },

  async saveProfile(profile) {
    localStorage.setItem(PROFILE_PREFIX + profile.userId, JSON.stringify(profile))
  },

  async deleteAccountAndData(uid) {
    localStorage.removeItem(PROFILE_PREFIX + uid)
    writeAccounts(readAccounts().filter((a) => a.uid !== uid))
    localStorage.removeItem(SESSION_KEY)
    emit()
  },
}
