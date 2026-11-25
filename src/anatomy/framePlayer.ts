import type { AnatomySequence, SequenceVariantId } from './sequences'

export const ANATOMY_STONE = '#EBE7DC'
export const ANATOMY_EDGE_FADE = 0.075

const DESKTOP_FETCH_CONCURRENCY = 4
const MOBILE_FETCH_CONCURRENCY = 2
const DECODE_CONCURRENCY = 2
const PREFETCH_RESUME_IDLE_MS = 220
const MAX_AUTO_RETRIES = 2
const AUTO_RETRY_DELAYS_MS = [650, 1600] as const

interface NetworkInformationLike {
  readonly saveData?: boolean
  readonly effectiveType?: string
}

export function isDataSaverActive(): boolean {
  if (typeof navigator === 'undefined') return false
  const conn = (navigator as Navigator & { connection?: NetworkInformationLike }).connection
  if (!conn) return false
  return Boolean(conn.saveData || conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g')
}

/**
 * Generates a deterministic coarse-to-fine frame prefetch sequence covering the full
 * 0 -> 1 assembly arc with progressively finer strides (8 -> 4 -> 2 -> 1), starting with
 * the endpoint and evenly spaced structural milestones before filling adjacent frames.
 */
export function buildCoarseToFineOrder(frameCount: number): number[] {
  if (frameCount <= 1) return []
  const order: number[] = []
  const seen = new Set<number>()
  const add = (idx: number) => {
    if (idx < 1 || idx >= frameCount || seen.has(idx)) return
    seen.add(idx)
    order.push(idx)
  }

  add(frameCount - 1)
  for (const stride of [8, 4, 2, 1]) {
    for (let idx = stride; idx < frameCount; idx += stride) {
      add(idx)
    }
  }
  for (let idx = 1; idx < frameCount; idx += 1) {
    add(idx)
  }
  return order
}

export interface FramePlayerState {
  readonly target: number
  readonly shown: number
  readonly cached: number
  readonly decodedLimit: number
  readonly pending: number
  readonly compressedCount: number
  readonly compressedBytes: number
  readonly fetches: number
  readonly draws: number
  readonly failures: number
  readonly targetFailed: boolean
  readonly decodedBytes: number
  readonly sequence: SequenceVariantId
}

export interface FramePlayer {
  request: (renderedIndex: number, lookaheadGoalIndex?: number) => void
  retry: () => void
  snapshot: () => FramePlayerState
  dispose: (keepPaint?: boolean) => void
}

interface ActiveFetch {
  controller: AbortController
  kind: 'active' | 'prefetch'
}

/**
 * Bounded-memory, direction- and velocity-aware frame player with decoupled fetch/decode
 * scheduling and coarse-to-fine compressed-only background prefetch.
 *
 * V3-002 architecture:
 * - Poster-first gating: background sequence prefetch waits until the assembled poster
 *   is ready so slow mobile links never starve initial stage visibility.
 * - Decoupled HTTP fetch lanes from ImageBitmap decode lanes: background prefetch populates
 *   ONLY the bounded compressed Blob LRU without touching decoded RGBA bitmap memory.
 * - Pre-decode eviction ensures live ImageBitmaps NEVER exceed 8 desktop (48.83 MiB) or
 *   10 mobile (19.14 MiB), even transiently during concurrent decode.
 * - Active scroll demand immediately yields background prefetch lanes without aborting
 *   in-flight downloads, preserving every downloaded byte in the compressed cache (0 dupes).
 * - Respects Save-Data / 2G signals by disabling background prefetch and narrowing active
 *   lookahead strictly to immediate frames.
 */
export function createFramePlayer(
  canvas: HTMLCanvasElement,
  poster: HTMLImageElement,
  sequence: AnatomySequence,
  initialTarget: number,
  onState: (state: FramePlayerState) => void,
): FramePlayer | null {
  const ctx = canvas.getContext('2d')
  if (!ctx || typeof createImageBitmap !== 'function') return null

  const { width, height, frames } = sequence
  const isDesktop = sequence.id === 'desktop'
  const decodedLimit = isDesktop ? 8 : 10
  const fetchConcurrency = isDesktop ? DESKTOP_FETCH_CONCURRENCY : MOBILE_FETCH_CONCURRENCY
  const idlePrefetchConcurrency = isDesktop ? Math.max(2, fetchConcurrency - 1) : 1
  const compressedBudget = (isDesktop ? 9 : 4) * 1024 * 1024
  const prefetchOrder = buildCoarseToFineOrder(frames.length)
  const dataSaver = isDataSaverActive()
  const prefetchEnabled = !dataSaver
  const activePlanLimit = dataSaver ? 2 : decodedLimit

  const decoded = new Map<number, ImageBitmap>()
  const compressed = new Map<number, Blob>()
  const activeFetches = new Map<number, ActiveFetch>()
  const activeDecodes = new Set<number>()
  const retryCounts = new Map<number, number>()
  const retryTimers = new Map<number, number>()
  const failures = new Set<number>()

  let target = Math.max(0, Math.min(frames.length - 1, initialTarget))
  let goal = target
  let shown = -1
  let direction = 1
  let compressedBytes = 0
  let posterReady = false
  let retryPoster = false
  let fetches = 0
  let draws = 0
  let destroyed = false
  let prefetchCursor = 0
  let lastRequestMs = 0
  let prefetchResumeTimer: number | undefined

  const horizontal = ctx.createLinearGradient(0, 0, width, 0)
  const vertical = ctx.createLinearGradient(0, 0, 0, height)
  for (const gradient of [horizontal, vertical]) {
    gradient.addColorStop(0, 'transparent')
    gradient.addColorStop(ANATOMY_EDGE_FADE, 'black')
    gradient.addColorStop(1 - ANATOMY_EDGE_FADE, 'black')
    gradient.addColorStop(1, 'transparent')
  }

  function plan(): number[] {
    const picked: number[] = []
    const seen = new Set<number>()
    const add = (idx: number) => {
      if (idx < (retryPoster ? 0 : 1) || idx >= frames.length) return
      if (seen.has(idx) || picked.length >= activePlanLimit) return
      seen.add(idx)
      picked.push(idx)
    }

    // 1. Always prioritize exact current display target
    add(target)

    const stepDir = Math.sign(goal - target) || direction || 1
    const gap = Math.abs(goal - target)

    // 2. Travel-path scheduling: stride by 2 on large desktop chases so evenly-spaced frames
    //    stay ahead of the damper without saturating decode threads
    if (gap > 1) {
      const stride = isDesktop && gap >= 12 ? 2 : 1
      for (let step = stride; step <= Math.min(gap, activePlanLimit * stride); step += stride) {
        add(target + stepDir * step)
        if (picked.length >= activePlanLimit - 1) break
      }
      add(goal)
    }

    // 3. Fill remaining bounded window with direction-weighted neighbors around target
    const first = Math.max(retryPoster ? 0 : 1, target - activePlanLimit)
    const last = Math.min(frames.length - 1, target + activePlanLimit)
    const neighbors = Array.from({ length: last - first + 1 }, (_, offset) => first + offset).sort(
      (a, b) => {
        const weight = (index: number) =>
          Math.abs(index - target) * (Math.sign(index - target) === stepDir ? 0.72 : 1.24)
        return weight(a) - weight(b)
      },
    )
    for (const idx of neighbors) {
      if (picked.length >= activePlanLimit) break
      add(idx)
    }

    return picked
  }

  function isWithinTravelCorridor(index: number): boolean {
    if (index === target || index === goal) return true
    const low = Math.min(shown >= 0 ? shown : target, target, goal)
    const high = Math.max(shown >= 0 ? shown : target, target, goal)
    return index >= low && index <= high
  }

  /**
   * Prunes decoded ImageBitmaps so `decoded.size + reserveSlots <= decodedLimit`.
   * Called BEFORE launching `createImageBitmap` so live RGBA memory never exceeds the
   * configured desktop (8) or mobile (10) cap, even transiently.
   */
  function pruneDecoded(indices: number[], reserveSlots = 0) {
    const cap = Math.max(0, decodedLimit - reserveSlots)
    if (decoded.size <= cap) return

    const keep = new Set(indices)
    if (shown > 0) keep.add(shown)

    for (const [index, bitmap] of decoded) {
      if (!keep.has(index) && decoded.size > cap) {
        bitmap.close()
        decoded.delete(index)
      }
    }

    if (decoded.size > cap) {
      const candidates = [...decoded.keys()]
        .filter((index) => index !== target && index !== shown)
        .sort((a, b) => Math.abs(b - target) - Math.abs(a - target))
      for (const index of candidates) {
        const bitmap = decoded.get(index)
        if (!bitmap) continue
        bitmap.close()
        decoded.delete(index)
        if (decoded.size <= cap) break
      }
    }

    if (decoded.size > cap) {
      for (const [index, bitmap] of decoded) {
        if (index !== target) {
          bitmap.close()
          decoded.delete(index)
          if (decoded.size <= cap) break
        }
      }
    }
  }

  function snapshot(): FramePlayerState {
    return {
      target,
      shown,
      cached: decoded.size,
      decodedLimit,
      pending: activeFetches.size + activeDecodes.size,
      compressedCount: compressed.size,
      compressedBytes,
      fetches,
      draws,
      failures: failures.size,
      targetFailed: failures.has(target),
      decodedBytes: decoded.size * width * height * 4,
      sequence: sequence.id,
    }
  }

  function report() {
    if (!destroyed) onState(snapshot())
  }

  function resolveSource(index: number): CanvasImageSource | undefined {
    if (index === 0 && posterReady && !retryPoster) return poster
    return decoded.get(index)
  }

  function pickPaintCandidate(): { index: number; source: CanvasImageSource } | null {
    const exact = resolveSource(target)
    if (exact) return { index: target, source: exact }

    if (shown < 0 || shown === target) return null
    const moveDir = Math.sign(target - shown)
    if (moveDir === 0) return null

    let bestIdx = -1
    let bestDist = Math.abs(target - shown)
    for (const idx of decoded.keys()) {
      if (Math.sign(idx - shown) === moveDir && Math.sign(target - idx) === moveDir) {
        const dist = Math.abs(target - idx)
        if (dist < bestDist) {
          bestDist = dist
          bestIdx = idx
        }
      }
    }
    if (target === 0 && moveDir < 0 && posterReady && !retryPoster) {
      return { index: 0, source: poster }
    }
    if (bestIdx >= 0) {
      const src = decoded.get(bestIdx)
      if (src) return { index: bestIdx, source: src }
    }
    return null
  }

  function paint() {
    if (!ctx || target === shown || destroyed) return
    const candidate = pickPaintCandidate()
    if (!candidate || candidate.index === shown) return

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(candidate.source, 0, 0, width, height)
    ctx.globalCompositeOperation = 'destination-in'
    for (const gradient of [horizontal, vertical]) {
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }
    ctx.globalCompositeOperation = 'destination-over'
    ctx.fillStyle = ANATOMY_STONE
    ctx.fillRect(0, 0, width, height)
    ctx.globalCompositeOperation = 'source-over'
    shown = candidate.index
    draws += 1
    canvas.hidden = false
    poster.classList.add('is-under-canvas')
  }

  function retainBlob(index: number, blob: Blob) {
    if (compressed.has(index)) {
      const existing = compressed.get(index)!
      compressed.delete(index)
      compressed.set(index, existing)
      return
    }
    while (compressed.size && compressedBytes + blob.size > compressedBudget) {
      const oldest = compressed.keys().next().value
      if (oldest === undefined) break
      const entry = compressed.get(oldest)
      if (entry) compressedBytes -= entry.size
      compressed.delete(oldest)
    }
    if (blob.size <= compressedBudget) {
      compressed.set(index, blob)
      compressedBytes += blob.size
    }
  }

  function scheduleAutoRetry(index: number) {
    const attempts = retryCounts.get(index) ?? 0
    if (attempts >= MAX_AUTO_RETRIES) {
      failures.add(index)
      return
    }
    retryCounts.set(index, attempts + 1)
    const delay = AUTO_RETRY_DELAYS_MS[attempts] ?? 1600
    const existingTimer = retryTimers.get(index)
    if (existingTimer !== undefined) window.clearTimeout(existingTimer)
    const timer = window.setTimeout(() => {
      retryTimers.delete(index)
      if (destroyed) return
      pump()
      report()
    }, delay)
    retryTimers.set(index, timer)
  }

  function schedulePrefetchResume() {
    if (prefetchResumeTimer !== undefined || !prefetchEnabled || destroyed) return
    prefetchResumeTimer = window.setTimeout(() => {
      prefetchResumeTimer = undefined
      if (!destroyed) pump()
    }, PREFETCH_RESUME_IDLE_MS + 20)
  }

  function startDecode(index: number, blob: Blob, currentPlan: number[]) {
    if (destroyed || decoded.has(index) || activeDecodes.has(index)) return
    // Evict BEFORE creating the new ImageBitmap so live count stays strictly <= decodedLimit
    pruneDecoded(currentPlan, activeDecodes.size + 1)
    activeDecodes.add(index)
    compressed.delete(index)
    compressed.set(index, blob)

    void createImageBitmap(blob)
      .then((bitmap) => {
        const latestPlan = plan()
        if (destroyed || (!latestPlan.includes(index) && !isWithinTravelCorridor(index))) {
          bitmap.close()
          return
        }
        pruneDecoded(latestPlan, 1)
        retryCounts.delete(index)
        failures.delete(index)
        decoded.set(index, bitmap)
        paint()
      })
      .catch(() => {
        if (!destroyed) {
          scheduleAutoRetry(index)
        }
      })
      .finally(() => {
        activeDecodes.delete(index)
        pump()
        report()
      })
  }

  function startFetch(index: number, kind: 'active' | 'prefetch') {
    if (
      destroyed ||
      compressed.has(index) ||
      activeFetches.has(index) ||
      failures.has(index) ||
      retryTimers.has(index)
    ) {
      return
    }

    const controller = new AbortController()
    const entry: ActiveFetch = { controller, kind }
    activeFetches.set(index, entry)
    fetches += 1

    const priority = kind === 'active' && (index === target || index === goal) ? 'high' : 'low'
    void fetch(frames[index].url, {
      signal: controller.signal,
      priority,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Frame ${index} HTTP ${response.status}`)
        const blob = await response.blob()
        if (destroyed) return
        retainBlob(index, blob)
        retryCounts.delete(index)
        failures.delete(index)
      })
      .catch(() => {
        if (!controller.signal.aborted && !destroyed && kind === 'active') {
          scheduleAutoRetry(index)
        }
      })
      .finally(() => {
        if (activeFetches.get(index) === entry) {
          activeFetches.delete(index)
        }
        pump()
        report()
      })
  }

  function nextPrefetchIndex(): number {
    while (prefetchCursor < prefetchOrder.length) {
      const idx = prefetchOrder[prefetchCursor]
      prefetchCursor += 1
      if (
        !compressed.has(idx) &&
        !decoded.has(idx) &&
        !activeFetches.has(idx) &&
        !failures.has(idx) &&
        !retryTimers.has(idx)
      ) {
        return idx
      }
    }
    return -1
  }

  function findBestCompressedBridge(): number {
    if (shown < 0 || shown === target) return -1
    const moveDir = Math.sign(target - shown)
    if (moveDir === 0) return -1
    let bestIdx = -1
    let bestDist = Math.abs(target - shown)
    for (const idx of compressed.keys()) {
      if (decoded.has(idx) || activeDecodes.has(idx)) continue
      if (Math.sign(idx - shown) === moveDir && Math.sign(target - idx) === moveDir) {
        const dist = Math.abs(target - idx)
        if (dist < bestDist) {
          bestDist = dist
          bestIdx = idx
        }
      }
    }
    return bestIdx
  }

  function pump() {
    if (destroyed) return
    const indices = plan()
    pruneDecoded(indices, activeDecodes.size)

    // 1. Decode phase: decode any active-window frames already cached as compressed Blobs
    for (const index of indices) {
      if (activeDecodes.size >= DECODE_CONCURRENCY) break
      if (decoded.has(index) || activeDecodes.has(index)) continue
      const blob = compressed.get(index)
      if (!blob) continue
      const targetDecodedOrDecoding =
        Boolean(resolveSource(target)) || activeDecodes.has(target) || failures.has(target)
      if (
        index !== target &&
        !targetDecodedOrDecoding &&
        compressed.has(target) &&
        activeDecodes.size >= DECODE_CONCURRENCY - 1
      ) {
        continue
      }
      startDecode(index, blob, indices)
    }

    // 1b. Monotonic bridge decode: if exact target isn't ready yet, decode the closest
    //     already-fetched intermediate frame strictly between `shown` and `target` so the
    //     canvas keeps advancing smoothly on slow/mobile networks instead of holding stale.
    if (!resolveSource(target) && activeDecodes.size < DECODE_CONCURRENCY) {
      const bridgeIdx = findBestCompressedBridge()
      if (bridgeIdx >= 0) {
        const blob = compressed.get(bridgeIdx)
        if (blob) startDecode(bridgeIdx, blob, indices)
      }
    }

    // When idle at frame 0 before the initial assembled poster finishes, let the poster own
    // the connection first so slow mobile networks never starve initial stage visibility.
    const waitingOnInitialPoster = target === 0 && goal === 0 && !posterReady && !retryPoster
    if (waitingOnInitialPoster) return

    // 2. Active fetch phase: prioritize missing frames inside the current display/travel window
    const missingActive = indices.filter(
      (index) =>
        !decoded.has(index) &&
        !compressed.has(index) &&
        !activeFetches.has(index) &&
        !failures.has(index) &&
        !retryTimers.has(index),
    )

    if (missingActive.length > 0) {
      for (const index of missingActive) {
        if (activeFetches.size >= fetchConcurrency) break
        const targetAccounted =
          Boolean(resolveSource(target)) ||
          compressed.has(target) ||
          activeFetches.has(target) ||
          failures.has(target)
        if (index !== target && !targetAccounted && activeFetches.size >= fetchConcurrency - 1) {
          continue
        }
        startFetch(index, 'active')
      }
    }

    // 3. Coarse-to-fine compressed-only background prefetch when idle (not actively scrubbing)
    const recentlyScrolling =
      lastRequestMs > 0 && performance.now() - lastRequestMs < PREFETCH_RESUME_IDLE_MS
    if (
      prefetchEnabled &&
      posterReady &&
      missingActive.length === 0 &&
      !recentlyScrolling &&
      target === shown &&
      compressedBytes < compressedBudget - 128 * 1024
    ) {
      while (activeFetches.size < idlePrefetchConcurrency) {
        const nextIdx = nextPrefetchIndex()
        if (nextIdx < 0) break
        startFetch(nextIdx, 'prefetch')
      }
    } else if (prefetchEnabled && recentlyScrolling && prefetchCursor < prefetchOrder.length) {
      schedulePrefetchResume()
    }
  }

  void poster
    .decode()
    .then(() => {
      if (destroyed) return
      posterReady = true
      paint()
      pump()
      report()
    })
    .catch(() => {
      if (!destroyed) {
        retryPoster = true
        scheduleAutoRetry(0)
        report()
      }
    })

  pump()
  report()

  return {
    request(renderedIndex: number, lookaheadGoalIndex?: number) {
      const clampedTarget = Math.max(0, Math.min(frames.length - 1, renderedIndex))
      const clampedGoal =
        lookaheadGoalIndex === undefined
          ? clampedTarget
          : Math.max(0, Math.min(frames.length - 1, lookaheadGoalIndex))
      if (target === clampedTarget && goal === clampedGoal) return
      direction = Math.sign(clampedGoal - target) || Math.sign(clampedTarget - target) || direction
      target = clampedTarget
      goal = clampedGoal
      lastRequestMs = performance.now()
      paint()
      pump()
      report()
    },
    retry() {
      const hadFailure = failures.delete(target)
      const pendingTimer = retryTimers.get(target)
      if (pendingTimer !== undefined) {
        window.clearTimeout(pendingTimer)
        retryTimers.delete(target)
      }
      if (!hadFailure && pendingTimer === undefined) return
      retryCounts.delete(target)
      if (target === 0) retryPoster = true
      pump()
      report()
    },
    snapshot,
    dispose(keepPaint = false) {
      destroyed = true
      if (prefetchResumeTimer !== undefined) {
        window.clearTimeout(prefetchResumeTimer)
        prefetchResumeTimer = undefined
      }
      for (const timer of retryTimers.values()) window.clearTimeout(timer)
      retryTimers.clear()
      for (const entry of activeFetches.values()) entry.controller.abort()
      activeFetches.clear()
      activeDecodes.clear()
      for (const bitmap of decoded.values()) bitmap.close()
      decoded.clear()
      compressed.clear()
      if (!keepPaint) {
        canvas.hidden = true
        poster.classList.remove('is-under-canvas')
      }
    },
  }
}
