import { layers, type LayerHandle } from '@/lib/layer-stack'

export const DIALOG_DISMISS_EVENT = 'hulla:dialog-dismiss'

export type DialogDismissReason = 'backdrop' | 'escape'

export type DialogDismissEvent = CustomEvent<{
  reason: DialogDismissReason
}>

export type DialogController = {
  destroy: () => void
  sync: () => void
}

type DialogLayerMetadata = {
  element: HTMLElement
  kind: 'dialog'
}

type ScrollLock = {
  count: number
  overflow: string
}

const scrollLocks = new WeakMap<Document, ScrollLock>()

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(',')

function focusableElements(element: HTMLElement): HTMLElement[] {
  return Array.from(
    element.querySelectorAll<HTMLElement>(focusableSelector)
  ).filter(
    (candidate) =>
      !candidate.hidden &&
      candidate.getAttribute('aria-hidden') !== 'true' &&
      candidate.getClientRects().length > 0
  )
}

function focusDialog(element: HTMLElement) {
  const target =
    element.querySelector<HTMLElement>('[autofocus]') ??
    focusableElements(element)[0] ??
    element.querySelector<HTMLElement>(
      "[data-slot='dialog'], [data-slot='drawer']"
    ) ??
    element

  target.focus({ preventScroll: true })
}

function trapFocus(event: KeyboardEvent, element: HTMLElement) {
  const focusable = focusableElements(element)

  if (focusable.length === 0) {
    event.preventDefault()
    focusDialog(element)
    return
  }

  const first = focusable.at(0)
  const last = focusable.at(-1)
  const active = element.ownerDocument.activeElement

  if (event.shiftKey && (active === first || !element.contains(active))) {
    event.preventDefault()
    last?.focus()
  } else if (
    first &&
    !event.shiftKey &&
    (active === last || !element.contains(active))
  ) {
    event.preventDefault()
    first.focus()
  }
}

function lockScroll(document: Document) {
  const existing = scrollLocks.get(document)

  if (existing) {
    existing.count += 1
    return
  }

  const root = document.documentElement
  scrollLocks.set(document, { count: 1, overflow: root.style.overflow })
  root.style.overflow = 'hidden'
}

function unlockScroll(document: Document) {
  const lock = scrollLocks.get(document)
  if (!lock) return

  lock.count -= 1
  if (lock.count > 0) return

  document.documentElement.style.overflow = lock.overflow
  scrollLocks.delete(document)
}

function requestDismiss(element: HTMLElement, reason: DialogDismissReason) {
  if (element.dataset.dismissible === 'false') return

  element.dispatchEvent(
    new CustomEvent(DIALOG_DISMISS_EVENT, {
      bubbles: true,
      detail: { reason },
    })
  )
}

export function onDialogDismiss(
  element: HTMLElement,
  listener: (event: DialogDismissEvent) => void
): () => void {
  const handler: EventListener = (event) =>
    listener(event as DialogDismissEvent)

  element.addEventListener(DIALOG_DISMISS_EVENT, handler)
  return () => element.removeEventListener(DIALOG_DISMISS_EVENT, handler)
}

export function connectDialog(element: HTMLElement): DialogController {
  let layer: LayerHandle<DialogLayerMetadata> | undefined
  let restoreFocusTo: HTMLElement | undefined
  let unsubscribe: (() => void) | undefined
  let destroyed = false

  const syncTopState = () => {
    const isTop = layer?.isTop ?? false

    element.toggleAttribute('data-top-layer', isTop)
    element.toggleAttribute('inert', !isTop)
    if (isTop) {
      element.removeAttribute('aria-hidden')
    } else {
      element.setAttribute('aria-hidden', 'true')
    }
  }

  const deactivate = () => {
    if (!layer) return

    const wasTop = layer.isTop
    layer.release()
    layer = undefined
    unsubscribe?.()
    unsubscribe = undefined

    element.removeAttribute('data-layer-order')
    element.removeAttribute('data-top-layer')
    element.removeAttribute('inert')
    element.removeAttribute('aria-hidden')
    element.style.removeProperty('--hulla-layer-order')
    unlockScroll(element.ownerDocument)

    if (wasTop && restoreFocusTo?.isConnected) {
      restoreFocusTo.focus({ preventScroll: true })
    }
    restoreFocusTo = undefined
  }

  const activate = () => {
    if (layer || destroyed) return

    const active = element.ownerDocument.activeElement
    restoreFocusTo =
      active instanceof element.ownerDocument.defaultView!.HTMLElement
        ? active
        : undefined
    layer = layers.push({ element, kind: 'dialog' })

    element.dataset.layerOrder = String(layer.order)
    element.style.setProperty('--hulla-layer-order', String(layer.order))

    unsubscribe = layers.subscribe(syncTopState)
    syncTopState()
    lockScroll(element.ownerDocument)

    queueMicrotask(() => {
      if (layer?.isTop && !element.hidden && element.isConnected)
        focusDialog(element)
    })
  }

  const sync = () => {
    element.dataset.state = element.hidden ? 'closed' : 'open'

    if (element.hidden) {
      deactivate()
      // A CSS display transition can keep a closed layer painted briefly.
      // It must stop accepting focus and assistive-technology interaction immediately.
      element.setAttribute('inert', '')
      element.setAttribute('aria-hidden', 'true')
    } else {
      activate()
    }
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (!layer?.isTop) return

    if (event.key === 'Escape') {
      if (element.dataset.dismissible === 'false') return
      event.preventDefault()
      event.stopPropagation()
      requestDismiss(element, 'escape')
    } else if (event.key === 'Tab') {
      trapFocus(event, element)
    }
  }

  const onPointerDown = (event: PointerEvent) => {
    const backdrop = element.querySelector(":scope > [data-slot='backdrop']")
    if (
      layer?.isTop &&
      (event.target === element || event.target === backdrop)
    ) {
      requestDismiss(element, 'backdrop')
    }
  }

  const observer = new MutationObserver(sync)
  observer.observe(element, { attributeFilter: ['hidden'] })
  element.ownerDocument.addEventListener('keydown', onKeyDown, true)
  element.addEventListener('pointerdown', onPointerDown)
  sync()

  return {
    destroy() {
      if (destroyed) return
      destroyed = true
      observer.disconnect()
      element.ownerDocument.removeEventListener('keydown', onKeyDown, true)
      element.removeEventListener('pointerdown', onPointerDown)
      deactivate()
    },
    sync,
  }
}
