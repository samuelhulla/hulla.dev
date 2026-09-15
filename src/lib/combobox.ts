export const COMBOBOX_VALUE_CHANGE_EVENT = 'hulla-combobox-value-change'

export type ComboboxValue = string | string[]

export type ComboboxValueChangeDetail = {
  value: ComboboxValue
}

export type ComboboxController = {
  destroy: () => void
  getValue: () => ComboboxValue
  refresh: () => void
  setValue: (value: ComboboxValue) => void
}

const optionSelector = "[data-slot='combobox-option']"
let comboboxContentId = 0

function belongsToRoot(element: Element, root: HTMLElement): boolean {
  return element.closest<HTMLElement>("[data-slot='combobox']") === root
}

function optionElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(optionSelector)).filter(
    (option) => belongsToRoot(option, root)
  )
}

function groupElements(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>("[data-slot='combobox-group']")
  ).filter((group) => belongsToRoot(group, root))
}

function emptyElements(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>("[data-slot='combobox-empty']")
  ).filter((empty) => belongsToRoot(empty, root))
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

export function connectCombobox(root: HTMLElement): ComboboxController {
  const inputElement = root.querySelector<HTMLInputElement>(
    "[data-slot='combobox-input']"
  )
  const contentElement = root.querySelector<HTMLElement>(
    "[data-slot='combobox-content']"
  )
  const bridgeElement = root.querySelector<HTMLSelectElement>(
    "[data-slot='combobox-native-control']"
  )

  if (!inputElement || !contentElement || !bridgeElement) {
    root.dataset.unsupported = 'missing-part'
    return {
      destroy: () => undefined,
      getValue: () => (root.dataset.multiple === 'true' ? [] : ''),
      refresh: () => undefined,
      setValue: () => undefined,
    }
  }

  const input = inputElement
  const content = contentElement
  const bridge = bridgeElement
  const multiple = () => root.dataset.multiple === 'true'
  let selectedValues = parseInitialValue(root, multiple())
  const initialValues = [...selectedValues]
  let query = ''
  let editing = false
  let focusFromPointer = false
  let syncingBridge = false
  let destroyed = false

  if (!content.id) {
    comboboxContentId += 1
    content.id = root.id
      ? `${root.id}-content`
      : `hulla-combobox-content-${comboboxContentId}`
  }

  const anchorName = `--${content.id}-anchor`
  root.style.setProperty('anchor-name', anchorName)
  content.style.setProperty('position-anchor', anchorName)

  function options() {
    return optionElements(root)
  }

  function visibleOptions() {
    return options().filter((option) => !option.hidden)
  }

  function enabledVisibleOptions() {
    return visibleOptions().filter((option) => !isDisabledOption(option))
  }

  function currentValue(): ComboboxValue {
    return multiple() ? [...selectedValues] : (selectedValues[0] ?? '')
  }

  function isOpen() {
    try {
      return content.matches(':popover-open')
    } catch {
      return content.dataset.state === 'open'
    }
  }

  function selectedLabels() {
    const selected = new Set(selectedValues)
    return options()
      .filter((option) => selected.has(optionValue(option)))
      .map(optionText)
      .filter(Boolean)
  }

  function setHighlighted(option: HTMLElement | undefined) {
    options().forEach((candidate) => {
      if (candidate === option) candidate.dataset.highlighted = 'true'
      else delete candidate.dataset.highlighted
    })

    if (option?.id) input.setAttribute('aria-activedescendant', option.id)
    else input.removeAttribute('aria-activedescendant')
  }

  function updateInputDisplay() {
    const labels = selectedLabels()
    const displayValue = multiple() ? labels.join(', ') : (labels[0] ?? '')
    input.value = editing ? query : displayValue
    input.dataset.state =
      editing && query ? 'query' : displayValue ? 'value' : 'placeholder'
    root.dataset.empty = selectedValues.length === 0 ? 'true' : 'false'
  }

  function updateBridge() {
    const selected = new Set(selectedValues)
    Array.from(bridge.options).forEach((option) => {
      option.selected =
        option.value === '' ? selected.size === 0 : selected.has(option.value)
    })
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
    updateInputDisplay()
  }

  function normalizeValue(value: ComboboxValue): string[] {
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

  function setValue(value: ComboboxValue) {
    selectedValues = normalizeValue(value)
    updateSelection()
  }

  function emitValueChange() {
    syncingBridge = true
    bridge.dispatchEvent(new Event('input', { bubbles: true }))
    bridge.dispatchEvent(new Event('change', { bubbles: true }))
    syncingBridge = false

    root.dispatchEvent(
      new CustomEvent<ComboboxValueChangeDetail>(COMBOBOX_VALUE_CHANGE_EVENT, {
        bubbles: true,
        detail: { value: currentValue() },
      })
    )
  }

  function filterOptions() {
    const normalizedQuery = query.trim().toLocaleLowerCase()

    options().forEach((option) => {
      option.hidden =
        normalizedQuery !== '' &&
        !optionText(option).toLocaleLowerCase().includes(normalizedQuery)
    })

    groupElements(root).forEach((group) => {
      const groupOptions = Array.from(
        group.querySelectorAll<HTMLElement>(optionSelector)
      ).filter(
        (option) => option.closest("[data-slot='combobox-group']") === group
      )
      group.hidden =
        groupOptions.length > 0 && groupOptions.every((option) => option.hidden)
    })

    const hasResults = visibleOptions().length > 0
    emptyElements(root).forEach((empty) => {
      empty.hidden = hasResults
    })
  }

  function hideContent() {
    if (typeof content.hidePopover === 'function' && isOpen())
      content.hidePopover()
    editing = false
    query = ''
    filterOptions()
    setHighlighted(undefined)
    updateInputDisplay()
  }

  function showContent() {
    if (root.dataset.disabled === 'true' || input.disabled) return

    editing = true
    input.setAttribute('aria-expanded', 'true')
    content.dataset.state = 'open'

    if (typeof content.showPopover === 'function' && !isOpen()) {
      try {
        content.showPopover()
      } catch {
        return
      }
    }
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

    query = ''
    filterOptions()
    updateSelection()
    emitValueChange()

    if (multiple()) {
      editing = true
      updateInputDisplay()
      input.focus({ preventScroll: true })
      setHighlighted(enabledVisibleOptions()[0])
    } else {
      hideContent()
      input.focus({ preventScroll: true })
    }
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
    input.disabled = rootDisabled || input.dataset.disabled === 'true'
    input.setAttribute('aria-controls', content.id)
    input.setAttribute('aria-expanded', String(isOpen()))
    input.setAttribute('aria-autocomplete', 'list')
    content.setAttribute('aria-multiselectable', multiple() ? 'true' : 'false')
    content.dataset.state = isOpen() ? 'open' : 'closed'
    bridge.multiple = multiple()
    bridge.disabled = rootDisabled

    options().forEach((option, index) => {
      if (!option.id) option.id = `${content.id}-option-${index + 1}`
    })

    groupElements(root).forEach((group, index) => {
      const label = Array.from(
        group.querySelectorAll<HTMLElement>(
          "[data-slot='combobox-group-label']"
        )
      ).find(
        (candidate) =>
          candidate.closest("[data-slot='combobox-group']") === group
      )
      if (!label) return

      if (!label.id) label.id = `${content.id}-group-${index + 1}-label`
      group.setAttribute('aria-labelledby', label.id)
    })

    filterOptions()
    updateSelection()
  }

  function onToggle(event: ToggleEvent) {
    const open = event.newState === 'open'
    content.dataset.state = open ? 'open' : 'closed'
    input.setAttribute('aria-expanded', String(open))

    if (!open) {
      editing = false
      query = ''
      filterOptions()
      setHighlighted(undefined)
      updateInputDisplay()
    }
  }

  function onFocus() {
    query = ''
    editing = true
    filterOptions()
    updateInputDisplay()
    if (!focusFromPointer) showContent()
    setHighlighted(focusFromPointer ? undefined : enabledVisibleOptions()[0])
  }

  function onInput() {
    query = input.value
    editing = true
    filterOptions()
    showContent()
    setHighlighted(enabledVisibleOptions()[0])
  }

  function onKeyDown(event: KeyboardEvent) {
    const enabled = enabledVisibleOptions()
    const activeId = input.getAttribute('aria-activedescendant')
    const active = activeId
      ? enabled.find((option) => option.id === activeId)
      : undefined

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      showContent()
      if (enabled.length === 0) return

      const activeIndex = active ? enabled.indexOf(active) : -1
      const nextIndex =
        event.key === 'ArrowDown'
          ? activeIndex < 0
            ? 0
            : (activeIndex + 1) % enabled.length
          : activeIndex < 0
            ? enabled.length - 1
            : (activeIndex - 1 + enabled.length) % enabled.length
      setHighlighted(enabled[nextIndex])
      enabled[nextIndex]?.scrollIntoView({ block: 'nearest' })
      return
    }

    if (event.key === 'Enter' && active && isOpen()) {
      event.preventDefault()
      selectOption(active)
      return
    }

    if (event.key === 'Escape' && (isOpen() || query)) {
      event.preventDefault()
      event.stopPropagation()
      hideContent()
      return
    }

    if (event.key === 'Tab') hideContent()
  }

  function onClick(event: MouseEvent) {
    const target = event.target
    if (!(target instanceof Element)) return

    if (target === input) {
      showContent()
      return
    }

    const option = target.closest<HTMLElement>(optionSelector)
    if (option && belongsToRoot(option, root)) selectOption(option)
  }

  function onPointerDown(event: PointerEvent) {
    const target = event.target
    if (!(target instanceof Element)) return

    if (target === input) {
      focusFromPointer = true
      return
    }

    const option = target.closest<HTMLElement>(optionSelector)
    if (option && belongsToRoot(option, root)) event.preventDefault()
  }

  function onPointerEnd() {
    focusFromPointer = false
  }

  function onPointerMove(event: PointerEvent) {
    const target = event.target
    if (!(target instanceof Element)) return
    const option = target.closest<HTMLElement>(optionSelector)
    if (
      option &&
      belongsToRoot(option, root) &&
      !option.hidden &&
      !isDisabledOption(option)
    ) {
      setHighlighted(option)
    }
  }

  function onBlur() {
    queueMicrotask(() => {
      const active = root.ownerDocument.activeElement
      if (!active || (!root.contains(active) && !content.contains(active)))
        hideContent()
    })
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
    input.setAttribute('aria-invalid', 'true')
    input.focus({ preventScroll: true })
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
        return target ? bridge.contains(target) || target === bridge : false
      })
    ) {
      return
    }

    rebuildBridge()
    refresh()
  })

  input.addEventListener('focus', onFocus)
  input.addEventListener('input', onInput)
  input.addEventListener('keydown', onKeyDown)
  input.addEventListener('blur', onBlur)
  root.addEventListener('click', onClick)
  root.addEventListener('pointerdown', onPointerDown)
  root.addEventListener('pointermove', onPointerMove)
  root.ownerDocument.addEventListener('pointercancel', onPointerEnd)
  root.ownerDocument.addEventListener('pointerup', onPointerEnd)
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
      observer.disconnect()
      input.removeEventListener('focus', onFocus)
      input.removeEventListener('input', onInput)
      input.removeEventListener('keydown', onKeyDown)
      input.removeEventListener('blur', onBlur)
      root.removeEventListener('click', onClick)
      root.removeEventListener('pointerdown', onPointerDown)
      root.removeEventListener('pointermove', onPointerMove)
      root.ownerDocument.removeEventListener('pointercancel', onPointerEnd)
      root.ownerDocument.removeEventListener('pointerup', onPointerEnd)
      content.removeEventListener('toggle', onToggle)
      bridge.removeEventListener('change', onBridgeChange)
      bridge.removeEventListener('invalid', onBridgeInvalid)
      bridge.form?.removeEventListener('reset', onFormReset)
      if (root.style.getPropertyValue('anchor-name') === anchorName) {
        root.style.removeProperty('anchor-name')
      }
      if (content.style.getPropertyValue('position-anchor') === anchorName) {
        content.style.removeProperty('position-anchor')
      }
    },
    getValue: currentValue,
    refresh,
    setValue,
  }
}
