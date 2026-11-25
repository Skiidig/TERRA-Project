export type SequenceVariantId = 'desktop' | 'mobile'

export interface SequenceFrame {
  readonly progress: number
  readonly url: string
  readonly bytes: number
}

export interface AnatomySequence {
  readonly id: SequenceVariantId
  readonly width: number
  readonly height: number
  readonly frameCount: number
  readonly totalBytes: number
  readonly frames: readonly SequenceFrame[]
}

export interface AnatomyManifest {
  readonly schema: number
  readonly background: string
  readonly variants: {
    readonly desktop: AnatomySequence
    readonly mobile: AnatomySequence
  }
}

export const COMPACT_VIEW =
  '(max-width: 47.99rem), (hover: none) and (pointer: coarse) and (max-height: 35rem)'

export const ANATOMY_SEQUENCE_VERSION = 'v2-004b'
export const ANATOMY_SEQUENCE_BASE = `/anatomy-sequence/${ANATOMY_SEQUENCE_VERSION}`
export const MANIFEST_URL = `${ANATOMY_SEQUENCE_BASE}/manifest.json`

export function getPosterUrl(compact: boolean): string {
  return compact
    ? `${ANATOMY_SEQUENCE_BASE}/mobile/frame-000.webp`
    : `${ANATOMY_SEQUENCE_BASE}/desktop/frame-000.webp`
}

export function getPosterDimensions(compact: boolean): { width: number; height: number } {
  return compact ? { width: 896, height: 560 } : { width: 1600, height: 1000 }
}

/**
 * Nearest-frame binary search against manifest progress values.
 * Handles both uniform desktop (96 frames) and non-uniform final-gap mobile (48 frames).
 */
export function frameAt(sequence: AnatomySequence, progress: number): number {
  const frames = sequence.frames
  if (frames.length <= 1) return 0
  const clamped = Math.max(0, Math.min(1, progress))
  let lower = 0
  let upper = frames.length - 1
  while (lower < upper - 1) {
    const mid = (upper + lower) >>> 1
    if (frames[mid].progress <= clamped) lower = mid
    else upper = mid
  }
  return clamped - frames[lower].progress < frames[upper].progress - clamped ? lower : upper
}

let cachedManifestPromise: Promise<AnatomyManifest> | null = null

export function loadAnatomyManifest(): Promise<AnatomyManifest> {
  if (!cachedManifestPromise) {
    cachedManifestPromise = fetch(MANIFEST_URL)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Anatomy manifest unavailable (${response.status})`)
        }
        const data = (await response.json()) as AnatomyManifest
        if (
          !data?.variants?.desktop?.frames?.length ||
          !data?.variants?.mobile?.frames?.length
        ) {
          throw new Error('Anatomy manifest malformed')
        }
        return data
      })
      .catch((error) => {
        cachedManifestPromise = null
        throw error
      })
  }
  return cachedManifestPromise
}
