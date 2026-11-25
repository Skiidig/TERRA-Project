import type { AnatomySequence, SequenceVariantId } from './sequences'

export const ANATOMY_STONE = '#EBE7DC'
export const ANATOMY_EDGE_FADE = 0.075

const CONCURRENCY = 2
const MAX_AUTO_RETRIES = 2
const AUTO_RETRY_DELAYS_MS = [650, 1600] as const

export interface FramePlayerState {
  readonly target: number
  readonly shown: number
  readonly cached: number
  readonly decodedLimit: number
  readonly pending: number
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

/**
 * Bounded-memory, direction- and velocity-aware frame player.
 *
 * V2-005B optimizations over V2-005:
 * - Velocity-aware stride scheduling: decodes every adjacent frame during slow/moderate
 *   motion, and strides every 2nd frame + endpoint goal during large fast jumps to avoid
 *   decode queue contention on 1600x1000 desktop WebPs.
 * - Conservative stale-request abort: aborts only genuinely obsolete requests (strictly
 *   behind travel direction after a reversal or far outside the target/goal span) so slow
 *   networks finish in-flight travel frames without thrashing or duplicate requests.
 * - Bounded decoded ImageBitmap window (8 desktop / 10 mobile) plus monotonic intermediate
 *   decoded fallback so cold fast scrubs advance smoothly while exact target decodes.
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
  const decodedLimit = sequence.id === 'desktop' ? 8 : 10
  const compressedBudget = (sequence.id === 'desktop' ? 9 : 4) * 1024 * 1024

  const decoded = new Map<number, ImageBitmap>()
  const compressed = new Map<number, Blob>()
  const requests = new Map<number, AbortController>()
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
      if (seen.has(idx) || picked.length >= decodedLimit) return
      seen.add(idx)
      picked.push(idx)
    }

    // 1. Always prioritize exact current display target
    add(target)

    const stepDir = Math.sign(goal - target) || direction || 1
    const gap = Math.abs(goal - target)

    // 2. Travel-path scheduling: stride by 2 on large desktop chases so evenly-spaced frames
    //    stay ahead of the damper without saturating ImageBitmap decode threads
    if (gap > 1) {
      const stride = sequence.id === 'desktop' && gap >= 12 ? 2 : 1
      for (let step = stride; step <= Math.min(gap, decodedLimit * stride); step += stride) {
        add(target + stepDir * step)
        if (picked.length >= decodedLimit - 1) break
      }
      add(goal)
    }

    // 3. Fill remaining bounded window with direction-weighted neighbors around target
    const first = Math.max(retryPoster ? 0 : 1, target - decodedLimit)
    const last = Math.min(frames.length - 1, target + decodedLimit)
    const neighbors = Array.from({ length: last - first + 1 }, (_, offset) => first + offset).sort(
      (a, b) => {
        const weight = (index: number) =>
          Math.abs(index - target) * (Math.sign(index - target) === stepDir ? 0.72 : 1.24)
        return weight(a) - weight(b)
      },
    )
    for (const idx of neighbors) {
      if (picked.length >= decodedLimit) break
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

  function pruneDecoded(indices: number[]) {
    const keep = new Set(indices)
    if (shown > 0) keep.add(shown)
    for (const [index, bitmap] of decoded) {
      if (!keep.has(index) && decoded.size > decodedLimit) {
        bitmap.close()
        decoded.delete(index)
      }
    }
    if (decoded.size > decodedLimit) {
      for (const [index, bitmap] of decoded) {
        if (!indices.includes(index) && index !== target) {
          bitmap.close()
          decoded.delete(index)
          if (decoded.size <= decodedLimit) break
        }
      }
    }
  }

  function abortObsoleteRequests(indices: number[]) {
    const activeSet = new Set(indices)
    const spanLow = Math.min(target, goal) - decodedLimit
    const spanHigh = Math.max(target, goal) + decodedLimit
    for (const [index, controller] of requests) {
      if (activeSet.has(index) || isWithinTravelCorridor(index)) continue
      // Only abort when request is clearly obsolete (opposite direction / far outside travel span)
      if (index < spanLow || index > spanHigh) {
        controller.abort()
        requests.delete(index)
      }
    }
  }

  function snapshot(): FramePlayerState {
    return {
      target,
      shown,
      cached: decoded.size,
      decodedLimit,
      pending: requests.size,
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

  /**
   * Picks exact target if decoded; otherwise, during an active cold scrub,
   * selects the closest already-decoded frame strictly between `shown` and `target`
   * (or between `shown` and `goal` along the same travel direction) so motion keeps
   * advancing smoothly while the exact frame decodes.
   */
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

  function pump() {
    if (destroyed) return
    const indices = plan()
    abortObsoleteRequests(indices)
    pruneDecoded(indices)

    for (const index of indices) {
      if (requests.size >= CONCURRENCY) break
      if (
        decoded.has(index) ||
        requests.has(index) ||
        failures.has(index) ||
        retryTimers.has(index)
      ) {
        continue
      }
      // Keep one lane free for exact target when target isn't ready or loading yet
      const targetReady =
        Boolean(resolveSource(target)) || requests.has(target) || failures.has(target)
      if (index !== target && !targetReady && requests.size >= CONCURRENCY - 1) continue

      const controller = new AbortController()
      requests.set(index, controller)
      void (async () => {
        let blob = compressed.get(index)
        if (blob) {
          compressed.delete(index)
          compressed.set(index, blob)
        } else {
          fetches += 1
          const response = await fetch(frames[index].url, {
            signal: controller.signal,
            priority: index === target || index === goal ? 'high' : 'low',
          })
          if (!response.ok) throw new Error(`Frame ${index} HTTP ${response.status}`)
          blob = await response.blob()
          if (destroyed) return
          retainBlob(index, blob)
          if (controller.signal.aborted) return
        }
        const bitmap = await createImageBitmap(blob)
        const currentPlan = plan()
        if (
          destroyed ||
          controller.signal.aborted ||
          (!currentPlan.includes(index) && !isWithinTravelCorridor(index))
        ) {
          bitmap.close()
          return
        }
        pruneDecoded(currentPlan)
        retryCounts.delete(index)
        failures.delete(index)
        decoded.set(index, bitmap)
        paint()
      })()
        .catch(() => {
          if (!controller.signal.aborted && !destroyed) {
            scheduleAutoRetry(index)
          }
        })
        .finally(() => {
          if (requests.get(index) === controller) {
            requests.delete(index)
          }
          pump()
          report()
        })
    }
  }

  void poster
    .decode()
    .then(() => {
      if (destroyed) return
      posterReady = true
      paint()
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
      for (const timer of retryTimers.values()) window.clearTimeout(timer)
      retryTimers.clear()
      for (const controller of requests.values()) controller.abort()
      requests.clear()
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
