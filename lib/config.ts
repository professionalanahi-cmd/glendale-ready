/**
 * Demo feature flags. Turn modules off here without touching components.
 */
export const features = {
  optionalNeeds: true,
  insurance: true,
  emergencyContact: true,
  /** Map picker is reserved for a future release */
  mapPicker: false,
} as const

export const SUPPORTED_LOCALES = ['en', 'es'] as const

export function isFirebaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
}
