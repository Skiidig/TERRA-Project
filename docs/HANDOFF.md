# Handoff

## TERRA-001 · Project initialization

The repository root contains a private Vite, React, and TypeScript app with a neutral TERRA placeholder, plain CSS, ESLint, and one npm lockfile. See the [architecture](ARCHITECTURE.md) for the planned scene boundaries.

Verified on Windows build 26300 with PowerShell 7.6.9, Node.js 26.13.1 LTS (Lithium), and npm 11.20.0. The project targets Node.js 26 and npm 11. The manifest and lockfile record the authoritative versions.

- Runtime: React and React DOM 19.3.1, Three.js 0.187.0, React Three Fiber 9.8.2, Drei 10.7.9, and GSAP 3.15.1.
- Build and lint: Vite 7.3.8, React plugin 5.2.0, TypeScript 5.9.3, ESLint 10.15.0, `@eslint/js` 10.0.1, and `typescript-eslint` 8.74.0.
- Types: Node 26.6.6, React and React DOM 19.3.0, and Three.js 0.187.0.

Strict engine and peer installation, the full npm tree check, type checking, ESLint, and the production build passed. A localhost preview served the production HTML, JavaScript, and CSS, and the bundle contained the expected placeholder copy. The preview shut down after the check. No browser rendering or WebGL was tested.

Fiber and Drei bring in Zustand transitively. TERRA has no direct dependency on it. npm flagged the esbuild postinstall as uncovered by its script allowlist. The build passed on this host. Verify a clean install on the eventual CI or deployment runner and confirm Node 26 support there if the platform builds from source.

## Next task

TERRA-002 adds the persistent canvas, a simple test scene, camera and resize behavior, and a WebGL fallback. Confirm the initial camera interaction and target devices for later performance checks. Start after explicit approval.
