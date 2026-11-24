import { useLayoutEffect, useMemo, useRef } from 'react'
import { Object3D, Shape } from 'three'
import type { InstancedMesh, MeshStandardMaterial, Vector3Tuple } from 'three'
import { TropicalLandscape } from './TropicalLandscape'
import { useVillaMaterials } from './VillaMaterials'
import type { VillaMaterials } from './VillaMaterials'

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

function Block({ size, position, material, castShadow = true }: {
  size: Vector3Tuple
  position: Vector3Tuple
  material: MeshStandardMaterial
  castShadow?: boolean
}) {
  return (
    <mesh position={position} material={material} castShadow={castShadow} receiveShadow>
      <boxGeometry args={size} />
    </mesh>
  )
}

function Site({ materials }: { materials: VillaMaterials }) {
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
        position={[0, (pool.base - site.thickness) / 2, 0]} material={materials.ground} castShadow={false} />
      <mesh position={[0, pool.base, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.ground} receiveShadow>
        <extrudeGeometry args={[ground, { depth: -pool.base, bevelEnabled: false }]} />
      </mesh>
      <group name="Landscape zones">
        <Block size={[2.7, 0.04, 15.5]} position={[-10.1, 0.02, -0.3]} material={materials.landscape} castShadow={false} />
        <Block size={[2.65, 0.04, 15.5]} position={[10.05, 0.02, -0.3]} material={materials.landscape} castShadow={false} />
        <Block size={[4.2, 0.04, 3.5]} position={[-5.9, 0.02, 5.75]} material={materials.landscape} castShadow={false} />
        <TropicalLandscape materials={materials} />
      </group>
    </group>
  )
}

// Each wall opening owns its frame and panes. Local X runs across the opening.
function GlazedOpening({ position, rotation = 0, width, height, bays, materials }: {
  position: Vector3Tuple
  rotation?: number
  width: number
  height: number
  bays: number
  materials: VillaMaterials
}) {
  const frame = useRef<InstancedMesh>(null)
  const rail = 0.065
  const bayWidth = (width - rail) / bays

  useLayoutEffect(() => {
    const mesh = frame.current
    if (!mesh) return

    const part = new Object3D()
    const place = (index: number, x: number, y: number, w: number, h: number) => {
      part.position.set(x, y, 0)
      part.scale.set(w, h, 0.125)
      part.updateMatrix()
      mesh.setMatrixAt(index, part.matrix)
    }

    place(0, 0, rail / 2, width, rail)
    place(1, 0, height - rail / 2, width, rail)
    for (let i = 0; i <= bays; i += 1) {
      place(i + 2, -width / 2 + rail / 2 + i * bayWidth, height / 2, rail, height - 2 * rail)
    }
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [bayWidth, bays, height, width])

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <instancedMesh name="Frames and mullions" ref={frame} args={[undefined, materials.frame, bays + 3]} castShadow receiveShadow>
        <boxGeometry />
      </instancedMesh>
      {Array.from({ length: bays }, (_, i) => (
        <mesh key={i} position={[-width / 2 + rail / 2 + (i + 0.5) * bayWidth, height / 2, 0]}
          material={materials.glass} receiveShadow>
          <planeGeometry args={[bayWidth - rail, height - 2 * rail]} />
        </mesh>
      ))}
    </group>
  )
}

function TimberScreen({ material }: { material: MeshStandardMaterial }) {
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
    <instancedMesh ref={slats} args={[undefined, material, count]}
      position={[-3.53, (terraceHeight + roofSoffit) / 2, 1.3]} castShadow receiveShadow>
      <boxGeometry args={[0.085, roofSoffit - terraceHeight, 0.19]} />
    </instancedMesh>
  )
}

function Pool({ materials }: { materials: VillaMaterials }) {
  const coping = 0.25
  const liner = 0.045

  return (
    <group name="Pool" position={[pool.x, 0, poolZ]}>
      <Block size={[pool.width, 0.04, pool.depth]} position={[0, pool.base + 0.02, 0]} material={materials.basin} castShadow={false} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Block size={[pool.width + 2 * coping, 0.065, coping]} position={[0, 0.0325, side * (pool.depth + coping) / 2]} material={materials.coping} />
          <Block size={[coping, 0.065, pool.depth]} position={[side * (pool.width + coping) / 2, 0.0325, 0]} material={materials.coping} />
          <Block size={[pool.width, -pool.base, liner]} position={[0, pool.base / 2, side * (pool.depth - liner) / 2]} material={materials.basin} castShadow={false} />
          <Block size={[liner, -pool.base, pool.depth - 2 * liner]} position={[side * (pool.width - liner) / 2, pool.base / 2, 0]} material={materials.basin} castShadow={false} />
        </group>
      ))}
      <mesh name="Static water" position={[0, -0.19, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.water} receiveShadow>
        <planeGeometry args={[pool.width - 2 * liner, pool.depth - 2 * liner]} />
      </mesh>
    </group>
  )
}

export function VillaBlockout() {
  const materials = useVillaMaterials()
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
      <Site materials={materials} />
      <group name="Foundation">
        <Block size={[villa.width, villa.floorHeight, villa.depth]}
          position={[0, villa.floorHeight / 2, centerZ]} material={materials.slab} />
      </group>
      <group name="Walls">
        <Block size={[wallThickness, villa.clearHeight, villa.depth]}
          position={[-sideX, wallCenter, centerZ]} material={materials.concrete} />
        <Block size={[frontOpening.left + halfWidth - wallThickness, villa.clearHeight, wallThickness]}
          position={[(frontOpening.left - halfWidth + wallThickness) / 2, wallCenter, frontWallZ]} material={materials.concrete} />
        <Block size={[halfWidth - frontOpening.right, villa.clearHeight, wallThickness]}
          position={[(halfWidth + frontOpening.right) / 2, wallCenter, frontWallZ]} material={materials.concrete} />
        <Block size={[wallThickness, villa.clearHeight, sideOpening.back - back]}
          position={[sideX, wallCenter, (sideOpening.back + back) / 2]} material={materials.concrete} />
        <Block size={[rearOpening.left + halfWidth - wallThickness, villa.clearHeight, wallThickness]}
          position={[(rearOpening.left - halfWidth + wallThickness) / 2, wallCenter, backWallZ]} material={materials.concrete} />
        <Block size={[halfWidth - wallThickness - rearOpening.right, villa.clearHeight, wallThickness]}
          position={[(halfWidth - wallThickness + rearOpening.right) / 2, wallCenter, backWallZ]} material={materials.concrete} />
        <Block size={[rearOpeningWidth, rearSillHeight, wallThickness]}
          position={[rearOpeningX, villa.floorHeight + rearSillHeight / 2, backWallZ]} material={materials.concrete} />
        <Block size={[rearOpeningWidth, rearHeadHeight, wallThickness]}
          position={[rearOpeningX, roofSoffit - rearHeadHeight / 2, backWallZ]} material={materials.concrete} />
      </group>
      <group name="Columns">
        <Block size={[0.24, roofSoffit - terraceHeight, 0.24]} position={[-5.18, (roofSoffit + terraceHeight) / 2, 1.35]} material={materials.concrete} />
        <Block size={[0.24, roofSoffit - terraceHeight, 0.24]} position={[6.58, (roofSoffit + terraceHeight) / 2, 1.35]} material={materials.concrete} />
      </group>
      <group name="Roof">
        <Block size={[villa.width + 2 * villa.overhang - 0.16, 0.07, villa.depth + 2 * villa.overhang - 0.16]}
          position={[0, roofSoffit + 0.035, centerZ]} material={materials.concrete} />
        <Block size={[villa.width + 2 * villa.overhang, villa.roofThickness - 0.07, villa.depth + 2 * villa.overhang]}
          position={[0, roofSoffit + (villa.roofThickness + 0.07) / 2, centerZ]} material={materials.roof} />
      </group>
      <group name="Glazing">
        <GlazedOpening width={frontOpening.right - frontOpening.left} height={villa.clearHeight} bays={5}
          position={[(frontOpening.left + frontOpening.right) / 2, villa.floorHeight, frontWallZ]} materials={materials} />
        <GlazedOpening width={sideOpening.front - sideOpening.back} height={villa.clearHeight} bays={3}
          position={[sideX, villa.floorHeight, (sideOpening.front + sideOpening.back) / 2]} rotation={Math.PI / 2} materials={materials} />
        <GlazedOpening width={rearOpeningWidth} height={rearOpening.height} bays={2}
          position={[rearOpeningX, rearOpening.sill, backWallZ]} materials={materials} />
      </group>
      <group name="Timber screening">
        <TimberScreen material={materials.timber} />
      </group>
      <group name="Terrace">
        <Block size={[villa.width, terraceHeight, terraceDepth]}
          position={[0, terraceHeight / 2, villa.front + terraceDepth / 2]} material={materials.slab} />
        {Array.from({ length: 8 }, (_, i) => (
          <Block key={i} size={[villa.width / 8 - 0.035, 0.025, terraceDepth - 0.035]}
            position={[-halfWidth + (i + 0.5) * villa.width / 8, terraceHeight + 0.0125, villa.front + terraceDepth / 2]}
            material={materials.limestone} castShadow={false} />
        ))}
      </group>
      <Pool materials={materials} />
    </group>
  )
}
