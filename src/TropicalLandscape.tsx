import { useLayoutEffect, useRef } from 'react'
import { Color, Object3D } from 'three'
import type { InstancedMesh, Vector3Tuple } from 'three'
import type { VillaMaterials } from './VillaMaterials'

// All planting starts at the top of the three existing beds.
const bedTop = 0.04
const palms = [
  { x: -10.05, z: 1.65, height: 4.6, crown: 1.0, phase: 0.2 },
  { x: -10.42, z: -5.25, height: 3.35, crown: 0.77, phase: 1.4 },
  { x: 10.32, z: -5.4, height: 4.25, crown: 0.92, phase: -0.9 },
]
const shrubs = [
  [-10.21, -2.1, 0.54], [-10.58, -1.45, 0.70], [-9.72, -1.15, 0.43],
  [-10.5, 2.5, 0.55], [-9.67, 2.17, 0.39], [-10.85, 1.58, 0.47],
  [10.05, -5.15, 0.63], [10.72, -4.6, 0.51], [9.65, -4.43, 0.44],
  [10.56, 2.15, 0.52], [9.84, 2.64, 0.42],
  [-6.92, 5.8, 0.54], [-6.35, 5.55, 0.46], [-7.45, 5.45, 0.39],
]
const grassTufts = [
  [-10.4, -6.22, 0.49], [-10.82, -5.8, 0.40], [-10.36, 3.07, 0.43],
  [9.69, -5.65, 0.50], [10.7, -3.75, 0.45], [9.42, 2.28, 0.44],
  [10.48, 5.5, 0.37], [-5.73, 5.75, 0.50], [-5.35, 6.13, 0.40], [-4.92, 5.69, 0.32],
]

// A folded, arcing frond with individual tapered leaflets. All crowns reuse it.
function frondPositions() {
  const vertices: number[] = []
  const ridge = (t: number) => 0.44 * Math.sin(Math.PI * t) - 0.31 * t
  for (let i = 0; i < 10; i += 1) {
    const t = 0.13 + i * 0.082
    const x = 2.16 * t
    const y = ridge(t)
    const sweep = 0.12 + 0.21 * (1 - t)
    const spread = 0.46 * Math.sin(Math.PI * t) ** 0.7
    for (const side of [-1, 1]) {
      const tip = [x + sweep, y - 0.16 * spread, side * spread]
      const fold = [x + sweep * 0.47, y + 0.028, side * spread * 0.48]
      const leading = [x - 0.045, y, side * 0.008]
      const trailing = [x + 0.095, y - 0.012, side * 0.019]
      vertices.push(...leading, ...fold, ...tip, ...fold, ...trailing, ...tip, ...leading, ...trailing, ...fold)
    }
  }
  for (let i = 0; i < 10; i += 1) {
    const a = i / 10
    const b = (i + 1) / 10
    const wa = 0.019 * (1 - a)
    const wb = 0.019 * (1 - b)
    vertices.push(
      2.16 * a, ridge(a), -wa, 2.16 * b, ridge(b), -wb, 2.16 * b, ridge(b), wb,
      2.16 * a, ridge(a), -wa, 2.16 * b, ridge(b), wb, 2.16 * a, ridge(a), wa,
    )
  }
  return vertices
}

const frondVertices = new Float32Array(frondPositions())
const grassVertices = new Float32Array([
  -0.045, 0, 0, 0.045, 0, 0, 0.049, 0.6, 0.055,
  -0.045, 0, 0, 0.049, 0.6, 0.055, -0.017, 0.6, 0.055,
  -0.017, 0.6, 0.055, 0.049, 0.6, 0.055, 0.072, 1, 0.29,
])
const frondColors = ['#64764d', '#748451', '#84915e', '#536646']
const shrubColors = ['#687758', '#75815e', '#536747']
const grassColors = ['#9a9b70', '#8b9462', '#788354']
const bladesPerTuft = 9
const frondsPerPalm = 10

export function TropicalLandscape({ materials }: { materials: VillaMaterials }) {
  const trunks = useRef<InstancedMesh>(null)
  const fronds = useRef<InstancedMesh>(null)
  const shrubMesh = useRef<InstancedMesh>(null)
  const grass = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const trunkMesh = trunks.current
    const frondMesh = fronds.current
    const shrubsMesh = shrubMesh.current
    const grassMesh = grass.current
    if (!trunkMesh || !frondMesh || !shrubsMesh || !grassMesh) return

    frondMesh.geometry.computeVertexNormals()
    grassMesh.geometry.computeVertexNormals()
    const part = new Object3D()
    const color = new Color()
    function place(mesh: InstancedMesh, index: number, position: Vector3Tuple, rotation: Vector3Tuple, scale: Vector3Tuple, tint?: string) {
      part.position.set(...position)
      part.rotation.set(...rotation)
      part.scale.set(...scale)
      part.updateMatrix()
      mesh.setMatrixAt(index, part.matrix)
      if (tint) mesh.setColorAt(index, color.set(tint))
    }

    for (const [i, { x, z, height, crown, phase }] of palms.entries()) {
      const lean = i === 1 ? -0.09 : 0.095
      const crownX = x + Math.sin(lean) * height
      place(trunkMesh, i, [(x + crownX) / 2, bedTop + height * Math.cos(lean) / 2, z],
        [0, 0, -lean], [1, height, 1])
      for (let j = 0; j < frondsPerPalm; j += 1) {
        const upright = j >= 7
        const reach = crown * (upright ? 0.69 : 0.90 + ((j * 3) % 5) * 0.043)
        place(frondMesh, i * frondsPerPalm + j,
          [crownX, bedTop + height * Math.cos(lean), z],
          [0, phase + j * 2.39996, upright ? 0.52 : 0.09 - (j % 3) * 0.115],
          [reach, reach, reach], frondColors[(i + j) % frondColors.length])
      }
    }

    for (const [i, [x, z, size]] of shrubs.entries()) {
      place(shrubsMesh, i, [x, bedTop + size * 0.39, z], [0, i * 0.7, 0],
        [size, size * 0.48, size * 0.73], shrubColors[i % shrubColors.length])
    }

    for (const [i, [x, z, height]] of grassTufts.entries()) {
      for (let j = 0; j < bladesPerTuft; j += 1) {
        const angle = i * 0.6 + j * 2.39996
        const spread = j * 0.021
        place(grassMesh, i * bladesPerTuft + j,
          [x + Math.cos(angle) * spread, bedTop, z + Math.sin(angle) * spread],
          [0, angle, 0], [height * 1.6, height * (0.75 + (j % 3) * 0.17), height * 2],
          grassColors[(i + j) % grassColors.length])
      }
    }

    for (const mesh of [trunkMesh, frondMesh, shrubsMesh, grassMesh]) {
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      mesh.computeBoundingSphere()
    }
  }, [])

  return (
    <group name="Tropical planting">
      <instancedMesh name="Tapered palm trunks" ref={trunks} args={[undefined, materials.trunk, palms.length]} castShadow receiveShadow>
        <cylinderGeometry args={[0.062, 0.14, 1, 9]} />
      </instancedMesh>
      <instancedMesh name="Palm fronds" ref={fronds} args={[undefined, materials.frond, palms.length * frondsPerPalm]} castShadow receiveShadow>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[frondVertices, 3]} />
        </bufferGeometry>
      </instancedMesh>
      <instancedMesh name="Low shrubs" ref={shrubMesh} args={[undefined, materials.shrub, shrubs.length]} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
      </instancedMesh>
      <instancedMesh name="Grass tufts" ref={grass} args={[undefined, materials.grass, grassTufts.length * bladesPerTuft]} receiveShadow>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[grassVertices, 3]} />
        </bufferGeometry>
      </instancedMesh>
    </group>
  )
}
