import type {
  Hazard,
  HazardCategory,
  HazardLayerFinding,
  HazardProfile,
  LocationHazardResult,
  SourceRef,
} from '@/lib/types'
import { HAZARD_CATEGORIES } from '@/lib/types'

/** Glendale GIS MCP dataset id → the resident-facing category it informs */
export const DATASET_CATEGORY: Record<string, HazardCategory> = {
  calfire_fhsz_lra: 'wildfire',
  fema_flood_zones: 'flood',
  cgs_fault_zones: 'earthquake',
  cgs_liquefaction_zones: 'earthquake',
  cgs_landslide_zones: 'earthquake',
  dwr_dam_inundation: 'dam-inundation',
  usgs_debris_flow: 'debris-flow',
}

/** Result keys returned by the `hazards_at_location` tool */
export const RESULT_KEY_DATASET: Record<string, string> = {
  wildfire: 'calfire_fhsz_lra',
  flood: 'fema_flood_zones',
  fault: 'cgs_fault_zones',
  liquefaction: 'cgs_liquefaction_zones',
  landslide: 'cgs_landslide_zones',
  dam_inundation: 'dwr_dam_inundation',
  debris_flow: 'usgs_debris_flow',
}

export const DATASET_TITLES: Record<string, string> = {
  calfire_fhsz_lra: 'CAL FIRE Fire Hazard Severity Zones (LRA 2025)',
  fema_flood_zones: 'FEMA National Flood Hazard Layer',
  cgs_fault_zones: 'CGS Alquist-Priolo Fault Zones',
  cgs_liquefaction_zones: 'CGS Seismic Hazard Zones: Liquefaction',
  cgs_landslide_zones: 'CGS Seismic Hazard Zones: Earthquake-Induced Landslide',
  dwr_dam_inundation: 'DWR Division of Safety of Dams inundation areas',
  usgs_debris_flow: 'USGS post-fire debris-flow assessments',
}

export const HAZARD_SOURCES: Record<HazardCategory, SourceRef> = {
  earthquake: {
    organization: 'California Geological Survey',
    title: 'Seismic Hazard Zones and Alquist-Priolo Fault Zones',
    url: 'https://www.conservation.ca.gov/cgs/geohazards',
  },
  wildfire: {
    organization: 'CAL FIRE',
    title: 'Fire Hazard Severity Zones (2025)',
    url: 'https://osfm.fire.ca.gov/what-we-do/community-wildfire-preparedness-and-mitigation/fire-hazard-severity-zones',
  },
  flood: {
    organization: 'FEMA',
    title: 'National Flood Hazard Layer',
    url: 'https://www.fema.gov/flood-maps/national-flood-hazard-layer',
  },
  'dam-inundation': {
    organization: 'California Department of Water Resources',
    title: 'Dam Breach Inundation Maps',
    url: 'https://fmds.water.ca.gov/maps/damim/',
  },
  'debris-flow': {
    organization: 'U.S. Geological Survey',
    title: 'Emergency Assessment of Post-Fire Debris-Flow Hazards',
    url: 'https://www.usgs.gov/programs/landslide-hazards/science/scientific-background',
  },
}

export const HAZARD_COURSES: Record<HazardCategory, string[]> = {
  earthquake: ['earthquake-basics', 'emergency-kit'],
  wildfire: ['wildfire-ready', 'evacuation-plan'],
  flood: ['flood-safety', 'emergency-kit'],
  'dam-inundation': ['evacuation-plan', 'flood-safety'],
  'debris-flow': ['debris-flow-awareness', 'evacuation-plan'],
}

function applicable(findings: HazardLayerFinding[]) {
  return findings.some((f) => f.status === 'in_zone')
}

function exposureLabel(findings: HazardLayerFinding[]) {
  const inZone = findings.filter((f) => f.status === 'in_zone')
  if (!inZone.length) return undefined
  return inZone
    .map((f) =>
      f.sourceClass && f.sourceClass !== f.datasetTitle ? `${f.datasetTitle}: ${f.sourceClass}` : f.datasetTitle,
    )
    .join(' · ')
}

export function buildHazardProfile(
  home: LocationHazardResult | null,
  current: LocationHazardResult | null,
): HazardProfile {
  const hazards: Hazard[] = []
  for (const category of HAZARD_CATEGORIES) {
    const homeFindings = home?.findings.filter((f) => f.category === category) ?? []
    const currentFindings = current?.findings.filter((f) => f.category === category) ?? []
    const atHome = applicable(homeFindings)
    const atCurrent = applicable(currentFindings)
    if (!atHome && !atCurrent) continue
    hazards.push({
      id: category,
      category,
      applicableToHome: atHome,
      applicableToCurrentLocation: atCurrent,
      exposure: { home: exposureLabel(homeFindings), current: exposureLabel(currentFindings) },
      findings: { home: homeFindings, current: currentFindings },
      source: HAZARD_SOURCES[category],
      sourceUrl: HAZARD_SOURCES[category].url,
      recommendedCourseIds: HAZARD_COURSES[category],
    })
  }
  const mode = home?.mode === 'live' || current?.mode === 'live' ? 'live' : 'demo'
  return { mode, home, current, hazards }
}
