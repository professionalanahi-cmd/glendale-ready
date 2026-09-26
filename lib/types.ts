export type Locale = 'en' | 'es' | 'hy'
/** English is the fallback when a translation is missing. */
export type LocalizedText = { en: string } & Partial<Record<Exclude<Locale, 'en'>, string>>

export type HazardCategory = 'earthquake' | 'wildfire' | 'flood' | 'dam-inundation' | 'debris-flow'
export type TopicCategory = HazardCategory | 'general' | 'pets' | 'evacuation' | 'supplies'

export const HAZARD_CATEGORIES: HazardCategory[] = [
  'earthquake',
  'wildfire',
  'flood',
  'dam-inundation',
  'debris-flow',
]

/** Every externally sourced claim carries one of these. `null` renders "Source information coming soon." */
export interface SourceRef {
  organization: string
  title: string
  url?: string
  date?: string
}

export type DataMode = 'live' | 'demo'

// ---------- Locations ----------

export interface GeoPoint {
  label: string
  lat: number
  lon: number
  method: 'device' | 'address' | 'home' | 'map'
  address?: string
  /** True when coordinates are a rough estimate (e.g. demo geocoding) */
  isEstimate?: boolean
  updatedAt: string
}

// ---------- Hazards (normalized from the Glendale GIS MCP) ----------

export type LayerStatus = 'in_zone' | 'not_in_zone' | 'unavailable'

export interface HazardLayerFinding {
  datasetId: string
  datasetTitle: string
  category: HazardCategory
  status: LayerStatus
  /** Class value reported by the source, e.g. CAL FIRE "Very High" or FEMA zone "AE" */
  sourceClass?: string
  reason?: string
  notes: string[]
  disclaimer?: string
  layerUrl?: string
}

export interface LocationHazardResult {
  mode: DataMode
  status: 'ok' | 'unavailable'
  findings: HazardLayerFinding[]
  message?: string
  fetchedAt: string
}

export interface Hazard {
  id: HazardCategory
  category: HazardCategory
  applicableToHome: boolean
  applicableToCurrentLocation: boolean
  exposure: { home?: string; current?: string }
  findings: { home: HazardLayerFinding[]; current: HazardLayerFinding[] }
  source: SourceRef
  sourceUrl?: string
  recommendedCourseIds: string[]
}

export interface HazardProfile {
  mode: DataMode
  home: LocationHazardResult | null
  current: LocationHazardResult | null
  hazards: Hazard[]
}

// ---------- Resources ----------

export type ResourceCategory =
  | 'hospital'
  | 'urgent-care'
  | 'pharmacy'
  | 'shelter'
  | 'cooling-center'
  | 'fire-station'
  | 'police'
  | 'library'
  | 'park'
  | 'supplies'
  | 'food'
  | 'veterinary'
  | 'transportation'

export interface Resource {
  id: string
  name: string
  category: ResourceCategory
  lat: number
  lon: number
  address?: string
  phone?: string
  distanceMeters?: number
  accessibility?: string
  source: SourceRef | null
  isDemo: boolean
}

export interface ResourceResult {
  mode: DataMode
  status: 'ok' | 'unavailable'
  resources: Resource[]
  /** Categories that have no connected data source yet */
  notConnected: ResourceCategory[]
  message?: string
}

// ---------- Training, courses, sounds ----------

export interface TrainingEvent {
  id: string
  title: LocalizedText
  start: string
  end: string
  location: string
  description: LocalizedText
  category: TopicCategory
  source: SourceRef | null
  registrationUrl?: string
  isDemo: boolean
}

export interface CourseMedia {
  /** Path under /public/media — the course UI works unchanged once the file exists */
  videoSrc: string
  videoAvailable: boolean
  transcriptSrc?: string
  transcriptAvailable: boolean
}

export interface Course {
  id: string
  title: LocalizedText
  topic: TopicCategory
  description: LocalizedText
  durationMinutes: number
  thumbnail: string
  media: CourseMedia
  source: SourceRef | null
  publishedAt: string
  updatedAt: string
  learn: LocalizedText[]
  before: LocalizedText[]
  during: LocalizedText[]
  after: LocalizedText[]
}

export interface AlarmSound {
  id: string
  name: LocalizedText
  agency: string
  meaning: LocalizedText | null
  whenHeard: LocalizedText | null
  source: SourceRef | null
  /** Path under /public/media/alarms, or null when no official recording is available */
  audioSrc: string | null
}

// ---------- User data model (mirrors Firebase collections) ----------

export type Gender = 'woman' | 'man' | 'nonbinary' | 'self-describe' | 'prefer-not'

export interface PreparednessNeeds {
  mobility: boolean
  mobilityAid: boolean
  hearing: boolean
  vision: boolean
  powerDependentEquipment: boolean
  refrigeratedMedication: boolean
  transportation: boolean
  needsHelpEvacuating: boolean
  other: string
}

export interface EmergencyContact {
  name: string
  phone: string
}

export interface NotificationPreferences {
  emailEnabled: boolean
  preparednessUpdates: boolean
  trainings: boolean
  courses: boolean
  localInfo: boolean
  /** Reserved for hazard-specific subscriptions */
  hazardSubscriptions: HazardCategory[]
}

export interface InsuranceInfo {
  carrier: string
  healthPlan: string
}

export interface UserProfile {
  userId: string
  email: string
  displayName: string
  householdId: string
  age: number | null
  gender: Gender | null
  genderSelfDescribe?: string
  householdSize: number | null
  pets: { has: boolean; kinds: string[] }
  home: GeoPoint | null
  current: GeoPoint | null
  needs: PreparednessNeeds
  emergencyContact: EmergencyContact
  preferredLanguage: Locale
  insurance: InsuranceInfo
  notifications: NotificationPreferences
  savedResourceIds: string[]
  trainingInterests: TopicCategory[]
  onboardingComplete: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthUser {
  uid: string
  email: string
  displayName: string
}
