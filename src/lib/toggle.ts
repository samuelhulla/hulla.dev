export const TOGGLE_PRESSED_CHANGE_EVENT = 'hulla-toggle-pressed-change'
export const TOGGLE_GROUP_VALUE_CHANGE_EVENT = 'hulla-toggle-group-value-change'

export type TogglePressedChangeDetail = {
  pressed: boolean
}

export type ToggleGroupType = 'multiple' | 'single'
export type ToggleGroupValue = string | string[]

export type ToggleGroupValueChangeDetail = {
  value: ToggleGroupValue
}

export type ToggleController = {
  destroy: () => void
  getPressed: () => boolean
  setPressed: (pressed: boolean) => void
}

export type ToggleGroupController = {
  destroy: () => void
  getValue: () => ToggleGroupValue
  refresh: () => void
  setValue: (value: ToggleGroupValue) => void
}

const toggleSelector = "[data-slot='toggle']"

function isDisabled(toggle: HTMLButtonElement): boolean {
  return toggle.disabled || toggle.getAttribute('aria-disabled') === 'true'
}

function pressed(toggle: HTMLButtonElement): boolean {
  return toggle.getAttribute('aria-pressed') === 'true'
}

function setPressedState(toggle: HTMLButtonElement, nextPressed: boolean) {
  const pressedValue = String(nextPressed)
  const state = nextPressed ? 'on' : 'off'
  if (toggle.getAttribute('aria-pressed') !== pressedValue) {
    toggle.setAttribute('aria-pressed', pressedValue)
  }
  if (toggle.dataset.state !== state) toggle.dataset.state = state
}

function belongsToGroup(toggle: Element, root: HTMLElement): boolean {
  return toggle.closest<HTMLElement>("[data-slot='toggle-group']") === root
}

function groupToggles(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(
    root.querySelectorAll<HTMLButtonElement>(toggleSelector)
  ).filter((toggle) => belongsToGroup(toggle, root))
}

function toggleValue(toggle: HTMLButtonElement): string {
  return toggle.value
}

function normalizeMultipleValue(value: ToggleGroupValue): string[] {
  const values = Array.isArray(value) ? value : value ? [value] : []
  return Array.from(new Set(values))
}

function initialGroupValue(root: HTMLElement): ToggleGroupValue {
  const fallback = root.dataset.type === 'multiple' ? [] : ''
  const serialized = root.dataset.initialValue
  if (!serialized) return fallback

  try {
    const parsed: unknown = JSON.parse(serialized)
    if (
      Array.isArray(parsed) &&
      parsed.every((item) => typeof item === 'string')
    )
      return parsed
    if (typeof parsed === 'string') return parsed
  } catch {
    return fallback
  }

  return fallback
}

export function connectToggle(toggle: HTMLButtonElement): ToggleController {
  const onClick = () => {
    if (isDisabled(toggle) || toggle.closest("[data-slot='toggle-group']"))
      return

    const nextPressed = !pressed(toggle)
    setPressedState(toggle, nextPressed)
    toggle.dispatchEvent(
      new CustomEvent<TogglePressedChangeDetail>(TOGGLE_PRESSED_CHANGE_EVENT, {
        bubbles: true,
        detail: { pressed: nextPressed },
      })
    )
  }

  setPressedState(toggle, pressed(toggle))
  toggle.addEventListener('click', onClick)

  return {
    destroy() {
      toggle.removeEventListener('click', onClick)
    },
    getPressed: () => pressed(toggle),
    setPressed: (nextPressed) => setPressedState(toggle, nextPressed),
  }
}

export function connectToggleGroup(root: HTMLElement): ToggleGroupController {
  let value: ToggleGroupValue = initialGroupValue(root)
  let destroyed = false

  function type(): ToggleGroupType {
    return root.dataset.type === 'multiple' ? 'multiple' : 'single'
  }

  function availableValues(): string[] {
    return groupToggles(root)
      .filter((toggle) => !isDisabled(toggle))
      .map(toggleValue)
      .filter(Boolean)
  }

  function normalizedValue(nextValue: ToggleGroupValue): ToggleGroupValue {
    const available = new Set(availableValues())

    if (type() === 'multiple') {
      return normalizeMultipleValue(nextValue).filter((item) =>
        available.has(item)
      )
    }

    const candidate = Array.isArray(nextValue)
      ? (nextValue[0] ?? '')
      : nextValue
    return available.has(candidate) ? candidate : ''
  }

  function updateState() {
    const selectedValues = new Set(
      Array.isArray(value) ? value : value ? [value] : []
    )

    groupToggles(root).forEach((toggle) => {
      setPressedState(toggle, selectedValues.has(toggleValue(toggle)))
    })

    root.dataset.value = Array.isArray(value) ? value.join(',') : value
  }

  function refresh() {
    const orientation =
      root.dataset.orientation === 'vertical' ? 'vertical' : 'horizontal'
    const nextType = type()
    if (root.dataset.orientation !== orientation)
      root.dataset.orientation = orientation
    if (root.dataset.type !== nextType) root.dataset.type = nextType
    value = normalizedValue(value)
    updateState()
  }

  function setValue(nextValue: ToggleGroupValue) {
    value = normalizedValue(nextValue)
    updateState()
  }

  function activate(toggle: HTMLButtonElement) {
    if (isDisabled(toggle)) return

    const selectedValue = toggleValue(toggle)
    if (!selectedValue) return

    if (type() === 'multiple') {
      const nextValues = new Set(Array.isArray(value) ? value : [])
      if (nextValues.has(selectedValue)) nextValues.delete(selectedValue)
      else nextValues.add(selectedValue)
      value = Array.from(nextValues)
    } else if (value === selectedValue) {
      if (root.dataset.required === 'true') return
      value = ''
    } else {
      value = selectedValue
    }

    updateState()
    root.dispatchEvent(
      new CustomEvent<ToggleGroupValueChangeDetail>(
        TOGGLE_GROUP_VALUE_CHANGE_EVENT,
        {
          bubbles: true,
          detail: { value },
        }
      )
    )
  }

  function onClick(event: MouseEvent) {
    const target = event.target
    if (!(target instanceof Element)) return

    const toggle = target.closest<HTMLButtonElement>(toggleSelector)
    if (toggle && belongsToGroup(toggle, root)) activate(toggle)
  }

  const observer = new MutationObserver((mutations) => {
    if (destroyed) return

    const relevant = mutations.some((mutation) => {
      const target =
        mutation.target instanceof Element
          ? mutation.target
          : mutation.target.parentElement
      return target ? target === root || belongsToGroup(target, root) : false
    })
    if (relevant) refresh()
  })

  root.addEventListener('click', onClick)
  observer.observe(root, {
    attributeFilter: [
      'aria-disabled',
      'aria-pressed',
      'data-type',
      'disabled',
      'value',
    ],
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
    },
    getValue: () => value,
    refresh,
    setValue,
  }
}
