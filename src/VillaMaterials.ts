import { useEffect, useMemo } from 'react'
import { DoubleSide, MeshStandardMaterial } from 'three'
import type { MeshStandardMaterialParameters } from 'three'

function surface(name: string, color: string, roughness: number, settings?: MeshStandardMaterialParameters) {
  return new MeshStandardMaterial({ name, color, roughness, ...settings })
}

export function useVillaMaterials() {
  const materials = useMemo(() => ({
    concrete: surface('Warm concrete', '#d2c9ba', 0.82),
    roof: surface('Roof concrete', '#dfd7c8', 0.84),
    slab: surface('Stone slab edge', '#a79a86', 0.89),
    limestone: surface('Limestone paving', '#c5bba8', 0.78),
    ground: surface('Diorama ground', '#b0a692', 0.95),
    landscape: surface('Planting bed', '#8f9778', 0.98),
    frame: surface('Dark coated frames', '#4e5148', 0.56),
    timber: surface('Teak screening', '#987452', 0.73),
    glass: surface('Lightly tinted glass', '#a5bdba', 0.24, {
      side: DoubleSide,
      transparent: true,
      opacity: 0.31,
      depthWrite: false,
      forceSinglePass: true,
    }),
    coping: surface('Pool coping', '#ded2bb', 0.74),
    basin: surface('Pool lining', '#7d9d98', 0.83),
    water: surface('Still pool water', '#6faba9', 0.27),
    trunk: surface('Palm trunk', '#83765b', 0.93),
    frond: surface('Palm foliage', '#e1e7d1', 0.89, { side: DoubleSide }),
    shrub: surface('Shrub foliage', '#e1e7d1', 0.95),
    grass: surface('Ornamental grass', '#e1e7d1', 0.92, { side: DoubleSide }),
  }), [])

  useEffect(() => () => {
    for (const material of Object.values(materials)) material.dispose()
  }, [materials])

  return materials
}

export type VillaMaterials = ReturnType<typeof useVillaMaterials>
