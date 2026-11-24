# TERRA

Where architecture meets nature.

TERRA is a portfolio and educational project exploring a tropical modern villa through an editorial architectural monograph and an interactive 3D diorama.

## Local development

Use Node.js 26 LTS and npm 11. Run `npm ci`, then `npm run dev -- --host localhost`.

Browse Mode is active by default so page scrolling remains unobstructed over the architectural stage. Select **Explore 3D** to orbit, zoom, use the accessible rotate/zoom/reset controls, or press **Escape** / **Done exploring** to return to Browse Mode. The 3D diorama requires WebGL 2; all editorial content remains readable when WebGL is unavailable.

Run `npm run typecheck`, `npm run lint`, and `npm run build` before handing off changes. Vite writes production assets to `dist/`.

- [Agent instructions](AGENTS.md)
- [Project brief](docs/PROJECT_BRIEF.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Handoff](docs/HANDOFF.md)
