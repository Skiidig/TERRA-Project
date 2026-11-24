import { OrbitControls } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Component, useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ComponentRef } from 'react'

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

function TestScene() {
  return (
    <>
      <color attach="background" args={['#e7dfd3']} />
      <ambientLight intensity={0.65} />
      <directionalLight
        position={[-3, 7, 4]}
        intensity={2.3}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={0.5}
        shadow-camera-far={16}
        shadow-normalBias={0.025}
      />
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[6, 0.3, 4]} />
        <meshStandardMaterial color="#a79781" roughness={0.9} />
      </mesh>
      <mesh position={[-0.85, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 1.44, 1.6]} />
        <meshStandardMaterial color="#d4c4ac" roughness={0.78} />
      </mesh>
      <mesh position={[1.32, 0.58, 0.55]} castShadow receiveShadow>
        <sphereGeometry args={[0.58, 24, 16]} />
        <meshStandardMaterial color="#84664e" roughness={0.45} />
      </mesh>
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
      <h2 id="scene-heading">3D test scene</h2>
      <p id="scene-description">
        A rectangular platform, box, and sphere under directional light.
        Drag to orbit. Scroll over the scene or pinch to zoom.
      </p>
      <div className="scene-viewport" aria-describedby="scene-description">
        {contextLost ? <SceneFallback /> : (
          <SceneBoundary>
            <Canvas
              aria-hidden="true"
              camera={{ position: [6, 4.5, 7], fov: 44, near: 0.1, far: 50 }}
              dpr={[1, 1.5]}
              frameloop="demand"
              gl={{ alpha: false, antialias: true, powerPreference: 'default' }}
              shadows="percentage"
            >
              <ContextMonitor onLoss={handleContextLoss} />
              <TestScene />
              <OrbitControls
                ref={bindOrbit}
                target={[0, 0.55, 0]}
                enableDamping
                dampingFactor={0.12}
                enablePan={false}
                minDistance={5}
                maxDistance={15}
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
