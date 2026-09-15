export const COMMAND_SELECT_EVENT = 'hulla-command-select'

export type CommandSelectDetail = {
  value: string
}

export type CommandController = {
  destroy: () => void
  refresh: () => void
}

const itemSelector = "[data-slot='command-item']"
let commandListId = 0

function belongsToRoot(element: Element, root: HTMLElement): boolean {
  return element.closest<HTMLElement>("[data-slot='command']") === root
}

function itemElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(itemSelector)).filter(
    (item) => belongsToRoot(item, root)
  )
}

function groupElements(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>("[data-slot='command-group']")
  ).filter((group) => belongsToRoot(group, root))
}

function emptyElements(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>("[data-slot='command-empty']")
  ).filter((empty) => belongsToRoot(empty, root))
}

function isDisabled(item: HTMLElement): boolean {
  return (
    item.dataset.disabled === 'true' ||
    item.getAttribute('aria-disabled') === 'true'
  )
}

function itemValue(item: HTMLElement): string {
  return item.dataset.value || item.textContent?.trim() || ''
}

function itemSearchText(item: HTMLElement): string {
  return [
    item.dataset.value,
    item.dataset.textValue,
    item.dataset.keywords,
    item.textContent,
  ]
    .filter(Boolean)
    .join(' ')
}

function normalize(value: string): string {
  return value
    .normalize('NFKD')
    .replaceAll(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()
    .trim()
}

export function connectCommand(root: HTMLElement): CommandController {
  const inputElement = root.querySelector<HTMLInputElement>(
    "[data-slot='command-input']"
  )
  const listElement = root.querySelector<HTMLElement>(
    "[data-slot='command-list']"
  )

  if (!inputElement || !listElement) {
    root.dataset.unsupported = 'missing-part'
    return {
      destroy: () => undefined,
      refresh: () => undefined,
    }
  }

  const input = inputElement
  const list = listElement
  let activeItem: HTMLElement | undefined
  let destroyed = false

  if (!list.id) {
    commandListId += 1
    list.id = root.id
      ? `${root.id}-list`
      : `hulla-command-list-${commandListId}`
  }

  function items() {
    return itemElements(root)
  }

  function enabledVisibleItems() {
    return items().filter((item) => !item.hidden && !isDisabled(item))
  }

  function setActive(item: HTMLElement | undefined, scroll = false) {
    activeItem = item

    items().forEach((candidate) => {
      const isActive = candidate === item
      candidate.setAttribute('aria-selected', String(isActive))
      if (isActive) candidate.dataset.selected = 'true'
      else delete candidate.dataset.selected
    })

    if (item?.id) input.setAttribute('aria-activedescendant', item.id)
    else input.removeAttribute('aria-activedescendant')

    if (scroll) item?.scrollIntoView({ block: 'nearest' })
  }

  function filterItems() {
    const shouldFilter = root.dataset.filter !== 'false'
    const query = normalize(input.value)

    items().forEach((item) => {
      item.hidden =
        shouldFilter &&
        query !== '' &&
        !normalize(itemSearchText(item)).includes(query)
    })

    groupElements(root).forEach((group) => {
      const groupItems = Array.from(
        group.querySelectorAll<HTMLElement>(itemSelector)
      ).filter((item) => item.closest("[data-slot='command-group']") === group)
      group.hidden =
        groupItems.length > 0 && groupItems.every((item) => item.hidden)
    })

    const hasResults = items().some((item) => !item.hidden)
    emptyElements(root).forEach((empty) => {
      empty.hidden = hasResults
    })

    const enabled = enabledVisibleItems()
    setActive(
      activeItem && enabled.includes(activeItem) ? activeItem : enabled[0]
    )
    root.dataset.empty = hasResults ? 'false' : 'true'
  }

  function selectItem(item: HTMLElement) {
    if (isDisabled(item) || item.hidden) return

    item.dispatchEvent(
      new CustomEvent<CommandSelectDetail>(COMMAND_SELECT_EVENT, {
        bubbles: true,
        detail: { value: itemValue(item) },
      })
    )
  }

  function refresh() {
    input.setAttribute('aria-controls', list.id)
    input.setAttribute('aria-expanded', 'true')
    input.setAttribute('aria-autocomplete', 'list')

    items().forEach((item, index) => {
      if (!item.id) item.id = `${list.id}-item-${index + 1}`
      item.setAttribute('aria-selected', String(item === activeItem))
    })

    groupElements(root).forEach((group, index) => {
      const label = Array.from(
        group.querySelectorAll<HTMLElement>("[data-slot='command-group-label']")
      ).find(
        (candidate) =>
          candidate.closest("[data-slot='command-group']") === group
      )
      if (!label) return

      if (!label.id) label.id = `${list.id}-group-${index + 1}-label`
      group.setAttribute('aria-labelledby', label.id)
    })

    filterItems()
  }

  function onInput() {
    filterItems()
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.isComposing) return

    const enabled = enabledVisibleItems()
    const currentIndex = activeItem ? enabled.indexOf(activeItem) : -1
    const loop = root.dataset.loop !== 'false'

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (enabled.length === 0) return

      const direction = event.key === 'ArrowDown' ? 1 : -1
      let nextIndex = currentIndex + direction
      if (currentIndex < 0) nextIndex = direction === 1 ? 0 : enabled.length - 1
      else if (loop) nextIndex = (nextIndex + enabled.length) % enabled.length
      else nextIndex = Math.min(Math.max(nextIndex, 0), enabled.length - 1)

      setActive(enabled[nextIndex], true)
      return
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      setActive(event.key === 'Home' ? enabled[0] : enabled.at(-1), true)
      return
    }

    if (event.key === 'Enter' && activeItem) {
      event.preventDefault()
      selectItem(activeItem)
      return
    }

    if (event.key === 'Escape' && input.value) {
      event.preventDefault()
      event.stopPropagation()
      input.value = ''
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }

  function onClick(event: MouseEvent) {
    const target = event.target
    if (!(target instanceof Element)) return

    const item = target.closest<HTMLElement>(itemSelector)
    if (item && belongsToRoot(item, root)) selectItem(item)
  }

  function onPointerDown(event: PointerEvent) {
    const target = event.target
    if (!(target instanceof Element)) return

    const item = target.closest<HTMLElement>(itemSelector)
    if (item && belongsToRoot(item, root)) event.preventDefault()
  }

  function onPointerMove(event: PointerEvent) {
    const target = event.target
    if (!(target instanceof Element)) return

    const item = target.closest<HTMLElement>(itemSelector)
    if (
      item &&
      belongsToRoot(item, root) &&
      !item.hidden &&
      !isDisabled(item)
    ) {
      setActive(item)
    }
  }

  const observer = new MutationObserver((mutations) => {
    if (
      destroyed ||
      mutations.every((mutation) => {
        const target =
          mutation.target instanceof Element
            ? mutation.target
            : mutation.target.parentElement
        return target?.closest("[data-slot='command-empty']") !== null
      })
    ) {
      return
    }

    refresh()
  })

  input.addEventListener('input', onInput)
  input.addEventListener('keydown', onKeyDown)
  root.addEventListener('click', onClick)
  root.addEventListener('pointerdown', onPointerDown)
  root.addEventListener('pointermove', onPointerMove)
  observer.observe(root, {
    attributeFilter: [
      'data-disabled',
      'data-filter',
      'data-keywords',
      'data-text-value',
      'data-value',
    ],
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  })

  refresh()

  return {
    destroy() {
      destroyed = true
      observer.disconnect()
      input.removeEventListener('input', onInput)
      input.removeEventListener('keydown', onKeyDown)
      root.removeEventListener('click', onClick)
      root.removeEventListener('pointerdown', onPointerDown)
      root.removeEventListener('pointermove', onPointerMove)
    },
    refresh,
  }
}
