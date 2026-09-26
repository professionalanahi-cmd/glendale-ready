import type { AuthUser, UserProfile } from '@/lib/types'

export type BackendErrorCode =
  | 'email-in-use'
  | 'invalid-credentials'
  | 'weak-password'
  | 'unavailable'
  | 'requires-recent-login'
  | 'generic'

export class BackendError extends Error {
  constructor(
    public code: BackendErrorCode,
    message?: string,
  ) {
    super(message ?? code)
  }
}

export interface Backend {
  kind: 'demo' | 'firebase'
  onAuthChange(callback: (user: AuthUser | null) => void): () => void
  signUp(name: string, email: string, password: string): Promise<AuthUser>
  signIn(email: string, password: string): Promise<AuthUser>
  signOut(): Promise<void>
  /** Returns 'demo' when no email can actually be sent */
  resetPassword(email: string): Promise<'sent' | 'demo'>
  getProfile(uid: string): Promise<UserProfile | null>
  saveProfile(profile: UserProfile): Promise<void>
  /** Deletes the user's profile, preferences and account */
  deleteAccountAndData(uid: string): Promise<void>
}
