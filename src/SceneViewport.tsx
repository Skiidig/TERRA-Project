import { OrbitControls } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Component, useCallback, useEffect, useRef, useState } from 'react'
import type { ComponentRef, ReactNode } from 'react'
import { PerspectiveCamera, Spherical, Vector3 } from 'three'
import { stageContent } from './content/editorial'
import { VillaBlockout } from './VillaBlockout'

type Orbit = ComponentRef<typeof OrbitControls>
export type SceneMode = 'browse' | 'explore'

const MIN_DISTANCE = 18
const MAX_DISTANCE = 62
const ROTATE_STEP_RAD = Math.PI / 6
const ZOOM_IN_FACTOR = 0.84
const ZOOM_OUT_FACTOR = 1.19

function SceneFallback() {
  return (
    <div className="scene-fallback" role="status">
      <p className="scene-fallback-eyebrow">WebGL 2 Required</p>
      <p className="scene-fallback-title">The interactive 3D diorama is unavailable.</p>
      <p className="scene-fallback-body">
        This preview requires a working WebGL 2 graphics context. The complete architectural
        study, materiality notes, and conceptual specifications remain available below.
      </p>
    </div>
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

function SceneController({
  onLoss,
  onBindInvalidate,
}: {
  onLoss: () => void
  onBindInvalidate: (fn: (() => void) | null) => void
}) {
  const gl = useThree((state) => state.gl)
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    onBindInvalidate(invalidate)
    return () => onBindInvalidate(null)
  }, [invalidate, onBindInvalidate])

  useEffect(() => {
    const canvas = gl.domElement
    canvas.addEventListener('webglcontextlost', onLoss)
    return () => canvas.removeEventListener('webglcontextlost', onLoss)
  }, [gl, onLoss])

  useEffect(() => {
    // Keep the full 24x18m plinth and palm crowns unclipped on narrow portrait viewports.
    if (!(camera instanceof PerspectiveCamera) || size.height <= 0) return
    const aspect = size.width / size.height
    const targetFov = aspect < 1.2 ? Math.min(54, 37 * (1.2 / Math.max(aspect, 0.72))) : 37
    if (Math.abs(camera.fov - targetFov) > 0.1) {
      camera.fov = targetFov
      camera.updateProjectionMatrix()
      invalidate()
    }
  }, [camera, invalidate, size.height, size.width])

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

interface SceneViewportProps {
  mode: SceneMode
  onModeChange: (nextMode: SceneMode) => void
  onAvailabilityChange: (available: boolean) => void
}

export function SceneViewport({ mode, onModeChange, onAvailabilityChange }: SceneViewportProps) {
  const orbit = useRef<Orbit | null>(null)
  const invalidateRef = useRef<(() => void) | null>(null)
  const exploreBtnRef = useRef<HTMLButtonElement | null>(null)
  const rotateBtnRef = useRef<HTMLButtonElement | null>(null)
  const [ready, setReady] = useState(false)
  const [contextLost, setContextLost] = useState(false)

  const handleContextLoss = useCallback(() => {
    setContextLost(true)
    onModeChange('browse')
  }, [onModeChange])

  const bindInvalidate = useCallback((fn: (() => void) | null) => {
    invalidateRef.current = fn
  }, [])

  const bindOrbit = useCallback((controls: Orbit | null) => {
    orbit.current = controls
    controls?.saveState()
    setReady(controls !== null)
  }, [])

  const unavailable = !ready || contextLost
  const isExploring = mode === 'explore' && !unavailable

  useEffect(() => {
    onAvailabilityChange(!unavailable)
  }, [onAvailabilityChange, unavailable])

  useEffect(() => {
    if (!isExploring) return

    rotateBtnRef.current?.focus({ preventScroll: true })

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onModeChange('browse')
        requestAnimationFrame(() => exploreBtnRef.current?.focus())
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isExploring, onModeChange])

  function applySphericalDelta(deltaTheta: number, distanceMultiplier: number) {
    const controls = orbit.current
    if (!controls) return

    const camera = controls.object
    const offset = new Vector3().copy(camera.position).sub(controls.target)
    const spherical = new Spherical().setFromVector3(offset)

    spherical.theta += deltaTheta
    spherical.radius = Math.min(
      MAX_DISTANCE,
      Math.max(MIN_DISTANCE, spherical.radius * distanceMultiplier),
    )

    offset.setFromSpherical(spherical)
    camera.position.copy(controls.target).add(offset)

    const previousDamping = controls.enableDamping
    controls.enableDamping = false
    controls.update()
    controls.enableDamping = previousDamping
    invalidateRef.current?.()
  }

  function resetView() {
    const controls = orbit.current
    if (!controls) return

    // Consume any remaining drag inertia before restoring the saved pose.
    controls.enableDamping = false
    controls.update()
    controls.reset()
    controls.enableDamping = true
    invalidateRef.current?.()
  }

  return (
    <section
      id="scene-stage"
      className="stage-section"
      aria-labelledby="scene-heading"
    >
      <div
        className={`scene-viewport ${isExploring ? 'is-exploring' : 'is-browsing'}`}
        aria-describedby="scene-description scene-mode-status"
      >
        {contextLost ? (
          <SceneFallback />
        ) : (
          <SceneBoundary>
            <Canvas
              aria-hidden="true"
              className="scene-canvas"
              camera={{ position: [23, 18, 28], fov: 37, near: 0.5, far: 120 }}
              dpr={[1, 1.5]}
              frameloop="demand"
              gl={{ alpha: false, antialias: true, powerPreference: 'default' }}
              shadows="percentage"
            >
              <SceneController
                onLoss={handleContextLoss}
                onBindInvalidate={bindInvalidate}
              />
              <VillaLighting />
              <VillaBlockout />
              <OrbitControls
                ref={bindOrbit}
                enabled={isExploring}
                target={[0, 0.9, 0]}
                enableDamping
                dampingFactor={0.12}
                enablePan={false}
                enableZoom={isExploring}
                enableRotate={isExploring}
                minDistance={MIN_DISTANCE}
                maxDistance={MAX_DISTANCE}
                minPolarAngle={0.2}
                maxPolarAngle={1.48}
              />
            </Canvas>
          </SceneBoundary>
        )}
      </div>

      <div className="stage-bar">
        <div className="container stage-bar-inner">
          <div className="stage-meta">
            <h2 id="scene-heading" className="sr-only">
              {stageContent.title}
            </h2>
            <p id="scene-description" className="sr-only">
              {stageContent.description}
            </p>
            <span className="stage-mode-indicator" aria-hidden="true" data-mode={isExploring ? 'explore' : 'browse'} />
            <p id="scene-mode-status" className="stage-status" role="status" aria-live="polite">
              {unavailable
                ? '3D diorama controls unavailable.'
                : isExploring
                  ? stageContent.exploreStatus
                  : stageContent.browseStatus}
            </p>
          </div>

          <div className="stage-controls" role="group" aria-label="3D diorama camera controls">
            {!isExploring ? (
              <button
                ref={exploreBtnRef}
                type="button"
                className="btn btn-primary"
                onClick={() => onModeChange('explore')}
                disabled={unavailable}
              >
                Explore 3D
              </button>
            ) : (
              <>
                <div className="stage-control-cluster" role="group" aria-label="Rotate and zoom camera">
                  <button
                    ref={rotateBtnRef}
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => applySphericalDelta(-ROTATE_STEP_RAD, 1)}
                    aria-label="Rotate view left"
                  >
                    Rotate left
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => applySphericalDelta(ROTATE_STEP_RAD, 1)}
                    aria-label="Rotate view right"
                  >
                    Rotate right
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => applySphericalDelta(0, ZOOM_IN_FACTOR)}
                    aria-label="Zoom in"
                  >
                    Zoom in
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => applySphericalDelta(0, ZOOM_OUT_FACTOR)}
                    aria-label="Zoom out"
                  >
                    Zoom out
                  </button>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetView}
                >
                  Reset view
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    onModeChange('browse')
                    requestAnimationFrame(() => exploreBtnRef.current?.focus())
                  }}
                >
                  Done exploring
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
