import { courses, getCourse } from '@/lib/content/courses'
import type { Course, Hazard, TopicCategory, UserProfile } from '@/lib/types'

export function recommendedCourses(hazards: Hazard[] | undefined, profile: UserProfile | null): Course[] {
  const ids = new Set<string>()
  for (const h of hazards ?? []) for (const id of h.recommendedCourseIds) ids.add(id)

  const extraTopics: TopicCategory[] = []
  if (profile?.pets.has) extraTopics.push('pets')
  if (profile?.needs.needsHelpEvacuating || profile?.needs.transportation) extraTopics.push('evacuation')
  extraTopics.push('supplies', 'general')

  const picked = [...ids].map(getCourse).filter((c): c is Course => Boolean(c))
  for (const topic of extraTopics) {
    for (const c of courses) if (c.topic === topic && !picked.includes(c)) picked.push(c)
  }
  return picked
}

export function preparednessTips(profile: UserProfile): string[] {
  const tips: string[] = []
  if (profile.pets.has) tips.push('preparedness.tipPets')
  if (profile.needs.powerDependentEquipment) tips.push('preparedness.tipPower')
  if (profile.needs.refrigeratedMedication) tips.push('preparedness.tipMeds')
  if (profile.needs.needsHelpEvacuating || profile.needs.mobility || profile.needs.mobilityAid)
    tips.push('preparedness.tipEvac')
  if (profile.needs.hearing) tips.push('preparedness.tipHearing')
  if (profile.needs.vision) tips.push('preparedness.tipVision')
  if (profile.needs.transportation) tips.push('preparedness.tipTransport')
  tips.push('preparedness.tipGeneral')
  return tips
}

export function formatMiles(meters: number | undefined) {
  if (meters == null) return null
  const miles = meters / 1609.344
  return miles < 10 ? miles.toFixed(1) : String(Math.round(miles))
}

export function directionsUrl(lat: number, lon: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`
}
