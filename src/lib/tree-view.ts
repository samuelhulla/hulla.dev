export const TREE_VIEW_VALUE_CHANGE_EVENT = 'hulla-tree-view-value-change'
export const TREE_VIEW_EXPANDED_CHANGE_EVENT = 'hulla-tree-view-expanded-change'

export type TreeViewSelectionMode = 'none' | 'single'

export type TreeViewValueChangeDetail = {
  value: string
}

export type TreeViewExpandedChangeDetail = {
  expanded: boolean
  value: string
}

export type TreeViewController = {
  destroy: () => void
  getValue: () => string
  refresh: () => void
  setValue: (value: string) => void
}

const itemSelector = "[data-slot='tree-item']"
const groupSelector = "[data-slot='tree-group']"
const labelSelector = "[data-slot='tree-item-label']"
let treeViewId = 0

function belongsToRoot(element: Element, root: HTMLElement): boolean {
  return element.closest<HTMLElement>("[data-slot='tree-view']") === root
}

function items(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(itemSelector)).filter(
    (item) => belongsToRoot(item, root)
  )
}

function directGroup(item: HTMLElement): HTMLElement | undefined {
  return Array.from(item.children).find(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child.matches(groupSelector)
  )
}

function parentItem(
  item: HTMLElement,
  root: HTMLElement
): HTMLElement | undefined {
  const group = item.parentElement?.closest<HTMLElement>(groupSelector)
  const parent = group?.parentElement?.closest<HTMLElement>(itemSelector)
  return parent && belongsToRoot(parent, root) ? parent : undefined
}

function childItems(item: HTMLElement, root: HTMLElement): HTMLElement[] {
  const group = directGroup(item)
  if (!group) return []

  return Array.from(group.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement &&
      child.matches(itemSelector) &&
      belongsToRoot(child, root)
  )
}

function itemValue(item: HTMLElement): string {
  return item.dataset.value ?? ''
}

function isDisabled(item: HTMLElement): boolean {
  return item.getAttribute('aria-disabled') === 'true'
}

function isExpanded(item: HTMLElement): boolean {
  return item.getAttribute('aria-expanded') === 'true'
}

function isVisible(item: HTMLElement, root: HTMLElement): boolean {
  let ancestor = parentItem(item, root)
  while (ancestor) {
    if (!isExpanded(ancestor)) return false
    ancestor = parentItem(ancestor, root)
  }
  return !item.hidden
}

function visibleItems(root: HTMLElement): HTMLElement[] {
  return items(root).filter(
    (item) => !isDisabled(item) && isVisible(item, root)
  )
}

function focusItem(item: HTMLElement | undefined) {
  if (!item) return
  item.focus({ preventScroll: true })
  item.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

export function connectTreeView(root: HTMLElement): TreeViewController {
  const baseId = root.id || `hulla-tree-view-${++treeViewId}`
  const expandedStates = new WeakMap<HTMLElement, boolean>()
  let value = root.dataset.initialValue ?? ''
  let destroyed = false

  function selectionMode(): TreeViewSelectionMode {
    return root.dataset.selectionMode === 'none' ? 'none' : 'single'
  }

  function enabledValue(candidate: string): string {
    return items(root).some(
      (item) => !isDisabled(item) && itemValue(item) === candidate
    )
      ? candidate
      : ''
  }

  function setExpanded(item: HTMLElement, expanded: boolean, emit = false) {
    const group = directGroup(item)
    if (!group) return

    expandedStates.set(item, expanded)
    item.setAttribute('aria-expanded', String(expanded))
    item.dataset.expanded = expanded ? 'true' : 'false'
    group.hidden = !expanded
    group.dataset.state = expanded ? 'open' : 'closed'

    if (emit) {
      root.dispatchEvent(
        new CustomEvent<TreeViewExpandedChangeDetail>(
          TREE_VIEW_EXPANDED_CHANGE_EVENT,
          {
            bubbles: true,
            detail: { expanded, value: itemValue(item) },
          }
        )
      )
    }
  }

  function updateSelection() {
    const mode = selectionMode()
    const availableItems = items(root)

    availableItems.forEach((item) => {
      const selected =
        mode === 'single' && itemValue(item) !== '' && itemValue(item) === value

      if (mode === 'single')
        item.setAttribute('aria-selected', String(selected))
      else item.removeAttribute('aria-selected')

      item.dataset.state = selected ? 'selected' : 'unselected'
    })

    root.dataset.value = mode === 'single' ? value : ''
  }

  function refresh() {
    const availableItems = items(root)
    const mode = selectionMode()

    availableItems.forEach((item, index) => {
      if (!item.id) item.id = `${baseId}-item-${index + 1}`

      const group = directGroup(item)
      if (group) {
        const expanded = expandedStates.get(item) ?? isExpanded(item)
        if (!group.id) group.id = `${item.id}-group`
        item.setAttribute('aria-controls', group.id)
        setExpanded(item, expanded)
      } else {
        item.removeAttribute('aria-expanded')
        item.removeAttribute('aria-controls')
        item.removeAttribute('data-expanded')
      }
    })

    value = mode === 'single' ? enabledValue(value) : ''
    updateSelection()

    const currentTabStop = availableItems.find(
      (item) =>
        item.tabIndex === 0 && !isDisabled(item) && isVisible(item, root)
    )
    const selectedItem = availableItems.find(
      (item) =>
        item.getAttribute('aria-selected') === 'true' && !isDisabled(item)
    )
    const tabStop = currentTabStop ?? selectedItem ?? visibleItems(root)[0]

    availableItems.forEach((item) => {
      item.tabIndex = item === tabStop ? 0 : -1
    })
  }

  function setValue(nextValue: string) {
    if (selectionMode() !== 'single') return
    value = enabledValue(nextValue)
    updateSelection()
  }

  function select(item: HTMLElement) {
    if (selectionMode() !== 'single' || isDisabled(item)) return

    const nextValue = itemValue(item)
    if (!nextValue || nextValue === value) return

    value = nextValue
    updateSelection()
    root.dispatchEvent(
      new CustomEvent<TreeViewValueChangeDetail>(TREE_VIEW_VALUE_CHANGE_EVENT, {
        bubbles: true,
        detail: { value },
      })
    )
  }

  function moveFocus(item: HTMLElement) {
    items(root).forEach((candidate) => {
      candidate.tabIndex = candidate === item ? 0 : -1
    })
    focusItem(item)
  }

  function onKeyDown(event: KeyboardEvent) {
    const target = event.target
    if (!(target instanceof Element)) return

    const currentItem = target.closest<HTMLElement>(itemSelector)
    if (
      !currentItem ||
      !belongsToRoot(currentItem, root) ||
      isDisabled(currentItem)
    )
      return

    const availableItems = visibleItems(root)
    const currentIndex = availableItems.indexOf(currentItem)

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      moveFocus(availableItems[currentIndex + direction] ?? currentItem)
      return
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      moveFocus(
        event.key === 'Home' ? availableItems[0]! : availableItems.at(-1)!
      )
      return
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      const children = childItems(currentItem, root).filter(
        (item) => !isDisabled(item)
      )

      if (children.length === 0) return
      if (!isExpanded(currentItem)) setExpanded(currentItem, true, true)
      else moveFocus(children[0]!)
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      if (directGroup(currentItem) && isExpanded(currentItem)) {
        setExpanded(currentItem, false, true)
      } else {
        moveFocus(parentItem(currentItem, root) ?? currentItem)
      }
      return
    }

    if (event.key === '*') {
      event.preventDefault()
      const parent = parentItem(currentItem, root)
      const siblings = parent
        ? childItems(parent, root)
        : items(root).filter((item) => !parentItem(item, root))
      siblings.forEach((item) => setExpanded(item, true, true))
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      select(currentItem)
      if (directGroup(currentItem))
        setExpanded(currentItem, !isExpanded(currentItem), true)
    }
  }

  function onClick(event: MouseEvent) {
    const target = event.target
    if (!(target instanceof Element)) return

    const label = target.closest<HTMLElement>(labelSelector)
    const item = label?.closest<HTMLElement>(itemSelector)
    if (!item || !belongsToRoot(item, root) || isDisabled(item)) return

    moveFocus(item)
    select(item)
    if (directGroup(item)) setExpanded(item, !isExpanded(item), true)
  }

  const observer = new MutationObserver((mutations) => {
    if (destroyed) return

    const relevant = mutations.some((mutation) => {
      const target =
        mutation.target instanceof Element
          ? mutation.target
          : mutation.target.parentElement
      return target ? target === root || belongsToRoot(target, root) : false
    })
    if (relevant) refresh()
  })

  root.addEventListener('click', onClick)
  root.addEventListener('keydown', onKeyDown)
  observer.observe(root, {
    attributeFilter: ['aria-disabled', 'data-selection-mode'],
    attributes: true,
    childList: true,
    subtree: true,
  })
  refresh()

  return {
    destroy() {
      destroyed = true
      observer.disconnect()
      root.removeEventListener('click', onClick)
      root.removeEventListener('keydown', onKeyDown)
    },
    getValue: () => value,
    refresh,
    setValue,
  }
}
