# Architecture

`src/main.tsx` mounts `src/App.tsx` inside React `StrictMode`. `src/App.tsx` owns the semantic single-page architectural monograph (`header`, `nav`, skip-link, hero, integrated stage wrapper, concept narrative, materiality ledger, conceptual specifications, and closing colophon) backed by typed conceptual copy in `src/content/editorial.ts` and light-only monograph tokens in `src/style.css`. Self-hosted Latin WOFF2 subsets for Cormorant Garamond and Manrope live in `public/fonts/` alongside their SIL OFL 1.1 license notices.

`src/SceneViewport.tsx` owns one persistent responsive `<Canvas>` in normal document flow, scene lighting, `OrbitControls`, Browse/Explore modes, and WebGL fallbacks. The Canvas renders on demand with DPR bounded to 1–1.5. The stage owns the touch policy. Its Canvas event target inherits `pan-y` in Browse Mode and `none` in Explore Mode, overriding the inline value written by OrbitControls. OrbitControls is the sole camera owner and is enabled only in Explore Mode.

Entering Explore focuses the first camera button. Escape and Done exploring return focus to the stage entry button. Programmatic camera updates invalidate the demand render loop. `SceneController` adapts vertical FOV below aspect 1.2. Initialization failure and live context loss show a stage fallback and disable both entry buttons while editorial navigation stays available.

`src/VillaBlockout.tsx` is the replaceable model. Its root contains named Site, Foundation, Walls, Columns, Roof, Glazing, Timber screening, Terrace, and Pool groups. X spans the long façade, +Y is up, and +Z faces the terrace and pool. One world unit is approximately one meter. The site surface is Y=0 and the origin is at its center. Wall segments leave physical openings for the glazing. The upper site extrusion has a rectangular cutout above a continuous base so the pool reads as recessed.

`src/VillaMaterials.ts` owns the shared standard materials for the model and disposes them with it. `src/TropicalLandscape.tsx` populates the existing beds using fixed placement and four instanced meshes for trunks, fronds, shrubs, and grass. The scene uses warm directional daylight and hemisphere fill with one shadow map. Glazing is a single translucent surface per pane, and the pool uses an opaque, static water surface.

## Planned experience

- **Interface** — Semantic React DOM owns editorial content, navigation, controls, and fallback. One persistent React Three Fiber canvas renders the architectural scene alongside it.
- **Scene** — The environment owns terrain, lighting, surroundings, and shared rendering settings. The villa supplies geometry and materials through a replaceable scene component, starting with procedural geometry and moving to an optimized GLB/glTF asset later.
- **Camera** — One controller owns pose and transitions. Intro, scroll, and orbit modes transfer ownership explicitly so two systems never write the camera at once. GSAP drives intro and scroll progress, with React cleanup and reduced motion accounted for.
- **Rendering** — Update framing and rendering quality for viewport and device capability. Bound pixel ratio and shadow cost, then validate quality tiers on representative devices.
- **Fallback** — If WebGL cannot initialize or the context is lost, keep the DOM usable and provide an architectural fallback within the page.
