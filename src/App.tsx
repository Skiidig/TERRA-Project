import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DesignAnatomySection } from './anatomy/DesignAnatomySection'
import {
  closingContent,
  footerContent,
  heroContent,
  materialityContent,
  navigationItems,
  philosophyContent,
  spatialContent,
} from './content/v2Content'

gsap.registerPlugin(ScrollTrigger)

export function App() {
  const rootRef = useRef<HTMLDivElement>(null)
  const closingRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [headerOnDark, setHeaderOnDark] = useState(false)

  // Ensure direct fragment URLs (e.g. /#anatomy) align accurately after React mounts DOM & fonts settle
  useLayoutEffect(() => {
    const hash = window.location.hash
    if (!hash || hash.length <= 1) return

    let userInteracted = false
    const markInteracted = () => {
      userInteracted = true
    }
    window.addEventListener('wheel', markInteracted, { passive: true, once: true })
    window.addEventListener('touchstart', markInteracted, { passive: true, once: true })
    window.addEventListener('keydown', markInteracted, { once: true })

    const alignToHash = () => {
      if (userInteracted) return
      const target = document.getElementById(hash.slice(1))
      if (!target) return
      const headerHeight = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 64
      const targetTop = Math.max(
        0,
        Math.round(target.getBoundingClientRect().top + window.scrollY - headerHeight),
      )
      if (Math.abs(window.scrollY - targetTop) > 2) {
        window.scrollTo({ top: targetTop, behavior: 'instant' })
      }
      ScrollTrigger.refresh()
    }

    alignToHash()
    const rafId = window.requestAnimationFrame(alignToHash)
    let cancelled = false
    void document.fonts?.ready.then(() => {
      if (!cancelled) alignToHash()
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('wheel', markInteracted)
      window.removeEventListener('touchstart', markInteracted)
      window.removeEventListener('keydown', markInteracted)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      const closingEl = closingRef.current
      if (closingEl) {
        const headerHeight = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 64
        const rect = closingEl.getBoundingClientRect()
        setHeaderOnDark(rect.top <= headerHeight + 4)
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      // 1. Hero entrance: immediate, restrained editorial typography + masked pavilion settle
      gsap.from('[data-hero-reveal]', {
        opacity: 0,
        y: 14,
        duration: 0.78,
        stagger: 0.07,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      })

      gsap.fromTo(
        '[data-hero-frame]',
        { clipPath: 'inset(5% 0% 0% 0%)', opacity: 0.92 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          opacity: 1,
          duration: 1.05,
          delay: 0.08,
          ease: 'power3.out',
          clearProps: 'clipPath,opacity',
        },
      )

      gsap.from('[data-hero-img]', {
        scale: 1.05,
        duration: 1.25,
        delay: 0.08,
        ease: 'power3.out',
        clearProps: 'transform',
      })

      // 2. Architectural media mask reveals (skip elements already above/in view; play once without self-killing mid-init)
      const mediaFrames = gsap.utils.toArray<HTMLElement>('[data-media-reveal]')
      mediaFrames.forEach((frame) => {
        if (frame.getBoundingClientRect().top < window.innerHeight * 0.92) return
        const img = frame.querySelector('img')
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: frame,
            start: 'top 92%',
            toggleActions: 'play none none none',
          },
        })

        tl.fromTo(
          frame,
          { clipPath: 'inset(6% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 0.9,
            ease: 'power3.out',
            clearProps: 'clipPath',
          },
        )

        if (img && !img.hasAttribute('data-parallax-img')) {
          tl.from(
            img,
            {
              scale: 1.045,
              duration: 1.05,
              ease: 'power3.out',
              clearProps: 'transform',
            },
            0,
          )
        }
      })

      // 3. Concise editorial text reveals
      const revealGroups = gsap.utils.toArray<HTMLElement>('[data-reveal]')
      revealGroups.forEach((element) => {
        if (element.getBoundingClientRect().top < window.innerHeight * 0.93) return
        gsap.from(element, {
          opacity: 0,
          y: 16,
          duration: 0.68,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: element,
            start: 'top 93%',
            toggleActions: 'play none none none',
          },
        })
      })

      // 4. Desktop-only subtle scroll-linked motion (hero handoff scale + spatial interior parallax)
      const mm = gsap.matchMedia()
      mm.add('(min-width: 64rem)', () => {
        const heroImg = root.querySelector<HTMLElement>('[data-hero-img]')
        const heroSection = root.querySelector<HTMLElement>('.hero-section')
        if (heroImg && heroSection) {
          gsap.to(heroImg, {
            scale: 1.045,
            yPercent: 2.5,
            ease: 'none',
            scrollTrigger: {
              trigger: heroSection,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.6,
            },
          })
        }

        const parallaxImages = gsap.utils.toArray<HTMLElement>('[data-parallax-img]')
        parallaxImages.forEach((img) => {
          gsap.fromTo(
            img,
            { yPercent: -3.5 },
            {
              yPercent: 3.5,
              ease: 'none',
              scrollTrigger: {
                trigger: img.parentElement ?? img,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.5,
              },
            },
          )
        })
      })
    }, root)

    return () => ctx.revert()
  }, [])

  function handleNavClick() {
    setMenuOpen(false)
  }

  return (
    <div className="page-shell" id="top" ref={rootRef}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header
        className={`site-header${scrolled ? ' is-scrolled' : ''}${headerOnDark && !menuOpen ? ' is-on-dark' : ''}`}
      >
        <div className="container header-inner">
          <a className="brand-wordmark" href="#top" aria-label="TERRA — return to top">
            TERRA
          </a>

          <nav className="site-nav" aria-label="Primary">
            <ul className="nav-list">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <a className="nav-link" href={`#${item.id}`}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <button
            ref={menuButtonRef}
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className="menu-toggle-label">{menuOpen ? 'Close' : 'Menu'}</span>
            <span className={`menu-toggle-lines${menuOpen ? ' is-open' : ''}`} aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>

        <nav
          id="mobile-nav-drawer"
          className={`mobile-drawer${menuOpen ? ' is-open' : ''}`}
          aria-label="Mobile primary"
          hidden={!menuOpen}
        >
          <div className="container mobile-drawer-inner">
            <ul className="mobile-nav-list">
              {navigationItems.map((item, index) => (
                <li key={item.id}>
                  <a className="mobile-nav-link" href={`#${item.id}`} onClick={handleNavClick}>
                    <span className="mobile-nav-index" aria-hidden="true">
                      0{index + 1}
                    </span>
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      <main id="main-content" tabIndex={-1}>
        {/* 1. HERO */}
        <section className="hero-section" aria-labelledby="hero-headline">
          <div className="container">
            <div className="hero-header">
              <div className="hero-title-block">
                <p className="eyebrow" data-hero-reveal>
                  {heroContent.eyebrow}
                </p>
                <h1 id="hero-headline" className="hero-headline" data-hero-reveal>
                  {heroContent.headline}
                </h1>
              </div>

              <div className="hero-aside" data-hero-reveal>
                <p className="hero-supporting">{heroContent.supportingLine}</p>
                <a className="editorial-link" href={heroContent.ctaHref}>
                  <span>{heroContent.ctaLabel}</span>
                  <svg
                    className="editorial-link-icon"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 2.25V11.75M7 11.75L2.75 7.5M7 11.75L11.25 7.5"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      strokeLinecap="square"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <figure className="hero-figure">
              <div className="media-frame media-frame-hero" data-hero-frame>
                <img
                  src={heroContent.image}
                  alt={heroContent.imageAlt}
                  width={1600}
                  height={900}
                  fetchPriority="high"
                  decoding="async"
                  className="media-img"
                  data-hero-img
                />
              </div>
              <figcaption className="media-caption" data-hero-reveal>
                {heroContent.caption}
              </figcaption>
            </figure>
          </div>
        </section>

        {/* 2. PHILOSOPHY */}
        <section
          id="philosophy"
          className="section section-white section-philosophy"
          aria-labelledby="philosophy-headline"
        >
          <div className="container philosophy-grid">
            <figure className="philosophy-media">
              <div className="media-frame media-frame-philosophy" data-media-reveal>
                <img
                  src={philosophyContent.image}
                  alt={philosophyContent.imageAlt}
                  width={1200}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className="media-img"
                />
              </div>
            </figure>

            <div className="philosophy-copy" data-reveal>
              <p className="eyebrow">{philosophyContent.eyebrow}</p>
              <h2 id="philosophy-headline" className="section-headline">
                {philosophyContent.headline.split('\n').map((line, i) => (
                  <span key={line} className="headline-line">
                    {i > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
              </h2>

              <div className="body-stack">
                {philosophyContent.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="body-copy">
                    {paragraph}
                  </p>
                ))}
              </div>

              <dl className="metrics-strip">
                {philosophyContent.metrics.map((metric) => (
                  <div key={metric.label} className="metric-item">
                    <dt className="metric-label">{metric.label}</dt>
                    <dd className="metric-value">{metric.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* 3. MATERIALITY */}
        <section
          id="materiality"
          className="section section-ivory section-materiality"
          aria-labelledby="materiality-headline"
        >
          <div className="container">
            <div className="section-header-split" data-reveal>
              <div>
                <p className="eyebrow">{materialityContent.eyebrow}</p>
                <h2 id="materiality-headline" className="section-headline">
                  {materialityContent.headline}
                </h2>
              </div>
              <p className="section-intro">{materialityContent.intro}</p>
            </div>

            <ol className="materiality-triptych">
              {materialityContent.materials.map((material, index) => (
                <li
                  key={material.name}
                  className={`material-study${index === 1 ? ' is-offset' : ''}`}
                >
                  <div className="media-frame media-frame-portrait" data-media-reveal>
                    <img
                      src={material.image}
                      alt={material.alt}
                      width={900}
                      height={1200}
                      loading="lazy"
                      decoding="async"
                      className="media-img media-img-interactive"
                    />
                  </div>
                  <div className="material-copy" data-reveal>
                    <div className="material-meta">
                      <span className="material-index" aria-hidden="true">
                        {material.index}
                      </span>
                      <span className="material-role">{material.role}</span>
                    </div>
                    <h3 className="material-name">{material.name}</h3>
                    <p className="material-description">{material.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 4. DESIGN ANATOMY (Scroll-Controlled Production Assembly) */}
        <DesignAnatomySection />

        {/* 5. SPATIAL EXPERIENCE */}
        <section
          id="space"
          className="section section-white section-spatial"
          aria-labelledby="spatial-headline"
        >
          <div className="container">
            <div className="section-header-split section-header-compact" data-reveal>
              <div>
                <p className="eyebrow">{spatialContent.eyebrow}</p>
                <h2 id="spatial-headline" className="section-headline">
                  {spatialContent.headline}
                </h2>
              </div>
              <p className="section-intro">{spatialContent.intro}</p>
            </div>
          </div>

          <figure className="spatial-bleed-figure">
            <div className="media-frame media-frame-spatial" data-media-reveal>
              <img
                src={spatialContent.image}
                alt={spatialContent.imageAlt}
                width={1600}
                height={900}
                loading="lazy"
                decoding="async"
                className="media-img media-img-parallax"
                data-parallax-img
              />
            </div>
          </figure>

          <div className="container">
            <div className="spatial-notes" data-reveal>
              {spatialContent.notes.map((note) => (
                <div key={note.title} className="spatial-note">
                  <h3 className="spatial-note-title">{note.title}</h3>
                  <p className="body-copy">{note.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. CLOSING */}
        <section
          id="closing"
          ref={closingRef}
          className="section section-charcoal section-closing"
          aria-labelledby="closing-headline"
        >
          <div className="container">
            <div className="closing-header" data-reveal>
              <p className="eyebrow eyebrow-on-dark">{closingContent.eyebrow}</p>
              <h2 id="closing-headline" className="closing-headline">
                {closingContent.headline}
              </h2>
              <p className="closing-supporting">{closingContent.supportingLine}</p>
            </div>

            <figure className="closing-figure">
              <div className="media-frame media-frame-closing" data-media-reveal>
                <img
                  src={closingContent.image}
                  alt={closingContent.imageAlt}
                  width={1600}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className="media-img"
                />
              </div>
            </figure>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <p className="footer-wordmark">{footerContent.wordmark}</p>
            <p className="footer-tagline">{footerContent.tagline}</p>
          </div>

          <nav className="footer-nav" aria-label="Footer">
            <ul className="footer-nav-list">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <a className="footer-link" href={`#${item.id}`}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-meta">
            <p className="footer-notice">{footerContent.prototypeNotice}</p>
            <div className="footer-bottom-row">
              <p className="footer-colophon">{footerContent.colophon}</p>
              <a className="footer-top-link" href="#top">
                {closingContent.ctaLabel}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
