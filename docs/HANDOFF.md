# Handoff

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

## Next task

TERRA-005 introduces the responsive editorial website around the existing scene. Start after explicit approval.
