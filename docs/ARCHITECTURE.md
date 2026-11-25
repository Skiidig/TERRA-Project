# Architecture

TERRA's architectural generations in Git:

- **Active V3 Refinement (`experiment/terra-v3-cinematic`, branched from `main` @ `bfe2c91`)** — Builds on the deployed V2 editorial architecture with decoupled cold-scroll prefetching, versioned immutable sequence caching, and mobile polish.
- **Deployed Production V2 (`main` @ `bfe2c91` / `origin/main` @ `bead7ef`, preserved on `experiment/terra-v2-design`)** — Minimalist editorial architectural product experience with a pre-rendered Blender Cycles image-sequence assembly in Design Anatomy (2D Canvas, zero runtime WebGL).
- **Preserved V1 Rollback Reference (`7bd2201`)** — Editorial architectural monograph with a persistent real-time Three.js / React Three Fiber WebGL 2 diorama (`src/SceneViewport.tsx`, `src/cinematicCamera.ts`, `src/VillaBlockout.tsx`, `src/VillaMaterials.ts`, `src/TropicalLandscape.tsx`).

---

## Active Editorial & Sequence Architecture (V2 / V3-002)

### Application Shell & Editorial Sections
- `src/main.tsx` mounts `src/App.tsx` inside React `StrictMode`.
- `src/App.tsx` renders the semantic single-page layout (`skip-link`, adaptive sticky `header` + accessible mobile drawer, `Hero`, `Philosophy`, `Materiality`, `<DesignAnatomySection />`, `Spatial Experience`, `Closing`, and `footer`) backed by typed content in `src/content/v2Content.ts` and custom-property CSS in `src/style.css`.
- Self-hosted Latin WOFF2 fonts (`Manrope` primary display/UI, `Cormorant Garamond` italic accent) live in `public/fonts/` with `0` external network requests.
- Responsive conceptual editorial photography lives in `public/images/*.webp` with explicit dimensions, `srcSet`/`sizes`, hero `<link rel="preload" fetchpriority="high">`, and `loading="lazy"` below the fold.
- Scroll reveals use viewport-aware opacity floors (`0.85` on compact viewports, `0.32` on desktop) so headings remain legible while entering view; the sticky header switches cleanly (`160 ms`) with `+16 px` lead before `#closing`.
- A `useLayoutEffect` + `document.fonts.ready` alignment guard ensures direct fragment links (such as `/#anatomy`) land accurately below the sticky header without triggering GSAP `ScrollTrigger` mid-init errors.

### Design Anatomy Scroll-Controlled Assembly (`src/anatomy/`)
- **`src/anatomy/sequences.ts`** — Defines the responsive `COMPACT_VIEW` breakpoint (`(max-width: 47.99rem), (hover: none) and (pointer: coarse) and (max-height: 35rem)`), the versioned asset prefix `ANATOMY_SEQUENCE_VERSION = 'v2-004b'` (`/anatomy-sequence/v2-004b/`), binary-search `frameAt(sequence, progress)`, poster helpers, and deduplicated `loadAnatomyManifest()` fetching `/anatomy-sequence/v2-004b/manifest.json`.
- **`vercel.json`** — Applies `Cache-Control: public, max-age=31536000, immutable` strictly to the versioned `/anatomy-sequence/v2-004b/(.*)` directory, and conservative revalidation headers (`stale-while-revalidate`) to mutable `/images/(.*)` and `/fonts/(.*)` paths.
- **`src/anatomy/framePlayer.ts`** — 2D `<canvas>` `createImageBitmap` renderer compositing transparent Cycles shadow-catcher WebP frames over `#EBE7DC` with a `7.5%` perimeter gradient fade (`destination-in` + `destination-over`):
  - **Strict Bounded Decoded Memory**: Pre-decode eviction ensures live `ImageBitmap`s never exceed `8` desktop (`48.83 MiB` peak RGBA) or `10` mobile (`19.14 MiB` peak RGBA), explicitly closed via `bitmap.close()`.
  - **Decoupled Fetch & Decode Queues**: HTTP fetch lanes (`4` desktop / `2` mobile) operate independently of `createImageBitmap` decode lanes (`2`). While idle after the poster loads, a coarse-to-fine prefetcher (strides `8 → 4 → 2 → 1` + endpoint) populates only the bounded compressed `Blob` LRU (`9 MiB` desktop / `4 MiB` mobile) without decoding bitmaps, yielding immediately to active scroll demand without aborting in-flight downloads.
  - **Slow-Network & Data-Saver Resilience**: Monotonic intermediate bridge decoding paints already-cached frames between `shown` and `target` while exact target frames fetch; `Save-Data` / `2g` disables background prefetch and narrows active lookahead to `2` frames; last-valid-frame holds through loading with 2-step retry backoff (`650 ms`, `1600 ms`) before exposing inline `Reload frame` recovery.
- **`src/anatomy/DesignAnatomySection.tsx`** — Integrates the player into a restrained native CSS `position: sticky` runway (`1120 px` desktop, `880 px` tablet, `680 px` mobile, `560 px` compact mobile; `0 px` under reduced motion or static poster fallback):
  - **Intent-Gated Progressive Arming**: Requires scroll intent (`scrollY >= 40`), direct `/#anatomy` navigation, or immediate on-screen intersection paired with approach `IntersectionObserver` (`2400 px` desktop / `4200 px` compact) — guaranteeing `0 B` sequence/poster downloads at Hero even on tall desktop viewports (`1440×1400`), then prioritizing the active responsive poster (`<link rel="preload" fetchpriority="high">` + `loading="eager"`) before sequence frames.
  - **Adaptive Damped Playback**: Separates scroll `targetProgress` from `renderedProgress` inside an on-demand `requestAnimationFrame` loop (`tau = 65 ms` slow scrub, `85 ms` direction reversal, `115 ms` fast flick), converging exactly to `targetProgress` (`<= 0.0012` epsilon) and stopping rAF when settled (`0` idle CPU).
  - **Accessible Layer Inspector**: Synchronizes 4 architectural strata (`01` → `04`) with displayed progress without stealing keyboard focus; explicit tab click or WAI-ARIA `tablist` keyboard navigation (`Arrow`/`Home`/`End`) smoothly scrolls to the layer's canonical coordinate (`0 / 0.32 / 0.64 / 1.00`) with an interruptible selection lock (`wheel`/`touchstart` cancels immediately).

---

## Preserved V1 Architecture (Rollback Reference @ `7bd2201`)

At commit `7bd2201`, `src/SceneViewport.tsx` hosted one persistent responsive `<Canvas>` rendering the procedural tropical modern pavilion (`src/VillaBlockout.tsx`, `src/VillaMaterials.ts`, `src/TropicalLandscape.tsx`) driven by `src/cinematicCamera.ts` (`ScrollTrigger` + `OrbitControls` Browse/Explore handoff). Those source files remain untouched in the repository tree and tree-shaken out of the V2/V3 bundle.
