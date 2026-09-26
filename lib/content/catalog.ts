import type { AlarmSound, SourceRef, TrainingEvent } from "@/lib/types";

/** Demo events until an official training feed is connected. */
export const trainingEvents: TrainingEvent[] = [
  {
    id: "demo-kit-workshop",
    title: {
      en: "Build-a-kit workshop",
      es: "Taller para armar su kit",
      hy: "Արտակարգ պաշարի հավաքման սեմինար",
    },
    start: "2026-10-10T10:00:00-07:00",
    end: "2026-10-10T11:30:00-07:00",
    location: "Demo location — Glendale",
    description: {
      en: "Bring questions and leave with a checklist for your household kit.",
      es: "Traiga sus preguntas y llévese una lista para el kit de su hogar.",
      hy: "Բերեք Ձեր հարցերը և տուն տարեք Ձեր ընտանիքի հավաքածուի ցուցակը։",
    },
    category: "supplies",
    source: null,
    isDemo: true,
  },
  {
    id: "demo-shakeout",
    title: {
      en: "Earthquake drill practice",
      es: "Práctica de simulacro de terremoto",
      hy: "Երկրաշարժի վարժանք",
    },
    start: "2026-10-15T10:15:00-07:00",
    end: "2026-10-15T10:45:00-07:00",
    location: "Your home or workplace",
    description: {
      en: "Practice Drop, Cover, and Hold On with your household.",
      es: "Practique Agacharse, Cubrirse y Sujetarse con su hogar.",
      hy: "Ձեր ընտանիքի հետ փորձեք «Իջի՛ր, ծածկվի՛ր և բռնվի՛ր» քայլերը։",
    },
    category: "earthquake",
    source: null,
    isDemo: true,
  },
  {
    id: "demo-wildfire-talk",
    title: {
      en: "Wildfire readiness talk",
      es: "Charla sobre preparación para incendios",
      hy: "Զրույց հրդեհներին պատրաստվելու մասին",
    },
    start: "2026-10-24T18:00:00-07:00",
    end: "2026-10-24T19:00:00-07:00",
    location: "Demo location — Glendale",
    description: {
      en: "Learn how to prepare your home and plan to leave early.",
      es: "Aprenda a preparar su casa y planear salir temprano.",
      hy: "Սովորեք նախապատրաստել Ձեր տունը և ծրագրել վաղ հեռանալը։",
    },
    category: "wildfire",
    source: null,
    isDemo: true,
  },
  {
    id: "demo-pets",
    title: {
      en: "Pets in emergencies",
      es: "Mascotas en emergencias",
      hy: "Ընտանի կենդանիները արտակարգ իրավիճակներում",
    },
    start: "2026-11-07T11:00:00-08:00",
    end: "2026-11-07T12:00:00-08:00",
    location: "Demo location — Glendale",
    description: {
      en: "What to pack for your pets and how to include them in your plan.",
      es: "Qué empacar para sus mascotas y cómo incluirlas en su plan.",
      hy: "Ինչ հավաքել Ձեր կենդանիների համար և ինչպես ներառել նրանց Ձեր ծրագրում։",
    },
    category: "pets",
    source: null,
    isDemo: true,
  },
];

export const alarmSounds: AlarmSound[] = [
  {
    id: "wea",
    name: {
      en: "Wireless Emergency Alert tone",
      es: "Tono de Alerta Inalámbrica de Emergencia",
      hy: "Անլար արտակարգ ծանուցման ազդանշան (WEA)",
    },
    agency: "FCC / FEMA",
    meaning: {
      en: "An official alert sent to phones in an area by authorized government agencies.",
      es: "Una alerta oficial enviada a teléfonos en un área por agencias gubernamentales autorizadas.",
      hy: "Պաշտոնական ծանուցում, որը լիազորված պետական մարմինները ուղարկում են որոշակի տարածքի հեռախոսներին։",
    },
    whenHeard: {
      en: "On your mobile phone, together with a text message describing the emergency.",
      es: "En su teléfono celular, junto con un mensaje de texto que describe la emergencia.",
      hy: "Ձեր բջջային հեռախոսում՝ արտակարգ իրավիճակը նկարագրող հաղորդագրության հետ միասին։",
    },
    source: {
      organization: "Federal Communications Commission",
      title: "Wireless Emergency Alerts (WEA)",
      url: "https://www.fcc.gov/consumers/guides/wireless-emergency-alerts-wea",
    },
    audioSrc: null,
  },
  {
    id: "eas",
    name: {
      en: "Emergency Alert System tone",
      es: "Tono del Sistema de Alerta de Emergencia",
      hy: "Արտակարգ ծանուցման համակարգի ազդանշան (EAS)",
    },
    agency: "FCC / FEMA",
    meaning: {
      en: "An official warning broadcast on TV and radio.",
      es: "Una advertencia oficial transmitida por televisión y radio.",
      hy: "Հեռուստատեսությամբ և ռադիոյով հեռարձակվող պաշտոնական նախազգուշացում։",
    },
    whenHeard: {
      en: "On TV or radio, before an emergency message.",
      es: "En la televisión o la radio, antes de un mensaje de emergencia.",
      hy: "Հեռուստացույցով կամ ռադիոյով՝ արտակարգ հաղորդագրությունից առաջ։",
    },
    source: {
      organization: "Federal Communications Commission",
      title: "Emergency Alert System (EAS)",
      url: "https://www.fcc.gov/emergency-alert-system",
    },
    audioSrc: null,
  },
  {
    id: "hi-lo",
    name: {
      en: "Hi-Lo vehicle siren",
      es: "Sirena de vehículo Hi-Lo",
      hy: "Hi-Lo մեքենայի շչակ",
    },
    agency: "Local law enforcement",
    meaning: null,
    whenHeard: null,
    source: null,
    audioSrc: null,
  },
];

export const officialAlertSources: SourceRef[] = [
  {
    organization: "Los Angeles County",
    title: "Alert LA County",
    url: "https://ready.lacounty.gov/alert-la-county/",
  },
  {
    organization: "Ready.gov (FEMA)",
    title: "Emergency Alerts",
    url: "https://www.ready.gov/alerts",
  },
];
