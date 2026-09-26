import type { AuthUser, Locale, UserProfile } from '@/lib/types'

export function createEmptyProfile(user: AuthUser, locale: Locale): UserProfile {
  const now = new Date().toISOString()
  return {
    userId: user.uid,
    email: user.email,
    displayName: user.displayName,
    householdId: user.uid,
    age: null,
    gender: null,
    householdSize: null,
    pets: { has: false, kinds: [] },
    home: null,
    current: null,
    needs: {
      mobility: false,
      mobilityAid: false,
      hearing: false,
      vision: false,
      powerDependentEquipment: false,
      refrigeratedMedication: false,
      transportation: false,
      needsHelpEvacuating: false,
      other: '',
    },
    emergencyContact: { name: '', phone: '' },
    preferredLanguage: locale,
    insurance: { carrier: '', healthPlan: '' },
    notifications: {
      emailEnabled: false,
      preparednessUpdates: true,
      trainings: true,
      courses: true,
      localInfo: true,
      hazardSubscriptions: [],
    },
    savedResourceIds: [],
    trainingInterests: [],
    onboardingComplete: false,
    createdAt: now,
    updatedAt: now,
  }
}

export const NEED_KEYS = [
  'mobility',
  'mobilityAid',
  'hearing',
  'vision',
  'powerDependentEquipment',
  'refrigeratedMedication',
  'transportation',
  'needsHelpEvacuating',
] as const
