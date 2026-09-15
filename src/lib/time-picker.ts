export const TIME_PICKER_VALUE_CHANGE_EVENT = 'hulla-time-picker-value-change'

export type TimePickerValueChangeDetail = {
  value: string | null
}

export type TimePickerOption = {
  label: string
  value: string
}

export type TimePickerController = {
  destroy: () => void
  getValue: () => string | null
  refresh: () => void
  setValue: (value: string | null) => void
}

export type CreateTimeOptionsOptions = {
  hourCycle?: 'h11' | 'h12' | 'h23' | 'h24'
  locale?: string
  max?: string
  min?: string
  step?: number
  value?: string | null
}

type PopoverElement = HTMLElement & {
  hidePopover?: () => void
  matches: (selector: string) => boolean
}

type TimePickerPart = 'hour' | 'minute' | 'period'

const timePattern = /^(\d{2}):(\d{2})$/
const timePickerControllers = new WeakMap<HTMLElement, TimePickerController>()
let timePickerId = 0

function elementForSlot<T extends HTMLElement>(
  root: HTMLElement,
  slot: string
): T | undefined {
  return root.querySelector<T>(`[data-slot='${slot}']`) ?? undefined
}

function isPopoverOpen(surface: PopoverElement): boolean {
  try {
    return surface.matches(':popover-open')
  } catch {
    return surface.dataset.state === 'open'
  }
}

function hidePopover(surface: PopoverElement) {
  if (!isPopoverOpen(surface) || typeof surface.hidePopover !== 'function')
    return
  try {
    surface.hidePopover()
  } catch {
    // The browser may have already dismissed the transient popover.
  }
}

function initialPickerValue(root: HTMLElement): string | null {
  try {
    const candidate = JSON.parse(root.dataset.initialValue ?? 'null') as unknown
    return isTimeValue(candidate) &&
      timeWithinBounds(candidate, root.dataset.min, root.dataset.max)
      ? candidate
      : null
  } catch {
    return null
  }
}

export function isTimeValue(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const match = timePattern.exec(value)
  if (!match) return false
  const hour = Number(match[1])
  const minute = Number(match[2])
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59
}

export function timeToMinutes(value: string): number {
  if (!isTimeValue(value)) return Number.NaN
  const [hour, minute] = value.split(':').map(Number)
  return (hour ?? 0) * 60 + (minute ?? 0)
}

export function minutesToTime(value: number): string {
  const normalized = Math.min(24 * 60 - 1, Math.max(0, Math.floor(value)))
  const hour = Math.floor(normalized / 60)
  const minute = normalized % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function timeWithinBounds(
  value: string,
  min?: string,
  max?: string
): boolean {
  if (!isTimeValue(value)) return false
  if (isTimeValue(min) && value < min) return false
  if (isTimeValue(max) && value > max) return false
  return true
}

export function formatTimeValue(
  value: string,
  locale?: string,
  hourCycle: 'h11' | 'h12' | 'h23' | 'h24' = 'h23'
): string {
  if (!isTimeValue(value)) return value
  const [hour, minute] = value.split(':').map(Number)
  const date = new Date(0)
  date.setUTCHours(hour ?? 0, minute ?? 0, 0, 0)
  return new Intl.DateTimeFormat(locale, {
    hour: hourCycle === 'h23' || hourCycle === 'h24' ? '2-digit' : 'numeric',
    hourCycle,
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(date)
}

export function createTimeOptions({
  hourCycle,
  locale,
  max = '23:59',
  min = '00:00',
  step = 30,
  value,
}: CreateTimeOptionsOptions = {}): TimePickerOption[] {
  const normalizedMin = isTimeValue(min) ? min : '00:00'
  const normalizedMax = isTimeValue(max) ? max : '23:59'
  if (normalizedMin > normalizedMax) return []

  const interval = Math.min(24 * 60, Math.max(1, Math.floor(step)))
  const start = timeToMinutes(normalizedMin)
  const end = timeToMinutes(normalizedMax)
  const values: string[] = []

  for (let minutes = start; minutes <= end; minutes += interval) {
    values.push(minutesToTime(minutes))
  }

  if (
    isTimeValue(value) &&
    timeWithinBounds(value, normalizedMin, normalizedMax) &&
    !values.includes(value)
  ) {
    values.push(value)
    values.sort()
  }

  return values.map((optionValue) => ({
    label: formatTimeValue(optionValue, locale, hourCycle ?? 'h23'),
    value: optionValue,
  }))
}

function timeOptionValues(root: HTMLElement): string[] {
  try {
    const candidates = JSON.parse(root.dataset.options ?? '[]') as unknown
    if (!Array.isArray(candidates)) return []
    return candidates.filter(
      (candidate): candidate is string =>
        isTimeValue(candidate) &&
        timeWithinBounds(candidate, root.dataset.min, root.dataset.max)
    )
  } catch {
    return []
  }
}

function nearestTimeValue(
  values: string[],
  targetMinutes: number
): string | null {
  return (
    values.reduce<string | null>((nearest, value) => {
      if (!nearest) return value
      return Math.abs(timeToMinutes(value) - targetMinutes) <
        Math.abs(timeToMinutes(nearest) - targetMinutes)
        ? value
        : nearest
    }, null) ?? null
  )
}

function initialDraftValue(
  values: string[],
  selectedValue: string | null
): string | null {
  if (selectedValue) return selectedValue
  const now = new Date()
  return nearestTimeValue(values, now.getHours() * 60 + now.getMinutes())
}

export function timeValueParts(
  value: string,
  locale: string | undefined,
  hourCycle: 'h11' | 'h12' | 'h23' | 'h24'
): { hour: string; minute: string; period?: string } {
  const [hour, minute] = value.split(':').map(Number)
  const date = new Date(0)
  date.setUTCHours(hour ?? 0, minute ?? 0, 0, 0)
  const parts = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    hourCycle,
    minute: '2-digit',
    timeZone: 'UTC',
  }).formatToParts(date)

  return {
    hour:
      parts.find((part) => part.type === 'hour')?.value ??
      String(hour).padStart(2, '0'),
    minute:
      parts.find((part) => part.type === 'minute')?.value ??
      String(minute).padStart(2, '0'),
    period: parts.find((part) => part.type === 'dayPeriod')?.value,
  }
}

export function timePickerControllerFor(
  root: HTMLElement
): TimePickerController | undefined {
  return timePickerControllers.get(root)
}

export function connectTimePicker(root: HTMLElement): TimePickerController {
  const trigger = elementForSlot<HTMLButtonElement>(root, 'time-picker-trigger')
  const display = elementForSlot<HTMLElement>(root, 'time-picker-value')
  const surface =
    root.querySelector<PopoverElement>('[data-time-picker-popover]') ??
    elementForSlot<PopoverElement>(root, 'time-picker-popover')
  const controls = elementForSlot<HTMLElement>(root, 'time-picker-controls')
  const hourDisplay = elementForSlot<HTMLInputElement>(root, 'time-picker-hour')
  const minuteDisplay = elementForSlot<HTMLInputElement>(
    root,
    'time-picker-minute'
  )
  const hint = elementForSlot<HTMLElement>(root, 'time-picker-hint')
  const formInput = elementForSlot<HTMLInputElement>(root, 'time-picker-input')

  if (
    !trigger ||
    !display ||
    !surface ||
    !controls ||
    !hourDisplay ||
    !minuteDisplay ||
    !hint ||
    !formInput
  ) {
    root.dataset.unsupported = 'missing-part'
    return {
      destroy: () => undefined,
      getValue: () => null,
      refresh: () => undefined,
      setValue: () => undefined,
    }
  }

  const triggerControl = trigger
  const displayControl = display
  const surfaceControl = surface
  const controlsControl = controls
  const hourDisplayControl = hourDisplay
  const minuteDisplayControl = minuteDisplay
  const hintControl = hint
  const formControl = formInput

  timePickerId += 1
  const baseId = root.id || `hulla-time-picker-${timePickerId}`
  if (!root.id) root.id = baseId
  if (!triggerControl.id) triggerControl.id = `${baseId}-trigger`
  if (!surfaceControl.id) surfaceControl.id = `${baseId}-popover`
  if (!controlsControl.id) controlsControl.id = `${baseId}-controls`

  triggerControl.setAttribute('popovertarget', surfaceControl.id)
  triggerControl.setAttribute('aria-controls', surfaceControl.id)
  surfaceControl.setAttribute('aria-labelledby', triggerControl.id)

  const anchorName = `--${baseId}-anchor`
  triggerControl.style.setProperty('anchor-name', anchorName)
  surfaceControl.style.setProperty('position-anchor', anchorName)

  const defaultValue = initialPickerValue(root)
  let selectedValue = defaultValue
  let values = timeOptionValues(root)
  let draftValue = initialDraftValue(values, selectedValue)
  let activePart: TimePickerPart = 'hour'
  let destroyed = false
  const form = formControl.form

  function hourCycle(): 'h11' | 'h12' | 'h23' | 'h24' {
    const candidate = root.dataset.hourCycle
    return candidate === 'h11' || candidate === 'h12' || candidate === 'h24'
      ? candidate
      : 'h23'
  }

  function isTwelveHour() {
    return hourCycle() === 'h11' || hourCycle() === 'h12'
  }

  function minimumMinutes() {
    return isTimeValue(root.dataset.min) ? timeToMinutes(root.dataset.min) : 0
  }

  function maximumMinutes() {
    return isTimeValue(root.dataset.max)
      ? timeToMinutes(root.dataset.max)
      : 24 * 60 - 1
  }

  function stepMinutes() {
    const candidate = Number(root.dataset.step)
    return Number.isFinite(candidate)
      ? Math.min(24 * 60, Math.max(1, Math.floor(candidate)))
      : 30
  }

  function clampedValue(minutes: number): string {
    return minutesToTime(
      Math.min(maximumMinutes(), Math.max(minimumMinutes(), minutes))
    )
  }

  function setActivePart(part: TimePickerPart) {
    activePart = part
    root
      .querySelectorAll<HTMLElement>("[data-slot='time-picker-part']")
      .forEach((element) => {
        element.dataset.active =
          element.dataset.timePickerPart === activePart ? 'true' : 'false'
      })
  }

  function update() {
    const formatted = selectedValue
      ? formatTimeValue(
          selectedValue,
          root.dataset.locale || undefined,
          hourCycle()
        )
      : root.dataset.placeholder || 'Choose a time'
    displayControl.textContent = formatted
    displayControl.dataset.state = selectedValue ? 'value' : 'placeholder'
    formControl.value = selectedValue ?? ''
    root.dataset.value = JSON.stringify(selectedValue)

    if (!draftValue) return
    const currentDraft = draftValue

    const parts = timeValueParts(
      currentDraft,
      root.dataset.locale || undefined,
      hourCycle()
    )
    hourDisplayControl.value = parts.hour
    minuteDisplayControl.value = parts.minute
    hourDisplayControl.setAttribute('aria-invalid', 'false')
    minuteDisplayControl.setAttribute('aria-invalid', 'false')
    controlsControl.dataset.invalid = 'false'
    hintControl.textContent = 'Type or use ↑↓'
    hintControl.dataset.state = 'idle'
    controlsControl.setAttribute(
      'aria-label',
      `Choose a time, ${formatTimeValue(currentDraft, root.dataset.locale || undefined, hourCycle())}`
    )

    const currentMinutes = timeToMinutes(currentDraft)
    root
      .querySelectorAll<HTMLButtonElement>('[data-time-picker-action]')
      .forEach((button) => {
        const action = button.dataset.timePickerAction
        const part = button.dataset.timePickerPart
        if (action === 'decrement' && (part === 'minute' || part === 'hour')) {
          button.disabled = currentMinutes <= minimumMinutes()
        }
        if (action === 'increment' && (part === 'minute' || part === 'hour')) {
          button.disabled = currentMinutes >= maximumMinutes()
        }
        if (action === 'period') {
          const period = button.dataset.period
          const hasPeriod =
            period === 'am'
              ? minimumMinutes() < 12 * 60
              : maximumMinutes() >= 12 * 60
          button.disabled = !hasPeriod
          const selectedPeriod =
            Number(currentDraft.slice(0, 2)) < 12 ? 'am' : 'pm'
          button.setAttribute('aria-pressed', String(period === selectedPeriod))
          button.dataset.state = period === selectedPeriod ? 'selected' : 'idle'
        }
      })
    setActivePart(activePart)
  }

  function select(value: string | undefined, close = false) {
    if (!value || !timeWithinBounds(value, root.dataset.min, root.dataset.max))
      return
    const changed = selectedValue !== value
    selectedValue = value
    draftValue = value
    update()
    if (changed) {
      root.dispatchEvent(
        new CustomEvent<TimePickerValueChangeDetail>(
          TIME_PICKER_VALUE_CHANGE_EVENT,
          {
            bubbles: true,
            detail: { value: selectedValue },
          }
        )
      )
    }
    if (close) {
      hidePopover(surfaceControl)
      triggerControl.focus({ preventScroll: true })
    }
  }

  function moveMinute(distance: number) {
    if (!draftValue) return
    select(clampedValue(timeToMinutes(draftValue) + distance * stepMinutes()))
  }

  function moveHour(distance: number) {
    if (!draftValue) return
    select(clampedValue(timeToMinutes(draftValue) + distance * 60))
  }

  function setPeriod(period: 'am' | 'pm') {
    if (!draftValue || !isTwelveHour()) return
    const currentMinutes = timeToMinutes(draftValue)
    const targetMinutes =
      period === 'am'
        ? currentMinutes >= 12 * 60
          ? currentMinutes - 12 * 60
          : currentMinutes
        : currentMinutes < 12 * 60
          ? currentMinutes + 12 * 60
          : currentMinutes
    select(clampedValue(targetMinutes))
  }

  function manualCandidate(): string | null {
    const rawHour = hourDisplayControl.value.trim()
    const rawMinute = minuteDisplayControl.value.trim()
    const enteredHour = /^\d{1,2}$/.test(rawHour) ? Number(rawHour) : Number.NaN
    const minute = /^\d{1,2}$/.test(rawMinute) ? Number(rawMinute) : Number.NaN
    const cycle = hourCycle()
    let hour = enteredHour
    let hourIsValid = false

    if (cycle === 'h23') hourIsValid = hour >= 0 && hour <= 23
    if (cycle === 'h24') {
      hourIsValid = hour >= 1 && hour <= 24
      if (hour === 24) hour = 0
    }
    if (cycle === 'h11' || cycle === 'h12') {
      const minimumHour = cycle === 'h11' ? 0 : 1
      const maximumHour = cycle === 'h11' ? 11 : 12
      hourIsValid = hour >= minimumHour && hour <= maximumHour
      if (hourIsValid) {
        const isPm = draftValue ? Number(draftValue.slice(0, 2)) >= 12 : false
        hour = cycle === 'h12' ? hour % 12 : hour
        if (isPm) hour += 12
      }
    }

    const minuteIsValid = minute >= 0 && minute <= 59
    const candidate =
      hourIsValid && minuteIsValid
        ? `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        : null
    const withinBounds = candidate
      ? timeWithinBounds(candidate, root.dataset.min, root.dataset.max)
      : false

    const valid = Boolean(candidate && withinBounds)
    const boundsAreInvalid = Boolean(candidate && !withinBounds)
    hourDisplayControl.setAttribute(
      'aria-invalid',
      String(!hourIsValid || boundsAreInvalid)
    )
    minuteDisplayControl.setAttribute(
      'aria-invalid',
      String(!minuteIsValid || boundsAreInvalid)
    )
    controlsControl.dataset.invalid = String(!valid)
    hintControl.textContent = valid
      ? 'Type or use ↑↓'
      : candidate
        ? 'Time is outside the allowed range'
        : 'Enter a valid time'
    hintControl.dataset.state = valid ? 'idle' : 'invalid'

    return valid ? candidate : null
  }

  function applyManualValue(): boolean {
    const candidate = manualCandidate()
    if (!candidate) return false
    select(candidate)
    return true
  }

  function focusInvalidField() {
    const invalid =
      controlsControl.querySelector<HTMLInputElement>(
        "[aria-invalid='true']"
      ) ?? hourDisplayControl
    invalid.focus({ preventScroll: true })
    invalid.select()
  }

  function handleToggle() {
    const open = isPopoverOpen(surfaceControl)
    surfaceControl.dataset.state = open ? 'open' : 'closed'
    triggerControl.setAttribute('aria-expanded', String(open))
    if (open) {
      draftValue = initialDraftValue(values, selectedValue)
      update()
      queueMicrotask(() => {
        controlsControl.focus({ preventScroll: true })
      })
    }
  }

  function handleClick(event: Event) {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      '[data-time-picker-action]'
    )
    if (!button || !root.contains(button)) return
    const action = button.dataset.timePickerAction
    const part = button.dataset.timePickerPart
    if (action === 'increment') {
      if (!applyManualValue()) {
        focusInvalidField()
        return
      }
      if (part === 'hour') moveHour(1)
      else moveMinute(1)
    }
    if (action === 'decrement') {
      if (!applyManualValue()) {
        focusInvalidField()
        return
      }
      if (part === 'hour') moveHour(-1)
      else moveMinute(-1)
    }
    if (
      action === 'period' &&
      (button.dataset.period === 'am' || button.dataset.period === 'pm')
    ) {
      if (!applyManualValue()) {
        focusInvalidField()
        return
      }
      setPeriod(button.dataset.period)
    }
    if (action === 'commit' && draftValue) {
      if (applyManualValue()) select(draftValue, true)
      else focusInvalidField()
    }
  }

  function handleInput(event: Event) {
    const input = (event.target as HTMLElement).closest<HTMLInputElement>(
      "[data-slot='time-picker-hour'], [data-slot='time-picker-minute']"
    )
    if (!input || !root.contains(input)) return
    input.value = input.value.replace(/\D/g, '').slice(0, 2)
    input.setAttribute('aria-invalid', 'false')
    controlsControl.dataset.invalid = 'false'
    hintControl.textContent = 'Type or use ↑↓'
    hintControl.dataset.state = 'idle'
  }

  function handleChange(event: Event) {
    const input = (event.target as HTMLElement).closest<HTMLInputElement>(
      "[data-slot='time-picker-hour'], [data-slot='time-picker-minute']"
    )
    if (!input || !root.contains(input)) return
    if (!applyManualValue()) focusInvalidField()
  }

  function handleFocusIn(event: FocusEvent) {
    const input = (event.target as HTMLElement).closest<HTMLInputElement>(
      "[data-slot='time-picker-hour'], [data-slot='time-picker-minute']"
    )
    if (!input || !root.contains(input)) return
    setActivePart(input === hourDisplayControl ? 'hour' : 'minute')
    input.select()
  }

  function handleKeyDown(event: KeyboardEvent) {
    const field = (event.target as HTMLElement).closest<HTMLInputElement>(
      "[data-slot='time-picker-hour'], [data-slot='time-picker-minute']"
    )
    if (field && root.contains(field)) {
      const part = field === hourDisplayControl ? 'hour' : 'minute'
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault()
        if (applyManualValue()) {
          const distance = event.key === 'ArrowUp' ? 1 : -1
          if (part === 'hour') moveHour(distance)
          else moveMinute(distance)
          field.select()
        }
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        if (applyManualValue() && draftValue) select(draftValue, true)
        else focusInvalidField()
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        update()
        hidePopover(surfaceControl)
        triggerControl.focus({ preventScroll: true })
      }
      return
    }

    if (event.target !== controlsControl || !draftValue || values.length === 0)
      return
    const rtl = getComputedStyle(root).direction === 'rtl'
    const parts: TimePickerPart[] = isTwelveHour()
      ? ['hour', 'minute', 'period']
      : ['hour', 'minute']
    const activeIndex = parts.indexOf(activePart)
    const moveActivePart = (distance: number) => {
      if (activePart === 'hour') moveHour(distance)
      else if (activePart === 'minute') moveMinute(distance)
      else setPeriod(distance > 0 ? 'pm' : 'am')
    }

    switch (event.key) {
      case 'ArrowDown':
        moveActivePart(-1)
        break
      case 'ArrowUp':
        moveActivePart(1)
        break
      case 'ArrowRight':
        setActivePart(
          parts[
            Math.min(
              parts.length - 1,
              Math.max(0, activeIndex + (rtl ? -1 : 1))
            )
          ] ?? 'hour'
        )
        break
      case 'ArrowLeft':
        setActivePart(
          parts[
            Math.min(
              parts.length - 1,
              Math.max(0, activeIndex + (rtl ? 1 : -1))
            )
          ] ?? 'hour'
        )
        break
      case 'Home':
        select(values[0])
        break
      case 'End':
        select(values.at(-1))
        break
      case 'PageDown':
        moveActivePart(-4)
        break
      case 'PageUp':
        moveActivePart(4)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        select(draftValue, true)
        return
      case 'Escape':
        event.preventDefault()
        hidePopover(surfaceControl)
        triggerControl.focus({ preventScroll: true })
        return
      default:
        return
    }

    event.preventDefault()
  }

  function handleFormReset() {
    queueMicrotask(() => {
      if (destroyed) return
      selectedValue = defaultValue
      draftValue = initialDraftValue(values, selectedValue)
      update()
    })
  }

  surfaceControl.addEventListener('toggle', handleToggle)
  controlsControl.addEventListener('keydown', handleKeyDown)
  controlsControl.addEventListener('input', handleInput)
  controlsControl.addEventListener('change', handleChange)
  controlsControl.addEventListener('focusin', handleFocusIn)
  surfaceControl.addEventListener('click', handleClick)
  form?.addEventListener('reset', handleFormReset)
  handleToggle()
  update()

  const controller: TimePickerController = {
    destroy() {
      destroyed = true
      surfaceControl.removeEventListener('toggle', handleToggle)
      controlsControl.removeEventListener('keydown', handleKeyDown)
      controlsControl.removeEventListener('input', handleInput)
      controlsControl.removeEventListener('change', handleChange)
      controlsControl.removeEventListener('focusin', handleFocusIn)
      surfaceControl.removeEventListener('click', handleClick)
      form?.removeEventListener('reset', handleFormReset)
      timePickerControllers.delete(root)
    },
    getValue: () => selectedValue,
    refresh() {
      if (destroyed) return
      values = timeOptionValues(root)
      if (
        selectedValue &&
        !timeWithinBounds(selectedValue, root.dataset.min, root.dataset.max)
      ) {
        selectedValue = null
      }
      draftValue = initialDraftValue(values, selectedValue)
      update()
    },
    setValue(value: string | null) {
      if (destroyed) return
      selectedValue =
        isTimeValue(value) &&
        timeWithinBounds(value, root.dataset.min, root.dataset.max)
          ? value
          : null
      draftValue = initialDraftValue(values, selectedValue)
      update()
    },
  }

  timePickerControllers.set(root, controller)
  return controller
}
