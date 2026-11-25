# Handoff

## TERRA V3 · V3-004A/B/C Hero refinement, responsive delivery & super-resolution (approved end-of-day checkpoint)

Completed and received owner approval for the **Hybrid Cinematic Experience** Hero refinement (`V3-004A` committed at `a50517e`), editorial responsive image delivery (`V3-004B`), and Hero super-resolution (`V3-004C`) on `experiment/terra-v3-cinematic`. Development is paused at this checkpoint; **V3-004D** is the next pending task (not started). Production `origin/main` (`bead7ef`), local `main` (`bfe2c91`), and the remote V3 preview branch (`origin/experiment/terra-v3-cinematic` @ `1a7359c`) remain untouched.

- **V3-004A — Monumental Editorial Hero (`a50517e`, approved)**:
  - Elevated the Hero into a full-bleed architectural opening with a tight editorial header band (`Architecture, distilled.` + italic *A quieter way to inhabit the world.* + hairline rule + full-bleed pavilion frame + architectural datum bar `16 × 8 m · 3.2 m clear height`) and coordinated GSAP entrance + desktop scroll handoff (`scale: 1.04`, `yPercent: 4.5`) while preserving `LCP` visibility (`opacity: 1` immediately), native scroll, reduced motion, and `0` Anatomy sequence requests at Hero.
- **V3-004B — High-Fidelity Responsive Editorial Delivery (approved)**:
  - Recovered all 7 pre-WebP `.jpg` originals from Git commit `f39350c` into external scratch storage (`scratch/originals/`).
  - Upgraded `spatial`, `closing`, `philosophy`, `material-concrete`, and `material-timber` from original `.jpg` masters with restrained selective micro-sharpening (`UnsharpMask(radius=0.9, percent=55, threshold=3)`) into versioned `-v3` `<picture>` **AVIF primary + WebP fallback** pairs (`public/images/*-v3-*.avif/.webp`). Retained `material-glass.webp` (`42.00 dB`, `30.2 KiB`) unchanged after 200% inspection confirmed negligible gain.
  - Added `.media-picture { display: contents; }` in `src/style.css` so `<picture>` introduces zero layout shift. Preserved `hero.webp` untouched for `og:image` / `twitter:image` metadata and retained `hero-v3-*` files as the V3-004B rollback baseline.
- **V3-004C — Hero Super-Resolution Proof of Concept & Integration (approved, minor artificial sharpness noted)**:
  - **Portable Tool & Verification (Outside Git)**: Official Windows portable release `realesrgan-ncnn-vulkan` `v0.2.5.0` (`realesrgan-ncnn-vulkan-20220424-windows.zip`, `45,474,481 B`, SHA-256 `ABC02804E17982A3BE33675E4D471E91EA374E65B70167ABC09E31ACB412802D`) extracted to external scratch storage (`C:\Users\Skidig\.gemini\antigravity\brain\23c1df4b-1c71-43a0-a838-5437ec99dd05\scratch\realesrgan\bin\realesrgan-ncnn-vulkan.exe`). No system-wide install, PyTorch, or CUDA Toolkit added.
  - **Reproducible Pipeline**:
    1. Native `4×` photographic inference on `NVIDIA GeForce RTX 4060` via Vulkan (`10.29 s`): `realesrgan-ncnn-vulkan.exe -i hero.jpg -o hero_esrgan_x4plus_5504x3072.png -n realesrgan-x4plus -s 4 -f png -v` (input: recovered `f39350c` `hero.jpg`, `1376×768`).
    2. Pure Lanczos downsampling to `2752×1536` (**Candidate A**, zero post-sharpening; selected over Candidate B `+ UnsharpMask` and Candidate C `65/35 blend`).
    3. Responsive encoding via Pillow `13.0.0` (`speed=4` AVIF / `method=6` WebP):
       - Desktop 1x: `hero-v3c-1920w.avif` (`1920×1072`, `q=76`, `249.6 KiB`) / `.webp` (`q=86`, `292.4 KiB`).
       - Desktop HiDPI: `hero-v3c-2752w.avif` (`2752×1536`, `q=70`, `375.4 KiB`) / `.webp` (`q=82`, `442.1 KiB`).
       - Mobile Art-Directed Portrait Crop (matching `object-position: 44% 55%`, cropped `1280×1536` at `x=648..1928` → Lanczos `800×960`): `hero-v3c-mobile.avif` (`q=76`, `85.3 KiB`) / `.webp` (`q=86`, `99.8 KiB`).
  - **Preload & Markup Alignment**: Media-matched `<link rel="preload" as="image" type="image/avif">` in `index.html` paired with `<picture>` in `src/App.tsx` and `src/content/v2Content.ts`.
  - **Owner Feedback**: Approved V3-004B and V3-004C for checkpointing, noting minor artificial sharpness inherent to neural super-resolution on close inspection.
- **Measured Performance Results (Local Production Build `http://localhost:4175/`, Edge CDP, clean cache)**:
  - **Desktop `1440×900` DPR 1**: Selected `hero-v3c-1920w.avif` (`249.6 KiB`, `0.75×` supersampled), `0` duplicate Hero requests, `LCP 268 ms`, `CLS 0.0018`, `0` Anatomy sequence requests at Hero.
  - **HiDPI Desktop `1440×900` DPR 2**: Selected `hero-v3c-2752w.avif` (`375.4 KiB`, `1.046×` physical scale vs `2.093×` prior), `0` duplicate Hero requests, `LCP 136 ms`, `CLS 0.0018`, `0` Anatomy sequence requests.
  - **Mobile `390×844` DPR 2**: Selected `hero-v3c-mobile.avif` (`85.3 KiB`, `0.977×` native 1:1 Retina vs `2.10×` in V2), `0` duplicate Hero requests, `LCP 136 ms`, `CLS 0`, `0` Anatomy sequence requests.
  - **Regression & Build Checks**: Passed reduced motion (`lcp 132 ms`, `cls 0.0007`, `anatomyMode: reduced`, `0` sequence requests), Design Anatomy desktop playback, mobile nav drawer (`Escape` close), tall desktop (`1440×1400`) Hero isolation, `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check`.
- **Remaining Limitations & Next Step**:
  - Minor artificial sharpness from `realesrgan-x4plus` reconstruction remains visible at 200%+ magnification compared to native medium-format optical capture; `hero-v3c-2752w.avif` (`375.4 KiB`) slightly exceeds the `350 KiB` soft target on 2x HiDPI desktop in exchange for 4× pixel count (`136 ms` LCP).
  - Rollback assets (`hero-v3-*` and legacy V2 WebPs) are intentionally retained in `public/images/` until final cleanup; remote V3 Vercel preview remains at `1a7359c` (not pushed); physical iOS Safari and Android Chrome testing remains pending.
  - **Next Pending Task**: **V3-004D** (paused; do not start until explicitly authorized).

## TERRA V3 · V3-003B photographic refinement (ready for owner visual review)

Codex refined the saved 003A master in `D:\GitHub\terra-v3-assets\pavilion-v3\v3-003b`. The 003A package remains in place. A hash-verified checkpoint preserves its master, scripts, and configuration. The 003B package includes its editable master, draft stills, three-way comparisons, render receipts, and a verified CC0 manifest.

- Tested two Hero framings and selected the 36 mm three-quarter view. Replaced the repeated clumps with instanced photographed grass variants, added scanned concrete, oak, and upholstery surfaces, reframed the glazing and lounge, and used a cooler sky for dusk.
- Blender 5.3.0 and RTX 4060 OptiX rendered four Stage A and five Stage B proofs at 960 px wide. The reopened master passed the packed-image, pane geometry, and studio isolation checks. The inherited 41-sample assembly path retained a 6.84% minimum margin.
- The concrete, oak, and glass studies improve on 003A. V2 still has more convincing landscape layering, glazing exposure, and architectural lighting. Retain the V2 editorial imagery in production pending owner review. Rendering stopped at draft stills.
- The website remains on `experiment/terra-v3-cinematic` at `1a7359c`, local `main` at `bfe2c91`, and production `origin/main` at `bead7ef`.

## TERRA V3 · V3-003A master pavilion (ready for owner visual review)

Codex built and verified the editable master at `D:\GitHub\terra-v3-assets\pavilion-v3\terra-pavilion-v3.blend`. Its package README includes the Blender commands, validation and render logs, comparison sheets, and CC0 asset manifest. The V2 master, build script and render configuration SHA-256 hashes match their starting values.

- The coastal and neutral studio scenes share the four V2 assembly collections and their `POSE` roots. The 16 × 8 m design grid, 300 mm roof, 1 m overhang and 3.2 m clear height were verified. The reopened file passed the packed-texture, roof topology and studio isolation checks. The inherited studio move passed 41 bounding-box and framing samples with a 6.84% minimum margin.
- Stage A received one corrective pass to improve the coastal horizon, gravel and interior daylight. All six Stage B proofs were rendered after inspecting the corrected set. The nine review stills were rendered at 880 px wide in Blender 5.3.0 on RTX 4060 OptiX. They took 1.23–2.77 s each and peaked at 3,681 MiB of sampled board-wide VRAM. Studio comparisons include desktop and mobile display scales.
- V3 establishes consistent geometry across the photography and Anatomy views. The coastal foreground, oak and concrete close-ups, glass exposure and interior framing still fall short of the V2 editorial images. Owner visual review is the next step. The work stopped at draft stills.
- The website remains on `experiment/terra-v3-cinematic` at `1a7359c` with this handoff as the only repository edit. Production `origin/main` is `bead7ef`.

## TERRA V3 · V3-002 first-scroll performance & mobile polish (ready for owner review)

Branched `experiment/terra-v3-cinematic` from local `main` (`bfe2c91`, preserving the V2-006B release record, `experiment/terra-v2-design` @ `bead7ef`, and production `main` untouched). Improved cold-cache first-scroll playback in Design Anatomy, hardened decoded bitmap caps, added versioned sequence caching for Vercel, and resolved mobile visual polish issues without altering TERRA's identity, Blender assets, or sequence encodings (`0` new dependencies).

- **Decoupled Fetch/Decode Scheduler & Coarse-to-Fine Prefetch (`src/anatomy/framePlayer.ts`, `src/anatomy/DesignAnatomySection.tsx`)**:
  - Replaced the 8-frame prefetch ceiling with a **coarse-to-fine compressed-only background prefetcher** (strides `8 → 4 → 2 → 1` plus endpoint `last`) decoupled from the `ImageBitmap` decode queue (`DECODE_CONCURRENCY = 2`). Background prefetch populates only the bounded compressed `Blob` LRU (`9 MiB` desktop / `4 MiB` mobile) while idle and yields immediately during active scroll without aborting in-flight downloads (`0` duplicates, `0` aborts across all tested runs).
  - **Empirical Fetch Concurrency Selection (`2` vs `3` vs `4` vs `6` on Edge `158.0.4370.33` CDP)**: Selected `DESKTOP_FETCH_CONCURRENCY = 4` (best balance of smoothness and tail fetch latency: `p95FetchMs 215–221 ms` vs `308–313 ms` head-of-line inflation at `6` lanes) and `MOBILE_FETCH_CONCURRENCY = 2` (with `1` idle prefetch lane and monotonic intermediate bridge decoding from `compressed` so slow mobile pipes avoid frame starvation).
  - **Strict Pre-Decode Bitmap Cap Fix**: Added pre-decode eviction (`pruneDecoded(..., activeDecodes.size + 1)`) before invoking `createImageBitmap`, eliminating the transient `+1` overshoot observed in V2 (`9 → 8` desktop bitmaps, `54.93 → 48.83 MiB`; `11 → 10` mobile bitmaps, `21.05 → 19.14 MiB`).
  - **Intent-Gated Arming, Poster Priority & Data-Saver Respect**: Gated arming behind scroll intent (`scrollY >= 40` or `/#anatomy` or immediate on-screen intersection) paired with approach `IntersectionObserver`, guaranteeing `0 B` sequence/poster preload at Hero even on tall desktop (`1440×1400`). Once armed, dynamically injects `<link rel="preload" as="image" fetchpriority="high">` + `loading="eager"` for the active responsive poster and gates background sequence prefetch behind `posterReady`. Respects `navigator.connection?.saveData` / `2g` by disabling background prefetch and narrowing active lookahead (`8 → 2` frames before scrub).
- **Versioned Sequence Paths & Production Cache Headers (`public/anatomy-sequence/v2-004b/`, `src/anatomy/sequences.ts`, `vercel.json`)**:
  - Moved unmodified V2-004B sequence assets and manifest via `git mv` into `/anatomy-sequence/v2-004b/` referenced atomically by `ANATOMY_SEQUENCE_VERSION` in the Vite-hashed bundle, preventing stale manifest/frame mismatches across future deployments.
  - Added `vercel.json` applying `public, max-age=31536000, immutable` **only** to versioned `/anatomy-sequence/v2-004b/(.*)`, while keeping mutable `/images/(.*)` (`max-age=3600, stale-while-revalidate=86400`) and `/fonts/(.*)` (`max-age=86400, stale-while-revalidate=604800`) safely revalidatable. Local regex/path validation passed; live Vercel edge header confirmation awaits Preview deployment.
- **Restrained Mobile Polish (`src/App.tsx`, `src/style.css`)**:
  - Raised mobile `[data-reveal]` entry opacity floor (`0 → 0.85`, `y: 10`, `0.36 s`, `start: 'top 98%'`; desktop `0.32`, `0.54 s`) so headings stay legible during mobile scrolling (mobile `#closing` arrival opacity `0.53 → 0.97`).
  - Tightened sticky header dark-mode transition (`320 ms → 160 ms`) with `+16 px` lead offset so the header switches cleanly as `#closing` arrives.
- **Measured Before vs. After (`http://localhost:4175/`, Edge `158.0.4370.33` CDP, clean cache)**:
  - **Desktop `1440×900` · `15 Mbps / 65 ms` Controlled Cold**: pre-entry frames `8 → 36`; distinct frames `32 → 37`; `p95FrameJump` `9 → 4`; `maxFrameJump` `9 → 4`; `p95HoldMs` `172.0 → 83.6 ms`; `convergenceMs` `303.7 → 89.8 ms`; `peakLiveBitmaps` `9 → 8` (`48.83 MiB`); `0` duplicates, `0` aborts, `0` long tasks, `0` idle draws. Warm pass: `40 → 92` frames, `p95HoldMs` `172.9 → 38.9 ms`, fetches `21 → 3`.
  - **Desktop `1440×900` · `15 Mbps / 65 ms` Fast + Reversal Cold**: distinct frames `20 → 44`; `meanFrameJump` `4.52 → 2.71`; `p95FrameJump` `17 → 4`; `maxFrameJump` `36 → 4`; `p95HoldMs` `248.8 → 88.7 ms`; `maxHoldMs` `338.5 → 166.6 ms`; `convergenceMs` `606.7 → 369.5 ms`; aborts `10 → 0`. Warm pass: `27 → 82` frames, `p95HoldMs` `187.1 → 32.0 ms`.
  - **Desktop `1440×900` · Local Unthrottled Cold**: pre-entry `8 → 95`, fetches during scroll `87 → 0`, `95/95` frames (`p95HoldMs` `33.9 → 30.1 ms`), `LCP 132 ms`, `CLS 0.0407`.
  - **Mobile `390×844` · `4 Mbps / 120 ms` Controlled Cold**: `stageBlank: false`; distinct frames `17 → 21`; `p95FrameJump` `10 → 7`; `p95HoldMs` `394.4 → 251.4 ms`; `convergenceMs` `508.5 → 367.9 ms`; `peakLiveBitmaps` `11 → 10` (`19.14 MiB`); `LCP 780 → 772 ms`, `CLS 0`. Warm pass: `27 → 33` frames, `p95HoldMs` `311.6 → 144.6 ms`.
  - **Mobile `390×844` · `1.6 Mbps / 180 ms` Slow 3G**: Cold scrub parity with warm cache is physically bounded by `200 KB/s` pipe throughput (`p95HoldMs` `652.6 → 727.9 ms`, `convergenceMs` `596.2 → 442.4 ms`, Warm `10 → 14` frames); under realistic reading dwell (`~2.2 s` before scroll) `frame-000.webp` finishes `~402 ms` post-arm with `stageBlank: false`, whereas an immediate `1.0 s` sprint through all `~250 kB` of above-Anatomy images on `1.6 Mbps` still races the poster download.
  - **Regression Matrix**: Passed `1440×900`, `1024×768`, `768×1024`, `390×844`, `844×390` (coarse-pointer mobile variant verified), `320×568`, Tall Desktop `1440×1400` (`0` Hero sequence requests), direct `/#anatomy`, `prefers-reduced-motion: reduce`, `Save-Data`, keyboard `ArrowDown`/`End`, forced `503` `Reload frame` recovery, `npm run typecheck`, `npm run lint`, `npm run build` (`20.10 kB` CSS / `4.55 kB` gzip; `373.60 kB` JS / `126.41 kB` gzip), and `git diff --check`.
- **Remaining Limitations**: Live Vercel `Cache-Control` response headers require a Vercel Preview deployment check (not pushed in V3-002); physical iOS Safari and Android Chrome testing remains unverified; extreme Slow 3G (`1.6 Mbps / 180 ms`) immediate full-page sprints remain bandwidth-limited by above-Anatomy editorial images.

## TERRA V2 · V2-006B final production release (complete)

Released TERRA V2 to production via fast-forward merge of `experiment/terra-v2-design` into `main` (`7bd2201..bead7ef`), pushed `main` to `https://github.com/Skiidig/TERRA-Project.git`, verified Vercel deployment completion (`https://vercel.com/asta-0aa6/terra-project/26nJCQ6Sqm8zQ7fcosjJUaoAdmpH`), and completed live HTTPS smoke testing on `https://terra-project-six.vercel.app/`.

- **Live Production Verification (`https://terra-project-six.vercel.app/`, Edge `158.0.4370.33` CDP, clean cache)**:
  - **Cold Hero Load**: Desktop `1440×900` (`488,036 B`, `/images/hero.webp`, `0` manifest/sequence requests, `0` external requests, `0` failed requests, `0` console/page errors); emulated Mobile `390×844` (`429,400 B`, `/images/hero-800w.webp`, `0` manifest/sequence requests, `0` overflow).
  - **Design Anatomy & Interactions**: Desktop loaded only `desktop/` frames (`42` frames, `0` mobile), scrubbed forward to `anatomy-tab-plinth`, reversed cleanly to `anatomy-tab-roof`, passed click + `ArrowDown` tab navigation, and triggered dark sticky header over `#closing` and footer; emulated Mobile `390×844` loaded only `mobile/` frames (`12` frames, `0` desktop), passed mobile menu open/close, and rendered exploded state cleanly.
  - **Direct `/#anatomy` & Reduced Motion**: Fresh `/#anatomy` aligned below the `65 px` header on desktop (`scrollY: 2707`, top `64 px`) and mobile (`scrollY: 3798`, top `65 px`); `prefers-reduced-motion: reduce` fetched `0` manifest and `1` static poster with interactive tabs intact.
  - **SEO Metadata**: Verified `<title>`, `<meta name="description">`, Open Graph (`og:title`, `og:image`), `twitter:card` (`summary_large_image`), and canonical URL (`https://terra-project-six.vercel.app/`).
- **Rollback Instructions (Preserve History — No Force Push)**:
  - Preserved V1 production commit: `7bd2201` (`chore: record TERRA production URL and finalize release`).
  - Instant dashboard rollback: Promote the previous `7bd2201` deployment in the Vercel project dashboard (`asta-0aa6/terra-project`).
  - Git rollback without history rewrite: `git revert --no-commit 7bd2201..bead7ef && git commit -m "revert: restore TERRA V1 (7bd2201)" && git push origin main`.
- **Remaining Limitations**: Physical iOS Safari and Android Chrome device testing remains unverified (mobile checks were emulated); desktop full-sequence transfer remains `7.68 MiB` (deferred until approaching Design Anatomy); non-Anatomy homepage photography remains AI-generated conceptual visualization.

## TERRA V2 · V2-006A final QA, performance optimization & release preparation (ready for production release)

Checkpointed the approved V2-005 + V2-005B animation integration (`f39350c`), optimized all homepage conceptual photography into responsive WebP variants, completed SEO/social metadata and V2 documentation updates, and ran final 6-viewport lab performance and regression QA on the production build (`http://localhost:4173/`, Edge `158.0.4370.33`). `main` remains preserved untouched at `7bd2201`.

- **Homepage Image Optimization (`public/images/*.webp`)**: Replaced the 7 active homepage JPEGs (`5,208,229 B` / `4.97 MiB`) and removed unused `anatomy.jpg` (`478,369 B`) with full-res `q=86` WebPs (`704,610 B` / `0.67 MiB`, `-86.5%`) paired with responsive compact WebP `srcSet` variants (`800w` / `760w` / `540w`, `267,576 B` / `0.26 MiB`, `-94.9%`). Total `public/images/` footprint dropped from `5.42 MiB` to `0.93 MiB` (`972,186 B`, `-82.9%`) with visually indistinguishable quality verified by inspection; Anatomy WebP sequences were not recompressed.
- **Measured Lab Performance (`http://localhost:4173/`, Edge `158.0.4370.33` CDP, clean cache — lab measurements, not real-user field metrics)**:
  - **Initial cold transfer**: Desktop `1440×900` dropped from `3.74 MiB` (`3,926,524 B`) to **`472.8 kB` (`484,150 B`, `-87.7%`)**; Mobile `390×844` dropped from `2.44 MiB` (`2,563,072 B`) to **`415.4 kB` (`425,342 B`, `-83.4%`)**.
  - **Lab Web Vitals**: Desktop `LCP 316 ms`, `FCP 316 ms`, `CLS 0.0407`; Mobile `LCP 136 ms`, `FCP 136 ms`, `CLS 0`.
  - **Deferred Anatomy & Idle**: `0` manifest requests, `0` sequence frames, `0 B` sequence transfer on cold hero load; `0` idle canvas draws after settling; production bundle `dist/assets/index-DFvVAGd9.css` `20.06 kB` (`4.55 kB` gzip) and `dist/assets/index-CJWqIZU-.js` `370.50 kB` (`125.37 kB` gzip).
- **Final 6-Viewport Regression & Release Readiness**: Passed `1440×900`, `1024×768`, `768×1024`, `390×844`, `320×568`, and `844×390` mobile landscape (`0` overflow, `0` console/page errors, `0` failed requests, strict desktop/mobile sequence isolation, all 8 rendered images loaded, direct `/#anatomy` desktop/mobile alignment, `prefers-reduced-motion: reduce` static fallback, and forced `503` `Reload frame` recovery). Updated `index.html` (Open Graph, Twitter summary_large_image, canonical URL, hero WebP preload), `README.md`, `docs/ARCHITECTURE.md`, and `docs/ROADMAP.md` to clearly distinguish V1 (`main` @ `7bd2201`) from V2 (`experiment/terra-v2-design`).
- **Remaining Limitations**: Physical iOS Safari and Android Chrome device testing remains unverified; desktop full-sequence transfer remains `7.68 MiB` (deferred until approaching Anatomy); non-Anatomy homepage imagery remains AI-generated conceptual visualization (disclosed in footer and `README.md`).

## TERRA V2 · V2-005B fast-scroll motion smoothness optimization (ready for smoothness review)

Diagnosed and resolved owner-reported fast-scroll stepping (*"Ketika ngescroll cepet jadinya patah-patah, kalau scroll halus aman"*) on the production TERRA V2 homepage (`experiment/terra-v2-design`, uncommitted atop `16e0ff3`, `main` preserved at `7bd2201`). No Blender rerenders, frame-count changes, global smooth scrolling, or new dependencies were introduced.

- **Confirmed Root Cause (Measured on V2-005 Production Build)**:
  1. *Unsmoothed scroll-to-frame quantization*: Direct `ScrollTrigger.progress → frameAt` mapping jumped `10–11` desktop frames per fast mouse-wheel notch and up to `81` frames on rapid reversals (`meanFrameJump: 24.74`, `p95FrameJump: 73`, `maxHoldMs: 240.7 ms`) even with a 100% warm cache (`0` long tasks, `2` requests), skipping intermediate architectural motion.
  2. *Decoded bitmap thrashing & stale-lane scheduling*: A tight `4`-frame desktop decoded cache caused `96` `createImageBitmap` decodes for only `24` draws on warm fast-scroll reversals, while stale in-flight requests were never aborted after direction reversals.
- **Selected Smoothing & Scheduler Upgrades (`src/anatomy/DesignAnatomySection.tsx`, `src/anatomy/framePlayer.ts`)**:
  - *Local adaptive damped progress*: Separated scroll `targetProgress` from `renderedProgress` inside an on-demand `requestAnimationFrame` loop using frame-rate-independent exponential smoothing (`tau = 65 ms` slow/micro-scrub, `85 ms` direction reversal, `115 ms` fast flick), snapping exactly to `targetProgress` within `0.0012` epsilon and stopping rAF completely when settled (`0` idle draws). Resizes and deep-link `/#anatomy` loads snap immediately without catch-up sweep.
  - *Velocity-aware stride scheduler & wider bounded cache*: Kept `CONCURRENCY = 2`, added `2`-frame stride lookahead + endpoint goal prioritization during large desktop chases (`gap >= 12`), added conservative obsolete-request cancellation (aborting only opposite-direction/far-outside-span requests to avoid slow-network thrashing), added monotonic intermediate decoded fallback while exact target decodes, and expanded bounded `ImageBitmap` retention from `4 → 8` desktop (`24.41 → 48.83 MiB` peak RGBA) and `5 → 10` mobile (`9.57 → 19.14 MiB` peak RGBA).
- **Measured Before vs. After (`http://localhost:4173/`, Edge `158.0.4370.33`)**:
  - Desktop `1440×900` warm fast wheel + rapid reversals: `meanFrameJump` `24.74 → 1.77`, `p95FrameJump` `73 → 4`, `maxFrameJump` `81 → 6`, `distinctFramesShown` `15 → 85`, `p95HoldMs` `79.4 → 26.0 ms`, `maxHoldMs` `240.7 → 72.2 ms`, `0` frame requests, `0` long tasks, `0` idle draws, exact endpoint convergence (`487.3 ms` after final rapid flick).
  - Desktop `1440×900` warm slow scroll: `meanFrameJump` `1.98 → 1.00`, `maxFrameJump` `2 → 1` (`95/95` frames shown cleanly), `p95HoldMs` `50.2 → 38.8 ms`.
  - Desktop `1024×768` fast scroll + reversal: `maxFrameJump` `48 → 7`, `meanFrameJump` `17.9 → 1.96`, `p95HoldMs` `67.4 → 33.7 ms`.
  - Mobile `390×844` warm fast + reversals: `maxFrameJump` `40 → 2`, `p95FrameJump` `37 → 1`, `meanFrameJump` `12.39 → 1.03`, `p95HoldMs` `68.3 → 33.4 ms`; cold fast scroll `maxFrameJump` `6 → 1` (`47/47` frames).
  - Compact Mobile `320×568` fast scroll + reversal: `maxFrameJump` `28 → 2`, `meanFrameJump` `8.9 → 1.03`, `0` duplicate requests.
  - Regression suite verified `0` cold hero sequence requests, `0` console/page errors, `0` overflow across all 6 viewports (`1440×900`, `1024×768`, `768×1024`, `390×844`, `844×390`, `320×568`), direct `/#anatomy` landing (desktop & mobile), reduced-motion static fallback (`0` manifest, `1` poster), and passing `typecheck`, `lint`, `build` (`125.12 kB` JS gzip, `+0.92 kB` vs V2-005), and `git diff --check`.
- **Remaining Limitations**: Under `1.6 Mbps / 180 ms` cold throttling, downloading a `~40 kB` mobile frame still takes `~380 ms`, so full-runway cold flicks take several seconds to deliver the final frame while advancing monotonically through loaded frames without duplicate requests; physical iOS Safari and Android Chrome testing remains pending.

## TERRA V2 · V2-005 production animation integration & visual polish (ready for integration review)

Integrated Codex's approved V2-004B production Blender Cycles image sequences into the TERRA V2 homepage on `experiment/terra-v2-design` (base `16e0ff3`, `main` preserved at `7bd2201`, uncommitted awaiting owner review). All other approved homepage sections (Hero, Philosophy, Materiality, Spatial Experience, Closing, Footer, Navigation) were preserved intact.

- **Production Asset Integration (`public/anatomy-sequence/`)**: Copied only the verified browser-ready assets—`96` desktop WebPs (`1600 × 1000`, `8,054,676 B` / `7.68 MiB`), `48` mobile WebPs (`896 × 560`, `2,091,116 B` / `1.994 MiB`), and a lean runtime `manifest.json` (`13,783 B`)—with `0` SHA-256 or byte mismatches against `D:/GitHub/terra-v2-assets/scroll-production-v2-004b/frame-manifest.json`. Raw Blender sources, PNG masters, benchmarks, and scripts remain external.
- **Reused Player & Progressive Loading (`src/anatomy/sequences.ts`, `src/anatomy/framePlayer.ts`, `src/anatomy/DesignAnatomySection.tsx`)**: Reused Codex's bounded-memory sliding window (`4` decoded desktop bitmaps / `5` mobile, `9 MiB` / `4 MiB` compressed blob LRU, `2` concurrency lanes, direction-aware prefetch, last-valid-frame hold, zero idle draws) with `7.5%` edge fade over `#EBE7DC`, automatic 2-step retry backoff (`650 ms` / `1600 ms`) before surfacing an inline `Reload frame` recovery button, and `IntersectionObserver` (`900 px` margin) section-aware arming so initial hero loads fetch `0` manifest/sequence bytes. Removed all prototype/debug UI (slider, frame counter, sequence picker, diagnostics), replacing the placeholder caption with a hairline architectural progress track.
- **Scroll & Layer Inspector Contract**: Native CSS `position: sticky` inside a restrained runway (`1120 px` desktop, `880 px` tablet, `680 px` mobile, `560 px` compact mobile; `0 px` under reduced motion or static poster fallback) drives one GSAP `ScrollTrigger` without pinning or scroll-jacking. Scroll updates active strata (`01` → `04` at thresholds `0 / 0.28 / 0.58 / 0.85`) without stealing keyboard focus; explicit tab click or WAI-ARIA `tablist` keyboard navigation (`Arrow`/`Home`/`End`) smoothly scrolls to the target milestone (`0 / 0.32 / 0.64 / 1.00`) while holding an interruptible lock (`wheel`/`touchstart` cancels immediately) to prevent mid-scroll tab flicker.
- **Direct `/#anatomy` Navigation Bug Fixed**: Reproduced and resolved a GSAP `ScrollTrigger` `once: true` mid-init `TypeError` (`Cannot read properties of undefined (reading 'end')`) triggered when deep-linking directly to `/#anatomy` scrolled past upper sections before triggers initialized. Replaced `once: true` on page reveals with `toggleActions: 'play none none none'` plus viewport pre-checks and added a `useLayoutEffect` + `document.fonts.ready` hash alignment guard. Fresh `/#anatomy` loads now land pixel-accurately below the `65 px` header on both desktop (`scrollY: 2707`, top `64 px`) and mobile (`scrollY: 3798`, top `65 px`) with `0` errors.
- **Measured Verification (Production Build `http://localhost:4173/`, Edge `158.0.4370.33`)**:
  - `npm run typecheck`, `npm run lint`, `npm run build` (`20.06 kB` CSS / `4.55 kB` gzip; `367.08 kB` JS / `124.20 kB` gzip), and `git diff --check` all passed (`0` new dependencies).
  - **Cold hero transfer**: `0` manifest requests, `0` sequence frames, `0 B` sequence transfer on desktop (`1440×900`, `1024×768`, `768×1024`) and mobile (`390×844`).
  - **Variant isolation & cache**: Desktop loaded only `desktop/` frames (`86` unique on 16-step scrub, `7.25 MB` encoded, `0` mobile requests, `0` duplicates); mobile loaded only `mobile/` frames (`48` unique on full scrub, `2.10 MB` encoded, `0` desktop requests, `0` duplicates). Canvas outer edges sampled exact `#EBE7DC` (`rgb(235, 231, 220)`).
  - **Regression & resilience**: Passed `1440×900`, `1024×768`, `768×1024`, `390×844`, `844×390` landscape, and `320×568` (`0` overflow, `0` console/page errors, `0` failed requests, mobile menu & dark closing header verified); `prefers-reduced-motion: reduce` fetched `0` manifest and `1` static poster (`70 kB`) with interactive tabs intact; throttled `1.6 Mbps / 180 ms` + forced `503` on `frame-047.webp` held the painted canvas, surfaced `Reload frame`, and recovered cleanly on click.
  - **Remaining Limitations**: Desktop full sequence remains `7.68 MiB` (accepted trade-off vs `6 MiB` target); physical iOS Safari and Android Chrome touch/decoding remain untested.

## TERRA V2 · V2-004B production image sequence (ready for final motion review)

- The owner approved the pavilion, framing, and assembly choreography after V2-004A and asked for smoother motion. Use the **Sequence** menu at `http://127.0.0.1:4204/` to compare Production and the original 24 frames. Work remains in the Git-ignored `terra-v2-004a.local` harness and `D:/GitHub/terra-v2-assets/scroll-production-v2-004b`. Homepage integration awaits owner approval.
- Blender 5.3.0 rendered 96 transparent 1600 × 1000 Cycles PNG masters via RTX 4060 OptiX with 96 adaptive samples, OpenImageDenoise, and a studio shadow catcher. The masters total 105.48 MiB and 1,194.63 s of rendering. A resumed batch reused the three benchmark masters. Both WebP encodes took 76.87 s. The validator checked the dimensions, alpha, timing indices, naming, and SHA-256 hashes of all masters and WebPs. All 22 approved pavilion files matched preflight.
- Three sample poses showed that alpha dominated transfer. Opacity quantization produced visible shadow bands. The selected profiles preserve the architecture and filter the low-opacity studio shadow matte, with color quality 86 for desktop and 84 for mobile. The 96 desktop WebPs use 1600 × 1000 pixels and total 7.68 MiB. The 48 mobile WebPs use 896 × 560 pixels and total 1.994 MiB, derived by premultiplied linear-light Lanczos downsampling. The projected maximum roof step fell from 8.07 to 1.96 CSS px desktop and 3.46 to 1.68 mobile at the reference stage sizes. A 72-frame desktop grid projected under the 6 MiB target with an estimated 2.62 px roof step. A 36-frame mobile grid gives an estimated 2.24 px.
- Asset receipts make interrupted render and encode runs resumable. `frame-manifest.json` records progressive sampling, dimensions, bytes, and hashes. `render-measurements.json` records the render plan and timings. The benchmark, component scripts, and exact reproduction commands are in the asset directory.
- The player maps native scroll to manifest progress, with four decoded desktop bitmaps and five mobile. Two request or decode lanes prioritize the current target and prefetch along the direction of travel. The canvas holds its last valid frame through loading and offers recovery after a failed request. Reduced motion keeps the assembled poster and manual layer copy.
- Edge 158 displayed every state in both directions at 1440 × 900, 1024 × 768, 390 × 844, and 320 × 568 with slow-scrub p95 target-to-draw of 0.1–0.2 ms. Fast and rapid reversals measured p95 of 8.5–19.1 ms for Production. Peak decoded bitmap estimates were 24.41 MiB desktop and 9.57 MiB mobile. Normal runs had zero sampled blanks, duplicate requests, idle paints, and long tasks over 50 ms. Under 1.6 Mbps and 180 ms added latency, Production held the assembled image and delivered the cold last frame in 1.16 s desktop and 0.69 s mobile. A forced 503 held the prior draw and recovered using Retry. Touch emulation, 844 × 390 orientation, variant switching, reduced motion, and the tall-window endpoint passed.
- Matched desktop and emulated mobile browser recordings and detailed data are in `terra-v2-004a.local/production/evidence`. Physical phones remain untested. After the owner's motion review, measure the desktop transfer trade-off and check touch and decoding on physical iOS and Android before integration. Git remains on `experiment/terra-v2-design` at `16e0ff3` with `main` at `7bd2201`. Typecheck, lint, build, and diff checks passed.

## TERRA V2 · V2-004A reversible scroll proof (ready for user motion review)

- The separate preview runs at `http://127.0.0.1:4204/` from the Git-ignored `terra-v2-004a.local` harness. It uses native scroll, GSAP progress, four layer milestones, a keyboard-operable frame slider, loading diagnostics, and an assembled poster for reduced motion. The website entry point and Anatomy implementation were preserved.
- Rendered 24 uniformly sampled 1280 × 800 states from the approved pavilion-v2 source using the RTX 4060 via OptiX, 96 maximum adaptive samples, and OpenImageDenoise. The 24 WebPs total 2.35 MiB. Render plus encode took 211.26 s. Source PNGs, WebPs, and frame measurements are under `D:/GitHub/terra-v2-assets/scroll-proof-v2-004a`. All 22 pavilion-v2 files matched their preflight hashes.
- Tested a transparent midpoint draft before rendering the sequence. The proof uses the Cycles shadow catcher and a 5.5% edge fade over `#EBE7DC`, with sampled stage edge pixels matching the page. Checked 41 assembly positions with a 6.84% minimum native frame margin and no new cross-assembly bounding-box penetrations above 1 mm.
- Edge 158 replayed all 24 states in both directions at 1440 × 900, 1024 × 768, 390 × 844, and 320 × 568. Final checks found zero sampled blanks, duplicate frame requests, long tasks over 50 ms, and idle canvas draws. At 1.6 Mbps and 180 ms latency, a cold jump held frame 1 and reached frame 24 in about 1.30 s. The mobile viewports were emulated. Browser timings, screenshots, and the actual 3.89 s forward-and-reverse clip are in the harness's `evidence` folder.
- Visible step size in the 24-frame proof supports evaluating 48 frames at 1600 × 1000 desktop and 36 at 896 × 560 mobile after owner review. Physical phone verification and the production transfer budget remain open.

## TERRA V2 · V2-003C pavilion refinement (ready for user visual review)

- Built and verified the self-contained replacement study under `D:/GitHub/terra-v2-assets/pavilion-v2`. The v1 source and renders serve as the preserved baseline. The v2 package includes the editable Blender file, generator, render config, three 1600 × 1000 Cycles stills, and side-by-side desktop and mobile comparisons.
- The locked-camera draft left 41.3% assembled headroom. The refined rig keeps one viewing angle and eases a pan and orthographic width change from 32.25 m to 35.5 m. Upper headroom fell from 41.9% in v1 to 27.7% in v2. All 41 sampled mesh projections cleared the image boundaries by at least 6.84%.
- Refined concrete formwork, oak grain, limestone joints, and furniture silhouettes. A more directional lighting rig removes the broad glass band, and a deeper separation plus a modest relocation of the four front columns improves the assembly read. Verified all four editable collections and 18 mm glazing on reopening the source.
- The RTX 4060 rendered the assembled, intermediate, and exploded states via OptiX in 9.13 s, 9.72 s, and 9.62 s. At 826 × 516 and 354 × 221 display pixels the major layers remain legible. The studio field still reads darker than the warm stone page. A short reversible scrub proof after owner approval should check the stage-edge blend and motion pacing on physical phones.

## TERRA V2 · V2-003B pavilion look development (ready for user visual review)

- Created the original editable pavilion in `D:/GitHub/terra-v2-assets/pavilion-v1`. The Blender source opens assembled with separately movable roof, envelope, core and interior, and plinth and basin collections. The same directory holds the generator, render configuration, source notes, and review images. No third-party assets were used.
- Followed the hero’s low roofline, oak screen, glazing, and recessed water. Used the Anatomy reference for the raised layers and the skylight. The model uses a 16 × 8 m building grid and a tighter 22.5 × 16.34 m studio terrace.
- Inspected one draft and two focused refinement passes. Rendered the three 1600 × 1000 previews in Cycles on the RTX 4060 via OptiX. Assembled, intermediate, and exploded renders took 9.03 s, 9.51 s, and 10.03 s. Reopened the Blender source and verified the four assembly roots, lack of external file dependencies, and preview dimensions.
- Review the broad reflection in the exploded glazing, the subtle concrete formwork at page scale, and the assembled crop on the fixed camera. Owner visual approval is the next gate before animation production or website integration.

## TERRA V2 · V2-003A signature animation feasibility (asset acquisition required)

- Audited the approved homepage at `16e0ff3` on `experiment/terra-v2-design`. The Anatomy stage is a static JPEG with four keyboard-operable tabs. Production-build measurements in Edge 158 at `1440 × 900` DPR 1 and `390 × 844` DPR 2 found zero canvas elements, horizontal overflow, page errors, and failed requests. The stage measured `826 × 516` and `354 × 221` CSS px. A fresh mobile `/#anatomy` load retained the hash but stayed at the top in the headless run. In-page Anatomy navigation worked in the interactive browser.
- Verified headless Blender 5.3.0, glTF import/export operators, and RTX 4060 detection through Cycles OptiX and CUDA. Blender exposes FFmpeg output. Standalone FFmpeg and ffprobe were unavailable on PATH. No source pavilion model was found in the TERRA locations checked. The legacy procedural scene is a proportion reference.
- Prefer a purpose-built pavilion keyed to the approved visual references and organized as roof, glazing and oak screen, structural core and furnished interior, and plinth and basin. RenderRite’s CC BY 4.0 listing shows an elongated pavilion with darker cladding and a freestanding pool. Source geometry and separability await authorized acquisition.
- Start with a background-matched Cycles frame sequence and a small decoded-frame cache. Native GSAP scroll progress should drive the visual and existing layer copy. Preserve manual tab selection and a static reduced-motion presentation.
- Once an editable, rights-cleared source is available, render assembled, intermediate, and exploded stills for visual review, then test one short reversible transition in an isolated development-only view. This feasibility task added no experiment or production assets. Baseline captures and measurements are in the ignored `terra-v2-003a.local/` folder.

## TERRA V2 · Homepage Visual Prototype & Motion Refinement (approved local checkpoint)

Established the new **TERRA V2** creative direction on isolated branch `experiment/terra-v2-design` (leaving production V1 `main` untouched at `7bd2201`). Website design now leads the experience, inspired by Apple product precision, Norm Architects materiality, and Bang & Olufsen restraint, with 3D reserved as a selective future enhancement rather than the foundation.

- **Approved Homepage Architecture**: Implemented a 6-section minimalist editorial homepage (`index.html`, `src/App.tsx`, `src/style.css`, `src/content/v2Content.ts`) on the existing Vite + React 19 + TypeScript + GSAP 3 + plain CSS stack (`0` new dependencies, `0` external runtime font requests):
  - **Hero** (*"Architecture, distilled."* / *"A quieter way to inhabit the world."*): Tight-tracked `Manrope` display typography paired with selective `Cormorant Garamond` italic accents and full pavilion + caption framed above the fold across `1440×900`, `1024×768`, `390×844`, and `320×568`.
  - **Philosophy** (*"Less form. More feeling."*): Asymmetric `#FFFFFF` editorial split with `6 / 5` overhang photography and hairline proportion metrics (`16 × 8 m`, `1.0 m`, `3.2 m`).
  - **Materiality** (*"Nothing unnecessary."*): Staggered 3-column `3:4` close-up triptych (**Board-Formed Concrete**, **Rift-Cut Natural Oak**, **Low-Iron Architectural Glass**) with `0px` framing and subtle hover scale.
  - **Design Anatomy** (*"Every layer. A purpose."*): Seamless `#EBE7DC` stone showcase with edge-feathered exploded 4-layer axonometric model paired side-by-side (`8fr / 4fr`) with a WAI-ARIA keyboard-navigable (`Arrow`/`Home`/`End`) layer inspector (`01 Cantilevered Roof Plane` → `04 Grounded Plinth & Basin`).
  - **Spatial Experience** (*"Space to breathe."*): Full-bleed interior photography with subtle desktop-only scroll parallax and two-column daylight/threshold notes.
  - **Closing & Footer** (*"Designed to feel different."*): `#171A18` dusk band with adaptive dark sticky header transition, balanced 2-column mobile footer navigation, and explicit prototype imagery disclosure.
- **Motion Language**: Coherent GSAP 3 + `ScrollTrigger` choreography (`power3.out` clip-path image reveals, hero entrance + desktop scroll-linked scale handoff, subtle spatial parallax), strictly preserving native scroll, full `prefers-reduced-motion: reduce` instant-final-state support, and `gsap.context()` cleanup.
- **Prototype Imagery Status**: All 8 images under `public/images/` (`hero.jpg`, `philosophy.jpg`, `material-concrete.jpg`, `material-timber.jpg`, `material-glass.jpg`, `anatomy.jpg`, `spatial.jpg`, `closing.jpg`) are AI-generated conceptual architectural visualizations created for V2 visual review and do not represent a built project.
- **Pending Next Phases (awaiting separate authorization)**: Final architectural photography/renders, signature interactive Design Anatomy exploded-layer animation (replacing the static axonometric placeholder), and eventual merge/deployment decisions.
- **Verification**: `npm run typecheck`, `npm run lint`, `npm run build` (`17.58 kB` CSS / `4.11 kB` gzip; `357.24 kB` JS / `120.79 kB` gzip), and `git diff --check` passed; live browser QA verified `1440×900`, `1024×768`, `390×844`, and `320×568` (`0` console errors, `0` failed requests, `0` horizontal overflow, working anatomy tabs and mobile menu drawer).

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
