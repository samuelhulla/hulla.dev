import {
  CALENDAR_VALUE_CHANGE_EVENT,
  calendarControllerFor,
  formatCalendarDate,
  formatCalendarValue,
  isCalendarDate,
  normalizeCalendarValue,
  type CalendarSelectionMode,
  type CalendarValue,
  type CalendarValueChangeDetail,
} from './calendar'
import {
  isTimeValue,
  timePickerControllerFor,
  TIME_PICKER_VALUE_CHANGE_EVENT,
  type TimePickerValueChangeDetail,
} from './time-picker'

export const DATE_PICKER_VALUE_CHANGE_EVENT = 'hulla-date-picker-value-change'
export const DATE_TIME_PICKER_VALUE_CHANGE_EVENT =
  'hulla-date-time-picker-value-change'

export type DatePickerValueChangeDetail = {
  value: CalendarValue
}

export type DateTimePickerValueChangeDetail = {
  value: string | null
}

export type DatePickerController = {
  destroy: () => void
  getValue: () => CalendarValue
  refresh: () => void
  setValue: (value: CalendarValue) => void
}

export type DateTimePickerController = {
  destroy: () => void
  getValue: () => string | null
  refresh: () => void
  setValue: (value: string | null) => void
}

type PopoverElement = HTMLElement & {
  hidePopover?: () => void
  matches: (selector: string) => boolean
}

const localDateTimePattern = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/
let pickerId = 0

function elementForSlot<T extends HTMLElement>(
  root: HTMLElement,
  slot: string
): T | undefined {
  return root.querySelector<T>(`[data-slot='${slot}']`) ?? undefined
}

function pickerLocale(root: HTMLElement): string | undefined {
  return root.dataset.locale || undefined
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
    // The browser may have closed the transient popover already.
  }
}

function connectPickerParts(root: HTMLElement, prefix: string) {
  const trigger = elementForSlot<HTMLButtonElement>(root, `${prefix}-trigger`)
  const display = elementForSlot<HTMLElement>(root, `${prefix}-value`)
  const surface =
    root.querySelector<PopoverElement>(`[data-${prefix}-popover]`) ??
    elementForSlot<PopoverElement>(root, `${prefix}-popover`)
  const calendar = elementForSlot<HTMLElement>(root, 'calendar')
  if (!trigger || !display || !surface || !calendar) return undefined

  pickerId += 1
  const baseId = root.id || `hulla-${prefix}-${pickerId}`
  if (!root.id) root.id = baseId
  if (!trigger.id) trigger.id = `${baseId}-trigger`
  if (!surface.id) surface.id = `${baseId}-popover`

  trigger.setAttribute('popovertarget', surface.id)
  trigger.setAttribute('aria-controls', surface.id)
  surface.setAttribute('aria-labelledby', trigger.id)

  const anchorName = `--${baseId}-anchor`
  trigger.style.setProperty('anchor-name', anchorName)
  surface.style.setProperty('position-anchor', anchorName)

  const handleToggle = () => {
    const open = isPopoverOpen(surface)
    surface.dataset.state = open ? 'open' : 'closed'
    trigger.setAttribute('aria-expanded', String(open))
    if (open) {
      queueMicrotask(() => {
        calendar
          .querySelector<HTMLButtonElement>(
            "[data-slot='calendar-day'][tabindex='0']"
          )
          ?.focus({ preventScroll: true })
      })
    }
  }

  surface.addEventListener('toggle', handleToggle)
  handleToggle()

  return {
    calendar,
    destroy: () => surface.removeEventListener('toggle', handleToggle),
    display,
    surface,
    trigger,
  }
}

function syncCalendarValue(calendar: HTMLElement, value: CalendarValue) {
  const controller = calendarControllerFor(calendar)
  if (controller) {
    controller.setValue(value)
    return
  }
  calendar.dataset.initialValue = JSON.stringify(value)
  const customElement = calendar as HTMLElement & { value?: CalendarValue }
  if ('value' in customElement) customElement.value = value
}

function syncTimeValue(timePicker: HTMLElement, value: string | null) {
  const controller = timePickerControllerFor(timePicker)
  if (controller) {
    controller.setValue(value)
    return
  }
  timePicker.dataset.initialValue = JSON.stringify(value)
  const customElement = timePicker as HTMLElement & { value?: string | null }
  if ('value' in customElement) customElement.value = value
}

function valueIsComplete(
  value: CalendarValue,
  selectionMode: CalendarSelectionMode
): boolean {
  if (selectionMode === 'single') return typeof value === 'string'
  return Boolean(value && typeof value !== 'string' && value.end)
}

export function connectDatePicker(root: HTMLElement): DatePickerController {
  const parts = connectPickerParts(root, 'date-picker')
  const singleInput = elementForSlot<HTMLInputElement>(
    root,
    'date-picker-input'
  )
  const startInput = elementForSlot<HTMLInputElement>(
    root,
    'date-picker-start-input'
  )
  const endInput = elementForSlot<HTMLInputElement>(
    root,
    'date-picker-end-input'
  )

  if (!parts || (!singleInput && !startInput && !endInput)) {
    root.dataset.unsupported = 'missing-part'
    return {
      destroy: () => undefined,
      getValue: () => null,
      refresh: () => undefined,
      setValue: () => undefined,
    }
  }

  const pickerParts = parts
  const selectionMode = (): CalendarSelectionMode =>
    root.dataset.selectionMode === 'range' ? 'range' : 'single'
  const defaultValue = normalizeCalendarValue(
    (() => {
      try {
        return JSON.parse(root.dataset.initialValue ?? 'null')
      } catch {
        return null
      }
    })(),
    selectionMode()
  )
  let selectedValue = defaultValue
  let destroyed = false
  const form = singleInput?.form ?? startInput?.form ?? endInput?.form

  function update() {
    const placeholder =
      root.dataset.placeholder ||
      (selectionMode() === 'range' ? 'Choose a date range' : 'Choose a date')
    const formatted = formatCalendarValue(
      selectedValue,
      selectionMode(),
      pickerLocale(root)
    )
    pickerParts.display.textContent = formatted || placeholder
    pickerParts.display.dataset.state = formatted ? 'value' : 'placeholder'
    root.dataset.value = JSON.stringify(selectedValue)

    if (singleInput)
      singleInput.value = typeof selectedValue === 'string' ? selectedValue : ''
    if (startInput) {
      startInput.value =
        selectedValue && typeof selectedValue !== 'string'
          ? selectedValue.start
          : ''
    }
    if (endInput) {
      endInput.value =
        selectedValue && typeof selectedValue !== 'string'
          ? (selectedValue.end ?? '')
          : ''
    }
  }

  function handleCalendarValueChange(event: Event) {
    const detail = (event as CustomEvent<CalendarValueChangeDetail>).detail
    event.stopPropagation()
    selectedValue = normalizeCalendarValue(detail.value, selectionMode())
    update()
    root.dispatchEvent(
      new CustomEvent<DatePickerValueChangeDetail>(
        DATE_PICKER_VALUE_CHANGE_EVENT,
        {
          bubbles: true,
          detail: { value: selectedValue },
        }
      )
    )
    if (valueIsComplete(selectedValue, selectionMode()))
      hidePopover(pickerParts.surface)
  }

  function handleFormReset() {
    queueMicrotask(() => {
      if (destroyed) return
      selectedValue = normalizeCalendarValue(defaultValue, selectionMode())
      syncCalendarValue(pickerParts.calendar, selectedValue)
      update()
    })
  }

  root.addEventListener(CALENDAR_VALUE_CHANGE_EVENT, handleCalendarValueChange)
  form?.addEventListener('reset', handleFormReset)
  update()

  return {
    destroy() {
      destroyed = true
      pickerParts.destroy()
      root.removeEventListener(
        CALENDAR_VALUE_CHANGE_EVENT,
        handleCalendarValueChange
      )
      form?.removeEventListener('reset', handleFormReset)
    },
    getValue: () => selectedValue,
    refresh() {
      if (destroyed) return
      selectedValue = normalizeCalendarValue(selectedValue, selectionMode())
      update()
    },
    setValue(value: CalendarValue) {
      if (destroyed) return
      selectedValue = normalizeCalendarValue(value, selectionMode())
      syncCalendarValue(pickerParts.calendar, selectedValue)
      update()
    },
  }
}

export function isLocalDateTime(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const match = localDateTimePattern.exec(value)
  if (!match || !isCalendarDate(match[1])) return false
  const hour = Number(match[2])
  const minute = Number(match[3])
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59
}

function localDateTimeParts(value: string | null | undefined): {
  date?: string
  time?: string
} {
  if (!isLocalDateTime(value)) return {}
  return { date: value.slice(0, 10), time: value.slice(11, 16) }
}

export function formatLocalDateTime(
  value: string,
  locale?: string,
  hourCycle: 'h11' | 'h12' | 'h23' | 'h24' = 'h23'
): string {
  if (!isLocalDateTime(value)) return value
  const { date, time } = localDateTimeParts(value)
  if (!date || !time) return value
  const [hour, minute] = time.split(':').map(Number)
  const timeDate = new Date(0)
  timeDate.setUTCHours(hour ?? 0, minute ?? 0, 0, 0)
  const formattedTime = new Intl.DateTimeFormat(locale, {
    hour: hourCycle === 'h23' || hourCycle === 'h24' ? '2-digit' : 'numeric',
    hourCycle,
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(timeDate)
  return `${formatCalendarDate(date, locale)}, ${formattedTime}`
}

export function connectDateTimePicker(
  root: HTMLElement
): DateTimePickerController {
  const parts = connectPickerParts(root, 'date-time-picker')
  const timePicker = elementForSlot<HTMLElement>(root, 'time-picker')
  const timePickerTrigger = elementForSlot<HTMLButtonElement>(
    root,
    'time-picker-trigger'
  )
  const applyButton = elementForSlot<HTMLButtonElement>(
    root,
    'date-time-picker-apply'
  )
  const formInput = elementForSlot<HTMLInputElement>(
    root,
    'date-time-picker-input'
  )

  if (
    !parts ||
    !timePicker ||
    !timePickerTrigger ||
    !applyButton ||
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

  const pickerParts = parts
  const timePickerControl = timePicker
  const timeTrigger = timePickerTrigger
  const applyControl = applyButton
  const formControl = formInput
  const initialValue = (() => {
    try {
      const candidate = JSON.parse(
        root.dataset.initialValue ?? 'null'
      ) as unknown
      return isLocalDateTime(candidate) ? candidate : null
    } catch {
      return null
    }
  })()
  let selectedValue: string | null = initialValue
  let draft: {
    date?: string
    time?: string
  } = {
    ...localDateTimeParts(initialValue),
    time:
      localDateTimeParts(initialValue).time ??
      root.dataset.defaultTime ??
      '09:00',
  }
  let destroyed = false
  const form = formControl.form

  function candidateValue(): string | null {
    const candidate =
      draft.date && draft.time ? `${draft.date}T${draft.time}` : null
    if (!isLocalDateTime(candidate)) return null
    if (root.dataset.min && candidate < root.dataset.min) return null
    if (root.dataset.max && candidate > root.dataset.max) return null
    return candidate
  }

  function update() {
    const hourCycle =
      root.dataset.hourCycle === 'h11' ||
      root.dataset.hourCycle === 'h12' ||
      root.dataset.hourCycle === 'h24'
        ? root.dataset.hourCycle
        : 'h23'
    const formatted = selectedValue
      ? formatLocalDateTime(selectedValue, pickerLocale(root), hourCycle)
      : root.dataset.placeholder || 'Choose a date and time'
    pickerParts.display.textContent = formatted
    pickerParts.display.dataset.state = selectedValue ? 'value' : 'placeholder'
    formControl.value = selectedValue ?? ''
    root.dataset.value = JSON.stringify(selectedValue)
    applyControl.disabled = candidateValue() === null
  }

  function resetDraft() {
    const committed = localDateTimeParts(selectedValue)
    draft = {
      date: committed.date,
      time: committed.time ?? root.dataset.defaultTime ?? '09:00',
    }
    syncCalendarValue(pickerParts.calendar, committed.date ?? null)
    syncTimeValue(timePickerControl, draft.time ?? null)
    update()
  }

  function handleCalendarValueChange(event: Event) {
    const value = (event as CustomEvent<CalendarValueChangeDetail>).detail.value
    event.stopPropagation()
    draft.date = typeof value === 'string' ? value : undefined
    update()
    timeTrigger.focus({ preventScroll: true })
  }

  function handleTimeValueChange(event: Event) {
    const value = (event as CustomEvent<TimePickerValueChangeDetail>).detail
      .value
    event.stopPropagation()
    draft.time = isTimeValue(value) ? value : undefined
    update()
  }

  function handleApply() {
    const candidate = candidateValue()
    if (!candidate) return
    selectedValue = candidate
    update()
    root.dispatchEvent(
      new CustomEvent<DateTimePickerValueChangeDetail>(
        DATE_TIME_PICKER_VALUE_CHANGE_EVENT,
        {
          bubbles: true,
          detail: { value: selectedValue },
        }
      )
    )
    hidePopover(pickerParts.surface)
  }

  function handleToggle() {
    if (isPopoverOpen(pickerParts.surface)) resetDraft()
  }

  function handleFormReset() {
    queueMicrotask(() => {
      if (destroyed) return
      selectedValue = initialValue
      resetDraft()
    })
  }

  root.addEventListener(CALENDAR_VALUE_CHANGE_EVENT, handleCalendarValueChange)
  timePickerControl.addEventListener(
    TIME_PICKER_VALUE_CHANGE_EVENT,
    handleTimeValueChange
  )
  applyControl.addEventListener('click', handleApply)
  pickerParts.surface.addEventListener('toggle', handleToggle)
  form?.addEventListener('reset', handleFormReset)
  update()

  return {
    destroy() {
      destroyed = true
      pickerParts.destroy()
      root.removeEventListener(
        CALENDAR_VALUE_CHANGE_EVENT,
        handleCalendarValueChange
      )
      timePickerControl.removeEventListener(
        TIME_PICKER_VALUE_CHANGE_EVENT,
        handleTimeValueChange
      )
      applyControl.removeEventListener('click', handleApply)
      pickerParts.surface.removeEventListener('toggle', handleToggle)
      form?.removeEventListener('reset', handleFormReset)
    },
    getValue: () => selectedValue,
    refresh() {
      if (!destroyed) update()
    },
    setValue(value: string | null) {
      if (destroyed) return
      selectedValue = isLocalDateTime(value) ? value : null
      resetDraft()
    },
  }
}
