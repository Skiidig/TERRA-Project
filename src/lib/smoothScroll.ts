import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const DESKTOP_SMOOTH_QUERY =
  '(hover: hover) and (pointer: fine) and (min-width: 64rem) and (prefers-reduced-motion: no-preference)'

/**
 * Empirically evaluated conservative desktop lerp factor (tested: 0.08, 0.10, 0.14).
 * Selected 0.14: smooths discrete wheel input with zero perceptible input lag,
 * zero lingering idle drift, and no double-smoothing against Anatomy's damper.
 */
export const LENIS_LERP = 0.14

let activeLenis: Lenis | null = null

export function getActiveLenis(): Lenis | null {
  return activeLenis
}

export function scrollToY(
  y: number,
  options?: { immediate?: boolean; duration?: number },
): void {
  const clampedY = Math.max(0, y)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const immediate = Boolean(options?.immediate || reducedMotion)

  if (activeLenis) {
    activeLenis.scrollTo(clampedY, {
      immediate,
      ...(immediate || options?.duration === undefined ? {} : { duration: options.duration }),
    })
    return
  }

  window.scrollTo({
    top: clampedY,
    behavior: immediate ? 'instant' : 'smooth',
  })
}

export function scrollToHash(
  hash: string,
  options?: { immediate?: boolean; duration?: number },
): boolean {
  if (!hash || !hash.startsWith('#')) return false
  if (hash === '#top') {
    scrollToY(0, options)
    return true
  }

  const target = document.getElementById(hash.slice(1))
  if (!target) return false

  const headerHeight = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 64
  const targetTop = Math.max(
    0,
    Math.round(target.getBoundingClientRect().top + window.scrollY - headerHeight),
  )
  scrollToY(targetTop, options)
  return true
}

/**
 * Mounts a single desktop-only Lenis instance synchronized with GSAP's ticker
 * and ScrollTrigger. Automatically tears down on mobile, reduced-motion,
 * viewport changes, or React StrictMode cleanup.
 */
export function setupDesktopSmoothScroll(lerp = LENIS_LERP): () => void {
  const mediaQuery = window.matchMedia(DESKTOP_SMOOTH_QUERY)
  let tickerCallback: ((time: number) => void) | null = null

  const teardown = () => {
    if (tickerCallback) {
      gsap.ticker.remove(tickerCallback)
      tickerCallback = null
    }
    if (activeLenis) {
      activeLenis.off('scroll', ScrollTrigger.update)
      activeLenis.destroy()
      activeLenis = null
    }
  }

  const mount = () => {
    teardown()
    if (!mediaQuery.matches) return

    const lenis = new Lenis({
      smoothWheel: true,
      lerp,
      syncTouch: false,
      autoRaf: false,
      allowNestedScroll: true,
      respectReducedMotion: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    tickerCallback = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tickerCallback)
    activeLenis = lenis
    ScrollTrigger.refresh()
  }

  const onAnchorClick = (event: MouseEvent) => {
    if (!activeLenis || event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    const target = event.target as HTMLElement | null
    const link = target?.closest<HTMLAnchorElement>('a[href^="#"]')
    if (!link) return

    const href = link.getAttribute('href')
    if (!href || href.length <= 1) return

    if (scrollToHash(href, { duration: 1.05 })) {
      event.preventDefault()
      if (window.location.hash !== href) {
        window.history.pushState(null, '', href)
      }
      if (href !== '#top') {
        const dest = document.getElementById(href.slice(1))
        if (dest && dest.tabIndex < 0 && !dest.hasAttribute('tabindex')) {
          dest.setAttribute('tabindex', '-1')
        }
        dest?.focus({ preventScroll: true })
      }
    }
  }

  const onPopState = () => {
    if (!activeLenis) return
    const hash = window.location.hash
    if (hash && hash.length > 1) {
      scrollToHash(hash, { immediate: true })
    } else {
      scrollToY(0, { immediate: true })
    }
  }

  mount()
  mediaQuery.addEventListener('change', mount)
  document.addEventListener('click', onAnchorClick)
  window.addEventListener('popstate', onPopState)

  return () => {
    mediaQuery.removeEventListener('change', mount)
    document.removeEventListener('click', onAnchorClick)
    window.removeEventListener('popstate', onPopState)
    teardown()
  }
}
