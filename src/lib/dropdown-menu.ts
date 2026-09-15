export type DropdownMenuController = {
  destroy: () => void
}

const itemSelector = [
  "[role='menuitem']",
  "[role='menuitemcheckbox']",
  "[role='menuitemradio']",
].join(',')

function enabledItems(menu: HTMLElement): HTMLElement[] {
  return Array.from(menu.querySelectorAll<HTMLElement>(itemSelector)).filter(
    (item) =>
      !item.matches(':disabled') &&
      item.getAttribute('aria-disabled') !== 'true' &&
      !item.hidden &&
      item.getClientRects().length > 0
  )
}

function focusItem(item: HTMLElement | undefined) {
  item?.focus({ preventScroll: true })
}

function highlightItem(menu: HTMLElement, item: HTMLElement | undefined) {
  menu
    .querySelector<HTMLElement>("[data-highlighted='true']")
    ?.removeAttribute('data-highlighted')
  if (item) item.dataset.highlighted = 'true'
}

function itemText(item: HTMLElement): string {
  return (item.getAttribute('aria-label') ?? item.textContent ?? '')
    .trim()
    .toLocaleLowerCase()
}

export function connectDropdownMenu(menu: HTMLElement): DropdownMenuController {
  let inputMode: 'keyboard' | 'pointer' = 'keyboard'
  let typeahead = ''
  let typeaheadTimer: ReturnType<typeof setTimeout> | undefined

  const resetTypeahead = () => {
    typeahead = ''
    typeaheadTimer = undefined
  }

  const onToggle = (event: ToggleEvent) => {
    menu.dataset.state = event.newState
    if (event.newState !== 'open') {
      highlightItem(menu, undefined)
      return
    }

    queueMicrotask(() => {
      const firstItem = enabledItems(menu)[0]
      focusItem(firstItem ?? menu)
      highlightItem(menu, inputMode === 'keyboard' ? firstItem : undefined)
    })
  }

  const onKeyDown = (event: KeyboardEvent) => {
    inputMode = 'keyboard'
    const items = enabledItems(menu)
    const activeIndex = items.indexOf(
      menu.ownerDocument.activeElement as HTMLElement
    )

    if (event.key === 'Tab') {
      menu.hidePopover()
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      const nextIndex =
        activeIndex === -1
          ? direction === 1
            ? 0
            : items.length - 1
          : (activeIndex + direction + items.length) % items.length
      const nextItem = items[nextIndex]
      focusItem(nextItem)
      highlightItem(menu, nextItem)
      return
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      const nextItem = event.key === 'Home' ? items[0] : items.at(-1)
      focusItem(nextItem)
      highlightItem(menu, nextItem)
      return
    }

    if (
      event.key.length !== 1 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.key === ' '
    ) {
      return
    }

    typeahead += event.key.toLocaleLowerCase()
    clearTimeout(typeaheadTimer)
    typeaheadTimer = setTimeout(resetTypeahead, 500)

    const searchOrder =
      activeIndex === -1
        ? items
        : [...items.slice(activeIndex + 1), ...items.slice(0, activeIndex + 1)]
    const match = searchOrder.find((item) =>
      itemText(item).startsWith(typeahead)
    )

    if (match) {
      event.preventDefault()
      focusItem(match)
      highlightItem(menu, match)
    }
  }

  const onPointerMove = (event: PointerEvent) => {
    const target = event.target
    if (!(target instanceof Element)) return

    const item = target.closest<HTMLElement>(itemSelector)
    if (
      !item ||
      !menu.contains(item) ||
      item.matches(':disabled') ||
      item.getAttribute('aria-disabled') === 'true'
    ) {
      return
    }

    inputMode = 'pointer'
    focusItem(item)
    highlightItem(menu, item)
  }

  const onPointerLeave = () => {
    if (inputMode === 'pointer') highlightItem(menu, undefined)
  }

  const onDocumentPointerDown = () => {
    inputMode = 'pointer'
  }

  const onDocumentKeyDown = () => {
    inputMode = 'keyboard'
  }

  const onClick = (event: MouseEvent) => {
    const target = event.target
    if (!(target instanceof Element)) return

    const item = target.closest<HTMLElement>(itemSelector)
    if (
      !item ||
      !menu.contains(item) ||
      item.matches(':disabled') ||
      item.getAttribute('aria-disabled') === 'true'
    ) {
      return
    }

    queueMicrotask(() => {
      if (!event.defaultPrevented && menu.matches(':popover-open'))
        menu.hidePopover()
    })
  }

  menu.dataset.state = menu.matches(':popover-open') ? 'open' : 'closed'
  menu.ownerDocument.addEventListener(
    'pointerdown',
    onDocumentPointerDown,
    true
  )
  menu.ownerDocument.addEventListener('keydown', onDocumentKeyDown, true)
  menu.addEventListener('toggle', onToggle)
  menu.addEventListener('keydown', onKeyDown)
  menu.addEventListener('pointermove', onPointerMove)
  menu.addEventListener('pointerleave', onPointerLeave)
  menu.addEventListener('click', onClick)

  return {
    destroy() {
      clearTimeout(typeaheadTimer)
      menu.ownerDocument.removeEventListener(
        'pointerdown',
        onDocumentPointerDown,
        true
      )
      menu.ownerDocument.removeEventListener('keydown', onDocumentKeyDown, true)
      menu.removeEventListener('toggle', onToggle)
      menu.removeEventListener('keydown', onKeyDown)
      menu.removeEventListener('pointermove', onPointerMove)
      menu.removeEventListener('pointerleave', onPointerLeave)
      menu.removeEventListener('click', onClick)
    },
  }
}
