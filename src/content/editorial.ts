export interface NavItem {
  id: string
  label: string
}

export interface ConceptPrinciple {
  index: string
  title: string
  body: string
}

export interface MaterialEntry {
  name: string
  role: string
  swatch: string
  secondarySwatch?: string
  description: string
}

export interface SpecificationItem {
  label: string
  value: string
}

export const navigationItems: NavItem[] = [
  { id: 'pavilion', label: 'Pavilion' },
  { id: 'concept', label: 'Concept' },
  { id: 'materials', label: 'Materials' },
  { id: 'specifications', label: 'Specs' },
]

export const heroContent = {
  eyebrow: '01 / Conceptual Architecture',
  title: 'TERRA',
  tagline: 'Where architecture meets nature.',
  lead: 'A conceptual tropical modern pavilion studied as an architectural diorama — shaped around deep roof shade, filtered daylight, and a quiet threshold between shelter and garden.',
  primaryCta: 'Explore 3D study',
}

export const stageContent = {
  eyebrow: 'Interactive Diorama',
  title: 'Tropical Modern Villa',
  description:
    'A single-story pavilion with a flat overhanging roof, full-height glazed walls, vertical timber screening, a limestone terrace, and a recessed pool.',
  browseStatus: 'Browse mode — page scroll active.',
  exploreStatus: 'Explore mode — drag to orbit, scroll or pinch to zoom, Escape to exit.',
}

export const conceptSection = {
  eyebrow: '02 / Concept',
  heading: 'Shelter as a porous threshold.',
  intro:
    'TERRA frames a single-story tropical pavilion as an open-ended spatial study rather than an enclosed volume. Each architectural plane is positioned to temper sun, invite natural openness, and anchor the structure within its planting beds.',
  principles: [
    {
      index: '01',
      title: 'Deep Overhang',
      body: 'A continuous flat roof slab extends one meter beyond the perimeter walls, intended to cast deep shade across the glazed elevation and soften the passage from sunlit terrace to interior.',
    },
    {
      index: '02',
      title: 'Filtered Envelope',
      body: 'Full-height glazed bays open the pavilion toward the terrace, paired with a rear clerestory and thirteen vertical teak slats intended to temper glare while preserving visual continuity with the garden.',
    },
    {
      index: '03',
      title: 'Grounded Water & Plinth',
      body: 'A low architectural plinth lifts the living plane above the site platform, stepping down across jointed limestone pavers to meet a recessed, still pool framed by tropical planting.',
    },
  ] satisfies ConceptPrinciple[],
}

export const materialitySection = {
  eyebrow: '03 / Materiality',
  heading: 'Four calm architectural surfaces.',
  intro:
    'The pavilion relies on a restrained palette of matte mineral planes, warm timber screening, pale stone paving, and cool translucent glazing — composed to register daylight and shadow with clarity.',
  materials: [
    {
      name: 'Warm Cast Concrete',
      role: 'Structural walls & roof slab',
      swatch: '#D2C9BA',
      description:
        'A matte, sun-warmed mineral shell that holds crisp shadow lines from the overhanging soffit and adjacent palm fronds.',
    },
    {
      name: 'Vertical Teak Screening',
      role: 'Solar brise-soleil',
      swatch: '#987452',
      description:
        'Thirteen upright timber slats positioned forward of the western bay, introducing tactile warmth and rhythmic filtered light.',
    },
    {
      name: 'Jointed Limestone Paving',
      role: 'Terrace & pool coping',
      swatch: '#C5BBA8',
      description:
        'Eight modular stone pavers stepping cleanly from the elevated interior slab to the recessed perimeter of the water basin.',
    },
    {
      name: 'Tinted Glazing & Still Water',
      role: 'Enclosure & reflective basin',
      swatch: '#6FABA9',
      secondarySwatch: '#A5BDBA',
      description:
        'Lightly tinted glass panes set in dark coated frames pair with a calm recessed pool to balance openness with cool tone.',
    },
  ] satisfies MaterialEntry[],
}

export const specificationsSection = {
  eyebrow: '04 / Specifications',
  heading: 'Conceptual study dimensions.',
  intro:
    'Proportions and element counts below correspond directly to the procedural architectural model presented in the interactive diorama.',
  items: [
    { label: 'Typology', value: 'Single-story tropical modern pavilion (conceptual study)' },
    { label: 'Site Plinth', value: '24.0 × 18.0 m diorama platform' },
    { label: 'Pavilion Footprint', value: '16.0 × 8.0 m primary volume' },
    { label: 'Clear Interior Height', value: '3.2 m interior height · 0.3 m flat roof slab' },
    { label: 'Roof Cantilever', value: '1.0 m perimeter overhang' },
    { label: 'Shaded Terrace', value: '16.0 × 3.0 m jointed limestone deck' },
    { label: 'Recessed Pool', value: '10.0 × 3.5 m basin · 0.32 m recess' },
    { label: 'Timber Screening', value: '13 vertical teak slats' },
    { label: 'Landscape Beds', value: '3 palms · 14 low shrubs · 10 ornamental grass tufts' },
    { label: 'Medium', value: 'Real-time WebGL 2 procedural architectural diorama' },
  ] satisfies SpecificationItem[],
}

export const footerContent = {
  wordmark: 'TERRA',
  tagline: 'Where architecture meets nature.',
  colophon: 'An independent conceptual architectural visualization study.',
  backToTopLabel: 'Return to top',
}
