import { useRef } from 'react'
import { animate } from 'animejs'
import { prefersReducedMotion } from '@/lib/motion'

type Anim = ReturnType<typeof animate>

/**
 * Pointer-driven 3D tilt for Pokémon cards.
 * Rotates the card in perspective and lets inner layers with
 * translateZ() pop out; eases back flat on leave.
 * Attach `ref` to the card, spread `handlers` onto it.
 */
export function useTilt(maxDeg = 9) {
  const ref = useRef<HTMLElement | null>(null)
  const current = useRef<Anim | null>(null)

  function settle(props: Record<string, number>, duration: number) {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    current.current?.pause()
    current.current = animate(el, {
      ...props,
      transformPerspective: 900,
      duration,
      ease: 'outExpo',
    })
  }

  function onMouseMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    settle({ rotateY: px * maxDeg * 2, rotateX: -py * maxDeg * 2 }, 400)
  }

  function onMouseLeave() {
    settle({ rotateX: 0, rotateY: 0 }, 900)
  }

  return { ref, handlers: { onMouseMove, onMouseLeave } }
}
