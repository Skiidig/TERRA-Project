import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { anatomyContent } from '../content/v2Content'
import { createFramePlayer } from './framePlayer'
import type { FramePlayer, FramePlayerState } from './framePlayer'
import {
  COMPACT_VIEW,
  frameAt,
  getPosterDimensions,
  getPosterUrl,
  loadAnatomyManifest,
} from './sequences'
import type { AnatomySequence } from './sequences'

gsap.registerPlugin(ScrollTrigger)

/**
 * Scroll progress targets when a user explicitly selects a layer tab.
 * Balanced across the full separation arc: assembled (0) -> exploded (1).
 */
const LAYER_JUMP_PROGRESS = [0, 0.32, 0.64, 1] as const

/**
 * Thresholds for synchronizing active explanatory copy with displayed frame progress.
 * Gives every architectural stratum generous reading time across the scroll runway.
 */
const LAYER_ACTIVATION_THRESHOLDS = [0, 0.28, 0.58, 0.85] as const

/**
 * Adaptive exponential smoothing time constants (seconds).
 * - Fine / slow scrub: tight 65 ms response (zero perceptible lag).
 * - Direction reversal: snappy 85 ms turn-around.
 * - Fast mouse-wheel / flick scrub: 115 ms smoothing bridges discrete scroll jumps
 *   into continuous intermediate architectural frames and converges cleanly.
 */
const SMOOTH_TAU_SLOW_S = 0.065
const SMOOTH_TAU_REVERSE_S = 0.085
const SMOOTH_TAU_FAST_S = 0.115
const CONVERGENCE_EPSILON = 0.0012
const MAX_FRAME_DT_S = 0.05

function layerIndexForProgress(progress: number): number {
  let active = 0
  for (let i = 1; i < LAYER_ACTIVATION_THRESHOLDS.length; i += 1) {
    if (progress >= LAYER_ACTIVATION_THRESHOLDS[i]) active = i
  }
  return active
}

type AnatomyMode = 'idle' | 'interactive' | 'reduced' | 'poster'

export function DesignAnatomySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const runwayRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const posterRef = useRef<HTMLImageElement>(null)
  const progressBarRef = useRef<HTMLSpanElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const [compact, setCompact] = useState(() => window.matchMedia(COMPACT_VIEW).matches)
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [armed, setArmed] = useState(() => window.location.hash === '#anatomy')
  const [sequence, setSequence] = useState<AnatomySequence | null>(null)
  const [mode, setMode] = useState<AnatomyMode>(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'idle',
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [targetFailed, setTargetFailed] = useState(false)

  const activeIndexRef = useRef(0)
  const scrollProgressRef = useRef(0)
  const renderedProgressRef = useRef(0)
  const explicitLockUntilRef = useRef(0)
  const jumpToLayerRef = useRef<((layerIdx: number) => void) | undefined>(undefined)
  const retryFrameRef = useRef<(() => void) | undefined>(undefined)

  function setLayerSafe(nextIndex: number) {
    if (activeIndexRef.current === nextIndex) return
    activeIndexRef.current = nextIndex
    setActiveIndex(nextIndex)
  }

  // Track responsive sequence breakpoint & reduced-motion preference dynamically
  useEffect(() => {
    const compactQuery = window.matchMedia(COMPACT_VIEW)
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onCompactChange = () => setCompact(compactQuery.matches)
    const onMotionChange = () => setReducedMotion(motionQuery.matches)

    compactQuery.addEventListener('change', onCompactChange)
    motionQuery.addEventListener('change', onMotionChange)
    return () => {
      compactQuery.removeEventListener('change', onCompactChange)
      motionQuery.removeEventListener('change', onMotionChange)
    }
  }, [])

  // Intent-gated progressive arming: guarantees zero sequence/poster transfer during initial Hero load
  // (even on tall desktop viewports), while arming early once the visitor scrolls past the Hero or
  // navigates directly to #anatomy so the responsive poster and coarse frames arrive before entry.
  useEffect(() => {
    if (armed) return
    const section = sectionRef.current
    if (!section) return

    let engaged = window.scrollY >= 40 || window.location.hash === '#anatomy'
    let nearSection = false

    const tryArm = () => {
      if (engaged && nearSection) {
        setArmed(true)
      }
    }

    const onScrollOrHash = () => {
      if (window.scrollY >= 40 || window.location.hash === '#anatomy') {
        engaged = true
        tryArm()
      }
    }

    window.addEventListener('scroll', onScrollOrHash, { passive: true })
    window.addEventListener('hashchange', onScrollOrHash)

    if (typeof IntersectionObserver !== 'function') {
      nearSection = true
      tryArm()
      return () => {
        window.removeEventListener('scroll', onScrollOrHash)
        window.removeEventListener('hashchange', onScrollOrHash)
      }
    }

    // Tight viewport observer: if Anatomy is genuinely on-screen immediately, arm without waiting
    const visibleObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          engaged = true
          nearSection = true
          setArmed(true)
        }
      },
      { rootMargin: '120px 0px 120px 0px' },
    )
    visibleObserver.observe(section)

    // Wide approach observer: pairs strictly with scroll intent (scrollY >= 40) so initial Hero
    // load always transfers 0 B even on tall desktop viewports, while arming early during
    // Philosophy/Materiality reading so the responsive poster arrives well before #anatomy enters.
    const approachMargin = compact ? '4200px 0px 900px 0px' : '2400px 0px 900px 0px'
    const approachObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          nearSection = true
          tryArm()
        }
      },
      { rootMargin: approachMargin },
    )
    approachObserver.observe(section)

    return () => {
      window.removeEventListener('scroll', onScrollOrHash)
      window.removeEventListener('hashchange', onScrollOrHash)
      visibleObserver.disconnect()
      approachObserver.disconnect()
    }
  }, [armed, compact])

  // Prioritize the responsive poster as soon as Anatomy arms (post-Hero intent only),
  // preventing blank mobile stages on slower connections without impacting initial Hero LCP.
  useEffect(() => {
    if (!armed) return
    const href = getPosterUrl(compact)
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.type = 'image/webp'
    link.href = href
    link.setAttribute('fetchpriority', 'high')
    document.head.appendChild(link)
    return () => {
      link.remove()
    }
  }, [armed, compact])

  // Load only the manifest once armed and NOT in reduced-motion mode
  useEffect(() => {
    if (reducedMotion) {
      setMode('reduced')
      setTargetFailed(false)
      return
    }
    if (!armed) return

    let cancelled = false
    void loadAnatomyManifest()
      .then((manifest) => {
        if (cancelled) return
        setSequence(compact ? manifest.variants.mobile : manifest.variants.desktop)
      })
      .catch(() => {
        if (cancelled) return
        setSequence(null)
        setMode('poster')
      })

    return () => {
      cancelled = true
    }
  }, [armed, compact, reducedMotion])

  // Wire up bounded frame player + single GSAP ScrollTrigger + on-demand damped rAF controller
  useLayoutEffect(() => {
    const runway = runwayRef.current
    const sticky = stickyRef.current
    const canvas = canvasRef.current
    const poster = posterRef.current
    if (!runway || !sticky || !canvas || !poster) return

    const syncGeometry = () => {
      const header = document.querySelector<HTMLElement>('.site-header')
      const headerHeight = header?.offsetHeight ?? 64
      runway.style.setProperty('--anatomy-header-offset', `${headerHeight}px`)
      runway.style.setProperty('--anatomy-hold-height', `${sticky.offsetHeight}px`)
    }

    syncGeometry()
    const resizeObserver = new ResizeObserver(syncGeometry)
    resizeObserver.observe(sticky)
    const headerEl = document.querySelector<HTMLElement>('.site-header')
    if (headerEl) resizeObserver.observe(headerEl)

    if (reducedMotion || !sequence) {
      canvas.hidden = true
      poster.classList.remove('is-under-canvas')
      jumpToLayerRef.current = undefined
      retryFrameRef.current = undefined
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = 'scaleX(0)'
      }
      if (reducedMotion) {
        setMode('reduced')
        scrollProgressRef.current = 0
        renderedProgressRef.current = 0
      }
      return () => {
        resizeObserver.disconnect()
      }
    }

    let player: FramePlayer | null = null
    let viewportWidth = window.innerWidth
    let viewportHeight = window.innerHeight
    let retainedProgress: number | undefined
    let restoring = true
    let rafId = 0
    let lastTickMs = 0
    let lastMoveDir = 0

    const syncProgressBar = (progress: number) => {
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${Math.max(0.02, Math.min(1, progress))})`
      }
    }

    const stopLoop = () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId)
        rafId = 0
      }
    }

    const snapToProgress = (progress: number) => {
      stopLoop()
      const clamped = Math.max(0, Math.min(1, progress))
      scrollProgressRef.current = clamped
      renderedProgressRef.current = clamped
      syncProgressBar(clamped)
      const frame = frameAt(sequence, clamped)
      player?.request(frame, frame)
    }

    const tick = (now: number) => {
      rafId = 0
      const dt = lastTickMs > 0 ? Math.min(MAX_FRAME_DT_S, Math.max(0.001, (now - lastTickMs) / 1000)) : 1 / 60
      lastTickMs = now

      const targetP = scrollProgressRef.current
      const currentP = renderedProgressRef.current
      const delta = targetP - currentP
      const absDelta = Math.abs(delta)

      if (absDelta <= CONVERGENCE_EPSILON) {
        renderedProgressRef.current = targetP
        lastMoveDir = 0
        syncProgressBar(targetP)
        const exactFrame = frameAt(sequence, targetP)
        player?.request(exactFrame, exactFrame)
        return
      }

      const dir = Math.sign(delta)
      const reversing = lastMoveDir !== 0 && dir !== lastMoveDir
      const tau = reversing
        ? SMOOTH_TAU_REVERSE_S
        : absDelta < 0.018
          ? SMOOTH_TAU_SLOW_S
          : SMOOTH_TAU_FAST_S
      lastMoveDir = dir

      const alpha = 1 - Math.exp(-dt / tau)
      const nextP = Math.max(0, Math.min(1, currentP + delta * alpha))
      renderedProgressRef.current = nextP

      syncProgressBar(nextP)
      player?.request(frameAt(sequence, nextP), frameAt(sequence, targetP))

      if (Math.abs(targetP - nextP) > CONVERGENCE_EPSILON) {
        rafId = window.requestAnimationFrame(tick)
      } else {
        renderedProgressRef.current = targetP
        lastMoveDir = 0
        syncProgressBar(targetP)
        const exactFrame = frameAt(sequence, targetP)
        player?.request(exactFrame, exactFrame)
      }
    }

    const ensureLoopRunning = () => {
      if (rafId !== 0) return
      lastTickMs = performance.now()
      rafId = window.requestAnimationFrame(tick)
    }

    const onPlayerState = (state: FramePlayerState) => {
      setTargetFailed(state.targetFailed)
      if (state.shown >= 0 && performance.now() >= explicitLockUntilRef.current) {
        const shownProgress = sequence.frames[state.shown]?.progress ?? 0
        setLayerSafe(layerIndexForProgress(shownProgress))
      }
    }

    const startingProgress = scrollProgressRef.current
    renderedProgressRef.current = startingProgress
    player = createFramePlayer(
      canvas,
      poster,
      sequence,
      frameAt(sequence, startingProgress),
      onPlayerState,
    )

    if (!player) {
      canvas.hidden = true
      poster.classList.remove('is-under-canvas')
      setMode('poster')
      return () => {
        resizeObserver.disconnect()
      }
    }

    setMode('interactive')

    const cancelExplicitLock = () => {
      explicitLockUntilRef.current = 0
    }
    window.addEventListener('wheel', cancelExplicitLock, { passive: true })
    window.addEventListener('touchstart', cancelExplicitLock, { passive: true })

    const updateFromScroll = (self: ScrollTrigger, immediate = false) => {
      if (
        restoring ||
        window.innerWidth !== viewportWidth ||
        window.innerHeight !== viewportHeight
      ) {
        return
      }
      const nextTarget = Math.max(0, Math.min(1, self.progress))
      scrollProgressRef.current = nextTarget

      if (immediate) {
        snapToProgress(nextTarget)
        return
      }

      const delta = Math.abs(nextTarget - renderedProgressRef.current)
      if (delta <= CONVERGENCE_EPSILON) {
        snapToProgress(nextTarget)
        return
      }

      // Immediately notify scheduler of new scroll goal so prefetch starts on the same tick
      player?.request(frameAt(sequence, renderedProgressRef.current), frameAt(sequence, nextTarget))
      ensureLoopRunning()
    }

    const trigger = ScrollTrigger.create({
      trigger: runway,
      start: () => {
        const headerHeight = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 64
        return `top top+=${headerHeight}`
      },
      end: () => {
        const runwayPx = Number.parseFloat(getComputedStyle(runway).getPropertyValue('--anatomy-runway'))
        return `+=${Number.isFinite(runwayPx) && runwayPx > 0 ? runwayPx : 1080}`
      },
      onUpdate: (self) => updateFromScroll(self, false),
      onRefreshInit() {
        const resized = window.innerWidth !== viewportWidth || window.innerHeight !== viewportHeight
        if (resized && scrollProgressRef.current > 0 && scrollProgressRef.current < 1) {
          retainedProgress = scrollProgressRef.current
        }
        viewportWidth = window.innerWidth
        viewportHeight = window.innerHeight
      },
      onRefresh(self) {
        if (retainedProgress !== undefined) {
          const progress = retainedProgress
          retainedProgress = undefined
          self.scroll(self.start + progress * (self.end - self.start))
          self.update()
        }
        updateFromScroll(self, true)
      },
    })

    jumpToLayerRef.current = (layerIdx: number) => {
      const targetProgress = LAYER_JUMP_PROGRESS[layerIdx] ?? 0
      setLayerSafe(layerIdx)
      explicitLockUntilRef.current = performance.now() + 720
      scrollProgressRef.current = targetProgress
      ensureLoopRunning()
      const destinationY = trigger.start + targetProgress * (trigger.end - trigger.start)
      window.scrollTo({
        top: destinationY,
        behavior: 'smooth',
      })
    }

    retryFrameRef.current = () => {
      player?.retry()
    }

    restoring = false
    trigger.refresh()
    updateFromScroll(trigger, true)

    return () => {
      stopLoop()
      window.removeEventListener('wheel', cancelExplicitLock)
      window.removeEventListener('touchstart', cancelExplicitLock)
      resizeObserver.disconnect()
      trigger.kill()
      player?.dispose(true)
      jumpToLayerRef.current = undefined
      retryFrameRef.current = undefined
    }
  }, [reducedMotion, sequence])

  const posterUrl = getPosterUrl(compact)
  const posterDims = getPosterDimensions(compact)
  const activeLayer = anatomyContent.layers[activeIndex] ?? anatomyContent.layers[0]
  const isInteractive = mode === 'interactive'

  function handleSelectLayer(index: number) {
    if (jumpToLayerRef.current) {
      jumpToLayerRef.current(index)
    } else {
      setLayerSafe(index)
    }
  }

  function handleTabKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    const total = anatomyContent.layers.length
    let nextIndex: number

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      nextIndex = (index + 1) % total
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + total) % total
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = total - 1
    } else {
      return
    }

    event.preventDefault()
    handleSelectLayer(nextIndex)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <section
      id="anatomy"
      ref={sectionRef}
      className="section section-stone section-anatomy"
      aria-labelledby="anatomy-headline"
    >
      <div className="container">
        <div className="anatomy-header" data-reveal>
          <p className="eyebrow">{anatomyContent.eyebrow}</p>
          <h2 id="anatomy-headline" className="section-headline">
            {anatomyContent.headline}
          </h2>
          <p className="section-intro anatomy-intro">{anatomyContent.intro}</p>
        </div>
      </div>

      <div
        ref={runwayRef}
        className="anatomy-runway"
        data-mode={mode}
        data-variant={compact ? 'mobile' : 'desktop'}
      >
        <div ref={stickyRef} className="anatomy-sticky">
          <div className="container anatomy-stage">
            <figure className="anatomy-figure">
              <div className="media-frame media-frame-anatomy">
                <img
                  ref={posterRef}
                  src={posterUrl}
                  alt={anatomyContent.imageAlt}
                  width={posterDims.width}
                  height={posterDims.height}
                  loading={armed ? 'eager' : 'lazy'}
                  fetchPriority={armed ? 'high' : 'auto'}
                  decoding="async"
                  className="anatomy-poster"
                />
                <canvas
                  ref={canvasRef}
                  className="anatomy-canvas"
                  aria-hidden="true"
                  hidden
                />
              </div>

              <figcaption className="anatomy-stage-footer">
                <span
                  className="anatomy-progress-track"
                  aria-hidden="true"
                  hidden={!isInteractive}
                >
                  <span ref={progressBarRef} className="anatomy-progress-fill" />
                </span>

                {targetFailed ? (
                  <div className="anatomy-recovery" role="status">
                    <span>Frame temporarily unavailable.</span>
                    <button
                      type="button"
                      className="anatomy-recovery-btn"
                      onClick={() => retryFrameRef.current?.()}
                    >
                      Reload frame
                    </button>
                  </div>
                ) : null}
              </figcaption>
            </figure>

            <div className="anatomy-inspector">
              <div
                className="anatomy-layer-list"
                role="tablist"
                aria-label="Architectural anatomy layers"
              >
                {anatomyContent.layers.map((layer, index) => {
                  const isSelected = index === activeIndex
                  return (
                    <button
                      key={layer.id}
                      ref={(el) => {
                        tabRefs.current[index] = el
                      }}
                      type="button"
                      role="tab"
                      id={`anatomy-tab-${layer.id}`}
                      aria-selected={isSelected}
                      aria-controls={`anatomy-panel-${layer.id}`}
                      aria-label={layer.title}
                      tabIndex={isSelected ? 0 : -1}
                      className={`anatomy-layer-btn${isSelected ? ' is-active' : ''}`}
                      onClick={() => handleSelectLayer(index)}
                      onKeyDown={(event) => handleTabKeyDown(event, index)}
                    >
                      <span className="anatomy-layer-index" aria-hidden="true">
                        {layer.index}
                      </span>
                      <span className="anatomy-layer-title anatomy-layer-title-full">
                        {layer.title}
                      </span>
                      <span
                        className="anatomy-layer-title anatomy-layer-title-short"
                        aria-hidden="true"
                      >
                        {layer.shortTitle}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div
                key={activeLayer.id}
                id={`anatomy-panel-${activeLayer.id}`}
                role="tabpanel"
                aria-labelledby={`anatomy-tab-${activeLayer.id}`}
                className="anatomy-detail-panel"
              >
                <p className="anatomy-detail-stratum">
                  Stratum {activeLayer.index} / 0{anatomyContent.layers.length}
                </p>
                <h3 className="anatomy-detail-title">{activeLayer.title}</h3>
                <p className="anatomy-detail-spec">{activeLayer.specification}</p>
                <p className="anatomy-detail-summary">{activeLayer.summary}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
