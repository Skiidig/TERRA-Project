# Architecture

TERRA has two distinct architectural generations preserved in Git:

- **Active V2 (`experiment/terra-v2-design`)** — Minimalist editorial architectural product experience with a pre-rendered Blender Cycles image-sequence assembly in Design Anatomy (2D Canvas, zero runtime WebGL).
- **Preserved V1 (`main` @ `7bd2201`)** — Editorial architectural monograph with a persistent real-time Three.js / React Three Fiber WebGL 2 diorama (`src/SceneViewport.tsx`, `src/cinematicCamera.ts`, `src/VillaBlockout.tsx`, `src/VillaMaterials.ts`, `src/TropicalLandscape.tsx`).

---

## Active V2 Architecture (`experiment/terra-v2-design`)

### Application Shell & Editorial Sections
- `src/main.tsx` mounts `src/App.tsx` inside React `StrictMode`.
- `src/App.tsx` renders the semantic single-page layout (`skip-link`, adaptive sticky `header` + accessible mobile drawer, `Hero`, `Philosophy`, `Materiality`, `<DesignAnatomySection />`, `Spatial Experience`, `Closing`, and `footer`) backed by typed content in `src/content/v2Content.ts` and custom-property CSS in `src/style.css`.
- Self-hosted Latin WOFF2 fonts (`Manrope` primary display/UI, `Cormorant Garamond` italic accent) live in `public/fonts/` with `0` external network requests.
- Responsive conceptual editorial photography lives in `public/images/*.webp` with explicit dimensions, `srcSet`/`sizes`, hero `<link rel="preload" fetchpriority="high">`, and `loading="lazy"` below the fold.
- A `useLayoutEffect` + `document.fonts.ready` alignment guard ensures direct fragment links (such as `/#anatomy`) land accurately below the sticky header without triggering GSAP `ScrollTrigger` mid-init errors.

### Design Anatomy Scroll-Controlled Assembly (`src/anatomy/`)
- **`src/anatomy/sequences.ts`** — Defines the responsive `COMPACT_VIEW` breakpoint (`(max-width: 47.99rem), (hover: none) and (pointer: coarse) and (max-height: 35rem)`), binary-search `frameAt(sequence, progress)`, poster helpers, and deduplicated `loadAnatomyManifest()` fetching `/anatomy-sequence/manifest.json`.
- **`src/anatomy/framePlayer.ts`** — 2D `<canvas>` `createImageBitmap` renderer compositing transparent Cycles shadow-catcher WebP frames over `#EBE7DC` with a `7.5%` perimeter gradient fade (`destination-in` + `destination-over`):
  - Bounded decoded `ImageBitmap` window (`8` desktop / `10` mobile, explicitly closed via `bitmap.close()` on eviction and teardown).
  - Bounded compressed `Blob` LRU (`9 MiB` desktop / `4 MiB` mobile) eliminating duplicate HTTP requests.
  - `CONCURRENCY = 2` request/decode lanes with velocity-aware stride lookahead on large desktop chases (`gap >= 12`), conservative stale-request cancellation outside the active travel span, and monotonic intermediate decoded fallback during cold fast scrubs.
  - Last-valid-frame hold during loading, `0` draws while idle, and 2-step automatic retry backoff (`650 ms`, `1600 ms`) before surfacing inline `Reload frame` recovery.
- **`src/anatomy/DesignAnatomySection.tsx`** — Integrates the player into a restrained native CSS `position: sticky` runway (`1120 px` desktop, `880 px` tablet, `680 px` mobile, `560 px` compact mobile; `0 px` under reduced motion or static poster fallback):
  - **Progressive Arming**: `IntersectionObserver` (`900 px` margin) defers manifest and frame fetches until `#anatomy` approaches the viewport (or immediately on `/#anatomy`).
  - **Adaptive Damped Playback**: Separates scroll `targetProgress` from `renderedProgress` inside an on-demand `requestAnimationFrame` loop (`tau = 65 ms` slow scrub, `85 ms` direction reversal, `115 ms` fast flick), converging exactly to `targetProgress` (`<= 0.0012` epsilon) and stopping rAF when settled (`0` idle CPU).
  - **Accessible Layer Inspector**: Synchronizes 4 architectural strata (`01` → `04`) with displayed progress without stealing keyboard focus; explicit tab click or WAI-ARIA `tablist` keyboard navigation (`Arrow`/`Home`/`End`) smoothly scrolls to the layer's canonical coordinate (`0 / 0.32 / 0.64 / 1.00`) with an interruptible selection lock (`wheel`/`touchstart` cancels immediately).

---

## Preserved V1 Architecture (`main` @ `7bd2201`)

On `main`, `src/SceneViewport.tsx` hosts one persistent responsive `<Canvas>` rendering the procedural tropical modern pavilion (`src/VillaBlockout.tsx`, `src/VillaMaterials.ts`, `src/TropicalLandscape.tsx`) driven by `src/cinematicCamera.ts` (`ScrollTrigger` + `OrbitControls` Browse/Explore handoff). Those source files remain untouched on `main` and unused by the V2 entry point.
