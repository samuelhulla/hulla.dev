export function connectCollapsible(
  root: Document | HTMLDetailsElement = document
) {
  const pending = new Map<
    HTMLDetailsElement,
    { frame: number; timer?: number }
  >()

  const onClick = (event: Event) => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return
    const summary = event.target.closest('summary')
    const details = summary?.parentElement
    if (
      !(details instanceof HTMLDetailsElement) ||
      details.dataset.slot !== 'collapsible' ||
      (root instanceof HTMLDetailsElement && root !== details)
    )
      return

    const previous = pending.get(details)
    if (previous) {
      cancelAnimationFrame(previous.frame)
      window.clearTimeout(previous.timer)
    }
    details.setAttribute('data-collapsible-animating', '')

    // Native summary activation runs after click dispatch.
    const activation: { frame: number; timer?: number } = { frame: 0 }
    pending.set(details, activation)
    activation.frame = requestAnimationFrame(() => {
      const parts = new Set<Element>([
        details,
        ...Array.from(details.children).filter(
          (part) =>
            part === summary ||
            part.getAttribute('data-slot') === 'collapsible-content'
        ),
      ])
      const animations = details
        .getAnimations({ subtree: true })
        .filter((animation) => {
          const target = (animation.effect as KeyframeEffect | null)?.target
          return target instanceof Element && parts.has(target)
        })
      // WebKit can suspend a hidden closing transition without settling `finished`.
      // Use the animations' actual timings so cleanup also runs in that case.
      const duration = Math.max(
        0,
        ...animations.map((animation) => {
          const endTime = animation.effect?.getComputedTiming().endTime
          return typeof endTime === 'number' && Number.isFinite(endTime)
            ? endTime
            : 0
        })
      )
      activation.timer = window.setTimeout(() => {
        if (pending.get(details) !== activation) return
        pending.delete(details)
        details.removeAttribute('data-collapsible-animating')
      }, duration)
    })
  }

  root.addEventListener('click', onClick, true)

  return {
    destroy() {
      root.removeEventListener('click', onClick, true)
      for (const [details, activation] of pending) {
        cancelAnimationFrame(activation.frame)
        window.clearTimeout(activation.timer)
        details.removeAttribute('data-collapsible-animating')
      }
      pending.clear()
    },
  }
}
