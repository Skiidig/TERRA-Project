import { useLayoutEffect, useMemo, useRef } from 'react'
import { Object3D, Shape } from 'three'
import type { InstancedMesh, Vector3Tuple } from 'three'

const site = { width: 24, depth: 18, thickness: 0.4 }
const villa = {
  width: 16,
  depth: 8,
  front: 0.75,
  floorHeight: 0.25,
  clearHeight: 3.2,
  roofThickness: 0.3,
  overhang: 1,
}
const terraceDepth = 3
const terraceHeight = 0.12
const pool = { width: 10, depth: 3.5, x: 2, front: 7.5, base: -0.32 }
const back = villa.front - villa.depth
const centerZ = (villa.front + back) / 2
const halfWidth = villa.width / 2
const roofSoffit = villa.floorHeight + villa.clearHeight
const wallCenter = villa.floorHeight + villa.clearHeight / 2
const poolZ = pool.front - pool.depth / 2
const wallThickness = 0.22

const palette = {
  concrete: '#c7c0b2',
  roof: '#dbd5c8',
  slab: '#b6aa98',
  terrace: '#bfb4a1',
  ground: '#a9a18f',
  landscape: '#78836a',
  frame: '#494c43',
  timber: '#936645',
  glass: '#476f72',
  liner: '#6c8790',
  water: '#548b9a',
}

function Block({ size, position, color, castShadow = true }: {
  size: Vector3Tuple
  position: Vector3Tuple
  color: string
  castShadow?: boolean
}) {
  return (
    <mesh position={position} castShadow={castShadow} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.88} />
    </mesh>
  )
}

function Site() {
  const ground = useMemo(() => {
    const outline = new Shape()
    const x = site.width / 2
    const z = site.depth / 2
    outline.moveTo(-x, -z)
    outline.lineTo(x, -z)
    outline.lineTo(x, z)
    outline.lineTo(-x, z)
    outline.closePath()
    const opening = new Shape()
    const left = pool.x - pool.width / 2
    const right = pool.x + pool.width / 2
    // The extrusion is rotated onto XZ, so the shape's Y axis maps to -Z.
    opening.moveTo(left, -pool.front)
    opening.lineTo(left, pool.depth - pool.front)
    opening.lineTo(right, pool.depth - pool.front)
    opening.lineTo(right, -pool.front)
    opening.closePath()
    outline.holes.push(opening)
    return outline
  }, [])

  return (
    <group name="Site">
      <Block size={[site.width, site.thickness + pool.base, site.depth]}
        position={[0, (pool.base - site.thickness) / 2, 0]} color={palette.ground} castShadow={false} />
      <mesh position={[0, pool.base, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <extrudeGeometry args={[ground, { depth: -pool.base, bevelEnabled: false }]} />
        <meshStandardMaterial color={palette.ground} roughness={0.92} />
      </mesh>
      <group name="Landscape zones">
        <Block size={[2.7, 0.04, 15.5]} position={[-10.1, 0.02, -0.3]} color={palette.landscape} castShadow={false} />
        <Block size={[2.65, 0.04, 15.5]} position={[10.05, 0.02, -0.3]} color={palette.landscape} castShadow={false} />
        <Block size={[4.2, 0.04, 3.5]} position={[-5.9, 0.02, 5.75]} color={palette.landscape} castShadow={false} />
      </group>
    </group>
  )
}

// Each wall opening owns its frame and panes. Local X runs across the opening.
function GlazedOpening({ position, rotation = 0, width, height, bays }: {
  position: Vector3Tuple
  rotation?: number
  width: number
  height: number
  bays: number
}) {
  const rail = 0.075
  const bayWidth = (width - rail) / bays

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Block size={[width, rail, 0.1]} position={[0, rail / 2, 0]} color={palette.frame} />
      <Block size={[width, rail, 0.1]} position={[0, height - rail / 2, 0]} color={palette.frame} />
      {Array.from({ length: bays + 1 }, (_, i) => (
        <Block key={i} size={[rail, height - 2 * rail, 0.1]}
          position={[-width / 2 + rail / 2 + i * bayWidth, height / 2, 0]} color={palette.frame} />
      ))}
      {Array.from({ length: bays }, (_, i) => (
        <mesh key={i} position={[-width / 2 + rail / 2 + (i + 0.5) * bayWidth, height / 2, 0]} receiveShadow>
          <boxGeometry args={[bayWidth - rail, height - 2 * rail, 0.035]} />
          <meshStandardMaterial color={palette.glass} roughness={0.35} transparent opacity={0.48} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

function TimberScreen() {
  const slats = useRef<InstancedMesh>(null)
  const count = 13
  const pitch = 0.205

  useLayoutEffect(() => {
    const mesh = slats.current
    if (!mesh) return

    const slat = new Object3D()
    for (let i = 0; i < count; i += 1) {
      slat.position.x = (i - (count - 1) / 2) * pitch
      slat.updateMatrix()
      mesh.setMatrixAt(i, slat.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [])

  return (
    <instancedMesh ref={slats} args={[undefined, undefined, count]}
      position={[-3.53, (terraceHeight + roofSoffit) / 2, 1.3]} castShadow receiveShadow>
      <boxGeometry args={[0.085, roofSoffit - terraceHeight, 0.19]} />
      <meshStandardMaterial color={palette.timber} roughness={0.8} />
    </instancedMesh>
  )
}

function Pool() {
  const coping = 0.22
  const liner = 0.045

  return (
    <group name="Pool" position={[pool.x, 0, poolZ]}>
      <Block size={[pool.width, 0.04, pool.depth]} position={[0, pool.base + 0.02, 0]} color={palette.liner} castShadow={false} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Block size={[pool.width + 2 * coping, 0.065, coping]} position={[0, 0.0325, side * (pool.depth + coping) / 2]} color={palette.terrace} />
          <Block size={[coping, 0.065, pool.depth]} position={[side * (pool.width + coping) / 2, 0.0325, 0]} color={palette.terrace} />
          <Block size={[pool.width, -pool.base, liner]} position={[0, pool.base / 2, side * (pool.depth - liner) / 2]} color={palette.liner} castShadow={false} />
          <Block size={[liner, -pool.base, pool.depth - 2 * liner]} position={[side * (pool.width - liner) / 2, pool.base / 2, 0]} color={palette.liner} castShadow={false} />
        </group>
      ))}
      <mesh name="Static water" position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[pool.width - 2 * liner, pool.depth - 2 * liner]} />
        <meshStandardMaterial color={palette.water} roughness={0.31} />
      </mesh>
    </group>
  )
}

export function VillaBlockout() {
  const frontOpening = { left: -5, right: 6.4 }
  const sideOpening = { back: -4.65, front: villa.front - wallThickness }
  const rearOpening = { left: -2.4, right: 1.8, sill: 1.56, height: 1.15 }
  const sideX = halfWidth - wallThickness / 2
  const frontWallZ = villa.front - wallThickness / 2
  const backWallZ = back + wallThickness / 2
  const rearOpeningWidth = rearOpening.right - rearOpening.left
  const rearOpeningX = (rearOpening.left + rearOpening.right) / 2
  const rearSillHeight = rearOpening.sill - villa.floorHeight
  const rearHeadHeight = roofSoffit - rearOpening.sill - rearOpening.height

  return (
    <group name="TERRA Villa Blockout">
      <Site />
      <group name="Foundation">
        <Block size={[villa.width, villa.floorHeight, villa.depth]}
          position={[0, villa.floorHeight / 2, centerZ]} color={palette.slab} />
      </group>
      <group name="Walls">
        <Block size={[wallThickness, villa.clearHeight, villa.depth]}
          position={[-sideX, wallCenter, centerZ]} color={palette.concrete} />
        <Block size={[frontOpening.left + halfWidth - wallThickness, villa.clearHeight, wallThickness]}
          position={[(frontOpening.left - halfWidth + wallThickness) / 2, wallCenter, frontWallZ]} color={palette.concrete} />
        <Block size={[halfWidth - frontOpening.right, villa.clearHeight, wallThickness]}
          position={[(halfWidth + frontOpening.right) / 2, wallCenter, frontWallZ]} color={palette.concrete} />
        <Block size={[wallThickness, villa.clearHeight, sideOpening.back - back]}
          position={[sideX, wallCenter, (sideOpening.back + back) / 2]} color={palette.concrete} />
        <Block size={[rearOpening.left + halfWidth - wallThickness, villa.clearHeight, wallThickness]}
          position={[(rearOpening.left - halfWidth + wallThickness) / 2, wallCenter, backWallZ]} color={palette.concrete} />
        <Block size={[halfWidth - wallThickness - rearOpening.right, villa.clearHeight, wallThickness]}
          position={[(halfWidth - wallThickness + rearOpening.right) / 2, wallCenter, backWallZ]} color={palette.concrete} />
        <Block size={[rearOpeningWidth, rearSillHeight, wallThickness]}
          position={[rearOpeningX, villa.floorHeight + rearSillHeight / 2, backWallZ]} color={palette.concrete} />
        <Block size={[rearOpeningWidth, rearHeadHeight, wallThickness]}
          position={[rearOpeningX, roofSoffit - rearHeadHeight / 2, backWallZ]} color={palette.concrete} />
      </group>
      <group name="Columns">
        <Block size={[0.24, roofSoffit - terraceHeight, 0.24]} position={[-5.18, (roofSoffit + terraceHeight) / 2, 1.35]} color={palette.concrete} />
        <Block size={[0.24, roofSoffit - terraceHeight, 0.24]} position={[6.58, (roofSoffit + terraceHeight) / 2, 1.35]} color={palette.concrete} />
      </group>
      <group name="Roof">
        <Block size={[villa.width + 2 * villa.overhang, villa.roofThickness, villa.depth + 2 * villa.overhang]}
          position={[0, roofSoffit + villa.roofThickness / 2, centerZ]} color={palette.roof} />
      </group>
      <group name="Glazing">
        <GlazedOpening width={frontOpening.right - frontOpening.left} height={villa.clearHeight} bays={5}
          position={[(frontOpening.left + frontOpening.right) / 2, villa.floorHeight, frontWallZ]} />
        <GlazedOpening width={sideOpening.front - sideOpening.back} height={villa.clearHeight} bays={3}
          position={[sideX, villa.floorHeight, (sideOpening.front + sideOpening.back) / 2]} rotation={Math.PI / 2} />
        <GlazedOpening width={rearOpeningWidth} height={rearOpening.height} bays={2}
          position={[rearOpeningX, rearOpening.sill, backWallZ]} />
      </group>
      <group name="Timber screening">
        <TimberScreen />
      </group>
      <group name="Terrace">
        <Block size={[villa.width, terraceHeight, terraceDepth]}
          position={[0, terraceHeight / 2, villa.front + terraceDepth / 2]} color={palette.terrace} />
      </group>
      <Pool />
    </group>
  )
}
