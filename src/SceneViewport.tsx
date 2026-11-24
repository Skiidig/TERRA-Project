import { OrbitControls } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Component, useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ComponentRef } from 'react'
import { VillaBlockout } from './VillaBlockout'

type Orbit = ComponentRef<typeof OrbitControls>

function SceneFallback() {
  return (
    <p className="scene-fallback" role="status">
      The 3D preview is unavailable. It needs a working WebGL 2 context.
      Check your browser’s graphics support and reload to try again.
    </p>
  )
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? <SceneFallback /> : this.props.children
  }
}

function ContextMonitor({ onLoss }: { onLoss: () => void }) {
  const canvas = useThree((state) => state.gl.domElement)

  useEffect(() => {
    canvas.addEventListener('webglcontextlost', onLoss)
    return () => canvas.removeEventListener('webglcontextlost', onLoss)
  }, [canvas, onLoss])

  return null
}

function VillaLighting() {
  return (
    <>
      <color attach="background" args={['#e5ded1']} />
      <hemisphereLight args={['#f0f4ff', '#b9a38a', 1.45]} />
      <directionalLight
        color="#fff1db"
        position={[-19, 30, 15]}
        intensity={2}
        castShadow
        shadow-mapSize={[1536, 1536]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={0.5}
        shadow-camera-far={65}
        shadow-bias={-0.00012}
        shadow-normalBias={0.035}
        shadow-intensity={0.87}
        shadow-radius={2.6}
      />
    </>
  )
}

export function SceneViewport() {
  const orbit = useRef<Orbit | null>(null)
  const [ready, setReady] = useState(false)
  const [contextLost, setContextLost] = useState(false)
  const handleContextLoss = useCallback(() => setContextLost(true), [])

  const bindOrbit = useCallback((controls: Orbit | null) => {
    orbit.current = controls
    controls?.saveState()
    setReady(controls !== null)
  }, [])

  function resetView() {
    const controls = orbit.current
    if (!controls) return

    // Consume any remaining drag inertia before restoring the saved pose.
    controls.enableDamping = false
    controls.update()
    controls.reset()
    controls.enableDamping = true
  }

  return (
    <section aria-labelledby="scene-heading">
      <h2 id="scene-heading">Tropical Modern Villa</h2>
      <p id="scene-description">
        A single-story villa with a flat roof, glazed walls, a shaded terrace, and a pool.
        Drag to orbit. Scroll over the scene or pinch to zoom.
      </p>
      <div className="scene-viewport" aria-describedby="scene-description">
        {contextLost ? <SceneFallback /> : (
          <SceneBoundary>
            <Canvas
              aria-hidden="true"
              camera={{ position: [23, 18, 28], fov: 37, near: 0.5, far: 120 }}
              dpr={[1, 1.5]}
              frameloop="demand"
              gl={{ alpha: false, antialias: true, powerPreference: 'default' }}
              shadows="percentage"
            >
              <ContextMonitor onLoss={handleContextLoss} />
              <VillaLighting />
              <VillaBlockout />
              <OrbitControls
                ref={bindOrbit}
                target={[0, 0.9, 0]}
                enableDamping
                dampingFactor={0.12}
                enablePan={false}
                minDistance={18}
                maxDistance={62}
                minPolarAngle={0.2}
                maxPolarAngle={1.48}
              />
            </Canvas>
          </SceneBoundary>
        )}
      </div>
      <button type="button" onClick={resetView} disabled={!ready || contextLost}>
        Reset view
      </button>
    </section>
  )
}
