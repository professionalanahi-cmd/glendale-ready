import { isFirebaseConfigured } from '@/lib/config'
import { demoBackend } from './demo'
import { firebaseBackend } from './firebase'
import type { Backend } from './types'

export function getBackend(): Backend {
  return isFirebaseConfigured() ? firebaseBackend : demoBackend
}

export { BackendError } from './types'
export type { Backend } from './types'
