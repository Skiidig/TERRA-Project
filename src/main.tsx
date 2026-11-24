import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SceneViewport } from './SceneViewport'
import './style.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main>
      <h1>TERRA</h1>
      <p>Where architecture meets nature.</p>
      <SceneViewport />
    </main>
  </StrictMode>,
)
