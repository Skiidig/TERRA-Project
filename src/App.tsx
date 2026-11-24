import { useState } from 'react'
import {
  conceptSection,
  footerContent,
  heroContent,
  materialitySection,
  navigationItems,
  specificationsSection,
} from './content/editorial'
import { SceneViewport } from './SceneViewport'
import type { SceneMode } from './SceneViewport'

export function App() {
  const [sceneMode, setSceneMode] = useState<SceneMode>('browse')
  const [sceneAvailable, setSceneAvailable] = useState(false)

  function handleExploreFromHero() {
    setSceneMode('explore')
    const stage = document.getElementById('scene-stage')
    if (!stage) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    stage.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' })
  }

  return (
    <div className="page-shell" id="top">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="site-header">
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
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section id="pavilion" className="hero-section" aria-labelledby="hero-title">
          <div className="container hero-grid">
            <div className="hero-heading-col">
              <p className="eyebrow">{heroContent.eyebrow}</p>
              <h1 id="hero-title" className="hero-title">
                {heroContent.tagline}
              </h1>
            </div>
            <div className="hero-lead-col">
              <p className="hero-lead">{heroContent.lead}</p>
              <div className="hero-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleExploreFromHero}
                  disabled={!sceneAvailable}
                >
                  {heroContent.primaryCta}
                </button>
              </div>
            </div>
          </div>
        </section>

        <SceneViewport mode={sceneMode} onModeChange={setSceneMode} onAvailabilityChange={setSceneAvailable} />

        <section id="concept" className="editorial-section" aria-labelledby="concept-heading">
          <div className="container concept-grid">
            <div className="concept-header-col">
              <p className="eyebrow">{conceptSection.eyebrow}</p>
              <h2 id="concept-heading" className="section-heading">
                {conceptSection.heading}
              </h2>
              <p className="section-intro">{conceptSection.intro}</p>
            </div>

            <ol className="principles-list">
              {conceptSection.principles.map((principle) => (
                <li key={principle.index} className="principle-item">
                  <span className="principle-index" aria-hidden="true">
                    {principle.index}
                  </span>
                  <div className="principle-copy">
                    <h3 className="principle-title">{principle.title}</h3>
                    <p className="principle-body">{principle.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="materials"
          className="editorial-section section-tinted"
          aria-labelledby="materials-heading"
        >
          <div className="container">
            <div className="section-header-split">
              <div>
                <p className="eyebrow">{materialitySection.eyebrow}</p>
                <h2 id="materials-heading" className="section-heading">
                  {materialitySection.heading}
                </h2>
              </div>
              <p className="section-intro">{materialitySection.intro}</p>
            </div>

            <ul className="materials-ledger">
              {materialitySection.materials.map((material) => (
                <li key={material.name} className="material-entry">
                  <div className="material-swatch-frame" aria-hidden="true">
                    <span
                      className="material-swatch"
                      style={{ backgroundColor: material.swatch }}
                    />
                    {material.secondarySwatch ? (
                      <span
                        className="material-swatch material-swatch-secondary"
                        style={{ backgroundColor: material.secondarySwatch }}
                      />
                    ) : null}
                  </div>
                  <p className="material-role">{material.role}</p>
                  <h3 className="material-name">{material.name}</h3>
                  <p className="material-description">{material.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="specifications"
          className="editorial-section"
          aria-labelledby="specifications-heading"
        >
          <div className="container specs-grid">
            <div className="specs-header-col">
              <p className="eyebrow">{specificationsSection.eyebrow}</p>
              <h2 id="specifications-heading" className="section-heading">
                {specificationsSection.heading}
              </h2>
              <p className="section-intro">{specificationsSection.intro}</p>
            </div>

            <dl className="specs-ledger">
              {specificationsSection.items.map((item) => (
                <div key={item.label} className="spec-row">
                  <dt className="spec-label">{item.label}</dt>
                  <dd className="spec-value">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-identity">
            <p className="footer-wordmark">{footerContent.wordmark}</p>
            <p className="footer-tagline">{footerContent.tagline}</p>
          </div>
          <p className="footer-colophon">{footerContent.colophon}</p>
          <a className="footer-top-link" href="#top">
            {footerContent.backToTopLabel}
          </a>
        </div>
      </footer>
    </div>
  )
}
