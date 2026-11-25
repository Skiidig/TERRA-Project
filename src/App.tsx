import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  anatomyContent,
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
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeLayerId, setActiveLayerId] = useState<string>(anatomyContent.layers[0].id)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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
      gsap.from('[data-hero-reveal]', {
        opacity: 0,
        y: 16,
        duration: 0.85,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      })

      gsap.from('[data-hero-media]', {
        opacity: 0,
        scale: 1.03,
        duration: 1.05,
        delay: 0.14,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      })

      const revealGroups = gsap.utils.toArray<HTMLElement>('[data-reveal]')
      revealGroups.forEach((element) => {
        gsap.from(element, {
          opacity: 0,
          y: 22,
          duration: 0.8,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: element,
            start: 'top 86%',
            once: true,
          },
        })
      })

      const mm = gsap.matchMedia()
      mm.add('(min-width: 64rem)', () => {
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
                scrub: true,
              },
            },
          )
        })
      })
    }, root)

    return () => ctx.revert()
  }, [])

  const activeLayer =
    anatomyContent.layers.find((layer) => layer.id === activeLayerId) ?? anatomyContent.layers[0]

  function handleNavClick() {
    setMenuOpen(false)
  }

  return (
    <div className="page-shell" id="top" ref={rootRef}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
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
              <div className="media-frame media-frame-hero" data-hero-media>
                <img
                  src={heroContent.image}
                  alt={heroContent.imageAlt}
                  width={1600}
                  height={900}
                  fetchPriority="high"
                  decoding="async"
                  className="media-img"
                />
              </div>
              <figcaption className="media-caption">{heroContent.caption}</figcaption>
            </figure>
          </div>
        </section>

        {/* 2. PHILOSOPHY */}
        <section
          id="philosophy"
          className="section section-white"
          aria-labelledby="philosophy-headline"
        >
          <div className="container philosophy-grid">
            <figure className="philosophy-media" data-reveal>
              <div className="media-frame media-frame-philosophy">
                <img
                  src={philosophyContent.image}
                  alt={philosophyContent.imageAlt}
                  width={1200}
                  height={900}
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
          className="section section-ivory"
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
                  data-reveal
                >
                  <div className="media-frame media-frame-portrait">
                    <img
                      src={material.image}
                      alt={material.alt}
                      width={900}
                      height={1200}
                      decoding="async"
                      className="media-img"
                    />
                  </div>
                  <div className="material-meta">
                    <span className="material-index" aria-hidden="true">
                      {material.index}
                    </span>
                    <span className="material-role">{material.role}</span>
                  </div>
                  <h3 className="material-name">{material.name}</h3>
                  <p className="material-description">{material.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 4. DESIGN ANATOMY */}
        <section
          id="anatomy"
          className="section section-stone"
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

            <div className="anatomy-stage" data-reveal>
              <figure className="anatomy-figure">
                <div className="media-frame media-frame-anatomy">
                  <img
                    src={anatomyContent.image}
                    alt={anatomyContent.imageAlt}
                    width={1600}
                    height={900}
                    decoding="async"
                    className="media-img"
                  />
                </div>
                <figcaption className="anatomy-caption">
                  <span className="anatomy-caption-dot" aria-hidden="true" />
                  <span>{anatomyContent.placeholderNote}</span>
                </figcaption>
              </figure>

              <div className="anatomy-inspector">
                <div
                  className="anatomy-layer-list"
                  role="tablist"
                  aria-label="Architectural anatomy layers"
                >
                  {anatomyContent.layers.map((layer) => {
                    const isSelected = layer.id === activeLayer.id
                    return (
                      <button
                        key={layer.id}
                        type="button"
                        role="tab"
                        id={`anatomy-tab-${layer.id}`}
                        aria-selected={isSelected}
                        aria-controls={`anatomy-panel-${layer.id}`}
                        className={`anatomy-layer-btn${isSelected ? ' is-active' : ''}`}
                        onClick={() => setActiveLayerId(layer.id)}
                      >
                        <span className="anatomy-layer-index">{layer.index}</span>
                        <span className="anatomy-layer-title">{layer.title}</span>
                      </button>
                    )
                  })}
                </div>

                <div
                  id={`anatomy-panel-${activeLayer.id}`}
                  role="tabpanel"
                  aria-labelledby={`anatomy-tab-${activeLayer.id}`}
                  className="anatomy-detail-panel"
                >
                  <p className="anatomy-detail-spec">{activeLayer.specification}</p>
                  <p className="anatomy-detail-summary">{activeLayer.summary}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SPATIAL EXPERIENCE */}
        <section
          id="space"
          className="section section-white section-spatial"
          aria-labelledby="spatial-headline"
        >
          <div className="container">
            <div className="section-header-split" data-reveal>
              <div>
                <p className="eyebrow">{spatialContent.eyebrow}</p>
                <h2 id="spatial-headline" className="section-headline">
                  {spatialContent.headline}
                </h2>
              </div>
              <p className="section-intro">{spatialContent.intro}</p>
            </div>
          </div>

          <figure className="spatial-bleed-figure" data-reveal>
            <div className="media-frame media-frame-spatial">
              <img
                src={spatialContent.image}
                alt={spatialContent.imageAlt}
                width={1600}
                height={900}
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

            <figure className="closing-figure" data-reveal>
              <div className="media-frame media-frame-closing">
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
