import { useEffect, useMemo } from 'react'
import { DoubleSide, MeshStandardMaterial } from 'three'
import type { MeshStandardMaterialParameters } from 'three'

function surface(name: string, color: string, roughness: number, settings?: MeshStandardMaterialParameters) {
  return new MeshStandardMaterial({ name, color, roughness, ...settings })
}

export function useVillaMaterials() {
  const materials = useMemo(() => ({
    concrete: surface('Warm concrete', '#d4cbb9', 0.83),
    roof: surface('Roof concrete', '#e3dcd0', 0.85),
    slab: surface('Stone slab edge', '#9e917d', 0.9),
    plinthBase: surface('Recessed plinth skirt', '#867b6a', 0.96),
    limestone: surface('Limestone paving', '#c9bfb0', 0.77),
    ground: surface('Diorama ground', '#b2a793', 0.95),
    landscape: surface('Planting bed', '#8b9475', 0.97),
    frame: surface('Dark coated frames', '#454840', 0.52),
    timber: surface('Teak screening', '#946e4c', 0.7),
    interiorFloor: surface('Warm interior stone', '#cfc5b4', 0.82),
    interiorLinen: surface('Interior upholstery', '#e6dfd2', 0.92),
    glass: surface('Lightly tinted glass', '#a3bcba', 0.22, {
      side: DoubleSide,
      transparent: true,
      opacity: 0.29,
      depthWrite: false,
      forceSinglePass: true,
    }),
    coping: surface('Pool coping', '#e0d5c1', 0.74),
    basin: surface('Pool lining', '#759691', 0.82),
    water: surface('Still pool water', '#6ca8a6', 0.24),
    trunk: surface('Palm trunk', '#807257', 0.93),
    frond: surface('Palm foliage', '#e1e7d1', 0.88, { side: DoubleSide }),
    shrub: surface('Shrub foliage', '#e1e7d1', 0.94),
    grass: surface('Ornamental grass', '#e1e7d1', 0.92, { side: DoubleSide }),
  }), [])

  useEffect(() => () => {
    for (const material of Object.values(materials)) material.dispose()
  }, [materials])

  return materials
}

export type VillaMaterials = ReturnType<typeof useVillaMaterials>
