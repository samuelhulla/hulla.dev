export type RangeSliderController = {
  destroy: () => void
  refresh: () => void
}

const minimumSelector = "input[data-slot='range-slider-min']"
const maximumSelector = "input[data-slot='range-slider-max']"

function thumb(
  root: HTMLElement,
  selector: string
): HTMLInputElement | undefined {
  return Array.from(root.querySelectorAll<HTMLInputElement>(selector)).find(
    (candidate) =>
      candidate.closest<HTMLElement>("[data-slot='range-slider']") === root
  )
}

function finiteValue(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback
}

function bounds(input: HTMLInputElement): [number, number] {
  const minimum = finiteValue(Number(input.min), 0)
  const maximum = finiteValue(Number(input.max), 100)
  return minimum <= maximum ? [minimum, maximum] : [maximum, minimum]
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}

export function connectRangeSlider(root: HTMLElement): RangeSliderController {
  let destroyed = false

  function refresh(changedThumb?: HTMLInputElement) {
    const minimumThumb = thumb(root, minimumSelector)
    const maximumThumb = thumb(root, maximumSelector)
    if (!minimumThumb || !maximumThumb) return

    const [minimum, maximum] = bounds(minimumThumb)
    const span = maximum - minimum
    let start = clamp(
      finiteValue(minimumThumb.valueAsNumber, minimum),
      minimum,
      maximum
    )
    let end = clamp(
      finiteValue(maximumThumb.valueAsNumber, maximum),
      minimum,
      maximum
    )

    if (start > end) {
      if (changedThumb === minimumThumb) start = end
      else if (changedThumb === maximumThumb) end = start
      else [start, end] = [end, start]
    }

    minimumThumb.valueAsNumber = start
    maximumThumb.valueAsNumber = end
    minimumThumb.setAttribute('aria-valuemax', String(end))
    maximumThumb.setAttribute('aria-valuemin', String(start))

    const startPosition = span === 0 ? 0 : ((start - minimum) / span) * 100
    const endPosition = span === 0 ? 100 : ((end - minimum) / span) * 100
    root.style.setProperty('--range-slider-start', `${startPosition}%`)
    root.style.setProperty(
      '--range-slider-size',
      `${endPosition - startPosition}%`
    )
    root.dataset.value = `${start} ${end}`
  }

  function onInput(event: Event) {
    if (event.target instanceof HTMLInputElement) refresh(event.target)
  }

  const observer = new MutationObserver(() => {
    if (!destroyed) refresh()
  })

  root.addEventListener('input', onInput)
  observer.observe(root, {
    attributeFilter: ['disabled', 'max', 'min', 'step', 'value'],
    attributes: true,
    childList: true,
    subtree: true,
  })
  refresh()

  return {
    destroy() {
      destroyed = true
      observer.disconnect()
      root.removeEventListener('input', onInput)
    },
    refresh,
  }
}
