# Architecture

`src/main.tsx` owns the semantic shell. `src/SceneViewport.tsx` owns one responsive Canvas, the primitive test scene, OrbitControls, and the fallback. The Canvas renders on demand, with Drei invalidating on camera changes. OrbitControls owns the camera and saves its initial position and target for the DOM reset button. WebGL initialization errors and context loss replace the viewport with a status message and leave the shell intact.

## Planned experience

- **Interface** — Semantic React DOM owns editorial content, navigation, controls, and fallback. One persistent React Three Fiber canvas renders the architectural scene alongside it.
- **Scene** — The environment owns terrain, lighting, surroundings, and shared rendering settings. The villa supplies geometry and materials through a replaceable scene component, starting with procedural geometry and moving to an optimized GLB/glTF asset later.
- **Camera** — One controller owns pose and transitions. Intro, scroll, and orbit modes transfer ownership explicitly so two systems never write the camera at once. GSAP drives intro and scroll progress, with React cleanup and reduced motion accounted for.
- **Rendering** — Update framing and rendering quality for viewport and device capability. Bound pixel ratio and shadow cost, then validate quality tiers on representative devices.
- **Fallback** — If WebGL cannot initialize or the context is lost, keep the DOM usable and provide an architectural fallback within the page.
