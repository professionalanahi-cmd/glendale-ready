import type { Course, CourseMedia } from '@/lib/types'

/** Videos are added later by placing files at these paths and flipping `videoAvailable`. */
function media(id: string): CourseMedia {
  return {
    videoSrc: `/media/courses/${id}.mp4`,
    videoAvailable: false,
    transcriptSrc: `/media/courses/${id}.vtt`,
    transcriptAvailable: false,
  }
}

export const courses: Course[] = [
  {
    id: 'earthquake-basics',
    topic: 'earthquake',
    title: { en: 'Earthquake basics', es: 'Conceptos básicos sobre terremotos' },
    description: {
      en: 'How to protect yourself when the ground shakes, and how to get your home ready.',
      es: 'Cómo protegerse cuando tiembla la tierra y cómo preparar su hogar.',
    },
    durationMinutes: 5,
    thumbnail: '/images/courses/earthquake.png',
    media: media('earthquake-basics'),
    source: { organization: 'Ready.gov (FEMA)', title: 'Earthquakes', url: 'https://www.ready.gov/earthquakes' },
    publishedAt: '2026-09-01',
    updatedAt: '2026-09-20',
    learn: [
      { en: 'What "Drop, Cover, and Hold On" means', es: 'Qué significa "Agacharse, Cubrirse y Sujetarse"' },
      { en: 'How to secure heavy items at home', es: 'Cómo asegurar objetos pesados en casa' },
    ],
    before: [
      { en: 'Secure heavy furniture and items like TVs to walls.', es: 'Asegure a la pared muebles pesados y objetos como televisores.' },
      { en: 'Practice Drop, Cover, and Hold On with your household.', es: 'Practique Agacharse, Cubrirse y Sujetarse con su hogar.' },
      { en: 'Keep an emergency supply kit where you can reach it.', es: 'Tenga un kit de emergencia a su alcance.' },
    ],
    during: [
      { en: 'Drop onto your hands and knees.', es: 'Agáchese sobre sus manos y rodillas.' },
      { en: 'Cover your head and neck with your arms, or get under a sturdy table.', es: 'Cúbrase la cabeza y el cuello con los brazos, o métase debajo de una mesa firme.' },
      { en: 'Hold on until the shaking stops. If you use a wheelchair or walker, lock it and cover your head and neck.', es: 'Sujétese hasta que pare el temblor. Si usa silla de ruedas o andador, trábelo y cúbrase la cabeza y el cuello.' },
    ],
    after: [
      { en: 'Expect aftershocks. Drop, Cover, and Hold On again if you feel one.', es: 'Espere réplicas. Vuelva a Agacharse, Cubrirse y Sujetarse si siente una.' },
      { en: 'Check yourself and others for injuries.', es: 'Revísese a sí mismo y a los demás por si hay lesiones.' },
      { en: 'If a building is damaged, get out and stay out.', es: 'Si un edificio está dañado, salga y no vuelva a entrar.' },
    ],
  },
  {
    id: 'wildfire-ready',
    topic: 'wildfire',
    title: { en: 'Getting ready for wildfire', es: 'Prepararse para incendios forestales' },
    description: {
      en: 'Simple steps to protect your home and be ready to leave early.',
      es: 'Pasos sencillos para proteger su hogar y estar listo para salir a tiempo.',
    },
    durationMinutes: 6,
    thumbnail: '/images/courses/wildfire.png',
    media: media('wildfire-ready'),
    source: { organization: 'Ready.gov (FEMA)', title: 'Wildfires', url: 'https://www.ready.gov/wildfires' },
    publishedAt: '2026-09-01',
    updatedAt: '2026-09-20',
    learn: [
      { en: 'How to sign up for official alerts', es: 'Cómo inscribirse en alertas oficiales' },
      { en: 'How to prepare to leave quickly', es: 'Cómo prepararse para salir rápidamente' },
    ],
    before: [
      { en: 'Sign up for your community’s official warning system.', es: 'Inscríbase en el sistema oficial de alertas de su comunidad.' },
      { en: 'Know your evacuation routes and have a plan for pets.', es: 'Conozca sus rutas de evacuación y tenga un plan para sus mascotas.' },
      { en: 'Keep the area around your home clear of things that can burn.', es: 'Mantenga el área alrededor de su casa libre de cosas que puedan quemarse.' },
    ],
    during: [
      { en: 'Leave right away if officials tell you to evacuate.', es: 'Salga de inmediato si las autoridades le indican evacuar.' },
      { en: 'If you are trapped, call 911 and give your location.', es: 'Si está atrapado, llame al 911 e indique su ubicación.' },
      { en: 'Use an N95 mask to protect yourself from smoke.', es: 'Use una mascarilla N95 para protegerse del humo.' },
    ],
    after: [
      { en: 'Only return home when officials say it is safe.', es: 'Regrese a casa solo cuando las autoridades digan que es seguro.' },
      { en: 'Avoid hot ash, charred trees and smoldering debris.', es: 'Evite la ceniza caliente, los árboles quemados y los escombros humeantes.' },
    ],
  },
  {
    id: 'flood-safety',
    topic: 'flood',
    title: { en: 'Flood safety', es: 'Seguridad ante inundaciones' },
    description: {
      en: 'Why moving water is dangerous and how to stay safe during heavy rain.',
      es: 'Por qué el agua en movimiento es peligrosa y cómo mantenerse seguro durante lluvias fuertes.',
    },
    durationMinutes: 4,
    thumbnail: '/images/courses/flood.png',
    media: media('flood-safety'),
    source: { organization: 'Ready.gov (FEMA)', title: 'Floods', url: 'https://www.ready.gov/floods' },
    publishedAt: '2026-09-01',
    updatedAt: '2026-09-20',
    learn: [
      { en: 'Why you should never drive through flood water', es: 'Por qué nunca debe conducir por agua de inundación' },
      { en: 'How flood insurance works', es: 'Cómo funciona el seguro contra inundaciones' },
    ],
    before: [
      { en: 'Learn whether your home is in a mapped flood zone.', es: 'Averigüe si su casa está en una zona de inundación mapeada.' },
      { en: 'Ask your insurance provider about flood insurance. Regular homeowners policies usually do not cover flooding.', es: 'Pregunte a su aseguradora sobre el seguro contra inundaciones. Las pólizas regulares de vivienda normalmente no cubren inundaciones.' },
    ],
    during: [
      { en: 'Turn Around, Don’t Drown: do not walk, swim or drive through flood water.', es: 'Dé la vuelta, no se ahogue: no camine, nade ni conduzca por agua de inundación.' },
      { en: 'Move to higher ground if told to evacuate.', es: 'Vaya a un lugar más alto si le indican evacuar.' },
    ],
    after: [
      { en: 'Stay out of flood water. It may be dirty or hide dangers.', es: 'Manténgase fuera del agua de inundación. Puede estar sucia u ocultar peligros.' },
      { en: 'Return only when officials say it is safe.', es: 'Regrese solo cuando las autoridades digan que es seguro.' },
    ],
  },
  {
    id: 'debris-flow-awareness',
    topic: 'debris-flow',
    title: { en: 'Mudslides and debris flows', es: 'Deslaves y flujos de escombros' },
    description: {
      en: 'Burned hillsides can send mud and rocks downhill during heavy rain. Learn the warning signs.',
      es: 'Las laderas quemadas pueden causar flujos de lodo y piedras durante lluvias fuertes. Conozca las señales.',
    },
    durationMinutes: 4,
    thumbnail: '/images/courses/hillside.png',
    media: media('debris-flow-awareness'),
    source: { organization: 'Ready.gov (FEMA)', title: 'Landslides & Debris Flow', url: 'https://www.ready.gov/landslides-debris-flow' },
    publishedAt: '2026-09-01',
    updatedAt: '2026-09-20',
    learn: [
      { en: 'Warning signs of a debris flow', es: 'Señales de advertencia de un flujo de escombros' },
      { en: 'When to leave', es: 'Cuándo salir' },
    ],
    before: [
      { en: 'Know if you live below a recently burned area.', es: 'Sepa si vive debajo de un área quemada recientemente.' },
      { en: 'Plan to leave early when heavy rain is forecast and officials advise it.', es: 'Planee salir temprano cuando se pronostiquen lluvias fuertes y las autoridades lo recomienden.' },
    ],
    during: [
      { en: 'Listen for unusual sounds like trees cracking or boulders knocking.', es: 'Escuche sonidos inusuales como árboles que crujen o rocas que chocan.' },
      { en: 'Move away from the path of the flow, uphill if possible.', es: 'Aléjese del camino del flujo, hacia arriba si es posible.' },
    ],
    after: [
      { en: 'Stay away from the slide area. More slides may happen.', es: 'Manténgase lejos del área del deslave. Puede haber más.' },
    ],
  },
  {
    id: 'evacuation-plan',
    topic: 'evacuation',
    title: { en: 'Make an evacuation plan', es: 'Haga un plan de evacuación' },
    description: {
      en: 'Decide where you would go, how you would get there, and who can help.',
      es: 'Decida a dónde iría, cómo llegaría y quién puede ayudarle.',
    },
    durationMinutes: 5,
    thumbnail: '/images/onboarding-home.png',
    media: media('evacuation-plan'),
    source: { organization: 'Ready.gov (FEMA)', title: 'Evacuation', url: 'https://www.ready.gov/evacuation' },
    publishedAt: '2026-09-01',
    updatedAt: '2026-09-20',
    learn: [
      { en: 'How to plan more than one way out', es: 'Cómo planear más de una salida' },
      { en: 'How to plan for people who need help', es: 'Cómo planear para personas que necesitan ayuda' },
    ],
    before: [
      { en: 'Choose a few places you could go, like a friend’s home in another area.', es: 'Elija algunos lugares a donde podría ir, como la casa de un amigo en otra zona.' },
      { en: 'If you do not drive, arrange a ride ahead of time.', es: 'Si no conduce, organice transporte con anticipación.' },
      { en: 'Plan for your pets — not every shelter accepts them.', es: 'Planee para sus mascotas: no todos los refugios las aceptan.' },
    ],
    during: [
      { en: 'Follow the routes officials recommend. Shortcuts may be blocked.', es: 'Siga las rutas que recomiendan las autoridades. Los atajos pueden estar bloqueados.' },
      { en: 'Take your emergency kit and medications.', es: 'Lleve su kit de emergencia y sus medicamentos.' },
    ],
    after: [
      { en: 'Let your emergency contact know you are safe.', es: 'Avise a su contacto de emergencia que está a salvo.' },
    ],
  },
  {
    id: 'emergency-kit',
    topic: 'supplies',
    title: { en: 'Build an emergency kit', es: 'Arme un kit de emergencia' },
    description: {
      en: 'The basic supplies your household needs for several days.',
      es: 'Los suministros básicos que su hogar necesita para varios días.',
    },
    durationMinutes: 4,
    thumbnail: '/images/courses/supplies.png',
    media: media('emergency-kit'),
    source: { organization: 'Ready.gov (FEMA)', title: 'Build A Kit', url: 'https://www.ready.gov/kit' },
    publishedAt: '2026-09-01',
    updatedAt: '2026-09-20',
    learn: [
      { en: 'What goes in a basic kit', es: 'Qué va en un kit básico' },
      { en: 'Extra items for medications and pets', es: 'Artículos adicionales para medicamentos y mascotas' },
    ],
    before: [
      { en: 'Water: one gallon per person per day for several days.', es: 'Agua: un galón por persona por día durante varios días.' },
      { en: 'Non-perishable food, a flashlight, a radio and extra batteries.', es: 'Comida no perecedera, una linterna, un radio y baterías extra.' },
      { en: 'A first aid kit, medications and copies of important documents.', es: 'Un botiquín, medicamentos y copias de documentos importantes.' },
    ],
    during: [],
    after: [
      { en: 'Refill and check your kit after you use it.', es: 'Reponga y revise su kit después de usarlo.' },
    ],
  },
  {
    id: 'pets-plan',
    topic: 'pets',
    title: { en: 'Prepare your pets', es: 'Prepare a sus mascotas' },
    description: {
      en: 'Pets depend on you. A few supplies and a plan go a long way.',
      es: 'Sus mascotas dependen de usted. Unos pocos suministros y un plan ayudan mucho.',
    },
    durationMinutes: 3,
    thumbnail: '/images/hero-neighbors.png',
    media: media('pets-plan'),
    source: { organization: 'Ready.gov (FEMA)', title: 'Pets and Animals', url: 'https://www.ready.gov/pets' },
    publishedAt: '2026-09-01',
    updatedAt: '2026-09-20',
    learn: [{ en: 'What to pack for your pet', es: 'Qué empacar para su mascota' }],
    before: [
      { en: 'Pack food, water, medicine and a leash or carrier.', es: 'Empaque comida, agua, medicina y una correa o transportadora.' },
      { en: 'Keep a current photo of your pet and your contact info on their tag.', es: 'Tenga una foto reciente de su mascota y sus datos en la placa.' },
    ],
    during: [{ en: 'Bring your pets with you if you evacuate.', es: 'Lleve a sus mascotas si evacúa.' }],
    after: [],
  },
]

export function getCourse(id: string) {
  return courses.find((c) => c.id === id)
}
