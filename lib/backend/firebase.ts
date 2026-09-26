import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { deleteDoc, doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore'
import type { AuthUser, UserProfile } from '@/lib/types'
import { BackendError, type Backend } from './types'

function app() {
  if (getApps().length) return getApp()
  return initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  })
}

function toAuthUser(user: User): AuthUser {
  return { uid: user.uid, email: user.email ?? '', displayName: user.displayName ?? '' }
}

function mapError(error: unknown): BackendError {
  const code = (error as { code?: string })?.code ?? ''
  if (code === 'auth/email-already-in-use') return new BackendError('email-in-use')
  if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'].includes(code))
    return new BackendError('invalid-credentials')
  if (code === 'auth/weak-password') return new BackendError('weak-password')
  if (code === 'auth/requires-recent-login') return new BackendError('requires-recent-login')
  if (code === 'auth/network-request-failed' || code === 'unavailable') return new BackendError('unavailable')
  return new BackendError('generic', String(error))
}

async function guard<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    throw error instanceof BackendError ? error : mapError(error)
  }
}

/**
 * Firestore layout:
 *   users/{uid}      account record (email, displayName, householdId)
 *   profiles/{uid}   preparedness profile, locations and notification preferences
 * See firestore.rules — each user can only read and write their own documents.
 */
export const firebaseBackend: Backend = {
  kind: 'firebase',

  onAuthChange(callback) {
    return onAuthStateChanged(getAuth(app()), (user) => callback(user ? toAuthUser(user) : null))
  },

  signUp: (name, email, password) =>
    guard(async () => {
      const cred = await createUserWithEmailAndPassword(getAuth(app()), email.trim(), password)
      await updateProfile(cred.user, { displayName: name.trim() })
      await setDoc(doc(getFirestore(app()), 'users', cred.user.uid), {
        email: cred.user.email,
        displayName: name.trim(),
        householdId: cred.user.uid,
        createdAt: serverTimestamp(),
      })
      return { ...toAuthUser(cred.user), displayName: name.trim() }
    }),

  signIn: (email, password) =>
    guard(async () => toAuthUser((await signInWithEmailAndPassword(getAuth(app()), email.trim(), password)).user)),

  signOut: () => guard(() => fbSignOut(getAuth(app()))),

  resetPassword: (email) =>
    guard(async () => {
      await sendPasswordResetEmail(getAuth(app()), email.trim())
      return 'sent' as const
    }),

  getProfile: (uid) =>
    guard(async () => {
      const snap = await getDoc(doc(getFirestore(app()), 'profiles', uid))
      return snap.exists() ? (snap.data() as UserProfile) : null
    }),

  saveProfile: (profile) =>
    guard(async () => {
      // Firestore rejects `undefined` values; a JSON round-trip drops them.
      await setDoc(doc(getFirestore(app()), 'profiles', profile.userId), JSON.parse(JSON.stringify(profile)))
    }),

  deleteAccountAndData: (uid) =>
    guard(async () => {
      const db = getFirestore(app())
      await deleteDoc(doc(db, 'profiles', uid))
      await deleteDoc(doc(db, 'users', uid))
      const user = getAuth(app()).currentUser
      if (user) await deleteUser(user)
    }),
}
