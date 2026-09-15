export type NavigationMenuController = {
  close: () => void
  destroy: () => void
  getValue: () => string
  open: (value: string) => void
  refresh: () => void
}

const itemSelector = "[data-slot='navigation-menu-item']"
const triggerSelector = "[data-slot='navigation-menu-trigger']"
const contentSelector = "[data-slot='navigation-menu-content']"
const linkSelector = "[data-slot='navigation-menu-link']"
let navigationMenuId = 0

function belongsToRoot(element: Element, root: HTMLElement): boolean {
  return element.closest<HTMLElement>("[data-slot='navigation-menu']") === root
}

function menuItems(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(itemSelector)).filter(
    (item) => belongsToRoot(item, root)
  )
}

function itemTrigger(item: HTMLElement): HTMLButtonElement | undefined {
  return Array.from(
    item.querySelectorAll<HTMLButtonElement>(triggerSelector)
  ).find((trigger) => trigger.closest(itemSelector) === item)
}

function itemContent(item: HTMLElement): HTMLElement | undefined {
  return Array.from(item.querySelectorAll<HTMLElement>(contentSelector)).find(
    (content) => content.closest(itemSelector) === item
  )
}

function itemValue(item: HTMLElement): string {
  return item.dataset.value ?? ''
}

function isDisabled(trigger: HTMLButtonElement): boolean {
  return (
    trigger.disabled ||
    trigger.dataset.disabled === 'true' ||
    trigger.getAttribute('aria-disabled') === 'true'
  )
}

function enabledTriggers(root: HTMLElement): HTMLButtonElement[] {
  return menuItems(root)
    .map(itemTrigger)
    .filter(
      (trigger): trigger is HTMLButtonElement =>
        trigger !== undefined && !isDisabled(trigger)
    )
}

function focusableContent(
  content: HTMLElement | undefined
): HTMLElement | undefined {
  return (
    content?.querySelector<HTMLElement>(
      [
        'a[href]',
        'button:not(:disabled)',
        'input:not(:disabled)',
        'select:not(:disabled)',
        'textarea:not(:disabled)',
        "[tabindex]:not([tabindex='-1'])",
      ].join(',')
    ) ?? undefined
  )
}

function positionContent(root: HTMLElement, content: HTMLElement) {
  content.style.removeProperty('--navigation-menu-shift-x')

  const rect = content.getBoundingClientRect()
  const viewportWidth = root.ownerDocument.documentElement.clientWidth
  const gutter = 16
  let shift = 0

  if (rect.right > viewportWidth - gutter)
    shift = viewportWidth - gutter - rect.right
  if (rect.left + shift < gutter) shift += gutter - (rect.left + shift)

  content.style.setProperty(
    '--navigation-menu-shift-x',
    `${Math.round(shift)}px`
  )
}

export function connectNavigationMenu(
  root: HTMLElement
): NavigationMenuController {
  const baseId = root.id || `hulla-navigation-menu-${++navigationMenuId}`
  let currentValue = ''
  let openTimer: ReturnType<typeof setTimeout> | undefined
  let closeTimer: ReturnType<typeof setTimeout> | undefined
  let pointerDownValue = ''
  let destroyed = false

  function clearTimers() {
    clearTimeout(openTimer)
    clearTimeout(closeTimer)
    openTimer = undefined
    closeTimer = undefined
  }

  function itemForValue(value: string): HTMLElement | undefined {
    return menuItems(root).find((item) => itemValue(item) === value)
  }

  function updateState() {
    menuItems(root).forEach((item, index) => {
      const trigger = itemTrigger(item)
      const content = itemContent(item)
      const value = itemValue(item)
      const open =
        value !== '' && value === currentValue && Boolean(trigger && content)

      item.dataset.state = open ? 'open' : 'closed'

      if (trigger) {
        if (!trigger.id) trigger.id = `${baseId}-trigger-${index + 1}`
        trigger.dataset.state = open ? 'open' : 'closed'
        trigger.setAttribute('aria-expanded', String(open))

        if (content) {
          if (!content.id) content.id = `${baseId}-content-${index + 1}`
          trigger.setAttribute('aria-controls', content.id)
          content.setAttribute('aria-labelledby', trigger.id)
        } else {
          trigger.removeAttribute('aria-controls')
        }
      }

      if (content) {
        content.dataset.state = open ? 'open' : 'closed'
        content.hidden = !open
        if (open) positionContent(root, content)
      }
    })

    root.dataset.state = currentValue ? 'open' : 'closed'
    if (root.dataset.value !== currentValue) root.dataset.value = currentValue
  }

  function open(value: string) {
    const item = itemForValue(value)
    const trigger = item && itemTrigger(item)
    if (!item || !trigger || isDisabled(trigger) || !itemContent(item)) return

    clearTimers()
    currentValue = value
    updateState()
  }

  function close() {
    clearTimers()
    currentValue = ''
    updateState()
  }

  function scheduleOpen(value: string, immediate = false) {
    clearTimeout(closeTimer)
    clearTimeout(openTimer)
    const delay = immediate ? 0 : Number(root.dataset.openDelay ?? 90)
    openTimer = setTimeout(() => open(value), Math.max(0, delay))
  }

  function scheduleClose(immediate = false) {
    clearTimeout(openTimer)
    clearTimeout(closeTimer)
    const delay = immediate ? 0 : Number(root.dataset.closeDelay ?? 180)
    closeTimer = setTimeout(close, Math.max(0, delay))
  }

  function refresh() {
    const values = new Set<string>()

    menuItems(root).forEach((item) => {
      const value = itemValue(item)
      if (!value || values.has(value)) return
      values.add(value)
    })

    const currentItem = itemForValue(currentValue)
    const currentTrigger = currentItem && itemTrigger(currentItem)
    if (
      !values.has(currentValue) ||
      !currentItem ||
      !currentTrigger ||
      isDisabled(currentTrigger)
    ) {
      currentValue = ''
    }
    updateState()
  }

  function onPointerOver(event: PointerEvent) {
    if (event.pointerType === 'touch') return
    const target = event.target
    if (!(target instanceof Element)) return

    const trigger = target.closest<HTMLButtonElement>(triggerSelector)
    if (!trigger || !belongsToRoot(trigger, root) || isDisabled(trigger)) return
    if (
      event.relatedTarget instanceof Node &&
      trigger.contains(event.relatedTarget)
    )
      return

    const item = trigger.closest<HTMLElement>(itemSelector)
    const value = item ? itemValue(item) : ''
    if (value) scheduleOpen(value, currentValue !== '')
  }

  function onPointerOut(event: PointerEvent) {
    if (event.pointerType === 'touch') return
    const related = event.relatedTarget
    if (related instanceof Node && root.contains(related)) return
    scheduleClose()
  }

  function onFocusIn(event: FocusEvent) {
    const target = event.target
    if (!(target instanceof Element)) return

    const trigger = target.closest<HTMLButtonElement>(triggerSelector)
    if (!trigger || !belongsToRoot(trigger, root) || isDisabled(trigger)) return

    const item = trigger.closest<HTMLElement>(itemSelector)
    const value = item ? itemValue(item) : ''
    if (value) scheduleOpen(value, true)
  }

  function onFocusOut(event: FocusEvent) {
    const related = event.relatedTarget
    if (related instanceof Node && root.contains(related)) return
    scheduleClose(true)
  }

  function onClick(event: MouseEvent) {
    const target = event.target
    if (!(target instanceof Element)) return

    const trigger = target.closest<HTMLButtonElement>(triggerSelector)
    if (trigger && belongsToRoot(trigger, root) && !isDisabled(trigger)) {
      event.preventDefault()
      const item = trigger.closest<HTMLElement>(itemSelector)
      const value = item ? itemValue(item) : ''
      const wasOpenOnPointerDown = value !== '' && pointerDownValue === value
      pointerDownValue = ''

      if (
        value === currentValue &&
        (wasOpenOnPointerDown || event.detail === 0)
      )
        close()
      else open(value)
      return
    }

    const link = target.closest<HTMLAnchorElement>(linkSelector)
    if (link && belongsToRoot(link, root)) close()
  }

  function focusTrigger(trigger: HTMLButtonElement | undefined) {
    trigger?.focus({ preventScroll: true })
  }

  function onKeyDown(event: KeyboardEvent) {
    pointerDownValue = ''
    const target = event.target
    if (!(target instanceof Element)) return

    const trigger = target.closest<HTMLButtonElement>(triggerSelector)
    if (trigger && belongsToRoot(trigger, root) && !isDisabled(trigger)) {
      const triggers = enabledTriggers(root)
      const currentIndex = triggers.indexOf(trigger)

      if (
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight' ||
        event.key === 'Home' ||
        event.key === 'End'
      ) {
        event.preventDefault()
        const nextIndex =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? triggers.length - 1
              : (currentIndex +
                  (event.key === 'ArrowRight' ? 1 : -1) +
                  triggers.length) %
                triggers.length
        focusTrigger(triggers[nextIndex])
        return
      }

      if (
        event.key === 'ArrowDown' ||
        event.key === 'Enter' ||
        event.key === ' '
      ) {
        event.preventDefault()
        const item = trigger.closest<HTMLElement>(itemSelector)
        const value = item ? itemValue(item) : ''
        open(value)
        queueMicrotask(() =>
          focusableContent(item ? itemContent(item) : undefined)?.focus()
        )
        return
      }
    }

    if (event.key === 'Escape' && currentValue) {
      event.preventDefault()
      const activeItem = itemForValue(currentValue)
      focusTrigger(activeItem && itemTrigger(activeItem))
      close()
    }
  }

  function onResize() {
    const activeItem = itemForValue(currentValue)
    const activeContent = activeItem && itemContent(activeItem)
    if (activeContent) positionContent(root, activeContent)
  }

  function onDocumentPointerDown(event: PointerEvent) {
    const target = event.target
    if (!(target instanceof Node)) return

    if (root.contains(target)) {
      const trigger =
        target instanceof Element
          ? target.closest<HTMLButtonElement>(triggerSelector)
          : null
      pointerDownValue =
        trigger && belongsToRoot(trigger, root) ? currentValue : ''
      return
    }

    pointerDownValue = ''
    close()
  }

  const observer = new MutationObserver((mutations) => {
    if (destroyed) return
    const relevant = mutations.some((mutation) => {
      const target =
        mutation.target instanceof Element
          ? mutation.target
          : mutation.target.parentElement
      return target ? belongsToRoot(target, root) : false
    })
    if (relevant) refresh()
  })

  root.addEventListener('click', onClick)
  root.addEventListener('focusin', onFocusIn)
  root.addEventListener('focusout', onFocusOut)
  root.addEventListener('keydown', onKeyDown)
  root.addEventListener('pointerout', onPointerOut)
  root.addEventListener('pointerover', onPointerOver)
  root.ownerDocument.addEventListener('pointerdown', onDocumentPointerDown)
  root.ownerDocument.defaultView?.addEventListener('resize', onResize)
  observer.observe(root, {
    attributeFilter: ['aria-disabled', 'data-value', 'disabled'],
    attributes: true,
    childList: true,
    subtree: true,
  })

  refresh()

  return {
    close,
    destroy() {
      destroyed = true
      clearTimers()
      observer.disconnect()
      root.removeEventListener('click', onClick)
      root.removeEventListener('focusin', onFocusIn)
      root.removeEventListener('focusout', onFocusOut)
      root.removeEventListener('keydown', onKeyDown)
      root.removeEventListener('pointerout', onPointerOut)
      root.removeEventListener('pointerover', onPointerOver)
      root.ownerDocument.removeEventListener(
        'pointerdown',
        onDocumentPointerDown
      )
      root.ownerDocument.defaultView?.removeEventListener('resize', onResize)
    },
    getValue: () => currentValue,
    open,
    refresh,
  }
}
