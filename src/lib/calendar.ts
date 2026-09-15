export const CALENDAR_VALUE_CHANGE_EVENT = 'hulla-calendar-value-change'
export const CALENDAR_MONTH_CHANGE_EVENT = 'hulla-calendar-month-change'

export type CalendarDateRange = {
  start: string
  end?: string
}

export type CalendarValue = string | CalendarDateRange | null
export type CalendarSelectionMode = 'single' | 'range'
export type CalendarDisabledDate = string | CalendarDateRange

export type CalendarValueChangeDetail = {
  value: CalendarValue
}

export type CalendarMonthChangeDetail = {
  month: string
}

export type CalendarDay = {
  date: string
  day: number
  disabled: boolean
  inRange: boolean
  outside: boolean
  rangeEnd: boolean
  rangeStart: boolean
  selected: boolean
  today: boolean
}

export type CalendarWeekday = {
  label: string
  longLabel: string
}

export type CalendarView = {
  days: CalendarDay[]
  heading: string
  month: string
  weekdays: CalendarWeekday[]
}

export type CalendarViewOptions = {
  disabledDates?: readonly CalendarDisabledDate[]
  locale?: string
  max?: string
  min?: string
  month?: string
  selectionMode?: CalendarSelectionMode
  today?: string
  value?: CalendarValue
  weekStartsOn?: number
}

export type CalendarController = {
  destroy: () => void
  getMonth: () => string
  getValue: () => CalendarValue
  refresh: () => void
  setMonth: (month: string) => void
  setValue: (value: CalendarValue) => void
}

type DateParts = {
  day: number
  month: number
  year: number
}

const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/
const monthPattern = /^(\d{4})-(\d{2})$/
const dayButtonSelector = "[data-slot='calendar-day']"
const calendarControllers = new WeakMap<HTMLElement, CalendarController>()
let calendarId = 0

function partsToDate({ day, month, year }: DateParts): Date {
  const date = new Date(0)
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCFullYear(year, month - 1, day)
  return date
}

function dateToParts(date: Date): DateParts {
  return {
    day: date.getUTCDate(),
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear(),
  }
}

function parseDate(value: string): DateParts | undefined {
  const match = datePattern.exec(value)
  if (!match) return undefined

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31)
    return undefined

  const date = partsToDate({ day, month, year })
  const parts = dateToParts(date)
  return parts.year === year && parts.month === month && parts.day === day
    ? parts
    : undefined
}

function formatParts({ day, month, year }: DateParts): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function isCalendarDate(value: unknown): value is string {
  return typeof value === 'string' && parseDate(value) !== undefined
}

export function isCalendarMonth(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const match = monthPattern.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  return year >= 1 && month >= 1 && month <= 12
}

export function calendarToday(): string {
  const today = new Date()
  return formatParts({
    day: today.getDate(),
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  })
}

export function defaultCalendarMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export function addCalendarDays(value: string, amount: number): string {
  const parts = parseDate(value)
  if (!parts) return value
  const date = partsToDate(parts)
  date.setUTCDate(date.getUTCDate() + amount)
  return formatParts(dateToParts(date))
}

export function addCalendarMonths(value: string, amount: number): string {
  const parts = parseDate(value)
  if (!parts) return value

  const monthIndex = parts.year * 12 + parts.month - 1 + amount
  const year = Math.floor(monthIndex / 12)
  const month = (((monthIndex % 12) + 12) % 12) + 1
  if (year < 1 || year > 9999) return value

  const lastDay = new Date(0)
  lastDay.setUTCHours(0, 0, 0, 0)
  lastDay.setUTCFullYear(year, month, 0)
  return formatParts({
    day: Math.min(parts.day, lastDay.getUTCDate()),
    month,
    year,
  })
}

function addCalendarYears(value: string, amount: number): string {
  const parts = parseDate(value)
  if (!parts) return value
  const year = parts.year + amount
  if (year < 1 || year > 9999) return value

  const lastDay = new Date(0)
  lastDay.setUTCHours(0, 0, 0, 0)
  lastDay.setUTCFullYear(year, parts.month, 0)
  return formatParts({
    day: Math.min(parts.day, lastDay.getUTCDate()),
    month: parts.month,
    year,
  })
}

function startOfCalendarMonth(month: string): string {
  return `${month}-01`
}

function endOfCalendarMonth(month: string): string {
  const first = parseDate(startOfCalendarMonth(month))
  if (!first) return `${month}-01`
  const date = partsToDate(first)
  date.setUTCMonth(date.getUTCMonth() + 1, 0)
  return formatParts(dateToParts(date))
}

function dayOfWeek(value: string): number {
  const parts = parseDate(value)
  return parts ? partsToDate(parts).getUTCDay() : 0
}

function normalizeLocale(locale?: string): string {
  if (locale) return locale
  return new Intl.DateTimeFormat().resolvedOptions().locale
}

export function calendarWeekStartsOn(locale?: string): number {
  try {
    const localeObject = new Intl.Locale(
      normalizeLocale(locale)
    ) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number }
      weekInfo?: { firstDay: number }
    }
    const firstDay =
      localeObject.getWeekInfo?.().firstDay ?? localeObject.weekInfo?.firstDay
    if (firstDay !== undefined) return firstDay % 7
  } catch {
    // Invalid or unsupported locales fall back to the broadly used Monday-first layout.
  }
  return 1
}

function normalizeWeekStartsOn(
  value: number | undefined,
  locale?: string
): number {
  return value !== undefined &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 6
    ? value
    : calendarWeekStartsOn(locale)
}

function dateFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale, {
    calendar: 'gregory',
    timeZone: 'UTC',
    ...options,
  })
}

export function formatCalendarDate(value: string, locale?: string): string {
  const parts = parseDate(value)
  if (!parts) return value
  return dateFormatter(normalizeLocale(locale), { dateStyle: 'medium' }).format(
    partsToDate(parts)
  )
}

export function formatCalendarValue(
  value: CalendarValue,
  selectionMode: CalendarSelectionMode,
  locale?: string
): string {
  if (!value) return ''
  if (selectionMode === 'single')
    return typeof value === 'string' ? formatCalendarDate(value, locale) : ''
  if (typeof value === 'string') return formatCalendarDate(value, locale)

  const start = formatCalendarDate(value.start, locale)
  return value.end
    ? `${start} – ${formatCalendarDate(value.end, locale)}`
    : `${start} –`
}

function normalizeRange(value: unknown): CalendarDateRange | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as { end?: unknown; start?: unknown }
  if (!isCalendarDate(candidate.start)) return null
  if (candidate.end !== undefined && !isCalendarDate(candidate.end)) return null
  if (!candidate.end) return { start: candidate.start }
  return candidate.start <= candidate.end
    ? { start: candidate.start, end: candidate.end }
    : { start: candidate.end, end: candidate.start }
}

export function normalizeCalendarValue(
  value: unknown,
  selectionMode: CalendarSelectionMode
): CalendarValue {
  if (value === null || value === undefined || value === '') return null
  if (selectionMode === 'single') return isCalendarDate(value) ? value : null
  return normalizeRange(value)
}

export function serializeCalendarValue(value: CalendarValue): string {
  return JSON.stringify(value)
}

export function deserializeCalendarValue(
  value: string | undefined,
  selectionMode: CalendarSelectionMode
): CalendarValue {
  if (!value) return null
  try {
    return normalizeCalendarValue(JSON.parse(value), selectionMode)
  } catch {
    return normalizeCalendarValue(value, selectionMode)
  }
}

function normalizeDisabledDates(value: unknown): CalendarDisabledDate[] {
  if (!Array.isArray(value)) return []
  const result: CalendarDisabledDate[] = []
  value.forEach((candidate) => {
    if (isCalendarDate(candidate)) {
      result.push(candidate)
      return
    }
    const range = normalizeRange(candidate)
    if (range) result.push(range)
  })
  return result
}

function deserializeDisabledDates(
  value: string | undefined
): CalendarDisabledDate[] {
  if (!value) return []
  try {
    return normalizeDisabledDates(JSON.parse(value))
  } catch {
    return []
  }
}

function isDateDisabled(
  date: string,
  min: string | undefined,
  max: string | undefined,
  disabledDates: readonly CalendarDisabledDate[]
): boolean {
  if (min && date < min) return true
  if (max && date > max) return true
  return disabledDates.some((disabled) => {
    if (typeof disabled === 'string') return disabled === date
    return date >= disabled.start && date <= (disabled.end ?? disabled.start)
  })
}

function selectionState(
  date: string,
  value: CalendarValue,
  selectionMode: CalendarSelectionMode
): Pick<CalendarDay, 'inRange' | 'rangeEnd' | 'rangeStart' | 'selected'> {
  if (!value)
    return {
      inRange: false,
      rangeEnd: false,
      rangeStart: false,
      selected: false,
    }
  if (selectionMode === 'single' || typeof value === 'string') {
    return {
      inRange: false,
      rangeEnd: false,
      rangeStart: false,
      selected: typeof value === 'string' && value === date,
    }
  }

  const end = value.end ?? value.start
  return {
    inRange: date >= value.start && date <= end,
    rangeEnd: value.end === date,
    rangeStart: value.start === date,
    selected: date >= value.start && date <= end,
  }
}

function viewMonth(options: CalendarViewOptions): string {
  if (isCalendarMonth(options.month)) return options.month
  const value = normalizeCalendarValue(
    options.value,
    options.selectionMode ?? 'single'
  )
  const selectedDate = typeof value === 'string' ? value : value?.start
  return selectedDate?.slice(0, 7) ?? defaultCalendarMonth()
}

export function createCalendarView(
  options: CalendarViewOptions = {}
): CalendarView {
  const selectionMode = options.selectionMode ?? 'single'
  const locale = normalizeLocale(options.locale)
  const month = viewMonth(options)
  const weekStartsOn = normalizeWeekStartsOn(options.weekStartsOn, locale)
  const value = normalizeCalendarValue(options.value, selectionMode)
  const disabledDates = normalizeDisabledDates(options.disabledDates)
  const monthStart = startOfCalendarMonth(month)
  const leadingDays = (dayOfWeek(monthStart) - weekStartsOn + 7) % 7
  const gridStart = addCalendarDays(monthStart, -leadingDays)
  const days = Array.from({ length: 42 }, (_, index): CalendarDay => {
    const date = addCalendarDays(gridStart, index)
    const parts = parseDate(date)!
    return {
      date,
      day: parts.day,
      disabled: isDateDisabled(date, options.min, options.max, disabledDates),
      outside: date.slice(0, 7) !== month,
      today: options.today === date,
      ...selectionState(date, value, selectionMode),
    }
  })

  const heading = dateFormatter(locale, {
    month: 'long',
    year: 'numeric',
  }).format(partsToDate(parseDate(monthStart)!))
  const weekdays = Array.from({ length: 7 }, (_, index): CalendarWeekday => {
    const weekday = (weekStartsOn + index) % 7
    const date = addCalendarDays('2024-01-07', weekday)
    const parsed = parseDate(date)!
    return {
      label: dateFormatter(locale, { weekday: 'narrow' }).format(
        partsToDate(parsed)
      ),
      longLabel: dateFormatter(locale, { weekday: 'long' }).format(
        partsToDate(parsed)
      ),
    }
  })

  return { days, heading, month, weekdays }
}

export function calendarControllerFor(
  element: HTMLElement
): CalendarController | undefined {
  return calendarControllers.get(element)
}

function calendarRootFor(element: Element): HTMLElement | null {
  return element.closest<HTMLElement>("[data-slot='calendar']")
}

function belongsToRoot(element: Element, root: HTMLElement): boolean {
  return calendarRootFor(element) === root
}

function elementsForSlot<T extends HTMLElement>(
  root: HTMLElement,
  slot: string
): T[] {
  return Array.from(root.querySelectorAll<T>(`[data-slot='${slot}']`)).filter(
    (element) => belongsToRoot(element, root)
  )
}

function firstForSlot<T extends HTMLElement>(
  root: HTMLElement,
  slot: string
): T | undefined {
  return elementsForSlot<T>(root, slot)[0]
}

function isRangeValue(value: CalendarValue): value is CalendarDateRange {
  return Boolean(value && typeof value !== 'string')
}

export function connectCalendar(root: HTMLElement): CalendarController {
  const dayButtons = () =>
    elementsForSlot<HTMLButtonElement>(root, 'calendar-day')
  const weekdayLabels = () =>
    elementsForSlot<HTMLElement>(root, 'calendar-weekday')
  const heading = firstForSlot<HTMLElement>(root, 'calendar-heading')
  const previousButton = firstForSlot<HTMLButtonElement>(
    root,
    'calendar-previous'
  )
  const nextButton = firstForSlot<HTMLButtonElement>(root, 'calendar-next')

  if (
    !heading ||
    !previousButton ||
    !nextButton ||
    dayButtons().length !== 42
  ) {
    root.dataset.unsupported = 'missing-part'
    return {
      destroy: () => undefined,
      getMonth: () => root.dataset.month ?? defaultCalendarMonth(),
      getValue: () => null,
      refresh: () => undefined,
      setMonth: () => undefined,
      setValue: () => undefined,
    }
  }

  const headingElement = heading
  const previousMonthButton = previousButton
  const nextMonthButton = nextButton
  calendarId += 1
  const baseId = root.id || `hulla-calendar-${calendarId}`
  if (!root.id) root.id = baseId
  if (!headingElement.id) headingElement.id = `${baseId}-heading`

  const grid = firstForSlot<HTMLElement>(root, 'calendar-grid')
  grid?.setAttribute('aria-labelledby', headingElement.id)

  const selectionMode = (): CalendarSelectionMode =>
    root.dataset.selectionMode === 'range' ? 'range' : 'single'
  const locale = () => root.dataset.locale || undefined
  const minimum = () =>
    isCalendarDate(root.dataset.min) ? root.dataset.min : undefined
  const maximum = () =>
    isCalendarDate(root.dataset.max) ? root.dataset.max : undefined
  const disabledDates = () =>
    deserializeDisabledDates(root.dataset.disabledDates)
  const today = () =>
    isCalendarDate(root.dataset.today) ? root.dataset.today : calendarToday()
  const weekStartsOn = () => {
    const value = Number(root.dataset.weekStartsOn)
    return root.dataset.weekStartsOn !== undefined && Number.isInteger(value)
      ? value
      : undefined
  }

  let selectedValue = deserializeCalendarValue(
    root.dataset.initialValue,
    selectionMode()
  )
  let visibleMonth = isCalendarMonth(root.dataset.month)
    ? root.dataset.month
    : viewMonth({ selectionMode: selectionMode(), value: selectedValue })
  let focusedDate =
    (typeof selectedValue === 'string'
      ? selectedValue
      : selectedValue?.start) ??
    (today().slice(0, 7) === visibleMonth
      ? today()
      : startOfCalendarMonth(visibleMonth))
  let previewDate: string | undefined
  let destroyed = false

  function options(): CalendarViewOptions {
    return {
      disabledDates: disabledDates(),
      locale: locale(),
      max: maximum(),
      min: minimum(),
      month: visibleMonth,
      selectionMode: selectionMode(),
      today: today(),
      value: selectedValue,
      weekStartsOn: weekStartsOn(),
    }
  }

  function focusableDate(date: string, direction: number): string {
    let candidate = date
    for (let attempt = 0; attempt < 370; attempt += 1) {
      if (!isDateDisabled(candidate, minimum(), maximum(), disabledDates()))
        return candidate
      candidate = addCalendarDays(candidate, direction)
    }
    return date
  }

  function updatePreview(buttons: HTMLButtonElement[]) {
    const range = isRangeValue(selectedValue) ? selectedValue : undefined
    const previewing = range && !range.end && previewDate
    const start = previewing
      ? previewDate! < range.start
        ? previewDate!
        : range.start
      : undefined
    const end = previewing
      ? previewDate! < range.start
        ? range.start
        : previewDate!
      : undefined

    buttons.forEach((button) => {
      const date = button.dataset.date
      if (date && start && end && date >= start && date <= end) {
        button.dataset.rangePreview = 'true'
      } else {
        delete button.dataset.rangePreview
      }
    })
  }

  function render() {
    const view = createCalendarView(options())
    visibleMonth = view.month
    root.dataset.month = visibleMonth
    root.dataset.value = serializeCalendarValue(selectedValue)
    headingElement.textContent = view.heading

    weekdayLabels().forEach((element, index) => {
      const weekday = view.weekdays[index]
      if (!weekday) return
      element.textContent = weekday.label
      element.setAttribute('aria-label', weekday.longLabel)
      element.setAttribute('title', weekday.longLabel)
    })

    const buttons = dayButtons()
    buttons.forEach((button, index) => {
      const day = view.days[index]
      if (!day) return

      button.textContent = String(day.day)
      button.dataset.date = day.date
      button.disabled = day.disabled
      button.tabIndex = day.date === focusedDate && !day.disabled ? 0 : -1
      button.setAttribute('aria-selected', String(day.selected))
      button.setAttribute(
        'aria-label',
        dateFormatter(normalizeLocale(locale()), {
          day: 'numeric',
          month: 'long',
          weekday: 'long',
          year: 'numeric',
        }).format(partsToDate(parseDate(day.date)!))
      )

      const states: Array<[string, boolean]> = [
        ['outside', day.outside],
        ['selected', day.selected],
        ['rangeStart', day.rangeStart],
        ['rangeEnd', day.rangeEnd],
        ['inRange', day.inRange],
        ['today', day.today],
      ]
      states.forEach(([state, active]) => {
        if (active) button.dataset[state] = 'true'
        else delete button.dataset[state]
      })

      if (day.today) button.setAttribute('aria-current', 'date')
      else button.removeAttribute('aria-current')
    })

    updatePreview(buttons)
    previousMonthButton.disabled = Boolean(
      minimum() &&
      endOfCalendarMonth(
        addCalendarMonths(`${visibleMonth}-01`, -1).slice(0, 7)
      ) < minimum()!
    )
    nextMonthButton.disabled = Boolean(
      maximum() &&
      startOfCalendarMonth(
        addCalendarMonths(`${visibleMonth}-01`, 1).slice(0, 7)
      ) > maximum()!
    )
  }

  function focusRenderedDate(date: string) {
    const button = dayButtons().find(
      (candidate) => candidate.dataset.date === date
    )
    if (!button || button.disabled) return
    dayButtons().forEach((candidate) => {
      candidate.tabIndex = candidate === button ? 0 : -1
    })
    focusedDate = date
    button.focus({ preventScroll: true })
  }

  function dispatchMonthChange() {
    root.dispatchEvent(
      new CustomEvent<CalendarMonthChangeDetail>(CALENDAR_MONTH_CHANGE_EVENT, {
        bubbles: true,
        detail: { month: visibleMonth },
      })
    )
  }

  function changeMonth(month: string, focus?: string, emit = true) {
    if (!isCalendarMonth(month) || month === visibleMonth) {
      if (focus) focusRenderedDate(focus)
      return
    }
    visibleMonth = month
    if (focus) focusedDate = focus
    render()
    if (emit) dispatchMonthChange()
    if (focus) queueMicrotask(() => focusRenderedDate(focus))
  }

  function moveFocus(date: string, direction: number) {
    const target = focusableDate(date, direction)
    focusedDate = target
    if (target.slice(0, 7) !== visibleMonth) {
      changeMonth(target.slice(0, 7), target)
    } else {
      focusRenderedDate(target)
    }
  }

  function dispatchValueChange() {
    root.dispatchEvent(
      new CustomEvent<CalendarValueChangeDetail>(CALENDAR_VALUE_CHANGE_EVENT, {
        bubbles: true,
        detail: { value: selectedValue },
      })
    )
  }

  function selectDate(date: string) {
    if (isDateDisabled(date, minimum(), maximum(), disabledDates())) return

    if (selectionMode() === 'single') {
      selectedValue = date
    } else if (!isRangeValue(selectedValue) || selectedValue.end) {
      selectedValue = { start: date }
    } else {
      selectedValue =
        date < selectedValue.start
          ? { start: date, end: selectedValue.start }
          : { start: selectedValue.start, end: date }
    }

    focusedDate = date
    previewDate = undefined
    if (date.slice(0, 7) !== visibleMonth) changeMonth(date.slice(0, 7), date)
    else render()
    dispatchValueChange()
  }

  function handleClick(event: MouseEvent) {
    const target = event.target
    if (!(target instanceof Element) || !belongsToRoot(target, root)) return

    const day = target.closest<HTMLButtonElement>(dayButtonSelector)
    if (day?.dataset.date) {
      selectDate(day.dataset.date)
      return
    }

    if (target.closest("[data-slot='calendar-previous']")) {
      const targetDate = addCalendarMonths(focusedDate, -1)
      changeMonth(targetDate.slice(0, 7), targetDate)
    } else if (target.closest("[data-slot='calendar-next']")) {
      const targetDate = addCalendarMonths(focusedDate, 1)
      changeMonth(targetDate.slice(0, 7), targetDate)
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    const target = event.target
    if (!(target instanceof Element)) return
    const button = target.closest<HTMLButtonElement>(dayButtonSelector)
    if (!button || !belongsToRoot(button, root) || !button.dataset.date) return

    const date = button.dataset.date
    const rtl = getComputedStyle(root).direction === 'rtl'
    const movement: Record<string, number> = {
      ArrowDown: 7,
      ArrowLeft: rtl ? 1 : -1,
      ArrowRight: rtl ? -1 : 1,
      ArrowUp: -7,
    }
    const dayMovement = movement[event.key]
    if (dayMovement !== undefined) {
      event.preventDefault()
      moveFocus(addCalendarDays(date, dayMovement), dayMovement < 0 ? -1 : 1)
      return
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      const start = normalizeWeekStartsOn(weekStartsOn(), locale())
      const offset = (dayOfWeek(date) - start + 7) % 7
      const amount = event.key === 'Home' ? -offset : 6 - offset
      moveFocus(addCalendarDays(date, amount), amount < 0 ? -1 : 1)
      return
    }

    if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault()
      const amount = event.key === 'PageUp' ? -1 : 1
      const nextDate = event.shiftKey
        ? addCalendarYears(date, amount)
        : addCalendarMonths(date, amount)
      moveFocus(nextDate, amount)
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectDate(date)
    }
  }

  function handlePointerOver(event: PointerEvent) {
    if (selectionMode() !== 'range') return
    const target = event.target
    if (!(target instanceof Element)) return
    const button = target.closest<HTMLButtonElement>(dayButtonSelector)
    if (
      !button ||
      !belongsToRoot(button, root) ||
      !button.dataset.date ||
      button.disabled
    )
      return
    previewDate = button.dataset.date
    updatePreview(dayButtons())
  }

  function handlePointerLeave() {
    if (!previewDate) return
    previewDate = undefined
    updatePreview(dayButtons())
  }

  root.addEventListener('click', handleClick)
  root.addEventListener('keydown', handleKeyDown)
  root.addEventListener('pointerover', handlePointerOver)
  root.addEventListener('pointerleave', handlePointerLeave)
  render()

  const controller: CalendarController = {
    destroy() {
      destroyed = true
      calendarControllers.delete(root)
      root.removeEventListener('click', handleClick)
      root.removeEventListener('keydown', handleKeyDown)
      root.removeEventListener('pointerover', handlePointerOver)
      root.removeEventListener('pointerleave', handlePointerLeave)
    },
    getMonth: () => visibleMonth,
    getValue: () => selectedValue,
    refresh() {
      if (destroyed) return
      const nextMode = selectionMode()
      selectedValue = normalizeCalendarValue(selectedValue, nextMode)
      render()
    },
    setMonth(month: string) {
      if (!destroyed) changeMonth(month, undefined, false)
    },
    setValue(value: CalendarValue) {
      if (destroyed) return
      selectedValue = normalizeCalendarValue(value, selectionMode())
      const selectedDate =
        typeof selectedValue === 'string' ? selectedValue : selectedValue?.start
      if (selectedDate) focusedDate = selectedDate
      render()
    },
  }
  calendarControllers.set(root, controller)
  return controller
}
