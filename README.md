# TERRA

Where architecture meets nature.

TERRA is a portfolio and educational project exploring a tropical modern villa through an editorial architectural monograph and an interactive 3D diorama.

## Local development

Use Node.js 26 LTS and npm 11. Run `npm ci`, then `npm run dev -- --host localhost`.

On wider screens, scroll through the monograph to change the camera composition. Compact screens and reduced-motion settings keep a static establishing view. Select **Explore 3D** to orbit or zoom. **Reset view** restores the shot where you entered Explore. Press **Escape** or select **Done exploring** to return to the current story shot. The editorial content stays available when WebGL 2 is unavailable.

Run `npm run typecheck`, `npm run lint`, and `npm run build` before handing off changes. Vite writes production assets to `dist/`.

- [Agent instructions](AGENTS.md)
- [Project brief](docs/PROJECT_BRIEF.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Handoff](docs/HANDOFF.md)
