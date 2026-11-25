export interface NavItem {
  readonly id: string
  readonly label: string
}

export interface ProportionMetric {
  readonly value: string
  readonly label: string
}

export interface MaterialStudy {
  readonly index: string
  readonly name: string
  readonly role: string
  readonly description: string
  readonly image: string
  readonly imageSrcSet: string
  readonly width: number
  readonly height: number
  readonly alt: string
}

export interface AnatomyLayer {
  readonly id: string
  readonly index: string
  readonly title: string
  readonly shortTitle: string
  readonly summary: string
  readonly specification: string
}

export const navigationItems: readonly NavItem[] = [
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'materiality', label: 'Materiality' },
  { id: 'anatomy', label: 'Anatomy' },
  { id: 'space', label: 'Space' },
  { id: 'closing', label: 'Pavilion' },
]

export const heroContent = {
  eyebrow: 'TERRA Pavilion · Concept 01',
  headline: 'Architecture, distilled.',
  supportingLine: 'A quieter way to inhabit the world.',
  ctaLabel: 'Explore the architecture',
  ctaHref: '#philosophy',
  image: '/images/hero.webp',
  imageSrcSet: '/images/hero-800w.webp 800w, /images/hero.webp 1376w',
  width: 1376,
  height: 768,
  imageAlt:
    'Conceptual exterior visualization of the single-story TERRA pavilion with a cantilevered pale concrete roof, vertical oak louvers, frameless glass, and a still reflecting pool set in coastal meadow grasses.',
  caption: 'Single-story coastal pavilion study · Conceptual visualization',
} as const

export const philosophyContent = {
  eyebrow: '01 · Philosophy',
  headline: 'Less form.\nMore feeling.',
  paragraphs: [
    'TERRA begins by removing everything that interrupts daylight, horizon, and stillness. A single horizontal roof plane anchors the volume while deep perimeter overhangs soften the sun before it reaches the glass.',
    'Every line serves proportion and calm. Nothing is added for ornament; every junction is resolved so the eye moves effortlessly from interior timber to coastal meadow.',
  ],
  image: '/images/philosophy.webp',
  imageSrcSet: '/images/philosophy-760w.webp 760w, /images/philosophy.webp 1200w',
  width: 1200,
  height: 896,
  imageAlt:
    'Architectural detail of the TERRA pavilion showing a cantilevered board-formed concrete roof overhang casting a clean diagonal shadow across pale limestone pavers and vertical oak timber louvers.',
  metrics: [
    { value: '16 × 8 m', label: 'Pavilion footprint' },
    { value: '1.0 m', label: 'Perimeter cantilever' },
    { value: '3.2 m', label: 'Clear interior height' },
  ] satisfies readonly ProportionMetric[],
} as const

export const materialityContent = {
  eyebrow: '02 · Materiality',
  headline: 'Nothing unnecessary.',
  intro:
    'Three honest architectural surfaces—chosen for how they age in coastal light, absorb sound, and meet the hand.',
  materials: [
    {
      index: '01',
      name: 'Board-Formed Concrete',
      role: 'Structure & Overhang',
      description:
        'Warm limestone-aggregate concrete cast against fine timber formwork, finished with razor-sharp recessed shadow reveals.',
      image: '/images/material-concrete.webp',
      imageSrcSet: '/images/material-concrete-540w.webp 540w, /images/material-concrete.webp 896w',
      width: 896,
      height: 1200,
      alt: 'Close-up architectural material study of warm pale board-formed concrete with subtle timber formwork grain and a sharp recessed horizontal shadow joint.',
    },
    {
      index: '02',
      name: 'Rift-Cut Natural Oak',
      role: 'Filtered Envelope',
      description:
        'Vertically milled timber louvers that temper low morning glare while introducing warmth, rhythm, and natural acoustic softness.',
      image: '/images/material-timber.webp',
      imageSrcSet: '/images/material-timber-540w.webp 540w, /images/material-timber.webp 896w',
      width: 896,
      height: 1200,
      alt: 'Close-up architectural material study of precision-milled vertical rift-cut pale oak timber louvers catching soft diagonal daylight.',
    },
    {
      index: '03',
      name: 'Low-Iron Architectural Glass',
      role: 'Unbroken Threshold',
      description:
        'Floor-to-ceiling ultra-clear glazing set into slim charcoal channels, dissolving the boundary between shelter and landscape.',
      image: '/images/material-glass.webp',
      imageSrcSet: '/images/material-glass-540w.webp 540w, /images/material-glass.webp 896w',
      width: 896,
      height: 1200,
      alt: 'Close-up architectural junction where ultra-clear low-iron glass meets a recessed matte charcoal mullion and pale concrete soffit.',
    },
  ] satisfies readonly MaterialStudy[],
} as const

export const anatomyContent = {
  eyebrow: '03 · Design Anatomy',
  headline: 'Every layer. A purpose.',
  intro:
    'Composed like a precision instrument, TERRA separates shelter, climate moderation, structural core, and ground plane into four legible architectural strata.',
  imageAlt:
    'Scroll-controlled architectural assembly of the TERRA pavilion separating from an assembled volume into four aligned strata: cantilevered concrete roof, oak louver and glass envelope, interior core, and limestone plinth with recessed reflecting basin.',
  layers: [
    {
      id: 'roof',
      index: '01',
      title: 'Cantilevered Roof Plane',
      shortTitle: 'Roof',
      summary:
        'A 300 mm monolithic concrete slab extending 1.0 m beyond the glazing to shade the facade.',
      specification: 'Board-formed concrete · Integrated skylight aperture',
    },
    {
      id: 'envelope',
      index: '02',
      title: 'Filtered Envelope',
      shortTitle: 'Envelope',
      summary:
        'Vertical timber louvers and full-height sliding low-iron glass moderate light, breeze, and privacy.',
      specification: 'Rift-cut oak screen · Slim charcoal steel frames',
    },
    {
      id: 'core',
      index: '03',
      title: 'Structural Core & Interior',
      shortTitle: 'Core & interior',
      summary:
        'Load-bearing plaster-finished concrete partitions organize living, dining, and quiet retreat zones.',
      specification: 'Open-plan 128 m² interior · Wide-plank matte oak floor',
    },
    {
      id: 'plinth',
      index: '04',
      title: 'Grounded Plinth & Basin',
      shortTitle: 'Plinth',
      summary:
        'An elevated limestone terrace steps cleanly to a recessed dark-stone reflecting pool.',
      specification: '22.5 × 16.34 m studio plinth · 10.7 × 3.3 m recessed basin',
    },
  ] satisfies readonly AnatomyLayer[],
} as const

export const spatialContent = {
  eyebrow: '04 · Spatial Experience',
  headline: 'Space to breathe.',
  intro:
    'Inside, architecture recedes into light, horizon, and proportion—leaving room only for presence.',
  image: '/images/spatial.webp',
  imageSrcSet: '/images/spatial-800w.webp 800w, /images/spatial.webp 1376w',
  width: 1376,
  height: 768,
  imageAlt:
    'Serene minimalist interior of the TERRA pavilion with wide-plank pale oak floors, concrete ceiling, travertine table, linen daybed, and frameless glass opening onto a still reflecting pool and coastal meadow.',
  notes: [
    {
      title: 'Threshold dissolved',
      body: 'Full-height sliding glass pockets away completely, extending the oak living floor directly onto the limestone terrace and water edge.',
    },
    {
      title: 'Measured daylight',
      body: 'Soft north-facing light washes across matte plaster and mineral concrete, shifting gently from cool morning clarity to warm evening stillness.',
    },
  ] as const,
} as const

export const closingContent = {
  eyebrow: 'TERRA · Concept 01',
  headline: 'Designed to feel different.',
  supportingLine:
    'A quiet architectural study in proportion, honest materiality, and calm presence.',
  ctaLabel: 'Return to top',
  image: '/images/closing.webp',
  imageSrcSet: '/images/closing-800w.webp 800w, /images/closing.webp 1376w',
  width: 1376,
  height: 768,
  imageAlt:
    'Dusk architectural visualization of the TERRA pavilion glowing softly with warm interior light reflected across a dark still water basin under a muted twilight sky.',
} as const

export const footerContent = {
  wordmark: 'TERRA',
  tagline: 'Architecture, distilled.',
  prototypeNotice:
    'Design Anatomy is rendered from the bespoke studio pavilion sequence; editorial photography across other sections is AI-generated conceptual visualization and does not represent a built project.',
  colophon: 'TERRA Architectural Product Experience',
} as const
