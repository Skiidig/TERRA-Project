import { OrbitControls } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Component, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ComponentRef, ReactNode } from 'react'
import { PerspectiveCamera, Spherical, Vector3 } from 'three'
import { flushOrbitDamping, STORY_MEDIA, storyPoses, useCinematicCamera } from './cinematicCamera'
import { stageContent } from './content/editorial'
import { VillaBlockout } from './VillaBlockout'

type Orbit = ComponentRef<typeof OrbitControls>
export type SceneMode = 'browse' | 'explore'

const MIN_DISTANCE = 18
const MAX_DISTANCE = 62
const ROTATE_STEP_RAD = Math.PI / 6
const ZOOM_IN_FACTOR = 0.84
const ZOOM_OUT_FACTOR = 1.19
const arrivalCamera = { position: storyPoses[0].position, fov: 37, near: 0.5, far: 120 }

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
  orbit,
  exploring,
  onChapter,
  onLoss,
  onBindInvalidate,
}: {
  orbit: Orbit | null
  exploring: boolean
  onChapter: (chapter: number) => void
  onLoss: () => void
  onBindInvalidate: (fn: (() => void) | null) => void
}) {
  const gl = useThree((state) => state.gl)
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const invalidate = useThree((state) => state.invalidate)

  useCinematicCamera(camera, orbit, exploring, invalidate, onChapter)

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
    // The desktop story column is narrower than the full-bleed compact stage.
    if (!(camera instanceof PerspectiveCamera) || size.height <= 0) return
    const aspect = size.width / size.height
    const fitAspect = window.matchMedia(STORY_MEDIA).matches ? 1.55 : 1.2
    const targetFov = Math.min(54, 37 * Math.max(1, fitAspect / Math.max(aspect, 0.72)))
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
  const [orbit, bindOrbit] = useState<Orbit | null>(null)
  const [chapter, setChapter] = useState(0)
  const invalidateRef = useRef<(() => void) | null>(null)
  const exploreBtnRef = useRef<HTMLButtonElement | null>(null)
  const rotateBtnRef = useRef<HTMLButtonElement | null>(null)
  const restoreFocus = useRef(false)
  const [contextLost, setContextLost] = useState(false)

  const handleContextLoss = useCallback(() => {
    setContextLost(true)
    onModeChange('browse')
  }, [onModeChange])

  const bindInvalidate = useCallback((fn: (() => void) | null) => {
    invalidateRef.current = fn
  }, [])

  const unavailable = !orbit || contextLost
  const isExploring = mode === 'explore' && !unavailable

  useEffect(() => {
    onAvailabilityChange(!unavailable)
  }, [onAvailabilityChange, unavailable])

  const leaveExplore = useCallback(() => {
    restoreFocus.current = true
    onModeChange('browse')
  }, [onModeChange])

  useLayoutEffect(() => {
    if (isExploring) {
      rotateBtnRef.current?.focus({ preventScroll: true })
    } else if (restoreFocus.current) {
      restoreFocus.current = false
      exploreBtnRef.current?.focus({ preventScroll: true })
    }
  }, [isExploring])

  useEffect(() => {
    if (!isExploring) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        leaveExplore()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isExploring, leaveExplore])

  function applySphericalDelta(deltaTheta: number, distanceMultiplier: number) {
    const controls = orbit
    if (!controls?.enabled) return

    flushOrbitDamping(controls)

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

    controls.update()
    invalidateRef.current?.()
  }

  function resetView() {
    const controls = orbit
    if (!controls?.enabled) return

    flushOrbitDamping(controls)
    controls.reset()
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
              camera={arrivalCamera}
              dpr={[1, 1.5]}
              frameloop="demand"
              gl={{ alpha: false, antialias: true, powerPreference: 'default' }}
              shadows="percentage"
            >
              <SceneController
                orbit={orbit}
                exploring={isExploring}
                onChapter={setChapter}
                onLoss={handleContextLoss}
                onBindInvalidate={bindInvalidate}
              />
              <VillaLighting />
              <VillaBlockout />
              <OrbitControls
                ref={bindOrbit}
                enabled={false}
                enableDamping
                dampingFactor={0.12}
                enablePan={false}
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
            {!unavailable && !isExploring && (
              <p className="stage-chapter">0{chapter + 1} / {storyPoses[chapter].title}</p>
            )}
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
                  title="Restore the view you entered Explore with"
                >
                  Reset view
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={leaveExplore}
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
