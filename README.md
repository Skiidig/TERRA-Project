# TERRA

**Architecture, distilled.** — *A quieter way to inhabit the world.*

TERRA is an independent minimalist architectural product experience built with Vite, React, TypeScript, GSAP, and plain CSS.

- **Active V3 Refinement (`experiment/terra-v3-cinematic`)**: Cinematic refinement work building on V2 — starting with cold-scroll performance optimization, versioned immutable sequence caching (`vercel.json`), and mobile polish.
- **Deployed Production V2 (`main` @ `bfe2c91` / `origin/main` @ `bead7ef`, preserved on `experiment/terra-v2-design`)**: Editorial architectural website leading with typography, proportion, and photography, enhanced selectively by a scroll-controlled pre-rendered Blender Cycles pavilion assembly in **Design Anatomy** (2D canvas + responsive WebP sequences, zero runtime WebGL), currently live at [https://terra-project-six.vercel.app](https://terra-project-six.vercel.app).
- **Preserved V1 Rollback Reference (`7bd2201`)**: Real-time procedural WebGL 2 diorama (Three.js / React Three Fiber / Drei).

---

## Homepage Architecture (V2)

1. **Hero (`Architecture, distilled.`)** — Asymmetric editorial lockup with self-hosted `Manrope` display typography, selective `Cormorant Garamond` italic accents, and high-priority responsive WebP hero imagery (`preload` + `fetchPriority="high"`).
2. **Philosophy (`Less form. More feeling.`)** — Asymmetric architectural detail study paired with concise prose and proportion metrics (`16 × 8 m`, `1.0 m` cantilever, `3.2 m` clear height).
3. **Materiality (`Nothing unnecessary.`)** — Staggered 3-column close-up studies of board-formed concrete, rift-cut natural oak, and low-iron architectural glass.
4. **Design Anatomy (`Every layer. A purpose.`)** — Restrained sticky-stage architectural separation driven by native scroll and adaptive damped playback (`65–115 ms` time constants), paired with a WAI-ARIA keyboard-accessible 4-layer inspector (`Cantilevered Roof Plane`, `Filtered Envelope`, `Structural Core & Interior`, `Grounded Plinth & Basin`).
5. **Spatial Experience (`Space to breathe.`)** — Full-bleed interior photography with subtle desktop-only scroll parallax.
6. **Closing & Footer (`Designed to feel different.`)** — Atmospheric dusk band with adaptive dark sticky header transition, semantic navigation, and conceptual imagery disclosure.

---

## Technology Stack

- **Core**: Vite 7, React 19, TypeScript 5.9, plain CSS with custom properties
- **Motion**: GSAP 3 (`ScrollTrigger`) + frame-rate-independent local `requestAnimationFrame` damping
- **Quality**: ESLint 10, `typescript-eslint`, React `StrictMode`
- **Legacy V1 3D Dependencies**: `three`, `@react-three/fiber`, and `@react-three/drei` remain in `package.json` for V1 compatibility on `main`, but are tree-shaken out of the V2 production bundle (`0` runtime WebGL code shipped in V2).

---

## Local Development & Production Build

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

Vite emits static production files to `dist/`.

---

## Animation Asset Organization & Responsive Loading

Production Design Anatomy frames live under a versioned directory (`public/anatomy-sequence/v2-004b/`) and are copied verbatim into `dist/anatomy-sequence/v2-004b/`:

| Variant | Resolution | Frames | Total Size | Profile | Breakpoint Selection |
| --- | --- | ---: | ---: | --- | --- |
| Desktop | `1600 × 1000` | `96` | `7.68 MiB` (`8,054,676 B`) | WebP `q86-s12` | `>= 768 px` non-compact viewports |
| Mobile | `896 × 560` | `48` | `1.994 MiB` (`2,091,116 B`) | WebP `q84-s6` | `< 768 px` or coarse-pointer landscape (`<= 35 rem` height) |
| Runtime Manifest | — | `144` entries | `13.5 kB` (`13,783 B`) | JSON | `/anatomy-sequence/v2-004b/manifest.json` |

### Loading, Caching & Memory Strategy
- **Zero Sequence Preload at Hero**: Intent-gated arming (`scrollY >= 40`, `/#anatomy`, or immediate on-screen intersection paired with approach `IntersectionObserver`) defers poster, manifest, and frame fetches during initial Hero load—even on tall desktop viewports (`1440×1400`).
- **Coarse-to-Fine Compressed Prefetch & Decoupled Queues**: Once armed and after the responsive poster loads, an idle background prefetcher populates only the bounded compressed `Blob` LRU (`9 MiB` desktop / `4 MiB` mobile) in coarse-to-fine order (`8 → 4 → 2 → 1`) using `4` desktop / `2` mobile fetch lanes while keeping `ImageBitmap` decoding (`2` lanes) strictly on active targets. Respects `Save-Data` / `2g` by disabling background prefetch.
- **Single-Variant Isolation & Versioned Caching**: Only `desktop/` or `mobile/` frames are fetched for the active viewport. `vercel.json` sets `Cache-Control: public, max-age=31536000, immutable` strictly on versioned `/anatomy-sequence/v2-004b/(.*)` while keeping mutable `/images/*` and `/fonts/*` on conservative `stale-while-revalidate` rules.
- **Strict Bounded Memory**: Pre-decode eviction caps live decoded `ImageBitmap`s strictly at `8` desktop frames (`48.83 MiB` peak RGBA) and `10` mobile frames (`19.14 MiB` peak RGBA) with explicit `bitmap.close()` eviction.
- **Resilience & Reduced Motion**: Last valid frame holds during loading (with monotonic intermediate bridge decoding on slow links); failed frames retry twice automatically before exposing an inline `Reload frame` control; `prefers-reduced-motion: reduce` skips manifest/sequence downloads and displays the assembled poster (`frame-000.webp`) with full manual layer-tab navigation.

---

## Editable Sources, Imagery Disclosure & Licenses

- **Design Anatomy Studio Sequence**: Rendered in Blender 5.3.0 (Cycles OptiX, transparent shadow catcher blended into `#EBE7DC`) from bespoke, original editable sources stored outside Git at `D:\GitHub\terra-v2-assets\pavilion-v2` (and production render/encode scripts at `D:\GitHub\terra-v2-assets\scroll-production-v2-004b`).
- **Conceptual Homepage Photography Disclosure**: Editorial imagery in Hero, Philosophy, Materiality, Spatial Experience, and Closing (`public/images/*.webp`) is **AI-generated conceptual architectural visualization** created for TERRA V2 and does not represent a built project.
- **Self-Hosted Fonts (`public/fonts/`, `0` external requests)**:
  - **Manrope** — SIL Open Font License, Version 1.1 ([OFL-Manrope.txt](public/fonts/OFL-Manrope.txt)).
  - **Cormorant Garamond** — SIL Open Font License, Version 1.1 ([OFL-Cormorant-Garamond.txt](public/fonts/OFL-Cormorant-Garamond.txt)).

---

## Known Limitations

- **Physical Mobile Devices**: Automated verification covered desktop, tablet, and emulated mobile portrait/landscape viewports (`1440×900`, `1024×768`, `768×1024`, `390×844`, `844×390`, `320×568`); physical iOS Safari and Android Chrome touch inertia and WebP decode profiling remain unverified.
- **Desktop Sequence Transfer Trade-off**: Full 96-frame desktop scrubbing transfers up to `7.68 MiB` (deferred until approaching Design Anatomy; initial hero load transfers `0 B` of sequence data).

---

## Deployment (Vercel)

TERRA is a static Vite frontend with no backend, database, or environment secrets.

- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: `26.x` (selected from `package.json` `engines.node`)

---

## Documentation

- [Agent Instructions](AGENTS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Handoff Log](docs/HANDOFF.md)
