export const TABS_VALUE_CHANGE_EVENT = 'hulla-tabs-value-change'

export type TabsValueChangeDetail = {
  value: string
}

export type TabsController = {
  destroy: () => void
  getValue: () => string
  refresh: () => void
  setValue: (value: string) => void
}

const tabSelector = "[data-slot='tabs-trigger']"
const panelSelector = "[data-slot='tabs-content']"
let tabsId = 0

function belongsToRoot(element: Element, root: HTMLElement): boolean {
  return element.closest<HTMLElement>("[data-slot='tabs']") === root
}

function tabElements(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(
    root.querySelectorAll<HTMLButtonElement>(tabSelector)
  ).filter((tab) => belongsToRoot(tab, root))
}

function panelElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(panelSelector)).filter(
    (panel) => belongsToRoot(panel, root)
  )
}

function isDisabled(tab: HTMLButtonElement): boolean {
  return (
    tab.disabled ||
    tab.dataset.disabled === 'true' ||
    tab.getAttribute('aria-disabled') === 'true'
  )
}

function tabValue(tab: HTMLElement): string {
  return tab.dataset.value ?? ''
}

export function connectTabs(root: HTMLElement): TabsController {
  const baseId = root.id || `hulla-tabs-${++tabsId}`
  let selectedValue = root.dataset.initialValue ?? ''
  let destroyed = false

  function tabs() {
    return tabElements(root)
  }

  function panels() {
    return panelElements(root)
  }

  function enabledTabs() {
    return tabs().filter((tab) => !isDisabled(tab) && tabValue(tab) !== '')
  }

  function normalizedValue(value: string): string {
    return enabledTabs().some((tab) => tabValue(tab) === value) ? value : ''
  }

  function updateSelection() {
    const availableTabs = tabs()
    const availablePanels = panels()

    availableTabs.forEach((tab, index) => {
      const value = tabValue(tab)
      const panel = availablePanels.find(
        (candidate) => tabValue(candidate) === value
      )
      const disabled = isDisabled(tab)
      const active = !disabled && value !== '' && value === selectedValue

      if (!tab.id) tab.id = `${baseId}-tab-${index + 1}`
      tab.setAttribute('aria-selected', String(active))
      tab.tabIndex = active ? 0 : -1
      tab.dataset.state = active ? 'active' : 'inactive'

      if (panel) {
        if (!panel.id) panel.id = `${baseId}-panel-${index + 1}`
        tab.setAttribute('aria-controls', panel.id)
        panel.setAttribute('aria-labelledby', tab.id)
      } else {
        tab.removeAttribute('aria-controls')
      }
    })

    availablePanels.forEach((panel) => {
      const active = tabValue(panel) !== '' && tabValue(panel) === selectedValue
      panel.hidden = !active
      panel.dataset.state = active ? 'active' : 'inactive'
    })

    if (root.dataset.value !== selectedValue) root.dataset.value = selectedValue
  }

  function refresh() {
    const tabList = Array.from(
      root.querySelectorAll<HTMLElement>("[data-slot='tabs-list']")
    ).find((candidate) => belongsToRoot(candidate, root))
    const orientation =
      root.dataset.orientation === 'vertical' ? 'vertical' : 'horizontal'

    if (tabList) {
      tabList.dataset.orientation = orientation
      tabList.setAttribute('aria-orientation', orientation)
    }

    selectedValue =
      normalizedValue(selectedValue) || tabValue(enabledTabs()[0] ?? root)
    updateSelection()
  }

  function setValue(value: string) {
    const nextValue = normalizedValue(value)
    if (!nextValue) return
    selectedValue = nextValue
    updateSelection()
  }

  function activate(tab: HTMLButtonElement) {
    if (isDisabled(tab)) return

    const nextValue = tabValue(tab)
    if (!nextValue || nextValue === selectedValue) return

    selectedValue = nextValue
    updateSelection()
    root.dispatchEvent(
      new CustomEvent<TabsValueChangeDetail>(TABS_VALUE_CHANGE_EVENT, {
        bubbles: true,
        detail: { value: selectedValue },
      })
    )
  }

  function focusTab(tab: HTMLButtonElement | undefined) {
    if (!tab) return
    tab.focus({ preventScroll: true })
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    if (root.dataset.activationMode !== 'manual') activate(tab)
  }

  function onKeyDown(event: KeyboardEvent) {
    const target = event.target
    if (!(target instanceof Element)) return

    const currentTab = target.closest<HTMLButtonElement>(tabSelector)
    if (
      !currentTab ||
      !belongsToRoot(currentTab, root) ||
      isDisabled(currentTab)
    )
      return

    const orientation =
      root.dataset.orientation === 'vertical' ? 'vertical' : 'horizontal'
    const previousKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
    const availableTabs = enabledTabs()
    const currentIndex = availableTabs.indexOf(currentTab)

    if (event.key === previousKey || event.key === nextKey) {
      event.preventDefault()
      const direction = event.key === nextKey ? 1 : -1
      const nextIndex =
        (currentIndex + direction + availableTabs.length) % availableTabs.length
      focusTab(availableTabs[nextIndex])
      return
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      focusTab(event.key === 'Home' ? availableTabs[0] : availableTabs.at(-1))
      return
    }

    if (
      root.dataset.activationMode === 'manual' &&
      (event.key === 'Enter' || event.key === ' ')
    ) {
      event.preventDefault()
      activate(currentTab)
    }
  }

  function onClick(event: MouseEvent) {
    const target = event.target
    if (!(target instanceof Element)) return
    const tab = target.closest<HTMLButtonElement>(tabSelector)
    if (tab && belongsToRoot(tab, root)) activate(tab)
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
  root.addEventListener('keydown', onKeyDown)
  observer.observe(root, {
    attributeFilter: ['aria-disabled', 'data-value', 'disabled'],
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
    getValue: () => selectedValue,
    refresh,
    setValue,
  }
}
