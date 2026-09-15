export const SELECT_VALUE_CHANGE_EVENT = 'hulla-select-value-change'

export type SelectValue = string | string[]

export type SelectValueChangeDetail = {
  value: SelectValue
}

export type SelectController = {
  destroy: () => void
  getValue: () => SelectValue
  refresh: () => void
  setValue: (value: SelectValue) => void
}

const optionSelector = "[data-slot='select-option']"
let selectContentId = 0

function belongsToRoot(element: Element, root: HTMLElement): boolean {
  return element.closest<HTMLElement>("[data-slot='select']") === root
}

function optionElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(optionSelector)).filter(
    (option) => belongsToRoot(option, root)
  )
}

function groupElements(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>("[data-slot='select-group']")
  ).filter((group) => belongsToRoot(group, root))
}

function valueElements(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>("[data-slot='select-value']")
  ).filter((value) => belongsToRoot(value, root))
}

function isDisabledOption(option: HTMLElement): boolean {
  return (
    option.dataset.disabled === 'true' ||
    option.getAttribute('aria-disabled') === 'true'
  )
}

function optionValue(option: HTMLElement): string {
  return option.dataset.value ?? ''
}

function optionText(option: HTMLElement): string {
  return (option.dataset.textValue || option.textContent || '').trim()
}

function parseInitialValue(root: HTMLElement, multiple: boolean): string[] {
  const serialized = root.dataset.initialValue
  if (!serialized) return []

  try {
    const parsed = JSON.parse(serialized) as unknown
    if (multiple) {
      return Array.isArray(parsed)
        ? parsed.filter(
            (value): value is string =>
              typeof value === 'string' && value !== ''
          )
        : []
    }

    return typeof parsed === 'string' && parsed !== '' ? [parsed] : []
  } catch {
    return []
  }
}

function nextEnabledOption(
  options: HTMLElement[],
  active: HTMLElement | null,
  direction: 1 | -1
): HTMLElement | undefined {
  const enabled = options.filter((option) => !isDisabledOption(option))
  if (enabled.length === 0) return undefined

  const activeIndex = active ? enabled.indexOf(active) : -1
  if (activeIndex === -1) return direction === 1 ? enabled[0] : enabled.at(-1)
  return enabled[(activeIndex + direction + enabled.length) % enabled.length]
}

export function connectSelect(root: HTMLElement): SelectController {
  const triggerElement = root.querySelector<HTMLButtonElement>(
    "[data-slot='select-trigger']"
  )
  const contentElement = root.querySelector<HTMLElement>(
    "[data-slot='select-content']"
  )
  const bridgeElement = root.querySelector<HTMLSelectElement>(
    "[data-slot='select-native-control']"
  )

  if (!triggerElement || !contentElement || !bridgeElement) {
    root.dataset.unsupported = 'missing-part'
    return {
      destroy: () => undefined,
      getValue: () => (root.dataset.multiple === 'true' ? [] : ''),
      refresh: () => undefined,
      setValue: () => undefined,
    }
  }

  const trigger = triggerElement
  const content = contentElement
  const bridge = bridgeElement
  const multiple = () => root.dataset.multiple === 'true'
  let selectedValues = parseInitialValue(root, multiple())
  const initialValues = [...selectedValues]
  let typeahead = ''
  let typeaheadTimer: ReturnType<typeof setTimeout> | undefined
  let syncingBridge = false
  let destroyed = false

  if (!content.id) {
    selectContentId += 1
    content.id = root.id
      ? `${root.id}-content`
      : `hulla-select-content-${selectContentId}`
  }

  function options() {
    return optionElements(root)
  }

  function enabledOptions() {
    return options().filter((option) => !isDisabledOption(option))
  }

  function currentValue(): SelectValue {
    return multiple() ? [...selectedValues] : (selectedValues[0] ?? '')
  }

  function isOpen() {
    try {
      return content.matches(':popover-open')
    } catch {
      return content.dataset.state === 'open'
    }
  }

  function setHighlighted(option: HTMLElement | undefined) {
    options().forEach((candidate) => {
      if (candidate === option) candidate.dataset.highlighted = 'true'
      else delete candidate.dataset.highlighted
    })
  }

  function focusOption(option: HTMLElement | undefined) {
    if (!option) return
    option.focus({ preventScroll: true })
    option.scrollIntoView({ block: 'nearest' })
    setHighlighted(option)
  }

  function updateBridge() {
    const selected = new Set(selectedValues)
    Array.from(bridge.options).forEach((option) => {
      option.selected =
        option.value === '' ? selected.size === 0 : selected.has(option.value)
    })
  }

  function updateValueDisplay() {
    const selected = new Set(selectedValues)
    const labels = options()
      .filter((option) => selected.has(optionValue(option)))
      .map(optionText)
      .filter(Boolean)

    valueElements(root).forEach((value) => {
      const placeholder = value.dataset.placeholder ?? ''
      value.textContent = labels.length > 0 ? labels.join(', ') : placeholder
      value.dataset.state = labels.length > 0 ? 'value' : 'placeholder'
    })

    root.dataset.empty = selectedValues.length === 0 ? 'true' : 'false'
  }

  function updateSelection() {
    const selected = new Set(selectedValues)
    options().forEach((option) => {
      const isSelected = selected.has(optionValue(option))
      option.setAttribute('aria-selected', String(isSelected))
      if (isSelected) option.dataset.selected = 'true'
      else delete option.dataset.selected
    })

    updateBridge()
    updateValueDisplay()
  }

  function normalizeValue(value: SelectValue): string[] {
    const requested = Array.isArray(value) ? value : value ? [value] : []
    const available = new Set(options().map(optionValue))
    const normalized = requested.filter(
      (candidate, index) =>
        candidate !== '' &&
        available.has(candidate) &&
        requested.indexOf(candidate) === index
    )
    return multiple() ? normalized : normalized.slice(0, 1)
  }

  function setValue(value: SelectValue) {
    selectedValues = normalizeValue(value)
    updateSelection()
  }

  function emitValueChange() {
    syncingBridge = true
    bridge.dispatchEvent(new Event('input', { bubbles: true }))
    bridge.dispatchEvent(new Event('change', { bubbles: true }))
    syncingBridge = false

    root.dispatchEvent(
      new CustomEvent<SelectValueChangeDetail>(SELECT_VALUE_CHANGE_EVENT, {
        bubbles: true,
        detail: { value: currentValue() },
      })
    )
  }

  function hideContent({ restoreFocus = true } = {}) {
    if (typeof content.hidePopover === 'function' && isOpen())
      content.hidePopover()
    if (restoreFocus) trigger.focus({ preventScroll: true })
  }

  function showContent(focus: 'first' | 'last' | 'selected' = 'selected') {
    if (root.dataset.disabled === 'true' || trigger.disabled) return

    if (typeof content.showPopover === 'function' && !isOpen()) {
      try {
        content.showPopover()
      } catch {
        return
      }
    }

    const enabled = enabledOptions()
    const selected = enabled.find((option) =>
      selectedValues.includes(optionValue(option))
    )
    const target =
      focus === 'first'
        ? enabled[0]
        : focus === 'last'
          ? enabled.at(-1)
          : (selected ?? enabled[0])
    queueMicrotask(() => focusOption(target))
  }

  function selectOption(option: HTMLElement) {
    if (root.dataset.disabled === 'true' || isDisabledOption(option)) return

    const value = optionValue(option)
    if (!value) return

    if (multiple()) {
      selectedValues = selectedValues.includes(value)
        ? selectedValues.filter((selected) => selected !== value)
        : [...selectedValues, value]
    } else {
      selectedValues = [value]
    }

    updateSelection()
    emitValueChange()

    if (multiple()) focusOption(option)
    else hideContent()
  }

  function rebuildBridge({ initial = false } = {}) {
    const optionNodes = options()
    bridge.replaceChildren()

    if (!multiple()) {
      const placeholderOption = bridge.ownerDocument.createElement('option')
      placeholderOption.value = ''
      placeholderOption.hidden = true
      bridge.append(placeholderOption)
    }

    optionNodes.forEach((optionNode) => {
      const option = bridge.ownerDocument.createElement('option')
      option.value = optionValue(optionNode)
      option.textContent = optionText(optionNode)
      option.disabled = isDisabledOption(optionNode)
      bridge.append(option)
    })

    selectedValues = normalizeValue(selectedValues)
    updateSelection()

    if (initial) {
      const selected = new Set(initialValues)
      Array.from(bridge.options).forEach((option) => {
        option.defaultSelected =
          option.value === '' ? selected.size === 0 : selected.has(option.value)
      })
    }
  }

  function refresh() {
    const rootDisabled = root.dataset.disabled === 'true'
    trigger.disabled = rootDisabled || trigger.dataset.disabled === 'true'
    trigger.setAttribute('aria-controls', content.id)
    trigger.setAttribute('aria-expanded', String(isOpen()))
    trigger.setAttribute('aria-haspopup', 'listbox')
    trigger.setAttribute('popovertarget', content.id)
    content.setAttribute('aria-multiselectable', multiple() ? 'true' : 'false')
    content.dataset.state = isOpen() ? 'open' : 'closed'
    bridge.multiple = multiple()
    bridge.disabled = rootDisabled

    groupElements(root).forEach((group, index) => {
      const label = Array.from(
        group.querySelectorAll<HTMLElement>("[data-slot='select-group-label']")
      ).find(
        (candidate) => candidate.closest("[data-slot='select-group']") === group
      )
      if (!label) return

      if (!label.id) label.id = `${content.id}-group-${index + 1}-label`
      group.setAttribute('aria-labelledby', label.id)
    })

    updateSelection()
  }

  function onToggle(event: ToggleEvent) {
    const open = event.newState === 'open'
    content.dataset.state = open ? 'open' : 'closed'
    trigger.dataset.state = open ? 'open' : 'closed'
    trigger.setAttribute('aria-expanded', String(open))

    if (open) {
      const selected = enabledOptions().find((option) =>
        selectedValues.includes(optionValue(option))
      )
      queueMicrotask(() => focusOption(selected ?? enabledOptions()[0]))
      return
    }

    setHighlighted(undefined)
    if (content.contains(content.ownerDocument.activeElement)) {
      trigger.focus({ preventScroll: true })
    }
  }

  function onKeyDown(event: KeyboardEvent) {
    const target = event.target
    if (!(target instanceof Element)) return

    if (target.closest("[data-slot='select-trigger']") === trigger) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        showContent(event.key === 'ArrowDown' ? 'first' : 'last')
      }
      return
    }

    const activeOption = target.closest<HTMLElement>(optionSelector)
    if (!activeOption || !belongsToRoot(activeOption, root)) return

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      focusOption(
        nextEnabledOption(
          options(),
          activeOption,
          event.key === 'ArrowDown' ? 1 : -1
        )
      )
      return
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      const enabled = enabledOptions()
      focusOption(event.key === 'Home' ? enabled[0] : enabled.at(-1))
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectOption(activeOption)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      hideContent()
      return
    }

    if (event.key === 'Tab') {
      hideContent({ restoreFocus: false })
      return
    }

    if (
      event.key.length !== 1 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return

    typeahead += event.key.toLocaleLowerCase()
    clearTimeout(typeaheadTimer)
    typeaheadTimer = setTimeout(() => {
      typeahead = ''
      typeaheadTimer = undefined
    }, 500)

    const enabled = enabledOptions()
    const activeIndex = enabled.indexOf(activeOption)
    const searchOrder =
      activeIndex === -1
        ? enabled
        : [
            ...enabled.slice(activeIndex + 1),
            ...enabled.slice(0, activeIndex + 1),
          ]
    const match = searchOrder.find((option) =>
      optionText(option).toLocaleLowerCase().startsWith(typeahead)
    )
    if (match) {
      event.preventDefault()
      focusOption(match)
    }
  }

  function onClick(event: MouseEvent) {
    const target = event.target
    if (!(target instanceof Element)) return
    const option = target.closest<HTMLElement>(optionSelector)
    if (option && belongsToRoot(option, root)) selectOption(option)
  }

  function onPointerMove(event: PointerEvent) {
    const target = event.target
    if (!(target instanceof Element)) return
    const option = target.closest<HTMLElement>(optionSelector)
    if (option && belongsToRoot(option, root) && !isDisabledOption(option)) {
      focusOption(option)
    }
  }

  function onBridgeChange() {
    if (syncingBridge) return
    selectedValues = Array.from(bridge.selectedOptions)
      .map((option) => option.value)
      .filter(Boolean)
    updateSelection()
  }

  function onBridgeInvalid(event: Event) {
    event.preventDefault()
    trigger.setAttribute('aria-invalid', 'true')
    trigger.focus({ preventScroll: true })
  }

  function onFormReset() {
    queueMicrotask(() => {
      selectedValues = Array.from(bridge.selectedOptions)
        .map((option) => option.value)
        .filter(Boolean)
      updateSelection()
    })
  }

  const observer = new MutationObserver((mutations) => {
    if (
      destroyed ||
      mutations.every((mutation) => {
        const target =
          mutation.target instanceof Element
            ? mutation.target
            : mutation.target.parentElement
        return target
          ? bridge.contains(target) ||
              target === bridge ||
              Boolean(target.closest("[data-slot='select-value']"))
          : false
      })
    ) {
      return
    }

    rebuildBridge()
    refresh()
  })

  root.addEventListener('keydown', onKeyDown)
  root.addEventListener('click', onClick)
  root.addEventListener('pointermove', onPointerMove)
  content.addEventListener('toggle', onToggle)
  bridge.addEventListener('change', onBridgeChange)
  bridge.addEventListener('invalid', onBridgeInvalid)
  bridge.form?.addEventListener('reset', onFormReset)
  observer.observe(root, {
    attributeFilter: ['data-disabled', 'data-text-value', 'data-value'],
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  })

  rebuildBridge({ initial: true })
  refresh()

  return {
    destroy() {
      destroyed = true
      clearTimeout(typeaheadTimer)
      observer.disconnect()
      root.removeEventListener('keydown', onKeyDown)
      root.removeEventListener('click', onClick)
      root.removeEventListener('pointermove', onPointerMove)
      content.removeEventListener('toggle', onToggle)
      bridge.removeEventListener('change', onBridgeChange)
      bridge.removeEventListener('invalid', onBridgeInvalid)
      bridge.form?.removeEventListener('reset', onFormReset)
    },
    getValue: currentValue,
    refresh,
    setValue,
  }
}
