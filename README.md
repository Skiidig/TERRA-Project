# TERRA

Where architecture meets nature.

TERRA is a portfolio and educational project exploring a tropical modern villa through editorial content and an interactive 3D diorama. The current application contains a primitive 3D test scene.

## Local development

Use Node.js 26 LTS and npm 11. Run `npm ci`, then `npm run dev -- --host localhost`.

Drag over the scene to orbit, scroll or pinch to zoom, and use **Reset view** to restore the starting composition. The 3D preview requires WebGL 2.

Run `npm run typecheck`, `npm run lint`, and `npm run build` before handing off changes. Vite writes production assets to `dist/`.

- [Agent instructions](AGENTS.md)
- [Project brief](docs/PROJECT_BRIEF.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Handoff](docs/HANDOFF.md)
