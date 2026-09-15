import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  type Placement,
} from '@floating-ui/dom'

type FloatingLayerOptions = {
  closeDelay: number
  offset: number
  openDelay: number
  placement: Placement
  triggerId: string
}

export type FloatingLayerController = {
  destroy: () => void
}

export function connectFloatingLayer(
  surface: HTMLElement,
  options: FloatingLayerOptions
): FloatingLayerController {
  const document = surface.ownerDocument
  const trigger = document.getElementById(options.triggerId)

  if (!trigger) {
    surface.dataset.state = 'closed'
    surface.dataset.unsupported = 'missing-trigger'
    return { destroy: () => undefined }
  }

  if (
    typeof surface.showPopover !== 'function' ||
    typeof surface.hidePopover !== 'function'
  ) {
    surface.dataset.state = 'closed'
    surface.dataset.unsupported = 'popover'
    return { destroy: () => undefined }
  }

  let openTimer: ReturnType<typeof setTimeout> | undefined
  let closeTimer: ReturnType<typeof setTimeout> | undefined
  let stopPositioning: (() => void) | undefined
  let destroyed = false

  const isOpen = () => {
    try {
      return surface.matches(':popover-open')
    } catch {
      return false
    }
  }

  const clearOpenTimer = () => {
    if (openTimer === undefined) return
    clearTimeout(openTimer)
    openTimer = undefined
  }

  const clearCloseTimer = () => {
    if (closeTimer === undefined) return
    clearTimeout(closeTimer)
    closeTimer = undefined
  }

  const updatePosition = async () => {
    const { x, y, placement } = await computePosition(trigger, surface, {
      middleware: [
        offset(options.offset),
        flip({ padding: 8 }),
        shift({ padding: 8 }),
      ],
      placement: options.placement,
      strategy: 'fixed',
    })

    if (destroyed || !isOpen()) return

    surface.style.left = `${x}px`
    surface.style.top = `${y}px`
    surface.dataset.placement = placement
    surface.dataset.positioned = 'true'
  }

  const startPositioning = () => {
    stopPositioning?.()
    stopPositioning = autoUpdate(trigger, surface, () => void updatePosition())
  }

  const hide = () => {
    clearOpenTimer()
    clearCloseTimer()
    if (!isOpen()) return

    surface.hidePopover()
  }

  const show = () => {
    clearOpenTimer()
    clearCloseTimer()
    if (destroyed || isOpen()) return

    document
      .querySelectorAll<HTMLElement>('[data-hulla-floating-layer]')
      .forEach((activeLayer) => {
        if (
          activeLayer === surface ||
          typeof activeLayer.hidePopover !== 'function' ||
          !activeLayer.matches(':popover-open')
        ) {
          return
        }

        try {
          activeLayer.hidePopover()
        } catch {
          // The browser may have already closed the previous transient layer.
        }
      })

    surface.dataset.positioned = 'false'

    try {
      surface.showPopover()
      startPositioning()
    } catch {
      surface.dataset.state = 'closed'
    }
  }

  const scheduleOpen = (delay = options.openDelay) => {
    clearCloseTimer()
    if (isOpen() || openTimer !== undefined) return
    openTimer = setTimeout(show, delay)
  }

  const scheduleClose = () => {
    clearOpenTimer()
    clearCloseTimer()
    closeTimer = setTimeout(hide, options.closeDelay)
  }

  const handlePointerEnter = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return
    scheduleOpen()
  }

  const handlePointerLeave = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return
    scheduleClose()
  }

  const handleFocusIn = () => scheduleOpen(0)

  const handleFocusOut = () => {
    queueMicrotask(() => {
      const activeElement = document.activeElement
      if (
        activeElement &&
        (trigger.contains(activeElement) || surface.contains(activeElement))
      ) {
        clearCloseTimer()
        return
      }

      scheduleClose()
    })
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !isOpen()) return
    event.preventDefault()
    event.stopPropagation()
    hide()
  }

  const handleToggle = () => {
    const open = isOpen()
    surface.dataset.state = open ? 'open' : 'closed'

    if (open) return

    surface.dataset.positioned = 'false'
    stopPositioning?.()
    stopPositioning = undefined
  }

  surface.dataset.hullaFloatingLayer = ''
  surface.dataset.state = 'closed'
  surface.dataset.positioned = 'false'

  trigger.addEventListener('pointerenter', handlePointerEnter)
  trigger.addEventListener('pointerleave', handlePointerLeave)
  trigger.addEventListener('focusin', handleFocusIn)
  trigger.addEventListener('focusout', handleFocusOut)
  surface.addEventListener('pointerenter', handlePointerEnter)
  surface.addEventListener('pointerleave', handlePointerLeave)
  surface.addEventListener('focusin', handleFocusIn)
  surface.addEventListener('focusout', handleFocusOut)
  surface.addEventListener('toggle', handleToggle)
  document.addEventListener('keydown', handleKeyDown, true)

  return {
    destroy: () => {
      destroyed = true
      clearOpenTimer()
      clearCloseTimer()
      stopPositioning?.()
      delete surface.dataset.hullaFloatingLayer
      trigger.removeEventListener('pointerenter', handlePointerEnter)
      trigger.removeEventListener('pointerleave', handlePointerLeave)
      trigger.removeEventListener('focusin', handleFocusIn)
      trigger.removeEventListener('focusout', handleFocusOut)
      surface.removeEventListener('pointerenter', handlePointerEnter)
      surface.removeEventListener('pointerleave', handlePointerLeave)
      surface.removeEventListener('focusin', handleFocusIn)
      surface.removeEventListener('focusout', handleFocusOut)
      surface.removeEventListener('toggle', handleToggle)
      document.removeEventListener('keydown', handleKeyDown, true)
    },
  }
}
