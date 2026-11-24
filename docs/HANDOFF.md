# Handoff

## TERRA-009 · Portfolio release (complete)

Deployed TERRA MVP to Vercel via GitHub integration (`https://github.com/Skiidig/TERRA-Project.git` → `https://terra-project-six.vercel.app`) and verified the live HTTPS production deployment.

- **Clean Install & Reproducibility**: Verified in an isolated temporary clone (`git clone --no-hardlinks`) on Node.js `v26.13.1` and npm `11.20.0`. `npm ci` installed 217 packages (`0` vulnerabilities, expected `esbuild@0.28.2` `allowScripts` warning), followed by passing `npm run typecheck`, `npm run lint`, and `npm run build` (`3.42 s`) with zero modifications to `package-lock.json`.
- **Vercel Deployment**: Auto-detected `Vite` preset (`npm run build`, `dist/`, Node.js `26.x` from `package.json` `engines.node`, production branch `main`, no environment variables or `vercel.json`).
- **Release Metadata & Documentation**: Added architectural SVG favicon (`public/favicon.svg`), canonical URL (`https://terra-project-six.vercel.app/`), Open Graph (`og:url`, `og:title`, `og:description`) and Twitter summary metadata in `index.html`, and finalized `README.md` with the live production link, verified metrics, SIL OFL 1.1 font attribution, and limitations.
- **Live HTTPS Production Smoke Test (`https://terra-project-six.vercel.app/`)**: Verified via isolated Edge Headless CDP: HTTP `200`, `/favicon.svg` HTTP `200`, fresh deep link (`/#materials` → `scrollY: 1312`, `03 / Material & Texture`), all 4 desktop chapters (`01` → `04`), Explore Mode entry/controls/`Escape` focus restoration, mobile portrait (`390 × 844`, `0` overflow, `touch-action: pan-y`), `3/3` local fonts loaded, `prefers-reduced-motion: reduce`, runtime `WEBGL_lose_context` fallback, WebGL init-failure fallback, `0` external runtime requests, and `0` normal console errors.
- **Remaining Limitations**: Real physical Android Chrome and iOS Safari testing and dedicated GPU/device FPS measurements remain unverified (deployment proceeded with explicit user acknowledgment).

## TERRA-008 · Performance optimization, regression QA, and release candidate

Profiled the production build (`vite preview` on `http://localhost:4173/`) using isolated Microsoft Edge Headless over CDP (`ANGLE NVIDIA GeForce RTX 4060 Direct3D11`), audited the production JS bundle and technical debt, applied one targeted rendering optimization, and completed all deferred fault-injection and media-emulation QA checks.

- **Targeted Optimization**: Replaced the 8 separate terrace limestone paver meshes in `src/VillaBlockout.tsx` with a single `InstancedMesh` (`TerracePavers`), cutting draw calls from `90` to `83` (`-7` / `-7.8%`) and geometries by `7` with identical visual output.
- **Bundle & Technical Debt Decisions**:
  - Production JS is `1,320.51 kB` minified / `381.16 kB` gzip (`three` 58.7%, `react-dom` 18.2%, `gsap` 10.4%, `@react-three/fiber` 8.6%, `src/` 1.7%, `three-stdlib` 1.0%, `@react-three/drei` 0.1%). Tree-shaking is effective with zero duplicate packages; artificial chunk splitting does not reduce initial transfer and lazy-loading GSAP risks deep-link/ScrollTrigger races, so the single clean bundle is retained.
  - `THREE.Clock` deprecation warning originates upstream in `@react-three/fiber@9.8.2` (`events-e51d7528.esm.js:1207`); documented and deferred.
  - `skipLibCheck: true` remains required due to two transitive `three-stdlib` declaration incompatibilities (`SVGLoader.d.ts`, `TGALoader.d.ts`) against `@types/three@0.187.0`; application strictness is unaffected.
- **Measured Performance (`1152 × 920` DPR 1 `653 × 786` & `1440 × 900` DPR 1, RTX 4060 ANGLE D3D11)**:
  - Draw calls / triangles (including shadow pass): `83` / `14,688` (well below `< 100` calls and `150,000` triangle ceilings).
  - Settled idle frames (`500 ms` initial & `400 ms` post-scroll): `0`. Long tasks (`> 50 ms`): `0`.
  - Scroll CPU duration (`1440 × 900`): median `1.10 ms`, p95 `1.60 ms`. Explore drag + damping (`104` frames): CPU median `0.65 ms`, p95 `0.90 ms`; render-start interval median `5.5 ms`, p95 `5.8 ms`.
  - Mobile DPR capping confirmed (`390×844` DPR 2 → `585×396` buffer = `1.5×`). CSS `3.32 kB` gzip; self-hosted WOFF2 fonts `85,832 B`; `0` external network requests.
- **Regression & Deferred QA**: Passed across `1440×900`, `1152×920`, `1024×768`, `1023×768` (breakpoint), `768×1024`, `667×375` (mobile landscape), `390×844`, and `320×568` (0 overflow, 1 persistent `<canvas>`, all 3 local fonts loaded). Live CDP verification passed for **WebGL init failure** (`getContext -> null`), **runtime `WEBGL_lose_context`** during Explore Mode, and **`prefers-reduced-motion: reduce`** with dynamic toggle back to `no-preference`. Physical iOS Safari / Android Chrome devices were not available and remain pending manual release checks.

## TERRA-007 · Architectural visual refinement

Targeted visual refinement pass informed by live multi-viewport browser inspection of the TERRA-006 baseline. Camera ownership, ScrollTrigger lifecycle, OrbitControls handoff, reduced-motion behavior, and WebGL fallback code (`src/cinematicCamera.ts`, `src/SceneViewport.tsx`, `src/App.tsx`) were preserved unchanged.

- **Initial Findings Addressed**:
  - **P1 Sticky Stage Void**: On desktop (`1440 × 900`), the sticky left stage previously stopped ~189 px above the viewport bottom, leaving empty cream space beneath the stage bar. `.story-layout > .stage-section` now fills `calc(100svh - var(--header-height))` as a flex column with `.scene-viewport { flex: 1 1 auto; }`.
  - **P1 Empty Interior Behind Glazing**: Close-up views (Chapter 3 `Material & Texture` and Explore Mode) revealed an empty box behind the 5-bay glazing. Added `<group name="Interior">` in `src/VillaBlockout.tsx` with restrained instanced silhouettes (rear credenza, dining table, lounge platform, linen cushions, interior floor slab, and a concrete divider) reusing shared standard materials.
  - **P2 Grounding, Junctions & Material Separation**: Added a recessed plinth base skirt (`plinthBase`) beneath the 24 × 18 m site platform, a limestone threshold step between the interior slab and terrace, a corner pool entry step, slightly wider terrace paver joints (`0.045 m`), and refined tonal contrast in `src/VillaMaterials.ts`.
  - **P2 Vegetation Silhouettes**: Upgraded `src/TropicalLandscape.tsx` within the existing 4 instanced meshes (0 extra draw calls) to 3-lobe organic shrub clusters (42 instances) and fuller 12-frond palm crowns (36 instances).
  - **P2 Hero & Stage Bar Ergonomics**: Tightened hero vertical padding and converted the desktop `.story-layout .stage-bar-inner` to a compact horizontal row so the Browse bar stays single-line and all 6 Explore controls fit on one row without wrapping.
- **Rejected / Deferred**: Chapter camera coordinates in `src/cinematicCamera.ts` were kept unchanged (preserving the verified ScrollTrigger choreography and intentional Chapter 3 material-detail framing). External textures, HDRIs, animated water, shaders, and postprocessing remain out of MVP scope.
- **Verification & Performance**: `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check` passed; `package.json` and `package-lock.json` are unchanged. Production JS is `1,320.18 kB` minified / `381.12 kB` gzip (+0.48 kB gzip vs TERRA-006); CSS is `13.93 kB` minified / `3.32 kB` gzip; self-hosted fonts remain `85,832 B`. Browser verification passed at `1440 × 900`, `1024 × 768`, `768 × 1024`, `390 × 844`, and `320 × 568` (0 console errors, 0 external requests, 0 horizontal overflow, single persistent `<canvas>`, forward/backward chapter scroll, anchor navigation, Browse wheel scroll, Explore orbit/rotate/zoom/reset/Escape focus restoration, and unclipped framing).
- **Deferred to TERRA-008**: Runtime `renderer.info` draw-call/triangle verification (estimated ~88 draw calls / ~11.5k triangles after adding `Interior`, plinth skirt, threshold step, and pool corner step), live `prefers-reduced-motion` media emulation, WebGL init-failure / `WEBGL_lose_context` fault injection (unchanged since TERRA-006; unavailable in `webview_browser` sandbox), and physical mobile touch/GPU profiling.

## TERRA-006 · Cinematic experience

The monograph now has a sticky stage beside the narrative at 1024 × 650 CSS px or larger. A single ScrollTrigger reads native scroll on the existing section anchors. It holds each composition before easing into the next over at most 360 px. Smaller viewports and reduced-motion users get a static Arrival shot and can still explore manually. Arrival is visible immediately.

| Chapter | Editorial anchor | Camera position | Look target |
| --- | --- | --- | --- |
| The Arrival | Pavilion | `[23, 18, 28]` | `[0, 0.9, 0]` |
| Shelter & Shade | Concept | `[12, 10.7, 27]` | `[0, 1.15, 0.1]` |
| Material & Texture | Materials | `[-7.3, 5.95, 20.7]` | `[-1.65, 1.7, 1.25]` |
| Landscape & Stillness | Specs | `[-17.5, 17, 26.5]` | `[0, 0.65, 2.8]` |

Explore starts and resets at the pose and target visible on entry. While exploring, progress still tracks scroll. Done and Escape clear manual damping and start an interruptible return around the site. Reduced motion cuts to Arrival. Re-entry kills the return and takes over from the displayed camera. The trigger cleans up on media changes and unmount, refreshes after fonts load, and never pins the page. Scroll restoration runs after React inserts the document when native restoration has not already moved the page.

Browser QA passed at 1440 × 900, 1024 × 768, 768 × 1024, 390 × 844, and 320 × 568. Verified both scroll directions, chapter anchors and reload, reset and interrupted handoffs, one Canvas during resize, keyboard focus, touch emulation, dynamic reduced motion, and both WebGL failure paths. The StrictMode development build settled at one story trigger and zero return tweens. No normal application errors or external requests were observed. The existing Three.js Clock warning remains.

Draw calls and triangles stayed at 80 and 8,984 per measured frame, including shadows. Geometries and textures were 55 and 3. The RTX 4060 Chromium measurement used a 1152 × 920 viewport at DPR 1 and a 653 × 496 buffer. Production JavaScript is 380.64 kB gzip (+47.61 kB versus TERRA-005C). Fonts remain 85,832 bytes. On an isolated Edge SwiftShader run at 1440 × 900, two settled windows of 250–260 ms rendered zero frames. Scripted wheel input produced 20 frames, with renderer-call CPU median/p95 of 0.6/0.9 ms and render-start interval 39.1/54.9 ms. A scripted drag and damping produced 33 frames, with CPU 0.7/1.3 ms and interval 31.7/37.1 ms. These samples include input scheduling effects and do not establish GPU timing or device FPS.

## TERRA-005C · Editorial integration checkpoint

Reviewed Antigravity’s Architectural Monograph implementation, self-hosted fonts and licenses, and Browse/Explore integration. The approved design and protected villa geometry, materials, landscaping, and dependencies are intact.

The original Canvas event wrapper computed `touch-action: none` after OrbitControls connected. A scoped CSS rule now inherits the stage policy on that event target, with no imperative ancestor styling. Explore focuses the first camera control, both entry buttons disable when WebGL is unavailable, and the skip link focuses the main landmark.

Production browser QA passed at 1440, 1024, 768, 390, and 320 px. Verified one persistent Canvas, unclipped default framing, wheel scroll, orbit, zoom, rotate buttons, reset, keyboard navigation, Escape focus restoration, and both WebGL failure paths. Isolated Edge emulation verified initial Browse swipe scrolling, Explore touch orbit and pinch, and restored scrolling on exit. The same browser verified reduced-motion media behavior and camera controls, loaded all three local font faces, and recorded no external requests. A clean production tab reported no application errors and the existing Three.js Clock warning. Physical mobile touch remains untested.

| Metric | TERRA-004 | TERRA-005C |
| --- | ---: | ---: |
| Draw calls / triangles including shadow work | 80 / 8,984 | 80 / 8,984 |
| Renderer geometries / textures | 56 / 3 | 55 / 3 |
| Production JS minified / gzip | 1,186.44 / 329.20 kB | 1,198.19 / 333.03 kB |

The renderer counters use the same per-render reset and 1152 × 920 Chromium viewport, DPR 1, and RTX 4060 ANGLE D3D11 as TERRA-004. The editorial Canvas buffer is 1137 × 607 instead of 1024 × 512. Fonts total 85,832 bytes. Interaction frame timing and GPU timing were not remeasured. The production build still reports the chunk size warning. See the next task at the end of this file.

## TERRA-005 · Editorial website

Implemented the approved **Architectural Monograph — Seamless Warm-Paper Stage** editorial website around the existing procedural 3D villa without altering `VillaBlockout.tsx`, `VillaMaterials.ts`, or `TropicalLandscape.tsx`.

- **Design System & Typography**: Deliberate warm daylight palette (`--color-ivory: #f4f1ea`, `--color-ivory-tinted: #ede8dd`, `--color-stage: #e5ded1`, `--color-stone: #d8d0c2`, `--color-timber: #a68b70`, `--color-olive: #777d64`, `--color-olive-text: #4f5441`, `--color-ink: #171b18`). Self-hosted Latin WOFF2 subsets under `public/fonts/` with `font-display: swap` and zero runtime third-party requests: `cormorant-garamond-latin.woff2` (37,640 B), `cormorant-garamond-italic-latin.woff2` (23,660 B), and `manrope-latin.woff2` (24,532 B) — **85,832 B (~83.82 kB)** total font transfer, accompanied by official upstream SIL OFL 1.1 notices (`OFL-Cormorant-Garamond.txt`, `OFL-Manrope.txt`).
- **Editorial Structure**: Semantic single-page layout (`src/App.tsx`, `src/content/editorial.ts`, `src/style.css`) with skip link, opaque sticky navigation (`Pavilion`, `Concept`, `Materials`, `Specs`), asymmetric hero, full-bleed seamless `#e5ded1` architectural stage, 3-principle concept narrative, 4-surface materiality ledger, 10-row conceptual specification ledger matching `VillaBlockout.tsx` dimensions, and concise colophon.
- **Interaction Modes & Camera Framing**: Antigravity introduced Browse and Explore modes and accessible camera controls. `SceneController` widens vertical FOV below aspect 1.2, up to 54°, while preserving the 37° desktop framing and default camera pose. See TERRA-005C above for the touch policy and completed verification.
- **Verification & Metrics**: `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check` passed. Production JS is `1,198.24 kB` minified / `333.00 kB` gzip (+3.80 kB gzip vs TERRA-004); production CSS is `12.43 kB` minified / `3.05 kB` gzip. Browser visual QA verified desktop (`1440 × 900`, `1024 × 768`), tablet (`768 × 1024`), and mobile (`390 × 844`, `320 × 568`): zero console errors, zero external network requests, zero horizontal overflow, single persistent `<canvas>`, unobstructed Browse Mode wheel scroll, Explore Mode orbit/zoom/reset/Escape, single-row mobile nav, and unclipped framing. Draw calls/triangles were unchanged in source (3D scene files untouched; runtime `renderer.info` counters and `WEBGL_lose_context` / `getContext` fault injection were not re-measured because the in-app webview browser sandbox does not expose `page.evaluate` or `page.addInitScript`).
- **TERRA-006 Considerations**: The single persistent `<Canvas>` remains in normal document flow with `OrbitControls` as the sole camera owner. Semantic section IDs (`#pavilion`, `#scene-stage`, `#concept`, `#materials`, `#specifications`) and the `SceneMode` (`browse` | `explore`) boundary are ready for TERRA-006 GSAP intro/scroll choreography and explicit camera ownership handoff with reduced-motion instant cuts.

## TERRA-004 · Material, lighting, and environment

The villa retains the TERRA-003 footprint, roof dimensions, and default camera. Shared nonmetallic standard materials distinguish concrete, teak, limestone, lightly tinted glass, and separate coping, basin, and water. Recessed roof edges, terrace joints, and instanced window frames clarify the assembly. The 10 × 3.5 m pool keeps its 0.32 m recess, with its static surface lowered to Y=-0.19 m.

Three palms, 14 low shrubs, and 10 grass tufts sit in the existing beds. Four instanced meshes reuse trunk, frond, shrub, and blade geometry. Daylight combines a warm directional light from `[-19, 30, 15]` at intensity 2 with hemisphere fill at 1.45. The single 1536 × 1536 PCF shadow map retains its 36 × 36 coverage with radius 2.6. Demand rendering, DPR bounds, and OrbitControls are unchanged.

| Metric | TERRA-003 | TERRA-004 |
| --- | ---: | ---: |
| Draw calls per rendered frame, including shadow work | 95 | 80 |
| Triangles per rendered frame, including shadow work | 1,438 | 8,984 |
| Renderer geometries / textures | 59 / 3 | 56 / 3 |
| Production JS, minified / gzip | 1,181.69 / 327.27 kB | 1,186.44 / 329.20 kB |
| Interaction render-start interval, median / p95 | 5.5 / 6.0 ms | 5.6 / 5.8 ms |
| CPU time in renderer call, median / p95 | 0.6 / 1.4 ms | 0.6 / 1.1 ms |

Measured with Three.js `renderer.info` reset once per render (including the shadow pass), and CPU timestamps on matched pointer drags and damping frames. The in-app Chromium browser used Windows, ANGLE D3D11 with an RTX 4060, and a 1152 × 920 viewport at DPR 1. Timing samples describe this session and do not measure GPU time or device FPS. The profiled scene loaded no external resources. Temporary profiling code was removed.

Type checking, lint, build, and diff checks passed. Browser verification covered default, alternate, and close views, orbit, zoom, keyboard reset, 390 and 320 px simulations, and both WebGL initialization and live context-loss fallback. Physical mobile touch was not tested. The surfaces and planting remain deliberately stylized. The loader type workaround, chunk size warning, and `THREE.Clock` warning remain.

## TERRA-003 · Architectural blockout

The procedural model replaces the test box and sphere. See [Architecture](ARCHITECTURE.md) for the hierarchy and axes. The 24 × 18 m site is 0.4 m thick. The 16 × 8 m villa sits on a 0.25 m slab with 3.2 m clear height, a 0.3 m roof slab, and 1 m overhangs. The 16 × 3 m terrace meets a 10 × 3.5 m pool. The pool recess is 0.32 m within the site platform, with a static surface at Y=-0.15 m. This is visual massing thickness. The model has front and side glazing, a rear clerestory, and 13 instanced timber slats.

The 37° perspective camera starts at `[23, 18, 28]` and targets `[0, 0.9, 0]`. Orbit distance is 18–62 m with the previous polar limits and damping. The 1536 × 1536 directional shadow map spans 36 × 36 light-space units. Demand rendering and DPR 1–1.5 remain in place.

Type checking, lint, production build, and Git diff checks passed. One canvas rendered in the in-app browser. Default and alternate orbit views showed the architecture and shadows without obvious geometry defects. Drag, wheel zoom, keyboard reset, and simulated 390 px and 320 px layouts passed. Both denied WebGL 2 initialization and live context loss through `WEBGL_lose_context` showed the fallback and disabled reset. The preview was stopped. Physical touch and GPU profiling were not measured.

The existing `skipLibCheck` workaround and `THREE.Clock` warning remain. Vite reported a 1,181.69 kB minified JS chunk (327.27 kB gzip) and the existing size warning. Glass, water, landscape zones, and the empty interior are schematic.

## TERRA-002 · 3D foundation

The semantic shell in `src/main.tsx` hosts `SceneViewport.tsx`. One responsive Canvas renders a platform, box, and sphere with standard materials and a shadow casting directional light. The perspective camera starts at `[6, 4.5, 7]` and orbits `[0, 0.55, 0]`. Controls use damping and bounded orbit and zoom, with panning disabled. The DOM reset button restores the saved pose and target. Rendering is on demand, DPR is bounded to 1–1.5, and the shadow map is 1024 × 1024.

Type checking, lint, production build, and Git diff checks passed. The in-app desktop browser verified scene visibility, shadows, drag orbit, wheel zoom, keyboard reset, and responsive layout at 1152 px and a simulated 390 px. A temporary local page denied WebGL 2 context creation and verified the fallback status and disabled reset. The preview was stopped. Physical touch, runtime context-loss simulation, and GPU profiling were not run. The DOM describes the scene and provides keyboard reset. Orbit and zoom use pointer input.

The dependency versions and lockfile are unchanged. `skipLibCheck` works around incompatible transitive SVG and TGA loader declarations while retaining strict application checks. Healthy browser logs showed a dependency warning for `THREE.Clock`. The production JS chunk was 1,176.11 kB minified and 325.61 kB gzip per Vite. Review bundle size and measure device performance as the scene grows.

## TERRA-001 · Project initialization

The repository root contains a private Vite, React, and TypeScript app with a neutral TERRA placeholder, plain CSS, ESLint, and one npm lockfile. See the [architecture](ARCHITECTURE.md) for the planned scene boundaries.

Verified on Windows build 26300 with PowerShell 7.6.9, Node.js 26.13.1 LTS (Lithium), and npm 11.20.0. The project targets Node.js 26 and npm 11. The manifest and lockfile record the authoritative versions.

- Runtime: React and React DOM 19.3.1, Three.js 0.187.0, React Three Fiber 9.8.2, Drei 10.7.9, and GSAP 3.15.1.
- Build and lint: Vite 7.3.8, React plugin 5.2.0, TypeScript 5.9.3, ESLint 10.15.0, `@eslint/js` 10.0.1, and `typescript-eslint` 8.74.0.
- Types: Node 26.6.6, React and React DOM 19.3.0, and Three.js 0.187.0.

Strict engine and peer installation, the full npm tree check, type checking, ESLint, and the production build passed. A localhost preview served the production HTML, JavaScript, and CSS, and the bundle contained the expected placeholder copy. The preview shut down after the check. No browser rendering or WebGL was tested.

Fiber and Drei bring in Zustand transitively. TERRA has no direct dependency on it. npm flagged the esbuild postinstall as uncovered by its script allowlist. The build passed on this host. Verify a clean install on the eventual CI or deployment runner and confirm Node 26 support there if the platform builds from source.

## Status

TERRA MVP is complete and deployed at `https://terra-project-six.vercel.app`. Post-MVP features (GLB/glTF replacement, interior walkthroughs, alternate lighting) remain deferred per `docs/PROJECT_BRIEF.md`.
