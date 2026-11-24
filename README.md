# TERRA

**An Immersive Architectural Experience** — *Where architecture meets nature.*

**Live Production**: [https://terra-project-six.vercel.app](https://terra-project-six.vercel.app)

TERRA is an independent conceptual architectural visualization and interactive web portfolio experiment. It presents a single-story tropical modern pavilion as a calm digital architectural monograph integrated with a real-time procedural WebGL 2 diorama.

## Architectural Concept

The study explores a single-story tropical modern pavilion framed around three conceptual design intentions:

- **Deep Overhang** — A `16.0 × 8.0 m` volume crowned by a `0.3 m` flat roof slab with a `1.0 m` perimeter cantilever intended to shade the glazed facade.
- **Filtered Envelope** — Full-height glazed bays, a rear clerestory, and `13` vertical teak slats intended to moderate glare while opening visually toward the terrace and garden.
- **Grounded Water & Plinth** — A `24.0 × 18.0 m` diorama platform stepping from the elevated interior slab across `8` jointed limestone pavers to a recessed `10.0 × 3.5 m` still pool framed by tropical planting.

All dimensions, materials, and interior silhouettes are conceptual and procedurally generated in code.

## Experience & Features

- **Architectural Monograph Editorial Shell** — Light-only warm daylight palette (`Ivory`, `Stone`, `Timber`, `Olive`, `Ink`) with self-hosted `Cormorant Garamond` and `Manrope` typography (zero external runtime requests).
- **Four Cinematic Chapters** — On viewports `≥ 1024 × 650 px`, native scrolling drives a single GSAP `ScrollTrigger` across *01 / The Arrival*, *02 / Shelter & Shade*, *03 / Material & Texture*, and *04 / Landscape & Stillness* alongside a sticky architectural stage.
- **Browse & Explore Modes** — Browse Mode keeps native vertical scrolling unobstructed over the stage (`touch-action: pan-y`). Selecting **Explore 3D** transfers camera ownership to `OrbitControls` with drag orbit, wheel/pinch zoom, keyboard-accessible **Rotate left / right**, **Zoom in / out**, **Reset view**, and **Done exploring** / **Escape** exit with smooth return to the active chapter.
- **Responsive & Reduced-Motion Support** — Compact viewports (`< 1024 × 650 px`) and `prefers-reduced-motion: reduce` present a static establishing shot while preserving manual 3D exploration and disabling smooth scroll transitions.
- **WebGL 2 Fallback** — Initialization failure or runtime `webglcontextlost` replaces the diorama with an accessible status notice and disables 3D entry buttons while keeping the entire editorial monograph readable.

## Technology Stack

- **Core**: Vite 7, React 19, TypeScript 5.9, plain CSS with custom properties
- **3D & Motion**: Three.js 0.187, React Three Fiber 9, Drei 10, GSAP 3 (`ScrollTrigger`)
- **Quality**: ESLint 10, `typescript-eslint`, React `StrictMode`

## Local Installation & Development

Requires **Node.js 26 LTS** (`>=26 <27`) and **npm 11** (`>=11 <12`).

```bash
npm ci
npm run dev -- --host localhost
```

### Verification & Production Build

```bash
npm run typecheck
npm run lint
npm run build
npm run preview -- --host localhost
```

Vite writes static production assets to `dist/`.

## Performance Characteristics

Measured on the TERRA-008 production build in Microsoft Edge Headless (`ANGLE NVIDIA GeForce RTX 4060 Direct3D11`, `1152 × 920` and `1440 × 900` DPR 1):

- **Rendering**: `83` draw calls and `14,688` triangles per rendered frame (including shadow pass), single persistent WebGL `<Canvas>`, demand-based rendering (`0` frames during settled idle windows), and DPR bounded to `1–1.5`.
- **Assets**: `1,320.51 kB` minified / `381.16 kB` gzip production JS, `13.93 kB` minified / `3.32 kB` gzip CSS, and `85,832 B` total self-hosted Latin WOFF2 fonts (`0` external runtime requests).

## Typography & Font Licenses

Self-hosted Latin WOFF2 subsets under `public/fonts/`:

- **Cormorant Garamond** — Licensed under the SIL Open Font License, Version 1.1 ([OFL-Cormorant-Garamond.txt](public/fonts/OFL-Cormorant-Garamond.txt)).
- **Manrope** — Licensed under the SIL Open Font License, Version 1.1 ([OFL-Manrope.txt](public/fonts/OFL-Manrope.txt)).

## Known Limitations

- **Physical Mobile Devices**: Automated verification covered desktop, tablet, and mobile portrait/landscape viewport simulations; physical iOS Safari and Android Chrome touch/GPU testing remains a manual pre-deployment check.
- **Upstream Warnings**: Healthy browser runs log an upstream `THREE.Clock` deprecation warning from `@react-three/fiber@9.8.2`, and Vite reports a `> 500 kB` chunk-size notice for the combined Three.js/React/GSAP bundle.

## Deployment (Vercel)

TERRA is a static Vite frontend with no backend, database, or environment secrets.

- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: `26.x` (automatically selected from `package.json` `engines.node`)

## Documentation

- [Agent Instructions](AGENTS.md)
- [Project Brief](docs/PROJECT_BRIEF.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Handoff Log](docs/HANDOFF.md)
