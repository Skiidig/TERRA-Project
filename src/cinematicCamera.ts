import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCallback, useLayoutEffect, useRef } from 'react'
import { MathUtils, Vector3 } from 'three'
import type { Camera, Vector3Tuple } from 'three'
import type { OrbitControls } from 'three-stdlib'

gsap.registerPlugin(ScrollTrigger)

type StoryPose = {
  title: string
  section: string
  position: Vector3Tuple
  target: Vector3Tuple
}

// +Z faces the pool. All scripted shots stay on the terrace side of the villa.
export const storyPoses: StoryPose[] = [
  { title: 'The Arrival', section: 'pavilion', position: [23, 18, 28], target: [0, 0.9, 0] },
  { title: 'Shelter & Shade', section: 'concept', position: [12, 10.7, 27], target: [0, 1.15, 0.1] },
  { title: 'Material & Texture', section: 'materials', position: [-7.3, 5.95, 20.7], target: [-1.65, 1.7, 1.25] },
  { title: 'Landscape & Stillness', section: 'specifications', position: [-17.5, 17, 26.5], target: [0, 0.65, 2.8] },
]

export const STORY_MEDIA = '(min-width: 64rem) and (min-height: 40.625rem)'
const ease = gsap.parseEase('sine.inOut')
const angleDelta = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from))

export function flushOrbitDamping(controls: OrbitControls) {
  const previous = controls.enableDamping
  controls.enableDamping = false
  controls.update()
  controls.enableDamping = previous
}

export function useCinematicCamera(
  camera: Camera,
  controls: OrbitControls | null,
  exploring: boolean,
  invalidate: () => void,
  onChapter: (index: number) => void,
) {
  const memory = useRef({
    owner: 'story' as 'story' | 'explore' | 'return',
    reduced: false,
    storyPosition: new Vector3(...storyPoses[0].position),
    storyTarget: new Vector3(...storyPoses[0].target),
    visibleTarget: new Vector3(NaN, NaN, NaN),
    scratch: new Vector3(),
    returnTween: null as gsap.core.Tween | null,
  })

  const showStory = useCallback(() => {
    const { owner, storyPosition, storyTarget, visibleTarget } = memory.current
    if (owner !== 'story') return
    if (camera.position.equals(storyPosition) && visibleTarget.equals(storyTarget)) return
    camera.position.copy(storyPosition)
    visibleTarget.copy(storyTarget)
    camera.lookAt(visibleTarget)
    invalidate()
  }, [camera, invalidate])

  useLayoutEffect(() => {
    const state = memory.current
    const wide = window.matchMedia(STORY_MEDIA)
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const stops = [0, 0, 0, 0]
    let trigger: ScrollTrigger | undefined
    let lastChapter = -1
    let active = true

    function sample(scroll: number) {
      let next = 1
      while (next < stops.length && scroll >= stops[next]) next += 1
      const index = next - 1
      const current = storyPoses[index]
      const upcoming = storyPoses[next]
      const end = stops[next]
      // Hold each shot through its section, then ease in before the next anchor.
      const start = Math.max(stops[index], end - Math.min(360, window.innerHeight * 0.42))
      const mix = upcoming ? ease(MathUtils.clamp((scroll - start) / Math.max(1, end - start), 0, 1)) : 0

      state.storyPosition.fromArray(current.position)
      state.storyTarget.fromArray(current.target)
      if (upcoming && mix > 0) {
        state.storyPosition.lerp(state.scratch.fromArray(upcoming.position), mix)
        state.storyTarget.lerp(state.scratch.fromArray(upcoming.target), mix)
      }
      const chapter = mix < 0.5 ? index : next
      if (chapter !== lastChapter) {
        lastChapter = chapter
        onChapter(chapter)
      }
      showStory()
    }

    function measure() {
      for (let i = 1; i < storyPoses.length; i += 1) {
        const section = document.getElementById(storyPoses[i].section)
        if (!section) continue
        const offset = parseFloat(getComputedStyle(section).scrollMarginTop) || 0
        stops[i] = Math.max(stops[i - 1] + 1, section.getBoundingClientRect().top + window.scrollY - offset)
      }
    }

    function configure() {
      trigger?.kill()
      trigger = undefined
      state.reduced = motion.matches
      if (state.reduced && state.owner === 'return') {
        state.returnTween?.kill()
        state.returnTween = null
        state.owner = 'story'
      }
      if (!wide.matches || state.reduced) {
        state.storyPosition.fromArray(storyPoses[0].position)
        state.storyTarget.fromArray(storyPoses[0].target)
        lastChapter = 0
        onChapter(0)
        showStory()
        return
      }
      trigger = ScrollTrigger.create({
        id: 'terra-story',
        start: 0,
        end: () => {
          measure()
          return stops[stops.length - 1]
        },
        onUpdate: (self) => sample(self.scroll()),
        onRefresh: (self) => sample(self.scroll()),
      })
      sample(trigger.scroll())
    }

    configure()
    wide.addEventListener('change', configure)
    motion.addEventListener('change', configure)
    void document.fonts.ready.then(() => {
      if (active) trigger?.refresh()
    })
    return () => {
      active = false
      trigger?.kill()
      wide.removeEventListener('change', configure)
      motion.removeEventListener('change', configure)
      state.returnTween?.kill()
      state.returnTween = null
      state.owner = 'story'
    }
  }, [onChapter, showStory])

  useLayoutEffect(() => {
    if (!controls) return
    const state = memory.current
    state.returnTween?.kill()
    state.returnTween = null

    if (exploring) {
      state.owner = 'explore'
      controls.target.copy(state.visibleTarget)
      controls.update()
      controls.saveState()
      controls.enabled = true
      invalidate()
      return
    }

    controls.enabled = false
    if (state.owner === 'story') {
      showStory()
      return
    }

    const from = camera.position.clone()
    const fromTarget = controls.target.clone()
    flushOrbitDamping(controls)
    camera.position.copy(from)
    state.visibleTarget.copy(fromTarget)
    camera.lookAt(state.visibleTarget)
    if (state.reduced) {
      state.owner = 'story'
      showStory()
      invalidate()
      return
    }

    state.owner = 'return'
    const startAngle = Math.atan2(from.x, from.z)
    const startRadius = Math.hypot(from.x, from.z)
    const firstDelta = angleDelta(startAngle, Math.atan2(state.storyPosition.x, state.storyPosition.z))
    const progress = { t: 0 }
    state.returnTween = gsap.to(progress, {
      id: 'terra-return',
      t: 1,
      duration: 0.62 + Math.abs(firstDelta) * 0.28,
      ease: 'sine.inOut',
      onUpdate: () => {
        const { t } = progress
        const destination = state.storyPosition
        const delta = angleDelta(startAngle, Math.atan2(destination.x, destination.z))
        // Keep the same route around the site even if scrolling moves the destination.
        const sweep = firstDelta + angleDelta(firstDelta, delta)
        const angle = startAngle + sweep * t
        const endRadius = Math.hypot(destination.x, destination.z)
        const clearance = Math.max(0, 20 - Math.min(startRadius, endRadius))
        const radius = MathUtils.lerp(startRadius, endRadius, t) + Math.sin(Math.PI * t) * clearance
        camera.position.set(Math.sin(angle) * radius, MathUtils.lerp(from.y, destination.y, t), Math.cos(angle) * radius)
        state.visibleTarget.copy(fromTarget).lerp(state.storyTarget, t)
        camera.lookAt(state.visibleTarget)
        invalidate()
      },
      onComplete: () => {
        state.returnTween = null
        state.owner = 'story'
        showStory()
      },
    })
  }, [camera, controls, exploring, invalidate, showStory])
}
